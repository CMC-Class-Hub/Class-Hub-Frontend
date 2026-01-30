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
    classCode: string,
    data: CreateReservationRequest
  ): Promise<number> => {
    // Note: classCode is available but currently unused in this specific endpoint if only classId is needed.
    // However, keeping the signature consistent with the interface.
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

  search: async (name: string, phone: string, password: string): Promise<ReservationItem[]> => {
    // Note: password might be used for verification in a future update or different endpoint.
    // For now, ignoring it in the query string to maintain existing behavior while satisfying type signature.
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
