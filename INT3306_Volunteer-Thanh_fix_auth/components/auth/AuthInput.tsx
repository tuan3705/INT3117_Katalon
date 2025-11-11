// Reusable input component for auth forms
// src/components/auth/AuthInput.tsx

import { InputHTMLAttributes, ReactNode } from 'react';

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon?: ReactNode;
    error?: string;
    rightLabel?: ReactNode;
}

export default function AuthInput({ label, icon, error, rightLabel, className = '', ...props }: AuthInputProps) {
    return (
        <div className="form-control w-full">
            <label className="label justify-between w-full">
                <span className="label-text font-medium">{label}</span>
                {rightLabel && <span className="label-text-alt">{rightLabel}</span>}
            </label>
            <div className="relative">
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/40">
                        {icon}
                    </div>
                )}
                <input
                    className={`input input-bordered mt-1 w-full transition-all duration-200 focus:input-primary ${icon ? 'pl-10' : ''} ${error ? 'input-error' : ''} ${className}`}
                    {...props}
                />
            </div>
            {error && (
                <label className="label">
                    <span className="label-text-alt text-error">{error}</span>
                </label>
            )}
        </div>
    );
}