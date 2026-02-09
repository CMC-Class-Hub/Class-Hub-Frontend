import React, { useState, useMemo } from 'react';
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
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    // 세션을 날짜별로 그룹화
    const sessionsByDate = useMemo(() => {
        const grouped: Record<string, typeof sessions> = {};
        (sessions ?? []).forEach((session) => {
            const date = session.date || '';
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(session);
        });
        return grouped;
    }, [sessions]);

    // 달력 생성
    const calendar = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - startDate.getDay());
        
        const weeks: Date[][] = [];
        let currentWeek: Date[] = [];
        const endDate = new Date(lastDay);
        endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            currentWeek.push(new Date(d));
            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
        }

        return weeks;
    }, [currentMonth]);

    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const changeMonth = (increment: number) => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + increment, 1));
        setSelectedDate(null);
    };

    const handleDateClick = (date: Date) => {
        const dateStr = formatDate(date);
        if (sessionsByDate[dateStr]) {
            setSelectedDate(dateStr);
        }
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return formatDate(date) === formatDate(today);
    };

    const isCurrentMonth = (date: Date) => {
        return date.getMonth() === currentMonth.getMonth();
    };

    const hasSession = (date: Date) => {
        return !!sessionsByDate[formatDate(date)];
    };

    const selectedDateSessions = selectedDate ? sessionsByDate[selectedDate] || [] : [];

    return (
        <section className="px-5">
            <h3 className="font-bold text-[#191F28] mb-3 text-base">📅 일정 선택</h3>
            
            {/* 월 선택 헤더 */}
            <div className="flex items-center justify-center mb-4 gap-4">
                <button
                    onClick={() => changeMonth(-1)}
                    className="text-gray-600 hover:text-gray-900 p-2"
                >
                    ←
                </button>
                <div className="font-bold text-lg">
                    {currentMonth.getFullYear()}.{String(currentMonth.getMonth() + 1).padStart(2, '0')}
                </div>
                <button
                    onClick={() => changeMonth(1)}
                    className="text-gray-600 hover:text-gray-900 p-2"
                >
                    →
                </button>
            </div>

            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
                    <div
                        key={day}
                        className={`text-center text-xs font-medium py-2 ${
                            idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : 'text-gray-600'
                        }`}
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* 달력 그리드 */}
            <div className="mb-4">
                {calendar.map((week, weekIdx) => (
                    <div key={weekIdx} className="grid grid-cols-7 gap-1">
                        {week.map((date, dayIdx) => {
                            const dateStr = formatDate(date);
                            const hasSessions = hasSession(date);
                            const isCurrent = isCurrentMonth(date);
                            const today = isToday(date);
                            const isSelected = selectedDate === dateStr;

                            return (
                                <button
                                    key={dateStr}
                                    onClick={() => handleDateClick(date)}
                                    disabled={!hasSessions}
                                    className={`
                                        relative aspect-square p-1 rounded-lg text-sm transition-all
                                        ${!isCurrent ? 'text-gray-300' : ''}
                                        ${dayIdx === 0 && isCurrent ? 'text-red-500' : ''}
                                        ${dayIdx === 6 && isCurrent ? 'text-blue-500' : ''}
                                        ${today && !isSelected ? 'bg-blue-50 font-bold' : ''}
                                        ${isSelected ? 'bg-[#3182F6] text-white font-bold ring-2 ring-[#3182F6]' : ''}
                                        ${hasSessions && !isSelected ? 'hover:bg-gray-100 cursor-pointer' : ''}
                                        ${!hasSessions ? 'cursor-not-allowed' : ''}
                                    `}
                                >
                                    <div className="flex flex-col items-center justify-center h-full">
                                        <span>{date.getDate()}</span>
                                        {hasSessions && !isSelected && (
                                            <div className="absolute bottom-1 w-1 h-1 rounded-full bg-[#3182F6]" />
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* 선택된 날짜의 세션 목록 */}
            {selectedDate && (
                <div className="mt-4">
                    <div className="text-sm font-bold text-[#191F28] mb-3">
                        회차를 선택해세요.
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                        {selectedDateSessions.map((session) => {
                            const currentNum = session.currentNum ?? 0;
                            const capacity = session.capacity ?? 0;
                            const startTime = session.startTime ?? '';
                            const endTime = session.endTime ?? '';

                            const isClosed = session.status === 'CLOSED';
                            const isFull = session.status === 'FULL' || currentNum >= capacity;
                            const isDisabled = isClosed || isFull;
                            const isSelected = selectedSessionId === session.id;

                            return (
                                <button
                                    key={session.id}
                                    disabled={isDisabled}
                                    onClick={() => onSelect(session.id)}
                                    className={`p-4 rounded-xl border text-left transition-all flex justify-between items-center ${
                                        isSelected
                                            ? 'border-[#3182F6] bg-[#E8F3FF] ring-1 ring-[#3182F6]'
                                            : 'border-gray-200 bg-white hover:bg-gray-50'
                                    } ${
                                        isDisabled
                                            ? 'opacity-50 grayscale cursor-not-allowed bg-gray-100'
                                            : ''
                                    }`}
                                >
                                    <div>
                                        <div className="text-sm font-bold text-[#333D4B]">
                                            오후 {(startTime || '--:--').slice(0, 5)}
                                        </div>
                                        <div className="text-xs text-[#8B95A1] mt-0.5">
                                            {capacity}명
                                        </div>
                                        {session.price !== undefined && session.price !== null && (
                                            <div className="text-xs font-bold mt-1 text-[#191F28]">
                                                {session.price.toLocaleString()}원
                                            </div>
                                        )}
                                    </div>
                                    <div
                                        className={`text-[10px] font-bold px-2 py-1 rounded ${
                                            isSelected
                                                ? 'bg-[#3182F6] text-white'
                                                : isClosed
                                                ? 'bg-gray-400 text-white'
                                                : isFull
                                                ? 'bg-red-100 text-red-600'
                                                : 'bg-[#F2F4F6] text-[#6B7684]'
                                        }`}
                                    >
                                        {isClosed ? '종료' : isFull ? '마감' : `${currentNum}/${capacity}명`}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </section>
    );
};