/* eslint-disable react/jsx-no-literals, @sanity/i18n/no-attribute-string-literals */
import { MONTH_NAMES_ES } from '@/src/shared/lib/constants/date-formats'
import type { PayrollCalculationResult, ShiftPaymentSummary } from '@/src/shared/lib/payment/types'
import { formatCurrencyByCode } from '@/src/shared/lib/utils/format'
import { PdfHeader } from '@/src/shared/ui/pdf/pdf-header'
import { pdfStyles } from '@/src/shared/ui/pdf/pdf-styles'
import { PdfTable } from '@/src/shared/ui/pdf/pdf-table'
import { Document, Page, Text, View } from '@/src/shared/ui/pdf/react-pdf'

interface PayrollDocumentPdfProps {
  data: PayrollCalculationResult
  orgName: string
  orgTaxId: string
  orgAddress: string | null
  documentId?: string
}

function formatDate(date: Date): string {
  const d = new Date(date)
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
}

function formatMinutesToHours(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}


const DAY_TYPE_LABELS: Record<string, string> = {
  NORMAL: '',
  SATURDAY: 'Sab',
  SUNDAY: 'Dom',
  HOLIDAY: 'Feriado',
  IRRENUNCIABLE: 'Irrenunciable',
}

function buildShiftRow(s: ShiftPaymentSummary, currency: string) {
  const dayLabel = DAY_TYPE_LABELS[s.dayType] ?? ''
  const estimated = s.isEstimated ? ' *' : ''
  return {
    date: formatDate(s.date),
    area: s.areaName,
    type: s.shiftTypeName,
    hours: `${formatMinutesToHours(s.minutesWorked)}${estimated}`,
    dayType: dayLabel,
    multiplier: s.calendarMultiplier !== 1 ? `${s.calendarMultiplier}x` : '-',
    amount: formatCurrencyByCode(s.finalAmount, currency),
  }
}

export function PayrollDocumentPdf({
  data,
  orgName,
  orgTaxId,
  orgAddress,
  documentId,
}: PayrollDocumentPdfProps) {
  const currency = data.currency
  const periodLabel = `${MONTH_NAMES_ES[data.month - 1]} ${data.year}`

  const completedShifts = data.shifts.filter((s) => s.status !== 'DISPUTED')
  const disputedShifts = data.shifts.filter((s) => s.status === 'DISPUTED')
  const hasEstimatedShifts = completedShifts.some((s) => s.isEstimated)

  const shiftRows = completedShifts.map((s) => buildShiftRow(s, currency))
  const disputedRows = disputedShifts.map((s) => buildShiftRow(s, currency))

  const monthlyRows = data.monthlyComponents.map((mc) => ({
    component: mc.componentName,
    baseValue: formatCurrencyByCode(mc.baseValue, currency),
    prorated: `${mc.contractDays}/${mc.totalDays} d`,
    amount: formatCurrencyByCode(mc.proratedValue, currency),
  }))

  const hasMultipleContracts = data.contracts.length > 1
  const hasCustomMultiplier = data.contracts.some(
    (c) => c.customMultiplier && c.customMultiplier !== 1
  )

  const shiftColumns = [
    { key: 'date', header: 'Fecha', width: '15%' },
    { key: 'area', header: 'Area', width: '15%' },
    { key: 'type', header: 'Tipo', width: '15%' },
    { key: 'hours', header: 'Horas', width: '12%' },
    { key: 'dayType', header: 'Dia', width: '11%' },
    { key: 'multiplier', header: 'Mult.', width: '12%', align: 'right' as const },
    { key: 'amount', header: 'Monto', width: '20%', align: 'right' as const },
  ]

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {}
        <PdfHeader
          organizationName={orgName}
          taxId={orgTaxId}
          address={orgAddress}
          documentTitle="Documento de Nomina"
          periodLabel={`Periodo: ${periodLabel}`}
        />

        {}
        <View style={pdfStyles.infoBox}>
          <View style={pdfStyles.infoRow}>
            <Text style={pdfStyles.infoLabel}>Empleado:</Text>
            <Text style={pdfStyles.infoValue}>{data.userName}</Text>
          </View>
          <View style={pdfStyles.infoRow}>
            <Text style={pdfStyles.infoLabel}>Correo:</Text>
            <Text style={pdfStyles.infoValue}>{data.userEmail}</Text>
          </View>
          {!hasMultipleContracts && data.contracts[0]?.areaName && (
            <View style={pdfStyles.infoRow}>
              <Text style={pdfStyles.infoLabel}>Area:</Text>
              <Text style={pdfStyles.infoValue}>{data.contracts[0].areaName}</Text>
            </View>
          )}
          {!hasMultipleContracts && (
            <View style={pdfStyles.infoRow}>
              <Text style={pdfStyles.infoLabel}>Tarifa:</Text>
              <Text style={pdfStyles.infoValue}>{data.contracts[0]?.rateTemplateName ?? '-'}</Text>
            </View>
          )}
          <View style={pdfStyles.infoRow}>
            <Text style={pdfStyles.infoLabel}>Dias del contrato en periodo:</Text>
            <Text style={pdfStyles.infoValue}>
              {data.contractDaysInPeriod} de {data.totalDaysInPeriod} dias
            </Text>
          </View>
        </View>

        {}
        {hasMultipleContracts && (
          <>
            <Text style={pdfStyles.sectionTitle}>Contratos Activos</Text>
            {data.contracts.map((contract, idx) => (
              <View key={contract.contractId} style={pdfStyles.infoBox}>
                <View style={pdfStyles.infoRow}>
                  <Text style={pdfStyles.infoLabel}>Contrato {idx + 1}:</Text>
                  <Text style={pdfStyles.infoValue}>
                    {contract.rateTemplateName}
                    {contract.areaName ? ` — ${contract.areaName}` : ''}
                  </Text>
                </View>
                <View style={pdfStyles.infoRow}>
                  <Text style={pdfStyles.infoLabel}>Dias en periodo:</Text>
                  <Text style={pdfStyles.infoValue}>
                    {contract.daysInPeriod} de {contract.totalDaysInPeriod} dias
                  </Text>
                </View>
                {contract.customMultiplier && contract.customMultiplier !== 1 && (
                  <View style={pdfStyles.infoRow}>
                    <Text style={pdfStyles.infoLabel}>Multiplicador personal:</Text>
                    <Text style={pdfStyles.infoValue}>{contract.customMultiplier}x</Text>
                  </View>
                )}
              </View>
            ))}
          </>
        )}

        {}
        <Text style={pdfStyles.sectionTitle}>Sueldo Base</Text>
        <View style={pdfStyles.infoBox}>
          <View style={pdfStyles.infoRow}>
            <Text style={pdfStyles.infoLabel}>Sueldo base (proporcional):</Text>
            <Text style={pdfStyles.infoValue}>
              {formatCurrencyByCode(data.baseSalaryAmount, currency)}
            </Text>
          </View>
        </View>

        {}
        {completedShifts.length > 0 && (
          <>
            <Text style={pdfStyles.sectionTitle}>
              Detalle de Turnos ({data.shiftsCount} turnos)
            </Text>
            <PdfTable
              columns={shiftColumns}
              data={shiftRows}
              totalRow={{
                label: 'Subtotal turnos',
                value: formatCurrencyByCode(data.shiftsAmount, currency),
                labelSpan: 6,
              }}
            />
            {hasEstimatedShifts && (
              <Text style={pdfStyles.note}>
                * Horas estimadas (turno sin hora de salida real registrada)
              </Text>
            )}
          </>
        )}

        {}
        {disputedShifts.length > 0 && (
          <>
            <Text style={pdfStyles.sectionTitle}>Turnos en Disputa ({disputedShifts.length})</Text>
            <Text style={pdfStyles.note}>
              Los siguientes turnos no se incluyen en el total por estar en disputa.
            </Text>
            <PdfTable columns={shiftColumns} data={disputedRows} />
          </>
        )}

        {}
        {data.monthlyComponents.length > 0 && (
          <>
            <Text style={pdfStyles.sectionTitle}>Componentes Mensuales</Text>
            <PdfTable
              columns={[
                { key: 'component', header: 'Componente', width: '35%' },
                { key: 'baseValue', header: 'Valor base', width: '25%', align: 'right' },
                { key: 'prorated', header: 'Proporcional', width: '20%', align: 'right' },
                { key: 'amount', header: 'Monto', width: '20%', align: 'right' },
              ]}
              data={monthlyRows}
              totalRow={{
                label: 'Subtotal componentes',
                value: formatCurrencyByCode(data.monthlyComponentsAmount, currency),
                labelSpan: 3,
              }}
            />
          </>
        )}

        {}
        {!hasMultipleContracts && hasCustomMultiplier && (
          <Text style={pdfStyles.note}>
            Multiplicador personal: {data.contracts[0]?.customMultiplier}x
          </Text>
        )}

        {}
        <View
          style={{
            marginTop: 16,
            paddingTop: 12,
            borderTopWidth: 2,
            borderTopColor: '#1a1a2e',
          }}
        >
          <View style={pdfStyles.infoRow}>
            <Text
              style={[
                pdfStyles.infoLabel,
                { fontSize: 12, fontFamily: 'Helvetica-Bold', width: 200 },
              ]}
            >
              TOTAL:
            </Text>
            <Text
              style={[
                pdfStyles.infoValue,
                { fontSize: 12, fontFamily: 'Helvetica-Bold', textAlign: 'right' },
              ]}
            >
              {formatCurrencyByCode(data.totalAmount, currency)}
            </Text>
          </View>
        </View>

        {}
        <View style={pdfStyles.footer} fixed>
          <Text style={pdfStyles.footerText}>Documento informativo — Sin validez tributaria</Text>
          <Text style={pdfStyles.footerText}>
            Generado: {formatDate(new Date())}
            {documentId ? ` | ID: ${documentId}` : ''}
          </Text>
          <Text
            style={pdfStyles.footerText}
            render={({ pageNumber, totalPages }) => `Pagina ${pageNumber} de ${totalPages}`}
            fixed
          />
        </View>
      </Page>
    </Document>
  )
}
