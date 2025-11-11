// API route for Admins to fetch all users
// app/api/admin/users/route.ts
// update: add pagination support

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

const ITEMS_PER_PAGE = 20;

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const search = searchParams.get('search') || '';

        const where = search
            ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' as const } },
                    { email: { contains: search, mode: 'insensitive' as const } },
                ],
            }
            : {};

        // Get total count and paginated users
        const [totalUsers, users] = await Promise.all([
            prisma.user.count({ where }),
            prisma.user.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: ITEMS_PER_PAGE,
                skip: (page - 1) * ITEMS_PER_PAGE,
            }),
        ]);


        return NextResponse.json({
            users,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalUsers / ITEMS_PER_PAGE),
                totalUsers,
                itemsPerPage: ITEMS_PER_PAGE,
            },
        });
    } catch (error) {
        console.error('LỖI KHI LẤY DANH SÁCH NGƯỜI DÙNG:', error);
        return new NextResponse('Lỗi hệ thống', { status: 500 });
    }
}