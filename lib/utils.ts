import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getSeverityFromCvss(score: number): "Low" | "Medium" | "High" | "Critical" {
  if (score >= 9.0) return "Critical"
  if (score >= 7.0) return "High"
  if (score >= 4.0) return "Medium"
  return "Low"
}
