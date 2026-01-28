'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [code, setCode] = useState('');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    router.push(`/class/${code.trim()}`);
  };

  return (
    <div className="min-h-screen bg-[#F2F4F6] flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-xl p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Brand Section */}
        <div className="text-center mb-10 space-y-3">
          <div className="inline-flex justify-center items-center w-16 h-16 bg-blue-50 rounded-2xl mb-2 text-3xl">
            🧩
          </div>
          <h1 className="text-3xl font-bold text-[#191F28] tracking-tight">Class Hub</h1>
          <p className="text-[#8B95A1] font-medium">
            일상을 특별하게 채우는 시간
          </p>
        </div>

        {/* Input Section */}
        <form onSubmit={handleJoin} className="space-y-4 mb-8">
          <div className="space-y-2">
            <label htmlFor="code" className="text-xs font-bold text-[#8B95A1] ml-1">클래스 코드</label>
            <input
              id="code"
              type="text"
              placeholder="코드를 입력하세요 (예: test)"
              className="w-full p-4 bg-[#F9FAFB] rounded-xl text-[#191F28] font-medium text-lg placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3182F6] transition-all"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={!code.trim()}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all active:scale-[0.98] ${code.trim()
              ? 'bg-[#3182F6] text-white hover:bg-[#1B64DA] shadow-lg shadow-blue-200'
              : 'bg-[#E5E8EB] text-[#B0B8C1] cursor-not-allowed'
              }`}
          >
            클래스 보러가기
          </button>
        </form>

        <div className="h-px bg-gray-100 mb-8"></div>

        {/* Menu Section */}
        <div className="space-y-3">
          <Link
            href="/reservations"
            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-sm group-hover:scale-110 transition-transform">📅</span>
              <span className="font-bold text-[#333D4B]">내 예약 확인하기</span>
            </div>
            <span className="text-gray-400 text-sm">→</span>
          </Link>

          {/* Future features placehoder */}
          {/* <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group text-left">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-sm group-hover:scale-110 transition-transform">✨</span>
              <span className="font-bold text-[#333D4B]">인기 클래스 둘러보기</span>
            </div>
            <span className="text-[#3182F6] text-xs font-bold bg-blue-50 px-2 py-1 rounded">Coming Soon</span>
          </button> */}
        </div>
      </div>

      <p className="mt-8 text-xs text-[#B0B8C1] text-center">
        © 2026 Class Hub. All rights reserved.
      </p>
    </div>
  );
}
