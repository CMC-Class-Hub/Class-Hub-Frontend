'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

// --- 타입 정의 ---
interface SessionData {
    sessionId?: number;
    date: string;
    startTime: string;
    endTime: string;
    capacity: number;
    currentNum?: number;
    status?: string;
}

interface ClassDetailData {
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
    sessions: SessionData[];
}

interface ReservationUser {
    reservationId: number;
    applicantName: string;
    phoneNumber: string;
}

export default function InstructorClassDetailPage() {
    const { shareCode } = useParams();
    const router = useRouter();

    // --- 상태 관리 ---
    const [classDetail, setClassDetail] = useState<ClassDetailData | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<ClassDetailData | null>(null);

    // 신청자 목록 조회용 상태
    const [expandedSessionId, setExpandedSessionId] = useState<number | null>(null);
    const [applicants, setApplicants] = useState<ReservationUser[]>([]);
    const [loadingApplicants, setLoadingApplicants] = useState(false);

    // 1. 초기 데이터 로드
    useEffect(() => {
        if (!shareCode) return;

        fetch(`http://localhost:8080/api/classes/shared/${shareCode}`)
            .then(res => {
                if (!res.ok) throw new Error('데이터 로드 실패');
                return res.json();
            })
            .then(data => {
                setClassDetail(data);
                setEditForm(data);
            })
            .catch((err) => {
                console.error(err);
                alert('클래스 정보를 불러오지 못했습니다.');
                router.back();
            });
    }, [shareCode, router]);

    // 2. 세션 클릭 핸들러 (신청자 목록 조회)
    const handleSessionClick = async (sessionId: number | undefined) => {
        if (!sessionId) return;
        if (isEditing) return; // 수정 모드일 때는 펼치기 기능 비활성화

        // 이미 펼쳐진 세션을 다시 클릭하면 닫기
        if (expandedSessionId === sessionId) {
            setExpandedSessionId(null);
            setApplicants([]);
            return;
        }

        // 펼치기 및 데이터 로딩 시작
        setExpandedSessionId(sessionId);
        setLoadingApplicants(true);
        setApplicants([]); // 기존 데이터 초기화

        try {
            const res = await fetch(`http://localhost:8080/api/reservations/session/${sessionId}`);
            if (!res.ok) throw new Error("신청자 목록 조회 실패");
            const data = await res.json();
            setApplicants(data);
        } catch (e) {
            console.error(e);
            alert("신청자 목록을 불러오는데 실패했습니다.");
            setExpandedSessionId(null); // 에러 시 닫기
        } finally {
            setLoadingApplicants(false);
        }
    };

    // 3. 클래스 수정 저장 핸들러
    const handleUpdate = async () => {
        if (!editForm) return;
        try {
            const res = await fetch(`http://localhost:8080/api/classes/${classDetail?.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm),
            });
            if (res.ok) {
                alert('수정 완료!');
                setIsEditing(false);
                window.location.reload(); // 최신 데이터 반영을 위해 새로고침
            } else {
                alert('수정에 실패했습니다.');
            }
        } catch (e) { alert('서버 오류'); }
    };

    // 4. 클래스 삭제 핸들러
    const handleDelete = async () => {
        if (!confirm('정말 삭제하시겠습니까? 복구할 수 없습니다.')) return;
        try {
            const res = await fetch(`http://localhost:8080/api/classes/${classDetail?.id}`, { method: 'DELETE' });
            if (res.ok) {
                alert('삭제되었습니다.');
                router.back(); // 목록으로 이동
            }
        } catch (e) { alert('서버 오류'); }
    };

    // 5. 세션 관리(추가/삭제/변경) 핸들러 (수정 모드용)
    const handleAddSession = () => {
        if (!editForm) return;
        setEditForm({ ...editForm, sessions: [...editForm.sessions, { date: '', startTime: '', endTime: '', capacity: 0 }] });
    };
    const handleRemoveSession = (idx: number) => {
        if (!editForm || editForm.sessions.length <= 1) return alert('최소 1개의 일정은 필요해요');
        setEditForm({ ...editForm, sessions: editForm.sessions.filter((_, i) => i !== idx) });
    };
    const handleSessionChange = (idx: number, field: keyof SessionData, val: any) => {
        if (!editForm) return;
        const s = [...editForm.sessions];
        if (field === 'startTime' || field === 'endTime') {
            // 시간 포맷 (HH:mm -> HH:mm:00)
            s[idx] = { ...s[idx], [field]: val.length === 5 ? val + ':00' : val };
        } else {
            s[idx] = { ...s[idx], [field]: val };
        }
        setEditForm({ ...editForm, sessions: s });
    };

    // 로딩 화면
    if (!classDetail || !editForm) return <div className="min-h-screen flex justify-center items-center text-[#8B95A1] bg-[#F2F4F6]">로딩 중...</div>;

    return (
        <div className="min-h-screen bg-[#F2F4F6] pb-32">
            {/* 상단 네비게이션 */}
            <div className="bg-white sticky top-0 z-10 px-4 py-4 flex items-center border-b border-[#F2F4F6]">
                <button onClick={() => isEditing ? setIsEditing(false) : router.back()} className="text-2xl mr-2 text-[#191F28] p-2 hover:bg-gray-100 rounded-full transition-colors">←</button>
                <h1 className="text-lg font-bold text-[#191F28]">{isEditing ? '클래스 수정' : '클래스 상세 관리'}</h1>
                {isEditing && <button onClick={handleDelete} className="ml-auto text-red-500 text-sm font-bold px-3 py-2 hover:bg-red-50 rounded-lg">삭제</button>}
            </div>

            <div className="p-4 max-w-xl mx-auto space-y-4">
                {/* 1. 기본 정보 카드 */}
                <div className="bg-white rounded-[24px] p-6 shadow-sm">
                    <h2 className="text-lg font-bold mb-4 text-[#191F28]">기본 정보</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-[#8B95A1] ml-1">클래스명</label>
                            {isEditing ? (
                                <input type="text" className="w-full p-3 bg-[#F9FAFB] rounded-xl mt-1 text-[#191F28] font-medium focus:ring-2 focus:ring-[#3182F6] outline-none transition-all" value={editForm.title} onChange={(e) => setEditForm({...editForm, title: e.target.value})} />
                            ) : (
                                <p className="text-[#191F28] font-bold text-xl p-1">{classDetail.title}</p>
                            )}
                        </div>
                        <div>
                            <label className="text-xs font-bold text-[#8B95A1] ml-1">수강료</label>
                            {isEditing ? (
                                <input type="number" className="w-full p-3 bg-[#F9FAFB] rounded-xl mt-1 text-[#191F28] font-medium focus:ring-2 focus:ring-[#3182F6] outline-none transition-all" value={editForm.price} onChange={(e) => setEditForm({...editForm, price: Number(e.target.value)})} />
                            ) : (
                                <p className="text-[#191F28] font-medium p-1">{classDetail.price.toLocaleString()}원</p>
                            )}
                        </div>
                        <div>
                            <label className="text-xs font-bold text-[#8B95A1] ml-1">소개</label>
                            {isEditing ? (
                                <textarea className="w-full p-3 bg-[#F9FAFB] rounded-xl mt-1 min-h-[100px] text-[#191F28] font-medium resize-none focus:ring-2 focus:ring-[#3182F6] outline-none transition-all" value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} />
                            ) : (
                                <p className="text-[#4E5968] p-1 whitespace-pre-wrap leading-relaxed">{classDetail.description}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. 세션(일정) 관리 카드 */}
                <div className="bg-white rounded-[24px] p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-[#191F28]">일정 관리</h2>
                        {isEditing && <button onClick={handleAddSession} className="text-[#3182F6] text-sm font-bold bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">+ 추가</button>}
                    </div>

                    <div className="space-y-3">
                        {(isEditing ? editForm.sessions : classDetail.sessions).map((session, idx) => (
                            <div key={idx}>
                                {isEditing ? (
                                    /* 수정 모드: 입력 폼 */
                                    <div className="bg-[#F9FAFB] p-4 rounded-2xl border border-[#E5E8EB] space-y-2">
                                        <div className="flex justify-between">
                                            <input type="date" className="bg-transparent font-medium text-[#191F28] outline-none" value={session.date} onChange={(e) => handleSessionChange(idx, 'date', e.target.value)} />
                                            <button onClick={() => handleRemoveSession(idx)} className="text-red-500 text-sm font-medium hover:underline">삭제</button>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <input type="time" className="bg-transparent text-[#191F28] outline-none" value={session.startTime.slice(0,5)} onChange={(e) => handleSessionChange(idx, 'startTime', e.target.value)} />
                                            <span className="text-[#8B95A1]">~</span>
                                            <input type="time" className="bg-transparent text-[#191F28] outline-none" value={session.endTime.slice(0,5)} onChange={(e) => handleSessionChange(idx, 'endTime', e.target.value)} />
                                        </div>
                                        <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                                            <span className="text-xs text-[#8B95A1]">정원</span>
                                            <input type="number" className="bg-white w-16 px-2 py-1 rounded border border-gray-300 text-center text-[#191F28] text-sm" value={session.capacity} onChange={(e) => handleSessionChange(idx, 'capacity', Number(e.target.value))} />
                                            <span className="text-xs text-[#8B95A1]">명</span>
                                        </div>
                                    </div>
                                ) : (
                                    /* 조회 모드: 클릭 시 신청자 목록 펼쳐짐 */
                                    <div className={`rounded-2xl border transition-all overflow-hidden ${
                                        expandedSessionId === session.sessionId
                                            ? 'bg-[#E8F3FF] border-[#3182F6] shadow-md'
                                            : 'bg-white border-[#E5E8EB] hover:border-blue-200'
                                    }`}>
                                        <button
                                            onClick={() => handleSessionClick(session.sessionId)}
                                            className="w-full p-4 flex justify-between items-center text-left"
                                        >
                                            <div>
                                                <div className={`font-bold text-lg ${expandedSessionId === session.sessionId ? 'text-[#1B64DA]' : 'text-[#191F28]'}`}>
                                                    {session.date}
                                                </div>
                                                <div className="text-sm text-[#8B95A1] mt-1">
                                                    {session.startTime.slice(0,5)} ~ {session.endTime.slice(0,5)}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <div className={`text-sm font-bold ${expandedSessionId === session.sessionId ? 'text-[#1B64DA]' : 'text-[#333D4B]'}`}>
                                                    {session.currentNum} / {session.capacity}명
                                                </div>
                                                <span className="text-[10px] text-[#8B95A1]">
                                                    {expandedSessionId === session.sessionId ? '접기 ▲' : '명단 보기 ▼'}
                                                </span>
                                            </div>
                                        </button>

                                        {/* 펼쳐진 화면: 신청자 리스트 */}
                                        {expandedSessionId === session.sessionId && (
                                            <div className="px-4 pb-4">
                                                <div className="h-px bg-[#3182F6] opacity-20 mb-3 mx-1"></div>

                                                {loadingApplicants ? (
                                                    <div className="text-center text-sm text-[#8B95A1] py-2">불러오는 중...</div>
                                                ) : applicants.length > 0 ? (
                                                    <ul className="space-y-2">
                                                        {applicants.map((user) => (
                                                            <li key={user.reservationId} className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-[#E8F3FF]">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-full bg-[#F2F4F6] flex items-center justify-center text-[#8B95A1] text-xs font-bold">
                                                                        {user.applicantName.charAt(0)}
                                                                    </div>
                                                                    <span className="text-[#333D4B] font-bold text-sm">{user.applicantName}</span>
                                                                </div>
                                                                <a href={`tel:${user.phoneNumber}`} className="text-[#3182F6] text-sm font-medium hover:underline flex items-center gap-1">
                                                                    📞 {user.phoneNumber}
                                                                </a>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <div className="text-center text-sm text-[#8B95A1] py-4 bg-white/60 rounded-xl border border-dashed border-gray-300">
                                                        아직 신청자가 없습니다.
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. 기타 정보 (장소, 안내사항 등) */}
                <div className="bg-white rounded-[24px] p-6 shadow-sm">
                    <h2 className="text-lg font-bold mb-4 text-[#191F28]">상세 정보</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-[#8B95A1] ml-1">장소</label>
                            {isEditing ? (
                                <input type="text" className="w-full p-3 bg-[#F9FAFB] rounded-xl mt-1 text-[#191F28] font-medium focus:ring-2 focus:ring-[#3182F6] outline-none transition-all" value={editForm.location} onChange={(e) => setEditForm({...editForm, location: e.target.value})} />
                            ) : (
                                <p className="p-1 text-[#191F28]">{classDetail.location}</p>
                            )}
                        </div>
                        <div>
                            <label className="text-xs font-bold text-[#8B95A1] ml-1">준비물</label>
                            {isEditing ? (
                                <input type="text" className="w-full p-3 bg-[#F9FAFB] rounded-xl mt-1 text-[#191F28] font-medium focus:ring-2 focus:ring-[#3182F6] outline-none transition-all" value={editForm.material} onChange={(e) => setEditForm({...editForm, material: e.target.value})} />
                            ) : (
                                <p className="p-1 text-[#191F28]">{classDetail.material}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 하단 고정 버튼 */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#F2F4F6] p-4 pb-8 safe-area-bottom shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                <div className="max-w-xl mx-auto">
                    {isEditing ? (
                        <button
                            onClick={handleUpdate}
                            className="w-full py-4 bg-[#3182F6] text-white rounded-2xl font-bold text-lg hover:bg-[#1B64DA] active:scale-[0.98] transition-all shadow-lg shadow-blue-100"
                        >
                            저장하기
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="w-full py-4 bg-[#3182F6] text-white rounded-2xl font-bold text-lg hover:bg-[#1B64DA] active:scale-[0.98] transition-all shadow-lg shadow-blue-100"
                        >
                            수정하기
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}