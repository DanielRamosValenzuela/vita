'use client'

import { useCallback, useEffect, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import type { Currency } from '@prisma/client'
import { Info, Plus } from 'lucide-react'
import { toast } from 'sonner'

import { getAreasAction } from '@/src/features/area/api'
import { getShiftTypesAction } from '@/src/features/shifts/api/shift-type-actions'
import { APPLY_CONDITIONS, COMPONENT_TYPES, COMPONENT_UNITS } from '@/src/shared/lib/constants'
import { Button } from '@/src/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/src/shared/ui/dialog'
import { Input } from '@/src/shared/ui/input'
import { Label } from '@/src/shared/ui/label'
import { Textarea } from '@/src/shared/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/src/shared/ui/tooltip'

import {
  createRateTemplateAction,
  updateRateTemplateAction,
  type RateComponentData,
  type RateTemplateWithComponents,
} from '../api/rate-template-actions'
import { RateComponentForm } from './rate-component-form'

export interface ShiftTypeOption {
  id: string
  name: string
  color: string
  icon?: string | null
  isGlobal: boolean
  areas: Array<{ id: string; name: string }>
}

interface RateTemplateFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currency: Currency
  existingTemplate?: RateTemplateWithComponents
  mode: 'create' | 'edit'
}

interface RateTemplateFormState {
  name: string
  description: string
  components: RateComponentData[]
}

const mapTemplateToState = (template?: RateTemplateWithComponents): RateTemplateFormState => ({
  name: template?.name || '',
  description: template?.description || '',
  components:
    template?.components?.map((comp) => ({
      ...comp,
      applicableShiftTypeIds:
        'applicableShiftTypes' in comp
          ? (comp.applicableShiftTypes as Array<{ shiftTypeId: string }>)?.map(
              (ast) => ast.shiftTypeId
            ) || []
          : [],
    })) || [],
})

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
  const [areas, setAreas] = useState<Array<{ id: string; name: string }>>([])
  const [isLoadingShiftTypes, setIsLoadingShiftTypes] = useState(false)
  const [formState, setFormState] = useState<RateTemplateFormState>(() =>
    mapTemplateToState(existingTemplate)
  )

  const { name, description, components } = formState

  const loadShiftTypesAndAreas = useCallback(async () => {
    setIsLoadingShiftTypes(true)
    const [shiftResult, areasResult] = await Promise.all([
      getShiftTypesAction(),
      getAreasAction(),
    ])
    if (shiftResult.success && shiftResult.data)
      setShiftTypes(
        shiftResult.data.map((st) => ({
          id: st.id,
          name: st.name,
          color: st.color,
          icon: st.icon,
          isGlobal: st.isGlobal,
          areas:
            st.areaShiftTypes
              ?.filter((a) => {
                const areaId = a.area?.id ?? a.areaId
                const areaName = a.area?.name ?? ''
                return areaId && areaName
              })
              .map((a) => ({
                id: a.area?.id ?? a.areaId,
                name: a.area?.name ?? '',
              })) ?? [],
        }))
      )
    else toast.error(shiftResult.error || t('loadShiftTypesError'))
    if (areasResult.success && Array.isArray(areasResult.data))
      setAreas(
        (areasResult.data as Array<{ id: string; name: string }>)
          .filter((a) => a.id && a.name)
          .map((a) => ({ id: a.id, name: a.name }))
      )
    setIsLoadingShiftTypes(false)
  }, [t])

  useEffect(() => {
    if (mode === 'edit' && existingTemplate) setFormState(mapTemplateToState(existingTemplate))
  }, [mode, existingTemplate, open])

  useEffect(() => {
    if (open && shiftTypes.length === 0 && !isLoadingShiftTypes) void loadShiftTypesAndAreas()
  }, [open, shiftTypes.length, isLoadingShiftTypes, loadShiftTypesAndAreas])

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (nextOpen && shiftTypes.length === 0 && !isLoadingShiftTypes)
      void loadShiftTypesAndAreas()
    onOpenChange(nextOpen)
  }

  const handleAddComponent = () => {
    setFormState((prev) => ({
      ...prev,
      components: [
        ...prev.components,
        {
          type: COMPONENT_TYPES.BASE_SALARY,
          value: 0,
          unit: COMPONENT_UNITS.MONTHLY,
          applyCondition: APPLY_CONDITIONS.ALWAYS,
          order: prev.components.length,
        },
      ],
    }))
  }

  const handleUpdateComponent = (index: number, data: Partial<RateComponentData>) => {
    setFormState((prev) => {
      const newComponents = [...prev.components]
      newComponents[index] = { ...newComponents[index], ...data }
      return { ...prev, components: newComponents }
    })
  }

  const handleRemoveComponent = (index: number) => {
    setFormState((prev) => ({
      ...prev,
      components: prev.components.filter((_, i) => i !== index),
    }))
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
      } else toast.error(result.error)
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
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
                onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
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
                onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
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
                  <Button type="button" variant="default" size="lg" onClick={handleAddComponent}>
                    <Plus className="h-5 w-5 mr-2" />
                    {t('components.addFirst')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {components.map((component, index) => (
                  <RateComponentForm
                    key={component.id ?? `new-${index}`}
                    component={component}
                    index={index}
                    currency={currency}
                    shiftTypes={shiftTypes}
                    areas={areas}
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
            <Button
              type="submit"
              disabled={isPending || components.length === 0}
              className="w-full sm:w-auto"
            >
              {isPending ? t('saving') : t('save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
