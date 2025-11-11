// Mobile drawer menu for responsive navigation
// Add this to your layout.tsx alongside the Navbar

'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Role } from '@prisma/client';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export const MobileDrawer = ({ children }: { children: React.ReactNode }) => {
    const { data: session, status } = useSession();
    const userRole = session?.user?.role as Role;
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    // Automatically close the drawer when size of the desktop back to normal
    useEffect(() => {
        const handleResize = () => {
            const drawer = document.getElementById('mobile-drawer') as HTMLInputElement | null;
            if (drawer && window.innerWidth >= 1024) {
                drawer.checked = false;
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // use drawer component from daisyUI to get the side bar
    return (
        <div className="drawer">
            <input id="mobile-drawer" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content">
                {children}
            </div>
            <div className="drawer-side z-50">
                {/* Blur overlay using drawer-overlay */}
                <label htmlFor="mobile-drawer" className="drawer-overlay"></label>
                <div className="menu p-4 w-80 min-h-full bg-base-100 text-base-content">
                    {/* Logo in drawer */}
                    <div className="mb-4 flex items-center gap-3 px-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-content" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <span className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            VolunteerHub
                        </span>
                    </div>

                    {status === 'loading' && (
                        <div className="space-y-2 px-4">
                            <div className="skeleton h-10 w-full"></div>
                            <div className="skeleton h-10 w-full"></div>
                            <div className="skeleton h-10 w-full"></div>
                        </div>
                    )}

                    {status === 'authenticated' && session?.user && (
                        <>
                            {/* User info */}
                            <div className="bg-base-200 rounded-lg p-4 mb-4 flex items-center gap-3">
                                <div className="avatar placeholder">
                                    <div className="bg-primary text-primary-content rounded-full w-12 flex items-center justify-center">
                                        <span className="text-lg">
                                            {session.user.name?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="font-semibold truncate">{session.user.name || 'Người dùng'}</p>
                                    <p className="text-xs text-base-content/60 truncate">{session.user.email}</p>
                                </div>
                            </div>

                            <ul className="space-y-1">
                                {/* Home */}
                                <li>
                                    <Link
                                        href="/"
                                        className={`gap-3 ${isActive('/') ? 'active' : ''}`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                        </svg>
                                        Trang chủ
                                    </Link>
                                </li>

                                {/* Dashboard */}
                                <li>
                                    <Link
                                        href="/dashboard"
                                        className={`gap-3 ${isActive('/dashboard') ? 'active' : ''}`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        Bảng tin
                                    </Link>
                                </li>

                                {/* Volunteer links */}
                                {userRole === 'VOLUNTEER' && (
                                    <li>
                                        <Link
                                            href="/registered-events"
                                            className={`gap-3 ${isActive('/registered-events') ? 'active' : ''}`}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                            </svg>
                                            Sự kiện đã đăng ký
                                        </Link>
                                    </li>
                                )}

                                {/* Manager/Admin links */}
                                {(userRole === 'EVENT_MANAGER' || userRole === 'ADMIN') && (
                                    <>
                                        <li>
                                            <Link
                                                href="/created-events"
                                                className={`gap-3 ${isActive('/created-events') ? 'active' : ''}`}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                Sự kiện đã tạo
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                href="/events/create"
                                                className={`gap-3 btn btn-primary btn-sm justify-start ${isActive('/events/create') ? 'btn-active' : ''}`}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                                Tạo sự kiện
                                            </Link>
                                        </li>
                                    </>
                                )}

                                {/* Admin Panel */}
                                {userRole === 'ADMIN' && (
                                    <li>
                                        <Link
                                            href="/admin/event-approval"
                                            className={`gap-3 btn btn-secondary btn-sm justify-start ${isActive('/admin/event-approval') ? 'btn-active' : ''}`}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                            Admin Panel
                                        </Link>
                                    </li>
                                )}

                                <div className="divider"></div>

                                {/* Profile */}
                                <li>
                                    <Link
                                        href="/profile"
                                        className={`gap-3 ${isActive('/profile') ? 'active' : ''}`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Hồ sơ cá nhân
                                    </Link>
                                </li>

                                {/* Logout */}
                                <li>
                                    <button
                                        onClick={() => signOut({ callbackUrl: '/login' })}
                                        className="gap-3 text-error"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Đăng xuất
                                    </button>
                                </li>
                            </ul>
                        </>
                    )}

                    {status === 'unauthenticated' && (
                        <ul className="space-y-2">
                            <li>
                                <Link href="/" className={`gap-3 ${isActive('/') ? 'active' : ''}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    Trang chủ
                                </Link>
                            </li>
                            <div className="divider"></div>
                            <li>
                                <Link href="/login" className="btn btn-ghost justify-start gap-3">
                                    Đăng nhập
                                </Link>
                            </li>
                            <li>
                                <Link href="/register" className="btn btn-primary justify-start gap-3">
                                    Đăng ký
                                </Link>
                            </li>
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};