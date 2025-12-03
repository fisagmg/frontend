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

// 401 에러 발생 시 자동 로그아웃 처리
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 로그인 페이지에서는 리다이렉트하지 않음
      const currentPath =
        typeof window !== "undefined" ? window.location.pathname : "";
      if (currentPath !== "/login") {
        // localStorage에서 인증 정보 제거
        localStorage.removeItem("access_token");
        localStorage.removeItem("auth");

        // 커스텀 이벤트 발생 (auth-context에서 감지)
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("auth:logout", {
              detail: { reason: "세션이 만료되었습니다. 다시 로그인해주세요." },
            })
          );

          // 로그인 페이지로 리다이렉트
          window.location.href =
            "/login?redirect=" + encodeURIComponent(currentPath);
        }
      }
    }
    return Promise.reject(error);
  }
);

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
  if (!r.ok) {
    let errorMessage = "인증번호가 유효하지 않습니다";
    try {
      const errorText = await r.text();
      const errorData = JSON.parse(errorText);

      // 백엔드에서 {"status":"INVALID"} 같은 응답이 오는 경우 처리
      if (errorData.status === "INVALID") {
        errorMessage = "인증번호가 일치하지 않습니다. 다시 확인해주세요.";
      } else if (errorData.status === "EXPIRED") {
        errorMessage = "인증번호가 만료되었습니다. 재전송을 눌러주세요.";
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch {
      // JSON 파싱 실패 시 기본 메시지 사용
    }
    throw new Error(errorMessage);
  }
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
  const response = await api.get<NewsResponse[]>("/api/news/top");
  return response.data;
}

export async function fetchAllNews(): Promise<NewsResponse[]> {
  const response = await api.get<NewsResponse[]>("/api/news");
  return response.data;
}

export async function createReport(
  cveId: string,
  name: string
): Promise<ReportResponse> {
  const response = await api.post<ReportResponse>("/api/reports", {
    cveId,
    name,
  });
  return response.data;
}

export async function getMyReports(): Promise<ReportResponse[]> {
  const response = await api.get<ReportResponse[]>("/api/reports/me");
  return response.data;
}

export async function getReportDownloadUrl(
  reportId: number
): Promise<PresignedUrlResponse> {
  const response = await api.get<PresignedUrlResponse>(
    `/api/reports/${reportId}/download`
  );
  return response.data;
}

export async function deleteReport(reportId: number): Promise<void> {
  await api.delete(`/api/reports/${reportId}`);
}

export async function uploadReportFile(
  reportId: number,
  file: File
): Promise<ReportUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.put<ReportUploadResponse>(
    `/api/reports/${reportId}/file`,
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

export async function deleteVM(
  uuid: string,
  cveId: string
): Promise<LabDestroyResponse> {
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
export async function extendSession(uuid: string): Promise<LabExtendResponse> {
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
  uuid: string,
  cveId: string
): Promise<LabDestroyResponse> {
  return deleteVM(uuid, cveId);
}

export async function completeLabSession(
  uuid: string
): Promise<LabTerminateResponse> {
  const response = await api.post<LabTerminateResponse>(
    `/api/labs/${uuid}/complete`
  );
  return response.data;
}

export async function cancelLabSession(
  uuid: string,
  cveId: string
): Promise<LabDestroyResponse> {
  return deleteVM(uuid, cveId);
}

// ====================================
// CVE Learning API
// ====================================

// 백엔드 CVE 응답 타입
export interface CveBackendResponse {
  name: string; // "CVE-2025-1302"
  cvssScore: number; // 9.8
  severity: "Critical" | "High" | "Medium";
  relatedDomain: string; // "WEB", "NETWORK", "Application", "SYSTEM"
  year: number; // 2025
  labOs: string; // "LINUX", "WINDOWS", "Ubuntu"
  outline: string; // 설명
}

// CVE 카테고리 통계 응답
export interface CveCategoryStatsResponse {
  total: number;
  critical: number;
  high: number;
  medium: number;
}

// CVE 진행 상황 응답
export interface CveProgressResponse {
  completedCount?: number; // 로그인 시에만 존재
  totalCount: number; // 항상 존재
}

// CVE 개수 응답
export interface CveCountResponse {
  count: number;
}

/**
 * CVE 목록 조회 (필터링 지원)
 * @param domain 관련 도메인 필터 (WEB, NETWORK, Application, SYSTEM)
 * @param year 연도 필터
 * @param os Lab OS 필터 (LINUX, WINDOWS, Ubuntu)
 */
export async function fetchCveList(
  domain?: string,
  year?: number,
  os?: string
): Promise<CveBackendResponse[]> {
  const params = new URLSearchParams();
  if (domain) params.append("domain", domain);
  if (year) params.append("year", year.toString());
  if (os) params.append("os", os);

  const url = `/api/v1/cve${params.toString() ? "?" + params.toString() : ""}`;
  const response = await api.get<CveBackendResponse[]>(url);
  return response.data;
}

/**
 * 전체 CVE 개수 조회
 */
export async function fetchCveCount(): Promise<CveCountResponse> {
  const response = await api.get<CveCountResponse>("/api/v1/cve/stats/count");
  return response.data;
}

/**
 * CVE 카테고리별 통계 조회
 */
export async function fetchCveCategories(): Promise<CveCategoryStatsResponse> {
  const response = await api.get<CveCategoryStatsResponse>(
    "/api/v1/cve/stats/categories"
  );
  return response.data;
}

/**
 * Challenge 통계 조회 (categories와 동일한 데이터)
 */
export async function fetchCveChallenges(): Promise<CveCategoryStatsResponse> {
  const response = await api.get<CveCategoryStatsResponse>(
    "/api/v1/cve/stats/challenges"
  );
  return response.data;
}

/**
 * 사용자 CVE 진행 상황 조회
 * @param token JWT 토큰 (선택적 - 있으면 completedCount 포함)
 */
export async function fetchCveProgress(
  token?: string | null
): Promise<CveProgressResponse> {
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${getApiBaseUrl()}/api/v1/cve/stats/progress`, {
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch progress: ${response.status}`);
  }

  return response.json();
}

// ====================================
// MyPage Profile API
// ====================================
export interface UserProfileResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  fullName: string;
}

export interface CompletedLabItem {
  cveId: number;
  cveName: string;
  outline: string;
  cvssScore: number;
  labOs: string | null;
  relatedDomain: string | null;
  completedAt: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  phone?: string | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export async function getMyProfile(): Promise<UserProfileResponse> {
  const response = await api.get<UserProfileResponse>("/api/mypage/me");
  return response.data;
}

export async function updateMyProfile(
  payload: UpdateProfileRequest
): Promise<UserProfileResponse> {
  const response = await api.put<UserProfileResponse>(
    "/api/mypage/me",
    payload
  );
  return response.data;
}

export async function changeMyPassword(
  payload: ChangePasswordRequest
): Promise<void> {
  await api.put("/api/mypage/me/password", payload);
}

export async function getCompletedLabs(): Promise<CompletedLabItem[]> {
  const response = await api.get<CompletedLabItem[]>(
    "/api/mypage/completed-cves"
  );
  return response.data;
}

export async function withdrawAccount(): Promise<void> {
  await api.delete("/api/mypage/withdraw");
}

// ============================================
// Admin Lab APIs
// ============================================

export interface LabAdminLabSummary {
  labUuid: string;
  cveId: number;
  cveName: string;
  userEmail: string;
  userDisplayName: string;
  instanceId: string;
  status: string;
  createdAt: string;
  expiresAt: string;
  ttlRemainingSeconds: number | null;
  ttlRemainingMinutes: number | null;
  monitoringAvailable: boolean;
}

export interface LabAdminLabPageResponse {
  content: LabAdminLabSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface LabAdminLabDetailResponse {
  labUuid: string;
  cveId: number;
  cveName: string;
  instanceId: string;
  region: string;
  status: string;
  createdAt: string;
  expiresAt: string;
  terminatedAt: string | null;
  maxTtlMinutes: number;
  ttlRemainingSeconds: number | null;
  ttlRemainingMinutes: number | null;
  userId: number;
  userEmail: string;
  userDisplayName: string;
}

export interface LabMetricPoint {
  timestamp: string;
  value: number;
}

export interface LabLogEvent {
  timestamp: string;
  ingestionTime: string;
  message: string;
}

export interface LabLogStreamResponse {
  logGroup: string;
  logStream: string;
  events: LabLogEvent[];
}

export interface LabMetricsResponse {
  labUuid: string;
  instanceId: string;
  region: string;
  rangeMinutes: number;
  cpu: LabMetricPoint[];
  memory: LabMetricPoint[];
  disk: LabMetricPoint[];
  diskPath: string;
  diskDevice: string;
  diskFstype: string;
  logs: LabLogStreamResponse[];
}

export async function getAdminLabs(
  status?: string,
  page: number = 0,
  size: number = 20
): Promise<LabAdminLabPageResponse> {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  params.append("page", page.toString());
  params.append("size", size.toString());

  const response = await api.get<LabAdminLabPageResponse>(
    `/api/admin/labs?${params.toString()}`
  );
  return response.data;
}

export async function getAdminLabDetail(
  labUuid: string
): Promise<LabAdminLabDetailResponse> {
  const response = await api.get<LabAdminLabDetailResponse>(
    `/api/admin/labs/${labUuid}`
  );
  return response.data;
}

export async function getAdminLabMetrics(
  labUuid: string,
  range: string = "1h"
): Promise<LabMetricsResponse> {
  const response = await api.get<LabMetricsResponse>(
    `/api/admin/labs/${labUuid}/metrics?range=${range}`
  );
  return response.data;
}

// ====================================
// AI Analysis API (Lambda via Next.js API Routes)
// ====================================

export interface IncidentResponse {
  id: number;
  alarm_name: string;
  instance_id: string;
  cve_id: string | null;
  metric_name: string;
  namespace: string;
  region: string;
  severity: string;
  alarm_timestamp: string;
  analyzed_at: string;
  error_summary?: string;
  root_cause?: string;
  resolution?: string;
  evidence?: any;
  affected_services?: any;
  estimated_recovery_time?: string | null;
  raw_alarm?: any;
  raw_metrics?: any;
  raw_logs?: any;
}

export interface AnalysisResponse {
  alarm_name: string;
  instance_id: string;
  timestamp: string;
  incident_id: number;
  alarm_type: string;
  alarm_type_korean: string;
  cve_id: string;
  session_uuid: string;
  metric_name: string;
  namespace: string;
  analysis: {
    summary: string;
    severity: string;
    root_cause: string;
    evidence: string[];
    recommendations: string[];
  };
  analyzed_at: string;
  mcp_timestamp: string;
}

/**
 * Incident 목록 조회
 * @param limit 조회할 개수 (기본 100)
 */
export async function getIncidents(
  limit: number = 100
): Promise<IncidentResponse[]> {
  try {
    // ✅ 토큰이 자동으로 추가되는 axios 인스턴스 사용
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;

    const response = await fetch(`/api/ai/incidents?limit=${limit}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch incidents: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching incidents:", error);
    throw error;
  }
}

/**
 * Incident 상세 조회
 * @param incidentId Incident ID
 */
export async function getIncidentById(
  incidentId: string
): Promise<IncidentResponse> {
  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;

    const response = await fetch(`/api/ai/incidents/${incidentId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Incident not found");
      }
      throw new Error(`Failed to fetch incident: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching incident ${incidentId}:`, error);
    throw error;
  }
}

/**
 * 알람 분석 요청
 * @param alarmName 알람 이름
 * @param instanceId 인스턴스 ID
 * @param timestamp 타임스탬프
 */
export async function analyzeAlarm(
  alarmName: string,
  instanceId: string,
  timestamp: string
): Promise<AnalysisResponse> {
  try {
    const params = new URLSearchParams({
      alarm_name: alarmName,
      instance_id: instanceId,
      timestamp: timestamp,
    });

    const response = await fetch(`/api/ai/analyze?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to analyze alarm: ${response.status} - ${errorText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error analyzing alarm:", error);
    throw error;
  }
}
