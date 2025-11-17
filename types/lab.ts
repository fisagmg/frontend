// Lab 세션 관련 타입 정의

export interface LabRemainingTimeResponse {
  expires_at: string; // ISO datetime string (백엔드에서 제공)
}

export interface LabExtendableResponse {
  extendable: boolean;
  remainingMinutes: number;
  maxExtendMinutes: number;
}

export interface LabExtendResponse {
  expires_at: string; // 연장된 만료 시간
  extended_minutes: number; // 연장된 시간 (분)
}

export interface LabTerminateResponse {
  terminated: boolean;
  terminated_at: string;
}

