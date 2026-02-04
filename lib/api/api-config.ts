// API 설정 - 환경변수 기반

export const API_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://classhub.site';
/*
export const USE_MOCK =
  (process.env.NEXT_PUBLIC_USE_MOCK ?? 'true') === 'true';
*/
export const USE_MOCK = false;
//export const API_URL = 'http://localhost:8080';
