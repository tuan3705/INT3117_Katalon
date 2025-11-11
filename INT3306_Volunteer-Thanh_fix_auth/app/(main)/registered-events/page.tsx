// A protected page displaying all events a user has registered for.
// app/(main)/registered-events/page.tsx

import { RegisteredEventList } from '@/components/features/registered-event-list';

export default function RegisteredEventsPage() {
    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-8">Sự kiện đã đăng ký</h1>
            <RegisteredEventList />
        </div>
    );
}