// API route for updating the current user's profile.
// app/api/profile/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { Gender } from '@prisma/client';

// Schema để xác thực dữ liệu gửi lên
const profileUpdateSchema = z.object({
    name: z.string().min(3, 'Tên phải có ít nhất 3 ký tự'),
    phone: z.string().optional(),
    address: z.string().optional(),
    dateOfBirth: z.coerce.date().optional(),
    gender: z.enum([Gender.MALE, Gender.FEMALE]).optional()
});

export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await request.json();
        const validatedData = profileUpdateSchema.parse(body);

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: validatedData,
        });


        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { passwordHash, ...userWithoutPassword } = updatedUser;

        return NextResponse.json(userWithoutPassword);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 400 });
        }
        console.error('LỖI KHI CẬP NHẬT HỒ SƠ:', error);
        return new NextResponse('Lỗi hệ thống', { status: 500 });
    }
}