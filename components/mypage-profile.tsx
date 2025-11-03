"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export function MypageProfile() {
  const { toast } = useToast()
  const [name, setName] = useState("홍길동")
  const [phone, setPhone] = useState("010-1234-5678")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleUpdateProfile = () => {
    toast({
      title: "정보가 수정되었습니다",
      description: "프로필 정보가 성공적으로 업데이트되었습니다",
    })
  }

  const handleUpdatePassword = () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "비밀번호 불일치",
        description: "새 비밀번호가 일치하지 않습니다",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "비밀번호가 변경되었습니다",
      description: "새 비밀번호로 로그인해주세요",
    })
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">정보 수정</h2>
        <p className="text-muted-foreground">개인 정보를 수정할 수 있습니다</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
          <CardDescription>이름과 전화번호를 수정할 수 있습니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">이름</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">전화번호</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <Button onClick={handleUpdateProfile}>정보 수정</Button>
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
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">새 비밀번호</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <Button onClick={handleUpdatePassword}>비밀번호 변경</Button>
        </CardContent>
      </Card>
    </div>
  )
}
