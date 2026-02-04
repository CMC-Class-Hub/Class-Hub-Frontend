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

    // 입력 상태
    const [step, setStep] = useState<'SELECTION' | 'INPUT' | 'COMPLETED'>('SELECTION');
    const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
    const [applicantName, setApplicantName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [completedReservationId, setCompletedReservationId] = useState<number | null>(null);

    // 에러 메시지 상태
    const [errorMessage, setErrorMessage] = useState('');

    // 1. 클래스 정보 불러오기
    useEffect(() => {
        if (!classCode) return;
        classApi.getByClassCode(classCode as string)
            .then(async (data) => {
                console.log('Class data:', data);
                setClassDetail(data);

                // 클래스 정보를 가져온 후 세션 정보를 별도로 가져옴
                try {
                    const sessionList = await classApi.getSessionsByClassId(data.id);
                    console.log('Sessions data:', sessionList);
                    setSessions(sessionList);
                } catch (err) {
                    console.error('Failed to fetch sessions:', err);
                }

                setLoading(false);
            })
            .catch((err) => {
                console.error('Failed to fetch class detail:', err);
                setError(true);
                setLoading(false);
            });
    }, [classCode]);

    // 2. 예약 신청하기
    const handleReserve = async () => {
        if (!selectedSessionId || !applicantName || !phoneNumber || !classDetail) return;

        setErrorMessage('');

        const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
        if (cleanNumber.length < 9 || cleanNumber.length > 11) {
            setErrorMessage("올바른 전화번호를 입력해주세요.");
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

    if (loading) return <div className="min-h-screen flex justify-center items-center bg-gray-50 text-gray-400 text-sm">로딩 중...</div>;
    if (error || !classDetail) return <div className="min-h-screen flex justify-center items-center">클래스를 찾을 수 없습니다.</div>;

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
            <div className="w-full max-w-[480px] bg-white min-h-screen shadow-2xl relative pb-24">

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
                    <ClassInfoCard classDetail={classDetail} />

                    <div className="h-px bg-gray-100 my-6 mx-5"></div>

                    <div className="space-y-6">
                        {/* Step 1: 일정 선택 */}
                        {step === 'SELECTION' && (
                            <SessionSelector
                                sessions={sessions}
                                selectedSessionId={selectedSessionId}
                                onSelect={(id) => { setSelectedSessionId(id); setErrorMessage(''); }}
                            />
                        )}

                        {/* Step 2: 정보 입력 */}
                        {step === 'INPUT' && (
                            <ReservationForm
                                applicantName={applicantName}
                                phoneNumber={phoneNumber}
                                password={password}
                                onNameChange={(val) => { setApplicantName(val); setErrorMessage(''); }}
                                onPhoneChange={(val) => { setPhoneNumber(val); setErrorMessage(''); }}
                                onPasswordChange={(val) => { setPassword(val); setErrorMessage(''); }}
                                selectedDate={getSelectedSession()?.date || ''}
                                selectedTime={getSelectedSession()?.startTime?.slice(0, 5) || ''}
                            />
                        )}
                    </div>
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
                            onClick={() => setStep('INPUT')}
                            disabled={!selectedSessionId}
                            fullWidth
                            variant={!selectedSessionId ? "secondary" : "primary"}
                        >
                            예약하기
                        </Button>
                    ) : (
                        <Button
                            onClick={handleReserve}
                            disabled={!applicantName || !phoneNumber || !password}
                            fullWidth
                            variant={(!applicantName || !phoneNumber || !password) ? "secondary" : "primary"}
                        >
                            예약하기
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}