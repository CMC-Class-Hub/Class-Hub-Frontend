'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { NicepayForm } from '@/components/features/NicepayForm';

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');
  const goodsName = searchParams.get('goodsName');
  const buyerName = searchParams.get('buyerName');
  const buyerTel = searchParams.get('buyerTel');
  const reservationCode = searchParams.get('reservationCode');

  useEffect(() => {
    if (!orderId || !amount || !goodsName || !buyerName || !buyerTel || !reservationCode) {
      setError('결제 정보가 올바르지 않습니다.');
    }
  }, [orderId, amount, goodsName, buyerName, buyerTel, reservationCode]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#F2F4F6] flex justify-center items-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-[#191F28] mb-3">
            결제 오류
          </h2>
          <p className="text-[#6B7684] leading-relaxed mb-6">
            {error}
          </p>
          <button
            onClick={() => router.back()}
            className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-bold"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 나이스페이먼츠 클라이언트 ID
  const clientId = process.env.NEXT_PUBLIC_NICEPAY_CLIENT_ID || 'S1_6eaa0db1afdc41f3becb770878d67d25';

  // 백엔드 컨트롤러에 새로 만든 clientAuth 엔드포인트로 설정
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8080';
  const returnUrl = `${backendUrl}/api/payments/clientAuth`;

  return (
    <NicepayForm
      clientId={clientId}
      orderId={orderId!}
      amount={parseInt(amount!)}
      goodsName={goodsName!}
      buyerName={buyerName!}
      buyerTel={buyerTel!}
      returnUrl={returnUrl}
    />
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">결제 정보를 불러오는 중...</p>
        </div>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
