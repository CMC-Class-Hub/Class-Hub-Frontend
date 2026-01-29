'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { reservationApi, ReservationItem } from '@/lib/api';

// Components
import { Header } from '@/components/ui/Header';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ReservationResult } from '@/components/features/ReservationResult';

export default function CheckReservationPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [reservations, setReservations] = useState<ReservationItem[] | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !phone) return alert('이름과 전화번호를 입력해주세요.');

        // [수정] 전화번호 포맷팅 로직 추가 (숫자만 입력해도 하이픈 붙여서 전송)
        const cleanNumber = phone.replace(/[^0-9]/g, '');
        if (cleanNumber.length < 9) { // 최소 길이 체크
            return alert("올바른 전화번호를 입력해주세요.");
        }

        // 01012345678 -> 010-1234-5678 변환
        const formattedPhone = cleanNumber.length > 11
            ? cleanNumber // 너무 길면 그대로 둠 (혹은 에러처리)
            : cleanNumber.replace(
                /(^02|^0505|^1[0-9]{3}|^0[0-9]{2})([0-9]+)?([0-9]{4})$/,
                "$1-$2-$3"
            ).replace("--", "-"); // 혹시 모를 이중 하이픈 제거

        setLoading(true);
        try {
            const data = await reservationApi.search(name, formattedPhone);
            setReservations(data);
        } catch (error) {
            alert('조회 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F2F4F6] flex justify-center">
            <div className="w-full max-w-[480px] bg-white min-h-screen shadow-2xl relative">

                <Header title="예약 내역 조회" showBack />

                <div className="p-5 space-y-6">
                    {/* 검색 폼 */}
                    <form onSubmit={handleSearch} className="bg-white space-y-4">
                        <Input
                            label="이름"
                            placeholder="예: 김철수"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <Input
                            label="연락처"
                            type="tel"
                            placeholder="예: 01012345678"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                        <Button type="submit" fullWidth>
                            조회하기
                        </Button>
                    </form>

                    <div className="h-px bg-gray-100"></div>

                    {/* 조회 결과 */}
                    <div>
                        <h3 className="font-bold text-[#191F28] mb-3 text-sm">조회 결과</h3>
                        {loading ? (
                            <div className="text-center py-10 text-gray-400 text-sm">검색 중...</div>
                        ) : reservations === null ? (
                            <div className="text-center py-10 text-gray-400 text-sm">정보를 입력하여 내역을 확인하세요.</div>
                        ) : reservations.length === 0 ? (
                            <div className="text-center py-10 text-gray-400 text-sm">
                                예약 내역이 없습니다.<br />
                                이름과 연락처를 확인해주세요.
                            </div>
                        ) : (
                            <ul className="space-y-3">
                                {reservations.map((res) => (
                                    <li key={res.reservationId}>
                                        <ReservationResult
                                            reservation={res}
                                            onClick={() => router.push(`/reservations/${res.reservationId}`)}
                                        />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}