'use client'

import { useSession, signIn, signOut } from 'next-auth/react'

export default function TestAuthPage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Cargando...</p>
      </div>
    )
  }

  if (session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">✅ Autenticado</h1>
        <div className="rounded-lg border p-6">
          <p>
            <strong>Email:</strong> {session.user.email}
          </p>
          <p>
            <strong>Nombre:</strong> {session.user.name}
          </p>
          <p>
            <strong>ID:</strong> {session.user.id}
          </p>
          <p>
            <strong>Rol:</strong> {session.user.role}
          </p>
        </div>
        <button
          onClick={() => signOut()}
          className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600"
        >
          Cerrar Sesión
        </button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">🔒 No autenticado</h1>
      <button
        onClick={() => signIn('google')}
        className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        Iniciar Sesión con Google
      </button>
    </div>
  )
}

