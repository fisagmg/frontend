"use client"
import { FilterTrigger } from "@/components/filters/filter-trigger"
import { MultiFilterTrigger } from "@/components/filters/multi-filter-trigger"

export interface FilterState {
  year: string
  severity: string
  os: string[]
  domain: string[]
}

interface FilterBarProps {
  years: number[]
  onFilterChange: (filters: FilterState) => void
  filters: FilterState
}

const OS_OPTIONS = [
  { label: "Windows", value: "Windows" },
  { label: "Linux", value: "Linux" },
  { label: "macOS", value: "macOS" },
  { label: "iOS", value: "iOS" },
  { label: "Android", value: "Android" },
  { label: "Other", value: "Other" },
]

const DOMAIN_OPTIONS = [
  { label: "Network", value: "Network" },
  { label: "Web Application", value: "Web Application" },
  { label: "Database", value: "Database" },
  { label: "OS/Kernel", value: "OS/Kernel" },
  { label: "Application", value: "Application" },
  { label: "Cloud", value: "Cloud" },
  { label: "Container", value: "Container" },
  { label: "Authentication", value: "Authentication" },
  { label: "Cryptography", value: "Cryptography" },
  { label: "IoT/Device", value: "IoT/Device" },
]

const SEVERITY_OPTIONS = [
  { label: "Critical", value: "Critical" },
  { label: "High", value: "High" },
  { label: "Medium", value: "Medium" },
  { label: "Low", value: "Low" },
]

export function FilterBar({ years, onFilterChange, filters }: FilterBarProps) {
  const yearOptions = years.map((year) => ({
    label: String(year),
    value: String(year),
  }))

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <FilterTrigger
        label="년도"
        value={filters.year || null}
        onChange={(value) => onFilterChange({ ...filters, year: value || "" })}
        options={yearOptions}
      />

      <FilterTrigger
        label="중요도"
        value={filters.severity || null}
        onChange={(value) => onFilterChange({ ...filters, severity: value || "" })}
        options={SEVERITY_OPTIONS}
      />

      <MultiFilterTrigger
        label="OS"
        selected={filters.os}
        onChange={(os) => onFilterChange({ ...filters, os })}
        options={OS_OPTIONS}
      />

      <MultiFilterTrigger
        label="도메인"
        selected={filters.domain}
        onChange={(domain) => onFilterChange({ ...filters, domain })}
        options={DOMAIN_OPTIONS}
      />
    </div>
  )
}
