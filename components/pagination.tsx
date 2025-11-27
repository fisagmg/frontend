"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="이전 페이지"
        className="h-8 w-8 bg-transparent text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 disabled:opacity-30"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {pages.map((page) => (
        <Button
          key={page}
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(page)}
          className={
            currentPage === page
              ? "h-8 w-8 bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm"
              : "h-8 w-8 bg-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
          }
        >
          {page}
        </Button>
      ))}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="다음 페이지"
        className="h-8 w-8 bg-transparent text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 disabled:opacity-30"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
