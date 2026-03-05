# Tasks: Payroll Billing PDF Generation

**Input**: Design documents from `/specs/006-payroll-billing-pdf/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: No automated tests requested. Verification via `npm run build` + `npm run lint` + manual testing.

**Organization**: Tasks grouped by user story for independent implementation. 6 user stories from spec.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1-US6)
- Exact file paths included in all descriptions

---

## Phase 1: Setup

**Purpose**: Install dependencies, schema migration, storage bucket, base types

- [x] T001 Install @react-pdf/renderer dependency via `npm install @react-pdf/renderer`
- [x] T002 Add PayrollPeriodStatus enum, PayrollPeriod model, PayrollDocument model, Organization.billingDay field, and new NotificationType values (PAYROLL_GENERATED, PAYROLL_GENERATION_FAILED, PAYROLL_DOCUMENT_AVAILABLE) to `prisma/schema.prisma` — then run `npx prisma db push && npx prisma generate`
- [x] T003 Create Supabase Storage bucket `payroll-documents` (private) via migration in Supabase dashboard or SQL
- [x] T004 [P] Create payment calculation types in `src/shared/lib/payment/types.ts` — define ShiftPaymentInput, ShiftPaymentResult, PayrollCalculationInput, PayrollCalculationResult, ComponentEvaluationContext interfaces
- [x] T005 [P] Create payroll entity types in `src/entities/payroll/lib/types.ts` — define PayrollPeriodWithDocuments, PayrollDocumentSummary, PayrollPeriodSummary types derived from Prisma models
- [x] T006 [P] Create payroll entity barrel export in `src/entities/payroll/index.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Payment calculation engine, shift completion hook, payroll repository, storage utilities, PDF primitives — MUST complete before ANY user story

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Implement component condition evaluator in `src/shared/lib/payment/component-evaluator.ts` — function `evaluateComponent(component: RateComponent, context: ComponentEvaluationContext): boolean` that matches applyCondition (ALWAYS, WEEKDAY_ONLY, WEEKEND_ONLY, HOLIDAY_ONLY, IRRENUNCIABLE_ONLY, SPECIFIC_SHIFT_TYPE, SPECIFIC_AREA, etc.) against shift context (day type, shift type, area)
- [x] T008 Implement per-shift payment calculator in `src/shared/lib/payment/calculate-shift-payment.ts` — function `calculateShiftPayment(shiftId: string): Promise<ShiftPaymentResult>` that: fetches shift with contract→rateTemplate→components, gets calendar multiplier, filters applicable components via evaluator, calculates each component value by type/unit (PER_SHIFT, PER_MINUTE, PER_HOUR, etc.), applies customMultiplier and calendarMultiplier, creates ShiftPayment + ShiftPaymentBreakdown records
- [x] T009 Implement `calculateShiftPaymentAction` in `src/features/shifts/api/shift-payment-actions.ts` — server action wrapper that receives `{ shiftId: string }`, validates shift belongs to caller's org, calls `calculateShiftPayment` from shared/lib, returns `ActionResult<{ paymentId: string; finalAmount: number }>`. Used internally from shift completion flow
- [x] T010 Hook shift completion to trigger payment calculation — modify existing shift update/completion flow in `src/features/shifts/api/shift-actions.ts`: when a shift's status changes to COMPLETED (actualEndTime is set / check-out registered), automatically call `calculateShiftPayment` to create ShiftPayment + ShiftPaymentBreakdown records. Guard against duplicate calculation if ShiftPayment already exists for that shift
- [x] T011 Implement monthly payroll calculator in `src/shared/lib/payment/calculate-payroll.ts` — function `calculatePayrollForUser(userId: string, organizationId: string, month: number, year: number): Promise<PayrollCalculationResult>` that: finds active contracts in period, prorates BASE_SALARY by contract days in period, sums ShiftPayment.finalAmount for completed shifts, prorates monthly components, returns total breakdown with baseSalaryAmount, shiftsAmount, monthlyComponentsAmount, handles multiple contracts, excludes DISPUTED payments
- [x] T012 [P] Implement payroll repository in `src/entities/payroll/lib/payroll-repository.ts` — CRUD functions: createPayrollPeriod, updatePayrollPeriod, getPayrollPeriod, getPayrollPeriodByOrgAndMonth, createPayrollDocument, deletePayrollDocument, getPayrollDocuments (with role-based filtering for ADMIN_HR/CHIEF_AREA/STAFF), getPayrollPeriods (by org and year)
- [x] T013 [P] Extend Supabase Storage utilities in `src/shared/lib/storage/supabase-storage.ts` — add functions: uploadPayrollDocument(orgId, year, month, userId, periodId, buffer), deletePayrollDocument(storagePath), getPayrollDocumentSignedUrl(storagePath, expiresIn=3600), using `payroll-documents` bucket with path pattern `{orgId}/{year}/{month}/{userId}-{periodId}.pdf`
- [x] T014 [P] Create PDF style definitions in `src/shared/ui/pdf/pdf-styles.ts` — shared styles for payroll documents: page layout, fonts, colors, spacing, table styles, header/footer styles compatible with @react-pdf/renderer StyleSheet.create
- [x] T015 [P] Create PDF header component in `src/shared/ui/pdf/pdf-header.tsx` — @react-pdf/renderer component displaying organization name, tax ID, address, period, and document title. Accepts org data and period info as props
- [x] T016 [P] Create PDF table component in `src/shared/ui/pdf/pdf-table.tsx` — @react-pdf/renderer reusable table component with header row, data rows, and total row. Supports column definitions with alignment and width
- [x] T017 [P] Add i18n keys for payroll namespace in `messages/es.json` and `messages/en.json` — add `nav.payroll`, `nav.payments`, `nav.myPayments`, `payroll.*` (title, periods, documents, generate, regenerate, delete, billingDay, status labels, empty states, confirmations, errors), `pdf.*` (document title, period label, employee, shifts, components, total, subtotal, multiplier, estimated)

**Checkpoint**: Foundation ready — payment calc engine, shift completion hook, repository, storage, PDF primitives, and i18n all in place

---

## Phase 3: User Story 1 — ADMIN_HR configura la fecha de facturación (Priority: P1) MVP

**Goal**: ADMIN_HR puede configurar qué día del mes se genera la facturación de nómina

**Independent Test**: Navegar a la página de tarifas, configurar día de facturación, verificar persistencia

### Implementation for User Story 1

- [x] T018 [P] [US1] Implement `getBillingConfigAction` in `src/features/admin-hr/api/payroll-actions.ts` — server action using requireAdminHRWithOrg that returns `ActionResult<{ billingDay: number | null; currency: Currency }>` from organization record
- [x] T019 [P] [US1] Implement `updateBillingDayAction` in `src/features/admin-hr/api/payroll-actions.ts` — server action with Zod validation (billingDay: z.number().int().min(1).max(31)), updates organization.billingDay, revalidates /dashboard/rates and /dashboard/payroll
- [x] T020 [US1] Create billing day configuration component in `src/features/admin-hr/ui/billing-day-config.tsx` — form with number input (1-31) using useFormAction + Zod, shows current value, save button with isPending state, success toast via toastActionResult, handles validation errors
- [x] T021 [US1] Integrate billing-day-config component into rates page at `app/[locale]/dashboard/rates/page.tsx` — add the BillingDayConfig component in the rates page layout (as a card/section alongside existing rate templates)

**Checkpoint**: ADMIN_HR can configure billing day. Independently testable.

---

## Phase 4: User Story 2 — ADMIN_HR genera manualmente la nómina mensual (Priority: P1)

**Goal**: ADMIN_HR puede seleccionar un mes/año y generar documentos de nómina para todo el personal con contratos activos

**Independent Test**: Seleccionar mes/año pasado, ejecutar generación, verificar que se crean PDFs en storage y registros en BD

### Implementation for User Story 2

- [x] T022 [US2] Create payroll PDF document template in `src/features/payroll/ui/payroll-document-pdf.tsx` — @react-pdf/renderer Document component with: organization header (name, taxId, address), employee data (name, email, role, area), billing period, shifts table (date, area, shift type, hours, amount per shift), component breakdown table (component name, type, base value, calculated value, applied minutes), calendar multipliers section, contract multiplier note, subtotals (base salary, shifts, monthly components), grand total. Uses PDF primitives from shared/ui/pdf/. Formats currency per organization.currency
- [x] T023 [US2] Implement `generatePayrollAction` in `src/features/admin-hr/api/payroll-actions.ts` — server action that: validates month/year (Zod, must be past period), checks for existing PayrollPeriod (return error if exists and !force), creates PayrollPeriod (status: GENERATING), iterates staff with active contracts, calls calculatePayrollForUser for each, generates PDF via renderToStream for each with total > $0, uploads to storage, creates PayrollDocument records, sends PAYROLL_DOCUMENT_AVAILABLE notification to each STAFF whose document was generated, updates PayrollPeriod with totals and status (COMPLETED/COMPLETED_WITH_ERRORS/FAILED), handles concurrency via GENERATING status lock
- [x] T024 [US2] Create manual payroll generation UI component in `src/features/admin-hr/ui/payroll-generation.tsx` — form with month/year selectors, generate button with isPending/loading state showing progress, AlertDialog for force-regeneration confirmation (FR-014), displays result summary (documents generated, total amount, errors), uses toastActionResult for feedback
- [x] T025 [US2] Integrate payroll generation component into the payroll page at `app/[locale]/dashboard/payroll/page.tsx` — ADMIN_HR section of the payroll dashboard includes manual generation alongside period history. The generation UI is part of the /dashboard/payroll page, NOT the rates page

**Checkpoint**: ADMIN_HR can generate full payroll manually. PDFs stored in Supabase Storage with records in DB.

---

## Phase 5: User Story 3 — Visualización y descarga de documentos de nómina (Priority: P1)

**Goal**: Todos los roles (ADMIN_HR, CHIEF_AREA, STAFF) pueden ver historial de nómina y descargar PDFs filtrados por su ámbito de acceso

**Independent Test**: Generar nómina, luego acceder con cada rol para verificar filtrado correcto y descarga funcional

### Implementation for User Story 3

- [x] T026 [P] [US3] Implement `getPayrollPeriodsAction` in `src/features/payroll/api/payroll-history-actions.ts` — server action that returns PayrollPeriodSummary[] filtered by organizationId and optional year parameter, accessible by ADMIN_HR, CHIEF_AREA, and STAFF
- [x] T027 [P] [US3] Implement `getPayrollDocumentsAction` in `src/features/payroll/api/payroll-history-actions.ts` — server action that returns PayrollDocumentSummary[] for a given periodId with role-based filtering: ADMIN_HR sees all, CHIEF_AREA sees only staff in their areas (via getChiefAccessibleAreaIds), STAFF sees only own document
- [x] T028 [P] [US3] Implement `downloadPayrollDocumentAction` in `src/features/payroll/api/payroll-history-actions.ts` — server action that verifies role-based access, generates signed URL from Supabase Storage (60 min expiry), returns { signedUrl, fileName }
- [x] T029 [US3] Create payroll periods list component in `src/features/payroll/ui/payroll-periods-list.tsx` — displays periods as cards/rows with month name, year, status badge, document count, total amount formatted by currency, click to expand/navigate to documents
- [x] T030 [US3] Create payroll documents table component in `src/features/payroll/ui/payroll-documents-table.tsx` — Shadcn Table with columns: employee name, base salary, shifts amount, total, shifts count, generated date. Download button per row. ADMIN_HR additionally sees regenerate and delete action buttons (wired in US6)
- [x] T031 [US3] Create main payroll page component in `src/features/payroll/ui/payroll-page.tsx` — role-aware page: ADMIN_HR view with full management (periods + documents + generation UI + actions), CHIEF_AREA view with area-filtered documents + download, STAFF view with own documents only + download. Year filter selector. Empty state when no periods exist
- [x] T032 [US3] Create payroll dashboard route in `app/[locale]/dashboard/payroll/page.tsx` — server component that fetches initial data (periods for current year), determines user role, renders PayrollPage with appropriate props. ADMIN_HR sees generation section + history. Other roles see history only
- [x] T033 [US3] Add "Nómina" / "Pagos" / "Mis Pagos" navigation item in `src/widgets/dashboard-sidebar/constants.ts` — add nav item with Receipt icon from lucide-react, path `/dashboard/payroll`, accessible by ADMIN_HR, CHIEF_AREA, STAFF. Label varies by role: "Nómina" for ADMIN_HR, "Pagos" for CHIEF_AREA, "Mis Pagos" for STAFF (using i18n keys)

**Checkpoint**: All 3 roles can view payroll history and download documents. Multi-tenant isolation verified.

---

## Phase 6: User Story 4 — Contenido del documento PDF de nómina (Priority: P2)

**Goal**: El PDF contiene desglose completo y legible: componentes de tarifa, multiplicadores de calendario, multiplicador de contrato, turnos con horarios, y total formateado por moneda

**Independent Test**: Generar PDF para staff con turnos variados (normales, nocturnos, festivos) y verificar que el desglose es correcto y legible

### Implementation for User Story 4

- [x] T034 [US4] Enhance PDF template in `src/features/payroll/ui/payroll-document-pdf.tsx` — add detailed sections: (1) calendar multiplier indicator per shift row showing day type and multiplier value, (2) DISPUTED shifts section listed separately with status badge, (3) contract customMultiplier note showing "Multiplicador personal: 1.2x" when applicable, (4) estimated hours indicator for shifts without actualEndTime, (5) multiple contracts section when staff has >1 active contract with per-contract subtotals
- [x] T035 [P] [US4] Implement currency-aware PDF formatting utility in `src/shared/lib/payment/types.ts` or `src/shared/lib/utils/format.ts` — extend formatCurrency to accept Currency enum and format correctly: CLP uses dot separator ($1.250.000), USD uses comma ($1,250.00), handle all Currency enum values
- [x] T036 [US4] Add PDF footer with generation metadata — page numbers, generation date, document ID for audit trail, "Documento informativo — Sin validez tributaria" disclaimer

**Checkpoint**: PDFs are complete, accurate, and professionally formatted with full component breakdowns.

---

## Phase 7: User Story 5 — Generación automática programada con notificación (Priority: P2)

**Goal**: El sistema genera automáticamente la nómina en la fecha configurada cada mes via API Route + pg_cron, y notifica al ADMIN_HR y STAFF

**Independent Test**: Configurar billingDay, invocar API Route manualmente via curl/Postman, verificar generación + notificaciones recibidas en inbox

### Implementation for User Story 5

- [x] T037 [US5] Create payroll cron API Route in `app/api/cron/generate-payroll/route.ts` — Next.js API Route (POST handler) that: validates CRON_SECRET from Authorization header, determines today's day in America/Santiago timezone (date-fns-tz), queries organizations where billingDay matches today (with day-of-month adjustment for short months per edge-function contract), for each active org: checks if PayrollPeriod already exists for previous month (skip if yes), calls existing `generatePayrollAction` logic (reuses Prisma, calculatePayrollForUser, PDF generation, storage upload — ZERO code duplication with manual generation), creates PAYROLL_GENERATED/PAYROLL_GENERATION_FAILED notifications for ADMIN_HR, creates PAYROLL_DOCUMENT_AVAILABLE notifications for each STAFF. Returns JSON summary of processed/succeeded/failed/skipped. Exception to "no API Routes" constitution rule — this IS a webhook endpoint receiving pg_cron calls
- [x] T038 [US5] Setup pg_cron + pg_net via Supabase migration — enable pg_cron and pg_net extensions, create cron schedule `payroll-auto-generation` at `0 12 * * *` (daily 12:00 UTC), configure pg_net to POST to the Next.js app URL (`{APP_URL}/api/cron/generate-payroll`) with CRON_SECRET from Supabase Vault, set 5-minute timeout
- [x] T039 [US5] Implement ADMIN_HR payroll notification integration — use existing `createNotification()` from `src/features/notifications/lib/notification-service.ts` to create PAYROLL_GENERATED notification for all ADMIN_HR users in the org after successful generation (with actionUrl to `/dashboard/payroll` and summary of documents generated), and PAYROLL_GENERATION_FAILED notification when errors occur (with error summary in description)
- [x] T040 [US5] Implement STAFF payroll notification — after each PayrollDocument is generated (both manual and automatic), create PAYROLL_DOCUMENT_AVAILABLE notification for the corresponding STAFF user with actionUrl to `/dashboard/payroll`. Integrate into generatePayrollAction flow so it works for both manual and cron-triggered generation
- [x] T041 [US5] Update inbox notification filters in `src/features/notifications/ui/inbox-filters.tsx` — add PAYROLL type group to TYPE_GROUPS constant mapping PAYROLL_GENERATED, PAYROLL_GENERATION_FAILED, and PAYROLL_DOCUMENT_AVAILABLE, with appropriate icon (Receipt) and label

**Checkpoint**: Automatic generation runs daily via pg_cron → API Route, processes matching orgs using existing code (zero duplication), notifies ADMIN_HR and STAFF. Testable via manual API Route invocation with curl.

---

## Phase 8: User Story 6 — Regenerar y eliminar documentos individuales (Priority: P2)

**Goal**: ADMIN_HR puede regenerar un documento individual o eliminar PDFs erróneos sin afectar la nómina completa

**Independent Test**: Generar nómina, seleccionar un documento, regenerar, verificar que solo ese cambia. Eliminar otro, verificar que desaparece del storage e historial.

### Implementation for User Story 6

- [x] T042 [US6] Implement `regeneratePayrollDocumentAction` in `src/features/admin-hr/api/payroll-actions.ts` — server action using requireAdminHRWithOrg that: verifies PayrollPeriod belongs to org, deletes existing PayrollDocument + storage file for (period, user), recalculates via calculatePayrollForUser, generates new PDF + uploads + creates new record, updates PayrollPeriod totals, sends PAYROLL_DOCUMENT_AVAILABLE notification to the affected STAFF user
- [x] T043 [US6] Implement `deletePayrollDocumentAction` in `src/features/admin-hr/api/payroll-actions.ts` — server action using requireAdminHRWithOrg that: verifies PayrollDocument belongs to org, deletes file from Supabase Storage, deletes PayrollDocument record, decrements PayrollPeriod totalDocuments and totalAmount
- [x] T044 [US6] Wire regenerate and delete actions into documents table in `src/features/payroll/ui/payroll-documents-table.tsx` — add action dropdown menu (visible only for ADMIN_HR) per document row with: "Regenerar" option that calls regeneratePayrollDocumentAction with loading state, "Eliminar" option with AlertDialog confirmation ("Esta acción eliminará el documento permanentemente") that calls deletePayrollDocumentAction. Refresh table after action
- [x] T045 [US6] Add bulk delete capability for ADMIN_HR — checkbox selection in documents table + "Eliminar seleccionados" button with AlertDialog confirmation, calls deletePayrollDocumentAction for each selected document sequentially

**Checkpoint**: ADMIN_HR can fix errors by regenerating individual documents or cleaning up via delete. Full CRUD on payroll documents.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Build verification, edge case hardening, documentation

- [x] T046 Run `npm run build` and fix any TypeScript compilation errors across all new files
- [x] T047 Run `npm run lint` and fix any ESLint/Prettier issues across all new files
- [x] T048 [P] Verify multi-tenant isolation — ensure all new Prisma queries include organizationId filter, all Server Actions use auth guards, storage paths include orgId, no cross-org data leaks in payroll history actions
- [x] T049 [P] Verify i18n completeness — ensure no hardcoded strings in any new component (react/jsx-no-literals), all keys exist in both es.json and en.json, currency/date formatting respects locale
- [x] T050 [P] Handle edge cases in payment calculation — validate: staff with no contract (skip and log to PayrollPeriod.errorLog), contract that started mid-period (prorate), contract that ended mid-period (prorate), shift without actualEndTime (use endTime, mark estimated), DISPUTED payments excluded from totals, multiple contracts per user (consolidate), concurrent generation prevention via GENERATING status
- [x] T051 Run quickstart.md manual verification checklist — test all 9 scenarios: billing day config, generate payroll, download document, regenerate individual, delete document, CHIEF_AREA view, STAFF view, cross-org isolation, STAFF receives notification when document is ready

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 (schema must exist for repository/calc engine)
- **Phase 3 (US1)**: Depends on Phase 2 (needs payroll-actions.ts foundation and i18n keys)
- **Phase 4 (US2)**: Depends on Phase 2 (needs payment calc engine, PDF primitives, storage)
- **Phase 5 (US3)**: Depends on Phase 4 (needs generated documents to display/download)
- **Phase 6 (US4)**: Depends on Phase 4 (enhances existing PDF template)
- **Phase 7 (US5)**: Depends on Phase 4 (reuses generatePayrollAction logic in API Route)
- **Phase 8 (US6)**: Depends on Phase 5 (needs documents table UI to add action buttons)
- **Phase 9 (Polish)**: Depends on all previous phases

### User Story Dependencies

```
Phase 1 (Setup) → Phase 2 (Foundation)
                      │
                      ├── Phase 3 (US1: Billing Day Config) ─── standalone
                      │
                      ├── Phase 4 (US2: Manual Generation) ──┬── Phase 5 (US3: History/Download)
                      │                                       │        │
                      │                                       │        └── Phase 8 (US6: Regenerate/Delete)
                      │                                       │
                      │                                       ├── Phase 6 (US4: PDF Content)
                      │                                       │
                      │                                       └── Phase 7 (US5: Auto Generation via API Route)
                      │
                      └── Phase 9 (Polish)
```

### Parallel Opportunities

**Within Phase 2 (Foundational)**:
- T012 (repository), T013 (storage), T014-T016 (PDF primitives), T017 (i18n) can all run in parallel
- T007 (evaluator) → T008 (shift calc) → T009 (shift action) → T010 (shift hook) → T011 (payroll calc) is a sequential chain

**After Phase 2**:
- US1 (Phase 3) and US2 (Phase 4) can run in parallel since US1 only needs actions + UI while US2 needs calc engine + PDF

**Within Phase 5 (US3)**:
- T026, T027, T028 (server actions) can all run in parallel
- UI components (T029-T031) depend on actions being ready

---

## Parallel Example: Foundational Phase

```bash
# Sequential chain (calc engine + shift hook):
T007 (component evaluator) → T008 (shift payment calc) → T009 (shift payment action) → T010 (shift completion hook) → T011 (payroll calc)

# Parallel with above:
T012 (payroll repository)
T013 (storage extension)
T014 + T015 + T016 (PDF primitives)
T017 (i18n keys)
```

## Parallel Example: User Story 3

```bash
# Parallel server actions:
T026 (getPayrollPeriodsAction)
T027 (getPayrollDocumentsAction)
T028 (downloadPayrollDocumentAction)

# Sequential UI (after actions):
T029 (periods list) → T030 (documents table) → T031 (main page) → T032 (route) → T033 (nav item)
```

---

## Implementation Strategy

### MVP First (US1 + US2 + US3)

1. Complete Phase 1: Setup (schema, deps, bucket)
2. Complete Phase 2: Foundational (calc engine, shift hook, repository, storage, PDF, i18n)
3. Complete Phase 3: US1 — Billing day config
4. Complete Phase 4: US2 — Manual generation
5. Complete Phase 5: US3 — History + download
6. **STOP and VALIDATE**: All 3 P1 stories independently testable, ADMIN_HR can configure + generate + view/download

### Incremental Delivery

7. Phase 6: US4 — Enhanced PDF content (richer document)
8. Phase 7: US5 — Automatic generation (API Route + pg_cron + notifications)
9. Phase 8: US6 — Regenerate/delete individual documents
10. Phase 9: Polish — Build, lint, edge cases, manual test

### Suggested MVP Scope

**US1 + US2 + US3** (Phases 1-5, tasks T001-T033) deliver a complete, usable payroll system where ADMIN_HR can configure billing date, generate payroll manually, and all roles can view/download their documents. This is a fully functional MVP without automation or individual document management.

---

## Notes

- [P] tasks = different files, no dependencies on concurrent tasks
- [Story] label maps to spec.md user stories (US1-US6)
- All Server Actions MUST use auth guards (requireAdminHRWithOrg or role-aware check)
- All Prisma queries MUST include organizationId filter
- All UI strings MUST use useTranslations (no literals in JSX)
- PDF generation uses @react-pdf/renderer server-side via renderToStream
- API Route for cron (US5) replaces original Edge Function approach — reuses 100% of existing code via Prisma (zero duplication)
- pg_cron POSTs to `{APP_URL}/api/cron/generate-payroll` instead of Supabase Edge Function
- STAFF receives PAYROLL_DOCUMENT_AVAILABLE notification when their document is generated (both manual and automatic)
- Commit after each task or logical group for safe progress tracking
- Total tasks: 51
