import React, { useState } from 'react';
import { ClassDetailResponse } from '@/lib/api';

interface ClassInfoCardProps {
    classDetail: ClassDetailResponse;
    showHeader?: boolean;
    className?: string;
}

export const ClassInfoCard: React.FC<ClassInfoCardProps> = ({
    classDetail,
    showHeader = true,
    className = ''
}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const images = classDetail.imageUrls || [];
    const hasMultipleImages = images.length > 1;

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) =>
            prev === 0 ? images.length - 1 : prev - 1
        );
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prev) =>
            prev === images.length - 1 ? 0 : prev + 1
        );
    };

    return (
        <div className={`space-y-0 ${className}`}>
            {/* Representative Image Carousel */}
            {images.length > 0 && (
                <div className="w-full h-80 relative bg-gray-100 overflow-hidden">
                    <img
                        src={images[currentImageIndex]}
                        alt={classDetail.name || '클래스 이미지'}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                    {/* 이미지 네비게이션 - 이미지가 2개 이상일 때만 표시 */}
                    {hasMultipleImages && (
                        <>
                            {/* 이전 버튼 */}
                            <button
                                onClick={handlePrevImage}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors z-10"
                                aria-label="이전 이미지"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                            {/* 다음 버튼 */}
                            <button
                                onClick={handleNextImage}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors z-10"
                                aria-label="다음 이미지"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>

                            {/* 인디케이터 점들 */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                                {images.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`w-2 h-2 rounded-full transition-all ${index === currentImageIndex
                                            ? 'bg-white w-6'
                                            : 'bg-white/60'
                                            }`}
                                        aria-label={`이미지 ${index + 1}로 이동`}
                                    />
                                ))}
                            </div>

                            {/* 이미지 카운터 */}
                            <div className="absolute top-4 right-4 bg-black/60 text-white text-sm px-3 py-1.5 rounded-full z-10">
                                {currentImageIndex + 1} / {images.length}
                            </div>
                        </>
                    )}
                </div>
            )}

            <div className="px-5 pt-8 pb-4">
                {showHeader && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="inline-block px-2.5 py-1 bg-[#E8F3FF] text-[#3182F6] text-[11px] font-bold rounded-md">
                                원데이 클래스
                            </span>

                            {classDetail.instructorProfileUrl && (
                                <a
                                    href={classDetail.instructorProfileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1.5 bg-white border border-[#F2F4F6] text-[#4E5968] text-[11px] font-bold rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.08)] hover:bg-[#F9FAFB] transition-all flex items-center gap-2 group"
                                >
                                    <span className="w-1.5 h-1.5 bg-[#3182F6] rounded-full animate-pulse" />
                                    {classDetail.instructorName ? `${classDetail.instructorName} 강사님` : '강사'} 프로필
                                    <svg className="w-2.5 h-2.5 text-[#8B95A1] group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                    </svg>
                                </a>
                            )}
                        </div>

                        <h1 className="text-2xl font-bold text-[#191F28] leading-snug">
                            {classDetail.name || `클래스 #${classDetail.id}`}
                        </h1>

                        <div className="space-y-1.5 pt-1">
                            {classDetail.location && (
                                <p className="text-[#4E5968] text-[15px] flex items-center gap-1.5 font-medium">
                                    <span className="text-lg">📍</span> {classDetail.location}
                                </p>
                            )}
                            {classDetail.locationDetails && (
                                <p className="text-[#8B95A1] text-xs ml-7 leading-relaxed whitespace-pre-wrap">
                                    {classDetail.locationDetails}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* 상세 설명 */}
                <div className="mt-8 space-y-4">
                    <h3 className="font-bold text-[#191F28] text-lg">💡 클래스 소개</h3>
                    <div className="text-[15px] text-[#4E5968] leading-relaxed whitespace-pre-wrap">
                        {classDetail.description || '상세 설명이 등록되지 않았습니다.'}
                    </div>
                </div>

                {/* 핵심 정보 카드 */}
                <div className="mt-8 grid grid-cols-1 gap-4">
                    <div className="bg-[#F9FAFB] rounded-2xl p-5 space-y-4 shadow-sm border border-gray-50">
                        <h4 className="font-bold text-[#333D4B] text-sm flex items-center gap-2">
                            📋 확인해 주세요
                        </h4>

                        <div className="space-y-3.5 pt-1">
                            {classDetail.preparation && (
                                <div className="flex gap-4">
                                    <span className="font-semibold text-[#8B95A1] text-xs shrink-0 w-14">준비물</span>
                                    <span className="text-[#4E5968] text-xs leading-relaxed whitespace-pre-wrap">{classDetail.preparation}</span>
                                </div>
                            )}

                            {classDetail.parkingInfo && (
                                <div className="flex gap-4">
                                    <span className="font-semibold text-[#8B95A1] text-xs shrink-0 w-14">주차 정보</span>
                                    <span className="text-[#4E5968] text-xs leading-relaxed whitespace-pre-wrap">{classDetail.parkingInfo}</span>
                                </div>
                            )}

                            {classDetail.instructions && (
                                <div className="flex gap-4">
                                    <span className="font-semibold text-[#8B95A1] text-xs shrink-0 w-14">안내사항</span>
                                    <span className="text-[#4E5968] text-xs leading-relaxed whitespace-pre-wrap">{classDetail.instructions}</span>
                                </div>
                            )}

                            {classDetail.guidelines && (
                                <div className="flex gap-4">
                                    <span className="font-semibold text-[#8B95A1] text-xs shrink-0 w-14">유의 사항</span>
                                    <span className="text-[#4E5968] text-xs leading-relaxed whitespace-pre-wrap">{classDetail.guidelines}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 취소 및 환불 정책 */}
                {(classDetail.cancellationPolicy || classDetail.policy) && (
                    <div className="mt-10 pt-8 border-t border-gray-100">
                        <h3 className="font-bold text-[#191F28] text-base mb-4 flex items-center gap-2">
                            <span className="text-lg">🛡️</span> 취소 및 환불 정책
                        </h3>
                        <div className="bg-[#FFF8F8] rounded-xl p-4 border border-[#FFEAEA]">
                            <p className="text-[#F04452] text-xs leading-relaxed whitespace-pre-wrap font-medium">
                                {classDetail.cancellationPolicy || classDetail.policy}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};