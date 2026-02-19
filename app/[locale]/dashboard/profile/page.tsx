import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import type { Country } from '@prisma/client'

import { getCurrentUser } from '@/src/shared/lib/auth/session'
import { prisma } from '@/src/shared/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card'
import {
  ChangePasswordForm,
  DocumentSection,
  InvitationsSection,
  OrganizationsSection,
} from '@/src/features/profile/ui'
import { AvatarUploadForm } from '@/src/features/profile/ui/avatar-upload-form'
import { EmailsManagementSection } from '@/src/features/profile/ui/emails-management-section'
import { PersonalInfoForm } from '@/src/features/profile/ui/personal-info-form'

interface ProfilePageProps {
  params: Promise<{ locale: string }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const [{ locale }, user, t] = await Promise.all([
    params,
    getCurrentUser(),
    getTranslations('profile'),
  ])

  if (!user) redirect(`/${locale}/login`)

  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      name: true,
      phone: true,
      address: true,
      additionalInfo: true,
      birthDate: true,
      country: true,
      docNumber: true,
      image: true,
      customImage: true,
    },
  })

  if (!userData) redirect(`/${locale}/login`)

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
            currentImage={userData.image}
            customImage={userData.customImage}
            userName={userData.name}
          />
        </CardContent>
      </Card>

      <PersonalInfoForm
        initialData={{
          name: userData.name,
          phone: userData.phone,
          address: userData.address,
          additionalInfo: userData.additionalInfo,
          birthDate: userData.birthDate,
        }}
      />

      <ChangePasswordForm />

      <Suspense>
        <EmailsManagementSection />
      </Suspense>

      <InvitationsSection />

      <OrganizationsSection />

      <DocumentSection
        user={
          userData.country && userData.docNumber
            ? { country: userData.country as Country, docNumber: userData.docNumber }
            : null
        }
      />
    </div>
  )
}
