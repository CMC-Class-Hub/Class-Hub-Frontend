// API 타입 정의

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
  password?: string;
}

export interface CreateReservationRequest {
  sessionId: number;
  applicantName: string;
  phoneNumber: string;
  password?: string; // 임시 비밀번호 (선택적)
}

// API 인터페이스 정의
export interface ClassApi {
  getByClassCode: (classCode: string) => Promise<ClassDetailResponse>;
}

export interface ReservationApi {
  create: (classId: number, data: CreateReservationRequest) => Promise<number>;
  search: (name: string, phone: string) => Promise<ReservationItem[]>;
  getById: (reservationId: number | string) => Promise<ReservationDetail>;
  cancel: (reservationId: number | string) => Promise<void>;
}
