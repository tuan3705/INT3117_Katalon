//  API route for Admins to fetch events pending approval.
// app/api/admin/pending-events/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const pendingEvents = await prisma.event.findMany({
      where: { status: 'PENDING_APPROVAL' },
      include: { creator: true },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(pendingEvents);
  } catch (error) {
    console.error('LỖI KHI LẤY SỰ KIỆN CHỜ DUYỆT:', error);
    return new NextResponse('Lỗi hệ thống', { status: 500 });
  }
}