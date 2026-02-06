'use client'

import { useState, useRef, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { Camera, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

import { Button } from '@/src/shared/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/src/shared/ui/avatar'
import { getUserInitials } from '@/src/shared/lib/utils/profile-image'

import { uploadAvatarAction, deleteAvatarAction } from '../api/profile-image-actions'

interface AvatarUploadFormProps {
  currentImage?: string | null
  customImage?: string | null
  userName: string
}

export function AvatarUploadForm({ currentImage, customImage, userName }: AvatarUploadFormProps) {
  const t = useTranslations('profile')
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const displayImage = previewUrl || customImage || currentImage
  const initials = getUserInitials(userName)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar 5MB')
      return
    }

    if (!file.type.startsWith('image/')) {
      toast.error('El archivo debe ser una imagen')
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
        toast.success(result.message || 'Avatar actualizado')
        setPreviewUrl(null)
        router.refresh()
      } else {
        toast.error(result.error || 'Error al subir el avatar')
        setPreviewUrl(null)
      }
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteAvatarAction()

      if (result.success) {
        toast.success(result.message || 'Avatar eliminado')
        setPreviewUrl(null)
        router.refresh()
      } else 
        toast.error(result.error || 'Error al eliminar el avatar')
      
    })
  }

  return (
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
          {customImage ? t('changeAvatar') : t('uploadAvatar')}
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
            {t('deleteAvatar')}
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

      <p className="text-muted-foreground text-center text-xs">
        {t('avatarHelp')}
      </p>
    </div>
  )
}
