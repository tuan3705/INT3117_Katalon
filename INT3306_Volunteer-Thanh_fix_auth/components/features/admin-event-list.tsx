// A client component that fetches and displays the list of pending events for admins.
// components/features/admin-event-list.tsx

'use client';

import useSWR from 'swr';
import axios from 'axios';
import { EventCard } from './event-card';
import { AdminEventActions } from './admin-event-actions';
import { Event, User } from '@prisma/client';

type PendingEvent = Event & { creator: User };
const fetcher = (url: string) => axios.get(url).then(res => res.data);

export const AdminEventList = () => {
    const { data: pendingEvents, isLoading, error } = useSWR<PendingEvent[]>('/api/admin/pending-events', fetcher, {
        refreshInterval: 30000, // ask sv after each 30s
    });

    if (isLoading) return <p>Đang tải danh sách sự kiện...</p>;
    if (error) return <p>Không thể tải danh sách sự kiện.</p>;
    if (!pendingEvents || pendingEvents.length === 0) {
        return <p className="text-center py-8 text-gray-500">Không có sự kiện nào đang chờ duyệt.</p>;
    }

    return (
        <div className="space-y-6">
            {pendingEvents.map(event => (
                <div key={event.id} className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 border rounded-lg bg-gray-50">
                    <div className="flex-grow w-full">
                        <EventCard event={event} />
                    </div>
                    <div className="flex-shrink-0 w-full md:w-auto">
                        <AdminEventActions eventId={event.id} />
                    </div>
                </div>
            ))}
        </div>
    );
};