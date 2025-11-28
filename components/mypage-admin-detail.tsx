"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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
import { ArrowLeft, Activity, User, Server, MapPin } from "lucide-react"
import { toast } from "sonner"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface MypageAdminDetailProps {
  labUuid: string
  onBack: () => void
}

export function MypageAdminDetail({ labUuid, onBack }: MypageAdminDetailProps) {
  const [lab, setLab] = useState<LabAdminLabDetailResponse | null>(null)
  const [metrics, setMetrics] = useState<LabMetricsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [metricsLoading, setMetricsLoading] = useState(false)
  const [selectedLogStream, setSelectedLogStream] = useState<string>("")

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
      const data = await getAdminLabMetrics(labUuid, "1h")
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
    const statusMap: Record<string, { label: string; className: string }> = {
      RUNNING: { label: "RUNNING", className: "bg-green-500/20 text-green-400 border-green-500" },
      STOPPED: { label: "STOPPED", className: "bg-gray-500/20 text-gray-400 border-gray-500" },
      TERMINATED: { label: "TERMINATED", className: "bg-red-500/20 text-red-400 border-red-500" },
      PENDING: { label: "PENDING", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500" },
    }
    const config = statusMap[status] || { label: status, className: "bg-gray-500/20 text-gray-400 border-gray-500" }
    return <Badge className={config.className}>{config.label}</Badge>
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
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!lab) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Lab을 찾을 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <div className="border-b border-zinc-200 bg-white px-6 py-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-4 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Labs
        </Button>
        
        <div className="mb-4">
          <h2 className="text-2xl font-bold mb-1 text-zinc-900">{lab.cveName}</h2>
          <p className="text-sm text-zinc-500">Lab UUID: {lab.labUuid}</p>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-zinc-400" />
              <span className="text-xs text-zinc-500">상태</span>
            </div>
            {getStatusBadge(lab.status)}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <User className="h-4 w-4 text-zinc-400" />
              <span className="text-xs text-zinc-500">사용자</span>
            </div>
            <p className="text-sm font-medium text-zinc-900">{lab.userEmail}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Server className="h-4 w-4 text-zinc-400" />
              <span className="text-xs text-zinc-500">Instance ID</span>
            </div>
            <p className="text-sm font-medium font-mono text-zinc-900">{lab.instanceId}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="h-4 w-4 text-zinc-400" />
              <span className="text-xs text-zinc-500">지역</span>
            </div>
            <p className="text-sm font-medium text-zinc-900">{lab.region}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 py-6">
        <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6 bg-zinc-200 text-zinc-500">
          <TabsTrigger value="metrics" className="data-[state=active]:bg-white data-[state=active]:text-zinc-900">Metrics</TabsTrigger>
          <TabsTrigger value="logs" className="data-[state=active]:bg-white data-[state=active]:text-zinc-900">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics">
          {metricsLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-80 w-full bg-zinc-200" />
              <Skeleton className="h-80 w-full bg-zinc-200" />
              <Skeleton className="h-80 w-full bg-zinc-200" />
            </div>
          ) : metrics ? (
            <div className="space-y-6">
              {/* CPU Chart - Full Width */}
              <Card className="bg-white border-zinc-200 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <CardTitle className="text-base font-medium text-zinc-500">CPU Usage (%)</CardTitle>
                      <div className="text-3xl font-bold mt-1 text-zinc-900">{getMetricStats(metrics.cpu).current}%</div>
                    </div>
                    <div className="text-xs text-zinc-500 text-right">
                      <div>Min: {getMetricStats(metrics.cpu).min}%</div>
                      <div>Avg: {getMetricStats(metrics.cpu).avg}%</div>
                      <div>Max: {getMetricStats(metrics.cpu).max}%</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={formatMetricData(metrics.cpu)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="time" stroke="#71717a" tick={{ fill: '#71717a', fontSize: 11 }} />
                      <YAxis domain={[0, 100]} stroke="#71717a" tick={{ fill: '#71717a', fontSize: 11 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '0.375rem', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}
                        labelStyle={{ color: '#18181b' }}
                      />
                      <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Disk and Memory Charts - Side by Side */}
              <div className="grid grid-cols-2 gap-6">
                {/* Disk Chart */}
                <Card className="bg-white border-zinc-200 shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <CardTitle className="text-base font-medium text-zinc-500">Disk Usage (%)</CardTitle>
                        <div className="text-3xl font-bold mt-1 text-zinc-900">
                          {getMetricStats(metrics.disk).current}%
                        </div>
                        <div className="text-xs text-zinc-400 mt-1">
                          {metrics.diskDevice && <span>{metrics.diskDevice}</span>}
                          {metrics.diskPath && <span> → {metrics.diskPath}</span>}
                          {metrics.diskFstype && <span> ({metrics.diskFstype})</span>}
                        </div>
                      </div>
                      <div className="text-xs text-zinc-500 text-right">
                        <div>Min: {getMetricStats(metrics.disk).min}%</div>
                        <div>Avg: {getMetricStats(metrics.disk).avg}%</div>
                        <div>Max: {getMetricStats(metrics.disk).max}%</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={formatMetricData(metrics.disk)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="time" stroke="#71717a" tick={{ fill: '#71717a', fontSize: 11 }} />
                        <YAxis domain={[0, 100]} stroke="#71717a" tick={{ fill: '#71717a', fontSize: 11 }} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '0.375rem', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}
                          labelStyle={{ color: '#18181b' }}
                        />
                        <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Memory Chart */}
                <Card className="bg-white border-zinc-200 shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <CardTitle className="text-base font-medium text-zinc-500">Memory Usage (%)</CardTitle>
                        <div className="text-3xl font-bold mt-1 text-zinc-900">
                          {getMetricStats(metrics.memory).current}%
                        </div>
                        <div className="text-xs text-zinc-400 mt-1">(3.2GB / 5GB)</div>
                      </div>
                      <div className="text-xs text-zinc-500 text-right">
                        <div>Min: {getMetricStats(metrics.memory).min}%</div>
                        <div>Avg: {getMetricStats(metrics.memory).avg}%</div>
                        <div>Max: {getMetricStats(metrics.memory).max}%</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={formatMetricData(metrics.memory)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="time" stroke="#71717a" tick={{ fill: '#71717a', fontSize: 11 }} />
                        <YAxis domain={[0, 100]} stroke="#71717a" tick={{ fill: '#71717a', fontSize: 11 }} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '0.375rem', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}
                          labelStyle={{ color: '#18181b' }}
                        />
                        <Line type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-zinc-500">
              <p>메트릭 데이터가 없습니다.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="logs">
          <Card className="bg-white border-zinc-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-zinc-900">시스템 로그</CardTitle>
                <div className="flex items-center gap-4">
                  <select 
                    value={selectedLogStream}
                    onChange={(e) => setSelectedLogStream(e.target.value)}
                    className="px-3 py-2 rounded-md border border-zinc-200 bg-white text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {metrics?.logs?.map((log) => (
                      <option key={log.logStream} value={log.logStream}>
                        {log.logStream}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-zinc-900 text-green-400 p-4 rounded-lg font-mono text-xs h-[600px] overflow-y-auto border border-zinc-800">
                {selectedLogs?.events && selectedLogs.events.length > 0 ? (
                  selectedLogs.events.map((event, idx) => (
                    <div key={idx} className="mb-1">
                      <span className="text-zinc-500">
                        {new Date(event.timestamp).toLocaleTimeString("ko-KR")}
                      </span>{" "}
                      {event.message}
                    </div>
                  ))
                ) : (
                  <div className="text-zinc-500">로그가 없습니다.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

