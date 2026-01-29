import { API_URL } from '../api-config';
import { ClassApi, ClassDetailResponse } from '../types';

export const classApiReal: ClassApi = {
  getByClassCode: async (classCode: string): Promise<ClassDetailResponse> => {
    const res = await fetch(`${API_URL}/api/classes/shared/${classCode}`);
    if (!res.ok) throw new Error('클래스를 찾을 수 없습니다.');
    return res.json();
  },
};
