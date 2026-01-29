import { API_URL } from '../api-config';
import {
  ReservationApi,
  CreateReservationRequest,
  ReservationItem,
  ReservationDetail,
} from '../types';

export const reservationApiReal: ReservationApi = {
  create: async (
    classId: number,
    data: CreateReservationRequest
  ): Promise<number> => {
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
      throw new Error(errorText);
    }
    return res.json();
  },

  search: async (name: string, phone: string): Promise<ReservationItem[]> => {
    const res = await fetch(
      `${API_URL}/api/reservations/search?name=${name}&phone=${phone}`
    );
    if (!res.ok) return [];
    return res.json();
  },

  getById: async (reservationId: number | string): Promise<ReservationDetail> => {
    const res = await fetch(`${API_URL}/api/reservations/${reservationId}`);
    if (!res.ok) throw new Error('예약 정보를 찾을 수 없습니다.');
    return res.json();
  },

  cancel: async (reservationId: number | string): Promise<void> => {
    const res = await fetch(`${API_URL}/api/reservations/${reservationId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('취소에 실패했습니다.');
  },
};
