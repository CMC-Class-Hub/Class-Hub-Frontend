import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
    return (
        <div className={className}>
            {label && (
                <label className="block text-xs font-bold text-[#8B95A1] mb-1">
                    {label}
                </label>
            )}
            <input
                className="w-full p-3.5 bg-[#F9FAFB] rounded-xl text-[#191F28] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3182F6] border border-transparent"
                {...props}
            />
        </div>
    );
};
