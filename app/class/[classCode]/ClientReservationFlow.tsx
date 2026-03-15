'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { classApi, reservationApi, paymentApi, ClassDetailResponse, SessionResponse } from '@/lib/api';

// Components
import { Button } from '@/components/ui/Button';
import { ClassInfoCard } from '@/components/features/ClassInfoCard';
import { SessionSelector } from '@/components/features/SessionSelector';
import { ReservationForm } from '@/components/features/ReservationForm';

interface Props {
    classCode: string;
    classDetail: ClassDetailResponse;
    sessions: SessionResponse[];
}

export function ClientReservationFlow({ classCode, classDetail, sessions }: Props) {
    const router = useRouter();

    // 입력 상태
    const [step, setStep] = useState<'SELECTION' | 'INPUT' | 'COMPLETED'>('SELECTION');
    const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
    const [applicantName, setApplicantName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [completedReservationCode, setCompletedReservationCode] = useState<string | null>(null);

    // 약관 동의 상태
    const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
    const [showPrivacyDetail, setShowPrivacyDetail] = useState(false);

    // 에러 메시지 상태
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 링크 유효성 재확인 (결제 전 안전장치)
    const verifyLinkAvailability = async (): Promise<boolean> => {
        try {
            const data = await classApi.getByClassCode(classCode);
            if (data.linkShareStatus !== 'ENABLED') {
                setErrorMessage('이 클래스는 현재 예약할 수 없습니다.');
                return false;
            }
            return true;
        } catch (err) {
            console.error(err);
            return true; // 에러 발생 시 진행 (실제 예약 시 백엔드 검증에 맡김)
        }
    };

    // 예약 신청하기 -> 결제 플로우로 변경
    const handleReserve = async () => {
        if (!selectedSessionId || !applicantName || !phoneNumber || !classDetail || isSubmitting) return;

        // 약관 동의 확인
        if (!agreedToPrivacy) {
            setErrorMessage("개인정보 수집 및 이용에 동의해주세요.");
            return;
        }

        setErrorMessage('');
        setIsSubmitting(true);

        const isAvailable = await verifyLinkAvailability();
        if (!isAvailable) {
            setIsSubmitting(false);
            return;
        }

        const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
        if (cleanNumber.length < 9 || cleanNumber.length > 11) {
            setErrorMessage("올바른 전화번호를 입력해주세요.");
            setIsSubmitting(false);
            return;
        }

        const formattedPhone = cleanNumber.replace(
            /(^02|^0505|^1[0-9]{3}|^0[0-9]{2})([0-9]+)?([0-9]{4})$/,
            "$1-$2-$3"
        ).replace("--", "-");

        try {
            // 1단계: 예약 생성
            const reservationResult = await reservationApi.create(classDetail.id, {
                sessionId: selectedSessionId,
                applicantName,
                phoneNumber: formattedPhone
            });

            // 예약 ID 추출
            const reservationCode = reservationResult.reservationCode;

            // 예약 상세 정보 가져오기
            const reservationDetail = await reservationApi.getByCode(reservationCode);

            // 2단계: 결제 생성 (결제 준비 단계)
            const selectedSession = getSelectedSession();
            const amount = selectedSession?.price || 0;

            if (amount <= 0) {
                // 가격이 0원이면 결제 없이 예약 완료
                setCompletedReservationCode(reservationCode);
                setStep('COMPLETED');
                window.scrollTo(0, 0);
                setIsSubmitting(false);
                return;
            }

            const orderId = crypto.randomUUID();
            const resId = reservationDetail.reservationId;

            await paymentApi.create({
                reservationId: resId,
                amount: amount,
                orderId: orderId,
            });

            // 3단계: 결제 페이지로 리다이렉트
            const paymentParams = new URLSearchParams({
                orderId: orderId,
                amount: amount.toString(),
                goodsName: classDetail.name || `클래스 #${classDetail.id}`,
                buyerName: applicantName,
                buyerTel: formattedPhone,
                reservationCode: reservationCode,
            });

            router.push(`/payment?${paymentParams.toString()}`);

        } catch (e) {
            setIsSubmitting(false);
            setErrorMessage(e instanceof Error ? e.message : '서버 연결에 실패했습니다.');
        }
    };

    const getSelectedSession = () => {
        return sessions.find(s => s.id === selectedSessionId);
    };

    if (step === 'COMPLETED') {
        const session = getSelectedSession();
        return (
            <div className="min-h-screen bg-white flex flex-col justify-center items-center max-w-[480px] mx-auto shadow-2xl relative p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                    <span className="text-3xl">🎉</span>
                </div>
                <h2 className="text-2xl font-bold text-[#191F28] mb-2">예약 완료!</h2>
                <p className="text-[#8B95A1] text-center mb-8 leading-relaxed">
                    예약이 성공적으로 접수되었습니다.
                </p>
                <div className="w-full bg-gray-50 rounded-xl p-5 mb-8 space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">클래스</span>
                        <span className="font-bold text-[#333D4B] text-right truncate ml-4">{classDetail.name || `클래스 #${classDetail.id}`}</span>
                    </div>
                    {session && (
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">일시</span>
                            <span className="font-bold text-[#333D4B]">{session.date} {session.startTime?.slice(0, 5)}</span>
                        </div>
                    )}
                </div>
                <Button
                    onClick={() => router.push(`/reservations/${completedReservationCode}`)}
                    fullWidth
                >
                    예약 내역 확인
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F2F4F6] flex justify-center">
            <div className="w-full max-w-[480px] bg-white min-h-screen shadow-2xl relative pb-28">

                {/* 상단 네비게이션 */}
                <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-gray-100 px-4 py-3 flex items-center relative">
                    {step === 'INPUT' && (
                        <button onClick={() => { setStep('SELECTION'); setErrorMessage(''); }} className="text-2xl text-[#191F28] absolute left-4">←</button>
                    )}
                    <span className="font-bold text-[#191F28] text-sm mx-auto">클래스 예약</span>
                </div>

                <div className="p-0">
                    {/* Step 1: 클래스 정보 + 일정 선택 */}
                    {step === 'SELECTION' && (
                        <>
                            <ClassInfoCard classDetail={classDetail} />
                            <div className="h-px bg-gray-100 my-6 mx-5"></div>
                            <SessionSelector
                                sessions={sessions}
                                selectedSessionId={selectedSessionId}
                                onSelect={(id) => { setSelectedSessionId(id); setErrorMessage(''); }}
                            />
                        </>
                    )}

                    {/* Step 2: 정보 입력 */}
                    {step === 'INPUT' && (
                        <div className="pt-6">
                            <ReservationForm
                                applicantName={applicantName}
                                phoneNumber={phoneNumber}
                                onNameChange={(val) => { setApplicantName(val); setErrorMessage(''); }}
                                onPhoneChange={(val) => { setPhoneNumber(val); setErrorMessage(''); }}
                                selectedDate={getSelectedSession()?.date || ''}
                                selectedTime={getSelectedSession()?.startTime?.slice(0, 5) || ''}
                                selectedPrice={getSelectedSession()?.price}
                            />

                            {/* 개인정보 동의 섹션 */}
                            <div className="px-5 mt-6 mb-4">
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            id="privacyAgree"
                                            checked={agreedToPrivacy}
                                            onChange={(e) => {
                                                setAgreedToPrivacy(e.target.checked);
                                                setErrorMessage('');
                                            }}
                                            className="mt-0.5 w-5 h-5 accent-blue-600 cursor-pointer"
                                        />
                                        <label htmlFor="privacyAgree" className="flex-1 text-sm cursor-pointer">
                                            <span className="text-black-600 font-bold">[필수]</span>{' '}
                                            <span className="text-[#333D4B] font-medium">개인정보 수집 및 이용 동의</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setShowPrivacyDetail(!showPrivacyDetail)}
                                            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                                        >
                                            <svg
                                                className={`w-5 h-5 transition-transform ${showPrivacyDetail ? 'rotate-90' : ''}`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* 상세 내용 */}
                                    {showPrivacyDetail && (
                                        <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-[#6B7684] leading-relaxed space-y-3">
                                            <p>회사는 원데이 클래스 예약 및 서비스 제공을 위해 아래와 같이 개인정보를 수집·이용합니다.</p>
                                            <div>
                                                <h4 className="font-semibold text-[#333D4B] mb-1">1. 수집 항목</h4>
                                                <p className="ml-2">- 휴대전화번호</p>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-[#333D4B] mb-1">2. 수집 및 이용 목적</h4>
                                                <div className="ml-2 space-y-0.5">
                                                    <p>- 원데이 클래스 예약 확인</p>
                                                    <p>- 예약 확정, 일정 안내, 변경 및 취소 안내 메시지 발송</p>
                                                    <p>- 서비스 관련 중요 공지 전달</p>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-[#333D4B] mb-1">3. 보유 및 이용 기간</h4>
                                                <p className="ml-2">
                                                    - 수집일로부터 클래스 종료 후 30일까지<br />
                                                    <span className="ml-2">(단, 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관)</span>
                                                </p>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-[#333D4B] mb-1">4. 동의 거부 권리 및 불이익</h4>
                                                <div className="ml-2 space-y-0.5">
                                                    <p>- 이용자는 개인정보 수집·이용에 대한 동의를 거부할 권리가 있습니다.</p>
                                                    <p>- 다만, 동의하지 않을 경우 예약 확인 및 안내 메시지 발송이 불가하여 원데이 클래스 예약 서비스 이용이 제한될 수 있습니다.</p>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-[#333D4B] mb-1">5. 개인정보 처리 위탁</h4>
                                                <p className="ml-2 mb-2">회사는 원활한 서비스 제공을 위해 아래와 같이 개인정보 처리 업무를 위탁하고 있습니다.</p>
                                                <div className="ml-2 space-y-0.5">
                                                    <p>- 위탁받는 자: 솔라피(Solapi)</p>
                                                    <p>- 위탁 업무 내용: 문자메시지(SMS/LMS) 및 알림톡 발송</p>
                                                    <p>- 위탁하는 개인정보 항목: 휴대전화번호</p>
                                                    <p>- 보유 및 이용 기간: 메시지 발송 목적 달성 시까지</p>
                                                </div>
                                            </div>
                                            <p className="font-semibold text-[#333D4B] pt-2">
                                                본인은 위 내용을 충분히 이해하였으며, 개인정보 수집·이용에 동의합니다.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 하단 고정 버튼 */}
                <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#F2F4F6] p-4 safe-area-bottom">
                    {errorMessage && (
                        <div className="mb-3 p-3 bg-red-50 rounded-xl border border-red-100 flex items-center justify-center animate-in slide-in-from-bottom-2 fade-in">
                            <span className="text-red-500 text-sm font-bold">⚠️ {errorMessage}</span>
                        </div>
                    )}

                    {step === 'SELECTION' ? (
                        <Button
                            onClick={async () => {
                                const isAvailable = await verifyLinkAvailability();
                                if (isAvailable) setStep('INPUT');
                            }}
                            disabled={!selectedSessionId || isSubmitting}
                            fullWidth
                            variant={!selectedSessionId ? "secondary" : "primary"}
                        >
                            예약하기
                        </Button>
                    ) : (
                        <Button
                            onClick={handleReserve}
                            disabled={!applicantName || !phoneNumber || !agreedToPrivacy || isSubmitting}
                            fullWidth
                            variant={(!applicantName || !phoneNumber || !agreedToPrivacy) ? "secondary" : "primary"}
                        >
                            {isSubmitting ? '처리 중...' : '예약하기'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
