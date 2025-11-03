"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Upload, X } from "lucide-react"

interface FormData {
  objective: string
  steps: string
  commands: string
  reproduction: string
  resultSummary: string
  issues: string
  fixes: string
  learnings: string
  difficulty: string
}

interface ReportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cveId: string
  cveName: string
}

export function ReportModal({ open, onOpenChange, cveId, cveName }: ReportModalProps) {
  const { toast } = useToast()
  const [files, setFiles] = useState<File[]>([])
  const [formData, setFormData] = useState<FormData>({
    objective: "",
    steps: "",
    commands: "",
    reproduction: "",
    resultSummary: "",
    issues: "",
    fixes: "",
    learnings: "",
    difficulty: "",
  })

  useEffect(() => {
    if (open) {
      const savedDraft = localStorage.getItem(`practice-report-draft-${cveId}`)
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft)
          setFormData(parsed.formData || parsed)
          setFiles([])
        } catch (e) {
          console.error("Failed to load draft:", e)
        }
      }
    }
  }, [open, cveId])

  useEffect(() => {
    if (open) {
      const timeoutId = setTimeout(() => {
        localStorage.setItem(`practice-report-draft-${cveId}`, JSON.stringify({ formData }))
      }, 1000)

      return () => clearTimeout(timeoutId)
    }
  }, [formData, open, cveId])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    const validFiles = selectedFiles.filter((file) => {
      const isValidType = [".png", ".jpg", ".jpeg", ".txt", ".log"].some((ext) => file.name.toLowerCase().endsWith(ext))
      const isValidSize = file.size <= 10 * 1024 * 1024
      return isValidType && isValidSize
    })

    if (files.length + validFiles.length > 5) {
      toast({
        title: "파일 개수 초과",
        description: "최대 5개의 파일만 업로드할 수 있습니다.",
        variant: "destructive",
      })
      return
    }

    setFiles([...files, ...validFiles])
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const reports = JSON.parse(localStorage.getItem("practice-reports") || "[]")
    const newReport = {
      id: Date.now(),
      cveId,
      cveName,
      ...formData,
      fileNames: files.map((f) => f.name),
      createdAt: new Date().toISOString(),
    }
    reports.push(newReport)
    localStorage.setItem("practice-reports", JSON.stringify(reports))

    localStorage.removeItem(`practice-report-draft-${cveId}`)

    toast({
      title: "보고서 저장 완료",
      description: "마이페이지에서 확인하실 수 있습니다.",
    })

    setFormData({
      objective: "",
      steps: "",
      commands: "",
      reproduction: "",
      resultSummary: "",
      issues: "",
      fixes: "",
      learnings: "",
      difficulty: "",
    })
    setFiles([])
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col bg-white text-gray-900">
        <DialogHeader>
          <DialogTitle className="text-xl">실습 보고서 작성</DialogTitle>
          <p className="text-sm text-gray-600 mt-1">{cveName} - 모든 항목은 선택사항입니다</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-1">
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="objective" className="text-sm font-medium text-gray-700">
                목표
              </Label>
              <Input
                id="objective"
                placeholder="RCE 재현 및 완화 검증"
                value={formData.objective}
                onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                className="bg-gray-50 border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="steps" className="text-sm font-medium text-gray-700">
                단계
              </Label>
              <Textarea
                id="steps"
                placeholder="1) 정찰 2) 취약한 서비스 식별 3) 익스플로잇 실행"
                value={formData.steps}
                onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
                rows={4}
                className="bg-gray-50 border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="commands" className="text-sm font-medium text-gray-700">
                주요 명령 / 스니펫
              </Label>
              <Textarea
                id="commands"
                placeholder={`sudo msfconsole -q\nuse exploit/multi/handler\nset PAYLOAD linux/x86/meterpreter/reverse_tcp`}
                value={formData.commands}
                onChange={(e) => setFormData({ ...formData, commands: e.target.value })}
                rows={5}
                className="font-mono text-xs bg-gray-50 border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">재현 결과</Label>
              <RadioGroup
                value={formData.reproduction}
                onValueChange={(value) => setFormData({ ...formData, reproduction: value })}
              >
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="success" id="success" />
                    <Label htmlFor="success" className="text-sm font-normal cursor-pointer text-gray-700">
                      성공
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="partial" id="partial" />
                    <Label htmlFor="partial" className="text-sm font-normal cursor-pointer text-gray-700">
                      부분 성공
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="fail" id="fail" />
                    <Label htmlFor="fail" className="text-sm font-normal cursor-pointer text-gray-700">
                      실패
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resultSummary" className="text-sm font-medium text-gray-700">
                결과 요약
              </Label>
              <Input
                id="resultSummary"
                placeholder="익스플로잇 성공 및 쉘 획득"
                value={formData.resultSummary}
                onChange={(e) => setFormData({ ...formData, resultSummary: e.target.value })}
                className="bg-gray-50 border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="issues" className="text-sm font-medium text-gray-700">
                발생한 문제
              </Label>
              <Input
                id="issues"
                placeholder="리버스 포트에서 연결 거부됨"
                value={formData.issues}
                onChange={(e) => setFormData({ ...formData, issues: e.target.value })}
                className="bg-gray-50 border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fixes" className="text-sm font-medium text-gray-700">
                해결 방법 / 시도
              </Label>
              <Input
                id="fixes"
                placeholder="포트 포워딩 조정; 방화벽 포트 재개방"
                value={formData.fixes}
                onChange={(e) => setFormData({ ...formData, fixes: e.target.value })}
                className="bg-gray-50 border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attachments" className="text-sm font-medium text-gray-700">
                첨부 파일 (스크린샷 / 로그)
              </Label>
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    id="attachments"
                    type="file"
                    multiple
                    accept=".png,.jpg,.jpeg,.txt,.log"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
                    onClick={() => document.getElementById("attachments")?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    파일 선택 (최대 5개, 각 10MB 이하)
                  </Button>
                </div>
                {files.length > 0 && (
                  <div className="space-y-1">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-2 text-xs bg-gray-100 px-2 py-1.5 rounded"
                      >
                        <span className="truncate flex-1 text-gray-700">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 text-gray-600 hover:text-gray-900"
                          onClick={() => removeFile(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="learnings" className="text-sm font-medium text-gray-700">
                배운 점
              </Label>
              <Textarea
                id="learnings"
                placeholder="다음에는 익스플로잇 전에 방화벽 규칙을 확인하겠습니다."
                value={formData.learnings}
                onChange={(e) => setFormData({ ...formData, learnings: e.target.value })}
                rows={3}
                className="bg-gray-50 border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty" className="text-sm font-medium text-gray-700">
                난이도
              </Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
              >
                <SelectTrigger className="w-full bg-gray-50 border-gray-300">
                  <SelectValue placeholder="난이도 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">쉬움</SelectItem>
                  <SelectItem value="normal">보통</SelectItem>
                  <SelectItem value="hard">어려움</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 pb-2 border-t border-gray-200 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="border-gray-300 text-gray-700 bg-transparent"
            >
              취소
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
              제출
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
