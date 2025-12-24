import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { FamiliarityButton } from '@/app/components/FamiliarityButton';

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
                <Link href="/" className="text-teal-500 hover:underline mb-8 block font-medium">&larr; Back to Dashboard</Link>

                <div className="flex justify-between items-start mb-8">
                    <h1 className="text-3xl font-bold">Results for <span className="text-teal-400">"{query}"</span></h1>

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
                                Showing {skip + 1}-{Math.min(skip + pageSize, totalWords)} of {totalWords} results
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            {words.map((w: any) => (
                                <div key={w.id} className="flex items-center gap-4 p-3 bg-neutral-800/40 hover:bg-neutral-800 rounded-lg border border-transparent hover:border-neutral-700 group transition-all">

                                    {/* Word & Link */}
                                    <Link href={`/word/${w.text}`} className="flex-1 min-w-0 flex items-baseline gap-3">
                                        <span className="font-bold text-lg text-neutral-100 group-hover:text-blue-400">{w.text}</span>
                                        <span className="text-xs text-neutral-500 font-mono border border-neutral-700 px-1 rounded">{w.level || 'N/A'}</span>
                                        <span className="text-neutral-500 text-sm line-clamp-1 flex-1">{w.definition || 'No definition available'}</span>
                                    </Link>

                                    {/* Metadata & Actions */}
                                    <div className="flex items-center gap-4">
                                        {/* Roots Tags */}
                                        <div className="hidden sm:flex gap-1">
                                            {w.roots.map((r: any) => (
                                                <Link key={r.id} href={`/search?q=${r.text}`} className="text-[10px] px-1.5 py-0.5 bg-neutral-900 text-teal-500/70 border border-neutral-800 rounded hover:text-teal-400">
                                                    {r.text}
                                                </Link>
                                            ))}
                                        </div>

                                        {/* Status Button */}
                                        <div className="shrink-0">
                                            <FamiliarityButton wordId={w.id} initialStatus={w.familiarity} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-8">
                                {page > 1 && (
                                    <Link
                                        href={`/search?q=${encodeURIComponent(query)}&page=${page - 1}`}
                                        className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
                                    >
                                        Previous
                                    </Link>
                                )}

                                <span className="px-4 py-2 text-neutral-400">
                                    Page {page} of {totalPages}
                                </span>

                                {page < totalPages && (
                                    <Link
                                        href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`}
                                        className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
                                    >
                                        Next
                                    </Link>
                                )}
                            </div>
                        )}
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
