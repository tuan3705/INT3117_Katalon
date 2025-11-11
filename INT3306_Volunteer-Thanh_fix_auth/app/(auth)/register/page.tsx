// Renders the user registration form and handles client-side logic.
// app/(auth)/register/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios, { isAxiosError } from 'axios';
import toast from 'react-hot-toast';            // show state popup
import AuthContainer from '@/components/auth/AuthContainer';
import AuthInput from '@/components/auth/AuthInput';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // press the submit button
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // prevent form loading the page
        setIsLoading(true);

        try {
            await axios.post('/api/auth/register', formData);

            toast.success('Đăng ký thành công!');
            router.push('/login');

        } catch (error) {
            if (isAxiosError(error)) {
                toast.error(error.response?.data || 'Lỗi từ server.');
            } else {
                toast.error('Đã có lỗi không mong muốn xảy ra.');
                console.error(error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContainer title="Tạo tài khoản mới" subtitle="Tham gia cộng đồng tình nguyện viên VolunteerHub">
            <form onSubmit={handleSubmit} className="space-y-4">
                <AuthInput
                    id="name"
                    name="name"
                    type="text"
                    label="Họ và tên"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nguyễn Văn A"
                />

                <AuthInput
                    id="email"
                    name="email"
                    type="email"
                    label="Địa chỉ Email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="@gmail.com"
                />

                <AuthInput
                    id="password"
                    name="password"
                    type="password"
                    label="Mật khẩu"
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                />

                <div className="form-control mt-2">
                    <label className="label cursor-pointer justify-start gap-3">
                        <input type="checkbox" required className="checkbox checkbox-primary checkbox-sm" />
                        <span className="label-text text-xs">
                            Tôi đồng ý với{' '}
                            <Link href="/terms" className="link link-primary no-underline hover:underline">
                                Điều khoản dịch vụ
                            </Link>{' '}
                            và{' '}
                            <Link href="/privacy" className="link link-primary no-underline hover:underline">
                                Chính sách bảo mật
                            </Link>
                        </span>
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-primary w-full mt-6 gap-2"
                >
                    {isLoading ? (
                        <>
                            <span className="loading loading-spinner loading-sm"></span>
                            Đang tạo tài khoản...
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            Tạo tài khoản
                        </>
                    )}
                </button>
            </form>

            <div className="divider text-base-content/50">HOẶC</div>

            <div className="text-center">
                <p className="text-sm text-base-content/70">
                    Đã có tài khoản?{' '}
                    <Link href="/login" className="link link-primary font-semibold no-underline hover:underline">
                        Đăng nhập ngay
                    </Link>
                </p>
            </div>
        </AuthContainer>
    );
}