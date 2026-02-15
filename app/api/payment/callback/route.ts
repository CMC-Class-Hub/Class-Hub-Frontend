import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 나이스페이먼츠가 보낸 POST Body 데이터 읽기
    const formData = await request.formData();
    const data: Record<string, string> = {};

    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    console.log('--- Nicepay Callback Bridge ---');
    console.log('Received POST Data:', data);

    // URL의 쿼리 스트링에서 reservationCode 가져오기
    const { searchParams } = new URL(request.url);
    const reservationCode = searchParams.get('reservationCode');

    // 결과 페이지로 리다이렉트 (데이터를 GET 파라미터로 전환)
    const redirectUrl = new URL('/payment/result', request.url);

    // 나이스페이먼츠 주요 파라미터 복사 (대소문자 모두 대응)
    const getVal = (key: string) => data[key] || data[key.toLowerCase()] || data[key.charAt(0).toUpperCase() + key.slice(1)];

    if (reservationCode) redirectUrl.searchParams.set('reservationCode', reservationCode);

    const resultCode = getVal('resultCode') || getVal('ResultCode');
    const orderId = getVal('orderId') || getVal('moid') || getVal('Moid');
    const tid = getVal('tid') || getVal('Tid') || getVal('TID');

    if (resultCode) redirectUrl.searchParams.set('resultCode', resultCode);
    if (orderId) redirectUrl.searchParams.set('orderId', orderId);
    if (tid) redirectUrl.searchParams.set('tid', tid);

    // 나머지 모든 데이터도 일단 안전하게 전달
    if (data.resultMsg) redirectUrl.searchParams.set('resultMsg', data.resultMsg);
    if (data.payMethod) redirectUrl.searchParams.set('payMethod', data.payMethod);
    if (data.cardCode) redirectUrl.searchParams.set('cardCode', data.cardCode);
    if (data.cardName) redirectUrl.searchParams.set('cardName', data.cardName);
    if (data.cardNum) redirectUrl.searchParams.set('cardNum', data.cardNum);

    console.log('Redirecting to:', redirectUrl.toString());

    return NextResponse.redirect(redirectUrl, { status: 303 });
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.redirect(new URL('/payment/result?error=callback_failed', request.url));
  }
}
