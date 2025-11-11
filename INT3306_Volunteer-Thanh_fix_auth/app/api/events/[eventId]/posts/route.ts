// API routes for fetching and creating posts for a specific event.
// app/api/events/[eventId]/posts/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { z } from 'zod'; // for schema validation

type RouteParams = {
    params: Promise<{
        eventId: string;
    }>;
};

// Get a list of post
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { eventId } = await params;
        const posts = await prisma.post.findMany({
            where: { eventId },
            include: {
                author: {
                    select: { name: true, email: true, imageUrl: true }, // Only neccesarry in4 of author
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(posts);
    } catch (error) {
        console.error('LỖI KHI LẤY BÀI VIẾT:', error);
        return new NextResponse('Lỗi hệ thống', { status: 500 });
    }
}

const postSchema = z.object({
    content: z.string().min(1, 'Nội dung không được để trống').max(500, 'Nội dung quá dài'),
});


// Create a post
export async function POST(request: Request, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }
        const userId = session.user.id;
        const { eventId } = await params;

        // Authorization: whether the user registry the event
        const registration = await prisma.registration.findUnique({
            where: { userId_eventId: { userId, eventId } },
        });
        if (!registration) {
            return new NextResponse('Forbidden: Bạn phải đăng ký sự kiện để đăng bài', { status: 403 });
        }

        const body = await request.json(); //content of user's post
        const { content } = postSchema.parse(body);

        const newPost = await prisma.post.create({
            data: {
                content,
                eventId,
                authorId: userId,
            },
            include: {
                author: {
                    select: { name: true, email: true, imageUrl: true },
                },
            },
        });

        return NextResponse.json(newPost, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 400 });
        }
        console.error('LỖI KHI TẠO BÀI VIẾT:', error);
        return new NextResponse('Lỗi hệ thống', { status: 500 });
    }
}