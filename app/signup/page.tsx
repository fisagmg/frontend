"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { signup, sendOtp, verifyOtp } from "@/lib/api"

export default function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [step, setStep] = useState<1|2>(1)
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [isSent, setIsSent] = useState(false)

  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")

  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const progressValue = (step / 2) * 100

  const handleSendCode = async () => {
    setError("")
    if (!email.includes("@")) {
      setError("올바른 이메일 형식을 입력하세요.")
      return
    }
    try {
      setIsLoading(true)
      await sendOtp(email)
      setIsSent(true)
      toast({ title: "인증번호를 전송했습니다", description: `${email} 메일함을 확인하세요.` })
    } catch (e:any) {
      setError(e.message || "인증번호 전송 실패")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    setError("")
    if (code.length !== 6) {
      setError("6자리 인증번호를 입력하세요.")
      return
    }
    try {
      setIsLoading(true)
      await verifyOtp(email, code)
      toast({ title: "이메일 인증이 완료되었습니다" })
      setStep(2)
    } catch (e:any) {
      setError(e.message || "인증번호가 일치하지 않습니다")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setCode("")
    await handleSendCode()
  }

  const handleSignup = async () => {
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
    if (!firstName || !lastName) {
      setError("성과 이름을 모두 입력해주세요")
      return
    }

    try {
      setIsLoading(true)
      console.log("회원가입 요청:", { email, password: "***", firstName, lastName, phone })
      const res = await signup({ email, password, firstName, lastName, phone })
      console.log("회원가입 응답:", res)
      toast({
        title: "가입이 완료되었습니다",
        description: `${res.email ?? email} 으로 가입 처리되었습니다. 로그인해주세요.`,
      })
      router.push("/login")
    } catch (e:any) {
      console.error("회원가입 에러:", e)
      const msg = e?.message || "회원가입 실패"
      setError(msg)
      toast({ title: "회원가입 실패", description: msg, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>회원가입</CardTitle>
          <CardDescription>1) 이메일 인증 → 2) 비밀번호/정보 입력</CardDescription>
          <Progress value={progressValue} className="mt-4" />
          <p className="text-xs text-muted-foreground mt-2">단계 {step} / 2</p>
        </CardHeader>

        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.trim())}
                  required
                  disabled={isSent || isLoading}
                />
              </div>

              {!isSent ? (
                <Button onClick={handleSendCode} className="w-full" disabled={!email || isLoading}>
                  인증번호 보내기
                </Button>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="code">인증번호 입력</Label>
                    <Input
                      id="code"
                      type="text"
                      placeholder="6자리 숫자"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0,6))}
                      maxLength={6}
                      required
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button onClick={handleResend} variant="ghost" size="sm" disabled={isLoading}>
                      재전송
                    </Button>
                    <Button onClick={handleVerifyCode} size="sm" disabled={isLoading || code.length !== 6}>
                      확인
                    </Button>
                  </div>
                </>
              )}

              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>이메일</Label>
                <Input value={email} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="8자 이상, 대소문자와 숫자 포함"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passwordConfirm">비밀번호 확인</Label>
                <Input
                  id="passwordConfirm"
                  type="password"
                  placeholder="비밀번호를 다시 입력하세요"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="lastName">성</Label>
                  <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value.trim())} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstName">이름</Label>
                  <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value.trim())} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">핸드폰 번호</Label>
                <Input id="phone" type="tel" placeholder="010-1234-5678" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex gap-2">
                <Button onClick={() => setStep(1)} variant="outline" className="flex-1" disabled={isLoading}>
                  이전
                </Button>
                <Button
                  onClick={handleSignup}
                  className="flex-1"
                  disabled={!password || !passwordConfirm || !firstName || !lastName || !phone || isLoading || password !== passwordConfirm}
                >
                  {isLoading ? "처리 중..." : "회원가입"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
