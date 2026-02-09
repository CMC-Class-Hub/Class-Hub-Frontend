'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { reservationApi, ReservationDetail } from '@/lib/api';

// Components
import { Header } from '@/components/ui/Header';
import { Button } from '@/components/ui/Button';

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
        if (!confirm('정말 예약을 취소하시겠습니까?\n취소 후에는 복구할 수 없습니다.')) return;        try {
            await reservationApi.cancel(reservationId as string);
            // 페이지 새로고침하여 취소된 상태 반영
            window.location.reload();
        } catch (e) {
            alert(e instanceof Error ? e.message : '서버 오류가 발생했습니다.');
        }
    };

    if (loading) return <div className="min-h-screen flex justify-center items-center bg-[#F2F4F6]">로딩 중...</div>;
    if (!detail) return null;

    // 취소된 예약인지 확인
    const isCancelled = detail.reservationStatus !== 'CONFIRMED';
    return (
        <div className="min-h-screen bg-[#F2F4F6] flex justify-center">
            <div className="w-full max-w-[480px] bg-white min-h-screen shadow-2xl relative">

                <Header title="예약 내역 상세" showBack />

                <div className="p-6 space-y-6">
                    {/* 상단 상태 텍스트 - 취소 여부에 따라 분기 */}
                    {isCancelled ? (
                        <div>
                            <h2 className="text-2xl font-bold text-red-600 leading-tight mb-2">
                                예약이<br />취소되었습니다.
                            </h2>
                            <p className="text-sm text-[#8B95A1]">
                                해당 예약은 취소 처리되었습니다.<br />
                                새로운 예약을 원하시면 다시 신청해주세요.
                            </p>
                        </div>
                    ) : (
                        <div>
                            <h2 className="text-2xl font-bold text-[#191F28] leading-tight mb-2">
                                예약이<br />확정되었습니다.
                            </h2>
                            <p className="text-sm text-[#8B95A1]">
                                예약하신 클래스 정보입니다.<br />
                                변동 사항이 있을 시 강사님이 연락드릴 예정입니다.
                            </p>
                        </div>
                    )}

                    {/* 취소된 예약 알림 배지 */}
                    {isCancelled && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                            <div className="flex items-center gap-2">
                                <span className="text-red-600 font-bold text-sm">⚠️ 취소된 예약</span>
                            </div>
                            <p className="text-xs text-red-600 mt-1">
                                이 예약은 취소 처리되어 더 이상 유효하지 않습니다.
                            </p>
                        </div>
                    )}

                    <div className="h-px bg-gray-100"></div>

                    {/* 클래스 정보 */}
                    <section className={isCancelled ? 'opacity-60' : ''}>
                        <h3 className="font-bold text-[#191F28] mb-3">클래스 정보</h3>
                        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">

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
                                    <div className={`font-medium ${detail.sessionStatus === 'FULL' || detail.sessionStatus === 'CLOSED'
                                        ? 'text-red-500'
                                        : 'text-green-600'
                                        }`}>
                                        {detail.sessionStatus === 'FULL'
                                            ? '마감됨'
                                            : detail.sessionStatus === 'CLOSED'
                                                ? '종료됨'
                                                : '모집중'}
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
                    <section className={isCancelled ? 'opacity-60' : ''}>
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

                {/* 하단 버튼 영역 - 취소 여부에 따라 분기 */}
                <div className="p-6 pt-0 space-y-3">
                    <Button
                        onClick={() => router.push(`/class/${detail.classCode}`)}
                        fullWidth
                    >
                        클래스로 돌아가기
                    </Button>

                    {!isCancelled && (
                        <Button
                            onClick={handleCancel}
                            fullWidth
                            variant="danger"
                        >
                            예약 취소하기
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}