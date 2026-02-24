'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { Loader2, Plus, UserMinus } from 'lucide-react'
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
import { Popover, PopoverContent, PopoverTrigger } from '@/src/shared/ui/popover'
import { Skeleton } from '@/src/shared/ui/skeleton'

import {
  addMemberAction,
  getAvailableStaffAction,
  removeMemberAction,
} from '../api/group-actions'
import type { AvailableStaffMember } from '../api/group-actions'
import type { RotationWithRelations } from '../types/rotation-types'

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

  const handleOpen = async (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) return

    setLoadingStaff(true)
    const result = await getAvailableStaffAction(rotationId)
    setLoadingStaff(false)

    if (result.success && result.data)
      setStaff(result.data)
    else
      toast.error(result.error ?? t('loadError'))
  }

  const handleAdd = (userId: string) => {
    startTransition(async () => {
      const result = await addMemberAction({ rotationGroupId: groupId, userId })

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
      <PopoverContent className="w-64 p-2" align="start">
        {loadingStaff ? (
          <div className="space-y-2 p-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : staff.length === 0 ? (
          <p className="text-muted-foreground p-2 text-sm">{t('groups.noAvailableUsers')}</p>
        ) : (
          <ul role="listbox" aria-label={t('groups.selectUser')} className="space-y-1">
            {staff.map((member) => (
              <li key={member.id}>
                <button
                  type="button"
                  className="hover:bg-accent focus-visible:ring-ring flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50"
                  disabled={isPending}
                  onClick={() => handleAdd(member.id)}
                >
                  <Avatar size="sm">
                    <AvatarFallback>{member.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{member.name}</p>
                    <p className="text-muted-foreground truncate text-xs">{member.email}</p>
                  </div>
                  {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
                </button>
              </li>
            ))}
          </ul>
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
          <Card key={group.id} className="border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">{group.name}</CardTitle>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {t('groups.offset', { days: group.cycleOffset })}
                  </p>
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
