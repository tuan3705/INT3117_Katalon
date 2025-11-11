// Client component with actions for a single registration (e.g., mark complete, reject).
// components/features/registration-actions.tsx

'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import axios, { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import { Registration, RegistrationStatus } from '@prisma/client';

type Props = {
    registration: Registration;
};

export const RegistrationActions = ({ registration }: Props) => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleUpdateStatus = (status: RegistrationStatus) => {
        startTransition(async () => {
            try {
                await axios.patch(`/api/registrations/${registration.id}`, { status });
                toast.success('Cập nhật trạng thái thành công!');
                router.refresh();
            } catch (error) {
                if (isAxiosError(error)) {
                    toast.error(error.response?.data || 'Có lỗi xảy ra.');
                } else {
                    toast.error('Có lỗi không mong muốn xảy ra.');
                    console.error(error);
                }
            }
        });
    };

    return (
        <div className="flex items-center gap-2">
            {registration.status === RegistrationStatus.PENDING && (
                <>
                    <button onClick={() => handleUpdateStatus(RegistrationStatus.APPROVED)} disabled={isPending} className="text-green-600 hover:text-green-900 text-xs">Duyệt</button>
                    <button onClick={() => handleUpdateStatus(RegistrationStatus.REJECTED)} disabled={isPending} className="text-red-600 hover:text-red-900 text-xs">Từ chối</button>
                </>
            )}

            {/* The 2 buttons down here just show when manager approved the register */}
            {registration.status === RegistrationStatus.APPROVED && (
                <button onClick={() => handleUpdateStatus(RegistrationStatus.COMPLETED)} disabled={isPending} className="text-blue-600 hover:text-blue-900 text-xs">Đánh dấu hoàn thành</button>
            )}

            {registration.status === RegistrationStatus.COMPLETED && (
                <button onClick={() => handleUpdateStatus(RegistrationStatus.APPROVED)} disabled={isPending} className="text-gray-600 hover:text-gray-900 text-xs">Hủy hoàn thành</button>
            )}
        </div>
    );
};