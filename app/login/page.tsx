"use client"

import type React from "react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { getApiBaseUrl, getMyProfile } from "@/lib/api"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const res = await fetch(`${getApiBaseUrl()}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: email,
        password: password,
      }),
    })

    if (!res.ok) {
      setError("로그인 실패")
      return
    }

    const data = await res.json()
    //console.log("로그인 결과:", data) // access_token 있을 거야

    
    // ✅ access_token 저장
    localStorage.setItem("access_token", data.access_token)

    // ✅ 사용자 정보 가져오기
    try {
      const userProfile = await getMyProfile()
      login(email, {
        email: userProfile.email,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        fullName: userProfile.fullName,
      })
    } catch (error) {
      console.error("Failed to fetch user profile:", error)
      // 프로필 가져오기 실패해도 로그인은 진행
      login(email)
    }

    const redirect = searchParams.get("redirect")
    router.push(redirect || "/")
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 bg-zinc-50">
      <Card className="w-full max-w-md bg-white border-zinc-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-zinc-900 text-2xl">로그인</CardTitle>
          <CardDescription className="text-zinc-600">계정에 로그인하여 서비스를 이용하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
             <div className="space-y-2">
               <Label htmlFor="email" className="text-zinc-700 font-medium">이메일 (아이디)</Label>
               <Input
                 id="email"
                 type="text"
                 placeholder="user@company.com"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 required
                 className="!bg-white border-zinc-300 !text-zinc-900 !focus:border-blue-400 !focus:ring-1 !focus:ring-blue-200 focus-visible:ring-offset-0"
               />
             </div>
             <div className="space-y-2">
               <Label htmlFor="password" className="text-zinc-700 font-medium">비밀번호</Label>
               <Input
                 id="password"
                 type="password"
                 placeholder="demo1234"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 required
                 className="!bg-white border-zinc-300 !text-zinc-900 !focus:border-blue-400 !focus:ring-1 !focus:ring-blue-200 focus-visible:ring-offset-0"
               />
             </div>
            {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold">
              로그인
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <Link href="/signup" className="text-blue-600 hover:text-blue-700 hover:underline font-medium">
              회원가입
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
