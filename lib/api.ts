import axios from "axios";

// 환경변수에서 API 베이스 URL 가져오기
function getApiBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE;
  if (!base) {
    throw new Error("환경변수 NEXT_PUBLIC_API_BASE 가 설정되어 있지 않습니다");
  }
  return base;
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Report API용 인증 불필요 axios 인스턴스
const apiNoAuth = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8082",
});

export default api;

// API 베이스 URL을 외부에서도 사용할 수 있도록 export
export { getApiBaseUrl };

export async function postJSON<TReq, TRes>(
  path: string,
  body: TReq
): Promise<TRes> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let errorMessage = `Request failed: ${res.status}`;
    try {
      const errorData = await res.json();
      // 백엔드가 {"status":"ERROR","message":"..."} 형식으로 반환하는 경우
      if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      } else if (typeof errorData === "string") {
        errorMessage = errorData;
      }
    } catch {
      // JSON 파싱 실패 시 텍스트로 시도
      const text = await res.text();
      if (text) errorMessage = text;
    }
    throw new Error(errorMessage);
  }
  return res.json();
}

export type SignupRequest = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
};

export type SignupResponse = {
  status?: string;
  userId?: string;
  email?: string;
  verification?: string;
};

export function signup(req: SignupRequest) {
  return postJSON<SignupRequest, SignupResponse>("/api/v1/auth/signup", req);
}

export async function sendOtp(email: string) {
  const base = getApiBaseUrl();
  const r = await fetch(
    `${base}/api/v1/auth/otp/send?email=${encodeURIComponent(email)}`,
    {
      method: "POST",
    }
  );
  if (!r.ok) throw new Error((await r.text()) || "인증번호 전송 실패");
  return r.json();
}

export async function verifyOtp(email: string, code: string) {
  const base = getApiBaseUrl();
  const r = await fetch(
    `${base}/api/v1/auth/otp/verify?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`,
    {
      method: "POST",
    }
  );
  if (!r.ok)
    throw new Error((await r.text()) || "인증번호가 유효하지 않습니다");
  return r.json();
}

// ====================================
// Report API
// ====================================

export interface ReportResponse {
  id: number;
  userId: number;
  cveId: string;
  name: string;
  status: string;
  fileUrl: string;
  presignedDownloadUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PresignedUrlResponse {
  presignedUrl: string;
  expiresInMinutes: number;
}

export interface ReportUploadResponse {
  reportId: number;
  fileUrl: string;
  version: number;
  message: string;
}

// ====================================
// News API
// ====================================

export interface NewsResponse {
  id: number;
  publisher: string;
  title: string;
  firstLine: string;
  thumbnail: string;
  externalUrl: string;
  createdAt: string;
}

export async function fetchTopNews(): Promise<NewsResponse[]> {
  const response = await api.get<NewsResponse[]>("/api/news/top")
  return response.data
}

export async function fetchAllNews(): Promise<NewsResponse[]> {
  const response = await api.get<NewsResponse[]>("/api/news")
  return response.data
}

export async function createReport(
  userId: number,
  cveId: string,
  name: string
): Promise<ReportResponse> {
  const response = await api.post<ReportResponse>("/api/reports", {
    userId,
    cveId,
    name,
  });
  return response.data;
}

export async function getMyReports(userId: number): Promise<ReportResponse[]> {
  const response = await api.get<ReportResponse[]>("/api/reports/me", {
    params: { userId },
  });
  return response.data;
}

export async function getReportDownloadUrl(
  reportId: number,
  userId: number
): Promise<PresignedUrlResponse> {
  const response = await api.get<PresignedUrlResponse>(
    `/api/reports/${reportId}/download`,
    {
      params: { userId },
    }
  );
  return response.data;
}

export async function deleteReport(
  reportId: number,
  userId: number
): Promise<void> {
  await api.delete(`/api/reports/${reportId}`, {
    params: { userId },
  });
}

export async function uploadReportFile(
  reportId: number,
  userId: number,
  file: File
): Promise<ReportUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.put<ReportUploadResponse>(
    `/api/reports/${reportId}/file?userId=${userId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
}

// ====================================
// VM API
// ====================================

export interface LabCreateResponse {
  uuid: string;
  cveId: string;
  privateIp: string;
  hostname: string;
  instanceId: string;
  status: string;
  tfstatePath: string;
  guacamoleUrl: string | null;
  sshUsername: string;
  sshPassword: string | null;
  privateKey: string | null;
}

export async function createVM(cveId: string): Promise<LabCreateResponse> {
  const response = await api.post<LabCreateResponse>("/api/labs/create", {
    cveId,
  });
  return response.data;
}

export interface LabDestroyResponse {
  status: string;
  uuid: string;
  cveId: string;
}

export async function deleteVM(uuid: string, cveId: string): Promise<LabDestroyResponse> {
  const response = await api.post<LabDestroyResponse>("/api/labs/destroy", {
    uuid,
    cveId,
  });
  return response.data;
}

export async function getTerminalUrl(
  vmId: string
): Promise<{ terminalUrl: string }> {
  const response = await api.get<{ terminalUrl: string }>(
    `/api/labs/${vmId}/terminal`
  );
  return response.data;
}

// ====================================
// Lab Session Timer API
// ====================================

import type {
  LabRemainingTimeResponse,
  LabExtendableResponse,
  LabExtendResponse,
  LabTerminateResponse,
} from "@/types/lab";

/**
 * Lab 세션의 남은 시간 조회
 * @param uuid Lab 세션 UUID (vmId)
 */
export async function getRemainingTime(
  uuid: string
): Promise<LabRemainingTimeResponse> {
  const response = await api.get<LabRemainingTimeResponse>(
    `/api/labs/${uuid}/remaining-time`
  );
  return response.data;
}

/**
 * Lab 세션 연장 가능 여부 확인
 * @param uuid Lab 세션 UUID (vmId)
 */
export async function checkExtendable(
  uuid: string
): Promise<LabExtendableResponse> {
  const response = await api.get<LabExtendableResponse>(
    `/api/labs/${uuid}/extendable`
  );
  return response.data;
}

/**
 * Lab 세션 시간 연장 (30분)
 * @param uuid Lab 세션 UUID (vmId)
 */
export async function extendSession(
  uuid: string
): Promise<LabExtendResponse> {
  const response = await api.post<LabExtendResponse>(
    `/api/labs/${uuid}/extend`
  );
  return response.data;
}

/**
 * Lab 세션 수동 종료
 * @param uuid Lab 세션 UUID (vmId)
 */
export async function terminateSession(
  uuid: string
): Promise<LabTerminateResponse> {
  const response = await api.post<LabTerminateResponse>(
    `/api/labs/${uuid}/terminate`
  );
  return response.data;
}
