"use client"

import { useState, useMemo } from "react"
import { ExternalLink } from "lucide-react"
import { SearchBar } from "@/components/search-bar"
import { Pagination } from "@/components/pagination"
import { mockNews } from "@/lib/mock-data"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const ITEMS_PER_PAGE = 10

export default function NewsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const filteredNews = useMemo(() => {
    return mockNews.filter((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [searchQuery])

  const totalPages = Math.ceil(filteredNews.length / ITEMS_PER_PAGE)
  const paginatedNews = filteredNews.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

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
            {paginatedNews.map((item) => (
              <TableRow key={item.id} className="hover:bg-muted/50">
                <TableCell>{item.id}</TableCell>
                <TableCell>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                    title="외부 링크로 이동"
                  >
                    {item.title}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </TableCell>
                <TableCell>{item.source}</TableCell>
                <TableCell>{item.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-6">
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </div>
  )
}
