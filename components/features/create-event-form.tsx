// A client component form for creating a new event.
// components/features/create-event-form.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios, { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import { EventCategory } from '@prisma/client';

export const CreateEventForm = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        startDateTime: '',
        endDateTime: '',
        maxAttendees: '50',
        category: EventCategory.COMMUNITY
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await axios.post('/api/events', formData);
            const newEvent = response.data;
            toast.success('Tạo sự kiện thành công!');

            router.push(`/events/${newEvent.id}`);
            router.refresh();
        } catch (error) {
            if (isAxiosError(error) && error.response?.data) {
                toast.error('Tạo sự kiện thất bại. Vui lòng kiểm tra lại thông tin.');
                console.error('Validation errors:', error.response.data);
            } else {
                toast.error('Đã có lỗi không mong muốn xảy ra.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Tiêu đề</label>
                <input type="text" name="title" id="title" required value={formData.title} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>

            <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Danh mục</label>
                <select name="category" id="category" required value={formData.category} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                    {Object.values(EventCategory).map((sel) => (
                        <option key={sel} value={sel}>
                            {sel}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Mô tả</label>
                <textarea name="description" id="description" required value={formData.description} onChange={handleChange} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">Địa điểm</label>
                <input type="text" name="location" id="location" required value={formData.location} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="startDateTime" className="block text-sm font-medium text-gray-700">Thời gian bắt đầu</label>
                    <input type="datetime-local" name="startDateTime" id="startDateTime" required value={formData.startDateTime} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                <div>
                    <label htmlFor="endDateTime" className="block text-sm font-medium text-gray-700">Thời gian kết thúc</label>
                    <input type="datetime-local" name="endDateTime" id="endDateTime" required value={formData.endDateTime} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
            </div>
            <div>
                <label htmlFor="maxAttendees" className="block text-sm font-medium text-gray-700">Số người tham gia tối đa</label>
                <input type="number" name="maxAttendees" id="maxAttendees" required value={formData.maxAttendees} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
                <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400">
                    {isLoading ? 'Đang tạo...' : 'Tạo sự kiện'}
                </button>
            </div>
        </form>
    );
};