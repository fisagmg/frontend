"use client"

import type React from "react"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
}

export function SearchBar({ onSearch, placeholder = "검색...", className }: SearchBarProps) {
  const [query, setQuery] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-300" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={cn(
            "pl-9 !bg-white !border-none shadow-sm !text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-0",
            className
          )}
        />
      </div>
      <Button type="submit" className="h-9 px-4 rounded-md shadow-sm bg-white text-zinc-900 border border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900">검색</Button>
    </form>
  )
}
