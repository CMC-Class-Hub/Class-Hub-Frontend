// API 설정 - 백엔드 주소를 한 곳에서 관리

export const API_URL = process.env.BACKEND_API_URL || 'https://classhub.site';

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

// --- API 함수 ---
export const classApi = {
  getByShareCode: async (shareCode: string): Promise<ClassDetailResponse> => {
    const res = await fetch(`${API_URL}/api/classes/shared/${shareCode}`);
    if (!res.ok) throw new Error('클래스를 찾을 수 없습니다.');
    return res.json();
  },
};

export const reservationApi = {
  create: async (classId: number, data: CreateReservationRequest): Promise<number> => {
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
    const res = await fetch(`${API_URL}/api/reservations/search?name=${name}&phone=${phone}`);
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
