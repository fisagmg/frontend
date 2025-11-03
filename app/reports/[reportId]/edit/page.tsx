"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

export default function EditReportPage() {
  const params = useParams()
  const reportId = Number(params.reportId)
  const { toast } = useToast()

  const [reportName, setReportName] = useState("")
  const [cveId, setCveId] = useState("")
  const [findings, setFindings] = useState("")
  const [methodology, setMethodology] = useState("")
  const [conclusion, setConclusion] = useState("")

  useEffect(() => {
    // Load report from localStorage
    const reports = JSON.parse(localStorage.getItem("reports") || "[]")
    const report = reports.find((r: any) => r.id === reportId)

    if (report) {
      setReportName(report.reportName)
      setCveId(report.cveName)
      setFindings(report.findings || "")
      setMethodology(report.methodology || "")
      setConclusion(report.conclusion || "")
    }
  }, [reportId])

  const handleSave = () => {
    // Update in localStorage
    const reports = JSON.parse(localStorage.getItem("reports") || "[]")
    const index = reports.findIndex((r: any) => r.id === reportId)

    if (index !== -1) {
      reports[index] = {
        ...reports[index],
        reportName,
        findings,
        methodology,
        conclusion,
      }
      localStorage.setItem("reports", JSON.stringify(reports))

      toast({
        title: "보고서가 수정되었습니다",
        description: "변경사항이 저장되었습니다.",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>보고서 수정</CardTitle>
              <Button onClick={handleSave}>저장</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="reportName">보고서명</Label>
              <Input
                id="reportName"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder="보고서 제목을 입력하세요"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cveName">CVE명</Label>
              <Input id="cveName" value={cveId} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="findings">발견 사항</Label>
              <Textarea
                id="findings"
                value={findings}
                onChange={(e) => setFindings(e.target.value)}
                placeholder="취약점 분석 결과를 작성하세요"
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="methodology">실습 방법론</Label>
              <Textarea
                id="methodology"
                value={methodology}
                onChange={(e) => setMethodology(e.target.value)}
                placeholder="사용한 도구와 방법을 설명하세요"
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="conclusion">결론 및 권고사항</Label>
              <Textarea
                id="conclusion"
                value={conclusion}
                onChange={(e) => setConclusion(e.target.value)}
                placeholder="결론과 보안 권고사항을 작성하세요"
                rows={6}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
