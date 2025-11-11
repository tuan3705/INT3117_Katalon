// A client component that provides UI for filtering and sorting events.
// Not directly fecth the data from using db, just update the URL for parent component to fetch data accordingly.
// component/features/events-filters.tsx

'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export const EventFilters = () => {
    const router = useRouter();
    const pathname = usePathname(); // get the current URL
    const searchParams = useSearchParams(); // get params in the URL (query string)

    const handleFilterChange = (
        e: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        const currentParams = new URLSearchParams(Array.from(searchParams.entries()));

        if (value) {
            currentParams.set(name, value);
        } else {
            currentParams.delete(name); // Delete filter if user choose "Tất cả"
        }

        // Update the URL
        router.push(`${pathname}?${currentParams.toString()}`);
    };

    const handleClearFilters = () => {
        router.push(pathname);
    };

    const hasActiveFilters = searchParams.get('category') || searchParams.get('sortBy');

    return (
        <div className="card bg-base-100 shadow-lg mb-8 border border-base-300">
            <div className="card-body">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Category Filter */}
                    <div className="form-control flex-1">
                        <label className="label">
                            <span className="label-text font-semibold flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                Danh mục
                            </span>
                        </label>
                        <select
                            id="category"
                            name="category"
                            onChange={handleFilterChange}
                            value={searchParams.get('category') || ''}
                            className="select select-bordered w-full pl-3"
                        >
                            <option value="">Tất cả danh mục</option>
                            <option value="ENVIRONMENT">🌱 Môi trường</option>
                            <option value="EDUCATION">📚 Giáo dục</option>
                            <option value="HEALTHCARE">⚕️ Y tế - Sức khỏe</option>
                            <option value="COMMUNITY">🤝 Cộng đồng</option>
                        </select>
                    </div>

                    {/* Sort Filter */}
                    <div className="form-control flex-1">
                        <label className="label">
                            <span className="label-text font-semibold flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                                </svg>
                                Sắp xếp theo
                            </span>
                        </label>
                        <select
                            id="sortBy"
                            name="sortBy"
                            onChange={handleFilterChange}
                            value={searchParams.get('sortBy') || 'startDateTime'}
                            className="select select-bordered w-full pl-3"
                        >
                            <option value="startDateTime">📅 Ngày bắt đầu</option>
                            <option value="title">🔤 Tên (A-Z)</option>
                        </select>
                    </div>

                    {/* Clear Filters Button */}
                    {hasActiveFilters && (
                        <div className="form-control flex-none md:self-end">
                            <label className="label md:hidden">
                                <span className="label-text opacity-0">.</span>
                            </label>
                            <button
                                onClick={handleClearFilters}
                                className="btn btn-ghost btn-outline gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Xóa bộ lọc
                            </button>
                        </div>
                    )}
                </div>

                {/* Active Filters Display */}
                {hasActiveFilters && (
                    <div className="flex flex-wrap gap-2 mt-4">
                        <span className="text-sm text-base-content/60">Bộ lọc đang áp dụng:</span>
                        {searchParams.get('category') && (
                            <div className="badge badge-primary gap-2">
                                {searchParams.get('category') === 'ENVIRONMENT' && '🌱 Môi trường'}
                                {searchParams.get('category') === 'EDUCATION' && '📚 Giáo dục'}
                                {searchParams.get('category') === 'HEALTHCARE' && '⚕️ Y tế'}
                                {searchParams.get('category') === 'COMMUNITY' && '🤝 Cộng đồng'}
                            </div>
                        )}
                        {searchParams.get('sortBy') && searchParams.get('sortBy') !== 'startDateTime' && (
                            <div className="badge badge-secondary gap-2">
                                Sắp xếp: {searchParams.get('sortBy') === 'title' ? 'Tên (A-Z)' : 'Ngày'}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};