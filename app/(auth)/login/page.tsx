// Renders the user login form and handles client-side logic using NextAuth's signIn.
// app/(auth)/login/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import AuthContainer from '@/components/auth/AuthContainer';
import AuthInput from '@/components/auth/AuthInput';

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const error = searchParams.get('error');
        if (error === 'account_locked') {
            toast.error('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
            // delete error from url, not to show again
            router.replace('/login', { scroll: false });
        }
    }, [searchParams, router])

    // update form data whenever user type in input
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // when submit
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!formData.email || !formData.password) {
            setError("Vui lòng nhập đầy đủ email và mật khẩu.");
            return;
        }
        setError("");
        setIsLoading(true);

        try {
            // use singin instead of axios
            const result = await signIn('credentials', {
                ...formData,
                redirect: false, // not change the page automatically
            });

            if (result?.error) {
                toast.error(result.error);
            } else if (result?.ok) {
                toast.success('Đăng nhập thành công!');
                router.push('/');
                router.refresh();
            }
        } catch (error) {
            toast.error(`Đã có lỗi xảy ra: ${error}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContainer title="Chào mừng trở lại" subtitle="Đăng nhập vào tài khoản VolunteerHub của bạn">
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <AuthInput
                    id="email"
                    name="email"
                    type="email"
                    label="Địa chỉ Email"
                    suppressHydrationWarning
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="@gmail.com"
                />

                <AuthInput
                    id="password"
                    name="password"
                    type="password"
                    label="Mật khẩu"
                    suppressHydrationWarning
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    rightLabel={
                        <Link
                            href="/forgot-password"
                            className="link link-primary no-underline hover:underline"
                        >
                            Quên mật khẩu?
                        </Link>
                    }
                />

                {error && <p className="text-error text-sm mb-2">{error}</p>}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-primary w-full mt-6 gap-2"
                >
                    {isLoading ? (
                        <>
                            <span className="loading loading-spinner loading-sm"></span>
                            Đang đăng nhập...
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                            Đăng nhập
                        </>
                    )}
                </button>
            </form>

            <div className="divider text-base-content/50">HOẶC</div>

            <div className="text-center">
                <p className="text-sm text-base-content/70">
                    Chưa có tài khoản?{' '}
                    <Link href="/register" className="link link-primary font-semibold no-underline hover:underline">
                        Đăng ký ngay
                    </Link>
                </p>
            </div>
        </AuthContainer>
    );
}