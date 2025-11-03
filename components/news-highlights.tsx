"use client"

import Link from "next/link"
import type { NewsItem } from "@/lib/mock-data"

interface NewsHighlightsProps {
  items: NewsItem[]
}

export function NewsHighlights({ items }: NewsHighlightsProps) {
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

      <div className="space-y-2">
        {items.slice(0, 4).map((item) => (
          <button
            key={item.id}
            onClick={() => handleNewsClick(item.url)}
            className="w-full flex gap-4 items-start px-4 py-3 rounded-lg hover:bg-muted transition-colors text-left"
            aria-label={`${item.title} - 외부 링크로 이동`}
          >
            <div className="flex-shrink-0 w-24 h-16 rounded bg-muted overflow-hidden">
              {item.thumbnail ? (
                <img src={item.thumbnail || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground/50 text-xs">
                  No Image
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <h3 className="font-semibold text-foreground line-clamp-2 leading-snug">{item.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-1">{item.snippet}</p>
              <div className="text-xs text-muted-foreground/80">
                {item.source} · {item.date}
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
