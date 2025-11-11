// A protected page for event managers to see the list of registered volunteers.
// app/(main)/events/[eventId]/manage/page.tsx

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect, notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ParticipantList } from '@/components/features/participant-list';

type ManageEventPageProps = {
    params: Promise<{
        eventId: string;
    }>;
};

export default async function ManageEventPage({ params }: ManageEventPageProps) {
    const session = await getServerSession(authOptions);
    const { eventId } = await params;

    const event = await prisma.event.findUnique({ where: { id: eventId } });

    if (!event) { notFound(); }
    if (!session || (event.creatorId !== session.user.id && session.user.role !== 'ADMIN')) {
        redirect(`/events/${eventId}`);
    }

    return (
        <div className="max-w-6xl mx-auto p-4 md-p-8">
            <Link href={`/events/${eventId}`} className="text-indigo-600 hover:underline">
                &larr; Quay lại trang sự kiện
            </Link>
            <h1 className="text-3xl font-bold mt-4">Quản lý sự kiện</h1>
            <p className="text-xl text-gray-700 mb-8">{event.title}</p>

            <div className="bg-white p-8 rounded-lg shadow-md">
                <ParticipantList eventId={eventId} />
            </div>
        </div>
    );
}
