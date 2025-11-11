// The main layout for the entire admin section, including authorization.
// app/admin/layout.tsx

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { AdminHeader } from '@/components/shared/admin-header';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    // Only for admin
    if (!session || session.user.role !== 'ADMIN') {
        redirect('/');
    }

    return (
        <div>
            <AdminHeader />
            <main className="bg-gray-50 min-h-screen">
                {children}
            </main>
        </div>
    );
}