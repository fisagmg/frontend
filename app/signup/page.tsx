"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"

const PUBLIC_DOMAINS = [
  "gmail.com",
  "outlook.com",
  "hotmail.com",
  "yahoo.com",
  "naver.com",
  "daum.net",
  "hanmail.net",
  "kakao.com",
]

export default function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [generatedCode, setGeneratedCode] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [error, setError] = useState("")

  const handleSendCode = () => {
    setError("")
    const domain = email.split("@")[1]

    if (PUBLIC_DOMAINS.includes(domain?.toLowerCase())) {
      setError("공용 이메일 도메인은 사용할 수 없습니다. 회사 이메일을 사용해주세요.")
      return
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    setGeneratedCode(code)
    toast({
      title: "인증번호를 전송했습니다",
      description: `인증번호: ${code} (데모용)`,
    })
  }

  const handleVerifyCode = () => {
    setError("")
    if (verificationCode === generatedCode) {
      toast({
        title: "인증이 완료되었습니다",
        description: "다음 단계로 진행합니다",
      })
      setStep(2)
    } else {
      setError("인증번호가 일치하지 않습니다")
    }
  }

  const handleResendCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    setGeneratedCode(code)
    setVerificationCode("")
    toast({
      title: "인증번호를 재전송했습니다",
      description: `인증번호: ${code} (데모용)`,
    })
  }

  const handleSignup = () => {
    setError("")

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    if (!passwordRegex.test(password)) {
      setError("비밀번호는 8자 이상, 대소문자와 숫자를 포함해야 합니다")
      return
    }

    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다")
      return
    }

    toast({
      title: "가입이 완료되었습니다",
      description: "로그인 페이지로 이동합니다",
    })

    setTimeout(() => {
      router.push("/login")
    }, 1500)
  }

  const progressValue = (step / 2) * 100

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>회원가입</CardTitle>
          <CardDescription>단계별로 정보를 입력하여 가입하세요</CardDescription>
          <Progress value={progressValue} className="mt-4" />
          <p className="text-xs text-muted-foreground mt-2">단계 {step} / 2</p>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">이메일 (회사 이메일만 가능)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button onClick={handleSendCode} className="w-full" disabled={!email || !!generatedCode}>
                인증번호 보내기
              </Button>

              {generatedCode && (
                <>
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-1">데모 인증번호</p>
                    <p className="text-2xl font-bold text-primary tracking-wider">{generatedCode}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">인증번호 입력</Label>
                    <Input
                      id="code"
                      type="text"
                      placeholder="6자리 숫자"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      maxLength={6}
                      required
                    />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <div className="flex gap-2 justify-end">
                    <Button onClick={handleResendCode} variant="ghost" size="sm">
                      인증번호 재전송
                    </Button>
                    <Button onClick={handleVerifyCode} size="sm" disabled={verificationCode.length !== 6}>
                      확인
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="8자 이상, 대소문자+숫자"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passwordConfirm">비밀번호 재입력</Label>
                <Input
                  id="passwordConfirm"
                  type="password"
                  placeholder="비밀번호 확인"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="홍길동"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">전화번호</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="010-1234-5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button
                onClick={handleSignup}
                className="w-full"
                disabled={!password || !passwordConfirm || !name || !phone}
              >
                가입 완료
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
