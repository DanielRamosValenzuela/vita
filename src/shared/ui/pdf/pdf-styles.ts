import { StyleSheet } from '@react-pdf/renderer'

export const colors = {
  primary: '#1a1a2e',
  secondary: '#16213e',
  accent: '#0f3460',
  text: '#1a1a1a',
  textLight: '#6b7280',
  border: '#e5e7eb',
  borderLight: '#f3f4f6',
  headerBg: '#f8fafc',
  white: '#ffffff',
}

export const pdfStyles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: colors.white,
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: colors.text,
  },

  
  header: {
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: colors.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 11,
    color: colors.textLight,
  },
  headerOrgInfo: {
    fontSize: 9,
    color: colors.textLight,
    marginTop: 2,
  },

  
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: colors.secondary,
    marginTop: 16,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  
  table: {
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.secondary,
    textTransform: 'uppercase',
  },
  tableCell: {
    fontSize: 9,
    color: colors.text,
  },
  tableCellRight: {
    fontSize: 9,
    color: colors.text,
    textAlign: 'right',
  },
  tableTotalRow: {
    flexDirection: 'row',
    borderTopWidth: 2,
    borderTopColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 4,
    marginTop: 2,
  },
  tableTotalLabel: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: colors.primary,
  },
  tableTotalValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: colors.primary,
    textAlign: 'right',
  },

  
  infoBox: {
    backgroundColor: colors.headerBg,
    padding: 10,
    borderRadius: 4,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  infoLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: colors.textLight,
    width: 140,
  },
  infoValue: {
    fontSize: 9,
    color: colors.text,
    flex: 1,
  },

  
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: colors.textLight,
  },

  
  badge: {
    fontSize: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: colors.headerBg,
    color: colors.secondary,
  },
  note: {
    fontSize: 8,
    color: colors.textLight,
    fontStyle: 'italic',
    marginTop: 4,
  },
})
