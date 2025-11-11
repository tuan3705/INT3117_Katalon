// Reusable pagination component
// components/shared/pagination.tsx

'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type PaginationProps = {
    currentPage: number;
    totalPages: number;
    baseUrl: string;
};

export const Pagination = ({ currentPage, totalPages, baseUrl }: PaginationProps) => {
    const searchParams = useSearchParams();

    // Helper to build URL with current filters
    const buildUrl = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', page.toString());
        return `${baseUrl}?${params.toString()}`;
    };

    // Generate page numbers to show
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5; // Max page buttons to show

        if (totalPages <= maxVisible) {
            // Show all pages if total is small
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            if (currentPage > 3) {
                pages.push('...');
            }

            // Show pages around current page
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < totalPages - 2) {
                pages.push('...');
            }

            // Always show last page
            pages.push(totalPages);
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="flex justify-center">
            <div className="join">
                {/* Previous Button */}
                <Link
                    href={currentPage > 1 ? buildUrl(currentPage - 1) : '#'}
                    className={`join-item btn btn-sm ${currentPage <= 1 ? 'btn-disabled' : ''}`}
                    aria-disabled={currentPage <= 1}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Trước
                </Link>

                {/* Page Numbers */}
                {pageNumbers.map((page, index) => {
                    if (page === '...') {
                        return (
                            <button key={`ellipsis-${index}`} className="join-item btn btn-sm btn-disabled">
                                ...
                            </button>
                        );
                    }

                    const pageNum = page as number;
                    const isActive = pageNum === currentPage;

                    return (
                        <Link
                            key={pageNum}
                            href={buildUrl(pageNum)}
                            className={`join-item btn btn-sm ${isActive ? 'btn-active' : ''}`}
                        >
                            {pageNum}
                        </Link>
                    );
                })}

                {/* Next Button */}
                <Link
                    href={currentPage < totalPages ? buildUrl(currentPage + 1) : '#'}
                    className={`join-item btn btn-sm ${currentPage >= totalPages ? 'btn-disabled' : ''}`}
                    aria-disabled={currentPage >= totalPages}
                >
                    Sau
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>
        </div>
    );
};