"use client";

import { useEffect, useState } from "react";
import {
  getAdminLabs,
  type LabAdminLabSummary,
  type LabAdminLabPageResponse,
} from "@/lib/api";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { MypageAdminDetail } from "@/components/mypage-admin-detail";

interface MypageAdminConsoleProps {
  onDetailViewChange?: (isDetailView: boolean) => void;
}

export function MypageAdminConsole({
  onDetailViewChange,
}: MypageAdminConsoleProps) {
  const { isAdmin } = useAuth();
  const [labs, setLabs] = useState<LabAdminLabSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLabUuid, setSelectedLabUuid] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }
    fetchLabs();
  }, [isAdmin]);

  const fetchLabs = async () => {
    try {
      setLoading(true);
      // RUNNING(ACTIVE) 상태의 Lab만 조회
      const data: LabAdminLabPageResponse = await getAdminLabs(
        "RUNNING",
        0,
        100
      );
      setLabs(data.content);
    } catch (error) {
      console.error("Lab 목록 조회 실패:", error);
      toast.error("Lab 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const filteredLabs = labs.filter(
    (lab) =>
      lab.cveName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lab.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lab.labUuid.includes(searchQuery)
  );

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const period = hours >= 12 ? "오후" : "오전";
    const displayHours = hours % 12 || 12;

    return `${year}.${month}.${day} ${period} ${displayHours}:${minutes}:${seconds}`;
  };

  const handleLabSelect = (labUuid: string) => {
    setSelectedLabUuid(labUuid);
    onDetailViewChange?.(true);
  };

  const handleBack = () => {
    setSelectedLabUuid(null);
    onDetailViewChange?.(false);
  };

  if (!isAdmin) {
    return null;
  }

  if (selectedLabUuid) {
    return <MypageAdminDetail labUuid={selectedLabUuid} onBack={handleBack} />;
  }

  return (
    <Card className="bg-white border-zinc-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2 text-zinc-900">
          <span className="text-2xl">📊</span> 랩 관리
        </CardTitle>
        <CardDescription className="text-zinc-500">
          실행 중인 모든 CVE 랩 세션을 관리하세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400/70" />

            <Input
              placeholder="이메일 또는 CVE 이름으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="
                  pl-10
                  !bg-white
                  !border-zinc-200
              -   text-zinc-900
              +   !text-zinc-900
                  focus-visible:ring-blue-500
                  placeholder:text-zinc-400
                "
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full bg-zinc-100" />
            ))}
          </div>
        ) : filteredLabs.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            <p>표시할 Lab이 없습니다.</p>
          </div>
        ) : (
          <div className="rounded-lg border border-zinc-200 overflow-hidden">
            <Table className="!text-zinc-900">
              <TableHeader>
                <TableRow className="bg-zinc-50 hover:bg-zinc-50 border-b border-zinc-200">
                  <TableHead className="font-semibold !text-zinc-700">
                    Lab UUID
                  </TableHead>
                  <TableHead className="font-semibold !text-zinc-700">
                    CVE 이름
                  </TableHead>
                  <TableHead className="font-semibold !text-zinc-700">
                    사용자 이메일
                  </TableHead>
                  <TableHead className="font-semibold !text-zinc-700">
                    생성 시간
                  </TableHead>
                  <TableHead className="font-semibold text-right !text-zinc-700">
                    작업
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLabs.map((lab) => (
                  <TableRow
                    key={lab.labUuid}
                    className="cursor-pointer hover:bg-zinc-50 transition-colors border-b border-zinc-100"
                    onClick={() => handleLabSelect(lab.labUuid)}
                  >
                    <TableCell className="font-mono text-sm !text-zinc-600">
                      {lab.labUuid.substring(0, 12)}...
                    </TableCell>
                    <TableCell className="font-medium !text-zinc-900">
                      {lab.cveName}
                    </TableCell>
                    <TableCell className="!text-zinc-700">
                      {lab.userEmail}
                    </TableCell>
                    <TableCell className="!text-zinc-500">
                      {formatDateTime(lab.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <ChevronRight className="h-5 w-5 inline-block text-zinc-400" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
