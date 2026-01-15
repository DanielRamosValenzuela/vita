import { Country, DocType } from '@prisma/client'

export function getDocTypeForCountry(country: Country): DocType {
  const mapping: Record<Country, DocType> = {
    CL: DocType.RUT,
    PE: DocType.DNI,
    CO: DocType.CC,
    AR: DocType.DNI_AR,
    MX: DocType.CURP,
    US: DocType.PASSPORT,
  }

  return mapping[country]
}
