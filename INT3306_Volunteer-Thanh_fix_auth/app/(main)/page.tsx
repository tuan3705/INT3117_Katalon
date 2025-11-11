// The main homepage, fetching and displaying a list of volunteer events with filtering.
// app/(main)/page.tsx

import prisma from '@/lib/prisma';
import { EventCard } from '@/components/features/event-card';
import { EventFilters } from '@/components/features/event-filters';
import { EventCategory, Prisma } from '@prisma/client';
import { Pagination } from '@/components/shared/pagination';

const ITEMS_PER_PAGE = 1;

type HomePageProps = {
    searchParams: Promise<{
        category?: string;
        sortBy?: string;
        page?: string;
    }>;
};
export default async function HomePage({ searchParams }: HomePageProps) {

    const resolvedSearchParams = await searchParams;
    const category = resolvedSearchParams.category;
    const sortBy = resolvedSearchParams.sortBy || 'startDateTime';
    const page = parseInt(resolvedSearchParams.page || '1', 10);

    // Dynamic query
    const where: Prisma.EventWhereInput = {
        startDateTime: { gte: new Date() },
        status: 'PUBLISHED',
        // ...: only use the category filter if it exists
        ...(category && { category: category as EventCategory }),
    };

    const orderBy: Prisma.EventOrderByWithRelationInput =
        sortBy === 'title' ? { title: 'asc' } : { startDateTime: 'asc' };

    // Get total count and paginated data in parallel
    const [totalEvents, events] = await Promise.all([
        prisma.event.count({ where }),
        prisma.event.findMany({
            where,
            include: { creator: true },
            orderBy,
            take: ITEMS_PER_PAGE,
            skip: (page - 1) * ITEMS_PER_PAGE,
        }),
    ]);

    const totalPages = Math.ceil(totalEvents / ITEMS_PER_PAGE);
    return (
        <div className="space-y-6">
            {/* Hero Section */}
            <div className="hero bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10 rounded-2xl border border-base-300">
                <div className="hero-content text-center py-12">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-content" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                Sự kiện tình nguyện
                            </span>
                        </h1>
                        <p className="text-lg text-base-content/70">
                            Tham gia các hoạt động tình nguyện để tạo ra sự khác biệt cho cộng đồng
                        </p>

                        {/* Stats */}
                        <div className="stats shadow-lg mt-8 bg-base-100 border border-base-300">
                            <div className="stat place-items-center">
                                <div className="stat-title">Sự kiện sắp tới</div>
                                <div className="stat-value text-primary">{events.length}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <EventFilters />

            {/* Events Grid */}
            {events.length === 0 ? (
                <div className="card bg-base-100 shadow-lg border border-base-300">
                    <div className="card-body items-center text-center py-16">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-base-200 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Không tìm thấy sự kiện</h3>
                        <p className="text-base-content/60 max-w-md">
                            Không có sự kiện nào phù hợp với bộ lọc của bạn. Thử thay đổi bộ lọc hoặc quay lại sau.
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((event) => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        < Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            baseUrl="/"
                        />
                    )}
                </>

            )}
        </div>
    );
}