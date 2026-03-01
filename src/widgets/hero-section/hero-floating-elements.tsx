'use client'

export function HeroFloatingElements() {
  return (
    <>
      <div className="animate-hero-float pointer-events-none absolute top-20 left-[10%] z-0 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
      <div className="animate-hero-float-delay-1 pointer-events-none absolute right-[5%] bottom-20 z-0 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
      <div className="animate-hero-float-slow pointer-events-none absolute top-1/2 left-1/3 z-0 h-64 w-64 rounded-full bg-white/[0.03] blur-3xl" />
      <div className="animate-hero-float-delay-2 pointer-events-none absolute top-10 right-1/4 z-0 h-48 w-48 rounded-full bg-white/[0.04] blur-3xl" />

      <div className="animate-hero-gradient-rotate pointer-events-none absolute top-1/2 left-1/2 z-0 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[conic-gradient(from_0deg,transparent,rgba(255,255,255,0.03),transparent,rgba(255,255,255,0.03),transparent)] opacity-50" />

      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.05),transparent_50%)]" />
    </>
  )
}
