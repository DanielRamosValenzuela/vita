'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { format } from 'date-fns'
import { enUS, es } from 'date-fns/locale'
import { Loader2, Trash2 } from 'lucide-react'

import { Button } from '@/src/shared/ui/button'
import { Textarea } from '@/src/shared/ui/textarea'

const MAX_LENGTH = 500

interface NotePopoverContentProps {
  date: Date
  existingNote: { id: string; content: string } | null
  onSave: (content: string) => void
  onDelete: (noteId: string) => void
  isSaving: boolean
}

export function NotePopoverContent({
  date,
  existingNote,
  onSave,
  onDelete,
  isSaving,
}: NotePopoverContentProps) {
  const t = useTranslations('staffDashboard.notes')
  const locale = useLocale()
  const dateLocale = locale === 'es' ? es : enUS

  const [content, setContent] = useState(existingNote?.content ?? '')

  const formattedDate = format(date, 'EEEE d MMMM', { locale: dateLocale })
  const displayDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)

  const canSave = content.trim().length > 0 && content !== (existingNote?.content ?? '')

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium">{displayDate}</p>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={t('placeholder')}
        maxLength={MAX_LENGTH}
        rows={3}
        className="min-h-[72px] resize-none text-sm"
        disabled={isSaving}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {content.length}/{MAX_LENGTH}
        </span>
        <div className="flex items-center gap-2">
          {existingNote && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(existingNote.id)}
              disabled={isSaving}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              {t('delete')}
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => onSave(content.trim())}
            disabled={!canSave || isSaving}
          >
            {isSaving && <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />}
            {isSaving ? t('saving') : t('save')}
          </Button>
        </div>
      </div>
    </div>
  )
}
