'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

      </div>

      <p className="mt-8 text-xs text-[#B0B8C1] text-center">
        © 2026 Class Hub. All rights reserved.
      </p>
    </div>
  );
}
