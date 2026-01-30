'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { Check, Edit, Palette, Plus, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/src/shared/ui/badge'
import { Button } from '@/src/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/shared/ui/dialog'
import { Input } from '@/src/shared/ui/input'
import { Label } from '@/src/shared/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/shared/ui/table'

import {
  createShiftTypeAction,
  deleteShiftTypeAction,
  updateShiftTypeAction,
} from '../api/shift-type-actions'

interface ShiftType {
  id: string
  name: string
  description?: string
  color: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  _count?: {
    shifts: number
  }
}

interface ShiftTypesPageProps {
  shiftTypes: ShiftType[]
}

export function ShiftTypesPage({ shiftTypes }: ShiftTypesPageProps) {
  const t = useTranslations('shifts.shiftTypes')
  const [isPending, startTransition] = useTransition()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingShiftType, setEditingShiftType] = useState<ShiftType | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ShiftType | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
    isActive: true,
  })

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#3b82f6',
      isActive: true,
    })
    setEditingShiftType(null)
  }

  const handleCreate = () => {
    resetForm()
    setIsCreateDialogOpen(true)
  }

  const handleEdit = (shiftType: ShiftType) => {
    setFormData({
      name: shiftType.name,
      description: shiftType.description || '',
      color: shiftType.color,
      isActive: shiftType.isActive,
    })
    setEditingShiftType(shiftType)
  }

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error(t('form.nameRequired'))
      return
    }

    startTransition(async () => {
      let result
      if (editingShiftType) result = await updateShiftTypeAction(editingShiftType.id, formData)
      else result = await createShiftTypeAction(formData)

      if (result.success) {
        toast.success(editingShiftType ? t('toast.updated') : t('toast.created'))
        setIsCreateDialogOpen(false)
        resetForm()
        window.location.reload()
      } else toast.error(result.error || t('toast.error'))
    })
  }

  const handleDelete = (shiftType: ShiftType) => {
    setDeleteTarget(shiftType)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (!deleteTarget) return

    startTransition(async () => {
      const result = await deleteShiftTypeAction(deleteTarget.id)

      if (result.success) {
        toast.success(t('toast.deleted'))
        setDeleteDialogOpen(false)
        setDeleteTarget(null)
        window.location.reload()
      } else toast.error(result.error || t('toast.error'))
    })
  }

  const getStatusBadge = (isActive: boolean) => (
    <Badge variant={isActive ? 'default' : 'secondary'}>
      {isActive ? t('active') : t('inactive')}
    </Badge>
  )

  const predefinedColors = [
    '#3b82f6', 
    '#10b981', 
    '#f59e0b', 
    '#ef4444', 
    '#8b5cf6', 
    '#ec4899', 
    '#6b7280', 
    '#14b8a6', 
    '#f97316', 
  ]

  return (
    <section className="space-y-6" aria-labelledby="shift-types-heading">
      <header className="flex items-center justify-between">
        <div>
          <h2 id="shift-types-heading" className="text-2xl font-bold">{t('title')}</h2>
          <p className="text-muted-foreground mt-1">{t('description')}</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t('create')}
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{t('list')}</CardTitle>
        </CardHeader>
        <CardContent>
          {shiftTypes.length === 0 ? (
            <section className="text-center py-8" aria-labelledby="shift-types-empty-heading">
              <Palette className="mx-auto h-12 w-12 text-muted-foreground mb-4" aria-hidden />
              <h3 id="shift-types-empty-heading" className="text-lg font-medium">{t('empty.title')}</h3>
              <p className="text-muted-foreground mt-2">{t('empty.description')}</p>
              <Button onClick={handleCreate} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                {t('create')}
              </Button>
            </section>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.name')}</TableHead>
                  <TableHead>{t('table.color')}</TableHead>
                  <TableHead>{t('table.description')}</TableHead>
                  <TableHead>{t('table.status')}</TableHead>
                  <TableHead>{t('table.shiftsCount')}</TableHead>
                  <TableHead>{t('table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shiftTypes.map((shiftType) => (
                  <TableRow key={shiftType.id}>
                    <TableCell className="font-medium">{shiftType.name}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-full border shrink-0"
                          style={{ backgroundColor: shiftType.color }}
                          aria-hidden
                        />
                        <span className="text-xs text-muted-foreground">{shiftType.color}</span>
                      </span>
                    </TableCell>
                    <TableCell>{shiftType.description || '-'}</TableCell>
                    <TableCell>{getStatusBadge(shiftType.isActive)}</TableCell>
                    <TableCell>
                      <span className="text-sm">{shiftType._count?.shifts || 0}</span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(shiftType)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(shiftType)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={isCreateDialogOpen || editingShiftType !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false)
            resetForm()
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingShiftType ? t('edit.title') : t('createModal.title')}
            </DialogTitle>
            <DialogDescription>
              {editingShiftType ? t('edit.description') : t('createModal.description')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{t('form.name')}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('form.namePlaceholder')}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="color">{t('form.color')}</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="h-10 w-20"
                />
                <div className="flex gap-1">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className="w-6 h-6 rounded-full border-2 border-transparent hover:border-gray-300"
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">{t('form.description')}</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('form.descriptionPlaceholder')}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive || false}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isActive">{t('form.active')}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false)
                resetForm()
              }}
            >
              {t('form.cancel')}
            </Button>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? t('form.saving') : t('form.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteDialogOpen(false)
            setDeleteTarget(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('delete.title')}</DialogTitle>
            <DialogDescription>{t('delete.description')}</DialogDescription>
          </DialogHeader>
          {deleteTarget && (
            <div className="py-4">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div
                  className="w-6 h-6 rounded-full border"
                  style={{ backgroundColor: deleteTarget.color }}
                />
                <div>
                  <div className="font-medium">{deleteTarget.name}</div>
                  {deleteTarget.description && (
                    <div className="text-sm text-muted-foreground">
                      {deleteTarget.description}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {t('delete.shiftsCount', { count: deleteTarget._count?.shifts ?? 0 })}
                  </div>
                </div>
              </div>
              {(deleteTarget._count?.shifts ?? 0) === 0 && (
                <div className="text-sm text-primary">
                  <Check className="inline-block mr-1 h-4 w-4" />
                  {t('delete.noShiftsWarning')}
                </div>
              )}
              {(deleteTarget._count?.shifts ?? 0) > 0 && (
                <div className="text-sm text-muted-foreground">
                  <X className="inline-block mr-1 h-4 w-4" />
                  {t('delete.hasShiftsWarning')}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setDeleteTarget(null)
              }}
            >
              {t('delete.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={
                isPending ||
                Boolean(deleteTarget && (deleteTarget._count?.shifts ?? 0) > 0)
              }
            >
              {isPending ? t('delete.deleting') : t('delete.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
