"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { fetchTopNews } from "@/lib/api"

interface HighlightItem {
  id: number
  title: string
  snippet: string
  thumbnail: string | null
  externalUrl: string
  publisher: string
  createdAtLabel: string
}

export function NewsHighlights() {
  const [items, setItems] = useState<HighlightItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchTopNews()
        setItems(
          data.map((item) => ({
            id: item.id,
            title: item.title,
            snippet: item.firstLine,
            thumbnail: item.thumbnail || null,
            externalUrl: item.externalUrl,
            publisher: item.publisher,
            createdAtLabel: formatDate(item.createdAt),
          }))
        )
      } catch (err) {
        console.error("뉴스 불러오기 실패", err)
        setError("뉴스를 불러오지 못했습니다. 로그인 상태를 확인해 주세요.")
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [])

  const visibleItems = useMemo(() => items.slice(0, 6), [items])

  return (
    <section className="w-full py-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white tracking-tight">주요 보안 뉴스</h2>
        <Link href="/news" className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 font-medium">
          전체보기 <span aria-hidden="true">→</span>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex gap-4 p-4 rounded-xl bg-[#1e2736] animate-pulse h-32">
              <div className="w-32 h-full rounded-lg bg-slate-700/50 shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-slate-700/50 rounded w-3/4" />
                <div className="h-3 bg-slate-700/50 rounded w-full" />
                <div className="h-3 bg-slate-700/50 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : visibleItems.length === 0 ? (
        <p className="text-sm text-zinc-400">표시할 최신 뉴스가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visibleItems.map((item) => (
            <a
              key={item.id}
              href={item.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex overflow-hidden rounded-xl bg-[#1e2736] border border-white/5 hover:border-white/10 transition-all hover:-translate-y-0.5 h-32"
            >
              {/* Thumbnail Left */}
              <div className="relative w-36 shrink-0 bg-slate-800">
                {item.thumbnail ? (
                  <Image
                    src={item.thumbnail}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-zinc-600">
                    <span className="text-xs">No Image</span>
                  </div>
                )}
              </div>

              {/* Content Right */}
              <div className="flex-1 flex flex-col p-4 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 text-[10px] text-zinc-400">
                   <span className="text-blue-400 font-semibold truncate max-w-[80px]">{item.publisher}</span>
                   <span>·</span>
                   <span>{item.createdAtLabel}</span>
                </div>
                
                <h3 className="text-sm font-bold text-white leading-tight mb-1.5 line-clamp-2 group-hover:text-blue-400 transition-colors">
                  {item.title}
                </h3>

                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  {item.snippet}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
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
