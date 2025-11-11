// English: A protected page for creating a new event.
// src/app/(main)/events/create/page.tsx

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { CreateEventForm } from '@/components/features/create-event-form';

export default async function CreateEventPage() {
    const session = await getServerSession(authOptions);

    // this route will be protected
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'EVENT_MANAGER')) {
        redirect('/');
    }

    return (
        <div className="max-w-2xl mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-8">Tạo sự kiện mới</h1>
            <div className="bg-white p-8 rounded-lg shadow-md">
                <CreateEventForm />
            </div>
        </div>
    );
}