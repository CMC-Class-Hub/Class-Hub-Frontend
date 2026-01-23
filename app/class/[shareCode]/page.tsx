'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

// --- 타입 정의 ---
interface SessionResponse {
    sessionId: number;
    date: string;
    startTime: string;
    endTime: string;
    capacity: number;
    currentNum: number;
    status: 'RECRUITING' | 'FULL';
}

interface ClassDetailResponse {
    id: number;
    title: string;
    description: string;
    location: string;
    locationDescription?: string;
    price: number;
    material?: string;
    parkingInfo?: string;
    guidelines?: string;
    policy?: string;
    sessions: SessionResponse[];
}

export default function ClassEnrollmentPage() {
    const { shareCode } = useParams();

    // 데이터 상태
    const [classDetail, setClassDetail] = useState<ClassDetailResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // 입력 상태
    const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
    const [applicantName, setApplicantName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isSuccess, setIsSuccess] = useState(false); // 예약 성공 여부

    // 1. 클래스 정보 불러오기
    useEffect(() => {
        if (!shareCode) return;

        fetch(`http://localhost:8080/api/classes/shared/${shareCode}`)
            .then((res) => {
                if (!res.ok) throw new Error('클래스를 찾을 수 없습니다.');
                return res.json();
            })
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
        if (!selectedSessionId) return alert("일정을 선택해주세요.");
        if (!applicantName) return alert("이름을 입력해주세요.");
        if (!phoneNumber) return alert("연락처를 입력해주세요.");
        if (!classDetail?.id) return;

        const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
        if (cleanNumber.length < 9 || cleanNumber.length > 11) {
            return alert("올바른 전화번호를 입력해주세요.");
        }
        const formattedPhone = cleanNumber.replace(
            /(^02|^0505|^1[0-9]{3}|^0[0-9]{2})([0-9]+)?([0-9]{4})$/,
            "$1-$2-$3"
        ).replace("--", "-");

        try {
            const res = await fetch(`http://localhost:8080/api/reservations?onedayClassId=${classDetail.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: selectedSessionId,
                    applicantName,
                    phoneNumber: formattedPhone
                }),
            });

            if (res.ok) {
                setIsSuccess(true); // 성공 화면으로 전환
                window.scrollTo(0, 0); // 스크롤 맨 위로
            } else {
                const errorText = await res.text();
                alert(`예약 실패: ${errorText}`);
            }
        } catch (e) {
            alert('서버 연결에 실패했습니다.');
        }
    };

    // --- 로딩 및 에러 화면 ---
    if (loading) return <div className="min-h-screen flex justify-center items-center bg-gray-50 text-gray-400 text-sm">로딩 중...</div>;
    if (error || !classDetail) return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-4 text-center">
            <div className="text-4xl mb-4">😢</div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">클래스를 찾을 수 없어요</h2>
            <p className="text-gray-500 text-sm">링크가 정확한지 확인해주세요.</p>
        </div>
    );

    // --- 예약 완료 화면 ---
    if (isSuccess) {
        return (
            <div className="min-h-screen bg-white flex flex-col justify-center items-center max-w-[480px] mx-auto shadow-2xl relative p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                    <span className="text-3xl">🎉</span>
                </div>
                <h2 className="text-2xl font-bold text-[#191F28] mb-2">예약 신청 완료!</h2>
                <p className="text-[#8B95A1] text-center mb-8 leading-relaxed">
                    강사님께 예약 내용이 전달되었습니다.<br/>
                    확정되면 연락드리겠습니다.
                </p>
                <div className="w-full bg-gray-50 rounded-xl p-5 mb-8 space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">클래스</span>
                        <span className="font-bold text-[#333D4B] text-right truncate ml-4">{classDetail.title}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">신청자</span>
                        <span className="font-bold text-[#333D4B]">{applicantName}</span>
                    </div>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="w-full py-3.5 bg-[#3182F6] text-white rounded-xl font-bold text-base hover:bg-[#1B64DA] transition-colors"
                >
                    확인
                </button>
            </div>
        );
    }

    // --- 메인 화면 (모바일 레이아웃 적용) ---
    return (
        <div className="min-h-screen bg-[#F2F4F6] flex justify-center">
            <div className="w-full max-w-[480px] bg-white min-h-screen shadow-2xl relative pb-24">

                {/* 상단 네비게이션 (심플) */}
                <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-gray-100 px-4 py-3 flex items-center justify-center">
                    <span className="font-bold text-[#191F28] text-sm">클래스 예약</span>
                </div>

                {/* 메인 컨텐츠 */}
                <div className="p-5 space-y-6">
                    {/* 타이틀 영역 */}
                    <div>
                        <span className="inline-block px-2 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded mb-2">
                            원데이 클래스
                        </span>
                        <h1 className="text-xl font-bold text-[#191F28] leading-snug mb-2">
                            {classDetail.title}
                        </h1>
                        <p className="text-[#8B95A1] text-sm flex items-center gap-1">
                            📍 {classDetail.location}
                        </p>
                    </div>

                    <div className="h-px bg-gray-100"></div>

                    {/* 1. 일정 선택 */}
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
                                        onClick={() => setSelectedSessionId(session.sessionId)}
                                        className={`p-4 rounded-xl border text-left transition-all flex justify-between items-center ${
                                            isSelected
                                                ? 'border-[#3182F6] bg-[#E8F3FF] ring-1 ring-[#3182F6]'
                                                : 'border-gray-200 bg-white hover:bg-gray-50'
                                        } ${isFull ? 'opacity-50 grayscale cursor-not-allowed bg-gray-100' : ''}`}
                                    >
                                        <div>
                                            <div className={`font-bold text-sm ${isSelected ? 'text-[#1B64DA]' : 'text-[#333D4B]'}`}>
                                                {session.date}
                                            </div>
                                            <div className="text-xs text-[#8B95A1] mt-0.5">
                                                {session.startTime.slice(0, 5)} ~ {session.endTime.slice(0, 5)}
                                            </div>
                                        </div>
                                        <div className={`text-[10px] font-bold px-2 py-1 rounded ${
                                            isSelected ? 'bg-[#3182F6] text-white' : 'bg-[#F2F4F6] text-[#6B7684]'
                                        }`}>
                                            {isFull ? '마감' : `${session.currentNum}/${session.capacity}명`}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    {/* 2. 신청자 정보 */}
                    <section>
                        <h3 className="font-bold text-[#191F28] mb-3 text-base">📝 신청자 정보</h3>
                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="이름 (실명)"
                                className="w-full p-3.5 bg-[#F9FAFB] rounded-xl text-[#191F28] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3182F6] transition-all border border-transparent focus:border-transparent placeholder-gray-400"
                                value={applicantName}
                                onChange={(e) => setApplicantName(e.target.value)}
                            />
                            <input
                                type="tel"
                                placeholder="연락처 (01012345678)"
                                className="w-full p-3.5 bg-[#F9FAFB] rounded-xl text-[#191F28] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3182F6] transition-all border border-transparent focus:border-transparent placeholder-gray-400"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                        </div>
                    </section>

                    <div className="h-px bg-gray-100"></div>

                    {/* 3. 클래스 상세 정보 */}
                    <section className="space-y-4">
                        <h3 className="font-bold text-[#191F28] text-base">상세 정보</h3>
                        <div className="bg-[#F9FAFB] rounded-xl p-4 text-sm text-[#4E5968] space-y-3">
                            <p className="leading-relaxed whitespace-pre-wrap">{classDetail.description}</p>

                            {(classDetail.material || classDetail.parkingInfo) && (
                                <div className="pt-3 border-t border-gray-200 space-y-2 text-xs">
                                    {classDetail.material && (
                                        <div className="flex gap-2">
                                            <span className="font-bold text-[#8B95A1] shrink-0">준비물</span>
                                            <span>{classDetail.material}</span>
                                        </div>
                                    )}
                                    {classDetail.parkingInfo && (
                                        <div className="flex gap-2">
                                            <span className="font-bold text-[#8B95A1] shrink-0">주차</span>
                                            <span>{classDetail.parkingInfo}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* 하단 고정 버튼 */}
                <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#F2F4F6] p-4 safe-area-bottom">
                    <button
                        onClick={handleReserve}
                        disabled={!selectedSessionId || !applicantName || !phoneNumber}
                        className={`w-full py-3.5 rounded-xl font-bold text-base transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                            (!selectedSessionId || !applicantName || !phoneNumber)
                                ? 'bg-[#E5E8EB] text-[#B0B8C1] cursor-not-allowed'
                                : 'bg-[#3182F6] text-white hover:bg-[#1B64DA] shadow-lg shadow-blue-100'
                        }`}
                    >
                        {classDetail.price.toLocaleString()}원 결제하기
                    </button>
                </div>
            </div>
        </div>
    );
}