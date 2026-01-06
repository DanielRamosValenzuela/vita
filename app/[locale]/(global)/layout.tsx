import { MainNavbar } from '@/src/widgets/main-navbar'
import { Footer } from '@/src/widgets/footer'

interface GlobalLayoutProps {
  children: React.ReactNode
}

export default function GlobalLayout({ children }: GlobalLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <MainNavbar />
      <main className="flex-1 bg-background">{children}</main>
      <Footer />
    </div>
  )
}

