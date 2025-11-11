// A header component for the admin section.
// components/shared/admin-header.tsx

import Link from 'next/link';

export const AdminHeader = () => {
    return (
        <header className="bg-gray-800 text-white shadow-md">
            <div className="container mx-auto px-6 py-3 flex justify-between items-center">
                <h1 className="text-xl font-bold">Admin Panel</h1>
                <nav className="flex items-center gap-4">
                    <Link href="/admin/event-approval" className="text-sm hover:text-gray-300">Duyệt sự kiện</Link>
                    <Link href="/admin/user-management" className="text-sm hover:text-gray-300">Quản lý người dùng</Link>
                    <Link href="/" className="px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-700">Về trang chủ</Link>
                </nav>
            </div>
        </header>
    );
};