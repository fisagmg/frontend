"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

interface AuthContextType {
  isAuthed: boolean
  email: string | null
  isAdmin: boolean
  login: (email: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthed, setIsAuthed] = useState(false)
  const [email, setEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 관리자 이메일 목록 (환경변수나 설정으로 관리 가능)
  const isAdmin = email === "ess5607@gmail.com"

  useEffect(() => {
    const storedAuth = localStorage.getItem("auth")
    if (storedAuth) {
      const { email } = JSON.parse(storedAuth)
      setEmail(email)
      setIsAuthed(true)
    }
    setIsLoading(false)
  }, [])

  const login = (userEmail: string) => {
    setEmail(userEmail)
    setIsAuthed(true)
    localStorage.setItem("auth", JSON.stringify({ email: userEmail }))
  }

  const logout = () => {
    setEmail(null)
    setIsAuthed(false)
    localStorage.removeItem("auth")
  }

  if (isLoading) {
    return null
  }

  return <AuthContext.Provider value={{ isAuthed, email, isAdmin, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthed } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isAuthed) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [isAuthed, router, pathname])

  if (!isAuthed) {
    return null
  }

  return <>{children}</>
}
