// API route to update a specific registration, e.g., mark as complete.
// app/api/registrations/[registrationId]/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { RegistrationStatus } from '@prisma/client';

type RouteParams = {
    params: Promise<{
        registrationId: string;
    }>;
};

const updateSchema = z.object({
    status: z.enum(RegistrationStatus),
});

export async function PATCH(request: Request, { params }: RouteParams) {
    try {

        const session = await getServerSession(authOptions);
        const { registrationId } = await params;

        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }


        const registration = await prisma.registration.findUnique({
            where: { id: registrationId },
            include: { event: true },
        });

        if (!registration) {
            return new NextResponse('Registration not found', { status: 404 });
        }

        // Only this manager and admin can update
        if (registration.event.creatorId !== session.user.id && session.user.role !== 'ADMIN') {
            return new NextResponse('Forbidden', { status: 403 });
        }


        const body = await request.json();
        const { status } = updateSchema.parse(body);

        const updatedRegistration = await prisma.$transaction(async (tx) => {
            // Check capacity of approved volunteer
            if (status === RegistrationStatus.APPROVED) {
                const approvedCount = await tx.registration.count({
                    where: {
                        eventId: registration.eventId,
                        status: RegistrationStatus.APPROVED,
                    },
                });

                if (approvedCount >= registration.event.maxAttendees) {
                    throw new Error('EVENT_FULL');
                }
            }

            // Manager can mark completed only after event ends
            if (status === RegistrationStatus.COMPLETED) {
                const eventEndTime = new Date(registration.event.endDateTime);
                const now = new Date();

                if (eventEndTime > now) {
                    throw new Error('EVENT_NOT_ENDED');
                }
            }

            // Update the registration status
            return await tx.registration.update({
                where: { id: registrationId },
                data: { status },
                include: { event: true }
            });
        });

        let message = '';
        switch (status) {
            case 'APPROVED':
                message = `Chúc mừng! Bạn đã được duyệt tham gia sự kiện "${updatedRegistration.event.title}".`;
                break;
            case 'REJECTED':
                message = `Rất tiếc, đăng ký tham gia sự kiện "${updatedRegistration.event.title}" của bạn đã bị từ chối.`;
                break;
            case 'COMPLETED':
                message = `Bạn đã hoàn thành tham gia sự kiện "${updatedRegistration.event.title}". Cảm ơn sự đóng góp của bạn!`;
                break;
        }

        if (message) {
            await prisma.notification.create({
                data: {
                    userId: updatedRegistration.userId,
                    message: message,
                    href: `/events/${updatedRegistration.eventId}`,
                },
            });
        }

        return NextResponse.json(updatedRegistration);

    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'EVENT_FULL') {
                return new NextResponse(
                    'Sự kiện đã đủ số lượng người được duyệt. Không thể duyệt thêm.',
                    { status: 409 }
                );
            }
            if (error.message === 'EVENT_NOT_ENDED') {
                return new NextResponse(
                    'Không thể đánh dấu hoàn thành khi sự kiện chưa kết thúc.',
                    { status: 400 }
                );
            }
        }

        if (error instanceof z.ZodError) {
            return new NextResponse(error.issues[0].message, { status: 400 });
        }

        console.error('LỖI KHI CẬP NHẬT ĐĂNG KÝ:', error);
        return new NextResponse('Lỗi hệ thống', { status: 500 });
    }
}