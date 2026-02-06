import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface HeaderProps {
    title: string;
    showBack?: boolean;
    onBack?: () => void;
    rightAction?: React.ReactNode;
    className?: string; // Add className prop for flexibility
}

export const Header: React.FC<HeaderProps> = ({
    title,
    showBack = false,
    onBack,
    rightAction,
    className = ''
}) => {
    const router = useRouter();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    };

    return (
        <div className={`sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-gray-100 px-4 py-3 flex items-center relative ${className}`}>
            {showBack && (
                <button
                    onClick={handleBack}
                    className="text-2xl text-[#191F28] absolute left-4 z-20"
                    aria-label="Go back"
                >
                    ←
                </button>
            )}
            <span className="font-bold text-[#191F28] text-sm mx-auto z-10">
                {title}
            </span>
            {rightAction && (
                <div className="absolute right-4 z-20">
                    {rightAction}
                </div>
            )}
        </div>
    );
};
