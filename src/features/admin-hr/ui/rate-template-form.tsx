'use client'

import { useState, useTransition, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Plus, Info } from 'lucide-react'
import { toast } from 'sonner'
import type { Currency } from '@prisma/client'

import { Button } from '@/src/shared/ui/button'
import { Input } from '@/src/shared/ui/input'
import { Label } from '@/src/shared/ui/label'
import { Textarea } from '@/src/shared/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/src/shared/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/src/shared/ui/tooltip'

import { COMPONENT_TYPES, COMPONENT_UNITS, APPLY_CONDITIONS } from '@/src/shared/lib/constants'
import { RateComponentForm } from './rate-component-form'
import { createRateTemplateAction, updateRateTemplateAction } from '../api/rate-template-actions'
import type { RateComponentData, RateTemplateWithComponents } from '../api/rate-template-actions'
import { getShiftTypesAction } from '@/src/features/shifts/api/shift-type-actions'

interface ShiftTypeOption {
  id: string
  name: string
  color: string
  icon?: string | null
}

interface RateTemplateFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currency: Currency
  existingTemplate?: RateTemplateWithComponents
  mode: 'create' | 'edit'
}

export function RateTemplateForm({
  open,
  onOpenChange,
  currency,
  existingTemplate,
  mode,
}: RateTemplateFormProps) {
  const t = useTranslations('adminHR.rates.templateForm')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [shiftTypes, setShiftTypes] = useState<ShiftTypeOption[]>([])
  const [isLoadingShiftTypes, setIsLoadingShiftTypes] = useState(false)

  const [name, setName] = useState(existingTemplate?.name || '')
  const [description, setDescription] = useState(existingTemplate?.description || '')
  const [components, setComponents] = useState<RateComponentData[]>(
    existingTemplate?.components?.map((comp) => ({
      ...comp,
      applicableShiftTypeIds:
        'applicableShiftTypes' in comp
          ? (comp.applicableShiftTypes as Array<{ shiftTypeId: string }>)?.map(
              (ast) => ast.shiftTypeId
            ) || []
          : [],
    })) || []
  )

  useEffect(() => {
    if (mode === 'edit' && existingTemplate) {
      setName(existingTemplate.name || '')
      setDescription(existingTemplate.description || '')
      setComponents(
        existingTemplate.components?.map((comp) => ({
          ...comp,
          applicableShiftTypeIds:
            'applicableShiftTypes' in comp
              ? (comp.applicableShiftTypes as Array<{ shiftTypeId: string }>)?.map(
                  (ast) => ast.shiftTypeId
                ) || []
              : [],
        })) || []
      )
    }
  }, [mode, existingTemplate, open])

  useEffect(() => {
    if (open) {
      setIsLoadingShiftTypes(true)
      getShiftTypesAction()
        .then((result) => {
          if (result.success && result.data)
            setShiftTypes(
              result.data.map((st) => ({
                id: st.id,
                name: st.name,
                color: st.color,
                icon: st.icon,
              }))
            )
          else toast.error(result.error || 'Error al cargar tipos de turno')
        })
        .finally(() => setIsLoadingShiftTypes(false))
    }
  }, [open])

  function handleAddComponent() {
    setComponents([
      ...components,
      {
        type: COMPONENT_TYPES.BASE_SALARY,
        value: 0,
        unit: COMPONENT_UNITS.MONTHLY,
        applyCondition: APPLY_CONDITIONS.ALWAYS,
        order: components.length,
      },
    ])
  }

  function handleUpdateComponent(index: number, data: Partial<RateComponentData>) {
    const newComponents = [...components]
    newComponents[index] = { ...newComponents[index], ...data }
    setComponents(newComponents)
  }

  function handleRemoveComponent(index: number) {
    setComponents(components.filter((_, i) => i !== index))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!name.trim()) {
      toast.error(t('errors.nameRequired'))
      return
    }

    if (components.length === 0) {
      toast.error(t('errors.componentsRequired'))
      return
    }

    startTransition(async () => {
      const result =
        mode === 'create'
          ? await createRateTemplateAction({
              name: name.trim(),
              description: description.trim() || undefined,
              components,
            })
          : await updateRateTemplateAction(existingTemplate!.id, {
              name: name.trim(),
              description: description.trim() || undefined,
              components,
            })

      if (result.success) {
        toast.success(result.message)
        onOpenChange(false)
        router.refresh()
      } else
        toast.error(result.error)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            {mode === 'create' ? t('createTitle') : t('editTitle')}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {mode === 'create' ? t('createDescription') : t('editDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <Label htmlFor="name">{t('name')}</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>{t('nameTooltip')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('namePlaceholder')}
                required
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <Label htmlFor="description">{t('description')}</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>{t('descriptionTooltip')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('descriptionPlaceholder')}
                rows={2}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Label className="text-base">{t('components.title')}</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p>{t('componentsTooltip')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddComponent}
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('components.add')}
              </Button>
            </div>

            {isLoadingShiftTypes ? (
              <div className="text-center py-12 px-4 border-2 border-dashed rounded-lg bg-muted/30">
                <p className="text-muted-foreground">{t('loadingShiftTypes')}</p>
              </div>
            ) : components.length === 0 ? (
              <div className="text-center py-12 px-4 border-2 border-dashed rounded-lg bg-muted/30">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="text-muted-foreground">
                    <p className="font-medium text-foreground mb-2">{t('components.emptyTitle')}</p>
                    <p className="text-sm">{t('components.emptyDescription')}</p>
                  </div>
                  <Button
                    type="button"
                    variant="default"
                    size="lg"
                    onClick={handleAddComponent}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    {t('components.addFirst')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {components.map((component, index) => (
                  <RateComponentForm
                    key={index}
                    component={component}
                    index={index}
                    currency={currency}
                    shiftTypes={shiftTypes}
                    onUpdate={handleUpdateComponent}
                    onRemove={handleRemoveComponent}
                    canRemove={components.length > 1}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isPending || components.length === 0} className="w-full sm:w-auto">
              {isPending ? t('saving') : t('save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
