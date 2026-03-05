import { Text, View } from '@react-pdf/renderer'

import { pdfStyles } from './pdf-styles'

export interface PdfColumnDef {
  key: string
  header: string
  width: string | number
  align?: 'left' | 'right' | 'center'
}

interface PdfTableProps {
  columns: PdfColumnDef[]
  data: Record<string, string | number>[]
  totalRow?: { label: string; value: string; labelSpan?: number }
}

export function PdfTable({ columns, data, totalRow }: PdfTableProps) {
  return (
    <View style={pdfStyles.table}>
      {}
      <View style={pdfStyles.tableHeader}>
        {columns.map((col) => (
          <Text
            key={col.key}
            style={[
              pdfStyles.tableHeaderCell,
              {
                width: col.width,
                textAlign: col.align ?? 'left',
              },
            ]}
          >
            {col.header}
          </Text>
        ))}
      </View>

      {}
      {data.map((row, index) => (
        <View key={index} style={pdfStyles.tableRow}>
          {columns.map((col) => (
            <Text
              key={col.key}
              style={[
                col.align === 'right' ? pdfStyles.tableCellRight : pdfStyles.tableCell,
                { width: col.width },
              ]}
            >
              {String(row[col.key] ?? '')}
            </Text>
          ))}
        </View>
      ))}

      {}
      {totalRow && (
        <View style={pdfStyles.tableTotalRow}>
          <Text
            style={[
              pdfStyles.tableTotalLabel,
              {
                width: totalRow.labelSpan
                  ? columns
                      .slice(0, totalRow.labelSpan)
                      .reduce((sum, col) => {
                        const w = typeof col.width === 'number' ? col.width : parseInt(col.width)
                        return sum + (isNaN(w) ? 0 : w)
                      }, 0)
                  : '70%',
              },
            ]}
          >
            {totalRow.label}
          </Text>
          <Text style={[pdfStyles.tableTotalValue, { flex: 1 }]}>{totalRow.value}</Text>
        </View>
      )}
    </View>
  )
}
