import { API_URL } from '../api-config';
import { ClassApi, ClassDetailResponse, SessionResponse } from '../types';

export const classApiReal: ClassApi = {
  getByClassCode: async (classCode: string): Promise<ClassDetailResponse> => {
    const res = await fetch(`${API_URL}/api/reservations/code/${classCode}`);
    if (!res.ok) throw new Error('클래스를 찾을 수 없습니다.');

    return res.json();
  },

  getSessionsByClassId: async (classId: number): Promise<SessionResponse[]> => {
    const res = await fetch(`${API_URL}/api/reservations/${classId}/sessions`);
    if (!res.ok) throw new Error('세션 목록을 가져올 수 없습니다.');
    return res.json();
  },

  // 세션 ID로 단일 세션 조회
  getSessionById: async (sessionId: number): Promise<SessionResponse> => {
    const res = await fetch(`${API_URL}/api/classes/sessions/${sessionId}`);
    if (!res.ok) throw new Error('세션을 찾을 수 없습니다.');
    return res.json();
  },
};
