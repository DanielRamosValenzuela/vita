/* eslint-disable react/jsx-no-literals -- Página en construcción (placeholder). */

interface SupportPageProps {
  params: Promise<{ locale: string }>
}

export default async function SupportPage({ params }: SupportPageProps) {
  const { locale } = await params

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold">Hola mundo - Soporte</h1>
      <p className="text-muted-foreground mt-4">Locale: {locale}</p>
    </div>
  )
}
