const {
  NODE_ENV,
  DATABASE_URL,
  DIRECT_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  NEXTAUTH_URL,
  NEXTAUTH_SECRET,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  CRON_SECRET,
} = process.env

function required(value: string | undefined, key: string): string {
  if (value === undefined || value === '') throw new Error(`Missing or empty env: ${key}`)
  return value
}

const databaseUrl = required(DATABASE_URL, 'DATABASE_URL')
const nextAuthUrl = NEXTAUTH_URL ?? 'http://localhost:3000'

export const env = {
  NODE_ENV: (NODE_ENV ?? 'development') as 'development' | 'production' | 'test',
  DATABASE_URL: databaseUrl,
  DIRECT_URL: DIRECT_URL ?? databaseUrl,
  GOOGLE_CLIENT_ID: required(GOOGLE_CLIENT_ID, 'GOOGLE_CLIENT_ID'),
  GOOGLE_CLIENT_SECRET: required(GOOGLE_CLIENT_SECRET, 'GOOGLE_CLIENT_SECRET'),
  NEXTAUTH_URL: nextAuthUrl,
  NEXTAUTH_SECRET: required(NEXTAUTH_SECRET, 'NEXTAUTH_SECRET'),
  SUPABASE_URL: required(SUPABASE_URL, 'SUPABASE_URL'),
  SUPABASE_SERVICE_ROLE_KEY: required(SUPABASE_SERVICE_ROLE_KEY, 'SUPABASE_SERVICE_ROLE_KEY'),
  GOOGLE_LINK_CALLBACK_URL: `${nextAuthUrl}/api/auth/callback/google-link`,
  CRON_SECRET: CRON_SECRET ?? '',
} as const

export const isDev = env.NODE_ENV === 'development'
