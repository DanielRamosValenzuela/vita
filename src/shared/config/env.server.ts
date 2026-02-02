const {
  NODE_ENV,
  DATABASE_URL,
  DIRECT_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  NEXTAUTH_URL,
  NEXTAUTH_SECRET,
} = process.env

function required(value: string | undefined, key: string): string {
  if (value === undefined || value === '')
    throw new Error(`Missing or empty env: ${key}`)
  return value
}

const databaseUrl = required(DATABASE_URL, 'DATABASE_URL')

export const env = {
  NODE_ENV: (NODE_ENV ?? 'development') as 'development' | 'production' | 'test',
  DATABASE_URL: databaseUrl,
  DIRECT_URL: DIRECT_URL ?? databaseUrl,
  GOOGLE_CLIENT_ID: required(GOOGLE_CLIENT_ID, 'GOOGLE_CLIENT_ID'),
  GOOGLE_CLIENT_SECRET: required(GOOGLE_CLIENT_SECRET, 'GOOGLE_CLIENT_SECRET'),
  NEXTAUTH_URL: NEXTAUTH_URL,
  NEXTAUTH_SECRET: required(NEXTAUTH_SECRET, 'NEXTAUTH_SECRET'),
} as const

export const isDev = env.NODE_ENV === 'development'
