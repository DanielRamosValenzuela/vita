'use client'

import { useMemo, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { Check, Loader2, Plus, Search as SearchIcon, UserMinus } from 'lucide-react'
import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/src/shared/ui/alert-dialog'
import { Avatar, AvatarFallback } from '@/src/shared/ui/avatar'
import { Badge } from '@/src/shared/ui/badge'
import { Button } from '@/src/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/ui/card'
import { IconDisplay } from '@/src/shared/ui/icon-picker'
import { Input } from '@/src/shared/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/src/shared/ui/popover'
import { Skeleton } from '@/src/shared/ui/skeleton'

import {
  addMembersBulkAction,
  getAvailableStaffAction,
  removeMemberAction,
} from '../api/group-actions'
import type { AvailableStaffMember } from '../api/group-actions'
import type { RotationWithRelations } from '../types/rotation-types'

const DEFAULT_GROUP_ICON = 'Users'

interface RotationGroupsSectionProps {
  rotation: RotationWithRelations
  onMemberChanged: () => void
}

interface RemoveMemberState {
  memberId: string
  memberName: string
  groupId: string
  userId: string
}

interface AddMemberPopoverProps {
  groupId: string
  rotationId: string
  onAdded: () => void
}

function AddMemberPopover({ groupId, rotationId, onAdded }: AddMemberPopoverProps) {
  const t = useTranslations('rotations')
  const [open, setOpen] = useState(false)
  const [staff, setStaff] = useState<AvailableStaffMember[]>([])
  const [loadingStaff, setLoadingStaff] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const filteredStaff = useMemo(() => {
    if (!search.trim()) return staff
    const q = search.trim().toLowerCase()
    return staff.filter(
      (m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
    )
  }, [staff, search])

  const handleOpen = async (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      setSearch('')
      setSelectedIds(new Set())
      return
    }

    setLoadingStaff(true)
    const result = await getAvailableStaffAction(rotationId)
    setLoadingStaff(false)

    if (result.success && result.data)
      setStaff(result.data)
    else
      toast.error(result.error ?? t('loadError'))
  }

  const toggleMember = (userId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(userId))
        next.delete(userId)
      else
        next.add(userId)
      return next
    })
  }

  const handleConfirm = () => {
    if (selectedIds.size === 0) return

    startTransition(async () => {
      const result = await addMembersBulkAction({
        rotationGroupId: groupId,
        userIds: Array.from(selectedIds),
      })

      if (result.success) {
        toast.success(result.message ?? t('groups.addMember'))
        setOpen(false)
        onAdded()
      } else
        toast.error(result.error ?? t('loadError'))
    })
  }

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="mt-2 w-full">
          <Plus className="mr-1.5 h-3.5 w-3.5" aria-hidden />
          {t('groups.addMember')}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start">
        {loadingStaff ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : staff.length === 0 ? (
          <p className="text-muted-foreground py-4 text-center text-sm">
            {t('groups.noAvailableUsers')}
          </p>
        ) : (
          <div className="space-y-2">
            <div className="relative">
              <SearchIcon
                className="text-muted-foreground pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
                aria-hidden
              />
              <Input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('groups.searchMember')}
                className="h-8 pl-8 text-sm"
              />
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredStaff.length === 0 ? (
                <p className="text-muted-foreground py-3 text-center text-xs">
                  {t('groups.noSearchResults')}
                </p>
              ) : (
                <ul role="listbox" aria-label={t('groups.selectUser')} aria-multiselectable className="space-y-0.5">
                  {filteredStaff.map((member) => {
                    const isSelected = selectedIds.has(member.id)
                    return (
                      <li key={member.id} role="option" aria-selected={isSelected}>
                        <button
                          type="button"
                          className={`focus-visible:ring-ring flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 ${isSelected ? 'bg-accent' : 'hover:bg-accent/50'}`}
                          disabled={isPending}
                          onClick={() => toggleMember(member.id)}
                        >
                          <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/40'}`}>
                            {isSelected && <Check className="h-3 w-3" aria-hidden />}
                          </div>
                          <Avatar size="sm">
                            <AvatarFallback>{member.name.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{member.name}</p>
                            <p className="text-muted-foreground truncate text-xs">{member.email}</p>
                          </div>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
            {selectedIds.size > 0 && (
              <Button
                size="sm"
                className="w-full gap-2"
                onClick={handleConfirm}
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                ) : (
                  <Plus className="h-3.5 w-3.5" aria-hidden />
                )}
                {t('groups.addSelected', { count: selectedIds.size })}
              </Button>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

export function RotationGroupsSection({ rotation, onMemberChanged }: RotationGroupsSectionProps) {
  const t = useTranslations('rotations')
  const [removeState, setRemoveState] = useState<RemoveMemberState | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleRemove = (cancelFutureShifts: boolean) => {
    if (!removeState) return

    startTransition(async () => {
      const result = await removeMemberAction(
        { rotationGroupId: removeState.groupId, userId: removeState.userId },
        cancelFutureShifts
      )

      if (result.success) {
        toast.success(result.message ?? t('groups.removeMember'))
        setRemoveState(null)
        onMemberChanged()
      } else
        toast.error(result.error ?? t('loadError'))
    })
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        {rotation.groups.map((group) => (
          <Card
            key={group.id}
            className="border-border/60 border-l-4"
            style={{ borderLeftColor: group.color }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: group.color + '20' }}
                  >
                    <IconDisplay iconName={group.icon ?? DEFAULT_GROUP_ICON} className="text-foreground" size={16} />
                  </div>
                  <div>
                    <CardTitle className="text-base">{group.name}</CardTitle>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {t('groups.offset', { days: group.cycleOffset })}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="shrink-0">
                  {t('groups.members', { count: group._count.members })}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              {group.members.length === 0 ? (
                <p className="text-muted-foreground py-2 text-sm">{t('groups.noAvailableUsers')}</p>
              ) : (
                <ul className="space-y-1" role="list">
                  {group.members.map((member) => (
                    <li
                      key={member.id}
                      className="flex items-center gap-2 rounded-md px-1 py-1"
                    >
                      <Avatar size="sm">
                        <AvatarFallback>
                          {member.user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{member.user.name}</p>
                        <p className="text-muted-foreground truncate text-xs">
                          {member.user.email}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() =>
                          setRemoveState({
                            memberId: member.id,
                            memberName: member.user.name,
                            groupId: group.id,
                            userId: member.userId,
                          })
                        }
                        aria-label={t('groups.removeMember')}
                      >
                        <UserMinus className="h-3.5 w-3.5" aria-hidden />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
              <AddMemberPopover
                groupId={group.id}
                rotationId={rotation.id}
                onAdded={onMemberChanged}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog
        open={removeState !== null}
        onOpenChange={(open) => {
          if (!open) setRemoveState(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {removeState ? t('groups.removeMemberConfirm', { name: removeState.memberName }) : ''}
            </AlertDialogTitle>
            <AlertDialogDescription>{t('groups.removeMemberDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel disabled={isPending}>{t('form.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleRemove(false)}
              disabled={isPending}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
            >
              {t('groups.removeOnly')}
            </AlertDialogAction>
            <AlertDialogAction
              onClick={() => handleRemove(true)}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('groups.removeCancelShifts')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
