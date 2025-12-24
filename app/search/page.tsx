import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { WordResultRow } from '@/app/components/WordResultRow';
import { Pagination } from '@/app/components/Pagination';

export default async function SearchPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedParams = await searchParams;
    const query = typeof resolvedParams.q === 'string' ? resolvedParams.q : '';
    const page = typeof resolvedParams.page === 'string' ? parseInt(resolvedParams.page) : 1;
    const levelFilter = typeof resolvedParams.level === 'string' ? resolvedParams.level : 'all';
    const pageSize = 50;
    const skip = (page - 1) * pageSize;

    if (!query) return <div className="p-8 text-neutral-100">Enter a query</div>;

    // Build where clause with level filter
    const whereClause: any = { text: { contains: query } };

    // Note: Since we don't have actual level data yet, this is prepared for future use
    // You would need to populate the 'level' field in your database with actual values
    if (levelFilter !== 'all') {
        whereClause.level = levelFilter;
    }

    // Search logic with counts
    const [roots, totalWords, words] = await Promise.all([
        prisma.root.findMany({
            where: { text: { contains: query } },
            include: { words: true }
        }),
        prisma.word.count({
            where: whereClause
        }),
        prisma.word.findMany({
            where: whereClause,
            include: { roots: true },
            skip,
            take: pageSize,
            orderBy: { text: 'asc' }
        })
    ]);

    const statusWeight: { [key: string]: number } = { 'NEW': 1, 'LEARNING': 2, 'MASTERED': 3 };
    words.sort((a: any, b: any) => statusWeight[a.familiarity] - statusWeight[b.familiarity]);

    const totalPages = Math.ceil(totalWords / pageSize);

    return (
        <div className="min-h-screen bg-neutral-900 text-neutral-100 p-8">
            <div className="max-w-4xl mx-auto">
                <Link href="/" className="text-teal-500 hover:underline mb-8 block font-medium">← Back to Dashboard</Link>

                <div className="flex justify-between items-start mb-8">
                    <h1 className="text-3xl font-bold">
                        {`Results for "${query}"`}
                    </h1>

                    {/* Level Filter */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-neutral-400">Filter:</span>
                        <div className="flex gap-2">
                            {['all', 'IELTS', 'SAT', 'GRE', 'TOEFL'].map(level => (
                                <Link
                                    key={level}
                                    href={`/search?q=${encodeURIComponent(query)}&level=${level}`}
                                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${levelFilter === level
                                        ? 'bg-teal-600 text-white'
                                        : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                                        }`}
                                >
                                    {level === 'all' ? 'All' : level}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Root Results */}
                {roots.length > 0 && (
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold mb-6 text-teal-400 flex items-center gap-2">
                            <span>◆</span> Matching Roots
                        </h2>
                        {roots.map((root: any) => (
                            <div key={root.id} className="mb-8 bg-neutral-800 p-6 rounded-xl border border-neutral-700/50 shadow-lg">
                                <div className="flex justify-between items-baseline mb-4">
                                    <h3 className="text-3xl font-bold font-serif italic text-white">{root.text}</h3>
                                    <span className="bg-teal-900/50 text-teal-300 px-3 py-1 rounded-full text-sm font-mono">{root.meaning || 'PIE Root'}</span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {root.words.map((w: any) => (
                                        <Link key={w.id} href={`/word/${w.text}`} className="block p-2 bg-neutral-900/50 rounded border border-neutral-800 hover:border-teal-500 hover:bg-neutral-800 transition-all group">
                                            <div className="font-semibold text-sm text-neutral-300 group-hover:text-teal-400 truncate">{w.text}</div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </section>
                )}

                {/* Word Results */}
                {words.length > 0 && (
                    <section>
                        <div className="flex justify-between items-baseline mb-4">
                            <h2 className="text-2xl font-semibold text-blue-400">Matching Words</h2>
                            <span className="text-sm text-neutral-500">
                                {`Showing ${skip + 1}-${Math.min(skip + pageSize, totalWords)} of ${totalWords} results`}
                            </span>
                        </div>

                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            query={query}
                            levelFilter={levelFilter}
                        />

                        <div className="flex flex-col gap-1">
                            {words.map((w: any) => (
                                <WordResultRow key={w.id} word={w} />
                            ))}
                        </div>

                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            query={query}
                            levelFilter={levelFilter}
                        />
                    </section>
                )}

                {roots.length === 0 && words.length === 0 && (
                    <div className="text-center py-20 text-neutral-500">
                        <p className="text-xl">No roots or words found matching "{query}"</p>
                        <p className="mt-2">Try searching for a simpler root like "ped" or "spect".</p>
                    </div>
                )}
            </div>
        </div>
    );
}
