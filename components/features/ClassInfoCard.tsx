import React, { useState, useRef } from 'react';
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


    return (
        <div className={`space-y-0 ${className}`}>
            {/* Representative Image Carousel (Simple 1st image for now) */}
            {classDetail.imageUrls && classDetail.imageUrls.length > 0 && (
                <div className="w-full h-80 relative bg-gray-100 overflow-hidden">
                    <img
                        src={classDetail.imageUrls[0]}
                        alt={classDetail.name || '클래스 이미지'}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
            )}

            <div className="px-5 pt-8 pb-4">
                {showHeader && (
                    <div className="space-y-4">
                        <div>
                            <span className="inline-block px-2.5 py-1 bg-[#E8F3FF] text-[#3182F6] text-[11px] font-bold rounded-md">
                                원데이 클래스
                            </span>
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
                            {classDetail.locationDescription && (
                                <p className="text-[#8B95A1] text-xs ml-7 leading-relaxed">
                                    {classDetail.locationDescription}
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
                                    <span className="text-[#4E5968] text-xs leading-relaxed">{classDetail.preparation}</span>
                                </div>
                            )}

                            {classDetail.parkingInfo && (
                                <div className="flex gap-4">
                                    <span className="font-semibold text-[#8B95A1] text-xs shrink-0 w-14">주차 정보</span>
                                    <span className="text-[#4E5968] text-xs leading-relaxed">{classDetail.parkingInfo}</span>
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
                {classDetail.policy && (
                    <div className="mt-10 pt-8 border-t border-gray-100">
                        <h3 className="font-bold text-[#191F28] text-base mb-4 flex items-center gap-2">
                            <span className="text-lg">🛡️</span> 취소 및 환불 정책
                        </h3>
                        <div className="bg-[#FFF8F8] rounded-xl p-4 border border-[#FFEAEA]">
                            <p className="text-[#F04452] text-xs leading-relaxed whitespace-pre-wrap font-medium">
                                {classDetail.policy}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
