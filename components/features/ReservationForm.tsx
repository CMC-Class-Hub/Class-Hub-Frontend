import React from 'react';
import { Input } from '../ui/Input';

interface ReservationFormProps {
    applicantName: string;
    phoneNumber: string;
    password: string;
    onNameChange: (value: string) => void;
    onPhoneChange: (value: string) => void;
    onPasswordChange: (value: string) => void;
    selectedDate: string;
    selectedTime: string;
}

export const ReservationForm: React.FC<ReservationFormProps> = ({
    applicantName,
    phoneNumber,
    password,
    onNameChange,
    onPhoneChange,
    onPasswordChange,
    selectedDate,
    selectedTime,
}) => {
    return (
        <section className="px-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-100">
                <h3 className="text-xs font-bold text-blue-500 mb-1">선택한 일정</h3>
                <p className="text-sm font-bold text-[#191F28]">
                    {selectedDate} {selectedTime}
                </p>
            </div>

            <h3 className="font-bold text-[#191F28] mb-3 text-base">📝 예약자 정보</h3>
            <div className="space-y-3">
                <Input
                    label="이름"
                    placeholder="이름 (실명)"
                    value={applicantName}
                    onChange={(e) => onNameChange(e.target.value)}
                />
                <Input
                    label="연락처"
                    type="tel"
                    placeholder="01012345678"
                    value={phoneNumber}
                    onChange={(e) => onPhoneChange(e.target.value)}
                />
                <Input
                    label="비밀번호"
                    type="password"
                    placeholder="비밀번호 (조회용)"
                    value={password}
                    onChange={(e) => onPasswordChange(e.target.value)}
                />
            </div>
        </section>
    );
};
