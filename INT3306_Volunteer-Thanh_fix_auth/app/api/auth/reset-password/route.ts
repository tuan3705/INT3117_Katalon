// API route to handle the final password reset submission.
// app/api/auth/reset-password/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { createHash } from 'crypto';

// Schema to validate the incoming token and new password
const resetSchema = z.object({
    token: z.string().min(1, 'Token is required'),
    password: z.string()
        .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
        .regex(/[a-z]/, 'Mật khẩu phải chứa ít nhất 1 chữ thường')
        .regex(/[A-Z]/, 'Mật khẩu phải chứa ít nhất 1 chữ hoa')
        .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất 1 số')
        .regex(/[@$!%*?&#]/, 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (@$!%*?&#)'),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { token, password } = resetSchema.parse(body);

        // SECURITY FIX: Hash the token before comparing with database
        const tokenHash = createHash('sha256').update(token).digest('hex');

        // Find the password with hashed token in the database
        const passwordResetToken = await prisma.passwordResetToken.findFirst({
            where: {
                token: tokenHash,
            },
        });

        // check if token is valid or has expired
        if (!passwordResetToken || new Date(passwordResetToken.expires) < new Date()) {
            return new NextResponse('Token không hợp lệ hoặc đã hết hạn.', { status: 400 });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 12);


        // Use transaction to ensure both operations succeed or fail together
        await prisma.$transaction([
            prisma.user.update({
                where: { id: passwordResetToken.userId },
                data: {
                    passwordHash: hashedPassword,
                },
            }),

            // Delete the used password reset token
            prisma.passwordResetToken.delete({
                where: { id: passwordResetToken.id },
            }),
        ])

        return NextResponse.json({ message: 'Mật khẩu đã được cập nhật thành công.' });

    } catch (error) {
        if (error instanceof z.ZodError) {
            // Return just the first error message
            return new NextResponse(error.issues[0].message, { status: 400 });
        }
        console.error('LỖI KHI RESET MẬT KHẨU:', error);
        return new NextResponse('Lỗi hệ thống', { status: 500 });
    }
}