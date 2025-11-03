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
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">CVE 전체 보기</h1>
        <p className="text-muted-foreground">모든 CVE 취약점 목록을 확인하세요</p>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end justify-between">
          <div className="flex flex-wrap gap-4 flex-1">
            <div className="space-y-2 min-w-[150px]">
              <Label>년도</Label>
              <Select
                value={yearFilter}
                onValueChange={(value) => {
                  setYearFilter(value)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger>
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
              <Label>중요도</Label>
              <Select
                value={severityFilter}
                onValueChange={(value) => {
                  setSeverityFilter(value)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger>
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
              <Label>OS</Label>
              <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-card min-w-[200px]">
                {osOptions.map((os) => (
                  <div key={os} className="flex items-center space-x-2">
                    <Checkbox
                      id={`os-${os}`}
                      checked={osFilters.includes(os)}
                      onCheckedChange={() => handleOsToggle(os)}
                    />
                    <label htmlFor={`os-${os}`} className="text-sm cursor-pointer">
                      {os}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>도메인</Label>
              <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-card min-w-[200px] max-w-[400px]">
                {domainOptions.map((domain) => (
                  <div key={domain} className="flex items-center space-x-2">
                    <Checkbox
                      id={`domain-${domain}`}
                      checked={domainFilters.includes(domain)}
                      onCheckedChange={() => handleDomainToggle(domain)}
                    />
                    <label htmlFor={`domain-${domain}`} className="text-sm cursor-pointer whitespace-nowrap">
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

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">순번</TableHead>
              <TableHead className="w-40">CVE 이름</TableHead>
              <TableHead>한 줄 설명</TableHead>
              <TableHead className="w-32">OS</TableHead>
              <TableHead className="w-40">중요도</TableHead>
              <TableHead className="w-48">도메인</TableHead>
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
                  className="cursor-pointer hover:bg-muted/50 h-28 align-top"
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
                  <TableCell className="pt-4">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</TableCell>
                  <TableCell className="font-medium pt-4">{cve.id}</TableCell>
                  <TableCell className="pt-4">
                    <p className="text-muted-foreground line-clamp-2">{cve.summary}</p>
                  </TableCell>
                  <TableCell className="pt-4">{cve.os}</TableCell>
                  <TableCell className="pt-4">
                    <SeverityBadge score={cve.cvssScore} level={cve.severity} showScore={true} />
                  </TableCell>
                  <TableCell className="pt-4">{cve.domain}</TableCell>
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
  )
}
