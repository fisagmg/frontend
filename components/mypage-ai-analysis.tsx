// components/mypage-ai-analysis.tsx
"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatToKST } from "@/lib/utils";
import {
  ArrowLeft,
  AlertCircle,
  Clock,
  Server,
  Activity,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type IncidentSummary = {
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
};

type IncidentDetail = IncidentSummary & {
  error_summary: string;
  root_cause: string;
  resolution: string;
  evidence: any;
  affected_services: any;
  estimated_recovery_time: string | null;
  raw_alarm: any;
  raw_metrics: any;
  raw_logs: any;
};

interface MypageAiAnalysisProps {
  initialIncidentId?: number;
}

export function MypageAiAnalysis({ initialIncidentId }: MypageAiAnalysisProps) {
  const [incidents, setIncidents] = useState<IncidentSummary[]>([]);
  const [selectedId, setSelectedId] = useState<number | undefined>(
    initialIncidentId
  );
  const [selectedIncident, setSelectedIncident] =
    useState<IncidentDetail | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "detail">(
    initialIncidentId ? "detail" : "list"
  );
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 페이지네이션 state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 리스트 가져오기
  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        setLoadingList(true);
        setError(null);

        const res = await fetch("/api/ai/incidents");
        if (!res.ok) {
          throw new Error(`Failed to load incidents: ${res.status}`);
        }
        const data: IncidentSummary[] = await res.json();
        setIncidents(data);
      } catch (e: any) {
        setError(e.message ?? "AI 분석 내역을 불러오지 못했습니다.");
      } finally {
        setLoadingList(false);
      }
    };

    fetchIncidents();
  }, []);

  // 선택된 incident 상세 가져오기
  useEffect(() => {
    if (!selectedId || viewMode !== "detail") {
      setSelectedIncident(null);
      return;
    }

    const fetchDetail = async () => {
      try {
        setLoadingDetail(true);
        setError(null);

        const res = await fetch(`/api/ai/incidents/${selectedId}`);
        if (!res.ok) {
          throw new Error(`Failed to load incident detail: ${res.status}`);
        }
        const data: IncidentDetail = await res.json();
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
    // 페이지 변경 시 스크롤을 테이블 상단으로
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 🔹 리스트 뷰
  if (viewMode === "list") {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-2 text-zinc-900">AI 분석 결과</h2>
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
                <table className="w-full">
                  <thead className="bg-zinc-50">
                    <tr className="border-b border-zinc-200">
                      <th className="px-6 py-4 text-left text-sm font-semibold w-16 text-zinc-700">
                        번호
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-700">
                        알람명
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-700">
                        인스턴스
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-700">
                        메트릭
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-700">
                        심각도
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-700">
                        알람 발생 시각
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-700">
                        분석 시각
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {currentIncidents.map((item, index) => (
                      <tr
                        key={item.id}
                        className="cursor-pointer hover:bg-zinc-50 transition-colors"
                        onClick={() => handleSelectIncident(item.id)}
                      >
                        <td className="px-6 py-4 text-sm text-zinc-500">
                          {startIndex + index + 1}
                        </td>
                        <td className="px-6 py-4">
                          <div
                            className="font-medium text-sm text-zinc-900"
                            title={item.alarm_name}
                          >
                            {item.alarm_name}
                          </div>
                          {item.cve_id && (
                            <div className="text-xs text-zinc-500 mt-1">
                              {item.cve_id}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm flex items-center gap-2 text-zinc-700">
                            <Server className="h-4 w-4 text-zinc-400" />
                            <span title={item.instance_id}>
                              {item.instance_id}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-zinc-700">
                            <div>{item.metric_name}</div>
                            <div className="text-xs text-zinc-500">
                              {item.namespace}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            className={cn(
                              "text-xs",
                              severityColor[item.severity] ??
                                "bg-zinc-100 text-zinc-500 border-zinc-200"
                            )}
                          >
                            {item.severity}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-500">
                          {formatToKST(item.alarm_timestamp)}
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-500">
                          {formatToKST(item.analyzed_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
                  <div className="text-sm text-zinc-500">
                    {startIndex + 1}-{Math.min(endIndex, incidents.length)} / 총{" "}
                    {incidents.length}건
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="gap-1 bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      이전
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => {
                          // 현재 페이지 주변만 표시 (현재 페이지 ± 2)
                          if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 2 && page <= currentPage + 2)
                          ) {
                            return (
                              <Button
                                key={page}
                                variant={
                                  currentPage === page ? "default" : "outline"
                                }
                                size="sm"
                                onClick={() => handlePageChange(page)}
                                className={cn(
                                  "w-9 h-9 p-0",
                                  currentPage === page 
                                    ? "bg-zinc-900 text-white hover:bg-zinc-800"
                                    : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
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
                                className="px-2 text-zinc-400"
                              >
                                ...
                              </span>
                            );
                          }
                          return null;
                        }
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="gap-1 bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
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
                  {formatToKST(selectedIncident.alarm_timestamp)}
                </div>
              </div>
              <div>
                <div className="text-zinc-500 mb-1">분석 완료 시각</div>
                <div className="font-medium flex items-center gap-2 text-zinc-900">
                  <Clock className="h-4 w-4 text-zinc-400" />
                  {formatToKST(selectedIncident.analyzed_at)}
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
                        <Badge key={idx} variant="secondary" className="text-sm bg-zinc-100 text-zinc-700 hover:bg-zinc-200">
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
