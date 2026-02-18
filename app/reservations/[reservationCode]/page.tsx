'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { reservationApi, paymentApi, ReservationDetail } from '@/lib/api';
import { MessageCircle } from 'lucide-react';
import { useAlert } from '@/lib/contexts/AlertContext';

// Components
import { Header } from '@/components/ui/Header';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

export default function ReservationDetailPage() {
    const { reservationCode } = useParams();
    const router = useRouter();
    const { showAlert } = useAlert();
    const [detail, setDetail] = useState<ReservationDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [showCancelModal, setShowCancelModal] = useState(false);

    useEffect(() => {
        if (!reservationCode) return;
        reservationApi.getByCode(reservationCode as string)
            .then((data: ReservationDetail) => {
                setDetail(data);
                setLoading(false);
            })
            .catch(() => {
                showAlert({
                    title: '오류',
                    description: '잘못된 접근입니다.',
                    onConfirm: () => router.push('/')
                });
            });
    }, [reservationCode, router]);

    const [isCancelling, setIsCancelling] = useState(false);

    const handleCancel = async () => {
        if (isCancelling || !detail) return;
        setIsCancelling(true);
        try {
            // 1. 결제 내역 확인 및 명시적 취소 요청
            try {
                const payment = await paymentApi.getByReservationId(detail.reservationId);
                // 결제가 완료된 상태이고 TID(거래번호)가 있는 경우에만 결제 취소 진행
                if (payment && payment.tid && payment.status === 'COMPLETED') {
                    await paymentApi.cancel({
                        tid: payment.tid,
                        amount: payment.amount,
                        reason: '고객 직접 예약 취소'
                    });
                    console.log('결제 취소 성공');
                }
            } catch (payError) {
                // 결제 정보가 없거나 이미 취소된 경우 에러가 발생할 수 있으므로 로그만 남기고 차단하지 않음
                console.log('결제 취소 건너뜀 (내역 없음 혹은 이미 취소됨):', payError);
            }

            // 2. 예약 취소 호출

            setShowCancelModal(false);
            showAlert({
                title: '취소 완료',
                description: '예약 및 결제가 취소되었습니다.',
                onConfirm: () => window.location.reload()
            });
        } catch (e) {
            setShowCancelModal(false);
            showAlert({
                title: '오류',
                description: e instanceof Error ? e.message : '서버 오류가 발생했습니다.'
            });
        } finally {
            setIsCancelling(false);
        }
    };

    if (loading) return <div className="min-h-screen flex justify-center items-center bg-[#F2F4F6]">로딩 중...</div>;
    if (!detail) return null;

    // 취소된 예약인지 확인
    const isCancelled = detail.reservationStatus !== 'CONFIRMED';

    // 취소 가능 여부 (세션 시작 12시간 전까지만)
    const canCancel = () => {
        const sessionStart = new Date(`${detail.date}T${detail.startTime}`);
        const deadline = new Date(sessionStart.getTime() - 12 * 60 * 60 * 1000);
        return new Date() < deadline;
    };
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
                            <h2 className="text-2xl font-bold text-[#191F28] leading-tight mb-6">
                                예약이<br />확정되었습니다.
                            </h2>

                            {/* 카카오톡 알림톡 안내 메시지 */}
                            <div className="bg-[#FEE500]/10 border border-[#FEE500]/20 rounded-xl p-4 flex items-start gap-3">
                                <div className="bg-[#FEE500] p-1.5 rounded-full shrink-0">
                                    <MessageCircle className="w-3.5 h-3.5 text-[#3A1D1D]" fill="#3A1D1D" />
                                </div>
                                <div className="text-sm text-[#333D4B]">
                                    <p className="font-bold mb-1 text-[#3A1D1D]">카카오톡 알림톡이 발송되었습니다</p>
                                    <p className="text-[#595959] text-xs leading-relaxed">
                                        발송된 알림톡의 링크를 통해 언제든지<br />
                                        예약 상세 내용을 확인하고 취소하실 수 있어요.
                                    </p>
                                </div>
                            </div>
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
                        <div className="space-y-2">
                            <Button
                                onClick={() => setShowCancelModal(true)}
                                fullWidth
                                variant="danger"
                                disabled={!canCancel() || isCancelling}
                            >
                                {isCancelling ? '취소 처리 중...' : '예약 취소하기'}
                            </Button>
                            {!canCancel() && (
                                <p className="text-center text-xs text-[#8B95A1]">
                                    12시간 전까지 취소 가능
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <ConfirmModal
                    isOpen={showCancelModal}
                    title="예약을 취소하시겠습니까?"
                    description="취소 후에는 복구할 수 없습니다."
                    confirmText="취소하기"
                    cancelText="돌아가기"
                    variant="danger"
                    onConfirm={handleCancel}
                    onCancel={() => setShowCancelModal(false)}
                />
            </div>
        </div>
    );
}