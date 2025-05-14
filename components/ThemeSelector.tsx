import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export interface Theme {
  name: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  textColor: string
  contrastTextColor: string
  gridPattern: string
}

// Simplified to just one theme to match the exact reference image
const themes: Theme[] = [
  {
    name: 'Nintendo DS',
    primaryColor: 'bg-[#0F2F2F]',
    secondaryColor: 'bg-[#0F2F2F]',
    accentColor: 'bg-[#18BFBF]',
    textColor: 'text-[#00FFFF]',
    contrastTextColor: 'text-[#0F2F2F]',
    gridPattern: 'bg-ds-grid'
  }
]

interface ThemeSelectorProps {
  onThemeChange: (theme: Theme) => void
}

export default function ThemeSelector({ onThemeChange }: ThemeSelectorProps) {
  const [selectedTheme] = useState<Theme>(themes[0])
  return null // Hide theme selector since we're matching exact reference
}

