'use client'

import { useTranslations } from 'next-intl'
import { Palette } from 'lucide-react'

import { useCustomTheme } from '@/src/shared/lib/providers/custom-theme-provider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/shared/ui/select'

export function ThemeSelector() {
  const t = useTranslations('common')
  const { currentTheme, themes, setTheme } = useCustomTheme()

  return (
    <Select value={currentTheme?.id || 'default'} onValueChange={setTheme}>
      <SelectTrigger className="w-auto min-w-[120px]">
        <Palette className="mr-2 h-4 w-4 shrink-0" />
        <SelectValue placeholder={t('theme')} />
      </SelectTrigger>
      <SelectContent>
        {themes.map((theme) => (
          <SelectItem key={theme.id} value={theme.id}>
            {theme.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
