"use client"

import { useMemo, useState, useEffect } from "react"
import Image from "next/image"
import { ExternalLink, Bookmark } from "lucide-react"
import { SearchBar } from "@/components/search-bar"
import { Pagination } from "@/components/pagination"
import { fetchAllNews, type NewsResponse } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const ITEMS_PER_PAGE = 10 // 한 줄에 2개씩이므로 짝수로, 10개 적절

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

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Hero Section - Learn Page Style */}
      <div className="bg-gradient-to-br from-slate-950 via-[#2e4057] to-slate-950 text-white relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col justify-center space-y-4 py-8">
            <h1 className="text-3xl font-bold text-white tracking-tight">보안 뉴스 센터</h1>
            <p className="text-zinc-300 text-lg max-w-2xl">
              실시간 보안 이슈 & 취약점 정보
            </p>
            
            {/* Integrated Search Bar in Hero */}
            <div className="w-full max-w-3xl mt-6">
               <SearchBar 
                 onSearch={setSearchQuery} 
                 placeholder="뉴스 검색" 
                 className="!bg-white/10 border-white/20 text-white placeholder:text-zinc-400 focus:bg-white/20"
               />
            </div>
          </div>
        </div>

        {/* Background Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/60 to-transparent z-0 pointer-events-none" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-zinc-800">전체 뉴스</h2>
        </div>

        {isLoading ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-48 rounded-lg bg-zinc-200 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-6 text-sm text-red-500 bg-red-50 rounded-lg border border-red-100 text-center">
            {error}
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 bg-white rounded-lg border border-zinc-200">
            검색 조건에 해당하는 뉴스가 없습니다.
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 mb-8">
            {paginatedNews.map((item) => (
              <Card key={item.id} className="group flex flex-row overflow-hidden border border-zinc-200 shadow-sm hover:shadow-md transition-all duration-200 bg-white hover:-translate-y-0.5">
                
                <div className="flex-1 flex flex-col p-4 min-w-0">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-[9px] font-bold overflow-hidden">
                          {item.publisher.charAt(0)}
                      </div>
                      <span className="text-[11px] font-bold text-zinc-700">{item.publisher}</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 shrink-0">{formatDate(item.createdAt)}</span>
                  </div>
                  
                  <CardTitle className="text-sm font-bold text-zinc-900 leading-tight mb-2">
                    <a href={item.externalUrl} target="_blank" rel="noopener noreferrer" className="group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </a>
                  </CardTitle>

                  <p className="text-xs text-zinc-600 leading-relaxed line-clamp-4">
                    {item.firstLine}
                  </p>
                </div>

                 <div className="relative w-40 shrink-0 bg-zinc-100 border-l border-zinc-100 min-h-[8rem]">
                    {item.thumbnail ? (
                      <Image
                        src={item.thumbnail}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-zinc-300 text-xs">
                        No Image
                      </div>
                    )}
                  </div>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && !error && filteredNews.length > 0 && (
          <div className="mt-8 flex justify-center">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>
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
