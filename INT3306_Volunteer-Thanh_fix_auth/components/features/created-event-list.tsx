// A client component that fetches and displays the list of created events for a manager
// using SWR for data fetching and caching.
// components/features/created-event-list.tsx

'use client';

import useSWR from 'swr';
import axios from 'axios';
import { EventCard } from './event-card';
import { Event, User } from '@prisma/client';

type CreatedEvent = Event & { creator: User };
const fetcher = (url: string) => axios.get(url).then(res => res.data);

export const CreatedEventList = () => {
    const { data: createdEvents, isLoading, error } = useSWR<CreatedEvent[]>('/api/created-events', fetcher);

    if (isLoading) return <p>Đang tải danh sách sự kiện...</p>;
    if (error) return <p>Không thể tải danh sách sự kiện.</p>;
    if (!createdEvents || createdEvents.length === 0) {
        return <p className="text-gray-500">Bạn chưa tạo sự kiện nào.</p>;
    }

    const upcomingEvents = createdEvents.filter(event => new Date(event.endDateTime) >= new Date());
    const pastEvents = createdEvents.filter(event => new Date(event.endDateTime) < new Date());

    return (
        <div className="space-y-12">
            {/* Upcoming*/}
            <section>
                <h2 className="text-2xl font-semibold mb-6 border-b pb-2">Sự kiện sắp diễn ra</h2>
                {upcomingEvents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {upcomingEvents.map(event => (
                            <EventCard key={event.id} event={event} showStatus={true} />
                        ))}
                    </div>
                ) : <p className="text-gray-500">Bạn không có sự kiện nào sắp diễn ra.</p>}
            </section>

            {/* Pass*/}
            <section>
                <h2 className="text-2xl font-semibold mb-6 border-b pb-2">Sự kiện đã kết thúc</h2>
                {pastEvents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {pastEvents.map(event => (
                            <EventCard key={event.id} event={event} showStatus={true} />
                        ))}
                    </div>
                ) : <p className="text-gray-500">Chưa có sự kiện nào đã kết thúc.</p>}
            </section>
        </div>
    );
};