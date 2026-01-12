import { getCurrentUser } from '@/src/shared/lib/auth/session'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import {
  ProfileForm,
  ChangePasswordForm,
  DocumentForm,
  InvitationsSection,
  OrganizationsSection,
} from '@/src/features/profile/ui'
import type { Country } from '@prisma/client'

interface ProfilePageProps {
  params: Promise<{ locale: string }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { locale } = await params
  const user = await getCurrentUser()
  const t = await getTranslations('profile')

  if (!user) {
    redirect(`/${locale}/login`)
  }

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <ProfileForm
        initialData={{
          name: user.name || '',
          email: user.email || '',
        }}
      />

      <ChangePasswordForm />

      <InvitationsSection />

      <OrganizationsSection />

      {(!user.docNumber || !user.country) && (
        <DocumentForm
          initialData={{
            country: (user.country as Country) || null,
            docNumber: user.docNumber || null,
          }}
        />
      )}
    </div>
  )
}
