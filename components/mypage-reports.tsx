"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/pagination"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { FileText, Trash2, Download, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { ReportResponse, getMyReports, getReportDownloadUrl, deleteReport, uploadReportFile } from "@/lib/api"

const ITEMS_PER_PAGE = 10

// Mock CVE 데이터 (실제로는 API에서 가져와야 함)
const mockCVEs: Record<string, { title: string; cvss: number; category: string; summary: string; tags: string[] }> = {
  "CVE-2025-1302": {
    title: "JSONPath-Plus RCE 취약점",
    cvss: 9.8,
    category: "Critical",
    summary: "JSONPath-Plus 라이브러리의 원격 코드 실행 취약점",
    tags: ["RCE", "JavaScript", "Node.js"]
  },
  "CVE-2024-TEST": {
    title: "테스트 취약점",
    cvss: 7.5,
    category: "High",
    summary: "테스트용 CVE 설명",
    tags: ["Test", "Security"]
  }
}

export function MypageReports() {
  const [currentPage, setCurrentPage] = useState(1)
  const [reports, setReports] = useState<ReportResponse[]>([])
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [uploadingId, setUploadingId] = useState<number | null>(null)
  const { toast } = useToast()

  const loadReports = async () => {
    try {
      setIsLoading(true)
      const userId = 1 // TODO: 실제 userId 획득
      const data = await getMyReports(userId)
      setReports(data)
    } catch (error) {
      console.error("보고서 목록 조회 실패:", error)
      toast({
        title: "보고서 목록 조회 실패",
        description: "보고서 목록을 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadReports()
  }, [])

  const handleDownload = async (reportId: number) => {
    try {
      const userId = 1 // TODO: 실제 userId 획득
      const { presignedUrl } = await getReportDownloadUrl(reportId, userId)
      window.open(presignedUrl, '_blank')
      
      toast({
        title: "다운로드 시작",
        description: "새 탭에서 보고서를 다운로드합니다.",
      })
    } catch (error) {
      console.error("다운로드 실패:", error)
      toast({
        title: "다운로드 실패",
        description: "보고서 다운로드 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  const handleUpload = async (reportId: number, file: File) => {
    if (!file.name.endsWith('.docx')) {
      toast({
        title: "파일 형식 오류",
        description: ".docx 파일만 업로드 가능합니다.",
        variant: "destructive",
      })
      return
    }

    setUploadingId(reportId)
    try {
      const userId = 1 // TODO: 실제 userId 획득
      
      // 백엔드로 파일 업로드 (S3 덮어쓰기)
      await uploadReportFile(reportId, userId, file)
      
      // 업로드 성공 후 목록 새로고침
      await loadReports()
      
      toast({
        title: "업로드 완료",
        description: "보고서가 성공적으로 업데이트되었습니다.",
      })
    } catch (error: any) {
      console.error("업로드 실패:", error)
      toast({
        title: "업로드 실패",
        description: error.response?.data?.message || "파일 업로드 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setUploadingId(null)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const userId = 1 // TODO: 실제 userId 획득
      await deleteReport(id, userId)
      setReports(reports.filter((r) => r.id !== id))
      setDeleteId(null)

      toast({
        title: "보고서가 삭제되었습니다",
      })
    } catch (error) {
      console.error("삭제 실패:", error)
      toast({
        title: "삭제 실패",
        description: "보고서 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  const getCvssStyle = (cvss: number) => {
    if (cvss >= 9.0) return { 
      label: "Critical", 
      badge: "bg-red-50 text-red-700 ring-1 ring-red-200 hover:bg-red-100",
      text: "text-red-700"
    }
    if (cvss >= 7.0) return { 
      label: "High", 
      badge: "bg-orange-50 text-orange-700 ring-1 ring-orange-200 hover:bg-orange-100",
      text: "text-orange-700"
    }
    if (cvss >= 4.0) return { 
      label: "Medium", 
      badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-200 hover:bg-amber-100",
      text: "text-amber-700"
    }
    return { 
      label: "Low", 
      badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100",
      text: "text-emerald-700"
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
          <h2 className="text-2xl font-bold mb-2 text-zinc-900">작성한 보고서</h2>
          <p className="text-zinc-500">제출한 실습 보고서 목록입니다</p>
        </div>

        {isLoading ? (
          <Card className="bg-white border-zinc-200 shadow-sm">
            <CardContent className="py-12 text-center text-zinc-500">로딩 중...</CardContent>
          </Card>
        ) : reports.length === 0 ? (
          <Card className="bg-white border-zinc-200 shadow-sm">
            <CardContent className="py-12 text-center text-zinc-500">작성한 보고서가 없습니다</CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2">
              {paginatedReports.map((report) => {
                const cveData = mockCVEs[report.cveId] || {
                  title: "알 수 없음",
                  cvss: 0,
                  category: "Unknown",
                  summary: "CVE 정보를 찾을 수 없습니다",
                  tags: []
                }
                const cvssStyle = getCvssStyle(cveData.cvss)
                
                return (
                  <Card key={report.id} className="hover:border-blue-500 transition-colors bg-white border-zinc-200 shadow-sm">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="rounded-lg bg-blue-50 p-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg text-zinc-900">{report.cveId}</CardTitle>
                            <CardDescription className="mt-1 line-clamp-1 text-zinc-500">{cveData.title}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-lg font-bold tabular-nums ${cvssStyle.text}`}>
                            {cveData.cvss.toFixed(1)}
                          </span>
                          <Badge className={`font-medium border-0 ${cvssStyle.badge}`}>
                            {cvssStyle.label}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-zinc-600 line-clamp-2">
                          {cveData.summary}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {cveData.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs bg-zinc-100 text-zinc-600 hover:bg-zinc-200">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-zinc-400">
                          수정일: {formatDate(report.updatedAt)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleDownload(report.id)}
                          className="bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          다운로드
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          disabled={uploadingId === report.id}
                          onClick={() => {
                            const input = document.createElement('input')
                            input.type = 'file'
                            input.accept = '.docx'
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0]
                              if (file) handleUpload(report.id, file)
                            }
                            input.click()
                          }}
                          className="bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900"
                        >
                          <Upload className="h-3 w-3 mr-1" />
                          {uploadingId === report.id ? '업로드 중...' : '수정'}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => setDeleteId(report.id)}
                          className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          삭제
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
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
    </>
  )
}

