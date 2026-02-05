import React from 'react';
import { ClassDetailResponse } from '@/lib/api';

interface SessionSelectorProps {
    sessions: ClassDetailResponse['sessions'];
    selectedSessionId: number | null;
    onSelect: (sessionId: number) => void;
}

export const SessionSelector: React.FC<SessionSelectorProps> = ({
    sessions,
    selectedSessionId,
    onSelect,
}) => {
    return (
        <section className="px-5">
            <h3 className="font-bold text-[#191F28] mb-3 text-base">📅 일정 선택</h3>
            <div className="grid grid-cols-1 gap-2">
                {(sessions ?? []).map((session) => {
                    const currentNum = session.currentNum ?? 0;
                    const capacity = session.capacity ?? 0;
                    const startTime = session.startTime ?? '';
                    const endTime = session.endTime ?? '';

                    const isFull =
                        session.status === 'FULL' || currentNum >= capacity;
                    const isSelected = selectedSessionId === session.id;

                    return (
                        <button
                            key={session.id}
                            disabled={isFull}
                            onClick={() => onSelect(session.id)}
                            className={`p-4 rounded-xl border text-left transition-all flex justify-between items-center ${isSelected
                                ? 'border-[#3182F6] bg-[#E8F3FF] ring-1 ring-[#3182F6]'
                                : 'border-gray-200 bg-white hover:bg-gray-50'
                                } ${isFull
                                    ? 'opacity-50 grayscale cursor-not-allowed bg-gray-100'
                                    : ''
                                }`}
                        >
                            <div>
                                <div
                                    className={`font-bold text-sm ${isSelected ? 'text-[#1B64DA]' : 'text-[#333D4B]'
                                        }`}
                                >
                                    {session.date || '날짜 정보 없음'}
                                </div>
                                <div className="text-xs text-[#8B95A1] mt-0.5">
                                    {(startTime || '--:--').slice(0, 5)} ~{' '}
                                    {(endTime || '--:--').slice(0, 5)}
                                </div>
                                {session.price !== undefined && session.price !== null && (
                                    <div className={`text-xs font-bold mt-1 ${isSelected ? 'text-[#3182F6]' : 'text-[#191F28]'}`}>
                                        {session.price.toLocaleString()}원
                                    </div>
                                )}
                            </div>
                            <div
                                className={`text-[10px] font-bold px-2 py-1 rounded ${isSelected
                                    ? 'bg-[#3182F6] text-white'
                                    : 'bg-[#F2F4F6] text-[#6B7684]'
                                    }`}
                            >
                                {isFull ? '마감' : `${currentNum}/${capacity}명`}
                            </div>
                        </button>
                    );
                })}
            </div>
        </section>
    );
};
