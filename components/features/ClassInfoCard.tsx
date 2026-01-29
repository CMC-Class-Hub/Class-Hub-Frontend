import React from 'react';
import { ClassDetailResponse } from '@/lib/api';

interface ClassInfoCardProps {
    classDetail: ClassDetailResponse;
    showHeader?: boolean; // Option to hide title/location if used in header context
    className?: string;
}

export const ClassInfoCard: React.FC<ClassInfoCardProps> = ({
    classDetail,
    showHeader = true,
    className = ''
}) => {
    return (
        <div className={`space-y-6 ${className}`}>
            {/* Representative Image */}
            {classDetail.imageUrl && (
                <div className="w-full h-64 relative bg-gray-200">
                    <img
                        src={classDetail.imageUrl}
                        alt={classDetail.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            {showHeader && (
                <div className="px-5">
                    <span className="inline-block px-2 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded mb-2">
                        원데이 클래스
                    </span>
                    <h1 className="text-xl font-bold text-[#191F28] leading-snug mb-2">
                        {classDetail.title}
                    </h1>
                    <p className="text-[#8B95A1] text-sm flex items-center gap-1">
                        📍 {classDetail.location}
                    </p>
                </div>
            )}

            {/* Description & Details */}
            <div className="px-5">
                <div className="h-px bg-gray-100 mb-6" />
                <h3 className="font-bold text-[#191F28] text-base mb-4">상세 정보</h3>
                <div className="bg-[#F9FAFB] rounded-xl p-4 text-sm text-[#4E5968] space-y-3">
                    <p className="leading-relaxed whitespace-pre-wrap">{classDetail.description}</p>
                    {(classDetail.material || classDetail.parkingInfo) && (
                        <div className="pt-3 border-t border-gray-200 space-y-2 text-xs">
                            {classDetail.material && (
                                <div className="flex gap-2">
                                    <span className="font-bold text-[#8B95A1] shrink-0">준비물</span>
                                    <span>{classDetail.material}</span>
                                </div>
                            )}
                            {classDetail.parkingInfo && (
                                <div className="flex gap-2">
                                    <span className="font-bold text-[#8B95A1] shrink-0">주차</span>
                                    <span>{classDetail.parkingInfo}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
