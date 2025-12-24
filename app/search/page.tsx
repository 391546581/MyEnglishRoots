import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { WordResultRow } from '@/app/components/WordResultRow';
import { Pagination } from '@/app/components/Pagination';
import SearchBar from '@/app/components/SearchBar';

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
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header with Search */}
                <div>
                    <Link href="/" className="text-teal-500 hover:underline mb-8 block font-medium">← Back to Dashboard</Link>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <h1 className="text-3xl font-bold">
                            {`Results for "${query}"`}
                        </h1>
                        <SearchBar defaultValue={query} className="w-full md:max-w-md" />
                    </div>
                </div>

                {/* Level Filter */}
                <div className="flex items-center gap-3 bg-neutral-800/50 p-3 rounded-xl border border-neutral-800">
                    <span className="text-sm font-medium text-neutral-400">Level:</span>
                    <div className="flex flex-wrap gap-2">
                        {['all', 'IELTS', 'SAT', 'GRE', 'TOEFL'].map(level => (
                            <Link
                                key={level}
                                href={`/search?q=${encodeURIComponent(query)}&level=${level}`}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${levelFilter === level
                                    ? 'bg-teal-600 text-white scale-105'
                                    : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200'
                                    }`}
                            >
                                {level === 'all' ? 'All' : level}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Root Results */}
                {roots.length > 0 && (
                    <section>
                        <h2 className="text-xl font-bold mb-4 text-teal-400 flex items-center gap-2">
                            Matching Roots
                        </h2>
                        <div className="space-y-4">
                            {roots.map((root: any) => (
                                <div key={root.id} className="bg-neutral-800/80 p-6 rounded-2xl border border-neutral-700/50 shadow-xl backdrop-blur-sm">
                                    <div className="flex justify-between items-baseline mb-4">
                                        <h3 className="text-3xl font-bold font-serif italic text-white tracking-tight">{root.text}</h3>
                                        <span className="bg-teal-900/40 text-teal-300 px-3 py-1 rounded-lg text-sm font-medium border border-teal-800/50">{root.meaning || 'PIE Root'}</span>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                        {root.words.map((w: any) => (
                                            <Link key={w.id} href={`/word/${w.text}`} className="block p-2 text-center bg-neutral-900/60 rounded-lg border border-neutral-800 hover:border-teal-500 hover:bg-neutral-800 transition-all group">
                                                <div className="font-medium text-sm text-neutral-400 group-hover:text-teal-400 truncate">{w.text}</div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Word Results */}
                {words.length > 0 && (
                    <section className="space-y-6">
                        <div className="flex justify-between items-center border-b border-neutral-800 pb-4">
                            <h2 className="text-2xl font-bold text-blue-400">Words</h2>
                            <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest">
                                {`${skip + 1}-${Math.min(skip + pageSize, totalWords)} / ${totalWords} total`}
                            </span>
                        </div>

                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            query={query}
                            levelFilter={levelFilter}
                        />

                        <div className="grid gap-1">
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
                    <div className="text-center py-24 bg-neutral-800/30 rounded-3xl border border-dashed border-neutral-700">
                        <div className="text-5xl mb-4 opacity-20">🔍</div>
                        <p className="text-xl text-neutral-300 font-medium">No results found for "{query}"</p>
                        <p className="mt-2 text-neutral-500">Try checking your spelling or using a different root.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
