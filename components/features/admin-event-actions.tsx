// English: Client component for Admin actions on an event (Approve, Reject).
// components/features/admin-event-actions.tsx

'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { EventStatus } from '@prisma/client';

export const AdminEventActions = ({ eventId }: { eventId: string }) => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleUpdateStatus = (status: EventStatus) => {
        startTransition(async () => {
            try {
                await axios.put(`/api/events/${eventId}`, { status });
                toast.success(`Sự kiện đã được ${status === 'PUBLISHED' ? 'duyệt' : 'từ chối'}.`);
                router.refresh();
            } catch (error) {
                toast.error(`Cập nhật thất bại: ${error}`);
            }
        });
    };

    return (
        <div className="flex gap-2">
            <button onClick={() => handleUpdateStatus(EventStatus.PUBLISHED)} disabled={isPending} className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700">Duyệt</button>
            <button onClick={() => handleUpdateStatus(EventStatus.REJECTED)} disabled={isPending} className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Từ chối</button>
        </div>
    );
};