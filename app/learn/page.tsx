"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { CVECard } from "@/components/cve-card"
import { mockCVEs, mockLabHistory } from "@/lib/mock-data"
import { SearchBar } from "@/components/search-bar"
import { Pagination } from "@/components/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

const ITEMS_PER_PAGE = 9

export default function LearnPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isCompletedOpen, setIsCompletedOpen] = useState(true)

  const [yearFilter, setYearFilter] = useState<string>("all")
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [domainFilter, setDomainFilter] = useState<string>("all")

  const years = ["2024", "2023", "2022", "2021", "2020", "2019"]
  const severities = ["Critical", "High", "Medium", "Low"]
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

  // Stats Calculation
  const stats = useMemo(() => {
    const total = mockCVEs.length
    const completed = mockLabHistory.length
    const easy = mockCVEs.filter(c => c.severity === "Low").length
    const medium = mockCVEs.filter(c => c.severity === "Medium").length
    const hard = mockCVEs.filter(c => c.severity === "High" || c.severity === "Critical").length

    return { total, completed, easy, medium, hard }
  }, [])

  const completedCVEIds = useMemo(() => {
    // mockLabHistory가 완료된 목록이므로 해당 ID들을 Set으로 관리
    // 데모를 위해 mockCVEs의 마지막 항목도 완료된 것으로 가정 (시각적 확인용)
    return new Set([
      ...mockLabHistory.map(h => h.id),
      mockCVEs[mockCVEs.length - 1].id, // 데모용
      mockCVEs[3].id // 데모용
    ])
  }, [])

  const filteredCVEs = useMemo(() => {
    return mockCVEs.filter((cve) => {
      const matchesSearch =
        cve.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cve.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cve.os.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cve.domain.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesYear = yearFilter === "all" || cve.id.includes(yearFilter)
      const matchesSeverity = severityFilter === "all" || cve.severity === severityFilter
      const matchesDomain = domainFilter === "all" || cve.domain === domainFilter

      return matchesSearch && matchesYear && matchesSeverity && matchesDomain
    })
  }, [searchQuery, yearFilter, severityFilter, domainFilter])

  const totalPages = Math.ceil(filteredCVEs.length / ITEMS_PER_PAGE)
  const paginatedCVEs = filteredCVEs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  // "완료된 학습"용 데이터 (완료된 항목들 예시)
  const continueLearningItems = useMemo(() => {
    // 실제로는 완료된 항목이나 진행중인 항목을 가져와야 함
    // 여기서는 mockLabHistory에 있는 항목들을 사용하고, 부족하면 mockCVEs에서 몇 개 가져와서 보여줌
    const items = [...mockCVEs].filter(cve => completedCVEIds.has(cve.id));
    return items.length > 0 ? items : mockCVEs.slice(0, 4);
  }, [completedCVEIds])

  // Circle Chart Calc
  const radius = 45 // 반지름 키움
  const circumference = 2 * Math.PI * radius
  const percentage = (stats.completed / stats.total) * 100
  const strokeDashoffset = circumference - (percentage / 100) * circumference


  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Hero / Stats Section */}
      <div className="bg-gradient-to-br from-slate-950 via-[#2e4057] to-slate-950 text-white relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
            {/* Left Side: Stats */}
            <div className="flex flex-col space-y-6 w-full lg:w-auto">
              <h1 className="text-3xl font-bold text-white tracking-tight">Challenges</h1>
              
              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                {/* Circular Progress Section */}
                <div className="flex items-center gap-8">
                  {/* Circle Chart */}
                  <div className="relative w-36 h-36">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      {/* Background Circle */}
                      <circle
                        className="text-zinc-700/50"
                        strokeWidth="8"
                        stroke="currentColor"
                        fill="transparent"
                        r={radius}
                        cx="50"
                        cy="50"
                      />
                      {/* Progress Circle */}
                      <circle
                        className="text-emerald-400 transition-all duration-1000 ease-out"
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r={radius}
                        cx="50"
                        cy="50"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">{percentage.toFixed(1)}%</span>
                    </div>
                  </div>

                  {/* Stats Text */}
                  <div className="flex flex-col justify-center">
                     <div className="flex items-baseline gap-1.5 mb-1">
                        <span className="text-5xl font-bold text-white">{stats.completed}</span>
                        <span className="text-xl text-zinc-400 font-light">/{stats.total}</span>
                     </div>
                     <div className="text-sm text-zinc-300 font-medium">완료된 Challenges</div>
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden md:block w-px h-24 bg-white/10" />

                {/* Difficulty Stats */}
                <div className="flex gap-10">
                    <div>
                      <div className="text-3xl font-bold text-white">{stats.easy}</div>
                      <div className="text-sm text-zinc-400 mt-1 leading-tight">Easy<br/>Challenges</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white">{stats.medium}</div>
                      <div className="text-sm text-zinc-400 mt-1 leading-tight">Medium<br/>Challenges</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white">{stats.hard}</div>
                      <div className="text-sm text-zinc-400 mt-1 leading-tight">Hard<br/>Challenges</div>
                    </div>
                </div>
              </div>
            </div>

            {/* Right Side: Image */}
            <div className="mt-4 lg:mt-0 relative w-full max-w-[220px] h-[110px] flex items-center justify-center lg:justify-end">
              <Image
                src="/mango2.png"
                alt="Cyber Security Network Graph"
                width={220}
                height={110}
                className="object-contain opacity-90"
                priority
              />
            </div>
          </div>
        </div>

        {/* Background Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/60 to-transparent z-0 pointer-events-none" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Continue Learning Section */}
        <div className="mb-8 border border-zinc-100 rounded-lg bg-white shadow-sm">
          <Collapsible open={isCompletedOpen} onOpenChange={setIsCompletedOpen} className="w-full">
            <div className="px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-emerald-500 p-1">
                   <CheckCircle className="h-3 w-3 text-white" strokeWidth={3} />
                </div>
                <span className="font-semibold text-zinc-900">완료된 학습</span>
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-9 p-0 h-8">
                  {isCompletedOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  <span className="sr-only">Toggle</span>
                </Button>
              </CollapsibleTrigger>
            </div>
            
            <CollapsibleContent>
              <div className="px-6 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {continueLearningItems.map((item) => (
                    <Card key={item.id} className="border border-zinc-200 shadow-sm hover:shadow-md transition-shadow bg-white">
                      <CardHeader className="p-3 pb-1 space-y-0.5">
                        <div className="flex justify-between items-start gap-2">
                          <CardTitle className="text-sm font-bold text-zinc-900 line-clamp-1" title={item.title}>
                            {item.id}
                          </CardTitle>
                           <div className="rounded-full border border-emerald-500 p-0.5 shrink-0">
                             <CheckCircle className="h-3 w-3 text-emerald-500" />
                           </div>
                        </div>
                        <p className="text-xs text-zinc-500 line-clamp-1">{item.summary}</p>
                      </CardHeader>
                      <CardContent className="p-3 pt-1">
                        <div className="text-xs text-zinc-400 font-medium">
                          {item.domain}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-end justify-between">
            <div className="flex flex-wrap gap-2 flex-1 w-full lg:w-auto">
               {/* Domain Filter */}
               <div className="min-w-[140px] md:min-w-[160px] flex-1 md:flex-none space-y-1.5">
                <Label className="text-xs font-medium text-zinc-500">분류</Label>
                <Select
                  value={domainFilter}
                  onValueChange={(value) => {
                    setDomainFilter(value)
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="bg-white border-zinc-200 text-zinc-900 h-10 w-full">
                    <SelectValue placeholder="분류" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    {domainOptions.map((domain) => (
                      <SelectItem key={domain} value={domain}>
                        {domain}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Year Filter */}
              <div className="min-w-[100px] md:min-w-[120px] flex-1 md:flex-none space-y-1.5">
                <Label className="text-xs font-medium text-zinc-500">년도</Label>
                <Select
                  value={yearFilter}
                  onValueChange={(value) => {
                    setYearFilter(value)
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="bg-white border-zinc-200 text-zinc-900 h-10 w-full">
                    <SelectValue placeholder="년도" />
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

              {/* Severity Filter */}
              <div className="min-w-[100px] md:min-w-[120px] flex-1 md:flex-none space-y-1.5">
                <Label className="text-xs font-medium text-zinc-500">중요도</Label>
                <Select
                  value={severityFilter}
                  onValueChange={(value) => {
                    setSeverityFilter(value)
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="bg-white border-zinc-200 text-zinc-900 h-10 w-full">
                    <SelectValue placeholder="중요도" />
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
            </div>

            <div className="w-full lg:w-[300px] space-y-1.5">
              <Label className="text-xs font-medium text-zinc-500">검색</Label>
              <SearchBar
                onSearch={(q) => {
                  setSearchQuery(q)
                  setCurrentPage(1)
                }}
                placeholder="CVE 검색"
              />
            </div>
          </div>
        </div>

        {/* CVE Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {paginatedCVEs.length === 0 ? (
             <div className="col-span-full text-center py-12">
               <p className="text-zinc-500">검색 결과가 없습니다.</p>
             </div>
          ) : (
            paginatedCVEs.map((cve) => (
              <CVECard 
                key={cve.id} 
                cve={cve} 
                isCompleted={completedCVEIds.has(cve.id)}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="mt-6">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </div>
    </div>
  )
}
