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
                {sessions.map((session) => {
                    const isFull =
                        session.status === 'FULL' || session.currentNum >= session.capacity;
                    const isSelected = selectedSessionId === session.sessionId;

                    return (
                        <button
                            key={session.sessionId}
                            disabled={isFull}
                            onClick={() => onSelect(session.sessionId)}
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
                                    {session.date}
                                </div>
                                <div className="text-xs text-[#8B95A1] mt-0.5">
                                    {session.startTime.slice(0, 5)} ~{' '}
                                    {session.endTime.slice(0, 5)}
                                </div>
                            </div>
                            <div
                                className={`text-[10px] font-bold px-2 py-1 rounded ${isSelected
                                        ? 'bg-[#3182F6] text-white'
                                        : 'bg-[#F2F4F6] text-[#6B7684]'
                                    }`}
                            >
                                {isFull ? '마감' : `${session.currentNum}/${session.capacity}명`}
                            </div>
                        </button>
                    );
                })}
            </div>
        </section>
    );
};
