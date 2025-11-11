// A protected page for editing an existing event.
// app/(main)/events/[eventId]/edit/page.tsx

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect, notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { EditEventForm } from '@/components/features/edit-event-form';

type EditEventPageProps = {
    params: Promise<{
        eventId: string;
    }>;
};

export default async function EditEventPage({ params }: EditEventPageProps) {
    const session = await getServerSession(authOptions);
    const { eventId } = await params;

    const event = await prisma.event.findUnique({
        where: { id: eventId },
    });

    if (!event) {
        notFound();
    }

    // Only for this manager and admin
    if (!session || (event.creatorId !== session.user.id && session.user.role !== 'ADMIN')) {
        redirect(`/events/${eventId}`);
    }

    return (
        <div className="max-w-2xl mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-8">Chỉnh sửa sự kiện</h1>
            <div className="bg-white p-8 rounded-lg shadow-md">
                <EditEventForm event={event} />
            </div>
        </div>
    );
}