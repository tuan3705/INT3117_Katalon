// A client component that fetches and displays the list of registered events for a volunteer.
// components/features/registered-event-list.tsx

'use client';

import useSWR from 'swr';
import axios from 'axios';
import { EventCard } from './event-card';
import { Event, User, Registration } from '@prisma/client';

type RegisteredEvent = Registration & { event: Event & { creator: User } };
const fetcher = (url: string) => axios.get(url).then(res => res.data);

export const RegisteredEventList = () => {
    const { data: registrations, isLoading, error } = useSWR<RegisteredEvent[]>('/api/registrations', fetcher, {
        refreshInterval: 5000
    }
    );

    if (isLoading) return <p>Đang tải danh sách sự kiện...</p>;
    if (error) return <p>Không thể tải danh sách sự kiện.</p>;
    if (!registrations || registrations.length === 0) {
        return <p className="text-gray-500">Bạn chưa đăng ký sự kiện nào.</p>;
    }

    const upcomingRegistrations = registrations.filter(reg => new Date(reg.event.endDateTime) >= new Date());
    const pastRegistrations = registrations.filter(reg => new Date(reg.event.endDateTime) < new Date());

    return (
        <div className="space-y-12">
            {/* Upcoming*/}
            <section>
                <h2 className="text-2xl font-semibold mb-6 border-b pb-2">Sự kiện sắp tới</h2>
                {upcomingRegistrations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {upcomingRegistrations.map(reg => (
                            <EventCard key={reg.id} event={reg.event} registrationStatus={reg.status} />
                        ))}
                    </div>
                ) : <p className="text-gray-500">Bạn không có sự kiện nào sắp tới.</p>}
            </section>

            {/* Pass */}
            <section>
                <h2 className="text-2xl font-semibold mb-6 border-b pb-2">Sự kiện đã qua</h2>
                {pastRegistrations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {pastRegistrations.map(reg => (
                            <EventCard key={reg.id} event={reg.event} registrationStatus={reg.status} />
                        ))}
                    </div>
                ) : <p className="text-gray-500">Chưa có sự kiện nào trong quá khứ.</p>}
            </section>
        </div>
    );
};