"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { AuthGuard, useAuth } from "@/lib/auth-context"
import {
  getAdminLabDetail,
  getAdminLabMetrics,
  type LabAdminLabDetailResponse,
  type LabMetricsResponse,
} from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, RefreshCw, Clock, Server, User, MapPin, Activity } from "lucide-react"
import { toast } from "sonner"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

function AdminLabDetailPageContent() {
  const router = useRouter()
  const params = useParams()
  const { isAdmin } = useAuth()
  const labUuid = params?.labUuid as string

  const [lab, setLab] = useState<LabAdminLabDetailResponse | null>(null)
  const [metrics, setMetrics] = useState<LabMetricsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [metricsLoading, setMetricsLoading] = useState(false)
  const [selectedLogStream, setSelectedLogStream] = useState<string>("")
  const [autoScroll, setAutoScroll] = useState(true)

  useEffect(() => {
    if (!isAdmin) {
      router.push("/mypage")
      return
    }
  }, [isAdmin, router])

  const fetchLabDetail = async () => {
    try {
      setLoading(true)
      const data = await getAdminLabDetail(labUuid)
      setLab(data)
    } catch (error) {
      console.error("Lab 상세 조회 실패:", error)
      toast.error("Lab 정보를 불러오는데 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const fetchMetrics = async () => {
    try {
      setMetricsLoading(true)
      // 백엔드에서 Lab 생성 시간부터 현재까지 모든 메트릭 조회
      const data = await getAdminLabMetrics(labUuid, "all")
      console.log("메트릭 조회 성공:", {
        labUuid,
        cpuPoints: data.cpu.length,
        memoryPoints: data.memory.length,
        diskPoints: data.disk.length,
        diskPath: data.diskPath,
        diskDevice: data.diskDevice,
        logs: data.logs.length
      })
      setMetrics(data)
      if (data.logs && data.logs.length > 0 && !selectedLogStream) {
        setSelectedLogStream(data.logs[0].logStream)
      }
    } catch (error) {
      console.error("메트릭 조회 실패:", error)
      toast.error("메트릭을 불러오는데 실패했습니다.")
    } finally {
      setMetricsLoading(false)
    }
  }

  useEffect(() => {
    if (labUuid) {
      fetchLabDetail()
      fetchMetrics()
    }
  }, [labUuid])

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      RUNNING: { label: "실행중", color: "bg-green-500" },
      STOPPED: { label: "중지됨", color: "bg-gray-500" },
      TERMINATED: { label: "종료됨", color: "bg-red-500" },
      PENDING: { label: "준비중", color: "bg-yellow-500" },
    }
    const config = statusMap[status] || { label: status, color: "bg-gray-500" }
    return (
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${config.color}`} />
        <span className="font-semibold">{config.label}</span>
      </div>
    )
  }

  const formatTimeRemaining = (seconds: number | null) => {
    if (seconds === null || seconds <= 0) return "만료됨"
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}분 남음`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}시간 ${mins}분 남음`
  }

  const formatMetricData = (metricPoints: Array<{ timestamp: string; value: number }>) => {
    return metricPoints.map((point) => ({
      time: new Date(point.timestamp).toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      value: Math.round(point.value * 100) / 100,
    }))
  }

  const getMetricStats = (metricPoints: Array<{ timestamp: string; value: number }>) => {
    if (metricPoints.length === 0) return { min: 0, max: 0, avg: 0, current: 0 }
    const values = metricPoints.map((p) => p.value)
    const current = values[values.length - 1] || 0
    const min = Math.min(...values)
    const max = Math.max(...values)
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    return {
      min: Math.round(min * 100) / 100,
      max: Math.round(max * 100) / 100,
      avg: Math.round(avg * 100) / 100,
      current: Math.round(current * 100) / 100,
    }
  }

  const selectedLogs = metrics?.logs?.find((log) => log.logStream === selectedLogStream)

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-32 w-full mb-4" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (!lab) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Lab을 찾을 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/admin/labs")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{lab.cveName}</h1>
              <p className="text-sm text-muted-foreground">Lab UUID: {lab.labUuid}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => { fetchLabDetail(); fetchMetrics(); }}>
              <RefreshCw className="h-4 w-4 mr-2" />
              새로고침
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">상태</p>
                {getStatusBadge(lab.status)}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <User className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">사용자</p>
                <p className="font-semibold text-sm">{lab.userEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Server className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Instance ID</p>
                <p className="font-semibold text-sm">{lab.instanceId}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">TTL</p>
                <p className="font-semibold text-sm">{formatTimeRemaining(lab.ttlRemainingSeconds)}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
            <div>
              <p className="text-xs text-muted-foreground mb-1">리전</p>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{lab.region}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">생성 시간</p>
              <span className="text-sm font-medium">{new Date(lab.createdAt).toLocaleString("ko-KR")}</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">만료 시간</p>
              <span className="text-sm font-medium">{new Date(lab.expiresAt).toLocaleString("ko-KR")}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="metrics" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="networking">Networking</TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="mt-6">
            <div className="mb-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">시스템 메트릭</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Lab 생성 시간부터 현재까지의 모든 메트릭
                </p>
              </div>
            </div>

            {metricsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-80 w-full" />
                <Skeleton className="h-80 w-full" />
                <Skeleton className="h-80 w-full" />
              </div>
            ) : metrics ? (
              <div className="space-y-6">
                {/* CPU Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>CPU 사용량 (%)</span>
                      <div className="text-sm font-normal text-muted-foreground space-x-4">
                        <span>현재: <span className="font-bold text-foreground">{getMetricStats(metrics.cpu).current}%</span></span>
                        <span>평균: {getMetricStats(metrics.cpu).avg}%</span>
                        <span>최소: {getMetricStats(metrics.cpu).min}%</span>
                        <span>최대: {getMetricStats(metrics.cpu).max}%</span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={formatMetricData(metrics.cpu)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} name="CPU %" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Memory Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>메모리 사용량 (%)</span>
                      <div className="text-sm font-normal text-muted-foreground space-x-4">
                        <span>현재: <span className="font-bold text-foreground">{getMetricStats(metrics.memory).current}%</span></span>
                        <span>평균: {getMetricStats(metrics.memory).avg}%</span>
                        <span>최소: {getMetricStats(metrics.memory).min}%</span>
                        <span>최대: {getMetricStats(metrics.memory).max}%</span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={formatMetricData(metrics.memory)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} name="Memory %" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Disk Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div>
                        <span>디스크 사용량 / IOPS</span>
                        <div className="text-xs font-normal text-muted-foreground mt-1">
                          {metrics.diskDevice && <span>{metrics.diskDevice}</span>}
                          {metrics.diskPath && <span> → {metrics.diskPath}</span>}
                          {metrics.diskFstype && <span> ({metrics.diskFstype})</span>}
                        </div>
                      </div>
                      <div className="text-sm font-normal text-muted-foreground space-x-4">
                        <span>현재: <span className="font-bold text-foreground">{getMetricStats(metrics.disk).current}%</span></span>
                        <span>평균: {getMetricStats(metrics.disk).avg}%</span>
                        <span>최소: {getMetricStats(metrics.disk).min}%</span>
                        <span>최대: {getMetricStats(metrics.disk).max}%</span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={formatMetricData(metrics.disk)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} name="Disk %" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>메트릭 데이터가 없습니다.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="logs" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>시스템 로그</CardTitle>
                  <div className="flex items-center gap-4">
                    <Select value={selectedLogStream} onValueChange={setSelectedLogStream}>
                      <SelectTrigger className="w-[240px]">
                        <SelectValue placeholder="로그 스트림 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {metrics?.logs?.map((log) => (
                          <SelectItem key={log.logStream} value={log.logStream}>
                            {log.logStream}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchMetrics}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      새로고침
                    </Button>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={autoScroll}
                        onChange={(e) => setAutoScroll(e.target.checked)}
                        className="rounded"
                      />
                      자동 스크롤
                    </label>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-[600px] overflow-y-auto">
                  {selectedLogs?.events && selectedLogs.events.length > 0 ? (
                    selectedLogs.events.map((event, idx) => (
                      <div key={idx} className="mb-1">
                        <span className="text-gray-500">
                          {new Date(event.timestamp).toLocaleTimeString("ko-KR")}
                        </span>{" "}
                        {event.message}
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500">로그가 없습니다.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="networking" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>네트워크 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Instance ID</p>
                      <p className="font-mono text-sm">{lab.instanceId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Region</p>
                      <p className="font-mono text-sm">{lab.region}</p>
                    </div>
                  </div>
                  <div className="text-muted-foreground text-sm">
                    추가적인 네트워크 정보는 AWS 콘솔에서 확인할 수 있습니다.
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function AdminLabDetailPage() {
  return (
    <AuthGuard>
      <AdminLabDetailPageContent />
    </AuthGuard>
  )
}

