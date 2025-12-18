// Root layout: Solo exporta children
// El HTML/body se maneja en app/[locale]/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
