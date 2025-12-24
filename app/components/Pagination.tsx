'use client';

import Link from 'next/link';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    query: string;
    levelFilter: string;
}

export function Pagination({ currentPage, totalPages, query, levelFilter }: PaginationProps) {
    if (totalPages <= 1) return null;

    // Generate page numbers to show
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages;
    };

    const pages = getPageNumbers();
    const baseUrl = `/search?q=${encodeURIComponent(query)}&level=${levelFilter}`;

    return (
        <div className="flex flex-wrap justify-center items-center gap-2 my-6">
            {/* First Page */}
            {currentPage > 3 && (
                <>
                    <Link
                        href={`${baseUrl}&page=1`}
                        className="w-10 h-10 flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors text-sm"
                    >
                        1
                    </Link>
                    {currentPage > 4 && <span className="text-neutral-600">...</span>}
                </>
            )}

            {/* Previous */}
            {currentPage > 1 && (
                <Link
                    href={`${baseUrl}&page=${currentPage - 1}`}
                    className="px-3 h-10 flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors text-sm font-medium"
                >
                    &larr; Prev
                </Link>
            )}

            {/* Page Numbers */}
            {pages.map((p) => (
                <Link
                    key={p}
                    href={`${baseUrl}&page=${p}`}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors text-sm font-bold ${currentPage === p
                            ? 'bg-teal-600 text-white'
                            : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                        }`}
                >
                    {p}
                </Link>
            ))}

            {/* Next */}
            {currentPage < totalPages && (
                <Link
                    href={`${baseUrl}&page=${currentPage + 1}`}
                    className="px-3 h-10 flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors text-sm font-medium"
                >
                    Next &rarr;
                </Link>
            )}

            {/* Last Page */}
            {currentPage < totalPages - 2 && (
                <>
                    {currentPage < totalPages - 3 && <span className="text-neutral-600">...</span>}
                    <Link
                        href={`${baseUrl}&page=${totalPages}`}
                        className="w-10 h-10 flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors text-sm"
                    >
                        {totalPages}
                    </Link>
                </>
            )}
        </div>
    );
}
