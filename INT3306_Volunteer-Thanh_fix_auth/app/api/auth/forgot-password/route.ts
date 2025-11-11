// API route to handle password reset requests.
// app/api/auth/forgot-password/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { transporter, mailOptions } from '@/lib/nodemailer';
import { createHash, randomBytes } from 'crypto';
import { z } from 'zod';
import { strictRateLimiter, withRateLimit } from '@/lib/rate-limit';

const requestSchema = z.object({
    email: z.email('Email không hợp lệ'),
});

export async function POST(request: Request) {
    try {
        // ADDED: Rate limiting for forgot password
        const rateLimitError = await withRateLimit(request, strictRateLimiter);
        if (rateLimitError) {
            return rateLimitError;
        }

        const body = await request.json();
        const { email } = requestSchema.parse(body);

        // Find the user by their email
        const user = await prisma.user.findUnique({
            where: { email },
        });

        // For security, we don't reveal if the user was found or not.
        // we'll send a success response either way.
        if (!user) {
            return NextResponse.json({ message: 'Nếu email tồn tại, link reset sẽ được gửi đến.' });
        }

        // generate a secure, random token
        const resetToken = randomBytes(32).toString('hex');

        // hash the token for more security before storing in DB
        const tokenHash = createHash('sha256').update(resetToken).digest('hex');

        // Set an expiration date for the token (like 1 hour from now)
        const expires = new Date();
        expires.setHours(expires.getHours() + 1);

        // Store the HASHED token in the database
        // Use upsert to create a new token or update an existing one for this user
        await prisma.passwordResetToken.upsert({
            where: { userId: user.id },
            update: {
                token: tokenHash,
                expires,
            },
            create: {
                userId: user.id,
                token: resetToken,
                expires,
            },
        });

        // send the password reset email (with RAW token)
        const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

        await transporter.sendMail({
            ...mailOptions,
            to: user.email,
            subject: 'Yêu cầu đặt lại mật khẩu cho VolunteerHub',
            html: `
                <!DOCTYPE html>
                <html>
                <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
                    <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    
                    <!-- Header with gradient -->
                    <div style="background: linear-gradient(135deg, #f97316 0%, #06b6d4 100%); padding: 40px 20px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">VolunteerHub</h1>
                    </div>
                    
                    <!-- Content -->
                    <div style="padding: 40px 30px;">
                        <h2 style="color: #1f2937; margin: 0 0 16px 0;">Yêu cầu đặt lại mật khẩu</h2>
                        <p style="color: #4b5563; line-height: 1.6; margin: 0 0 16px 0;">
                        Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
                        </p>
                        <p style="color: #4b5563; line-height: 1.6; margin: 0 0 24px 0;">
                        Vui lòng nhấn vào nút bên dưới để đặt lại mật khẩu. Link sẽ hết hạn sau <strong>1 giờ</strong>.
                        </p>
                        
                        <!-- CTA Button -->
                        <div style="text-align: center; margin: 32px 0;">
                        <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);">
                            Đặt lại mật khẩu
                        </a>
                        </div>
                        
                        <!-- Security note -->
                        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 4px; margin: 24px 0;">
                        <p style="color: #78350f; margin: 0; font-size: 14px;">
                            <strong>⚠️ Lưu ý bảo mật:</strong> Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này và mật khẩu của bạn sẽ không thay đổi.
                        </p>
                        </div>
                        
                        <p style="color: #9ca3af; font-size: 14px; margin: 24px 0 0 0;">
                        Hoặc sao chép link sau vào trình duyệt:<br>
                        <span style="color: #06b6d4; word-break: break-all;">${resetUrl}</span>
                        </p>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background-color: #f9fafb; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="color: #6b7280; font-size: 14px; margin: 0;">
                        © 2024 VolunteerHub - Nền tảng kết nối tình nguyện viên
                        </p>
                    </div>
                    
                    </div>
                </body>
                </html>
                `,
        });

        return NextResponse.json({ message: 'Nếu email tồn tại, link reset sẽ được gửi đến.' });

    } catch (error) {
        console.error('LỖI KHI YÊU CẦU RESET MẬT KHẨU:', error);
        return new NextResponse('Lỗi hệ thống', { status: 500 });
    }
}