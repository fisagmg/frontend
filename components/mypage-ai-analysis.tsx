"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface AnalysisData {
  alarm_name: string
  instance_id: string
  timestamp: string
  analysis: {
    summary: string
    severity: string
    root_cause: string
    evidence: string[]
    recommendations: string[]
  }
  analyzed_at: string
}

export function MypageAiAnalysis() {
  const searchParams = useSearchParams()
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // URL에서 알람 정보 추출
  const alarmName = searchParams.get("alarm_name")
  const instanceId = searchParams.get("instance_id")
  const timestamp = searchParams.get("timestamp")

  useEffect(() => {
    // URL에 파라미터가 있으면 자동으로 분석 시작
    if (alarmName && instanceId && timestamp) {
      fetchAnalysis()
    }
  }, [alarmName, instanceId, timestamp])

  const fetchAnalysis = async () => {
    if (!alarmName || !instanceId || !timestamp) {
      setError("알람 정보가 누락되었습니다.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const lambdaUrl = process.env.NEXT_PUBLIC_LAMBDA_ANALYSIS_URL
      
      if (!lambdaUrl) {
        throw new Error("Lambda URL이 설정되지 않았습니다.")
      }

      const response = await fetch(
        `${lambdaUrl}?alarm_name=${encodeURIComponent(alarmName)}&instance_id=${encodeURIComponent(instanceId)}&timestamp=${encodeURIComponent(timestamp)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      )

      if (!response.ok) {
        throw new Error(`분석 실패: ${response.status}`)
      }

      const data: AnalysisData = await response.json()
      setAnalysis(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  // 심각도에 따른 배지 색상
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "outline"
    }
  }

  // 로딩 중
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <div className="text-center">
          <p className="text-lg font-semibold">AI 분석 중...</p>
          <p className="text-sm text-muted-foreground">MCP 서버에서 로그와 메트릭을 수집하고 있습니다.</p>
        </div>
      </div>
    )
  }

  // 에러 발생
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>분석 오류</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  // 파라미터가 없을 때
  if (!alarmName || !instanceId || !timestamp) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI 분석 결과</CardTitle>
          <CardDescription>Slack 알림의 "원인 보러가기" 버튼을 클릭하면 분석 결과가 표시됩니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>분석 대기 중</AlertTitle>
            <AlertDescription>CloudWatch 알람이 발생하면 Slack으로 알림이 전송됩니다.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // 분석 결과 표시
  if (!analysis) return null

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">🔍 AI 근본 원인 분석</CardTitle>
              <CardDescription>Amazon Bedrock Claude를 활용한 자동 분석 결과</CardDescription>
            </div>
            <Badge variant={getSeverityColor(analysis.analysis.severity)} className="text-sm">
              {analysis.analysis.severity}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">알람 이름</span>
              <p className="font-medium mt-1">{analysis.alarm_name}</p>
            </div>
            <div>
              <span className="text-muted-foreground">인스턴스 ID</span>
              <p className="font-medium mt-1">{analysis.instance_id}</p>
            </div>
            <div>
              <span className="text-muted-foreground">발생 시각</span>
              <p className="font-medium mt-1">{new Date(analysis.timestamp).toLocaleString("ko-KR")}</p>
            </div>
            <div>
              <span className="text-muted-foreground">분석 시각</span>
              <p className="font-medium mt-1">{new Date(analysis.analyzed_at).toLocaleString("ko-KR")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 요약 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            요약
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{analysis.analysis.summary}</p>
        </CardContent>
      </Card>

      {/* 근본 원인 */}
      <Card>
        <CardHeader>
          <CardTitle>근본 원인</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="whitespace-pre-wrap">{analysis.analysis.root_cause}</p>
          </div>
        </CardContent>
      </Card>

      {/* 로그 증거 */}
      {analysis.analysis.evidence && analysis.analysis.evidence.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>로그 증거</CardTitle>
            <CardDescription>문제 발생 당시 수집된 로그 데이터</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.analysis.evidence.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <code className="flex-1 text-sm bg-muted px-2 py-1 rounded">{item}</code>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* 권장 조치사항 */}
      {analysis.analysis.recommendations && analysis.analysis.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>권장 조치사항</CardTitle>
            <CardDescription>문제 해결을 위한 즉시 조치 사항</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {analysis.analysis.recommendations.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold shrink-0">
                    {index + 1}
                  </span>
                  <p className="flex-1 pt-0.5">{item}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  )
}