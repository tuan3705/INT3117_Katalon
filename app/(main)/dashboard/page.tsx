// A protected dashboard page for volunteers to see a summary of relevant events.
// app/(main)/dashboard/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Event, User } from "@prisma/client";

// Small component to show event in the dashboard
const DashboardEventItem = ({ event }: { event: Event & { creator: User } }) => (
    <Link href={`/events/${event.id}`}>
        <div className="p-4 border rounded-md hover:bg-gray-50 transition-colors">
            <p className="font-bold text-indigo-700">{event.title}</p>
            <p className="text-sm text-gray-600">{event.creator.name}</p>
            <p className="text-xs text-gray-400 mt-1">
                {new Date(event.startDateTime).toLocaleDateString('vi-VN')}
            </p>
        </div>
    </Link>
);

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        redirect("/login");
    }
    const userId = session.user.id;

    // Promise.all for parallel query
    const [myUpcomingRegistrations, newEvents, recentPosts] = await Promise.all([
        // Take 3 upcoming events user registered
        prisma.registration.findMany({
            where: {
                userId: userId,
                event: { startDateTime: { gte: new Date() } },
            },
            take: 3,
            orderBy: { event: { startDateTime: 'asc' } },
            include: { event: { include: { creator: true } } },
        }),

        // Take 5 newest event of the page
        prisma.event.findMany({
            where: { status: 'PUBLISHED' },
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { creator: true },
        }),
        // Take 5 newest post from different events
        prisma.post.findMany({
            where: {
                event: {
                    status: 'PUBLISHED',
                },
            },
            take: 5,
            orderBy: { createdAt: 'desc' },
            distinct: ['eventId'], // Take only 1 post from each event
            include: { event: { include: { creator: true } } },
        }),
    ]);

    const myUpcomingEvents = myUpcomingRegistrations.map(reg => reg.event);
    const eventsWithRecentActivity = recentPosts.map(post => post.event);

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-8">Bảng tin của bạn</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User's upcoming events*/}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold border-b pb-2">Sự kiện sắp tới của bạn</h2>
                    {myUpcomingEvents.length > 0 ? (
                        myUpcomingEvents.map(event => <DashboardEventItem key={event.id} event={event} />)
                    ) : (
                        <p className="text-sm text-gray-500">Bạn không có sự kiện nào sắp diễn ra.</p>
                    )}
                </section>

                {/* Newest event */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold border-b pb-2">Sự kiện mới nhất</h2>
                    {newEvents.length > 0 ? (
                        newEvents.map(event => <DashboardEventItem key={event.id} event={event} />)
                    ) : (
                        <p className="text-sm text-gray-500">Chưa có sự kiện nào mới.</p>
                    )}
                </section>

                {/* Recent posts */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold border-b pb-2">Vừa có hoạt động mới</h2>
                    {eventsWithRecentActivity.length > 0 ? (
                        eventsWithRecentActivity.map(event => <DashboardEventItem key={event.id} event={event} />)
                    ) : (
                        <p className="text-sm text-gray-500">Chưa có hoạt động nào mới.</p>
                    )}
                </section>
            </div>
        </div>
    );
}