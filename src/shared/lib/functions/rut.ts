export function validateRUT(rut: string): boolean {
  if (!rut || typeof rut !== 'string') return false

  const cleanRUT = rut.replace(/[.-]/g, '').toUpperCase()

  if (cleanRUT.length < 8 || cleanRUT.length > 9) return false
  const body = cleanRUT.slice(0, -1)
  const dv = cleanRUT.slice(-1)

  if (!/^\d+$/.test(body)) return false

  if (!/^[\dK]$/.test(dv)) return false

  let sum = 0
  let multiplier = 2

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier
    multiplier = multiplier === 7 ? 2 : multiplier + 1
  }

  const remainder = sum % 11
  const calculatedDV = remainder < 2 ? remainder.toString() : (11 - remainder).toString()
  const expectedDV = calculatedDV === '10' ? 'K' : calculatedDV

  return dv === expectedDV
}

export function formatRUT(rut: string): string {
  if (!rut) return ''

  const cleanRUT = rut.replace(/[.-]/g, '')

  if (cleanRUT.length < 8) return cleanRUT

  const body = cleanRUT.slice(0, -1)
  const dv = cleanRUT.slice(-1).toUpperCase()

  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  return `${formattedBody}-${dv}`
}
