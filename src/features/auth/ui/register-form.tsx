'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Country } from '@prisma/client'
import { HelpCircle } from 'lucide-react'

import { getDocTypeForCountry } from '@/src/shared/lib/utils/doc-type-mapper'
import { formatTaxId, getTaxIdConfig, validateTaxId } from '@/src/shared/lib/utils/tax-id-config'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/src/shared/ui/tooltip'

import { Link } from '@/i18n/navigation'

import { registerAction } from '../api'

export function RegisterForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [country, setCountry] = useState<Country>(Country.CL)
  const [docNumberValue, setDocNumberValue] = useState('')
  const [docNumberError, setDocNumberError] = useState<string | null>(null)

  const taxIdConfig = getTaxIdConfig(country)
  const docType = getDocTypeForCountry(country)

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountry = e.target.value as Country
    setCountry(newCountry)
    setDocNumberValue('')
    setDocNumberError(null)
  }

  const handleDocNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const formatted = formatTaxId(value, country)
    setDocNumberValue(formatted)

    if (formatted && !validateTaxId(formatted, country)) {
      setDocNumberError(`El ${taxIdConfig.label} ingresado no es válido`)
    } else {
      setDocNumberError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    setGeneralError(null)

    const formData = new FormData(e.currentTarget)
    formData.set('docType', docType)
    formData.set('country', country)

    const locale = window.location.pathname.split('/')[1] || 'es'
    formData.set('locale', locale)

    try {
      const result = await registerAction(formData)

      if (result.success) {
        router.push('/es/login?registered=true')
      } else {
        setGeneralError(result.error || 'Error desconocido')
        setErrors(result.fieldErrors || {})
      }
    } catch (error) {
      setGeneralError(error instanceof Error ? error.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {generalError && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">{generalError}</div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nombre Completo
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          placeholder="Juan Pérez"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name[0]}</p>}
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
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          placeholder="tu@email.com"
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email[0]}</p>}
      </div>

      <div>
        <label htmlFor="country" className="block text-sm font-medium text-gray-700">
          País
        </label>
        <select
          id="country"
          name="country"
          value={country}
          onChange={handleCountryChange}
          required
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        >
          <option value={Country.CL}>Chile</option>
          <option value={Country.PE}>Perú</option>
          <option value={Country.CO}>Colombia</option>
          <option value={Country.AR}>Argentina</option>
          <option value={Country.MX}>México</option>
          <option value={Country.US}>Estados Unidos</option>
        </select>
        {errors.country && <p className="mt-1 text-sm text-red-600">{errors.country[0]}</p>}
      </div>

      <div>
        <label htmlFor="docNumber" className="block text-sm font-medium text-gray-700">
          {taxIdConfig.label}
        </label>
        <input
          type="text"
          id="docNumber"
          name="docNumber"
          value={docNumberValue}
          onChange={handleDocNumberChange}
          required
          maxLength={taxIdConfig.maxLength}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          placeholder={taxIdConfig.placeholder}
        />
        {taxIdConfig.description && (
          <p className="mt-1 text-xs text-gray-500">{taxIdConfig.description}</p>
        )}
        {docNumberError && <p className="mt-1 text-sm text-red-600">{docNumberError}</p>}
        {errors.docNumber && !docNumberError && (
          <p className="mt-1 text-sm text-red-600">{errors.docNumber[0]}</p>
        )}
      </div>

      <div>
        <div className="flex items-center gap-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground focus:outline-none"
                aria-label="Requisitos de contraseña"
              >
                <HelpCircle className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              <ul className="space-y-1 text-xs">
                <li>• Mínimo 8 caracteres</li>
                <li>• Al menos 1 mayúscula</li>
                <li>• Al menos 1 minúscula</li>
                <li>• Al menos 1 número</li>
              </ul>
            </TooltipContent>
          </Tooltip>
        </div>
        <input
          type="password"
          id="password"
          name="password"
          required
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          placeholder="••••••••"
        />
        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password[0]}</p>}
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
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword[0]}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || !!docNumberError}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {loading ? 'Registrando...' : 'Registrarse'}
      </button>

      <p className="text-center text-sm text-gray-600">
        ¿Ya tienes una cuenta?{' '}
        <Link href="/login" className="text-blue-600 hover:text-blue-500">
          Inicia sesión
        </Link>
      </p>
    </form>
  )
}
