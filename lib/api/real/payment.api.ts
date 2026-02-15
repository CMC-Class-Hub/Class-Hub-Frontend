import { API_URL } from '../api-config';
import {
  PaymentApi,
  CreatePaymentRequest,
  PaymentResponse,
  CancelPaymentRequest,
  PaymentApprovalResponse,
} from '../types';

export const paymentApiReal: PaymentApi = {
  create: async (data: CreatePaymentRequest): Promise<PaymentResponse> => {
    const res = await fetch(`${API_URL}/api/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorText = await res.text();
      let errorMessage = '결제 생성에 실패했습니다.';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return res.json();
  },

  approve: async (params: Record<string, string>): Promise<any> => {
    const queryString = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/api/payments/approve?${queryString}`);

    if (!res.ok) {
      const errorText = await res.text();
      let errorMessage = '결제 승인 처리에 실패했습니다.';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.resultMsg || errorJson.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return res.json();
  },

  getByTid: async (tid: string): Promise<PaymentResponse> => {
    const res = await fetch(`${API_URL}/api/payments/tid/${tid}`);
    if (!res.ok) throw new Error('결제 정보를 찾을 수 없습니다.');
    return res.json();
  },

  getByOrderId: async (orderId: string): Promise<PaymentResponse> => {
    const res = await fetch(`${API_URL}/api/payments/order/${orderId}`);
    if (!res.ok) throw new Error('결제 정보를 찾을 수 없습니다.');
    return res.json();
  },

  getByReservationId: async (reservationId: number): Promise<PaymentResponse> => {
    const res = await fetch(`${API_URL}/api/payments/reservation/${reservationId}`);
    if (!res.ok) throw new Error('결제 정보를 찾을 수 없습니다.');
    return res.json();
  },

  cancel: async (data: CancelPaymentRequest): Promise<PaymentApprovalResponse> => {
    const res = await fetch(`${API_URL}/api/payments/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorText = await res.text();
      let errorMessage = '결제 취소에 실패했습니다.';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.resultMsg || errorJson.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return res.json();
  },
};
