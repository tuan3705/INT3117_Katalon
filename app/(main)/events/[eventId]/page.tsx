// Renders the detailed page for a single event, fetched by its ID.
// app/(main)/events/[eventId]/page.tsx

import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { RegisterEventButton } from '@/components/features/register-event-button';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { EventWall } from "@/components/features/event-wall";
import { EventManagementButtons } from "@/components/features/event-management-buttons";

type EventDetailPageProps = {
    params: Promise<{
        eventId: string;
    }>;
};

export default async function EventDetailPage({ params }: EventDetailPageProps) {
    const { eventId } = await params;

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const userRole = session?.user?.role;

    // Use Promise.all for better performance
    const [event, registration] = await Promise.all([
        prisma.event.findUnique({
            where: { id: eventId },
            include: { creator: true },
        }),
        userId ? prisma.registration.findUnique({
            where: { userId_eventId: { userId, eventId: eventId } },
        }) : null,
    ]);


    if (!event) {
        notFound();
    }
    // volunteer cannot access unpublished detail event
    if (event.status !== 'PUBLISHED' && userRole !== 'ADMIN' && userId !== event.creatorId) {
        notFound();
    }

    const isRegistered = !!registration;
    const isEventEnded = new Date(event.endDateTime) < new Date();
    const canManage = (userId === event.creatorId || userRole === 'ADMIN');

    // Helper for formatting date
    const formatDateTime = (date: Date) => {
        return new Date(date).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Header with name and creator */}
                <div className="bg-indigo-600 p-8 text-white">
                    <p className="text-lg font-semibold">{event.creator.name}</p>
                    <h1 className="text-4xl font-bold mt-2">{event.title}</h1>
                </div>

                {/* Body with description*/}
                <div className="p-8 space-y-6 text-gray-800">
                    <div>
                        <h2 className="text-2xl font-semibold mb-2">Thông tin chi tiết</h2>
                        <p className="text-lg leading-relaxed">{event.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
                        <div>
                            <h3 className="text-lg font-bold mb-2">Thời gian</h3>
                            <p>Bắt đầu: {formatDateTime(event.startDateTime)}</p>
                            <p>Kết thúc: {formatDateTime(event.endDateTime)}</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold mb-2">Địa điểm & Số lượng</h3>
                            <p>Tại: {event.location}</p>
                            <p>Số lượng tối đa: {event.maxAttendees} người</p>
                        </div>
                    </div>

                    {/* Registry buttion*/}
                    <div className="border-t pt-6 text-center">
                        {canManage ? (
                            <EventManagementButtons event={event} />
                        ) : (
                            <RegisterEventButton eventId={event.id} isInitiallyRegistered={isRegistered} isEventEnded={isEventEnded} />
                        )}
                    </div>
                </div>
            </div>

            <EventWall eventId={event.id} isRegistered={isRegistered} />
        </div>
    );
}