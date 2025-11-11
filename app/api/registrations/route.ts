// API route for a volunteer to fetch their own event registrations.
// app/api/registrations/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const registrations = await prisma.registration.findMany({
            where: {
                userId: session.user.id,
            },
            include: {
                event: {
                    include: {
                        creator: true,
                    },
                },
            },
            orderBy: {
                event: {
                    startDateTime: 'desc',
                },
            },
        });

        return NextResponse.json(registrations);
    } catch (error) {
        console.error('LỖI KHI LẤY SỰ KIỆN ĐÃ ĐĂNG KÝ:', error);
        return new NextResponse('Lỗi hệ thống', { status: 500 });
    }
}