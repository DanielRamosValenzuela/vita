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
  const dvNum = 11 - remainder
  let expectedDV: string
  if (dvNum === 11) 
    expectedDV = '0'
   else if (dvNum === 10) 
    expectedDV = 'K'
   else 
    expectedDV = dvNum.toString()
  

  return dv === expectedDV
}
