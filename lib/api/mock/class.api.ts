import { ClassApi, ClassDetailResponse } from '../types';
import { demoClasses } from './demo-data';

export const classApiMock: ClassApi = {
  getByClassCode: async (classCode: string): Promise<ClassDetailResponse> => {
    const demoClass = demoClasses[classCode];
    if (!demoClass) throw new Error('클래스를 찾을 수 없습니다.');
    return demoClass;
  },
};
