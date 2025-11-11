// Renders the password reset form and handles submission.
// app/(auth)/reset-password/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios, { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import Link from 'next/link';
import AuthContainer from '@/components/auth/AuthContainer';
import AuthInput from '@/components/auth/AuthInput';

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Check for token existence on page load
    useEffect(() => {
        if (!token) {
            toast.error('Đường dẫn không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu link mới.');
            router.push('/forgot-password');
        }
    }, [token, router]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp.');
            return;
        }
        if (!token) {
            toast.error('Token không hợp lệ.');
            return;
        }

        setIsLoading(true);
        try {
            await axios.post('/api/auth/reset-password', {
                token: token,
                password: formData.password,
            });
            setIsSuccess(true);
        } catch (error) {
            if (isAxiosError(error)) {
                // Extract the message if it's an object, otherwise use the data as-is
                const errorData = error.response?.data;
                const errorMessage = typeof errorData === 'object' && errorData?.message
                    ? errorData.message
                    : typeof errorData === 'string'
                        ? errorData
                        : 'Đặt lại mật khẩu thất bại.';
                toast.error(errorMessage);
            } else {
                toast.error('Đã có lỗi không mong muốn xảy ra.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Success state
    if (isSuccess) {
        return (
            <AuthContainer title="Thành công!" subtitle="">
                <div className="text-center py-6">
                    <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Mật khẩu đã được cập nhật</h3>
                    <p className="text-base-content/60 mb-6">
                        Bạn có thể đăng nhập với mật khẩu mới của mình ngay bây giờ.
                    </p>
                    <Link href="/login" className="btn btn-primary gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        Đi đến trang đăng nhập
                    </Link>
                </div>
            </AuthContainer>
        );
    }


    // Main form
    return (
        <AuthContainer title="Đặt lại mật khẩu" subtitle="Tạo mật khẩu mới cho tài khoản của bạn">
            <form onSubmit={handleSubmit} className="space-y-4">
                <AuthInput
                    id="password"
                    name="password"
                    type="password"
                    label="Mật khẩu mới"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                />

                <AuthInput
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    label="Xác nhận mật khẩu mới"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                />

                <div className="alert text-sm mt-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-xs">
                        <p className="font-semibold mb-1">Yêu cầu mật khẩu:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Ít nhất 8 ký tự</li>
                            <li>Có chữ hoa (A-Z)</li>
                            <li>Có chữ thường (a-z)</li>
                            <li>Có số (0-9)</li>
                            <li>Có ký tự đặc biệt (@$!%*?&#)</li>
                        </ul>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-primary w-full mt-6 gap-2"
                >
                    {isLoading ? (
                        <>
                            <span className="loading loading-spinner loading-sm"></span>
                            Đang lưu...
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Lưu mật khẩu mới
                        </>
                    )}
                </button>
            </form>
        </AuthContainer>
    );
}