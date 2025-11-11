"use client"

import { useMemo, useState, useEffect } from "react"
import { ExternalLink } from "lucide-react"
import { SearchBar } from "@/components/search-bar"
import { Pagination } from "@/components/pagination"
import { fetchAllNews, type NewsResponse } from "@/lib/api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const ITEMS_PER_PAGE = 10

export default function NewsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [news, setNews] = useState<NewsResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchAllNews()
        setNews(data)
      } catch (err) {
        console.error("뉴스 목록 조회 실패", err)
        setError("뉴스를 불러오지 못했습니다. 로그인 상태를 확인해 주세요.")
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const filteredNews = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()
    if (!normalizedQuery) {
      return news
    }
    return news.filter((item) => item.title.toLowerCase().includes(normalizedQuery))
  }, [news, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredNews.length / ITEMS_PER_PAGE))
  const paginatedNews = filteredNews.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">보안 이슈 뉴스</h1>
        <p className="text-muted-foreground">실제 해킹/침해·취약 악용 등 실무 관련 사건 중심</p>
      </div>

      <div className="mb-6 flex justify-end">
        <div className="w-full md:w-1/2 lg:w-1/3">
          <SearchBar onSearch={setSearchQuery} placeholder="뉴스 검색..." />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="h-10 rounded bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-6 text-sm text-destructive">{error}</div>
        ) : filteredNews.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">검색 조건에 해당하는 뉴스가 없습니다.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">번호</TableHead>
                <TableHead>제목</TableHead>
                <TableHead className="w-32">출처</TableHead>
                <TableHead className="w-32">날짜</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedNews.map((item, idx) => (
                <TableRow key={item.id} className="hover:bg-muted/50">
                  <TableCell>{startIndex + idx + 1}</TableCell>
                  <TableCell>
                    <a
                      href={item.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                      title="외부 링크로 이동"
                    >
                      {item.title}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </TableCell>
                  <TableCell>{item.publisher}</TableCell>
                  <TableCell>{formatDate(item.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {!isLoading && !error && filteredNews.length > 0 && (
        <div className="mt-6">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}
    </div>
  )
}

function formatDate(dateValue: string): string {
  try {
    const date = new Date(dateValue)
    if (Number.isNaN(date.getTime())) {
      return dateValue
    }
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date)
  } catch {
    return dateValue
  }
}
