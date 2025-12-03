// components/mypage-ai-analysis.tsx
"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatToKST } from "@/lib/utils";
import {
  getIncidents,
  getIncidentById,
  type IncidentResponse,
} from "@/lib/api";
import {
  ArrowLeft,
  AlertCircle,
  Clock,
  Server,
  Activity,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface MypageAiAnalysisProps {
  initialIncidentId?: number;
}

// ✅ 시간 포맷 함수 추가 (초 제거, 더 깔끔한 포맷)
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}.${month}.${day} ${hours}:${minutes}`;
};

export function MypageAiAnalysis({ initialIncidentId }: MypageAiAnalysisProps) {
  const [incidents, setIncidents] = useState<IncidentResponse[]>([]);
  const [selectedId, setSelectedId] = useState<number | undefined>(
    initialIncidentId
  );
  const [selectedIncident, setSelectedIncident] =
    useState<IncidentResponse | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "detail">(
    initialIncidentId ? "detail" : "list"
  );
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 페이지네이션 state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ✅ initialIncidentId가 변경되면 viewMode 업데이트
  useEffect(() => {
    if (initialIncidentId) {
      setSelectedId(initialIncidentId);
      setViewMode("detail");
    }
  }, [initialIncidentId]);

  // ✅ 리스트 가져오기 (getIncidents 사용)
  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        setLoadingList(true);
        setError(null);

        const data = await getIncidents(100);
        setIncidents(data);
      } catch (e: any) {
        setError(e.message ?? "AI 분석 내역을 불러오지 못했습니다.");
      } finally {
        setLoadingList(false);
      }
    };

    fetchIncidents();
  }, []);

  // ✅ 선택된 incident 상세 가져오기 (getIncidentById 사용)
  useEffect(() => {
    if (!selectedId || viewMode !== "detail") {
      setSelectedIncident(null);
      return;
    }

    const fetchDetail = async () => {
      try {
        setLoadingDetail(true);
        setError(null);

        const data = await getIncidentById(String(selectedId));
        setSelectedIncident(data);
      } catch (e: any) {
        setError(e.message ?? "AI 분석 상세 정보를 불러오지 못했습니다.");
      } finally {
        setLoadingDetail(false);
      }
    };

    fetchDetail();
  }, [selectedId, viewMode]);

  const handleSelectIncident = (id: number) => {
    setSelectedId(id);
    setViewMode("detail");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedId(undefined);
    window.history.replaceState({}, "", "/mypage");
  };

  const formatInstanceLabel = (id: string) => {
    if (!id) return "Unknown";

    // session-으로 시작하면 lab-으로 prefix 바꿔주고, 너무 길면 앞부분만
    if (id.startsWith("session-")) {
      const raw = id.replace(/^session-/, "");
      const short = raw.slice(0, 8); // 필요하면 길이 조절
      return `lab-${short}`;
    }

    // 그 외에는 원래 값 그대로 (또는 다른 규칙 추가 가능)
    return id;
  };

  const formatAlarmName = (alarmName: string) => {
    if (!alarmName) return "";

    // cvexpert-AppCrashes-CVE-1234-xxxx → cvexpert-AppCrashes
    const parts = alarmName.split("-");
    if (parts.length >= 2) {
      return `${parts[0]}-${parts[1]}`;
    }

    return alarmName;
  };

  const severityColor: Record<string, string> = {
    Critical: "bg-red-500/10 text-red-500 border-red-500/20",
    High: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    Medium: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    Low: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  };

  // 페이지네이션 계산
  const totalPages = Math.ceil(incidents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentIncidents = incidents.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 🔹 리스트 뷰
  if (viewMode === "list") {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-2 text-zinc-900">
            AI 분석 결과
          </h2>
          <p className="text-sm text-zinc-500">
            CloudWatch 알람을 기반으로 AI가 분석한 장애 내역입니다.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div className="text-sm text-red-600">{error}</div>
          </div>
        )}

        <Card className="overflow-hidden bg-white border-zinc-200 shadow-sm">
          <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
            <h3 className="font-semibold text-zinc-900">분석 내역</h3>
            {loadingList && (
              <span className="text-xs text-zinc-500 animate-pulse">
                불러오는 중...
              </span>
            )}
            {!loadingList && (
              <span className="text-xs text-zinc-500">
                총 {incidents.length}건
              </span>
            )}
          </div>

          {incidents.length === 0 && !loadingList && (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Activity className="h-16 w-16 text-zinc-300 mb-4" />
              <p className="text-sm text-zinc-500">
                아직 AI 분석 결과가 없습니다.
              </p>
            </div>
          )}

          {incidents.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full table-fixed text-sm">
                  <colgroup>
                    <col className="w-16" /> {/* 번호 */}
                    <col className="w-[20%]" /> {/* 알람명 - 좀 넓게 */}
                    <col className="w-[15%]" /> {/* 인스턴스 */}
                    <col className="w-[20%]" /> {/* 네임스페이스 */}
                    <col className="w-20" /> {/* 심각도 */}
                    <col className="w-[12%]" /> {/* 알람발생 */}
                    <col className="w-[12%]" /> {/* 분석완료 */}
                  </colgroup>

                  <thead className="bg-zinc-50">
                    <tr className="border-b border-zinc-200">
                      <th className="px-3 py-4 text-center text-xs font-semibold text-zinc-600 whitespace-nowrap">
                        번호
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-zinc-600">
                        알람명
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-zinc-600">
                        인스턴스
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-zinc-600">
                        네임스페이스
                      </th>
                      <th className="px-3 py-4 text-center text-xs font-semibold text-zinc-600 whitespace-nowrap">
                        심각도
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-zinc-600 whitespace-nowrap">
                        알람발생
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-zinc-600 whitespace-nowrap">
                        분석완료
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-zinc-100">
                    {currentIncidents.map((item, index) => (
                      <tr
                        key={item.id}
                        className="cursor-pointer hover:bg-zinc-50/80 transition-colors"
                        onClick={() => handleSelectIncident(item.id)}
                      >
                        <td className="px-3 py-3 text-xs text-zinc-400 text-center">
                          {startIndex + index + 1}
                        </td>

                        {/* ✅ 알람명: min-w-0 + max-w + truncate */}
                        <td className="px-4 py-3 align-top">
                          <div className="flex flex-col min-w-0 max-w-[420px]">
                            <div
                              className="font-medium text-sm text-zinc-900 truncate"
                              title={item.alarm_name}
                            >
                              {formatAlarmName(item.alarm_name)}
                            </div>

                            {item.cve_id && (
                              <div className="text-[11px] text-zinc-500 mt-1 truncate">
                                {item.cve_id}
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="text-sm flex items-center gap-2 text-zinc-700">
                            <Server className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                            <span title={item.instance_id} className="truncate">
                              {formatInstanceLabel(item.instance_id)}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="text-sm text-zinc-700 font-medium truncate">
                            {item.namespace?.split("/Logs")[0] ||
                              item.namespace}
                          </div>
                        </td>

                        <td className="px-3 py-3 text-center">
                          <Badge
                            className={cn(
                              "text-[11px] font-medium px-2.5 py-0.5 rounded-full",
                              severityColor[item.severity] ??
                                "bg-zinc-100 text-zinc-500 border-zinc-200"
                            )}
                          >
                            {item.severity}
                          </Badge>
                        </td>

                        <td className="px-4 py-3 text-xs text-zinc-600 whitespace-nowrap">
                          {formatDateTime(item.alarm_timestamp)}
                        </td>
                        <td className="px-4 py-3 text-xs text-zinc-600 whitespace-nowrap">
                          {formatDateTime(item.analyzed_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 페이지네이션 - 스타일 개선 */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between gap-4">
                  <div className="text-xs text-zinc-500">
                    {startIndex + 1}-{Math.min(endIndex, incidents.length)} / 총{" "}
                    {incidents.length}건
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="gap-1 px-2 text-xs text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 disabled:opacity-40 disabled:hover:bg-transparent"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      이전
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => {
                          if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 2 && page <= currentPage + 2)
                          ) {
                            return (
                              <Button
                                key={page}
                                variant={
                                  currentPage === page ? "default" : "ghost"
                                }
                                size="icon"
                                onClick={() => handlePageChange(page)}
                                className={cn(
                                  "w-8 h-8 rounded-full text-xs transition-colors",
                                  currentPage === page
                                    ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700"
                                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                                )}
                              >
                                {page}
                              </Button>
                            );
                          } else if (
                            page === currentPage - 3 ||
                            page === currentPage + 3
                          ) {
                            return (
                              <span
                                key={page}
                                className="px-1 text-zinc-400 text-xs"
                              >
                                …
                              </span>
                            );
                          }
                          return null;
                        }
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="gap-1 px-2 text-xs text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 disabled:opacity-40 disabled:hover:bg-transparent"
                    >
                      다음
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    );
  }

  // 🔹 상세 뷰
  return (
    <div className="flex flex-col gap-4">
      <Button
        variant="ghost"
        onClick={handleBackToList}
        className="w-fit gap-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
      >
        <ArrowLeft className="h-4 w-4" />
        목록으로 돌아가기
      </Button>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <div className="text-sm text-red-600">{error}</div>
        </div>
      )}

      {loadingDetail && (
        <Card className="p-12 bg-white border-zinc-200 shadow-sm">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-sm text-zinc-500">
                상세 정보를 불러오는 중...
              </p>
            </div>
          </div>
        </Card>
      )}

      {!loadingDetail && selectedIncident && (
        <Card className="overflow-hidden bg-white border-zinc-200 shadow-sm">
          {/* 헤더 */}
          <div className="p-6 border-b border-zinc-200 bg-zinc-50">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-3 text-zinc-900">
                  {selectedIncident.alarm_name}
                </h2>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-600">
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-zinc-400" />
                    <span className="font-medium text-zinc-700">인스턴스:</span>
                    <span>{selectedIncident.instance_id}</span>
                  </div>
                  <div>
                    <span className="font-medium text-zinc-700">리전:</span>{" "}
                    {selectedIncident.region}
                  </div>
                  <div>
                    <span className="font-medium text-zinc-700">메트릭:</span>{" "}
                    {selectedIncident.namespace} /{" "}
                    {selectedIncident.metric_name}
                  </div>
                </div>
              </div>
              <Badge
                className={cn(
                  "text-sm px-4 py-1.5",
                  severityColor[selectedIncident.severity] ??
                    "bg-zinc-100 text-zinc-500 border-zinc-200"
                )}
              >
                {selectedIncident.severity}
              </Badge>
            </div>

            <div className="flex gap-8 text-sm">
              <div>
                <div className="text-zinc-500 mb-1">알람 발생 시각</div>
                <div className="font-medium flex items-center gap-2 text-zinc-900">
                  <Clock className="h-4 w-4 text-zinc-400" />
                  {formatDateTime(selectedIncident.alarm_timestamp)}
                </div>
              </div>
              <div>
                <div className="text-zinc-500 mb-1">분석 완료 시각</div>
                <div className="font-medium flex items-center gap-2 text-zinc-900">
                  <Clock className="h-4 w-4 text-zinc-400" />
                  {formatDateTime(selectedIncident.analyzed_at)}
                </div>
              </div>
            </div>
          </div>

          {/* 내용 */}
          <div className="p-6 space-y-6">
            <section>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-zinc-900">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
                에러 요약
              </h3>
              <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 text-sm leading-relaxed text-zinc-700">
                {selectedIncident.error_summary || "요약 정보가 없습니다."}
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-zinc-900">
                <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                근본 원인 (Root Cause)
              </h3>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm leading-relaxed text-zinc-700">
                {selectedIncident.root_cause || "근본 원인 정보가 없습니다."}
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-zinc-900">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                권장 조치 (Resolution)
              </h3>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm leading-relaxed whitespace-pre-line text-zinc-700">
                {selectedIncident.resolution || "권장 조치 정보가 없습니다."}
              </div>
            </section>

            {Array.isArray(selectedIncident.affected_services) &&
              selectedIncident.affected_services.length > 0 && (
                <section>
                  <h3 className="text-lg font-semibold mb-3 text-zinc-900">
                    영향 받는 서비스
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedIncident.affected_services.map(
                      (svc: any, idx: number) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-sm bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                        >
                          {String(svc)}
                        </Badge>
                      )
                    )}
                  </div>
                </section>
              )}
          </div>
        </Card>
      )}
    </div>
  );
}
