"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  changeMyPassword,
  getMyProfile,
  updateMyProfile,
} from "@/lib/api"

export function MypageProfile() {
  const { toast } = useToast()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isProfileLoading, setIsProfileLoading] = useState(true)
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getMyProfile()
        setFirstName(profile.firstName ?? "")
        setLastName(profile.lastName ?? "")
        setPhone(profile.phone ?? "")
        setEmail(profile.email ?? "")
      } catch (error) {
        console.error("Failed to load profile:", error)
        toast({
          title: "프로필 조회 실패",
          description: "프로필 정보를 불러오지 못했습니다. 다시 시도해주세요.",
          variant: "destructive",
        })
      } finally {
        setIsProfileLoading(false)
      }
    }

    fetchProfile()
  }, [toast])

  const handleUpdateProfile = async () => {
    setIsUpdatingProfile(true)
    try {
      const updated = await updateMyProfile({
        firstName,
        lastName,
        phone: phone.trim() === "" ? null : phone,
      })

      setFirstName(updated.firstName ?? "")
      setLastName(updated.lastName ?? "")
      setPhone(updated.phone ?? "")
      setEmail(updated.email ?? "")

      toast({
        title: "정보가 수정되었습니다",
        description: "프로필 정보가 성공적으로 업데이트되었습니다.",
      })
    } catch (error: any) {
      console.error("Failed to update profile:", error)
      toast({
        title: "정보 수정 실패",
        description:
          error?.response?.data?.message || "프로필 정보 수정 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "비밀번호 불일치",
        description: "새 비밀번호가 일치하지 않습니다",
        variant: "destructive",
      })
      return
    }

    setIsUpdatingPassword(true)
    try {
      await changeMyPassword({
        currentPassword,
        newPassword,
        confirmPassword,
      })

      toast({
        title: "비밀번호가 변경되었습니다",
        description: "새 비밀번호로 로그인해주세요",
      })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      console.error("Failed to change password:", error)
      const apiMessage =
        error?.response?.data?.message || error?.response?.data?.error || "비밀번호 변경 중 오류가 발생했습니다."
      toast({
        title: "비밀번호 변경 실패",
        description: apiMessage,
        variant: "destructive",
      })
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">정보 수정</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
          {/* <CardDescription>이름과 전화번호를 수정할 수 있습니다</CardDescription> */}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              value={email}
              disabled
              readOnly
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">이름</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={isProfileLoading || isUpdatingProfile}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">성</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={isProfileLoading || isUpdatingProfile}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">전화번호</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isProfileLoading || isUpdatingProfile}
            />
          </div>
          <Button
            onClick={handleUpdateProfile}
            disabled={isProfileLoading || isUpdatingProfile}
          >
            {isUpdatingProfile ? "수정 중..." : "정보 수정"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>비밀번호 변경</CardTitle>
          <CardDescription>새로운 비밀번호로 변경할 수 있습니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">현재 비밀번호</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={isUpdatingPassword}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">새 비밀번호</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isUpdatingPassword}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isUpdatingPassword}
            />
          </div>
          <Button onClick={handleUpdatePassword} disabled={isUpdatingPassword}>
            {isUpdatingPassword ? "변경 중..." : "비밀번호 변경"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
