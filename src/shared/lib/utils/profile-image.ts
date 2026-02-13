import type { ImageProvider } from '@prisma/client'

export interface UserImageData {
  image?: string | null
  customImage?: string | null
  imageProvider?: ImageProvider | null
  name: string
}

export function getProfileImageUrl(user: UserImageData): string | null {
  if (user.customImage) return user.customImage

  if (user.image) return user.image

  return null
}

export function getProfileImageSource(user: UserImageData): ImageProvider | 'INITIALS' {
  if (user.customImage) return 'UPLOAD'

  if (user.image) return user.imageProvider || 'OAUTH'

  return 'INITIALS'
}

export function getUserInitials(name: string): string {
  const parts = name.trim().split(' ')

  if (parts.length === 0) return '??'

  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function buildAvatarUrl(user: UserImageData): {
  url: string | null
  fallback: string
  source: ImageProvider | 'INITIALS'
} {
  const url = getProfileImageUrl(user)
  const source = getProfileImageSource(user)
  const fallback = getUserInitials(user.name)

  return {
    url,
    fallback,
    source,
  }
}
