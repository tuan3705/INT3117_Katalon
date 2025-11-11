// A client component for displaying user notifications.
// components/features/notification-bell.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface Notification {
    id: string;
    message: string;
    href: string | null;
    isRead: boolean;
    createdAt: string;
}

// fetcher function cho SWR
const fetcher = (url: string) => axios.get(url).then(res => res.data);

export const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Use swr for auto fetch và data cache 
    const { data: notifications, mutate } = useSWR<Notification[]>('/api/notifications', fetcher, {
        refreshInterval: 60000 // auto fetch after each 60s
    });

    const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleToggle = async () => {
        setIsOpen(!isOpen);
        // If the action is open, we want to mark all unread notification to read immediately
        if (!isOpen && unreadCount > 0) {
            await axios.patch('/api/notifications');
            // tell SWR update local data immidiately (optimistic update)
            // false: tell SWR not to fetch now, just update local cache
            // we do this since is just an action of read or undread, not really important
            mutate(notifications?.map(n => ({ ...n, isRead: true })), false);
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        setIsOpen(false);
        if (notification.href) {
            router.push(notification.href);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                className="btn btn-ghost btn-circle indicator"
                onClick={handleToggle}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                </svg>
                {unreadCount > 0 && (
                    <span className="badge badge-sm badge-primary indicator-item">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div
                    className="absolute right-0 mt-3 z-50 card card-compact w-80 md:w-96 bg-base-100 shadow-2xl border border-base-300"
                >
                    <div className="card-body p-0">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-base-300">
                            <h3 className="font-bold text-lg">Thông báo</h3>
                            {unreadCount > 0 && (
                                <div className="badge badge-primary badge-sm">
                                    {unreadCount} mới
                                </div>
                            )}
                        </div>

                        {/* Notification List */}
                        <div className="max-h-96 overflow-y-auto">
                            {notifications && notifications.length > 0 ? (
                                notifications.map(n => (
                                    <div
                                        key={n.id}
                                        onClick={() => handleNotificationClick(n)}
                                        className={`p-4 border-b border-base-200 hover:bg-base-200 cursor-pointer transition-colors ${!n.isRead ? 'bg-primary/5' : ''
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Unread indicator dot */}
                                            {!n.isRead && (
                                                <div className="mt-1.5">
                                                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <p className="text-sm">{n.message}</p>
                                                <p className="text-xs text-base-content/60 mt-1 flex items-center gap-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {new Date(n.createdAt).toLocaleString('vi-VN')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-base-200 mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                        </svg>
                                    </div>
                                    <p className="text-sm text-base-content/60">Bạn không có thông báo nào</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};