// API 타입 정의

export interface SessionResponse {
  id: number;
  date?: string;
  startTime?: string;
  endTime?: string;
  currentNum?: number;
  capacity?: number;
  status?: string;
  price?: number;
}

export interface ClassDetailResponse {
  id: number;
  classCode?: string;
  name?: string;
  imageUrls?: string[];
  description?: string;
  location?: string;
  locationDescription?: string;
  preparation?: string;
  parkingInfo?: string;
  guidelines?: string;
  policy?: string;
  instructorId?: number;
  instructorName?: string;
  instructorProfileUrl?: string;
  sessions?: SessionResponse[];
  linkShareStatus?: string;
  cancellationPolicy?: string;
  locationDetails?: string;
  instructions?: string;
}

// Student/Member 타입
export interface MemberResponse {
  id: number;
  name: string;
  phone: string;
  createdAt: string;
}

export interface CreateMemberRequest {
  name: string;
  phone: string;
  password?: string;
}

export interface UpdateMemberRequest {
  name?: string;
  phone?: string;
}

// Reservation 타입
export interface ReservationDetail {
  reservationId: number;
  reservationCode: string;
  classTitle: string;
  classCode: string;
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
  reservationStatus: string;
}

// search 응답도 ReservationDetail과 동일함
export type ReservationItem = ReservationDetail;

export interface CreateReservationRequest {
  sessionId: number;
  applicantName: string;
  phoneNumber: string;
}

export interface CreateReservationResponse {
  reservationCode: string;
  classCode: string;
}


// 강사용 특정 세션 예약 정보
export interface SessionReservationInfo {
  reservationId: number;
  studentId: number;
  applicantName: string;
  phoneNumber: string;
  appliedAt: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
}

// API 인터페이스 정의
export interface ClassApi {
  getByClassCode: (classCode: string) => Promise<ClassDetailResponse>;
  getSessionsByClassId: (classId: number) => Promise<SessionResponse[]>;
  getSessionById: (sessionId: number) => Promise<SessionResponse>;
}

export interface ReservationApi {
  create: (classId: number, data: CreateReservationRequest) => Promise<CreateReservationResponse>;
  search: (name: string, phone: string) => Promise<ReservationItem[]>;
  getByCode: (reservationCode: string) => Promise<ReservationDetail>;
  cancel: (reservationCode: string) => Promise<void>;
  getBySessionId: (sessionId: number) => Promise<SessionReservationInfo[]>;
}

export interface MemberApi {
  getAll: () => Promise<MemberResponse[]>;
  getById: (id: number) => Promise<MemberResponse>;
  create: (data: CreateMemberRequest) => Promise<void>;
  update: (id: number, data: UpdateMemberRequest) => Promise<void>;
}

// Payment 타입
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
export type PaymentMethod = 'CARD' | 'VBANK' | 'BANK' | 'CELLPHONE' | 'NAVERPAY' | 'KAKAOPAY' | 'PAYCO' | 'SSGPAY';

export interface PaymentResponse {
  id: number;
  reservationId: number;
  tid: string | null;
  orderId: string;
  amount: number;
  status: PaymentStatus;
  method?: PaymentMethod;
  cardCode?: string;
  cardName?: string;
  cardNum?: string;
  resultCode?: string;
  resultMsg?: string;
  approvedAt?: string;
  cancelledAt?: string;
  createdAt: string;
}

export interface CreatePaymentRequest {
  reservationId: number;
  amount: number;
  orderId: string;
  method?: PaymentMethod;
  cardCode?: string;
  cardName?: string;
  cardNum?: string;
}

export interface CancelPaymentRequest {
  tid: string;
  amount?: number;
  reason?: string;
}

export interface PaymentApprovalResponse {
  success: boolean;
  resultCode: string;
  resultMsg: string;
  payment: PaymentResponse;
}

export interface PaymentApi {
  create: (data: CreatePaymentRequest) => Promise<PaymentResponse>;
  approve: (params: Record<string, string>) => Promise<any>;
  getByTid: (tid: string) => Promise<PaymentResponse>;
  getByOrderId: (orderId: string) => Promise<PaymentResponse>;
  getByReservationId: (reservationId: number) => Promise<PaymentResponse>;
  cancel: (data: CancelPaymentRequest) => Promise<PaymentApprovalResponse>;
}
