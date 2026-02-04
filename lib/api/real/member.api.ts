import { API_URL } from '../api-config';
import {
  MemberApi,
  MemberResponse,
  CreateMemberRequest,
  UpdateMemberRequest,
} from '../types';

export const memberApiReal: MemberApi = {
  getAll: async (): Promise<MemberResponse[]> => {
    const res = await fetch(`${API_URL}/api/members`);
    if (!res.ok) throw new Error('학생 목록을 가져올 수 없습니다.');
    return res.json();
  },

  getById: async (id: number): Promise<MemberResponse> => {
    const res = await fetch(`${API_URL}/api/members/${id}`);
    if (!res.ok) throw new Error('학생 정보를 찾을 수 없습니다.');
    return res.json();
  },

  create: async (data: CreateMemberRequest): Promise<void> => {
    const res = await fetch(`${API_URL}/api/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || '학생 등록에 실패했습니다.');
    }
  },

  update: async (id: number, data: UpdateMemberRequest): Promise<void> => {
    const res = await fetch(`${API_URL}/api/members/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || '정보 수정에 실패했습니다.');
    }
  },
};
