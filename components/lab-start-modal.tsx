"use client";

import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface LabStartModalProps {
  cveId: string | null;
  onClose: () => void;
}

export function LabStartModal({ cveId, onClose }: LabStartModalProps) {
  const router = useRouter();

  const handleStart = () => {
    if (cveId) {
      router.push(`/lab/${cveId}/start`);
    }
    onClose();
  };

  return (
    <AlertDialog open={!!cveId} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>이 CVE로 실습을 시작할까요?</AlertDialogTitle>
          <AlertDialogDescription>
            학습 환경으로 이동하여 실습을 시작합니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction onClick={handleStart}>학습 시작</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
