'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { registerAction, loginAction } from '@/actions/auth'

export default function TestAuthActionsPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'register' | 'login'>('register')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    fieldErrors?: Record<string, string[]>
  } | null>(null)

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    const formData = new FormData(e.currentTarget)

    try {
      const result = await registerAction(formData)

      if (result.success) {
        setResult({
          success: true,
          message: `✅ Usuario registrado: ${result.data?.name} (${result.data?.email})`,
        })
        if (e.currentTarget) {
          e.currentTarget.reset()
        }
      } else {
        setResult({
          success: false,
          message: result.error || 'Error desconocido',
          fieldErrors: result.fieldErrors,
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const validationResult = await loginAction(formData)

      if (validationResult.success) {
        const signInResult = await signIn('credentials', {
          email,
          password,
          redirect: false,
        })

        if (signInResult?.ok) {
          setResult({
            success: true,
            message: `✅ Login exitoso. Redirigiendo...`,
          })
          setTimeout(() => {
            router.push('/es/test-auth')
            router.refresh()
          }, 1000)
        } else {
          setResult({
            success: false,
            message: signInResult?.error || 'Error al iniciar sesión con NextAuth',
          })
        }
      } else {
        setResult({
          success: false,
          message: validationResult.error || 'Error de validación',
          fieldErrors: validationResult.fieldErrors,
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="w-full max-w-md space-y-6">
        <div className="flex gap-4 border-b pb-4">
          <button
            onClick={() => {
              setMode('register')
              setResult(null)
            }}
            className={`flex-1 rounded-md px-4 py-2 font-medium transition-colors ${
              mode === 'register'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Registro
          </button>
          <button
            onClick={() => {
              setMode('login')
              setResult(null)
            }}
            className={`flex-1 rounded-md px-4 py-2 font-medium transition-colors ${
              mode === 'login'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Login
          </button>
        </div>

        {mode === 'register' ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Juan Pérez"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="juan@example.com"
              />
              {result?.fieldErrors?.email && (
                <p className="mt-1 text-sm text-red-600">{result.fieldErrors.email[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="rut" className="block text-sm font-medium text-gray-700">
                RUT
              </label>
              <input
                type="text"
                id="rut"
                name="rut"
                required
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="12.345.678-9"
              />
              {result?.fieldErrors?.rut && (
                <p className="mt-1 text-sm text-red-600">{result.fieldErrors.rut[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número"
              />
              {result?.fieldErrors?.password && (
                <p className="mt-1 text-sm text-red-600">{result.fieldErrors.password[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar Contraseña
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                required
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              />
              {result?.fieldErrors?.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{result.fieldErrors.confirmPassword[0]}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading ? 'Registrando...' : 'Registrar'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="login-email"
                name="email"
                required
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="juan@example.com"
              />
              {result?.fieldErrors?.email && (
                <p className="mt-1 text-sm text-red-600">{result.fieldErrors.email[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                type="password"
                id="login-password"
                name="password"
                required
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              />
              {result?.fieldErrors?.password && (
                <p className="mt-1 text-sm text-red-600">{result.fieldErrors.password[0]}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>
        )}

        {result && (
          <div
            className={`rounded-md p-4 ${
              result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}
          >
            <p className="font-medium">{result.message}</p>
          </div>
        )}

        <div className="rounded-md bg-gray-100 p-4 text-sm text-gray-600">
          <p className="font-medium">📝 Notas de prueba:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>RUT válido de ejemplo: 12.345.678-5</li>
            <li>La contraseña debe tener: 8+ caracteres, 1 mayúscula, 1 minúscula, 1 número</li>
            <li>Después del login exitoso, se redirige a /es/test-auth</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

