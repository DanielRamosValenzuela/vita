/**
 * Crea cuentas de staff de prueba (equivalente al flujo de registro).
 * Uso: npm run seed:staff  o  npx tsx scripts/seed-staff-accounts.ts
 * Carga .env del proyecto si DATABASE_URL no está en el entorno.
 *
 * Crea 10 usuarios: prueba1@gmail.com .. prueba10@gmail.com
 * Password para todos: 123qweASD.
 * RUTs chilenos válidos (con dígito verificador).
 */

import { existsSync, readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { PrismaPg } from '@prisma/adapter-pg'
import { Country, DocType, PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { Pool } from 'pg'

function loadEnvIfNeeded(): void {
  if (process.env.DATABASE_URL) return
  const dir = dirname(fileURLToPath(import.meta.url))
  const envPath = join(dir, '..', '.env')
  if (!existsSync(envPath)) return
  const content = readFileSync(envPath, 'utf-8')
  for (const line of content.split('\n')) {
    const m = line.match(/^\s*DATABASE_URL\s*=\s*(.+)\s*$/)
    if (m) {
      process.env.DATABASE_URL = m[1].trim().replace(/^["']|["']$/g, '')
      break
    }
  }
}

const PASSWORD = '123qweASD.'
const COUNT = 10
const SALT_ROUNDS = 12

function chileanRutCheckDigit(body: string): string {
  const digits = body.replace(/\D/g, '').split('').reverse().map(Number)
  const factors = [2, 3, 4, 5, 6, 7]
  let sum = 0
  for (let i = 0; i < digits.length; i++) sum += digits[i] * factors[i % 6]
  const rest = sum % 11
  const d = 11 - rest
  if (d === 11) return '0'
  if (d === 10) return 'K'
  return String(d)
}

function toValidRut(body: string): string {
  const clean = body.replace(/\D/g, '')
  const digit = chileanRutCheckDigit(clean)
  return clean + digit
}

async function main(): Promise<void> {
  loadEnvIfNeeded()
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('Falta DATABASE_URL. Definir en .env o en el entorno.')
    process.exit(1)
  }

  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  const hashedPassword = await bcrypt.hash(PASSWORD, SALT_ROUNDS)

  for (let i = 1; i <= COUNT; i++) {
    const email = `prueba${i}@gmail.com`
    const name = `Prueba ${i}`
    const body = String(10000000 + i)
    const docNumber = toValidRut(body)

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      console.log(`⏭️  ${email} ya existe, se omite.`)
      continue
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        country: Country.CL,
        docType: DocType.RUT,
        docNumber,
        role: 'STAFF_HEALTH',
      },
    })

    await prisma.account.create({
      data: {
        userId: user.id,
        type: 'credentials',
        provider: 'credentials',
        providerAccountId: user.id,
        access_token: hashedPassword,
      },
    })

    console.log(`✅ ${email} (RUT …${docNumber.slice(-4)}) creado.`)
  }

  await prisma.$disconnect()
  pool.end()
  console.log(`\nListo. ${COUNT} cuentas de staff de prueba. Password: ${PASSWORD}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
