import { redirect } from 'next/navigation'

interface AdminHRRatesPageProps {
  params: Promise<{ locale: string }>
}

export default async function AdminHRRatesPage({ params }: AdminHRRatesPageProps) {
  const { locale } = await params
  redirect(`/${locale}/dashboard/rates`)
}
