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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const ITEMS_PER_PAGE = 9

export default function LearnPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

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

  // "분류별로 이어서 학습하기"용 데이터 (완료된 항목들 예시)
  const continueLearningItems = useMemo(() => {
    // 실제로는 완료된 항목이나 진행중인 항목을 가져와야 함
    // 여기서는 mockLabHistory에 있는 항목들을 사용하고, 부족하면 mockCVEs에서 몇 개 가져와서 보여줌
    const items = [...mockCVEs].filter(cve => completedCVEIds.has(cve.id));
    return items.length > 0 ? items : mockCVEs.slice(0, 4);
  }, [completedCVEIds])


  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Hero / Stats Section */}
      <div className="bg-[#1e293b] text-white relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Left Side: Stats */}
            <div className="flex flex-col space-y-6 md:max-w-xl">
              <h1 className="text-4xl font-bold text-white tracking-tight">Challenges</h1>
              
              <div className="flex flex-wrap items-center gap-8 md:gap-12">
                {/* Total / Completed */}
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-white">{stats.completed}</span>
                    <span className="text-xl text-zinc-400 font-light">/ {stats.total}</span>
                  </div>
                  <p className="text-sm text-zinc-400 mt-1">Challenges</p>
                </div>

                <div className="h-12 w-px bg-zinc-700 hidden sm:block" />

                {/* Difficulty Stats */}
                <div className="flex gap-8 md:gap-12">
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
            <div className="mt-8 md:mt-0 relative w-full md:w-[400px] h-[200px] flex items-center justify-center md:justify-end">
              <Image
                src="/lllo.png"
                alt="Cyber Security Network Graph"
                width={400}
                height={200}
                className="object-contain opacity-90"
                priority
              />
            </div>
          </div>
        </div>

        {/* Background Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1e293b] via-[#1e293b]/90 to-transparent z-0 pointer-events-none" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Continue Learning Accordion Section */}
        <div className="mb-8">
          <Accordion type="single" collapsible defaultValue="continue-learning" className="w-full">
            <AccordionItem value="continue-learning" className="border rounded-lg bg-white shadow-sm px-6">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  <span className="font-semibold text-zinc-900">분류별로 이어서 학습하기</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                  {continueLearningItems.map((item) => (
                    <Card key={item.id} className="border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
                      <CardHeader className="p-4 pb-2 space-y-1">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-sm font-bold text-zinc-900 line-clamp-1" title={item.id}>
                            {item.title}
                          </CardTitle>
                          <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                        </div>
                        <p className="text-xs text-zinc-500 line-clamp-2 h-8">{item.summary}</p>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <div className="text-xs text-zinc-400 font-medium">
                          {item.domain}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-end justify-between">
            <div className="flex flex-wrap gap-4 flex-1 w-full lg:w-auto">
               {/* Domain Filter */}
               <div className="space-y-1.5 min-w-[180px] flex-1 md:flex-none">
                <Label className="text-xs font-medium text-zinc-500">분류</Label>
                <Select
                  value={domainFilter}
                  onValueChange={(value) => {
                    setDomainFilter(value)
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="bg-white border-zinc-200 text-zinc-900 h-10">
                    <SelectValue placeholder="분류별로 학습하기" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 분류</SelectItem>
                    {domainOptions.map((domain) => (
                      <SelectItem key={domain} value={domain}>
                        {domain}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Year Filter */}
              <div className="space-y-1.5 min-w-[140px] flex-1 md:flex-none">
                <Label className="text-xs font-medium text-zinc-500">년도</Label>
                <Select
                  value={yearFilter}
                  onValueChange={(value) => {
                    setYearFilter(value)
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="bg-white border-zinc-200 text-zinc-900 h-10">
                    <SelectValue placeholder="년도 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 년도</SelectItem>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Severity Filter */}
              <div className="space-y-1.5 min-w-[140px] flex-1 md:flex-none">
                <Label className="text-xs font-medium text-zinc-500">난이도/중요도</Label>
                <Select
                  value={severityFilter}
                  onValueChange={(value) => {
                    setSeverityFilter(value)
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="bg-white border-zinc-200 text-zinc-900 h-10">
                    <SelectValue placeholder="난이도 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 난이도</SelectItem>
                    {severities.map((severity) => (
                      <SelectItem key={severity} value={severity}>
                        {severity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="w-full lg:w-[400px]">
              <Label className="text-xs font-medium text-zinc-500 mb-1.5 block">검색</Label>
              <SearchBar
                onSearch={(q) => {
                  setSearchQuery(q)
                  setCurrentPage(1)
                }}
                placeholder="도전 챌린지를 도구로 상세를 찾아보세요."
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
