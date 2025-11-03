"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/pagination"
import { FilterBar, type FilterState } from "@/components/filter-bar"
import { mockCVEs } from "@/lib/mock-data"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AuthGuard } from "@/lib/auth-context"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"

const ITEMS_PER_PAGE = 5

export default function LabAllPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<FilterState>({
    year: "",
    severity: "",
    os: [],
    domain: [],
  })

  const availableYears = useMemo(() => {
    const years = mockCVEs.map((cve) => {
      const match = cve.id.match(/CVE-(\d{4})/)
      return match ? Number.parseInt(match[1]) : 2024
    })
    return Array.from(new Set(years)).sort((a, b) => b - a)
  }, [])

  const filteredCVEs = useMemo(() => {
    return mockCVEs.filter((cve) => {
      // Year filter
      if (filters.year) {
        const cveYear = cve.id.match(/CVE-(\d{4})/)?.[1]
        if (cveYear !== filters.year) return false
      }

      // Severity filter
      if (filters.severity && cve.severity !== filters.severity) {
        return false
      }

      // OS filter
      if (filters.os.length > 0 && !filters.os.includes(cve.os)) {
        return false
      }

      // Domain filter
      if (filters.domain.length > 0 && !filters.domain.includes(cve.domain)) {
        return false
      }

      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          cve.id.toLowerCase().includes(query) ||
          cve.title.toLowerCase().includes(query) ||
          cve.summary.toLowerCase().includes(query) ||
          cve.os.toLowerCase().includes(query) ||
          cve.domain.toLowerCase().includes(query)
        )
      }

      return true
    })
  }, [searchQuery, filters])

  const totalPages = Math.ceil(filteredCVEs.length / ITEMS_PER_PAGE)
  const paginatedCVEs = filteredCVEs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const handleRowClick = (cveId: string) => {
    router.push(`/learn/${cveId}`)
  }

  return (
    <AuthGuard>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">CVE 실습 전체 보기</h1>
          <p className="text-muted-foreground">모든 실습 가능한 CVE 목록을 확인하세요</p>
        </div>

        <div className="rounded-2xl bg-[var(--panel)] border border-[var(--border)] p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
            <FilterBar years={availableYears} onFilterChange={handleFilterChange} filters={filters} />

            <div className="flex justify-end w-1/2 md:w-1/3">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="CVE 검색"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead scope="col" className="w-20">
                  순번
                </TableHead>
                <TableHead scope="col" className="w-[180px]">
                  CVE 이름
                </TableHead>
                <TableHead scope="col">한 줄 설명</TableHead>
                <TableHead scope="col" className="w-[120px]">
                  OS
                </TableHead>
                <TableHead scope="col" className="w-[140px]">
                  중요도
                </TableHead>
                <TableHead scope="col" className="w-[160px]">
                  도메인
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCVEs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    검색 결과가 없습니다
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCVEs.map((cve, index) => (
                  <TableRow
                    key={cve.id}
                    className="cursor-pointer hover:bg-muted/50 h-28"
                    onClick={() => handleRowClick(cve.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleRowClick(cve.id)
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`${cve.id} 상세 보기`}
                  >
                    <TableCell className="align-top py-4">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</TableCell>
                    <TableCell className="font-medium align-top py-4">{cve.id}</TableCell>
                    <TableCell className="align-top py-4">
                      <p className="text-muted-foreground line-clamp-2">{cve.summary}</p>
                    </TableCell>
                    <TableCell className="align-top py-4">
                      <Badge variant="outline">{cve.os}</Badge>
                    </TableCell>
                    <TableCell className="align-top py-4">
                      <Badge
                        className={
                          cve.severity === "Critical"
                            ? "bg-red-500/15 text-red-400 border-red-500/30"
                            : cve.severity === "High"
                              ? "bg-orange-500/15 text-orange-400 border-orange-500/30"
                              : cve.severity === "Medium"
                                ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                                : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                        }
                      >
                        {cve.cvssScore.toFixed(1)} {cve.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="align-top py-4">
                      <span className="text-sm">{cve.domain}</span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-6 flex justify-end">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </div>
    </AuthGuard>
  )
}
