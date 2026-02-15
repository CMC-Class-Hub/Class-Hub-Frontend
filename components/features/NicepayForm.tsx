import React, { useEffect } from 'react';
import Script from 'next/script';

interface NicepayFormProps {
  clientId: string;
  orderId: string;
  amount: number;
  goodsName: string;
  buyerName: string;
  buyerTel: string;
  returnUrl: string;
}

declare global {
  interface Window {
    AUTHNICE: any;
  }
}

export const NicepayForm: React.FC<NicepayFormProps> = ({
  clientId,
  orderId,
  amount,
  goodsName,
  buyerName,
  buyerTel,
  returnUrl,
}) => {
  const hasRequested = React.useRef(false);

  const handlePay = () => {
    if (!window.AUTHNICE) {
      alert('결제 모듈을 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    if (hasRequested.current) return;
    hasRequested.current = true;

    window.AUTHNICE.requestPay({
      clientId: clientId,
      method: 'card',
      orderId: orderId,
      amount: amount,
      goodsName: goodsName,
      returnUrl: returnUrl,
      buyerName: buyerName,
      buyerTel: buyerTel,
      fnError: function (result: any) {
        hasRequested.current = false;
        alert('결제 오류: ' + result.errorMsg);
      }
    });
  };

  useEffect(() => {
    // 스크립트가 이미 로드되어 있다면 바로 실행, 아니면 로드 완료 후 실행되도록 전략 수정 가능
    // 여기서는 window.AUTHNICE가 있을 때까지 짧은 간격으로 체크하거나, 단순 지연 호출
    const checkAndPay = setInterval(() => {
      if (window.AUTHNICE) {
        handlePay();
        clearInterval(checkAndPay);
      }
    }, 100);

    return () => clearInterval(checkAndPay);
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
      <Script
        src="https://pay.nicepay.co.kr/v1/js/"
        strategy="afterInteractive"
      />

      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-[#191F28] mb-2">결제창을 여는 중입니다</h2>
        <p className="text-[#8B95A1] mb-6">잠시만 기다려주세요...</p>

        <button
          onClick={handlePay}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-colors"
        >
          결제창이 안 뜨나요? (직접 클릭)
        </button>
      </div>
    </div>
  );
};
