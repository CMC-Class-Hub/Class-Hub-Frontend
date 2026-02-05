import { ClassApi, ClassDetailResponse, SessionResponse } from '../types';
import { demoClasses } from './demo-data';

export const classApiMock: ClassApi = {
  getByClassCode: async (classCode: string): Promise<ClassDetailResponse> => {
    const demoClass = demoClasses[classCode];
    if (!demoClass) throw new Error('클래스를 찾을 수 없습니다.');
    return demoClass;
  },

  getSessionsByClassId: async (classId: number): Promise<SessionResponse[]> => {
    const classItem = Object.values(demoClasses).find(c => c.id === classId);
    if (!classItem) throw new Error('클래스를 찾을 수 없습니다.');
    return classItem.sessions ?? [];
  },

  getSessionById: async (sessionId: number): Promise<SessionResponse> => {
    for (const classItem of Object.values(demoClasses)) {
      const session = (classItem.sessions ?? []).find(s => s.id === sessionId);
      if (session) return session;
    }
    throw new Error('세션을 찾을 수 없습니다.');
  }
};
