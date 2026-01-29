import React from 'react';
import { ReservationItem } from '@/lib/api';

interface ReservationResultProps {
    reservation: ReservationItem;
    onClick: () => void;
}

export const ReservationResult: React.FC<ReservationResultProps> = ({
    reservation,
    onClick,
}) => {
    return (
        <button
            onClick={onClick}
            className="w-full bg-white border border-gray-200 p-4 rounded-xl shadow-sm text-left hover:border-[#3182F6] transition-colors"
        >
            <div className="font-bold text-[#333D4B] mb-1">{reservation.classTitle}</div>
            <div className="text-sm text-[#8B95A1]">
                {reservation.date} · {reservation.startTime.slice(0, 5)}
            </div>
            <div className="mt-2 text-xs text-blue-600 font-bold bg-blue-50 inline-block px-2 py-1 rounded">
                예약완료
            </div>
        </button>
    );
};
