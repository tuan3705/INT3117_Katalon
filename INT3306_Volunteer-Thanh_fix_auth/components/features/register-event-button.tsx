// src/components/features/register-event-button.tsx
// components/features/register-event-button.tsx

'use client';

import { useState, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios, { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import { Role } from '@prisma/client';

type RegisterEventButtonProps = {
    eventId: string;
    isInitiallyRegistered: boolean;
    isEventEnded: boolean;
};

export const RegisterEventButton = ({ eventId, isInitiallyRegistered, isEventEnded }: RegisterEventButtonProps) => {
    const { data: session, status } = useSession();
    const router = useRouter();


    const [isRegistered, setIsRegistered] = useState(isInitiallyRegistered);
    const [isPending, startTransition] = useTransition(); // deal with loading state

    // This button just for user
    if (session?.user?.role === Role.EVENT_MANAGER || session?.user?.role === Role.ADMIN) {
        return null;
    }

    const handleClick = async () => {
        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }

        startTransition(async () => {
            try {
                if (isRegistered) {
                    await axios.delete(`/api/events/${eventId}/register`);
                    toast.success('Hủy đăng ký thành công!');
                    setIsRegistered(false);
                } else {
                    await axios.post(`/api/events/${eventId}/register`);
                    toast.success('Đã gửi yêu cầu đăng ký đến quản lý sự kiện!');
                    setIsRegistered(true);
                }

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

    if (status !== 'authenticated') {
        return (
            <button onClick={handleClick} className="w-full md:w-auto px-8 py-3 text-lg font-medium text-white bg-gray-400 border border-transparent rounded-md shadow-sm cursor-pointer">
                Đăng nhập để đăng ký
            </button>
        );
    }

    if (isEventEnded) {
        return (
            <button disabled className="w-full md:w-auto px-8 py-3 text-lg font-medium text-white bg-gray-400 border border-transparent rounded-md shadow-sm cursor-not-allowed">
                Sự kiện đã kết thúc
            </button>
        );
    }

    return (
        <button
            onClick={handleClick}
            disabled={isPending}
            className={`w-full md:w-auto px-8 py-3 text-lg font-medium text-white border border-transparent rounded-md shadow-sm disabled:opacity-50 ${isRegistered
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-green-600 hover:bg-green-700'
                }`}
        >
            {isPending ? 'Đang xử lý...' : isRegistered ? 'Hủy đăng ký' : 'Đăng ký tham gia sự kiện này'}
        </button>
    );
};