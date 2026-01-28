'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { reservationApi, ReservationDetail } from '@/lib/api-config';

export default function ReservationDetailPage() {
    const { reservationId } = useParams();
    const router = useRouter();
    const [detail, setDetail] = useState<ReservationDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!reservationId) return;
        reservationApi.getById(reservationId as string)
            .then(data => {
                setDetail(data);
                setLoading(false);
            })
            .catch(() => {
                alert('잘못된 접근입니다.');
                router.push('/');
            });
    }, [reservationId, router]);

    const handleCancel = async () => {
        if (!confirm('정말 예약을 취소하시겠습니까?\n취소 후에는 복구할 수 없습니다.')) return;

        try {
            await reservationApi.cancel(reservationId as string);
            alert('예약이 취소되었습니다.');
            router.push('/');
        } catch (e) {
            alert(e instanceof Error ? e.message : '서버 오류가 발생했습니다.');
        }
    };

    if (loading) return <div className="min-h-screen flex justify-center items-center bg-[#F2F4F6]">로딩 중...</div>;
    if (!detail) return null;

    return (
        <div className="min-h-screen bg-[#F2F4F6] flex justify-center">
            <div className="w-full max-w-[480px] bg-white min-h-screen shadow-2xl relative">

                {/* 상단 네비게이션 */}
                <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center z-10">
                    <button onClick={() => router.back()} className="text-2xl text-[#191F28] mr-2">←</button>
                    <span className="font-bold text-[#191F28] text-sm">예약 내역 상세</span>
                </div>

                <div className="p-6 space-y-6">
                    {/* 상단 상태 텍스트 */}
                    <div>
                        <h2 className="text-2xl font-bold text-[#191F28] leading-tight mb-2">
                            예약이<br />확정되었습니다.
                        </h2>
                        <p className="text-sm text-[#8B95A1]">
                            예약하신 클래스 정보입니다.<br />
                            변동 사항이 있을 시 강사님이 연락드릴 예정입니다.
                        </p>
                    </div>

                    <div className="h-px bg-gray-100"></div>

                    {/* 클래스 정보 */}
                    <section>
                        <h3 className="font-bold text-[#191F28] mb-3">클래스 정보</h3>
                        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">

                            {/* [추가] 이미지가 존재하면 표시 */}
                            {detail.classImageUrl && (
                                <div className="w-full h-40 bg-gray-100 rounded-lg overflow-hidden mb-2 border border-gray-100">
                                    <img
                                        src={detail.classImageUrl}
                                        alt={detail.classTitle}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            <div>
                                <div className="text-xs font-bold text-[#8B95A1] mb-1">클래스명</div>
                                <div className="font-bold text-[#333D4B] text-lg">{detail.classTitle}</div>
                            </div>
                            <div className="h-px bg-gray-100"></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-xs font-bold text-[#8B95A1] mb-1">날짜</div>
                                    <div className="font-medium text-[#333D4B]">{detail.date}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-[#8B95A1] mb-1">시간</div>
                                    <div className="font-medium text-[#333D4B]">{detail.startTime.slice(0, 5)} ~ {detail.endTime.slice(0, 5)}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-xs font-bold text-[#8B95A1] mb-1">참여 인원</div>
                                    <div className="font-medium text-[#3182F6]">
                                        {detail.currentNum} / {detail.capacity}명
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-[#8B95A1] mb-1">모집 상태</div>
                                    <div className={`font-medium ${detail.sessionStatus === 'FULL' ? 'text-red-500' : 'text-green-600'}`}>
                                        {detail.sessionStatus === 'FULL' ? '마감됨' : '모집중'}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="text-xs font-bold text-[#8B95A1] mb-1">장소</div>
                                <div className="font-medium text-[#333D4B]">{detail.classLocation}</div>
                            </div>
                        </div>
                    </section>

                    {/* 신청자 정보 */}
                    <section>
                        <h3 className="font-bold text-[#191F28] mb-3">예약자 정보</h3>
                        <div className="bg-[#F9FAFB] rounded-xl p-5 space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-[#8B95A1]">이름</span>
                                <span className="font-bold text-[#333D4B]">{detail.applicantName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#8B95A1]">연락처</span>
                                <span className="font-bold text-[#333D4B]">{detail.phoneNumber}</span>
                            </div>
                        </div>
                    </section>
                </div>

                {/* 하단 버튼 영역 */}
                <div className="p-6 pt-0 space-y-3">
                    <button
                        onClick={() => router.push('/')}
                        className="w-full py-3 bg-[#3182F6] text-white rounded-xl font-bold text-sm hover:bg-[#1B64DA]"
                    >
                        홈으로 돌아가기
                    </button>

                    <button
                        onClick={handleCancel}
                        className="w-full py-3 bg-white border border-[#E5E8EB] text-red-500 rounded-xl font-bold text-sm hover:bg-red-50"
                    >
                        예약 취소하기
                    </button>
                </div>
            </div>
        </div>
    );
}