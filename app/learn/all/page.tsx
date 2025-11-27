"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { SearchBar } from "@/components/search-bar"
import { Pagination } from "@/components/pagination"
import { SeverityBadge } from "@/components/severity-badge"
import { mockCVEs } from "@/lib/mock-data"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

const ITEMS_PER_PAGE = 5

export default function LearnAllPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const [yearFilter, setYearFilter] = useState<string>("all")
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [osFilters, setOsFilters] = useState<string[]>([])
  const [domainFilters, setDomainFilters] = useState<string[]>([])

  const years = ["2024", "2023", "2022", "2021", "2020", "2019"]
  const severities = ["Critical", "High", "Medium", "Low"]
  const osOptions = ["Windows", "Linux", "macOS", "iOS", "Android", "Other"]
  const domainOptions = [
    "Network",
    "Web Application",
    "Database",
    "OS/Kernel",
    "Application",
    "Cloud",
    "Container",
    "Authentication",
    "Cryptography",
    "IoT/Device",
  ]

  const handleOsToggle = (os: string) => {
    setOsFilters((prev) => (prev.includes(os) ? prev.filter((o) => o !== os) : [...prev, os]))
    setCurrentPage(1)
  }

  const handleDomainToggle = (domain: string) => {
    setDomainFilters((prev) => (prev.includes(domain) ? prev.filter((d) => d !== domain) : [...prev, domain]))
    setCurrentPage(1)
  }

  const filteredCVEs = useMemo(() => {
    return mockCVEs.filter((cve) => {
      const matchesSearch =
        cve.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cve.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cve.os.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cve.domain.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesYear = yearFilter === "all" || cve.id.includes(yearFilter)
      const matchesSeverity = severityFilter === "all" || cve.severity === severityFilter
      const matchesOs = osFilters.length === 0 || osFilters.includes(cve.os)
      const matchesDomain = domainFilters.length === 0 || domainFilters.includes(cve.domain)

      return matchesSearch && matchesYear && matchesSeverity && matchesOs && matchesDomain
    })
  }, [searchQuery, yearFilter, severityFilter, osFilters, domainFilters])

  const totalPages = Math.ceil(filteredCVEs.length / ITEMS_PER_PAGE)
  const paginatedCVEs = filteredCVEs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handleRowClick = (cveId: string) => {
    router.push(`/learn/${cveId}`)
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-zinc-900">CVE 전체 보기</h1>
          <p className="text-zinc-600">모든 CVE 취약점 목록을 확인하세요</p>
        </div>

        <div className="mb-6 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end justify-between">
            <div className="flex flex-wrap gap-4 flex-1">
              <div className="space-y-2 min-w-[150px]">
                <Label className="text-zinc-900">년도</Label>
                <Select
                  value={yearFilter}
                  onValueChange={(value) => {
                    setYearFilter(value)
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="bg-white border-zinc-200 text-zinc-900 focus:ring-zinc-900/10">
                    <SelectValue placeholder="전체" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 min-w-[150px]">
                <Label className="text-zinc-900">중요도</Label>
                <Select
                  value={severityFilter}
                  onValueChange={(value) => {
                    setSeverityFilter(value)
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="bg-white border-zinc-200 text-zinc-900 focus:ring-zinc-900/10">
                    <SelectValue placeholder="전체" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    {severities.map((severity) => (
                      <SelectItem key={severity} value={severity}>
                        {severity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-900">OS</Label>
                <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-white border-zinc-200 min-w-[200px]">
                  {osOptions.map((os) => (
                    <div key={os} className="flex items-center space-x-2">
                      <Checkbox
                        id={`os-${os}`}
                        checked={osFilters.includes(os)}
                        onCheckedChange={() => handleOsToggle(os)}
                        className="border-zinc-300 data-[state=checked]:bg-zinc-900 data-[state=checked]:border-zinc-900"
                      />
                      <label htmlFor={`os-${os}`} className="text-sm cursor-pointer text-zinc-700">
                        {os}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-900">도메인</Label>
                <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-white border-zinc-200 min-w-[200px] max-w-[400px]">
                  {domainOptions.map((domain) => (
                    <div key={domain} className="flex items-center space-x-2">
                      <Checkbox
                        id={`domain-${domain}`}
                        checked={domainFilters.includes(domain)}
                        onCheckedChange={() => handleDomainToggle(domain)}
                        className="border-zinc-300 data-[state=checked]:bg-zinc-900 data-[state=checked]:border-zinc-900"
                      />
                      <label htmlFor={`domain-${domain}`} className="text-sm cursor-pointer whitespace-nowrap text-zinc-700">
                        {domain}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="w-full lg:w-1/3">
              <SearchBar
                onSearch={(q) => {
                  setSearchQuery(q)
                  setCurrentPage(1)
                }}
                placeholder="CVE 검색..."
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white shadow-sm ring-1 ring-zinc-900/5">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-100 hover:bg-zinc-50/50">
                <TableHead className="w-20 text-zinc-500">순번</TableHead>
                <TableHead className="w-40 text-zinc-500">CVE 이름</TableHead>
                <TableHead className="text-zinc-500">한 줄 설명</TableHead>
                <TableHead className="w-32 text-zinc-500">OS</TableHead>
                <TableHead className="w-40 text-zinc-500">중요도</TableHead>
                <TableHead className="w-48 text-zinc-500">도메인</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCVEs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-zinc-500 py-8">
                    검색 결과가 없습니다
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCVEs.map((cve, index) => (
                  <TableRow
                    key={cve.id}
                    className="cursor-pointer hover:bg-zinc-50 h-28 align-top border-zinc-100"
                    onClick={() => handleRowClick(cve.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        handleRowClick(cve.id)
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`${cve.id} 상세 보기`}
                  >
                    <TableCell className="pt-4 text-zinc-600">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</TableCell>
                    <TableCell className="font-medium pt-4 text-zinc-900">{cve.id}</TableCell>
                    <TableCell className="pt-4">
                      <p className="text-zinc-600 line-clamp-2">{cve.summary}</p>
                    </TableCell>
                    <TableCell className="pt-4 text-zinc-600">{cve.os}</TableCell>
                    <TableCell className="pt-4">
                      <SeverityBadge score={cve.cvssScore} level={cve.severity} showScore={true} />
                    </TableCell>
                    <TableCell className="pt-4 text-zinc-600">{cve.domain}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-6">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </div>
    </div>
  )
}
