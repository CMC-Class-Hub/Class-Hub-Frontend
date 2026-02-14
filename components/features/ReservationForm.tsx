import React, { useState } from 'react';
import { Input } from '../ui/Input';

interface ReservationFormProps {
    applicantName: string;
    phoneNumber: string;
    onNameChange: (value: string) => void;
    onPhoneChange: (value: string) => void;
    selectedDate: string;
    selectedTime: string;
    selectedPrice?: number;
}

export const ReservationForm: React.FC<ReservationFormProps> = ({
    applicantName,
    phoneNumber,
    onNameChange,
    onPhoneChange,
    selectedDate,
    selectedTime,
    selectedPrice,
}) => {
    const [phoneError, setPhoneError] = useState<string>('');

    // 전화번호 포맷팅 함수
    const formatPhoneNumber = (value: string) => {
        const numbers = value.replace(/[^\d]/g, '');

        if (numbers.length <= 3) {
            return numbers;
        } else if (numbers.length <= 7) {
            return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        } else if (numbers.length <= 11) {
            return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
        }

        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    };

    // 전화번호 유효성 검사
    const validatePhoneNumber = (value: string) => {
        const numbers = value.replace(/[^\d]/g, '');

        if (numbers.length === 0) {
            setPhoneError('');
            return;
        }

        if (numbers.length < 11) {
            setPhoneError('올바르지 않은 전화번호입니다');
        } else {
            setPhoneError('');
        }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhoneNumber(e.target.value);
        onPhoneChange(formatted);
        validatePhoneNumber(formatted);
    };

    const handlePhoneBlur = () => {
        validatePhoneNumber(phoneNumber);
    };

    return (
        <section className="px-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-100">
                <h3 className="text-xs font-bold text-blue-500 mb-1">선택한 일정</h3>
                <p className="text-sm font-bold text-[#191F28]">
                    {selectedDate} {selectedTime}
                </p>
                {selectedPrice !== undefined && selectedPrice !== null && (
                    <p className="text-sm font-bold text-[#3182F6] mt-1">
                        {selectedPrice.toLocaleString()}원
                    </p>
                )}
            </div>

            <h3 className="font-bold text-[#191F28] mb-3 text-base">📝 예약자 정보</h3>
            <div className="space-y-3">
                <Input
                    label="이름"
                    placeholder="이름 (실명)"
                    value={applicantName}
                    onChange={(e) => onNameChange(e.target.value)}
                />
                <div>
                    <Input
                        label="연락처"
                        type="tel"
                        placeholder="010-1234-5678"
                        value={phoneNumber}
                        onChange={handlePhoneChange}
                        onBlur={handlePhoneBlur}
                        maxLength={13}
                        className={phoneError ? 'border-red-500' : ''}
                    />
                    {phoneError && (
                        <p className="text-red-500 text-xs mt-1">
                            {phoneError}
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
};