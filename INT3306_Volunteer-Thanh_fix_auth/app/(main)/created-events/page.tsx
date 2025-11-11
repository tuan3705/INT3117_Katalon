// A protected page for event managers to see a list of events they created.
// app/(main)/created-events/page.tsx

import { CreatedEventList } from '@/components/features/created-event-list';

export default function MyCreatedEventsPage() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        Sự kiện đã tạo
                    </h1>
                    <p className="text-base-content/60 mt-2">Quản lý các sự kiện bạn đã tạo</p>
                </div>
            </div>

            <CreatedEventList />
        </div>
    );
}