"use client"

import * as React from "react"
import { Moon, Sun } from 'lucide-react'
import { useTheme } from "next-themes"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Button } from "@/components/ui/button"

const COLOR_SCHEMES = [
  { name: "light", label: "Light" },
  { name: "dark", label: "Dark" },
  { name: "system", label: "System" },
  { name: "retro", label: "Retro" },
  { name: "modern", label: "Modern" }
] as const

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Select value={theme} onValueChange={setTheme}>
      <SelectTrigger className="w-[120px] bg-[rgba(24,191,191,0.1)] border-[#18BFBF] text-[#00FFFF]">
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <SelectValue placeholder="Theme" />
      </SelectTrigger>
      <SelectContent className="bg-[#0F2F2F] border-[#18BFBF]">
        {COLOR_SCHEMES.map((scheme) => (
          <SelectItem 
            key={scheme.name} 
            value={scheme.name}
            className="text-[#00FFFF] hover:bg-[rgba(24,191,191,0.1)] focus:bg-[rgba(24,191,191,0.1)]"
          >
            {scheme.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
