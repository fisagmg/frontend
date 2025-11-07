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

export default api;

// API 베이스 URL을 외부에서도 사용할 수 있도록 export
export { getApiBaseUrl };

export async function postJSON<TReq, TRes>(path: string, body: TReq): Promise<TRes> {
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
  const r = await fetch(`${base}/api/v1/auth/otp/send?email=${encodeURIComponent(email)}`, {
    method: "POST",
  });
  if (!r.ok) throw new Error((await r.text()) || "인증번호 전송 실패");
  return r.json();
}

export async function verifyOtp(email: string, code: string) {
  const base = getApiBaseUrl();
  const r = await fetch(`${base}/api/v1/auth/otp/verify?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`, {
    method: "POST",
  });
  if (!r.ok) throw new Error((await r.text()) || "인증번호가 유효하지 않습니다");
  return r.json();
}
