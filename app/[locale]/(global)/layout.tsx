import { Footer } from '@/src/widgets/footer'
import { MainNavbar } from '@/src/widgets/main-navbar'

interface GlobalLayoutProps {
  children: React.ReactNode
}

export default function GlobalLayout({ children }: GlobalLayoutProps) {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <MainNavbar />
      <main id="main-content" className="bg-background flex-1">{children}</main>
      <Footer />
    </div>
  )
}
