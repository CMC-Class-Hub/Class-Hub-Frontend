import {
  MemberApi,
  MemberResponse,
  CreateMemberRequest,
  UpdateMemberRequest,
} from '../types';

// Mock 데이터
const mockStudents: MemberResponse[] = [
  {
    id: 1,
    name: '홍길동',
    phone: '010-1234-5678',
    createdAt: '2024-02-04T12:00:00',
  },
];

export const memberApiMock: MemberApi = {
  getAll: async (): Promise<MemberResponse[]> => {
    return [...mockStudents];
  },

  getById: async (id: number): Promise<MemberResponse> => {
    const student = mockStudents.find((s) => s.id === id);
    if (!student) throw new Error('학생 정보를 찾을 수 없습니다.');
    return student;
  },

  create: async (data: CreateMemberRequest): Promise<void> => {
    const newId = Math.max(0, ...mockStudents.map((s) => s.id)) + 1;
    mockStudents.push({
      id: newId,
      name: data.name,
      phone: data.phone,
      createdAt: new Date().toISOString(),
    });
  },

  update: async (id: number, data: UpdateMemberRequest): Promise<void> => {
    const index = mockStudents.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('학생 정보를 찾을 수 없습니다.');
    mockStudents[index] = {
      ...mockStudents[index],
      ...data,
    };
  },
};
