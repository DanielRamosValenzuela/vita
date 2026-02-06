import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import type { Country } from '@prisma/client'

import { getCurrentUser } from '@/src/shared/lib/auth/session'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card'
import {
  ChangePasswordForm,
  DocumentSection,
  InvitationsSection,
  OrganizationsSection,
  ProfileForm,
} from '@/src/features/profile/ui'
import { AvatarUploadForm } from '@/src/features/profile/ui/avatar-upload-form'
import { EmailsManagementSection } from '@/src/features/profile/ui/emails-management-section'

interface ProfilePageProps {
  params: Promise<{ locale: string }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { locale } = await params
  const user = await getCurrentUser()
  const t = await getTranslations('profile')

  if (!user)
    redirect(`/${locale}/login`)

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('avatarTitle')}</CardTitle>
          <CardDescription>{t('avatarDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <AvatarUploadForm
            currentImage={user.image}
            customImage={user.customImage}
            userName={user.name}
          />
        </CardContent>
      </Card>

      <ProfileForm
        initialData={{
          name: user.name || '',
          email: user.email || '',
        }}
      />

      <ChangePasswordForm />

      <EmailsManagementSection />

      <InvitationsSection />

      <OrganizationsSection />

      <DocumentSection
        user={
          user.country && user.docNumber
            ? { country: user.country as Country, docNumber: user.docNumber }
            : null
        }
      />
    </div>
  )
}
