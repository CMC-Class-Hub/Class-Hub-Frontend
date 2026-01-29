'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { reservationApi, ReservationItem } from '@/lib/api';

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

                {/* 상단 네비게이션 */}
                <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center">
                    <button onClick={() => router.back()} className="text-2xl text-[#191F28] mr-2">←</button>
                    <span className="font-bold text-[#191F28] text-sm">예약 내역 조회</span>
                </div>

                <div className="p-5 space-y-6">
                    {/* 검색 폼 */}
                    <form onSubmit={handleSearch} className="bg-white space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-[#8B95A1] mb-1">이름</label>
                            <input
                                type="text"
                                placeholder="예: 김철수"
                                className="w-full p-3.5 bg-[#F9FAFB] rounded-xl text-[#191F28] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[#8B95A1] mb-1">연락처</label>
                            <input
                                type="tel"
                                placeholder="예: 01012345678" // 숫자만 입력해도 됨을 암시
                                className="w-full p-3.5 bg-[#F9FAFB] rounded-xl text-[#191F28] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-3.5 bg-[#3182F6] text-white rounded-xl font-bold text-sm hover:bg-[#1B64DA] transition-colors"
                        >
                            조회하기
                        </button>
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
                                        <button
                                            onClick={() => router.push(`/reservations/${res.reservationId}`)}
                                            className="w-full bg-white border border-gray-200 p-4 rounded-xl shadow-sm text-left hover:border-[#3182F6] transition-colors"
                                        >
                                            <div className="font-bold text-[#333D4B] mb-1">{res.classTitle}</div>
                                            <div className="text-sm text-[#8B95A1]">
                                                {res.date} · {res.startTime.slice(0, 5)}
                                            </div>
                                            <div className="mt-2 text-xs text-blue-600 font-bold bg-blue-50 inline-block px-2 py-1 rounded">
                                                예약완료
                                            </div>
                                        </button>
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