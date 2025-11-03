"use client"

import { useState } from "react"
import { mockLabHistory, mockCVEs } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Pagination } from "@/components/pagination"
import { SeverityBadge } from "@/components/severity-badge"

const ITEMS_PER_PAGE = 10

export function MypageLabHistory() {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(mockLabHistory.length / ITEMS_PER_PAGE)
  const paginatedHistory = mockLabHistory.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const enrichedHistory = paginatedHistory.map((item) => {
    const cve = mockCVEs.find((c) => c.id === item.id)
    return {
      ...item,
      cvssScore: cve?.cvssScore || 0,
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">실습한 CVE</h2>
        <p className="text-muted-foreground">완료한 실습 목록입니다</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {enrichedHistory.map((item) => (
          <Card key={item.id} className="hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <SeverityBadge score={item.cvssScore} level={item.severity} />
              </div>
              <CardDescription>{item.summary}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-3">
                {item.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">완료일: {item.completedAt}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
    </div>
  )
}
