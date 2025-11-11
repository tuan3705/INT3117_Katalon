// A client component that fetches and displays the list of users for admins
// components/features/admin-user-list.tsx

'use client';

import { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import { User } from '@prisma/client';
import { AdminUserActions } from './admin-user-actions';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

type ApiResponse = {
    users: User[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalUsers: number;
        itemsPerPage: number;
    };
};

export const UserList = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('')
    const [isExporting, setIsExporting] = useState(false);

    const { data, isLoading, error } = useSWR<ApiResponse>('/api/admin/users', fetcher);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        setSearch(searchInput);
    }

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const response = await axios.get('/api/admin/users/export', {
                responseType: 'blob', // binary blob, raw data
            });

            const bom = '\uFEFF'; // Byte Order Mark, for utf8
            const blobWithBom = new Blob([bom, response.data], { type: 'text/csv;charset=utf-8;' });

            // create a temporary URL to download
            const url = window.URL.createObjectURL(blobWithBom);
            const link = document.createElement('a');
            link.href = url;


            const contentDisposition = response.headers['content-disposition']; // take header Content-Disposition
            let fileName = 'users_export.csv';
            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename="(.+)"/); // @@, welp, use regex to get filename
                if (fileNameMatch && fileNameMatch[1]) {
                    fileName = fileNameMatch[1];
                }
            }

            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url); // after download, delete <a> and take back URL to release memory

        } catch (err) {
            console.error('Export failed', err);
        } finally {
            setIsExporting(false);
        }
    };

    if (error) return <p>Không thể tải danh sách người dùng.</p>;

    return (
        <div className="space-y-4">
            {/* Search and Export */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                {/* Search Form */}
                <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-md">
                    <input
                        type="text"
                        placeholder="Tìm theo tên hoặc email..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="input input-bordered flex-1"
                    />
                    <button type="submit" className="btn btn-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                    {search && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearch('');
                                setSearchInput('');
                            }}
                            className="btn btn-ghost"
                        >
                            Xóa
                        </button>
                    )}
                </form>

                {/* Export Button */}
                <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="btn btn-secondary"
                >
                    {isExporting ? 'Đang xuất...' : 'Xuất ra CSV'}
                </button>
            </div>

            {/* Results Info */}
            {data && (
                <div className="text-sm text-base-content/60">
                    Hiển thị {data.users.length} / {data.pagination.totalUsers} người dùng
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="flex justify-center py-8">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            )}

            {/* User Table */}
            {data && data.users.length > 0 && (
                <>
                    <div className="overflow-x-auto">
                        <table className="table table-zebra">
                            <thead>
                                <tr>
                                    <th>Họ và tên</th>
                                    <th>Email</th>
                                    <th>Vai trò</th>
                                    <th>Trạng thái</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.users.map((user) => (
                                    <tr key={user.id}>
                                        <td className="font-medium">{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            <span className="badge badge-ghost">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                className={`badge ${user.status === 'ACTIVE'
                                                        ? 'badge-success'
                                                        : 'badge-error'
                                                    }`}
                                            >
                                                {user.status === 'ACTIVE' ? 'Hoạt động' : 'Bị khóa'}
                                            </span>
                                        </td>
                                        <td>
                                            <AdminUserActions user={user} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {data.pagination.totalPages > 1 && (
                        <div className="flex justify-center mt-6">
                            <div className="join">
                                <button
                                    className="join-item btn btn-sm"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page <= 1}
                                >
                                    «
                                </button>
                                <button className="join-item btn btn-sm">
                                    Trang {page} / {data.pagination.totalPages}
                                </button>
                                <button
                                    className="join-item btn btn-sm"
                                    onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                                    disabled={page >= data.pagination.totalPages}
                                >
                                    »
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Empty State */}
            {data && data.users.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-base-content/60">
                        {search ? 'Không tìm thấy người dùng phù hợp' : 'Chưa có người dùng nào'}
                    </p>
                </div>
            )}
        </div>
    );
};