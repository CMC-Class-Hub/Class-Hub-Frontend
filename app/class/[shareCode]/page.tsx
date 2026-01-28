'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { classApi, reservationApi, ClassDetailResponse } from '@/lib/api-config';

export default function ClassEnrollmentPage() {
    const { shareCode } = useParams();
    const router = useRouter();

    // 데이터 상태
    const [classDetail, setClassDetail] = useState<ClassDetailResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // 입력 상태
    const [step, setStep] = useState<'SELECTION' | 'INPUT' | 'COMPLETED'>('SELECTION');
    const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
    const [applicantName, setApplicantName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [completedReservationId, setCompletedReservationId] = useState<number | null>(null);

    // 에러 메시지 상태
    const [errorMessage, setErrorMessage] = useState('');

    // 1. 클래스 정보 불러오기
    useEffect(() => {
        if (!shareCode) return;
        classApi.getByShareCode(shareCode as string)
            .then((data) => {
                setClassDetail(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError(true);
                setLoading(false);
            });
    }, [shareCode]);

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
                phoneNumber: formattedPhone
            });
            setCompletedReservationId(reservationId);
            setStep('COMPLETED');
            window.scrollTo(0, 0);
        } catch (e) {
            setErrorMessage(e instanceof Error ? e.message : '서버 연결에 실패했습니다.');
        }
    };

    const getSelectedSession = () => {
        return classDetail?.sessions.find(s => s.sessionId === selectedSessionId);
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
                <h2 className="text-2xl font-bold text-[#191F28] mb-2">신청 완료!</h2>
                <p className="text-[#8B95A1] text-center mb-8 leading-relaxed">
                    예약이 성공적으로 접수되었습니다.
                </p>
                <div className="w-full bg-gray-50 rounded-xl p-5 mb-8 space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">클래스</span>
                        <span className="font-bold text-[#333D4B] text-right truncate ml-4">{classDetail.title}</span>
                    </div>
                    {session && (
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">일시</span>
                            <span className="font-bold text-[#333D4B]">{session.date} {session.startTime.slice(0,5)}</span>
                        </div>
                    )}
                </div>
                <button
                    onClick={() => router.push(`/reservation/${completedReservationId}`)}
                    className="w-full py-3.5 bg-[#3182F6] text-white rounded-xl font-bold text-base hover:bg-[#1B64DA] transition-colors"
                >
                    신청 내역 확인
                </button>
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
                        href="/reservation/check"
                        className="absolute right-4 text-xs font-bold text-[#8B95A1] bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100 hover:bg-gray-100 hover:text-[#333D4B] transition-colors"
                    >
                        신청내역
                    </Link>
                </div>

                <div className="p-0">
                    {/* [추가] 대표 이미지 영역 */}
                    {classDetail.imageUrl && (
                        <div className="w-full h-64 relative bg-gray-200">
                            <img
                                src={classDetail.imageUrl}
                                alt={classDetail.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    <div className="p-5 space-y-6">
                        {/* 타이틀 영역 */}
                        <div>
                            <span className="inline-block px-2 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded mb-2">원데이 클래스</span>
                            <h1 className="text-xl font-bold text-[#191F28] leading-snug mb-2">{classDetail.title}</h1>
                            <p className="text-[#8B95A1] text-sm flex items-center gap-1">📍 {classDetail.location}</p>
                        </div>

                        <div className="h-px bg-gray-100"></div>

                        {/* Step 1: 일정 선택 */}
                        {step === 'SELECTION' && (
                            <>
                                <section>
                                    <h3 className="font-bold text-[#191F28] mb-3 text-base">📅 일정 선택</h3>
                                    <div className="grid grid-cols-1 gap-2">
                                        {classDetail.sessions.map((session) => {
                                            const isFull = session.status === 'FULL' || session.currentNum >= session.capacity;
                                            const isSelected = selectedSessionId === session.sessionId;

                                            return (
                                                <button
                                                    key={session.sessionId}
                                                    disabled={isFull}
                                                    onClick={() => { setSelectedSessionId(session.sessionId); setErrorMessage(''); }}
                                                    className={`p-4 rounded-xl border text-left transition-all flex justify-between items-center ${
                                                        isSelected ? 'border-[#3182F6] bg-[#E8F3FF] ring-1 ring-[#3182F6]' : 'border-gray-200 bg-white hover:bg-gray-50'
                                                    } ${isFull ? 'opacity-50 grayscale cursor-not-allowed bg-gray-100' : ''}`}
                                                >
                                                    <div>
                                                        <div className={`font-bold text-sm ${isSelected ? 'text-[#1B64DA]' : 'text-[#333D4B]'}`}>{session.date}</div>
                                                        <div className="text-xs text-[#8B95A1] mt-0.5">{session.startTime.slice(0, 5)} ~ {session.endTime.slice(0, 5)}</div>
                                                    </div>
                                                    <div className={`text-[10px] font-bold px-2 py-1 rounded ${isSelected ? 'bg-[#3182F6] text-white' : 'bg-[#F2F4F6] text-[#6B7684]'}`}>
                                                        {isFull ? '마감' : `${session.currentNum}/${session.capacity}명`}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </section>

                                {/* 상세 정보 */}
                                <section className="space-y-4 pt-4">
                                    <h3 className="font-bold text-[#191F28] text-base">상세 정보</h3>
                                    <div className="bg-[#F9FAFB] rounded-xl p-4 text-sm text-[#4E5968] space-y-3">
                                        <p className="leading-relaxed whitespace-pre-wrap">{classDetail.description}</p>
                                        {(classDetail.material || classDetail.parkingInfo) && (
                                            <div className="pt-3 border-t border-gray-200 space-y-2 text-xs">
                                                {classDetail.material && <div className="flex gap-2"><span className="font-bold text-[#8B95A1] shrink-0">준비물</span><span>{classDetail.material}</span></div>}
                                                {classDetail.parkingInfo && <div className="flex gap-2"><span className="font-bold text-[#8B95A1] shrink-0">주차</span><span>{classDetail.parkingInfo}</span></div>}
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </>
                        )}

                        {/* Step 2: 정보 입력 */}
                        {step === 'INPUT' && (
                            <section className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <div className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-100">
                                    <h3 className="text-xs font-bold text-blue-500 mb-1">선택한 일정</h3>
                                    <p className="text-sm font-bold text-[#191F28]">
                                        {getSelectedSession()?.date} {getSelectedSession()?.startTime.slice(0,5)}
                                    </p>
                                </div>

                                <h3 className="font-bold text-[#191F28] mb-3 text-base">📝 신청자 정보</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-[#8B95A1] mb-1">이름</label>
                                        <input
                                            type="text"
                                            placeholder="이름 (실명)"
                                            className="w-full p-3.5 bg-[#F9FAFB] rounded-xl text-[#191F28] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3182F6] border border-transparent"
                                            value={applicantName}
                                            onChange={(e) => { setApplicantName(e.target.value); setErrorMessage(''); }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-[#8B95A1] mb-1">연락처</label>
                                        <input
                                            type="tel"
                                            placeholder="01012345678"
                                            className="w-full p-3.5 bg-[#F9FAFB] rounded-xl text-[#191F28] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3182F6] border border-transparent"
                                            value={phoneNumber}
                                            onChange={(e) => { setPhoneNumber(e.target.value); setErrorMessage(''); }}
                                        />
                                    </div>
                                </div>
                            </section>
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
                        <button
                            onClick={() => setStep('INPUT')}
                            disabled={!selectedSessionId}
                            className={`w-full py-3.5 rounded-xl font-bold text-base transition-all active:scale-[0.98] ${
                                !selectedSessionId ? 'bg-[#E5E8EB] text-[#B0B8C1] cursor-not-allowed' : 'bg-[#3182F6] text-white hover:bg-[#1B64DA] shadow-lg shadow-blue-100'
                            }`}
                        >
                            신청하기
                        </button>
                    ) : (
                        <button
                            onClick={handleReserve}
                            disabled={!applicantName || !phoneNumber}
                            className={`w-full py-3.5 rounded-xl font-bold text-base transition-all active:scale-[0.98] ${
                                (!applicantName || !phoneNumber) ? 'bg-[#E5E8EB] text-[#B0B8C1] cursor-not-allowed' : 'bg-[#3182F6] text-white hover:bg-[#1B64DA] shadow-lg shadow-blue-100'
                            }`}
                        >
                            신청하기
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}