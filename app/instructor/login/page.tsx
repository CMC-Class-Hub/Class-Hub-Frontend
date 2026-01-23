'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function InstructorLoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        businessName: '',
        name: '',
        phoneNumber: '',
    });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:8080/api/instructors/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                const instructorId = await res.json();
                localStorage.setItem('instructorId', instructorId.toString());
                router.push(`/instructor/${instructorId}/classes`);
            } else {
                alert('로그인 정보가 올바르지 않습니다.');
            }
        } catch (error) {
            console.error('로그인 에러:', error);
            alert('서버 연결에 실패했습니다.');
        }
    };

    return (
        <div className="min-h-screen bg-[#F2F4F6] flex flex-col justify-center items-center p-6">
            <div className="w-full max-w-md bg-white rounded-[32px] shadow-sm p-8 space-y-8">
                <header>
                    <h1 className="text-3xl font-bold text-[#191F28] leading-tight">
                        강사님,<br />
                        다시 만나서 반가워요
                    </h1>
                    <p className="text-[#8B95A1] mt-2 font-medium">
                        휴대폰 번호로 간편하게 로그인하세요
                    </p>
                </header>

                <form onSubmit={handleLogin} className="space-y-4">
                    {/* 상호명 입력 */}
                    <div>
                        <label className="block text-xs font-semibold text-[#8B95A1] mb-1.5 ml-1">상호명</label>
                        <input
                            type="text"
                            placeholder="클래스허브 스튜디오"
                            className="w-full p-4 bg-[#F2F4F6] rounded-2xl text-[#191F28] font-medium placeholder-[#B0B8C1] focus:outline-none focus:ring-2 focus:ring-[#3182F6] transition duration-200"
                            required
                            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                        />
                    </div>

                    {/* 이름 입력 */}
                    <div>
                        <label className="block text-xs font-semibold text-[#8B95A1] mb-1.5 ml-1">이름</label>
                        <input
                            type="text"
                            placeholder="홍길동"
                            className="w-full p-4 bg-[#F2F4F6] rounded-2xl text-[#191F28] font-medium placeholder-[#B0B8C1] focus:outline-none focus:ring-2 focus:ring-[#3182F6] transition duration-200"
                            required
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    {/* 연락처 입력 */}
                    <div>
                        <label className="block text-xs font-semibold text-[#8B95A1] mb-1.5 ml-1">휴대폰 번호</label>
                        <input
                            type="text"
                            placeholder="010-0000-0000"
                            className="w-full p-4 bg-[#F2F4F6] rounded-2xl text-[#191F28] font-medium placeholder-[#B0B8C1] focus:outline-none focus:ring-2 focus:ring-[#3182F6] transition duration-200"
                            required
                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        />
                    </div>

                    <div className="pt-4">
                        <button className="w-full py-4 bg-[#3182F6] text-white rounded-2xl font-bold text-lg hover:bg-[#1B64DA] active:scale-[0.98] transition-all duration-200 shadow-sm">
                            시작하기
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}