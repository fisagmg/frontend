import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getSeverityFromCvss(
  score: number
): "Low" | "Medium" | "High" | "Critical" {
  if (score >= 9.0) return "Critical";
  if (score >= 7.0) return "High";
  if (score >= 4.0) return "Medium";
  return "Low";
}

export function formatToKST(dateString: string): string {
  try {
    // RDS에 이미 KST로 저장되어 있음
    // 공백을 T로 변환만 하고 Z는 추가하지 않음
    const isoString = dateString.includes("T")
      ? dateString
      : dateString.replace(" ", "T");

    const date = new Date(isoString);

    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }

    // 단순히 포맷만 변경 (타임존 변환 없음)
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  } catch (error) {
    console.error(`Error formatting date: ${dateString}`, error);
    return "Error";
  }
}
