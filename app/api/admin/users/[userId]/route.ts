// API route for an Admin to update a user's status (lock/unlock)
// app/api/admin/users/[userId]/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { UserStatus } from '@prisma/client';

type RouteParams = {
    params: Promise<{
        userId: string;
    }>;
};

const updateSchema = z.object({
    status: z.enum([UserStatus.ACTIVE, UserStatus.LOCKED]),
});

export async function PATCH(request: Request, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);
        const { userId } = await params;

        if (!session || session.user.role !== 'ADMIN') {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // prevent admin from locking his/her own account
        if (session.user.id === userId) {
            return new NextResponse('Không thể tự khóa tài khoản của chính mình.', { status: 400 });
        }

        const body = await request.json();
        const { status } = updateSchema.parse(body);

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { status },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('LỖI KHI CẬP NHẬT TRẠNG THÁI NGƯỜI DÙNG:', error);
        return new NextResponse('Lỗi hệ thống', { status: 500 });
    }
}