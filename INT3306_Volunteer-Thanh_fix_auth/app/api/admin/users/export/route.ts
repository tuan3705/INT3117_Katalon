// API route for an Admin to export the user list as a CSV file
// app/api/admin/users/export/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import Papa from 'papaparse';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Take all information, exclude password
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                address: true,
                dateOfBirth: true,
                gender: true,
                role: true,
                status: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        // json -> csv
        const csv = Papa.unparse(users);

        const fileName = `users_export_${new Date().toISOString().split('T')[0]}.csv`;

        return new Response(csv, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="${fileName}"`,
            },
        });

    } catch (error) {
        console.error('LỖI KHI XUẤT DỮ LIỆU NGƯỜI DÙNG:', error);
        return new NextResponse('Lỗi hệ thống', { status: 500 });
    }
}