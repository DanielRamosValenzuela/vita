

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const MESSAGES_DIR = path.join(__dirname, '..', 'messages')
const LOCALES = ['es', 'en']

function flattenObject(obj, prefix = '') {
  return Object.keys(obj).reduce((acc, key) => {
    const value = obj[key]
    const newKey = prefix ? `${prefix}.${key}` : key

    if (value && typeof value === 'object' && !Array.isArray(value)) 
      Object.assign(acc, flattenObject(value, newKey))
     else 
      acc[newKey] = value
    

    return acc
  }, {})
}

function loadTranslations(locale) {
  const filePath = path.join(MESSAGES_DIR, `${locale}.json`)
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Archivo no encontrado: ${filePath}`)
    process.exit(1)
  }
  const content = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(content)
}

function main() {
  // eslint-disable-next-line no-console
  console.log('🔍 Verificando traducciones...\n')

  
  const translations = {}
  const flatTranslations = {}

  for (const locale of LOCALES) {
    translations[locale] = loadTranslations(locale)
    flatTranslations[locale] = flattenObject(translations[locale])
  }

  
  let hasErrors = false
  const allKeys = new Set()

  
  for (const locale of LOCALES) 
    Object.keys(flatTranslations[locale]).forEach((key) => allKeys.add(key))
  

  // eslint-disable-next-line no-console
  console.log(`📊 Total de claves únicas: ${allKeys.size}\n`)

  
  for (const locale of LOCALES) {
    const missingKeys = []
    const emptyKeys = []

    for (const key of allKeys) 
      if (!(key in flatTranslations[locale])) 
        missingKeys.push(key)
       else if (
        flatTranslations[locale][key] === '' ||
        flatTranslations[locale][key] === null
      ) 
        emptyKeys.push(key)
      
    

    if (missingKeys.length > 0 || emptyKeys.length > 0) {
      hasErrors = true
      // eslint-disable-next-line no-console
      console.log(`❌ Problemas en [${locale.toUpperCase()}]:`)

      if (missingKeys.length > 0) {
        // eslint-disable-next-line no-console
        console.log(`\n   📌 Claves faltantes (${missingKeys.length}):`)
        missingKeys.forEach((key) => {
          // eslint-disable-next-line no-console
          console.log(`      - ${key}`)
        })
      }

      if (emptyKeys.length > 0) {
        // eslint-disable-next-line no-console
        console.log(`\n   ⚠️  Claves vacías (${emptyKeys.length}):`)
        emptyKeys.forEach((key) => {
          // eslint-disable-next-line no-console
          console.log(`      - ${key}`)
        })
      }

      // eslint-disable-next-line no-console
      console.log('')
    } else 
      // eslint-disable-next-line no-console
      console.log(`✅ [${locale.toUpperCase()}]: Todo correcto`)
    
    
  }

  
  const baseLocale = LOCALES[0] 
  const baseKeys = Object.keys(flatTranslations[baseLocale])

  for (const locale of LOCALES.slice(1)) {
    const extraKeys = Object.keys(flatTranslations[locale]).filter(
      (key) => !baseKeys.includes(key)
    )

    if (extraKeys.length > 0) {
      hasErrors = true
      // eslint-disable-next-line no-console
      console.log(
        `⚠️  [${locale.toUpperCase()}] tiene claves que no están en [${baseLocale.toUpperCase()}]:`
      )
      extraKeys.forEach((key) => {
        // eslint-disable-next-line no-console
        console.log(`   - ${key}`)
      })
      // eslint-disable-next-line no-console
      console.log('')
    }
  }

  if (!hasErrors) {
    // eslint-disable-next-line no-console
    console.log('\n✅ ¡Todas las traducciones están completas!')
    process.exit(0)
  }
  
  // eslint-disable-next-line no-console
  console.log('\n❌ Se encontraron problemas en las traducciones.')
  // eslint-disable-next-line no-console
  console.log(
    '   Por favor, corrige los archivos en la carpeta "messages/"\n'
  )
  process.exit(1)
}

main()
