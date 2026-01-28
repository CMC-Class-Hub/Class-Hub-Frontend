// API 설정 - 백엔드 주소를 한 곳에서 관리

export const API_URL = process.env.BACKEND_API_URL || 'https://classhub.site';

// Mock 모드 설정 (백엔드 없이 테스트용)
export const USE_MOCK = true;

// --- 타입 정의 ---
export interface SessionResponse {
  sessionId: number;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  currentNum: number;
  status: 'RECRUITING' | 'FULL';
}

export interface ClassDetailResponse {
  id: number;
  title: string;
  imageUrl?: string;
  description: string;
  location: string;
  locationDescription?: string;
  price: number;
  material?: string;
  parkingInfo?: string;
  guidelines?: string;
  policy?: string;
  sessions: SessionResponse[];
}

export interface ReservationItem {
  reservationId: number;
  classTitle: string;
  date: string;
  startTime: string;
  endTime: string;
  applicantName: string;
}

export interface ReservationDetail {
  reservationId: number;
  classTitle: string;
  classImageUrl?: string;
  classLocation: string;
  date: string;
  startTime: string;
  endTime: string;
  applicantName: string;
  phoneNumber: string;
  capacity: number;
  currentNum: number;
  sessionStatus: string;
}

export interface CreateReservationRequest {
  sessionId: number;
  applicantName: string;
  phoneNumber: string;
}

// --- Mock 데이터 import ---
import { mockClasses, mockReservationList, mockReservationDetails } from './mock-data';

// LocalStorage Helper
const STORAGE_KEY = 'classhub_mock_reservations';

const loadMockData = () => {
  if (typeof window === 'undefined') return;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const parsed = JSON.parse(saved);
    Object.assign(mockReservationDetails, parsed);
  }
};

const saveMockData = () => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockReservationDetails));
};

// --- API 함수 ---
export const classApi = {
  getByClassCode: async (classCode: string): Promise<ClassDetailResponse> => {
    if (USE_MOCK) {
      const mockClass = mockClasses[classCode];
      if (!mockClass) throw new Error('클래스를 찾을 수 없습니다.');
      return mockClass;
    }
    const res = await fetch(`${API_URL}/api/classes/shared/${classCode}`);
    if (!res.ok) throw new Error('클래스를 찾을 수 없습니다.');
    return res.json();
  },
};

export const reservationApi = {
  create: async (classId: number, data: CreateReservationRequest): Promise<number> => {
    if (USE_MOCK) {
      loadMockData(); // 최신 상태 로드

      // Mock: 새 예약 ID 반환
      const newId = Date.now();

      // 1. 클래스 정보 찾기
      const classItem = Object.values(mockClasses).find(c => c.id === classId);
      if (!classItem) throw new Error('클래스를 찾을 수 없습니다.');

      // 2. 세션 정보 찾기
      const session = classItem.sessions.find(s => s.sessionId === data.sessionId);
      if (!session) throw new Error('세션을 찾을 수 없습니다.');

      // 3. Mock 데이터에 추가
      mockReservationDetails[newId] = {
        reservationId: newId,
        classTitle: classItem.title,
        classImageUrl: classItem.imageUrl,
        classLocation: classItem.location,
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime,
        applicantName: data.applicantName,
        phoneNumber: data.phoneNumber,
        capacity: session.capacity,
        currentNum: session.currentNum + 1, // 인원 1명 증가했다고 가정
        sessionStatus: session.status,
      };

      // 목록에도 추가 (검색용)
      // mockReservationList.push({ // mockReservationList는 사용하지 않으므로 주석 처리
      //   reservationId: newId,
      //   classTitle: classItem.title,
      //   date: session.date,
      //   startTime: session.startTime,
      //   endTime: session.endTime,
      //   applicantName: data.applicantName,
      // });

      saveMockData(); // 저장
      console.log('Mock 예약 생성 및 저장 완료:', mockReservationDetails[newId]);
      return newId;
    }
    const res = await fetch(`${API_URL}/api/reservations?onedayClassId=${classId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText);
    }
    return res.json();
  },

  search: async (name: string, phone: string): Promise<ReservationItem[]> => {
    if (USE_MOCK) {
      loadMockData(); // 최신 상태 로드
      // Mock: 이름과 전화번호가 모두 일치하는 예약 반환
      // mockReservationDetails에서 검색하여 더 정확한 매칭 제공
      return Object.values(mockReservationDetails)
        .filter(r => r.applicantName === name && r.phoneNumber === phone)
        .map(r => ({
          reservationId: r.reservationId,
          classTitle: r.classTitle,
          date: r.date,
          startTime: r.startTime,
          endTime: r.endTime,
          applicantName: r.applicantName,
        }));
    }
    const res = await fetch(`${API_URL}/api/reservations/search?name=${name}&phone=${phone}`);
    if (!res.ok) return [];
    return res.json();
  },

  getById: async (reservationId: number | string): Promise<ReservationDetail> => {
    if (USE_MOCK) {
      loadMockData(); // 최신 상태 로드
      const id = typeof reservationId === 'string' ? parseInt(reservationId) : reservationId;
      const mockDetail = mockReservationDetails[id];
      if (!mockDetail) throw new Error('예약 정보를 찾을 수 없습니다.');
      return mockDetail;
    }
    const res = await fetch(`${API_URL}/api/reservations/${reservationId}`);
    if (!res.ok) throw new Error('예약 정보를 찾을 수 없습니다.');
    return res.json();
  },

  cancel: async (reservationId: number | string): Promise<void> => {
    if (USE_MOCK) {
      loadMockData(); // 최신 상태 로드
      const id = typeof reservationId === 'string' ? parseInt(reservationId) : reservationId;
      if (mockReservationDetails[id]) {
        delete mockReservationDetails[id];
        saveMockData(); // 삭제 후 저장
      }
      console.log('Mock 예약 취소:', reservationId);
      return;
    }
    const res = await fetch(`${API_URL}/api/reservations/${reservationId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('취소에 실패했습니다.');
  },
};
