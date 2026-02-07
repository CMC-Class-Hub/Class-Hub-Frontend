// Demo 데이터 - mock 구현체 전용
// 컴포넌트에서 직접 import 금지

import {
  ClassDetailResponse,
  ReservationItem,
  ReservationDetail,
  SessionResponse,
} from '../types';

// 강사 정보 (참고용)
export const demoInstructor = {
  id: 1,
  businessName: '취미 공작소',
  email: 'hobby@gmail.com',
  name: '김강사',
  phoneNumber: '010-1234-5678',
};

// 클래스 데이터
export const demoClasses: Record<string, ClassDetailResponse> = {
  test: {
    id: 1,
    classCode: 'test',
    name: '감성 가득 달항아리 만들기',
    imageUrls: [
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800&auto=format&fit=crop',
    ],
    description:
      '부드러운 흙의 감촉을 느끼며 자신만의 달항아리를 빚어보세요. 초보자도 쉽게 배울 수 있습니다.\n\n📌 클래스 과정\n1. 흙 반죽하기 - 점토의 특성을 이해하고 반죽해요 (20분)\n2. 형태 잡기 - 물레를 사용해 달항아리 형태를 만들어요 (40분)\n3. 다듬기 - 표면을 매끄럽게 정리하고 나만의 무늬를 새겨요 (30분)\n4. 마무리 - 건조 및 유약 설명, 완성작 수령 안내 (10분)',
    location: '서울 성동구 연무장길 45',
    locationDescription: '성수역 근처 카페 거리 내 위치',
    preparation: '백자토, 조각도, 앞치마 (모두 제공)',
    parkingInfo: '주차 공간이 협소하니 가급적 대중교통 이용 부탁드립니다.',
    guidelines: '흙이 묻을 수 있으니 편한 복장으로 오세요.',
    policy: '당일 취소는 환불이 불가합니다.',
    sessions: [
      {
        id: 1,
        date: '2025-02-15',
        startTime: '14:00:00',
        endTime: '16:00:00',
        capacity: 8,
        currentNum: 3,
        status: 'RECRUITING',
        price: 60000,
      },
      {
        id: 2,
        date: '2025-02-16',
        startTime: '10:00:00',
        endTime: '12:00:00',
        capacity: 8,
        currentNum: 8,
        status: 'FULL',
        price: 60000,
      },
      {
        id: 3,
        date: '2025-02-22',
        startTime: '14:00:00',
        endTime: '16:00:00',
        capacity: 8,
        currentNum: 5,
        status: 'RECRUITING',
        price: 55000,
      },
    ],
  },
};

// 예약 목록 (검색 결과용)
export const demoReservationList: ReservationItem[] = [
  {
    reservationId: 1,
    classCode: 'test',
    reservationStatus: 'RESERVED',
    classTitle: '감성 가득 달항아리 만들기',
    classCode: 'test',
    classImageUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800&auto=format&fit=crop',
    classLocation: '서울 성동구 연무장길 45',
    date: '2025-02-15',
    startTime: '14:00:00',
    endTime: '16:00:00',
    applicantName: '김철수',
    phoneNumber: '010-1234-5678',
    capacity: 8,
    currentNum: 3,
    sessionStatus: 'RECRUITING',
  },
];

// 예약 상세 (mutable - localStorage와 동기화됨)
export const demoReservationDetails: Record<number, ReservationDetail> = {
  1: {
    reservationId: 1,
    classTitle: '감성 가득 달항아리 만들기',
    classCode: 'test',
    reservationStatus: 'RESERVED',
    classImageUrl:
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800&auto=format&fit=crop',
    classLocation: '서울 성동구 연무장길 45',
    date: '2025-02-15',
    startTime: '14:00:00',
    endTime: '16:00:00',
    applicantName: '김철수',
    phoneNumber: '010-1234-5678',
    capacity: 8,
    currentNum: 3,
    sessionStatus: 'RECRUITING',
  },
};
