// API route to fetch all registrations for a specific event.
// app/api/events/[eventId]/registrations/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

type RouteParams = {
    params: Promise<{
        eventId: string;
    }>;
};

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);
        const { eventId } = await params;

        const event = await prisma.event.findUnique({ where: { id: eventId } });
        if (!event) {
            return new NextResponse('Event not found', { status: 404 });
        }

        // Only admin and this manager
        if (!session || (event.creatorId !== session.user.id && session.user.role !== 'ADMIN')) {
            return new NextResponse('Forbidden', { status: 403 });
        }

        const registrations = await prisma.registration.findMany({
            where: { eventId: eventId },
            include: {
                user: true,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        return NextResponse.json(registrations);
    } catch (error) {
        console.error('LỖI KHI LẤY DANH SÁCH ĐĂNG KÝ:', error);
        return new NextResponse('Lỗi hệ thống', { status: 500 });
    }
}