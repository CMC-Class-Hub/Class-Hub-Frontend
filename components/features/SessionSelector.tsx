import React, { useState, useMemo } from 'react';
import { ClassDetailResponse } from '@/lib/api';
import { Clock, Users, CreditCard } from "lucide-react";

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

    const isPastDate = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    // 해당 날짜에 모집중인 세션이 있는지 확인
    const hasOpenSession = (date: Date) => {
        const dateSessions = sessionsByDate[formatDate(date)] || [];
        return dateSessions.some(session => {
            const isClosed = session.status === 'CLOSED';
            const isFull = session.status === 'FULL' || (session.currentNum ?? 0) >= (session.capacity ?? 0);
            return !isClosed && !isFull;
        });
    };

    // 시간 포맷팅 (HH:mm -> 오전/오후 h:mm)
    const formatTime = (timeStr: string) => {
        if (!timeStr) return '--:--';
        const [hourStr, minuteStr] = timeStr.split(':');
        let hour = parseInt(hourStr, 10);
        const minute = parseInt(minuteStr, 10);

        if (isNaN(hour) || isNaN(minute)) return timeStr.slice(0, 5);

        const ampm = hour >= 12 ? '오후' : '오전';
        hour = hour % 12;
        hour = hour ? hour : 12; // 0시는 12시로 표시

        const paddedHour = String(hour).padStart(2, '0');
        const paddedMinute = String(minute).padStart(2, '0');

        return `${ampm} ${paddedHour}:${paddedMinute}`;
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
                        className={`text-center text-xs font-medium py-2 ${idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : 'text-gray-600'
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
                            const isPast = isPastDate(date);
                            const isDisabled = !hasSessions || isPast;

                            return (
                                <button
                                    key={dateStr}
                                    onClick={() => handleDateClick(date)}
                                    disabled={isDisabled}
                                    className={`
                                        relative aspect-square flex items-center justify-center
                                        ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}
                                    `}
                                >
                                    <div className={`
                                        w-10 h-10 flex flex-col items-center justify-center rounded-full transition-all relative
                                        ${isSelected ? 'bg-[#3182F6] text-white font-bold' : ''}
                                        ${!isSelected && !isPast && hasSessions ? 'hover:bg-gray-100' : ''}
                                        ${today && !isSelected ? 'text-[#3182F6] font-bold' : ''}
                                        ${!isCurrent || isPast || !hasSessions ? 'text-gray-300' : dayIdx === 0 ? 'text-red-500' : dayIdx === 6 ? 'text-blue-500' : 'text-[#333D4B]'}
                                    `}>
                                        <span className="text-sm z-10 leading-none mt-0.5">{date.getDate()}</span>
                                        {hasSessions && !isPast && (
                                            <div className={`absolute -bottom-1 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : hasOpenSession(date) ? 'bg-[#3182F6]' : 'bg-gray-300'}`} />
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
                                    className={`py-3.5 px-5 rounded-2xl border text-left transition-all w-full flex justify-between items-center group relative overflow-hidden ${isSelected
                                        ? 'border-[#3182F6] bg-blue-50/50 ring-1 ring-[#3182F6]'
                                        : 'border-gray-100 bg-white hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-sm'
                                        } ${isDisabled
                                            ? 'opacity-50 grayscale cursor-not-allowed bg-gray-50'
                                            : ''
                                        }`}
                                >
                                    {/* Left: Time & Price */}
                                    <div className="flex flex-col gap-1.5 z-10">
                                        <div className="flex items-center gap-2">
                                            <Clock className={`w-4 h-4 ${isSelected ? 'text-[#3182F6]' : 'text-gray-400 group-hover:text-[#3182F6]'}`} strokeWidth={2.5} />
                                            <span className={`text-[15px] font-bold tracking-tight ${isSelected ? 'text-[#191F28]' : 'text-[#333D4B]'}`}>
                                                {formatTime(startTime)} ~ {formatTime(endTime)}
                                            </span>
                                        </div>
                                        {session.price !== undefined && session.price !== null && (
                                            <div className="flex items-center gap-2">
                                                <CreditCard className={`w-4 h-4 ${isSelected ? 'text-[#3182F6]/70' : 'text-gray-300 group-hover:text-[#3182F6]/60'}`} />
                                                <span className={`text-[13px] font-medium ${isSelected ? 'text-[#4E5968]' : 'text-[#8B95A1]'}`}>
                                                    {session.price.toLocaleString()}원
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Capacity & Status */}
                                    <div className="flex flex-col items-end gap-1.5 z-10">
                                        {isClosed ? (
                                            <span className="bg-gray-100 text-gray-400 text-[12px] font-bold px-2.5 py-1 rounded-lg">종료</span>
                                        ) : isFull ? (
                                            <span className="bg-red-50 text-red-500 text-[12px] font-bold px-2.5 py-1 rounded-lg">마감</span>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-1.5">
                                                    <Users className={`w-3.5 h-3.5 ${isSelected ? 'text-[#3182F6]' : 'text-gray-400 group-hover:text-[#3182F6]'}`} />
                                                    <span className={`text-[12px] font-medium ${isSelected ? 'text-[#333D4B]' : 'text-[#6B7684]'}`}>
                                                        <span className={isSelected ? 'text-[#3182F6] font-bold' : ''}>{currentNum}</span>
                                                        <span className="text-gray-300 mx-0.5">/</span>
                                                        {capacity}명
                                                    </span>
                                                </div>
                                                <span className={`text-[11px] font-semibold flex items-center gap-1 ${isSelected ? 'text-[#3182F6]' : 'text-[#3182F6]'}`}>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#3182F6] animate-pulse" />
                                                    {capacity - currentNum}자리 남음
                                                </span>
                                            </>
                                        )}
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