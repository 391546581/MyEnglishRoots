import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import SearchBar from '@/app/components/SearchBar';

async function refreshRoots() {
  'use server';
  revalidatePath('/');
}

export default async function Home() {
  // SQLite random ordering
  // Note: queryRaw returns unknown[], we need to cast or map.
  // We can just fetch a random selection using raw query.
  const topRootsRaw = await prisma.$queryRaw<Array<{ id: number, text: string, meaning: string | null, wordCount: bigint }>>`
    SELECT r.id, r.text, r.meaning, COUNT(w.id) as wordCount 
    FROM Root r
    LEFT JOIN _RootToWord rw ON r.id = rw.A
    LEFT JOIN Word w ON rw.B = w.id
    GROUP BY r.id
    HAVING wordCount > 0
    ORDER BY RANDOM() 
    LIMIT 12
  `;

  // Convert bigint to number for serialization
  const topRoots = topRootsRaw.map((root: { id: number, text: string, meaning: string | null, wordCount: bigint }) => ({
    ...root,
    wordCount: Number(root.wordCount)
  }));

  return (
    <main className="min-h-screen bg-neutral-900 text-neutral-100 p-8">
      <div className="max-w-4xl mx-auto space-y-12">

        {/* Header */}
        <div className="text-center space-y-4 pt-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
            RootFlow
          </h1>
          <p className="text-neutral-400 text-lg">
            Master English through Etymology
          </p>
        </div>

        {/* Search */}
        <div className="max-w-xl mx-auto">
          <SearchBar />
        </div>

        {/* Dashboard / Recommended Roots */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <span className="text-teal-400">◆</span> Recommended Roots
            </h2>
            <form action={refreshRoots}>
              <button type="submit" className="text-sm text-teal-500 hover:text-teal-400 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 16h5v5" /></svg>
                Shuffle
              </button>
            </form>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {topRoots.map((root: { id: number; text: string; meaning: string | null; wordCount: bigint }) => (
              <Link
                key={root.id}
                href={`/search?q=${root.text}`}
                className="group p-5 bg-neutral-800/50 rounded-xl border border-neutral-700/50 hover:bg-neutral-800 hover:border-teal-500/50 transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-neutral-200 group-hover:text-teal-400">
                    {root.text}
                  </h3>
                  <span className="text-xs font-mono text-neutral-500 bg-neutral-900 px-2 py-1 rounded">
                    {Number(root.wordCount)} words
                  </span>
                </div>
                <p className="text-sm text-neutral-500 line-clamp-2">
                  {root.meaning || 'PIE Root'}
                </p>
                {/* Progress bar placeholder */}
                <div className="mt-4 h-1.5 w-full bg-neutral-700 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 w-0 group-hover:w-1/4 transition-all duration-500" />
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
