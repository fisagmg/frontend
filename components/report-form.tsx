"use client"

import type React from "react"
import { useState, useEffect } from "react"
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

export function ReportForm() {
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
    const savedDraft = localStorage.getItem("practice-report-draft")
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft)
        setFormData(parsed)
      } catch (e) {
        console.error("Failed to load draft:", e)
      }
    }
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem("practice-report-draft", JSON.stringify(formData))
    }, 1000) // Debounce for 1 second

    return () => clearTimeout(timeoutId)
  }, [formData])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    const validFiles = selectedFiles.filter((file) => {
      const isValidType = [".png", ".jpg", ".jpeg", ".txt", ".log"].some((ext) => file.name.toLowerCase().endsWith(ext))
      const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB
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

    localStorage.removeItem("practice-report-draft")

    toast({
      title: "저장 완료",
      description: "실습 보고서가 저장되었습니다.",
    })
  }

  return (
    <form onSubmit={handleSubmit} className="h-full overflow-y-auto">
      <div className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <h2 className="text-base font-semibold">실습 보고서</h2>
        <Button type="submit" size="sm">
          제출
        </Button>
      </div>

      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="objective" className="text-sm">
            목표
          </Label>
          <Input
            id="objective"
            placeholder="RCE 재현 및 완화 검증"
            value={formData.objective}
            onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="steps" className="text-sm">
            단계
          </Label>
          <Textarea
            id="steps"
            placeholder="1) 정찰 2) 취약한 서비스 식별 3) 익스플로잇 실행"
            value={formData.steps}
            onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="commands" className="text-sm">
            주요 명령 / 스니펫
          </Label>
          <Textarea
            id="commands"
            placeholder={`sudo msfconsole -q\nuse exploit/multi/handler\nset PAYLOAD linux/x86/meterpreter/reverse_tcp`}
            value={formData.commands}
            onChange={(e) => setFormData({ ...formData, commands: e.target.value })}
            rows={5}
            className="font-mono text-xs"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm">재현 결과</Label>
          <RadioGroup
            value={formData.reproduction}
            onValueChange={(value) => setFormData({ ...formData, reproduction: value })}
          >
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="success" id="success" />
                <Label htmlFor="success" className="text-sm font-normal cursor-pointer">
                  성공
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="partial" id="partial" />
                <Label htmlFor="partial" className="text-sm font-normal cursor-pointer">
                  부분 성공
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="fail" id="fail" />
                <Label htmlFor="fail" className="text-sm font-normal cursor-pointer">
                  실패
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="resultSummary" className="text-sm">
            결과 요약
          </Label>
          <Input
            id="resultSummary"
            placeholder="익스플로잇 성공 및 쉘 획득"
            value={formData.resultSummary}
            onChange={(e) => setFormData({ ...formData, resultSummary: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="issues" className="text-sm">
            발생한 문제
          </Label>
          <Input
            id="issues"
            placeholder="리버스 포트에서 연결 거부됨"
            value={formData.issues}
            onChange={(e) => setFormData({ ...formData, issues: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fixes" className="text-sm">
            해결 방법 / 시도
          </Label>
          <Input
            id="fixes"
            placeholder="포트 포워딩 조정; 방화벽 포트 재개방"
            value={formData.fixes}
            onChange={(e) => setFormData({ ...formData, fixes: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="attachments" className="text-sm">
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
                className="w-full bg-transparent"
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
                    className="flex items-center justify-between gap-2 text-xs bg-muted px-2 py-1.5 rounded"
                  >
                    <span className="truncate flex-1">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0"
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
          <Label htmlFor="learnings" className="text-sm">
            배운 점
          </Label>
          <Textarea
            id="learnings"
            placeholder="다음에는 익스플로잇 전에 방화벽 규칙을 확인하겠습니다."
            value={formData.learnings}
            onChange={(e) => setFormData({ ...formData, learnings: e.target.value })}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="difficulty" className="text-sm">
            난이도
          </Label>
          <Select
            value={formData.difficulty}
            onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
          >
            <SelectTrigger className="w-full">
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
    </form>
  )
}
