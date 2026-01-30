import React, { useState, useRef } from 'react';
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
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const carouselRef = useRef<HTMLDivElement>(null);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const scrollLeft = e.currentTarget.scrollLeft;
        const width = e.currentTarget.clientWidth;
        const index = Math.round(scrollLeft / width);
        setCurrentImageIndex(index);
    };

    const goToImage = (index: number) => {
        if (!carouselRef.current) return;
        const width = carouselRef.current.clientWidth;
        carouselRef.current.scrollTo({ left: width * index, behavior: 'smooth' });
    };

    const handlePrev = () => {
        if (currentImageIndex > 0) goToImage(currentImageIndex - 1);
    };

    const handleNext = () => {
        if (currentImageIndex < classDetail.images.length - 1) goToImage(currentImageIndex + 1);
    };

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Image Carousel */}
            {classDetail.images && classDetail.images.length > 0 && (
                <div className="relative w-full h-64 bg-gray-200 group">
                    <div
                        ref={carouselRef}
                        className="w-full h-full overflow-x-auto flex snap-x snap-mandatory scrollbar-hide"
                        onScroll={handleScroll}
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {classDetail.images.map((img, idx) => (
                            <img
                                key={idx}
                                src={img}
                                alt={`${classDetail.title} - ${idx + 1}`}
                                className="min-w-full h-full object-cover shrink-0 snap-center"
                            />
                        ))}
                    </div>
                    {/* Navigation Arrows */}
                    {classDetail.images.length > 1 && (
                        <>
                            <button
                                onClick={handlePrev}
                                className={`absolute left-2 top-1/2 -translate-y-1/2 p-2 transition-opacity ${currentImageIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-60 hover:opacity-100'}`}
                            >
                                <span className="text-white text-3xl font-light drop-shadow-lg">‹</span>
                            </button>
                            <button
                                onClick={handleNext}
                                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 transition-opacity ${currentImageIndex === classDetail.images.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-60 hover:opacity-100'}`}
                            >
                                <span className="text-white text-3xl font-light drop-shadow-lg">›</span>
                            </button>
                        </>
                    )}
                    {/* Image Counter */}
                    <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm font-medium">
                        {currentImageIndex + 1} / {classDetail.images.length}
                    </div>
                </div>
            )}

            {showHeader && (
                <div className="px-6">
                    <span className="inline-block px-2 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded mb-2">
                        원데이 클래스
                    </span>
                    <h1 className="text-xl font-bold text-[#191F28] leading-snug mb-3">
                        {classDetail.title}
                    </h1>

                    <div className="flex items-start gap-1.5 text-sm text-[#4E5968]">
                        <span className="shrink-0">📍</span>
                        <div>
                            <a
                                href={`https://map.naver.com/v5/search/${encodeURIComponent(classDetail.location)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#4E5968] underline underline-offset-2 decoration-gray-300 hover:text-blue-600 hover:decoration-blue-600 transition-colors"
                            >
                                {classDetail.location}
                            </a>
                            {classDetail.locationDescription && (
                                <p className="text-xs text-[#8B95A1] mt-1">{classDetail.locationDescription}</p>
                            )}
                        </div>
                    </div>

                    {/* 주소 아래 구분선 */}
                    <div className="h-px bg-gray-100 mt-4 mb-6" />
                </div>
            )}

            {/* Detailed Info Sections */}
            <div className="px-6 pb-8 space-y-8">
                {/* Description */}
                <div>
                    <h3 className="font-bold text-[#191F28] text-base mb-3">클래스 소개</h3>
                    <p className="text-[#4E5968] text-sm leading-relaxed whitespace-pre-wrap">
                        {classDetail.description}
                    </p>
                </div>

                <div className="bg-[#F9FAFB] rounded-xl p-4 text-sm text-[#4E5968] space-y-3">
                    {(classDetail.material ||
                        classDetail.guidelines ||
                        classDetail.parkingInfo ||
                        classDetail.policy) && (
                            <div className="space-y-2 text-xs">
                                {classDetail.material && (
                                    <div className="flex gap-2">
                                        <span className="font-bold text-[#8B95A1] shrink-0">준비물</span>
                                        <span className="whitespace-pre-wrap">{classDetail.material}</span>
                                    </div>
                                )}

                                {classDetail.guidelines && (
                                    <div className="flex gap-2">
                                        <span className="font-bold text-[#8B95A1] shrink-0">안내사항</span>
                                        <span className="whitespace-pre-wrap">{classDetail.guidelines}</span>
                                    </div>
                                )}

                                {classDetail.parkingInfo && (
                                    <div className="flex gap-2">
                                        <span className="font-bold text-[#8B95A1] shrink-0">주차</span>
                                        <span className="whitespace-pre-wrap">{classDetail.parkingInfo}</span>
                                    </div>
                                )}

                                {classDetail.policy && (
                                    <div className="flex gap-2">
                                        <span className="font-bold text-[#8B95A1] shrink-0">취소/환불</span>
                                        <span className="whitespace-pre-wrap">{classDetail.policy}</span>
                                    </div>
                                )}
                            </div>
                        )}
                </div>
            </div>
        </div>
    );
};
