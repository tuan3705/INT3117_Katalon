// A protected page for users to view and edit their profile.
// app/(main)/profile/page.tsx

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { ProfileForm } from '@/components/features/profile-form';

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        redirect('/login');
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
    });

    if (!user) {
        redirect('/login');
    }

    return (
        <div className="max-w-2xl mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-8">Hồ sơ cá nhân</h1>
            <div className="bg-white p-8 rounded-lg shadow-md">
                <ProfileForm user={user} />
            </div>
        </div>
    );
}