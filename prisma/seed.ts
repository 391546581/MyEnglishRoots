import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    const dataPath = path.join(__dirname, '../data/etymonline.json');

    if (!fs.existsSync(dataPath)) {
        console.error('Data file not found:', dataPath);
        return;
    }

    console.log('Reading data...');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const items = JSON.parse(rawData);

    console.log(`Loaded ${items.length} items from JSON.`);

    const wordToRoots = new Map<string, Set<string>>();
    const wordToRefs = new Map<string, string[]>();

    // Regex to calculate Roots from etymology text
    // Captures "ped-" from "PIE root *ped-"
    const rootRegex = /PIE root \*([a-z-]+)/g;

    // Pass 1: Identify Roots directly mentioned
    let directHits = 0;
    for (const item of items) {
        const word = item.word;
        wordToRefs.set(word, item.crossreferences || []);

        if (item.etymology) {
            let match;
            // Reset regex index
            rootRegex.lastIndex = 0;
            while ((match = rootRegex.exec(item.etymology)) !== null) {
                const root = match[1];
                if (!wordToRoots.has(word)) wordToRoots.set(word, new Set());
                wordToRoots.get(word)!.add(root);
                directHits++;
            }
        }
    }

    console.log(`Pass 1: Found ${directHits} direct root mentions across ${wordToRoots.size} words.`);

    // Pass 2: Propagate Roots to children (1 level deep)
    let propagatedCount = 0;
    for (const item of items) {
        const word = item.word;
        // If word already has roots, skip (or maybe merge? let's stick to direct first)
        if (wordToRoots.has(word)) continue;

        const refs = wordToRefs.get(word);
        if (refs) {
            for (const ref of refs) {
                if (wordToRoots.has(ref)) {
                    const parentRoots = wordToRoots.get(ref)!;
                    if (!wordToRoots.has(word)) wordToRoots.set(word, new Set());

                    for (const r of parentRoots) {
                        wordToRoots.get(word)!.add(r);
                    }
                    propagatedCount++;
                    // For now, inherit from all refs.
                }
            }
        }
    }

    console.log(`Pass 2: Propagated roots to ${propagatedCount} additional words.`);

    // Prepare Roots for DB
    const allRoots = new Set<string>();
    for (const roots of wordToRoots.values()) {
        for (const r of roots) allRoots.add(r);
    }
    console.log(`Total unique roots to insert: ${allRoots.size} `);

    // Transaction optimization: Insert Roots first
    let rootPromises: any[] = [];
    for (const r of allRoots) {
        rootPromises.push(prisma.root.upsert({
            where: { text: r },
            update: {},
            create: { text: r, meaning: 'PIE Root' }
        }));
    }
    // Execute in chunks
    await batchRun(rootPromises, 50);
    console.log('Roots inserted.');

    // Insert Words (Only those in wordToRoots to save time? 
    // User asked for "Root Search". If a word has no root, it wont appear in search results?
    // But maybe user wants to search "impede" (User said "Basic word search").
    // So we should insert ALL words. 

    // To avoid minutes of wait, I'll only insert words that have roots OR appear in the first 5000 items (common words usually).
    // Or better, just insert ALL but filter the "connect" step.
    // Actually, filtering to "Words with known roots" is a good start for a "Root Dictionary".
    // But wait, "impede" gained a root in Pass 2. So it will be included.
    // "apple" ? Probably no root found by this regex.
    // I'll insert ALL words that have roots.

    // Insert ALL Words
    // Use a transaction or batch to speed up?
    // We already use upsert.

    console.log(`Inserting all ${items.length} words...`);

    let i = 0;
    for (const item of items) {
        const wordText = item.word;
        const definitions = item.etymology || '';
        const roots = wordToRoots.get(wordText);

        // Create Word
        const w = await prisma.word.upsert({
            where: { text: wordText },
            update: {},
            create: {
                text: wordText,
                definition: definitions.substring(0, 500),
            }
        });

        // Connect Roots if they exist
        if (roots) {
            for (const r of roots) {
                const rootRec = await prisma.root.findUnique({ where: { text: r } });
                if (rootRec) {
                    await prisma.word.update({
                        where: { id: w.id },
                        data: {
                            roots: { connect: { id: rootRec.id } }
                        }
                    });
                }
            }
        }

        i++;
        if (i % 1000 === 0) console.log(`Processed ${i}/${items.length}...`);
    }

    console.log('Seeding finished.');
}

async function batchRun(promises: Promise<any>[], batchSize: number) {
    for (let i = 0; i < promises.length; i += batchSize) {
        await Promise.all(promises.slice(i, i + batchSize));
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
