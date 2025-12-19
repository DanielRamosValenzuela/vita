interface ContactPageProps {
  params: Promise<{ locale: string }>
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold">Hola mundo - Contacto</h1>
      <p className="mt-4 text-muted-foreground">Locale: {locale}</p>
    </div>
  )
}

