"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getMyProfile } from "./api"

interface UserInfo {
  email: string
  firstName: string
  lastName: string
  fullName: string
}

interface AuthContextType {
  isAuthed: boolean
  email: string | null
  userInfo: UserInfo | null
  isAdmin: boolean
  login: (email: string, userInfo?: UserInfo) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthed, setIsAuthed] = useState(false)
  const [email, setEmail] = useState<string | null>(null)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 관리자 이메일 목록 (환경변수나 설정으로 관리 가능)
  const isAdmin = email === "ess5607@gmail.com"

  useEffect(() => {
    const initAuth = async () => {
      const storedAuth = localStorage.getItem("auth")
      const token = localStorage.getItem("access_token")
      
      if (storedAuth) {
        const authData = JSON.parse(storedAuth)
        setEmail(authData.email)
        setIsAuthed(true)
        
        // userInfo가 없고 토큰이 있으면 API에서 가져오기
        if (!authData.userInfo && token) {
          try {
            const profile = await getMyProfile()
            const userData: UserInfo = {
              email: profile.email,
              firstName: profile.firstName,
              lastName: profile.lastName,
              fullName: profile.fullName,
            }
            setUserInfo(userData)
            // localStorage 업데이트
            localStorage.setItem("auth", JSON.stringify({ 
              email: authData.email,
              userInfo: userData 
            }))
          } catch (error) {
            console.error("Failed to fetch user info:", error)
            setUserInfo(null)
          }
        } else {
          setUserInfo(authData.userInfo || null)
        }
      }
      setIsLoading(false)
    }
    
    initAuth()
  }, [])

  const login = (userEmail: string, userData?: UserInfo) => {
    setEmail(userEmail)
    setUserInfo(userData || null)
    setIsAuthed(true)
    localStorage.setItem("auth", JSON.stringify({ 
      email: userEmail,
      userInfo: userData 
    }))
  }

  const logout = () => {
    setEmail(null)
    setUserInfo(null)
    setIsAuthed(false)
    localStorage.removeItem("auth")
  }

  if (isLoading) {
    return null
  }

  return <AuthContext.Provider value={{ isAuthed, email, userInfo, isAdmin, login, logout }}>{children}</AuthContext.Provider>
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
