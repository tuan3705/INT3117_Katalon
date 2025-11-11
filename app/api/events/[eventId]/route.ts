// API route for deleting a specific event.
// app/api/events/[eventId]/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { EventCategory, EventStatus } from '@prisma/client';


type RouteParams = {
    params: Promise<{
        eventId: string;
    }>;
};

export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);
        const { eventId } = await params;

        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Check if event manager or not
        const event = await prisma.event.findUnique({
            where: { id: eventId },
        });

        if (!event) {
            return new NextResponse('Event not found', { status: 404 });
        }

        // only manager and admin can delete
        if (event.creatorId !== session.user.id && session.user.role !== 'ADMIN') {
            return new NextResponse('Forbidden', { status: 403 });
        }


        // Get list of registered users
        const registrations = await prisma.registration.findMany({
            where: { eventId: eventId },
            select: { userId: true },
        });

        //  Use transaction to ensure all operations succeed or fail together
        await prisma.$transaction(async (tx) => {
            // Create notifications for registered users
            if (registrations.length > 0) {
                const userIds = registrations.map(reg => reg.userId);
                await tx.notification.createMany({
                    data: userIds.map(userId => ({
                        userId: userId,
                        message: `Rất tiếc, sự kiện "${event.title}" đã bị hủy bởi người tổ chức.`,
                    })),
                });
            }

            // Delete all registrations
            await tx.registration.deleteMany({
                where: { eventId: eventId },
            });

            // Delete the event (this will cascade delete posts due to schema)
            await tx.event.delete({
                where: { id: eventId },
            });
        });

        return NextResponse.json({ message: 'Sự kiện đã được xóa thành công' }, { status: 200 });
    } catch (error) {
        console.error('LỖI KHI XÓA SỰ KIỆN:', error);
        return new NextResponse('Lỗi hệ thống', { status: 500 });
    }
}


const updateEventSchema = z.object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().min(10).max(5000).optional(),
    location: z.string().min(3).max(500).optional(),
    startDateTime: z.coerce.date().optional(),
    endDateTime: z.coerce.date().optional(),
    maxAttendees: z.coerce.number().int().positive().min(1).max(10000).optional(),
    category: z.enum(EventCategory).optional(),
    status: z.enum(EventStatus).optional(),
})
    .refine((data) => {
        // If both dates are provided, validate them
        if (data.startDateTime && data.endDateTime) {
            return new Date(data.endDateTime) > new Date(data.startDateTime);
        }
        return true;
    }, {
        message: 'Thời gian kết thúc phải sau thời gian bắt đầu',
        path: ['endDateTime']
    });


export async function PUT(request: Request, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);
        const { eventId } = await params;

        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const event = await prisma.event.findUnique({ where: { id: eventId } });
        if (!event) {
            return new NextResponse('Event not found', { status: 404 });
        }
        if (event.creatorId !== session.user.id && session.user.role !== 'ADMIN') {
            return new NextResponse('Forbidden', { status: 403 });
        }

        const body = await request.json();
        const isCreator = event.creatorId === session.user.id;
        const isAdmin = session.user.role === 'ADMIN';
        const validatedData = updateEventSchema.parse(body);

        // IMPROVED: Only reset to pending if significant fields changed
        // significant fields are those that affect the event's core details
        const significantFields = ['title', 'description', 'startDateTime', 'endDateTime', 'location', 'maxAttendees'];
        const hasSignificantChanges = significantFields.some(field =>
            body[field] !== undefined && String(body[field]) !== String(event[field as keyof typeof event])
        );

        // If creator makes significant changes to published event, reset to pending
        if (event.status === 'PUBLISHED' && isCreator && hasSignificantChanges && !body.status) {
            validatedData.status = 'PENDING_APPROVAL';
        }

        // Validate that new maxAttendees is not less than current approved registrations
        if (validatedData.maxAttendees !== undefined) {
            const approvedCount = await prisma.registration.count({
                where: {
                    eventId: eventId,
                    status: 'APPROVED',
                },
            });

            if (validatedData.maxAttendees < approvedCount) {
                return new NextResponse(
                    `Không thể giảm số lượng người tham gia xuống dưới ${approvedCount} (số người đã được duyệt).`,
                    { status: 400 }
                );
            }
        }

        const updatedEvent = await prisma.event.update({
            where: { id: eventId },
            data: validatedData,
        });

        if (body.status && isAdmin) {
            let message = '';
            if (body.status === 'PUBLISHED') {
                message = `Sự kiện "${updatedEvent.title}" của bạn đã được duyệt và đăng công khai.`;
            } else if (body.status === 'REJECTED') {
                message = `Sự kiện "${updatedEvent.title}" của bạn đã bị từ chối.`;
            }

            if (message) {
                await prisma.notification.create({
                    data: {
                        userId: updatedEvent.creatorId,
                        message: message,
                        href: `/events/${updatedEvent.id}`,
                    },
                });
            }
        }

        // Notify creator if their event was reset to pending
        if (validatedData.status === 'PENDING_APPROVAL' && hasSignificantChanges && isCreator) {
            await prisma.notification.create({
                data: {
                    userId: updatedEvent.creatorId,
                    message: `Sự kiện "${updatedEvent.title}" đã được chuyển về trạng thái chờ duyệt do có thay đổi quan trọng.`,
                    href: `/events/${updatedEvent.id}`,
                },
            });
        }

        return NextResponse.json(updatedEvent);

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    error: 'Validation failed',
                    details: error.issues.map(issue => ({
                        field: issue.path.join('.'),
                        message: issue.message
                    }))
                },
                { status: 400 }
            );
        }
        console.error('LỖI KHI CẬP NHẬT SỰ KIỆN:', error);
        return new NextResponse('Lỗi hệ thống', { status: 500 });
    }
}