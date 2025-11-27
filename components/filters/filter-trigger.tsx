"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

type FilterTriggerProps<T extends string | number> = {
  label: string
  value?: T | null
  onChange: (v: T | null) => void
  options: { label: string; value: T }[]
}

export function FilterTrigger<T extends string | number>({ label, value, onChange, options }: FilterTriggerProps<T>) {
  const [open, setOpen] = useState(false)

  const selectedOption = options.find((opt) => opt.value === value)
  const displayText = selectedOption ? `${label}: ${selectedOption.label}` : label

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="h-9 text-sm gap-1.5 bg-zinc-100/80 hover:bg-zinc-200/80 text-zinc-900">
          {displayText}
          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-2" align="start">
        <div className="flex flex-col gap-0.5">
          <button
            type="button"
            onClick={() => {
              onChange(null)
              setOpen(false)
            }}
            className={cn(
              "flex items-center justify-between rounded-sm px-3 py-2 text-sm hover:bg-accent transition-colors",
              !value && "bg-accent",
            )}
          >
            <span>전체</span>
            {!value && <Check className="h-4 w-4" />}
          </button>

          {options.map((option) => (
            <button
              key={String(option.value)}
              type="button"
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
              className={cn(
                "flex items-center justify-between rounded-sm px-3 py-2 text-sm hover:bg-accent transition-colors",
                value === option.value && "bg-accent",
              )}
            >
              <span>{option.label}</span>
              {value === option.value && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
