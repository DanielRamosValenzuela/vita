import { Text, View } from '@react-pdf/renderer'

import { pdfStyles } from './pdf-styles'

interface PdfHeaderProps {
  organizationName: string
  taxId?: string | null
  address?: string | null
  documentTitle: string
  periodLabel: string
}

export function PdfHeader({
  organizationName,
  taxId,
  address,
  documentTitle,
  periodLabel,
}: PdfHeaderProps) {
  return (
    <View style={pdfStyles.header}>
      <Text style={pdfStyles.headerTitle}>{documentTitle}</Text>
      <Text style={pdfStyles.headerSubtitle}>{periodLabel}</Text>
      <Text style={pdfStyles.headerOrgInfo}>
        {organizationName}
        {taxId ? ` — ${taxId}` : ''}
      </Text>
      {address && <Text style={pdfStyles.headerOrgInfo}>{address}</Text>}
    </View>
  )
}
