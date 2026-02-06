import {
  ReservationApi,
  CreateReservationRequest,
  ReservationDetail,
  SessionReservationInfo,
} from '../types';
import { demoClasses, demoReservationDetails } from './demo-data';
import { loadReservations, saveReservations } from './storage';

export const reservationApiMock: ReservationApi = {
  create: async (
    classId: number,
    data: CreateReservationRequest
  ): Promise<number> => {
    loadReservations(demoReservationDetails);

    const newId = Date.now();

    const classItem = Object.values(demoClasses).find((c) => c.id === classId);
    if (!classItem) throw new Error('클래스를 찾을 수 없습니다.');

    const session = (classItem.sessions ?? []).find(
      (s) => s.id === data.sessionId
    );
    if (!session) throw new Error('세션을 찾을 수 없습니다.');

    demoReservationDetails[newId] = {
      reservationId: newId,
      reservationStatus: 'RESERVED',
      classCode: classItem.classCode ?? '',
      classTitle: classItem.name ?? '',
      classImageUrl: classItem.imageUrls?.[0] ?? '',
      classLocation: classItem.location ?? '',
      date: session.date ?? '',
      startTime: session.startTime ?? '',
      endTime: session.endTime ?? '',
      applicantName: data.applicantName,
      phoneNumber: data.phoneNumber,
      capacity: session.capacity ?? 0,
      currentNum: (session.currentNum ?? 0) + 1,
      sessionStatus: session.status ?? '',
    };

    saveReservations(demoReservationDetails);
    console.log('Mock 예약 생성 완료:', demoReservationDetails[newId]);
    return newId;
  },

  search: async (name: string, phone: string, password: string): Promise<ReservationDetail[]> => {
    loadReservations(demoReservationDetails);
    return Object.values(demoReservationDetails).filter(
      (r) => r.applicantName === name && r.phoneNumber === phone
    );
  },

  getById: async (reservationId: number | string): Promise<ReservationDetail> => {
    loadReservations(demoReservationDetails);
    const id =
      typeof reservationId === 'string' ? parseInt(reservationId) : reservationId;
    const detail = demoReservationDetails[id];
    if (!detail) throw new Error('예약 정보를 찾을 수 없습니다.');
    return detail;
  },

  cancel: async (reservationId: number | string): Promise<void> => {
    loadReservations(demoReservationDetails);
    const id =
      typeof reservationId === 'string' ? parseInt(reservationId) : reservationId;
    if (demoReservationDetails[id]) {
      delete demoReservationDetails[id];
      saveReservations(demoReservationDetails);
    }
    console.log('Mock 예약 취소:', reservationId);
  },

  getBySessionId: async (sessionId: number): Promise<SessionReservationInfo[]> => {
    // Mock에서는 빈 배열 반환 또는 더미 로직
    return [];
  },
};
