'use client'

import { useEffect, useReducer, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Country } from '@prisma/client'
import { HelpCircle } from 'lucide-react'

import { getDocTypeForCountry } from '@/src/shared/lib/utils/doc-type-mapper'
import { formatTaxId, getTaxIdConfig, validateTaxId } from '@/src/shared/lib/utils/tax-id-config'
import { Button } from '@/src/shared/ui/button'
import { Input } from '@/src/shared/ui/input'
import { Label } from '@/src/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/shared/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/src/shared/ui/tooltip'

import { Link } from '@/i18n/navigation'

import { registerAction } from '../api'

interface RegisterFormState {
  loading: boolean
  errors: Record<string, string[]>
  generalError: string | null
  country: Country
  docNumberValue: string
  docNumberError: string | null
}

type RegisterFormAction =
  | { type: 'SET_LOADING'; value: boolean }
  | { type: 'SET_ERRORS'; errors: Record<string, string[]> }
  | { type: 'SET_GENERAL_ERROR'; error: string | null }
  | { type: 'SET_COUNTRY'; country: Country }
  | { type: 'SET_DOC_NUMBER'; value: string }
  | { type: 'SET_DOC_NUMBER_ERROR'; error: string | null }
  | { type: 'RESET_FOR_SUBMIT' }
  | { type: 'CHANGE_COUNTRY'; country: Country }

const initialState: RegisterFormState = {
  loading: false,
  errors: {},
  generalError: null,
  country: Country.CL,
  docNumberValue: '',
  docNumberError: null,
}

function registerFormReducer(
  state: RegisterFormState,
  action: RegisterFormAction,
): RegisterFormState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.value }
    case 'SET_ERRORS':
      return { ...state, errors: action.errors }
    case 'SET_GENERAL_ERROR':
      return { ...state, generalError: action.error }
    case 'SET_COUNTRY':
      return { ...state, country: action.country }
    case 'SET_DOC_NUMBER':
      return { ...state, docNumberValue: action.value }
    case 'SET_DOC_NUMBER_ERROR':
      return { ...state, docNumberError: action.error }
    case 'RESET_FOR_SUBMIT':
      return { ...state, loading: true, errors: {}, generalError: null }
    case 'CHANGE_COUNTRY':
      return { ...state, country: action.country, docNumberValue: '', docNumberError: null }
    default:
      return state
  }
}

export function RegisterForm() {
  const t = useTranslations('auth')
  const router = useRouter()
  const [state, dispatch] = useReducer(registerFormReducer, initialState)
  const generalErrorRef = useRef<HTMLElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const { loading, errors, generalError, country, docNumberValue, docNumberError } = state

  const taxIdConfig = getTaxIdConfig(country)
  const docType = getDocTypeForCountry(country)

  useEffect(() => {
    if (generalError || Object.keys(errors).length > 0 || docNumberError)
      setTimeout(() => {
        if (generalError && generalErrorRef.current)
          generalErrorRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          })
        else {
          const firstErrorField = Object.keys(errors)[0]
          if (firstErrorField) {
            const errorElement = document.getElementById(firstErrorField)
            if (errorElement) {
              errorElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
              })
              errorElement.focus()
            }
          } else if (docNumberError) {
            const docNumberElement = document.getElementById('docNumber')
            if (docNumberElement) {
              docNumberElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
              })
              docNumberElement.focus()
            }
          }
        }
      }, 100)
  }, [generalError, errors, docNumberError])

  const handleCountryChange = (value: string) => {
    dispatch({ type: 'CHANGE_COUNTRY', country: value as Country })
  }

  const handleDocNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const formatted = formatTaxId(value, country)
    dispatch({ type: 'SET_DOC_NUMBER', value: formatted })

    if (formatted && !validateTaxId(formatted, country))
      dispatch({ type: 'SET_DOC_NUMBER_ERROR', error: t('taxIdInvalid', { label: taxIdConfig.label }) })
    else dispatch({ type: 'SET_DOC_NUMBER_ERROR', error: null })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    dispatch({ type: 'RESET_FOR_SUBMIT' })

    const formData = new FormData(e.currentTarget)
    formData.set('docType', docType)
    formData.set('country', country)

    const locale = window.location.pathname.split('/')[1] || 'es'
    formData.set('locale', locale)

    try {
      const result = await registerAction(formData)

      if (result.success) router.push('/es/login?registered=true')
      else {
        dispatch({ type: 'SET_GENERAL_ERROR', error: result.error || t('unknownError') })
        dispatch({ type: 'SET_ERRORS', errors: result.fieldErrors || {} })
      }
    } catch (error) {
      dispatch({
        type: 'SET_GENERAL_ERROR',
        error: error instanceof Error ? error.message : t('unexpectedError'),
      })
    } finally {
      dispatch({ type: 'SET_LOADING', value: false })
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      {generalError && (
        <section
          ref={generalErrorRef}
          role="alert"
          aria-live="assertive"
          className="rounded-md bg-destructive/10 p-4 text-sm text-destructive"
        >
          {generalError}
        </section>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">{t('fullName')}</Label>
        <Input type="text" id="name" name="name" required placeholder={t('namePlaceholder')} />
        {errors.name && (
          <p className="text-destructive text-sm" role="alert">
            {errors.name[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{t('email')}</Label>
        <Input type="email" id="email" name="email" required placeholder={t('emailPlaceholder')} />
        {errors.email && (
          <p className="text-destructive text-sm" role="alert">
            {errors.email[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="country">{t('country')}</Label>
        <input type="hidden" name="country" value={country} />
        <Select value={country} onValueChange={handleCountryChange} required>
          <SelectTrigger id="country" className="w-full">
            <SelectValue placeholder={t('selectCountryPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={Country.CL}>{t('countries.CL')}</SelectItem>
            <SelectItem value={Country.PE}>{t('countries.PE')}</SelectItem>
            <SelectItem value={Country.CO}>{t('countries.CO')}</SelectItem>
            <SelectItem value={Country.AR}>{t('countries.AR')}</SelectItem>
            <SelectItem value={Country.MX}>{t('countries.MX')}</SelectItem>
            <SelectItem value={Country.US}>{t('countries.US')}</SelectItem>
          </SelectContent>
        </Select>
        {errors.country && (
          <p className="text-destructive text-sm" role="alert">
            {errors.country[0]}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="docNumber">{taxIdConfig.label}</Label>
        <Input
          type="text"
          id="docNumber"
          name="docNumber"
          value={docNumberValue}
          onChange={handleDocNumberChange}
          required
          maxLength={taxIdConfig.maxLength}
          placeholder={taxIdConfig.placeholder}
        />
        {taxIdConfig.description && (
          <p className="text-muted-foreground text-xs">{taxIdConfig.description}</p>
        )}
        {docNumberError && (
          <p className="text-destructive text-sm" role="alert">
            {docNumberError}
          </p>
        )}
        {errors.docNumber && !docNumberError && (
          <p className="text-destructive text-sm" role="alert">
            {errors.docNumber[0]}
          </p>
        )}
      </div>

      <fieldset className="space-y-2">
        <legend className="sr-only">{t('password')}</legend>
        <div className="flex items-center gap-2">
          <Label htmlFor="password">{t('password')}</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground focus:outline-none"
                aria-label={t('passwordRequirements')}
              >
                <HelpCircle className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              <ul className="space-y-1 text-xs">
                <li>{'• '}{t('passwordMinLength')}</li>
                <li>{'• '}{t('passwordUppercase')}</li>
                <li>{'• '}{t('passwordLowercase')}</li>
                <li>{'• '}{t('passwordNumber')}</li>
              </ul>
            </TooltipContent>
          </Tooltip>
        </div>
        <Input type="password" id="password" name="password" required placeholder="••••••••" />
        {errors.password && (
          <p className="text-destructive text-sm" role="alert">
            {errors.password[0]}
          </p>
        )}
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
        <Input type="password" id="confirmPassword" name="confirmPassword" required />
        {errors.confirmPassword && (
          <p className="text-destructive text-sm" role="alert">
            {errors.confirmPassword[0]}
          </p>
        )}
      </div>

      <Button type="submit" disabled={loading || !!docNumberError} className="w-full">
        {loading ? t('registering') : t('register')}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {t('alreadyHaveAccount')}{' '}
        <Link href="/login" className="text-primary hover:underline">
          {t('signInLink')}
        </Link>
      </p>
    </form>
  )
}
