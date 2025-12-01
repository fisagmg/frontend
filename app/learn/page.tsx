"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { CVECard } from "@/components/cve-card"
import type { CVEItem } from "@/lib/mock-data"
import { SearchBar } from "@/components/search-bar"
import { Pagination } from "@/components/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { CheckCircle, ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useAuth } from "@/lib/auth-context"
import { 
  fetchCveList, 
  fetchCveProgress, 
  fetchCveCategories,
  getCompletedLabs,
  type CveBackendResponse,
  type CompletedLabItem
} from "@/lib/api"

const ITEMS_PER_PAGE = 9

// 백엔드 응답을 프론트엔드 CVEItem으로 변환
function convertBackendCveToFrontend(backendCve: CveBackendResponse): CVEItem {
  return {
    id: backendCve.name,
    title: backendCve.outline,
    cvssScore: backendCve.cvssScore,
    severity: backendCve.severity,
    summary: backendCve.outline,
    tags: [], // 더 이상 사용하지 않음
    publishedDate: `${backendCve.year}-01-01`,
    os: backendCve.labOs as any,
    domain: backendCve.relatedDomain as any,
  };
}

export default function LearnPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthed } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [isCompletedOpen, setIsCompletedOpen] = useState(true)

  const [yearFilter, setYearFilter] = useState<string>("all")
  const [osFilter, setOsFilter] = useState<string>("all")
  const [domainFilter, setDomainFilter] = useState<string>("all")

  // URL 쿼리 파라미터에서 페이지 읽기
  const [currentPage, setCurrentPage] = useState(() => {
    const pageParam = searchParams?.get('page')
    if (pageParam) {
      const pageNum = parseInt(pageParam, 10)
      if (!isNaN(pageNum) && pageNum > 0) {
        return pageNum
      }
    }
    return 1
  })
  
  // API 데이터 상태
  const [cveList, setCveList] = useState<CVEItem[]>([])
  const [progressData, setProgressData] = useState<{ completedCount?: number; totalCount: number } | null>(null)
  const [categoryStats, setCategoryStats] = useState<{ total: number; critical: number; high: number; medium: number } | null>(null)
  const [completedLabs, setCompletedLabs] = useState<Set<string>>(new Set())
  const [completedLabsData, setCompletedLabsData] = useState<CompletedLabItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const years = ["2024", "2023", "2022", "2021", "2020", "2019"]
  const osOptions = ["Ubuntu", "Linux", "LINUX", "Windows", "CentOS", "Debian", "Alpine", "Android"]
  const domainOptions = ["WEB", "NETWORK", "Application", "SYSTEM"]

  // 진행 상황 및 통계 데이터 로드
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)
        const token = localStorage.getItem("access_token")
        
        // 진행 상황 로드 (토큰 있으면 completedCount 포함)
        const progress = await fetchCveProgress(token)
        setProgressData(progress)
        
        // 카테고리 통계 로드
        const categories = await fetchCveCategories()
        setCategoryStats(categories)
        
        // 완료된 Lab 목록 로드 (로그인 시에만)
        if (isAuthed && token) {
          try {
            const completed = await getCompletedLabs()
            setCompletedLabsData(completed)
            setCompletedLabs(new Set(completed.map(lab => lab.cveName)))
          } catch (error) {
            console.error("Failed to load completed labs:", error)
          }
        }
      } catch (error) {
        console.error("Failed to load stats:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [isAuthed])

  // CVE 목록 로드 (필터 변경 시)
  useEffect(() => {
    async function loadCveList() {
      try {
        const domain = domainFilter !== "all" ? domainFilter : undefined
        const year = yearFilter !== "all" ? parseInt(yearFilter) : undefined
        const os = osFilter !== "all" ? osFilter : undefined
        
        const backendCves = await fetchCveList(domain, year, os)
        const frontendCves = backendCves.map(convertBackendCveToFrontend)
        setCveList(frontendCves)
      } catch (error) {
        console.error("Failed to load CVE list:", error)
        setCveList([])
      }
    }
    
    loadCveList()
  }, [domainFilter, yearFilter, osFilter])

  // Stats 계산
  const stats = useMemo(() => {
    if (!progressData || !categoryStats) {
      return { total: 0, completed: 0, critical: 0, high: 0, medium: 0 }
    }
    
    return {
      total: progressData.totalCount,
      completed: progressData.completedCount ?? 0,
      critical: categoryStats.critical,
      high: categoryStats.high,
      medium: categoryStats.medium
    }
  }, [progressData, categoryStats])

  // 클라이언트 사이드 필터링 (검색만)
  const filteredCVEs = useMemo(() => {
    const filtered = cveList.filter((cve) => {
      const matchesSearch =
        cve.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cve.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cve.os.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cve.domain.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesSearch
    })

    // 정렬: 년도 내림차순 → 같은 년도 내에서는 ID 숫자 내림차순
    return filtered.sort((a, b) => {
      // CVE ID에서 년도와 ID 숫자 추출
      // 예: "CVE-2024-53677" -> year: 2024, idNum: 53677
      const parseCveId = (cveId: string) => {
        const match = cveId.match(/CVE-(\d{4})-(\d+)/)
        if (match) {
          return {
            year: parseInt(match[1], 10),
            idNum: parseInt(match[2], 10)
          }
        }
        return { year: 0, idNum: 0 }
      }

      const aParsed = parseCveId(a.id)
      const bParsed = parseCveId(b.id)

      // 1. 년도 내림차순 (최신년도 먼저)
      if (aParsed.year !== bParsed.year) {
        return bParsed.year - aParsed.year
      }

      // 2. 같은 년도 내에서는 ID 숫자 내림차순 (큰 숫자 먼저)
      return bParsed.idNum - aParsed.idNum
    })
  }, [cveList, searchQuery])

  const totalPages = Math.ceil(filteredCVEs.length / ITEMS_PER_PAGE)
  const paginatedCVEs = filteredCVEs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  // Circle Chart Calc
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const percentage = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  // 페이지 변경 시 URL 업데이트
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (currentPage > 1) {
      params.set('page', currentPage.toString())
    } else {
      params.delete('page')
    }
    const newUrl = params.toString() ? `?${params.toString()}` : ''
    window.history.replaceState({}, '', `/learn${newUrl}`)
  }, [currentPage])

  // 로딩 중이면 로딩 표시
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-zinc-600">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Hero / Stats Section */}
      <div className="bg-gradient-to-br from-slate-950 via-[#2e4057] to-slate-950 text-white relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
            {/* Left Side: Stats */}
            <div className="flex flex-col space-y-6 w-full lg:w-auto">
              <h1 className="text-3xl font-bold text-white tracking-tight">PoC</h1>
              
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
                        <span className="text-5xl font-bold text-white">
                          {progressData?.completedCount !== undefined ? progressData.completedCount : '-'}
                        </span>
                        <span className="text-xl text-zinc-400 font-light">/{stats.total}</span>
                     </div>
                     <div className="text-sm text-zinc-300 font-medium">완료된 학습</div>
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden md:block w-px h-24 bg-white/10" />

                {/* Difficulty Stats */}
                <div className="flex gap-10">
                    <div>
                      <div className="text-3xl font-bold text-white">{stats.critical}</div>
                      <div className="text-sm text-zinc-400 mt-1 leading-tight">Critical<br/></div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white">{stats.high}</div>
                      <div className="text-sm text-zinc-400 mt-1 leading-tight">High<br/></div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white">{stats.medium}</div>
                      <div className="text-sm text-zinc-400 mt-1 leading-tight">Medium<br/></div>
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
                  {completedLabsData.map((item) => (
                    <Card 
                      key={item.cveName} 
                      className="border border-zinc-200 shadow-sm hover:shadow-md transition-all duration-200 bg-white cursor-pointer hover:border-emerald-500 group"
                      onClick={() => router.push(`/learn/${item.cveName}`)}
                    >
                      <CardHeader className="p-2.5 pb-1 space-y-0">
                        <div className="flex justify-between items-start gap-2">
                          <CardTitle className="text-sm font-bold text-zinc-900 line-clamp-1 group-hover:text-emerald-600 transition-colors" title={item.outline}>
                            {item.cveName}
                          </CardTitle>
                           <div className="rounded-full border border-emerald-500 p-0.5 shrink-0">
                             <CheckCircle className="h-3 w-3 text-emerald-500" />
                           </div>
                        </div>
                        <p className="text-xs text-zinc-500 line-clamp-1">{item.outline}</p>
                      </CardHeader>
                      <CardContent className="p-2.5 pt-1.5">
                        <div className="flex flex-wrap gap-1.5">
                          {item.relatedDomain && (
                            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600 ring-1 ring-inset ring-blue-700/10">
                              {item.relatedDomain}
                            </span>
                          )}
                          {item.labOs && (
                            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600 ring-1 ring-inset ring-blue-700/10">
                              {item.labOs}
                            </span>
                          )}
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
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            {/* Filters - CVE 그리드 첫 번째 열 너비와 맞춤 */}
            <div className="flex gap-2 w-full sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]">
               {/* Year Filter */}
               <div className="flex-1 space-y-1.5">
                <Label className="text-xs font-medium text-zinc-500">공개 연도</Label>
                <Select
                  value={yearFilter}
                  onValueChange={(value) => {
                    setYearFilter(value)
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="!bg-white !border-zinc-200 !text-zinc-900 h-10 w-full">
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

              {/* Domain Filter */}
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs font-medium text-zinc-500">관련 분야</Label>
                <Select
                  value={domainFilter}
                  onValueChange={(value) => {
                    setDomainFilter(value)
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="!bg-white !border-zinc-200 !text-zinc-900 h-10 w-full">
                    <SelectValue placeholder="전체" />
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

              {/* OS Filter */}
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs font-medium text-zinc-500">실습 환경</Label>
                <Select
                  value={osFilter}
                  onValueChange={(value) => {
                    setOsFilter(value)
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="!bg-white !border-zinc-200 !text-zinc-900 h-10 w-full">
                    <SelectValue placeholder="전체" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    {osOptions.map((os) => (
                      <SelectItem key={os} value={os}>
                        {os}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Search Bar - CVE 그리드 세 번째 열 너비와 맞춤 */}
            <div className="w-full sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)] lg:ml-auto space-y-1.5">
              <Label className="text-xs font-medium !text-zinc-500">검색</Label>
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
                isCompleted={completedLabs.has(cve.id)}
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
