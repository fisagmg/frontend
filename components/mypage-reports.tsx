"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/pagination"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileText, Trash2, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

const ITEMS_PER_PAGE = 10

interface Report {
  id: number
  cveId: string
  cveName: string
  objective: string
  steps: string
  commands: string
  reproduction: string
  resultSummary: string
  issues: string
  fixes: string
  learnings: string
  difficulty: string
  fileNames: string[]
  createdAt: string
}

export function MypageReports() {
  const [currentPage, setCurrentPage] = useState(1)
  const [reports, setReports] = useState<Report[]>([])
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [viewReport, setViewReport] = useState<Report | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const savedReports = JSON.parse(localStorage.getItem("practice-reports") || "[]")
    setReports(savedReports)
  }, [])

  const handleDelete = (id: number) => {
    const updatedReports = reports.filter((r) => r.id !== id)
    setReports(updatedReports)
    localStorage.setItem("practice-reports", JSON.stringify(updatedReports))
    setDeleteId(null)

    toast({
      title: "보고서가 삭제되었습니다",
    })
  }

  const getReproductionBadge = (reproduction: string) => {
    switch (reproduction) {
      case "success":
        return <Badge className="bg-green-600">성공</Badge>
      case "partial":
        return <Badge className="bg-yellow-600">부분 성공</Badge>
      case "fail":
        return <Badge className="bg-red-600">실패</Badge>
      default:
        return <Badge variant="outline">미기재</Badge>
    }
  }

  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const totalPages = Math.ceil(reports.length / ITEMS_PER_PAGE)
  const paginatedReports = reports.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  return (
    <>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">작성한 보고서</h2>
          <p className="text-muted-foreground">제출한 실습 보고서 목록입니다</p>
        </div>

        {reports.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">작성한 보고서가 없습니다</CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2">
              {paginatedReports.map((report) => (
                <Card key={report.id} className="hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{report.cveId}</CardTitle>
                        <CardDescription className="mt-1">{report.cveName}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      {report.objective && (
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">목표:</span> {report.objective}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">재현 결과:</span>
                        {getReproductionBadge(report.reproduction)}
                      </div>
                      <p className="text-xs text-muted-foreground">작성일: {formatDate(report.createdAt)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setViewReport(report)} className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        보기
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setDeleteId(report.id)}>
                        <Trash2 className="h-3 w-3 mr-1" />
                        삭제
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="보고서를 삭제하시겠습니까?"
        description="삭제된 보고서는 복구할 수 없습니다."
        onConfirm={() => deleteId && handleDelete(deleteId)}
      />

      <Dialog open={viewReport !== null} onOpenChange={(open) => !open && setViewReport(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white text-gray-900">
          <DialogHeader>
            <DialogTitle className="text-xl">보고서 상세</DialogTitle>
            {viewReport && (
              <p className="text-sm text-gray-600 mt-1">
                {viewReport.cveId} - {formatDate(viewReport.createdAt)}
              </p>
            )}
          </DialogHeader>

          {viewReport && (
            <div className="space-y-5 py-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">CVE 정보</h3>
                <p className="text-sm text-gray-900">{viewReport.cveName}</p>
              </div>

              {viewReport.objective && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">목표</h3>
                  <p className="text-sm text-gray-900">{viewReport.objective}</p>
                </div>
              )}

              {viewReport.steps && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">단계</h3>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{viewReport.steps}</p>
                </div>
              )}

              {viewReport.commands && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">주요 명령 / 스니펫</h3>
                  <pre className="text-xs font-mono bg-gray-100 p-3 rounded border border-gray-300 overflow-x-auto">
                    {viewReport.commands}
                  </pre>
                </div>
              )}

              {viewReport.reproduction && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">재현 결과</h3>
                  <div>{getReproductionBadge(viewReport.reproduction)}</div>
                </div>
              )}

              {viewReport.resultSummary && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">결과 요약</h3>
                  <p className="text-sm text-gray-900">{viewReport.resultSummary}</p>
                </div>
              )}

              {viewReport.issues && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">발생한 문제</h3>
                  <p className="text-sm text-gray-900">{viewReport.issues}</p>
                </div>
              )}

              {viewReport.fixes && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">해결 방법 / 시도</h3>
                  <p className="text-sm text-gray-900">{viewReport.fixes}</p>
                </div>
              )}

              {viewReport.fileNames && viewReport.fileNames.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">첨부 파일</h3>
                  <ul className="text-sm text-gray-900 space-y-1">
                    {viewReport.fileNames.map((fileName, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="text-gray-500">•</span>
                        {fileName}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {viewReport.learnings && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">배운 점</h3>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{viewReport.learnings}</p>
                </div>
              )}

              {viewReport.difficulty && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">난이도</h3>
                  <p className="text-sm text-gray-900">
                    {viewReport.difficulty === "easy"
                      ? "쉬움"
                      : viewReport.difficulty === "normal"
                        ? "보통"
                        : viewReport.difficulty === "hard"
                          ? "어려움"
                          : viewReport.difficulty}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
