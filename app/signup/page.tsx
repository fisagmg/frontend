"use client"

import { useState, useEffect, useRef } from "react"
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
  const [remainingTime, setRemainingTime] = useState(300) // 5분 = 300초
  const [isSendingOtp, setIsSendingOtp] = useState(false)

  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")

  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const progressValue = (step / 2) * 100

  // 시간을 MM:SS 형식으로 변환
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleAutoResend = async () => {
    try {
      await sendOtp(email)
      setCode("") // 이전 코드 초기화
      toast({ 
        title: "인증번호가 자동으로 재전송되었습니다", 
        description: `${email} 메일함을 확인하세요.` 
      })
    } catch (e:any) {
      setError(e.message || "인증번호 자동 재전송 실패")
      setIsSent(false) // 실패 시 처음부터 다시 시작
    }
  }

  const handleSendCode = async () => {
    setError("")
    if (!email.includes("@")) {
      setError("올바른 이메일 형식을 입력하세요.")
      return
    }
    try {
      setIsLoading(true)
      setIsSendingOtp(true)
      await sendOtp(email)
      setIsSent(true)
      setRemainingTime(300) // 5분으로 리셋
      toast({ title: "인증번호를 전송했습니다", description: `${email} 메일함을 확인하세요.` })
    } catch (e:any) {
      setError(e.message || "인증번호 전송 실패")
    } finally {
      setIsLoading(false)
      setIsSendingOtp(false)
    }
  }

  // 타이머 정리 함수
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // 카운트다운 타이머
  useEffect(() => {
    if (isSent && remainingTime > 0) {
      timerRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            // 시간이 다 되면 자동 재전송
            handleAutoResend()
            return 300 // 타이머 리셋
          }
          return prev - 1
        })
      }, 1000)

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
      }
    }
  }, [isSent, remainingTime])

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
      const errorMessage = e.message || "인증번호가 일치하지 않습니다. 다시 확인해주세요."
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setCode("")
    // 타이머 리셋은 handleSendCode에서 인증번호 전송 완료 후에 처리
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
      //console.log("회원가입 요청:", { email, password: "***", firstName, lastName, phone })
      const res = await signup({ email, password, firstName, lastName, phone })
      //console.log("회원가입 응답:", res)
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
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 bg-zinc-50">
      <Card className="w-full max-w-md bg-white border-zinc-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-zinc-900 text-2xl">회원가입</CardTitle>
          {/* <CardDescription>1) 이메일 인증 → 2) 비밀번호/정보 입력</CardDescription> */}
          <Progress value={progressValue} className="mt-4" />
          <p className="text-xs text-zinc-600 mt-2">단계 {step} / 2</p>
        </CardHeader>

        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-700 font-medium">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.trim())}
                  required
                  disabled={isSent || isLoading}
                  className="
                            !bg-white
                            !text-zinc-900
                            !border border-zinc-300

                            !focus:outline-none
                            !focus:border-blue-400

                            !focus-visible:outline-none
                            focus-visible:ring-0
                            !focus-visible:ring-offset-0
                          "
                />
              </div>

              {!isSent ? (
                <>
                  <Button onClick={handleSendCode} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold" disabled={!email || isLoading}>
                    {isSendingOtp ? "전송 중..." : "인증번호 보내기"}
                  </Button>
                  {isSendingOtp && (
                    <p className="text-xs text-zinc-600 text-center">
                      인증번호 전송에 10초 정도 소요됩니다...
                    </p>
                  )}
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="code" className="text-zinc-700 font-medium">인증번호 입력</Label>
                      <span className="text-sm font-semibold text-blue-600">
                        {formatTime(remainingTime)}
                      </span>
                    </div>
                    <Input
                      id="code"
                      type="text"
                      placeholder="6자리 숫자"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0,6))}
                      maxLength={6}
                      required
                      className="
                      !bg-white
                      !text-zinc-900
                      !border border-zinc-300

                      !focus:outline-none
                      !focus:border-blue-400

                      !focus-visible:outline-none
                      focus-visible:ring-0
                      !focus-visible:ring-offset-0
                    "
                    />
                    {/* <p className="text-xs text-zinc-600">
                      시간이 만료되면 자동으로 새 인증번호가 전송됩니다
                    </p> */}
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button onClick={handleResend} size="sm" disabled={isLoading} className="border-zinc-300 text-zinc-700 hover:bg-zinc-100">
                      재전송
                    </Button>
                    <Button onClick={handleVerifyCode} size="sm" disabled={isLoading || code.length !== 6} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                      확인
                    </Button>
                  </div>
                </>
              )}

              {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-zinc-700 font-medium">이메일</Label>
                <Input value={email} disabled className="bg-zinc-50 border-zinc-300 text-zinc-600" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-zinc-700 font-medium">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="8자 이상, 대소문자와 숫자 포함"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="
                            !bg-white
                            !text-zinc-900
                            !border border-zinc-300

                            !focus:outline-none
                            !focus:border-blue-400

                            !focus-visible:outline-none
                            focus-visible:ring-0
                            !focus-visible:ring-offset-0
                          "
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passwordConfirm" className="text-zinc-700 font-medium">비밀번호 확인</Label>
                <Input
                  id="passwordConfirm"
                  type="password"
                  placeholder="비밀번호를 다시 입력하세요"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  required
                  className="!bg-white border-zinc-300 !text-zinc-900 !focus:border-blue-400 !focus:ring-1 !focus:ring-blue-200 focus-visible:ring-offset-0"

                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-zinc-700 font-medium">성</Label>
                  <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value.trim())} required className="bg-white border-zinc-300 text-zinc-900 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 focus-visible:ring-offset-0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-zinc-700 font-medium">이름</Label>
                  <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value.trim())} required className="bg-white border-zinc-300 text-zinc-900 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 focus-visible:ring-offset-0" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-zinc-700 font-medium">핸드폰 번호</Label>
                <Input id="phone" type="tel" placeholder="010-1234-5678" value={phone} onChange={(e) => setPhone(e.target.value)} required className="bg-white border-zinc-300 text-zinc-900 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 focus-visible:ring-offset-0" />
              </div>

              {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

              <div className="flex gap-2">
                <Button onClick={() => setStep(1)} variant="outline" className="flex-1 border-zinc-300 text-zinc-700 hover:bg-zinc-100" disabled={isLoading}>
                  이전
                </Button>
                <Button
                  onClick={handleSignup}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
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
