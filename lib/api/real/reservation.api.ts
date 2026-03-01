import { API_URL } from '../api-config';
import {
  ReservationApi,
  CreateReservationRequest,
  ReservationDetail,
  SessionReservationInfo,
} from '../types';

export const reservationApiReal: ReservationApi = {
  create: async (
    classId: number,
    data: CreateReservationRequest
  ): Promise<string> => {
    const res = await fetch(
      `${API_URL}/api/reservations?onedayClassId=${classId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    );
    if (!res.ok) {
      const errorText = await res.text();
      let errorMessage = '예약에 실패했습니다.';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return res.text();
  },

  search: async (name: string, phone: string): Promise<ReservationDetail[]> => {
    const res = await fetch(
      `${API_URL}/api/reservations/search?name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}`
    );
    if (!res.ok) return [];
    return res.json();
  },

  getByCode: async (reservationCode: string): Promise<ReservationDetail> => {
    const res = await fetch(`${API_URL}/api/reservations/${reservationCode}`);
    if (!res.ok) throw new Error('예약 정보를 찾을 수 없습니다.');
    return res.json();
  },

  cancel: async (reservationCode: string): Promise<void> => {
    const res = await fetch(`${API_URL}/api/reservations/${reservationCode}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('취소에 실패했습니다.');
  },

  getBySessionId: async (sessionId: number): Promise<SessionReservationInfo[]> => {
    const res = await fetch(`${API_URL}/api/reservations/session/${sessionId}`);
    if (!res.ok) throw new Error('세션별 예약 목록을 가져올 수 없습니다.');
    return res.json();
  },

  markAsPresent: async (reservationCode: string): Promise<void> => {
    const res = await fetch(
      `${API_URL}/api/reservations/${reservationCode}/attendance/present`,
      {
        method: 'PATCH',
      }
    );
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || '출석 처리에 실패했습니다.');
    }
  },
};
