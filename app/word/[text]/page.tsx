import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FamiliarityButton } from '@/app/components/FamiliarityButton';
import { LanGeekViewer } from '@/app/components/LanGeekViewer';

export default async function WordPage({ params }: { params: Promise<{ text: string }> }) {
    const { text } = await params;
    const decodedText = decodeURIComponent(text);

    const word = await prisma.word.findUnique({
        where: { text: decodedText },
        include: { roots: { include: { words: true } } }
    });

    if (!word) notFound();

    // Unique related words
    const relatedWordsMap = new Map();
    word.roots.forEach((root: any) => {
        root.words.forEach((w: any) => {
            if (w.id !== word.id) {
                relatedWordsMap.set(w.id, w);
            }
        });
    });
    const relatedWords = Array.from(relatedWordsMap.values()).slice(0, 15);

    return (
        <div className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col md:flex-row h-screen overflow-hidden">
            {/* Left Panel: Local Info */}
            <div className="md:w-1/3 border-r border-neutral-800 p-8 overflow-y-auto h-full bg-neutral-900 scrollbar-thin scrollbar-thumb-neutral-700">
                <Link href="/" className="text-teal-500 hover:underline mb-8 block font-medium">&larr; Back to Dashboard</Link>

                <h1 className="text-5xl font-bold mb-4 font-serif italic text-white">{word.text}</h1>

                <div className="mb-8 flex gap-2 items-center">
                    <FamiliarityButton wordId={word.id} initialStatus={word.familiarity} />
                    <span className="text-xs font-mono text-neutral-500 border border-neutral-800 px-2 py-0.5 rounded">
                        {word.level || 'N/A'}
                    </span>
                </div>

                <div className="prose prose-invert prose-sm mb-12">
                    <h3 className="text-neutral-500 uppercase tracking-widest text-xs font-bold mb-3 border-b border-neutral-800 pb-2">Etymology</h3>
                    <p className="text-lg leading-relaxed text-neutral-300 font-light">
                        {word.definition || 'No etymology available.'}
                    </p>
                </div>

                {word.roots.length > 0 && (
                    <div className="mb-12">
                        <h3 className="text-neutral-500 uppercase tracking-widest text-xs font-bold mb-4 border-b border-neutral-800 pb-2">Root Connection</h3>
                        <div className="flex flex-wrap gap-2">
                            {word.roots.map((r: any) => (
                                <Link key={r.id} href={`/search?q=${r.text}`} className="px-4 py-2 bg-teal-900/20 border border-teal-500/30 text-teal-300 rounded-lg hover:bg-teal-900/40 transition-colors group">
                                    <span className="font-mono">{r.text}</span>
                                    <span className="ml-2 text-teal-600 group-hover:text-teal-400 text-xs">↗</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Related Words via Roots */}
                {relatedWords.length > 0 && (
                    <div>
                        <h3 className="text-neutral-500 uppercase tracking-widest text-xs font-bold mb-4 border-b border-neutral-800 pb-2">Family Members</h3>
                        <div className="grid grid-cols-1 gap-2">
                            {relatedWords.map((w: any) => (
                                <Link key={w.id} href={`/word/${w.text}`} className="flex justify-between items-center group py-2 px-3 rounded hover:bg-neutral-800 transition-colors">
                                    <span className="text-neutral-400 group-hover:text-white transition-colors">{w.text}</span>
                                    <span className="text-xs text-neutral-600 bg-neutral-900 px-2 py-0.5 rounded">{w.familiarity === 'NEW' ? '' : w.familiarity}</span>
                                </Link>
                            ))
                            }
                        </div>
                    </div>
                )}
            </div>

            {/* Right Panel: LanGeek API Viewer */}
            <div className="md:w-2/3 h-full relative">
                <LanGeekViewer word={decodedText} />
            </div>
        </div>
    );
}
