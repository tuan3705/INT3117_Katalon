// API route to handle user registration.
// app/api/auth/register/route.ts

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { z } from 'zod';
import { authRateLimiter, withRateLimit } from '@/lib/rate-limit';


const registerSchema = z.object({
    email: z.email('Email không hợp lệ'),
    name: z.string()
        .min(2, 'Tên phải có ít nhất 2 ký tự')
        .max(100, 'Tên không được quá 100 ký tự')
        .regex(/^[\p{L}\s]+$/u, 'Tên chỉ được chứa chữ cái và khoảng trắng'),
    password: z.string()
        .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
        .max(128, 'Mật khẩu không được quá 128 ký tự')
        .regex(/[a-z]/, 'Mật khẩu phải chứa ít nhất 1 chữ thường')
        .regex(/[A-Z]/, 'Mật khẩu phải chứa ít nhất 1 chữ hoa')
        .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất 1 số')
        .regex(/[@$!%*?&#]/, 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (@$!%*?&#)'),
});

// new use registery
export async function POST(request: Request) {
    try {
        // ADDED: Rate limiting for forgot password
        const rateLimitError = await withRateLimit(request, authRateLimiter);
        if (rateLimitError) {
            return rateLimitError;
        }

        // take request from user
        const body = await request.json();
        const result = registerSchema.safeParse(body);

        if (!result.success) {
            return new NextResponse(result.error.issues[0].message, { status: 400 });
        }

        const { email, name, password } = result.data;
        // prevent duplicate email
        const normalizedEmail = email.toLowerCase().trim();

        // email exist or not?
        const existingUser = await prisma.user.findUnique({
            where: {
                email: normalizedEmail,
            },
        });

        if (existingUser) {
            return new NextResponse("Email đã được sử dụng", { status: 409 });
        }

        // encode the password
        const hashedPassword = await bcrypt.hash(password, 12);

        // create new user in the db
        const user = await prisma.user.create({
            data: {
                email,
                name,
                passwordHash: hashedPassword,
            },
        });

        // return in4 of the user (not return pw)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { passwordHash, ...userWithoutPassword } = user;
        return NextResponse.json(userWithoutPassword, { status: 201 });

    } catch (error) {
        console.error("LỖI KHI ĐĂNG KÝ:", error);
        return new NextResponse("Lỗi hệ thống", { status: 500 });
    }
}