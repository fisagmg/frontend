"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthGuard, useAuth } from "@/lib/auth-context"
import { getAdminLabs, type LabAdminLabSummary, type LabAdminLabPageResponse } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, RefreshCw, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"

function AdminLabsPageContent() {
  const router = useRouter()
  const { isAdmin } = useAuth()
  const [labs, setLabs] = useState<LabAdminLabSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("RUNNING")
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  useEffect(() => {
    if (!isAdmin) {
      router.push("/mypage")
      return
    }
  }, [isAdmin, router])

  const fetchLabs = async () => {
    try {
      setLoading(true)
      const status = statusFilter === "ALL" ? undefined : statusFilter
      const data: LabAdminLabPageResponse = await getAdminLabs(status, page, 20)
      setLabs(data.content)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
    } catch (error) {
      console.error("Lab 목록 조회 실패:", error)
      toast.error("Lab 목록을 불러오는데 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLabs()
  }, [statusFilter, page])

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      RUNNING: { label: "실행중", variant: "default" },
      STOPPED: { label: "중지됨", variant: "secondary" },
      TERMINATED: { label: "종료됨", variant: "destructive" },
      PENDING: { label: "준비중", variant: "outline" },
    }
    const config = statusMap[status] || { label: status, variant: "outline" }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const formatTimeRemaining = (seconds: number | null) => {
    if (seconds === null || seconds <= 0) return "만료됨"
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}분 남음`
    const hours = Math.floor(minutes / 60)
    return `${hours}시간 ${minutes % 60}분 남음`
  }

  const filteredLabs = labs.filter((lab) =>
    lab.cveName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lab.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lab.labUuid.includes(searchQuery)
  )

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/mypage")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">관리자 콘솔</h1>
              <p className="text-sm text-muted-foreground">Lab 모니터링 및 관리</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lab 목록 ({totalElements}개)</CardTitle>
              <Button variant="outline" size="sm" onClick={fetchLabs}>
                <RefreshCw className="h-4 w-4 mr-2" />
                새로고침
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="CVE 이름, 이메일, Lab UUID로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="상태 필터" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">전체</SelectItem>
                  <SelectItem value="RUNNING">실행중</SelectItem>
                  <SelectItem value="STOPPED">중지됨</SelectItem>
                  <SelectItem value="TERMINATED">종료됨</SelectItem>
                  <SelectItem value="PENDING">준비중</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : filteredLabs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>표시할 Lab이 없습니다.</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {filteredLabs.map((lab) => (
                    <div
                      key={lab.labUuid}
                      className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/admin/labs/${lab.labUuid}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{lab.cveName}</h3>
                            {getStatusBadge(lab.status)}
                          </div>
                          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-muted-foreground">
                            <div>
                              <span className="font-medium">Lab UUID:</span> {lab.labUuid}
                            </div>
                            <div>
                              <span className="font-medium">Instance ID:</span> {lab.instanceId}
                            </div>
                            <div>
                              <span className="font-medium">사용자:</span> {lab.userEmail} ({lab.userDisplayName})
                            </div>
                            <div>
                              <span className="font-medium">생성 시간:</span>{" "}
                              {new Date(lab.createdAt).toLocaleString("ko-KR")}
                            </div>
                            <div>
                              <span className="font-medium">만료 시간:</span>{" "}
                              {new Date(lab.expiresAt).toLocaleString("ko-KR")}
                            </div>
                            <div>
                              <span className="font-medium">남은 시간:</span>{" "}
                              {formatTimeRemaining(lab.ttlRemainingSeconds)}
                            </div>
                          </div>
                        </div>
                        <div>
                          {lab.monitoringAvailable && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              모니터링 가능
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    Page {page + 1} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 0}
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      이전
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      다음
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AdminLabsPage() {
  return (
    <AuthGuard>
      <AdminLabsPageContent />
    </AuthGuard>
  )
}

