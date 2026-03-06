'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { paymentApi, reservationApi, ReservationDetail } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useAlert } from '@/lib/contexts/AlertContext';

function PaymentResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [reservation, setReservation] = useState<ReservationDetail | null>(null);

  useEffect(() => {
    const orderId = searchParams.get('orderId') || searchParams.get('moid') || searchParams.get('Moid'); // 다양한 이름 대응
    const reservationCode = searchParams.get('reservationCode');
    const resultCode = searchParams.get('resultCode') || searchParams.get('ResultCode');

    if (!reservationCode) {
      console.warn('reservationCode가 없습니다. 로직을 중단합니다.');
      setErrorMessage('예약 정보가 누락되었습니다.');
      setLoading(false);
      return;
    }

    const processPayment = async () => {
      try {
        const isSuccessParam = searchParams.get('success') === 'true';
        const isFailureParam = searchParams.get('success') === 'false';

        // 1. 백엔드에서 명시적으로 성공/실패 여부를 보낸 경우 (이미 승인 완료된 케이스)
        if (isSuccessParam) {
          setSuccess(true);
          const detail = await reservationApi.getByCode(reservationCode);
          setReservation(detail);
        } else if (isFailureParam) {
          setSuccess(false);
          setErrorMessage(searchParams.get('resultMsg') || '결제 처리에 실패했습니다.');
          // 실패 시에도 classCode 확보를 위해 예약 정보 조회 시도 (버튼 복구용)
          try {
            const detail = await reservationApi.getByCode(reservationCode);
            setReservation(detail);
          } catch (e) {
            console.warn('실패 화면에서 예약 조회 실패:', e);
          }
        }
        // 2. 예외 케이스: resultCode가 있지만 success 파라미터가 없는 경우 (기존 로직 유지)
        else if (resultCode) {
          const params: Record<string, string> = {};
          searchParams.forEach((value, key) => {
            params[key] = value;
          });

          const approveResult = await paymentApi.approve(params);
          if (approveResult.success) {
            setSuccess(true);
            const detail = await reservationApi.getByCode(reservationCode);
            setReservation(detail);
          } else {
            setSuccess(false);
            setErrorMessage(approveResult.resultMsg || '결제 승인에 실패했습니다.');
          }
        }
        // 3. 직접 접근 시 orderId로 상태 조회
        else if (orderId) {
          const payment = await paymentApi.getByOrderId(orderId);
          if (payment.status === 'COMPLETED') {
            setSuccess(true);
            const detail = await reservationApi.getByCode(reservationCode);
            setReservation(detail);
          } else {
            setSuccess(false);
            setErrorMessage('결제가 완료되지 않았습니다.');
          }
        } else {
          setErrorMessage('결제 정보가 존재하지 않습니다.');
        }
      } catch (e) {
        console.error('결제 처리 중 예외 발생:', e);
        setSuccess(false);
        setErrorMessage(e instanceof Error ? e.message : '처리 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    processPayment();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">결제 결과를 확인하고 있습니다...</p>
        </div>
      </div>
    );
  }

  // URL에서 예약 코드 미리 추출 (JSX에서 사용하기 위함)
  const urlReservationCode = searchParams.get('reservationCode');

  if (!success) {
    return (
      <div className="min-h-screen bg-[#F2F4F6] flex justify-center items-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-[#191F28] mb-3">
            결제 실패
          </h2>
          <p className="text-[#6B7684] leading-relaxed mb-6">
            {errorMessage || '결제 처리 중 오류가 발생했습니다.'}
          </p>
          <div className="w-full space-y-3">
            <Button
              onClick={() => {
                if (reservation?.classCode) {
                  router.push(`/class/${reservation.classCode}`);
                } else {
                  router.back();
                }
              }}
              fullWidth
            >
              클래스로 돌아가기
            </Button>
            <Button
              onClick={() => router.push('/')}
              fullWidth
              variant="secondary"
            >
              홈으로 이동
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 결제 성공 - 예약 내역 표시
  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center max-w-[480px] mx-auto shadow-2xl relative p-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <span className="text-3xl">✅</span>
      </div>
      <h2 className="text-2xl font-bold text-[#191F28] mb-2">결제 성공!</h2>
      <p className="text-[#8B95A1] text-center mb-8 leading-relaxed">
        결제가 성공적으로 완료되었습니다.
      </p>

      {reservation && (
        <div className="w-full bg-gray-50 rounded-xl p-5 mb-8 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">예약 코드</span>
            <span className="font-bold text-[#3182F6]">{reservation.reservationCode}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">클래스</span>
            <span className="font-bold text-[#333D4B] text-right truncate ml-4">
              {reservation.classTitle}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">일시</span>
            <span className="font-bold text-[#333D4B]">
              {reservation.date} {reservation.startTime?.slice(0, 5)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">예약자</span>
            <span className="font-bold text-[#333D4B]">{reservation.applicantName}</span>
          </div>
        </div>
      )}

      <div className="w-full space-y-3">
        <Button
          onClick={() => {
            const code = reservation?.reservationCode || urlReservationCode;
            if (code) {
              router.push(`/reservations/${code}`);
            } else {
              showAlert({ title: '오류', description: '예약 번호를 찾을 수 없습니다.' });
            }
          }}
          fullWidth
        >
          예약 내역 확인하기
        </Button>
        <Link href="/" className="block w-full">
          <Button fullWidth variant="secondary">
            홈으로 이동
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">불러오는 중...</p>
        </div>
      </div>
    }>
      <PaymentResultContent />
    </Suspense>
  );
}
