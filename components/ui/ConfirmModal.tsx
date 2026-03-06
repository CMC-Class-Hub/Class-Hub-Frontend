import React from 'react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: 'default' | 'danger';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    description,
    confirmText = '확인',
    cancelText = '취소',
    onConfirm,
    onCancel,
    variant = 'default',
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* 백드롭 */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* 모달 */}
            <div className="relative bg-white rounded-3xl w-full max-w-[320px] p-6 border border-[#E5E8EB] shadow-xl animate-in fade-in zoom-in-95 duration-200">
                {/* 닫기 버튼 */}
                <button
                    onClick={onCancel}
                    className="absolute top-5 right-5 p-1 rounded-xl text-[#8B95A1] hover:bg-[#F2F4F6] hover:text-[#191F28] transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h3 className="text-xl font-bold text-[#191F28] text-left pr-8">
                    {title}
                </h3>

                {description && (
                    <p className="mt-2 text-sm text-[#8B95A1] text-left leading-relaxed">
                        {description}
                    </p>
                )}

                <div className="mt-6 flex gap-2">
                    {cancelText && (
                        <button
                            onClick={onCancel}
                            className="flex-1 py-3 rounded-xl font-bold text-sm bg-[#F2F4F6] text-[#6B7684] hover:bg-[#E5E8EB] transition-colors"
                        >
                            {cancelText}
                        </button>
                    )}
                    <button
                        onClick={onConfirm}
                        className={`flex-1 py-3 rounded-xl font-bold text-sm transition-colors ${cancelText ? 'w-auto' : 'w-full'
                            } ${variant === 'danger'
                                ? 'bg-[#F04452] text-white hover:bg-[#E03440]'
                                : 'bg-[#3182F6] text-white hover:bg-[#1B64DA]'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};
