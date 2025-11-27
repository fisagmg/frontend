"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

type MultiFilterTriggerProps = {
  label: string
  selected: string[]
  onChange: (values: string[]) => void
  options: { label: string; value: string }[]
}

export function MultiFilterTrigger({ label, selected, onChange, options }: MultiFilterTriggerProps) {
  const [open, setOpen] = useState(false)

  const displayText =
    selected.length > 0
      ? selected.length === 1
        ? `${label}: ${options.find((opt) => opt.value === selected[0])?.label}`
        : `${label}: ${selected.length}개`
      : label

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  const clearAll = () => {
    onChange([])
  }

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
            onClick={clearAll}
            className={cn(
              "flex items-center justify-between rounded-sm px-3 py-2 text-sm hover:bg-accent transition-colors",
              selected.length === 0 && "bg-accent",
            )}
          >
            <span>전체</span>
            {selected.length === 0 && <Check className="h-4 w-4" />}
          </button>

          {options.map((option) => {
            const isSelected = selected.includes(option.value)
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleOption(option.value)}
                className="flex items-center justify-between rounded-sm px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                <span>{option.label}</span>
                {isSelected && <Check className="h-4 w-4" />}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
