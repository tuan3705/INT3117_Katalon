// Renders the "forgot password" form and handles the reset request.
// app/(auth)/forgot-password/page.tsx

'use client';

import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import AuthContainer from '@/components/auth/AuthContainer';
import AuthInput from '@/components/auth/AuthInput';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setIsSubmitted(false);

        try {
            await axios.post('/api/auth/forgot-password', { email });
            setIsSubmitted(true);
        } catch (error) {
            console.error("Forgot password error:", error);
            setIsSubmitted(true); // Still show success UI
        } finally {
            setIsLoading(false);
        }
    };

    // After submit
    if (isSubmitted) {
        return (
            <AuthContainer title="Kiểm tra email của bạn" subtitle="">
                <div className="text-center py-6">
                    <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Email đã được gửi!</h3>
                    <p className="text-base-content/60 mb-2">
                        Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email:
                    </p>
                    <p className="font-semibold text-primary mb-6">{email}</p>
                    <div className="alert text-sm mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Không nhận được email? Kiểm tra thư mục spam hoặc thử lại sau vài phút.</span>
                    </div>
                    <Link href="/login" className="btn btn-outline gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Quay lại đăng nhập
                    </Link>
                </div>
            </AuthContainer>
        );
    }

    // Main form
    return (
        <AuthContainer title="Quên mật khẩu?" subtitle="Nhập email của bạn để nhận link đặt lại mật khẩu">
            <form onSubmit={handleSubmit} className="space-y-4">
                <AuthInput
                    id="email"
                    name="email"
                    type="email"
                    label="Địa chỉ Email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="@gmail.com"
                />

                <div className="alert text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Chúng tôi sẽ gửi link đặt lại mật khẩu đến email này nếu tài khoản tồn tại.</span>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-primary w-full mt-6 gap-2"
                >
                    {isLoading ? (
                        <>
                            <span className="loading loading-spinner loading-sm"></span>
                            Đang gửi...
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Gửi link khôi phục
                        </>
                    )}
                </button>
            </form>

            <div className="divider text-base-content/50"></div>

            <div className="text-center">
                <Link href="/login" className="btn btn-ghost btn-sm gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Quay lại đăng nhập
                </Link>
            </div>
        </AuthContainer>
    );
}