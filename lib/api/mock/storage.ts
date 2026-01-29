// Mock 전용 localStorage Helper
// mock 구현체 외부에서는 localStorage 접근 금지

import { ReservationDetail } from '../types';

const STORAGE_KEY = 'classhub_mock_reservations';

export const loadReservations = (
  target: Record<number, ReservationDetail>
): void => {
  if (typeof window === 'undefined') return;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const parsed = JSON.parse(saved);
    Object.assign(target, parsed);
  }
};

export const saveReservations = (
  data: Record<number, ReservationDetail>
): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const clearReservations = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
};
