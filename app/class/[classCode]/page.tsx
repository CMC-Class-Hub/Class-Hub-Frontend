'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { classApi, reservationApi, ClassDetailResponse, SessionResponse } from '@/lib/api';

// Components
import { Button } from '@/components/ui/Button';
import { ClassInfoCard } from '@/components/features/ClassInfoCard';
import { SessionSelector } from '@/components/features/SessionSelector';
import { ReservationForm } from '@/components/features/ReservationForm';

export default function ClassEnrollmentPage() {
    const { classCode } = useParams();
    const router = useRouter();

    // 데이터 상태
    const [classDetail, setClassDetail] = useState<ClassDetailResponse | null>(null);
    const [sessions, setSessions] = useState<SessionResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [linkDisabled, setLinkDisabled] = useState(false);

    // 입력 상태
    const [step, setStep] = useState<'SELECTION' | 'INPUT' | 'COMPLETED'>('SELECTION');
    const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
    const [applicantName, setApplicantName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [completedReservationId, setCompletedReservationId] = useState<number | null>(null);

    // 약관 동의 상태
    const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
    const [showPrivacyDetail, setShowPrivacyDetail] = useState(false);

    // 에러 메시지 상태
    const [errorMessage, setErrorMessage] = useState('');

    // 1. 클래스 정보 불러오기
    useEffect(() => {
        if (!classCode) return;
        classApi.getByClassCode(classCode as string)
            .then(async (data) => {
                if (data.linkShareStatus !== 'ENABLED') {
                    setLinkDisabled(true);
                    setLoading(false);
                    return;
                }

                setClassDetail(data);
                try {
                    const sessionList = await classApi.getSessionsByClassId(data.id);
                    setSessions(sessionList);
                } catch (err) {
                    setSessions([]);
                }

                setLoading(false);
            })
            .catch((err) => {
                setError(true);
                setLoading(false);
            });
    }, [classCode]);

    // 링크 유효성 재확인
    const verifyLinkAvailability = async (): Promise<boolean> => {
        if (!classCode) return false;
        try {
            const data = await classApi.getByClassCode(classCode as string);
            if (data.linkShareStatus !== 'ENABLED') {
                setLinkDisabled(true);
                return false;
            }
            return true; // 링크가 유효하면 true
        } catch (err) {
            console.error(err);
            return true; // 에러 발생 시 진행 (실제 예약 시 백엔드 검증에 맡김)
        }
    };

    // 2. 예약 신청하기
    const handleReserve = async () => {
        if (!selectedSessionId || !applicantName || !phoneNumber || !password || !classDetail) return;

        // 약관 동의 확인
        if (!agreedToPrivacy) {
            setErrorMessage("개인정보 수집 및 이용에 동의해주세요.");
            return;
        }

        setErrorMessage('');

        const isAvailable = await verifyLinkAvailability();
        if (!isAvailable) return;

        const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
        if (cleanNumber.length < 9 || cleanNumber.length > 11) {
            setErrorMessage("올바른 전화번호를 입력해주세요.");
            return;
        }
        if (password.length !== 4) {
            setErrorMessage("비밀번호는 4자리여야 합니다.");
            return;
        }

        const formattedPhone = cleanNumber.replace(
            /(^02|^0505|^1[0-9]{3}|^0[0-9]{2})([0-9]+)?([0-9]{4})$/,
            "$1-$2-$3"
        ).replace("--", "-");

        try {
            const reservationId = await reservationApi.create(classDetail.id, {
                sessionId: selectedSessionId,
                applicantName,
                phoneNumber: formattedPhone,
                password
            });
            setCompletedReservationId(reservationId);
            setStep('COMPLETED');
            window.scrollTo(0, 0);
        } catch (e) {
            setErrorMessage(e instanceof Error ? e.message : '서버 연결에 실패했습니다.');
        }
    };

    const getSelectedSession = () => {
        return sessions.find(s => s.id === selectedSessionId);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-50 text-gray-400 text-sm">
                로딩 중...
            </div>
        );
    }

    if (linkDisabled) {
        return (
            <div className="min-h-screen bg-[#F2F4F6] flex justify-center items-center p-4">
                <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">🔒</span>
                    </div>
                    <h2 className="text-2xl font-bold text-[#191F28] mb-3">
                        접근할 수 없는 클래스입니다
                    </h2>
                    <p className="text-[#6B7684] leading-relaxed mb-6">
                        이 클래스는 현재 링크 공유가 비활성화되어 있어<br />
                        신청을 받지 않고 있습니다.
                    </p>
                    <Link href="/reservations">
                        <Button fullWidth variant="secondary">
                            예약 내역 확인하기
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    if (error || !classDetail) {
        return (
            <div className="min-h-screen bg-[#F2F4F6] flex justify-center items-center p-4">
                <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">❌</span>
                    </div>
                    <h2 className="text-2xl font-bold text-[#191F28] mb-3">
                        존재하지 않는 클래스입니다
                    </h2>
                    <p className="text-[#6B7684] leading-relaxed mb-6">
                        잘못된 링크이거나 삭제된 클래스입니다.
                    </p>
                    <Link href="/reservations">
                        <Button fullWidth variant="secondary">
                            예약 내역 확인하기
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

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
                    onClick={() => router.push(`/reservations/${completedReservationId}`)}
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

                    <Link
                        href="/reservations"
                        className="absolute right-4 text-xs font-bold text-[#8B95A1] bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100 hover:bg-gray-100 hover:text-[#333D4B] transition-colors"
                    >
                        예약내역
                    </Link>
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
                                password={password}
                                onNameChange={(val) => { setApplicantName(val); setErrorMessage(''); }}
                                onPhoneChange={(val) => { setPhoneNumber(val); setErrorMessage(''); }}
                                onPasswordChange={(val) => { setPassword(val); setErrorMessage(''); }}
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
                                            <p>
                                                회사는 원데이 클래스 예약 및 서비스 제공을 위해 아래와 같이 개인정보를 수집·이용합니다.
                                            </p>

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
                                                <p className="ml-2 mb-2">
                                                    회사는 원활한 서비스 제공을 위해 아래와 같이 개인정보 처리 업무를 위탁하고 있습니다.
                                                </p>
                                                <div className="ml-2 space-y-0.5">
                                                    <p>- 위탁받는 자: 솔라피(Solapi)</p>
                                                    <p>- 위탁 업무 내용: 문자메시지(SMS/LMS) 및 알림톡 발송</p>
                                                    <p>- 위탁하는 개인정보 항목: 휴대전화번호</p>
                                                    <p>- 보유 및 이용 기간: 메시지 발송 목적 달성 시까지</p>
                                                </div>
                                                <p className="ml-2 mt-2 text-[10px] text-gray-500">
                                                    회사는 위탁계약을 통해 개인정보가 안전하게 처리될 수 있도록 관련 법령에 따라 관리·감독하고 있습니다.
                                                </p>
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
                            disabled={!selectedSessionId}
                            fullWidth
                            variant={!selectedSessionId ? "secondary" : "primary"}
                        >
                            예약하기
                        </Button>
                    ) : (
                        <Button
                            onClick={handleReserve}
                            disabled={!applicantName || !phoneNumber || !password || !agreedToPrivacy}
                            fullWidth
                            variant={(!applicantName || !phoneNumber || !password || !agreedToPrivacy) ? "secondary" : "primary"}
                        >
                            예약하기
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
