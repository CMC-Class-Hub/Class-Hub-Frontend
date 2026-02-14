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
  ): Promise<string> => {
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
      reservationCode: 'test',
    };

    saveReservations(demoReservationDetails);
    return newId.toString();
  },

  search: async (name: string, phone: string): Promise<ReservationDetail[]> => {
    loadReservations(demoReservationDetails);
    return Object.values(demoReservationDetails).filter(
      (r) => r.applicantName === name && r.phoneNumber === phone
    );
  },

  getByCode: async (reservationCode: string): Promise<ReservationDetail> => {
    loadReservations(demoReservationDetails);
    const detail = Object.values(demoReservationDetails).find(
      (r) => r.reservationCode === reservationCode
    );
    if (!detail) throw new Error('예약 정보를 찾을 수 없습니다.');
    return detail;
  },

  cancel: async (reservationCode: string): Promise<void> => {
    loadReservations(demoReservationDetails);
    const detail = Object.values(demoReservationDetails).find(
      (r) => r.reservationCode === reservationCode
    );
    if (detail) {
      delete demoReservationDetails[detail.reservationId];
      saveReservations(demoReservationDetails);
    }
  },

  getBySessionId: async (sessionId: number): Promise<SessionReservationInfo[]> => {
    // Mock에서는 빈 배열 반환 또는 더미 로직
    return [];
  },
};
