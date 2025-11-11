// API route for creating a new event.
// app/api/events/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { EventCategory } from '@prisma/client';
import { z } from 'zod';


const createEventSchema = z.object({
    title: z.string()
        .min(3, 'Tiêu đề phải có ít nhất 3 ký tự')
        .max(200, 'Tiêu đề không được quá 200 ký tự'),
    description: z.string()
        .min(10, 'Mô tả phải có ít nhất 10 ký tự')
        .max(5000, 'Mô tả không được quá 5000 ký tự'),
    location: z.string()
        .min(3, 'Địa điểm phải có ít nhất 3 ký tự')
        .max(500, 'Địa điểm không được quá 500 ký tự'),
    startDateTime: z.coerce.date(),
    endDateTime: z.coerce.date(),
    maxAttendees: z.coerce.number()
        .int('Số người tham gia phải là số nguyên')
        .positive('Số người tham gia phải là số dương')
        .min(1, 'Số người tham gia tối thiểu là 1')
        .max(10000, 'Số người tham gia không được quá 10,000'),
    category: z.enum(EventCategory),
})
    .refine((data) => {
        // Start date must be in the future
        return new Date(data.startDateTime) > new Date();
    }, {
        message: 'Thời gian bắt đầu phải sau thời điểm hiện tại',
        path: ['startDateTime']
    })
    .refine((data) => {
        // End date must be after start date
        return new Date(data.endDateTime) > new Date(data.startDateTime);
    }, {
        message: 'Thời gian kết thúc phải sau thời gian bắt đầu',
        path: ['endDateTime']
    })
    .refine((data) => {
        // Event duration should not be longer than 30 days
        const duration = new Date(data.endDateTime).getTime() - new Date(data.startDateTime).getTime();
        const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
        return duration <= thirtyDaysInMs;
    }, {
        message: 'Sự kiện không được kéo dài quá 30 ngày',
        path: ['endDateTime']
    });


export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        // Check role
        if (!session?.user?.id || (session.user.role !== 'ADMIN' && session.user.role !== 'EVENT_MANAGER')) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await request.json();
        const validatedData = createEventSchema.parse(body);

        const newEvent = await prisma.event.create({
            data: {
                ...validatedData,
                // attach the current id to creatorId
                creatorId: session.user.id,
            },
        });

        return NextResponse.json(newEvent, { status: 201 });

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
        console.error('LỖI KHI TẠO SỰ KIỆN:', error);
        return new NextResponse('Lỗi hệ thống', { status: 500 });
    }
}