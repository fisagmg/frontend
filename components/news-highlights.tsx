"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { fetchTopNews, type NewsResponse } from "@/lib/api"

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

  const visibleItems = useMemo(() => items.slice(0, 4), [items])

  const handleNewsClick = (url: string) => {
    window.open(url, "_blank")
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">주요 보안 뉴스</h2>
        <Link href="/news" className="text-sm text-muted-foreground hover:text-primary transition-colors">
          전체보기 →
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="w-full flex gap-4 items-start px-4 py-3 rounded-lg bg-muted/40 animate-pulse">
              <div className="flex-shrink-0 w-24 h-16 rounded bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded" />
                <div className="h-3 bg-muted/80 rounded w-3/4" />
                <div className="h-3 bg-muted/60 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : visibleItems.length === 0 ? (
        <p className="text-sm text-muted-foreground">표시할 최신 뉴스가 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {visibleItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNewsClick(item.externalUrl)}
              className="w-full flex gap-4 items-start px-4 py-3 rounded-lg bg-card border border-border hover:bg-muted transition-colors text-left"
              aria-label={`${item.title} - 외부 링크로 이동`}
            >
              <div className="flex-shrink-0 w-24 h-16 rounded bg-muted overflow-hidden">
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(event) => {
                      event.currentTarget.onerror = null
                      event.currentTarget.src = "/news-placeholder.svg"
                    }}
                  />
                ) : (
                  <img src="/news-placeholder.svg" alt="" className="w-full h-full object-cover" />
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <h3 className="font-semibold text-foreground line-clamp-2 leading-snug">{item.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1">{item.snippet}</p>
                <div className="text-xs text-muted-foreground/80">
                  {item.publisher} · {item.createdAtLabel}
                </div>
              </div>
            </button>
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
