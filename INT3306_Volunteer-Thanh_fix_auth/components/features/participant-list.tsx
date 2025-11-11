// A client component that fetches and displays the list of event participants
// component/features/participant-list.tsx

'use client';

import useSWR from 'swr';
import axios from 'axios';
import { Registration, User, RegistrationStatus } from '@prisma/client';
import { RegistrationActions } from './registration-actions';

type Participant = Registration & { user: User };
const fetcher = (url: string) => axios.get(url).then(res => res.data);



export const ParticipantList = ({ eventId }: { eventId: string }) => {
    const { data: registrations, isLoading, error } = useSWR<Participant[]>(
        `/api/events/${eventId}/registrations`,
        fetcher,
        { refreshInterval: 5000 } // Auto fetch after 5s
    );

    if (isLoading) return <p>Đang tải danh sách...</p>;
    if (error) return <p>Không thể tải danh sách người tham gia.</p>;
    if (!registrations || registrations.length === 0) {
        return <p className="text-center py-8 text-gray-500">Chưa có ai đăng ký sự kiện này.</p>;
    }

    return (
        <div className="overflow-x-auto">
            <h2 className="text-2xl font-semibold mb-6">Danh sách tình nguyện viên đã đăng ký ({registrations.length})</h2>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">STT</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Họ và tên</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày đăng ký</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {registrations.map((reg, index) => (
                        <tr key={reg.id}>
                            <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{reg.user.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{reg.user.email}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                                {new Date(reg.createdAt).toLocaleDateString('vi-VN')}
                            </td>
                            <td className="px-6 py-4 text-sm"><StatusBadge status={reg.status} /></td>
                            <td className="px-6 py-4 text-sm font-medium"><RegistrationActions registration={reg} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


// Create a small component to display the status icon
const StatusBadge = ({ status }: { status: RegistrationStatus }) => {
    const statusConfig = {
        PENDING: { text: 'Chờ duyệt', style: 'bg-yellow-100 text-yellow-800' },
        APPROVED: { text: 'Đã duyệt', style: 'bg-blue-100 text-blue-800' },
        COMPLETED: { text: 'Đã hoàn thành', style: 'bg-green-100 text-green-800' },
        REJECTED: { text: 'Đã từ chối', style: 'bg-red-100 text-red-800' },
    };
    const config = statusConfig[status];
    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config.style}`}>
            {config.text}
        </span>
    );
};