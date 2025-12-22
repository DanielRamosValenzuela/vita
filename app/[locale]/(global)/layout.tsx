import { MainNavbar, Footer } from '@/src/widgets'

interface GlobalLayoutProps {
  children: React.ReactNode
}

export default function GlobalLayout({ children }: GlobalLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <MainNavbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

