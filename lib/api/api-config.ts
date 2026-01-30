// API 설정 - 백엔드 주소를 한 곳에서 관리

// 백엔드 API URL (기본값: http://localhost:8080)
export const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8080';

// Mock 모드 설정 (기본값: true. 'false'로 설정했을 때만 Real API 사용)
export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false';
