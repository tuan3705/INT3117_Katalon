// English: A client component form for editing an existing event.
// components/features/edit-event-form.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Event, EventCategory } from '@prisma/client';

// date format
const formatDateForInput = (date: Date) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
};

export const EditEventForm = ({ event }: { event: Event }) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: event.title,
        description: event.description,
        location: event.location,
        startDateTime: formatDateForInput(event.startDateTime),
        endDateTime: formatDateForInput(event.endDateTime),
        maxAttendees: event.maxAttendees.toString(),
        category: event.category,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await axios.put(`/api/events/${event.id}`, formData);
            toast.success('Cập nhật sự kiện thành công!');
            router.push(`/events/${event.id}`);
            router.refresh();
        } catch (error) {
            toast.error('Cập nhật sự kiện thất bại.');
            console.error(error);
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
                    {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
            </div>
        </form>
    );
};