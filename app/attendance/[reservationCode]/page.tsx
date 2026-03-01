'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { reservationApi } from '@/lib/api';

export default function AttendancePage() {
  const params = useParams();
  const router = useRouter();
  const reservationCode = params.reservationCode as string;

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('출석 처리 중입니다...');

  useEffect(() => {
    if (!reservationCode) return;

    const markAttendance = async () => {
      try {
        await reservationApi.markAsPresent(reservationCode);
        setStatus('success');
        setMessage('출석 처리가 완료되었습니다.');
      } catch (error: any) {
        console.error('Attendance error:', error);
        setStatus('error');
        setMessage(error.message || '출석 처리에 실패했습니다.');
      }
    };

    markAttendance();
  }, [reservationCode]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm text-center space-y-8 animate-in fade-in zoom-in duration-500">
        {/* Visual Feedback Circle */}
        <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
          {status === 'loading' && (
            <div className="absolute inset-0 border-4 border-blue-50 border-t-blue-500 rounded-full animate-spin" />
          )}

          <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${status === 'success' ? 'bg-green-500 scale-110 shadow-lg shadow-green-100' :
              status === 'error' ? 'bg-red-500 scale-110 shadow-lg shadow-red-100' :
                'bg-gray-100'
            }`}>
            {status === 'loading' && (
              <span className="text-2xl">⏳</span>
            )}
            {status === 'success' && (
              <svg className="w-12 h-12 text-white animate-bounce-short" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {status === 'error' && (
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
        </div>

        {/* Text Feedback */}
        <div className="space-y-3">
          <h1 className={`text-2xl font-bold transition-colors duration-500 ${status === 'success' ? 'text-green-600' :
              status === 'error' ? 'text-red-600' :
                'text-gray-900'
            }`}>
            {status === 'success' ? '출석 완료' : status === 'error' ? '처리 실패' : '잠시만 기다려주세요'}
          </h1>
          <p className="text-gray-500 text-lg font-medium leading-relaxed">
            {message}
          </p>
        </div>

        {/* Action Buttons (Mobile Friendly) */}
        <div className="pt-8 w-full space-y-3">
          {status === 'success' && (
            <button
              onClick={() => router.push(`/reservations/${reservationCode}`)}
              className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg active:scale-95 transition-transform shadow-xl shadow-gray-200"
            >
              예약 상세 보기
            </button>
          )}
          {status === 'error' && (
            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold text-lg active:scale-95 transition-transform shadow-xl shadow-red-100"
            >
              다시 시도하기
            </button>
          )}
          <button
            onClick={() => router.push('/')}
            className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold text-lg active:scale-95 transition-transform"
          >
            홈으로 가기
          </button>
        </div>
      </div>

      {/* Premium Styling Overrides (Tailwind-like logic in components) */}
      <style jsx global>{`
                @keyframes bounce-short {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .animate-bounce-short {
                    animation: bounce-short 1s ease-in-out infinite;
                }
            `}</style>
    </div>
  );
  
}
