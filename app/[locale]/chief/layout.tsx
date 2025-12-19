interface ChiefLayoutProps {
  children: React.ReactNode
}

export default function ChiefLayout({ children }: ChiefLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-muted/40">
        <div className="p-4">
          <h2 className="text-lg font-semibold">Chief Dashboard</h2>
        </div>
      </aside>
      <main className="flex-1">
        <div className="border-b bg-background p-4">
          <h1 className="text-xl font-bold">Chief Dashboard</h1>
        </div>
        {children}
      </main>
    </div>
  )
}

