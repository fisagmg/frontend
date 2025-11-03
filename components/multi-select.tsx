"use client"

import * as React from "react"
import { Check, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface MultiSelectProps {
  options: { label: string; value: string }[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  label?: string
  id?: string
}

export function MultiSelect({ options, selected, onChange, placeholder = "선택...", label, id }: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (value: string) => {
    const newSelected = selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]
    onChange(newSelected)
  }

  const handleRemove = (value: string) => {
    onChange(selected.filter((item) => item !== value))
  }

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-controls={`${id}-list`}
            className="w-full justify-between h-auto min-h-9 bg-transparent"
          >
            <div className="flex flex-wrap gap-1">
              {selected.length > 0 ? (
                selected.map((value) => {
                  const option = options.find((opt) => opt.value === value)
                  return (
                    <Badge
                      key={value}
                      variant="secondary"
                      className="mr-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemove(value)
                      }}
                    >
                      {option?.label}
                      <X className="ml-1 h-3 w-3" />
                    </Badge>
                  )
                })
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <Command>
            <CommandInput placeholder="검색..." />
            <CommandList id={`${id}-list`}>
              <CommandEmpty>결과 없음</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem key={option.value} value={option.value} onSelect={() => handleSelect(option.value)}>
                    <Check
                      className={cn("mr-2 h-4 w-4", selected.includes(option.value) ? "opacity-100" : "opacity-0")}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
