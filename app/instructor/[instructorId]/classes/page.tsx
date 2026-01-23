'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DaumPostcode from 'react-daum-postcode';

// 1. 타입 정의
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
    shareCode: string;
    title: string;
    description: string;
    location: string;
    locationDescription?: string;
    price: number;
    deposit: number;
    material?: string;
    parkingInfo?: string;
    guidelines?: string;
    policy?: string;
    sessions: SessionResponse[];
}

interface SessionCreateRequest {
    date: string;
    startTime: string;
    endTime: string;
    capacity: number;
}

export default function InstructorDashboard() {
    const { instructorId } = useParams();
    const router = useRouter();
    const [classes, setClasses] = useState<ClassDetailResponse[]>([]);

    // 모달 상태
    const [showForm, setShowForm] = useState(false);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

    // ✨ 성공 모달 관련 상태 ✨
    const [createdClass, setCreatedClass] = useState<ClassDetailResponse | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // 클래스 생성용 상태
    const [newClass, setNewClass] = useState({
        title: '',
        description: '',
        location: '',
        locationDescription: '',
        price: 0,
        deposit: 0,
        material: '',
        parkingInfo: '',
        guidelines: '',
        policy: '',
        sessions: [{ date: '', startTime: '', endTime: '', capacity: 0 }] as SessionCreateRequest[]
    });

    // D-Day 계산 함수
    const getDDay = (dateStr: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const target = new Date(dateStr);
        target.setHours(0, 0, 0, 0);

        const diffTime = target.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return '종료';
        if (diffDays === 0) return 'D-Day';
        return `D-${diffDays}`;
    };

    // 상태 라벨 및 스타일 반환 함수
    const getStatusInfo = (session: SessionResponse) => {
        const dDay = getDDay(session.date);

        if (dDay === '종료') {
            return { label: '종료', color: 'bg-gray-100 text-gray-500' };
        }
        if (session.currentNum >= session.capacity || session.status === 'FULL') {
            return { label: '마감', color: 'bg-red-100 text-red-600' };
        }
        return { label: '모집중', color: 'bg-blue-100 text-blue-600' };
    };

    // 링크 복사 함수
    const handleCopyLink = (shareCode: string) => {
        const url = `${window.location.origin}/class/${shareCode}`;
        navigator.clipboard.writeText(url);
        alert('수강생용 초대 링크가 복사되었습니다! 📋\n(수강생에게 전달해주세요)');
    };

    // 주소 검색 완료 핸들러
    const handleAddressComplete = (data: any) => {
        let fullAddress = data.address;
        let extraAddress = '';

        if (data.addressType === 'R') {
            if (data.bname !== '') extraAddress += data.bname;
            if (data.buildingName !== '') extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
            fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
        }
        setNewClass({ ...newClass, location: fullAddress });
        setIsAddressModalOpen(false);
    };

    const fetchClasses = useCallback(async () => {
        if (!instructorId) return;
        try {
            const res = await fetch(`http://localhost:8080/api/instructors/${instructorId}/classes`);
            if (res.ok) {
                const data = await res.json();
                setClasses(data);
                return data; // 데이터 반환 (생성 후 찾기 위해)
            }
        } catch (error) {
            console.error('클래스 목록 로드 실패:', error);
        }
        return [];
    }, [instructorId]);

    useEffect(() => {
        fetchClasses();
    }, [fetchClasses]);

    const handleCreateClass = async () => {
        if (!newClass.title || !newClass.price || !newClass.location || !newClass.description) {
            return alert('수업 제목, 소개, 장소, 가격은 필수 정보입니다.');
        }
        try {
            const res = await fetch('http://localhost:8080/api/classes/instructor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newClass, instructorId: Number(instructorId) }),
            });

            if (res.ok) {
                const newClassId = await res.json(); // 생성된 ID 가정 (혹은 응답값에 따라 수정)
                const updatedList = await fetchClasses(); // 목록 갱신
                const createdItem = updatedList.find((item: any) => item.id === newClassId);

                if (createdItem) {
                    setCreatedClass(createdItem);
                    setShowSuccessModal(true); // ✨ 성공 모달 띄우기
                }

                setShowForm(false);
                setNewClass({
                    title: '', description: '', location: '', locationDescription: '',
                    price: 0, deposit: 0, material: '', parkingInfo: '', guidelines: '', policy: '',
                    sessions: [{ date: '', startTime: '', endTime: '', capacity: 0 }]
                });
            } else {
                alert('클래스 생성에 실패했습니다.');
            }
        } catch (error) {
            console.error(error);
            alert('서버 연결 실패');
        }
    };

    return (
        <div className="min-h-screen bg-[#F2F4F6] p-6 pb-32 relative">
            <div className="max-w-2xl mx-auto">
                <header className="flex justify-between items-end mb-8 pt-4">
                    <div>
                        <h1 className="text-[26px] font-bold text-[#191F28]">내 클래스</h1>
                        <p className="text-[#8B95A1] mt-1 font-medium">관리할 수업을 선택해주세요</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className={`px-5 py-2.5 rounded-2xl font-bold transition-all ${
                            showForm ? 'bg-[#E5E8EB] text-[#6B7684]' : 'bg-[#3182F6] text-white shadow-md hover:bg-[#1B64DA]'
                        }`}
                    >
                        {showForm ? '닫기' : '새 클래스'}
                    </button>
                </header>

                {showForm && (
                    <div className="bg-white rounded-[32px] p-8 shadow-sm mb-8 animate-fade-in-up space-y-8">
                        <div>
                            <h2 className="text-xl font-bold text-[#191F28]">클래스 기본 정보</h2>
                            <p className="text-[#8B95A1] text-sm mt-1">수강생들에게 보여질 정보를 입력해주세요</p>
                        </div>
                        {/* ... (기존 입력 폼 유지) ... */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-[#8B95A1] mb-1.5 ml-1">클래스 제목</label>
                                <input
                                    type="text"
                                    placeholder="예: 나만의 우드카빙 도마 만들기"
                                    className="w-full p-4 bg-[#F2F4F6] rounded-2xl font-medium text-[#191F28] focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
                                    value={newClass.title}
                                    onChange={(e) => setNewClass({ ...newClass, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#8B95A1] mb-1.5 ml-1">수업 소개</label>
                                <textarea
                                    placeholder="수강생들이 궁금해할 매력 포인트를 적어주세요."
                                    className="w-full p-4 bg-[#F2F4F6] rounded-2xl font-medium text-[#191F28] focus:outline-none focus:ring-2 focus:ring-[#3182F6] min-h-[120px] resize-none"
                                    value={newClass.description}
                                    onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-[#6B7684] ml-1 pt-2">장소 및 위치 정보</h3>
                            <div>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        readOnly
                                        placeholder="주소를 검색해주세요"
                                        className="w-full p-4 bg-[#F2F4F6] rounded-2xl font-medium text-[#191F28] cursor-pointer"
                                        value={newClass.location}
                                        onClick={() => setIsAddressModalOpen(true)}
                                    />
                                    <button
                                        onClick={() => setIsAddressModalOpen(true)}
                                        className="bg-[#3182F6] text-white px-5 rounded-2xl font-bold whitespace-nowrap hover:bg-[#1B64DA]"
                                    >
                                        주소 검색
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    placeholder="상세 위치 안내"
                                    className="w-full p-4 bg-[#F2F4F6] rounded-2xl font-medium text-[#191F28] mb-2"
                                    value={newClass.locationDescription}
                                    onChange={(e) => setNewClass({ ...newClass, locationDescription: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="주차 정보"
                                    className="w-full p-4 bg-[#F2F4F6] rounded-2xl font-medium text-[#191F28]"
                                    value={newClass.parkingInfo}
                                    onChange={(e) => setNewClass({ ...newClass, parkingInfo: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-[#6B7684] ml-1 pt-2">안내 사항</h3>
                            <input
                                type="text"
                                placeholder="준비물"
                                className="w-full p-4 bg-[#F2F4F6] rounded-2xl font-medium text-[#191F28]"
                                value={newClass.material}
                                onChange={(e) => setNewClass({ ...newClass, material: e.target.value })}
                            />
                            <textarea
                                placeholder="주의사항"
                                className="w-full p-4 bg-[#F2F4F6] rounded-2xl font-medium text-[#191F28] min-h-[80px]"
                                value={newClass.guidelines}
                                onChange={(e) => setNewClass({ ...newClass, guidelines: e.target.value })}
                            />
                            <textarea
                                placeholder="취소 및 환불 규정"
                                className="w-full p-4 bg-[#F2F4F6] rounded-2xl font-medium text-[#191F28] min-h-[80px]"
                                value={newClass.policy}
                                onChange={(e) => setNewClass({ ...newClass, policy: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-[#8B95A1] ml-1">수강료</label>
                                <input
                                    type="number"
                                    placeholder="0원"
                                    className="w-full p-4 bg-[#F2F4F6] rounded-2xl font-medium text-[#191F28]"
                                    value={newClass.price || ''}
                                    onChange={(e) => setNewClass({ ...newClass, price: Number(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-[#8B95A1] ml-1">보증금</label>
                                <input
                                    type="number"
                                    placeholder="0원"
                                    className="w-full p-4 bg-[#F2F4F6] rounded-2xl font-medium text-[#191F28]"
                                    value={newClass.deposit || ''}
                                    onChange={(e) => setNewClass({ ...newClass, deposit: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="pt-4 border-t border-[#F2F4F6]">
                            <h3 className="text-sm font-bold text-[#6B7684] mb-3 ml-1">세션 일정 (1회차)</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="date"
                                    className="col-span-2 p-4 bg-[#F2F4F6] rounded-2xl font-medium text-[#191F28]"
                                    onChange={(e) => {
                                        const sessions = [...newClass.sessions];
                                        sessions[0].date = e.target.value;
                                        setNewClass({ ...newClass, sessions });
                                    }}
                                />
                                <input
                                    type="time"
                                    className="p-4 bg-[#F2F4F6] rounded-2xl font-medium text-[#191F28]"
                                    onChange={(e) => {
                                        const sessions = [...newClass.sessions];
                                        sessions[0].startTime = e.target.value + ':00';
                                        setNewClass({ ...newClass, sessions });
                                    }}
                                />
                                <input
                                    type="time"
                                    className="p-4 bg-[#F2F4F6] rounded-2xl font-medium text-[#191F28]"
                                    onChange={(e) => {
                                        const sessions = [...newClass.sessions];
                                        sessions[0].endTime = e.target.value + ':00';
                                        setNewClass({ ...newClass, sessions });
                                    }}
                                />
                                <input
                                    type="number"
                                    placeholder="정원 (명)"
                                    className="col-span-2 p-4 bg-[#F2F4F6] rounded-2xl font-medium text-[#191F28]"
                                    onChange={(e) => {
                                        const sessions = [...newClass.sessions];
                                        sessions[0].capacity = Number(e.target.value);
                                        setNewClass({ ...newClass, sessions });
                                    }}
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleCreateClass}
                            className="w-full py-4 mt-4 bg-[#3182F6] text-white rounded-2xl font-bold text-lg hover:bg-[#1B64DA] shadow-md"
                        >
                            클래스 개설하기
                        </button>
                    </div>
                )}

                {/* 클래스 리스트 영역 */}
                <div className="space-y-4">
                    {classes.length === 0 ? (
                        <div className="text-center py-20 text-[#8B95A1]">
                            <p>개설된 클래스가 없어요.<br />새로운 수업을 만들어보세요!</p>
                        </div>
                    ) : (
                        classes.map((item) => (
                            <div
                                key={item.id}
                                className="group bg-white rounded-[28px] p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-transparent hover:border-[#3182F6]/20 cursor-default"
                            >
                                {/* ... 기존 리스트 UI 유지 ... */}
                                <div className="mb-4">
                                    <div className="flex justify-between items-start">
                                        <h2 className="text-xl font-bold text-[#191F28] mb-1 group-hover:text-[#3182F6] transition-colors leading-tight">
                                            {item.title}
                                        </h2>
                                        <div className="bg-[#E8F3FF] text-[#1B64DA] px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap ml-2">
                                            {item.price.toLocaleString()}원
                                        </div>
                                    </div>
                                    <a
                                        href={`https://map.naver.com/v5/search/${encodeURIComponent(item.location)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#8B95A1] font-medium text-sm flex items-center gap-1 hover:text-[#3182F6] hover:underline cursor-pointer w-fit mt-1"
                                    >
                                        📍 {item.location}
                                    </a>
                                </div>

                                <div className="space-y-3 mb-5">
                                    {item.sessions.map((session) => {
                                        const statusInfo = getStatusInfo(session);
                                        const dDay = getDDay(session.date);

                                        return (
                                            <div key={session.sessionId} className="flex justify-between items-center bg-[#F9FAFB] p-4 rounded-2xl border border-[#F2F4F6]">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-bold text-[#191F28]">{session.date}</span>
                                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${dDay === '종료' ? 'bg-gray-200 text-gray-500' : 'bg-red-50 text-red-500'}`}>
                                                            {dDay}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-[#4E5968]">
                                                        {session.startTime.slice(0, 5)} ~ {session.endTime.slice(0, 5)}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`text-xs font-bold px-2.5 py-1 rounded-full mb-1 inline-block ${statusInfo.color}`}>
                                                        {statusInfo.label}
                                                    </div>
                                                    <div className="text-sm font-bold text-[#191F28]">
                                                        <span className="text-[#3182F6]">{session.currentNum}</span>
                                                        <span className="text-[#B0B8C1]">/{session.capacity}명</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-[#F2F4F6]">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCopyLink(item.shareCode);
                                            }}
                                            className="text-xs font-bold text-[#191F28] bg-[#F2F4F6] px-3 py-1.5 rounded-lg hover:bg-[#E5E8EB] transition-colors flex items-center gap-1"
                                        >
                                            🔗 초대 링크 복사
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => router.push(`/instructor/class/${item.shareCode}`)}
                                        className="text-[#3182F6] text-sm font-bold hover:underline flex items-center gap-1"
                                    >
                                        상세보기
                                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {isAddressModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative">
                        <div className="flex justify-between items-center p-5 border-b">
                            <h3 className="font-bold text-lg text-[#191F28]">주소 검색</h3>
                            <button onClick={() => setIsAddressModalOpen(false)} className="text-[#8B95A1] text-2xl">✕</button>
                        </div>
                        <div className="h-[500px]">
                            <DaumPostcode onComplete={handleAddressComplete} style={{ height: '100%' }} />
                        </div>
                    </div>
                </div>
            )}

            {/* ✨ 클래스 개설 성공 모달 (안내 메시지 예시 포함) ✨ */}
            {/* ✨ 성공 모달 (위로 잘림 방지 스타일 적용) ✨ */}
            {showSuccessModal && createdClass && (
                <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/60 animate-fade-in">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="bg-white rounded-[32px] w-full max-w-md p-6 shadow-2xl relative animate-fade-in-up my-8">

                            {/* 헤더 */}
                            <div className="text-center mb-6">
                                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-3xl">🎉</span>
                                </div>
                                <h3 className="text-xl font-bold text-[#191F28] mb-1">클래스가 생성되었습니다</h3>
                                <p className="text-[#6B7684] text-sm">
                                    클래스 일정에 맞춰 수강생에게<br/>
                                    아래 안내 메시지가 <span className="text-[#3182F6] font-bold">자동 발송</span>됩니다.
                                </p>
                            </div>

                            {/* D-3 메시지 미리보기 */}
                            <div className="bg-[#F2F4F6] p-5 rounded-2xl mb-4 text-sm text-[#4E5968] relative">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-bold text-[#191F28]">🔔 D-3 안내</span>
                                    <span className="text-[10px] bg-white px-2 py-0.5 rounded border text-[#8B95A1]">자동 발송</span>
                                </div>
                                <p className="mb-2">안녕하세요 👋<br/>
                                    <span className="font-bold text-[#191F28]">[{createdClass.title}]</span> 클래스 일정이 다가오고 있어 안내드립니다.</p>

                                <div className="bg-white p-3 rounded-xl border border-[#E5E8EB] space-y-1 mb-2 text-xs">
                                    <p>📅 <span className="font-bold">일정:</span> {createdClass.sessions[0].date} / {createdClass.sessions[0].startTime.slice(0,5)}</p>
                                    <p>📍 <span className="font-bold">장소:</span> {createdClass.location}</p>
                                </div>
                                <p className="text-xs">자세한 내용은 아래 링크를 확인해주세요.</p>
                            </div>

                            {/* D-1 메시지 미리보기 */}
                            <div className="bg-[#F2F4F6] p-5 rounded-2xl mb-6 text-sm text-[#4E5968] relative">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-bold text-[#191F28]">🔔 D-1 안내</span>
                                    <span className="text-[10px] bg-white px-2 py-0.5 rounded border text-[#8B95A1]">자동 발송</span>
                                </div>
                                <p className="mb-2">내일 <span className="font-bold text-[#191F28]">[{createdClass.title}]</span> 클래스가 진행됩니다!</p>

                                <div className="bg-white p-3 rounded-xl border border-[#E5E8EB] space-y-1 mb-2 text-xs">
                                    <p>📅 <span className="font-bold">일정:</span> {createdClass.sessions[0].date} / {createdClass.sessions[0].startTime.slice(0,5)}</p>
                                    <p>📍 <span className="font-bold">장소:</span> {createdClass.location}</p>
                                    <p>🎒 <span className="font-bold">준비물:</span> {createdClass.material || '없음'}</p>
                                    <p>🚗 <span className="font-bold">주차:</span> {createdClass.parkingInfo || '정보 없음'}</p>
                                </div>
                                <p className="text-xs text-[#8B95A1]">*취소는 오늘까지 가능하며, 이후는 취소가 어렵습니다.<br/>필요한 정보는 아래 링크를 이용해주세요.</p>
                            </div>

                            {/* 운영 링크 및 닫기 버튼 */}
                            <div className="space-y-3">
                                <div className="bg-[#F9FAFB] p-4 rounded-xl flex justify-between items-center border border-[#E5E8EB]">
                                    <div className="overflow-hidden">
                                        <p className="text-xs text-[#8B95A1] font-bold mb-0.5">운영 링크</p>
                                        <p className="text-[#3182F6] font-bold text-sm truncate pr-2">
                                            {`${window.location.origin}/class/${createdClass.shareCode}`}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleCopyLink(createdClass.shareCode)}
                                        className="bg-white border border-[#E5E8EB] text-[#333D4B] px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap hover:bg-gray-50"
                                    >
                                        복사
                                    </button>
                                </div>

                                <button
                                    onClick={() => setShowSuccessModal(false)}
                                    className="w-full py-4 bg-[#3182F6] text-white rounded-2xl font-bold text-lg hover:bg-[#1B64DA] transition-all shadow-lg shadow-blue-100"
                                >
                                    확인
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}