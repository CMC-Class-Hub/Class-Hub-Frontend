import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    fullWidth = false,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyles = "py-3.5 rounded-xl font-bold text-base transition-all active:scale-[0.98] flex items-center justify-center";
    const widthStyle = fullWidth ? "w-full" : "";

    let variantStyles = "";
    if (disabled) {
        variantStyles = "bg-[#E5E8EB] text-[#B0B8C1] cursor-not-allowed";
    } else {
        switch (variant) {
            case 'primary':
                variantStyles = "bg-[#3182F6] text-white hover:bg-[#1B64DA] shadow-lg shadow-blue-100";
                break;
            case 'secondary':
                variantStyles = "bg-white border border-[#E5E8EB] text-[#333D4B] hover:bg-gray-50";
                break;
            case 'danger':
                variantStyles = "bg-white border border-[#E5E8EB] text-red-500 hover:bg-red-50";
                break;
        }
    }

    return (
        <button
            className={`${baseStyles} ${widthStyle} ${variantStyles} ${className}`}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};
