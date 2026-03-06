// API 진입점 - Mock/Real 스위칭
// if (USE_MOCK) 분기는 이 파일에서만 허용

import { USE_MOCK } from './api-config';
import { classApiMock } from './mock/class.api';
import { classApiReal } from './real/class.api';
import { reservationApiMock } from './mock/reservation.api';
import { reservationApiReal } from './real/reservation.api';
import { memberApiMock } from './mock/member.api';
import { memberApiReal } from './real/member.api';
import { paymentApiReal } from './real/payment.api';

// Mock/Real 구현 스위치
export const classApi = USE_MOCK ? classApiMock : classApiReal;
export const reservationApi = USE_MOCK ? reservationApiMock : reservationApiReal;
export const memberApi = USE_MOCK ? memberApiMock : memberApiReal;
// Payment는 항상 real API 사용 (mock 없음)
export const paymentApi = paymentApiReal;

// 타입 re-export (단일 소스)
export type {
  SessionResponse,
  ClassDetailResponse,
  ReservationItem,
  ReservationDetail,
  CreateReservationRequest,
  CreateReservationResponse,
  MemberResponse,
  CreateMemberRequest,
  UpdateMemberRequest,
  SessionReservationInfo,
  ClassApi,
  ReservationApi,
  MemberApi,
  PaymentResponse,
  CreatePaymentRequest,
  CancelPaymentRequest,
  PaymentApprovalResponse,
  PaymentApi,
  PaymentStatus,
  PaymentMethod,
} from './types';
