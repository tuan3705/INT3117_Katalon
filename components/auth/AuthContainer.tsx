// Shared authentication container component with modern design
// src/components/auth/AuthContainer.tsx

import { ReactNode } from 'react';

interface AuthContainerProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
}

export default function AuthContainer({ children, title, subtitle }: AuthContainerProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10 p-4">
            {/* Decorative background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="relative w-full max-w-md">
                {/* Glass-morphism card */}
                <div className="card bg-base-100/80 backdrop-blur-xl shadow-2xl border border-base-300/50">
                    <div className="card-body">
                        {/* Logo/Brand Section */}
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-4 shadow-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-content" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                {title}
                            </h1>
                            {subtitle && (
                                <p className="text-base-content/60 mt-2">{subtitle}</p>
                            )}
                        </div>

                        {/* Content */}
                        {children}
                    </div>
                </div>

                {/* Footer text */}
                <p className="text-center text-sm text-base-content/50 mt-6">
                    © 2025 VolunteerHub. Nền tảng kết nối tình nguyện viên.
                </p>
            </div>
        </div>
    );
}