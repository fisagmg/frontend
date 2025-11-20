"use client"

import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Pagination } from "@/components/pagination"
import { SeverityBadge } from "@/components/severity-badge"
import { CompletedLabItem, getCompletedLabs } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

const ITEMS_PER_PAGE = 10

export function MypageLabHistory() {
  const [currentPage, setCurrentPage] = useState(1)
  const [items, setItems] = useState<CompletedLabItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchCompletedLabs = async () => {
      try {
        const data = await getCompletedLabs()
        setItems(data)
      } catch (error) {
        console.error("Failed to load completed labs:", error)
        toast({
          title: "완료된 실습을 불러오지 못했습니다",
          description: "네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompletedLabs()
  }, [toast])

  const paginatedHistory = useMemo(() => {
    return items.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  }, [items, currentPage])

  const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">실습한 CVE</h2>
        <p className="text-muted-foreground">완료한 실습 목록입니다</p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">로드 중...</p>
      ) : paginatedHistory.length === 0 ? (
        <p className="text-sm text-muted-foreground">완료된 실습이 없습니다.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {paginatedHistory.map((item) => (
            <Link key={`${item.cveId}-${item.completedAt}`} href={`/lab/${item.cveName}/start`} className="block">
              <Card className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{item.cveName}</CardTitle>
                    <SeverityBadge score={item.cvssScore} level={item.cvssScore >= 9 ? "Critical" : item.cvssScore >= 7 ? "High" : item.cvssScore >= 4 ? "Medium" : "Low"} />
                  </div>
                  <CardDescription>{item.outline}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {item.labOs && (
                      <Badge variant="outline" className="text-xs">
                        OS: {item.labOs}
                      </Badge>
                    )}
                    {item.relatedDomain && (
                      <Badge variant="outline" className="text-xs">
                        {item.relatedDomain}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">완료일: {new Date(item.completedAt).toLocaleDateString()}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && !isLoading && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      )}
    </div>
  )
}
