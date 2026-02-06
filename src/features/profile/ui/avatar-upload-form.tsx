'use client'

import { useState, useRef, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { useSession } from 'next-auth/react'
import { Camera, Trash2, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

import { Button } from '@/src/shared/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/src/shared/ui/avatar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/src/shared/ui/alert-dialog'
import { getUserInitials } from '@/src/shared/lib/utils/profile-image'

import { uploadAvatarAction, deleteAvatarAction } from '../api/profile-image-actions'

interface AvatarUploadFormProps {
  currentImage?: string | null
  customImage?: string | null
  userName: string
}

interface ErrorDialog {
  isOpen: boolean
  title: string
  message: string
}

export function AvatarUploadForm({ currentImage, customImage, userName }: AvatarUploadFormProps) {
  const t = useTranslations('profile.avatar')
  const router = useRouter()
  const { update } = useSession()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [errorDialog, setErrorDialog] = useState<ErrorDialog>({
    isOpen: false,
    title: '',
    message: '',
  })

  const displayImage = previewUrl || customImage || currentImage
  const initials = getUserInitials(userName)

  const showError = (title: string, message: string) => {
    setErrorDialog({
      isOpen: true,
      title,
      message,
    })
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      showError(t('errors.sizeTooLarge.title'), t('errors.sizeTooLarge.message'))
      event.target.value = ''
      return
    }

    if (!file.type.startsWith('image/')) {
      showError(t('errors.invalidType.title'), t('errors.invalidType.message'))
      event.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)

    const formData = new FormData()
    formData.append('avatar', file)

    startTransition(async () => {
      const result = await uploadAvatarAction(formData)

      if (result.success) {
        toast.success(result.message || t('uploadSuccess'))
        setPreviewUrl(null)
        await update()
        router.refresh()
      } else {
        showError(t('errors.uploadFailed.title'), result.error || t('errors.uploadFailed.message'))
        setPreviewUrl(null)
      }

      if (fileInputRef.current) fileInputRef.current.value = ''
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteAvatarAction()

      if (result.success) {
        toast.success(result.message || t('deleteSuccess'))
        setPreviewUrl(null)
        await update()
        router.refresh()
      } else 
        toast.error(result.error || t('deleteError'))
      
    })
  }

  return (
    <>
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Avatar className="h-32 w-32">
            <AvatarImage src={displayImage || undefined} alt={userName} />
            <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
          </Avatar>

          {isPending && (
            <div className="bg-background/80 absolute inset-0 flex items-center justify-center rounded-full">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending}
          >
            <Camera className="mr-2 h-4 w-4" />
            {customImage ? t('changeButton') : t('uploadButton')}
          </Button>

          {customImage && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t('deleteButton')}
            </Button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isPending}
        />

        <p className="text-muted-foreground text-center text-xs">{t('help')}</p>
      </div>

      <AlertDialog open={errorDialog.isOpen} onOpenChange={(open) => setErrorDialog({ ...errorDialog, isOpen: open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="text-destructive h-5 w-5" />
              <AlertDialogTitle>{errorDialog.title}</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-left">{errorDialog.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setErrorDialog({ ...errorDialog, isOpen: false })}>
              {t('errors.closeButton')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
