# Contract: Payroll Progress

## API Route (SSE): `/api/payroll-progress/[periodId]`

**Location**: `app/[locale]/api/payroll-progress/route.ts`
**Auth**: Session cookie validation (NextAuth `getServerSession`)

### Request
```
GET /api/payroll-progress?periodId={id}
Accept: text/event-stream
```

### Response Stream
```
event: progress
data: {"current": 42, "total": 110, "status": "generating"}

event: progress
data: {"current": 110, "total": 110, "status": "completed"}

event: error
data: {"message": "Error en documento para Juan Pérez"}

event: done
data: {"documentsGenerated": 108, "totalAmount": 152457142.62, "errors": 2}
```

### Server-Side Progress Store

**Location**: `src/shared/lib/payment/payroll-progress.ts`

```typescript
interface PayrollProgress {
  current: number
  total: number
  status: 'generating' | 'completed' | 'failed'
  errors: string[]
  startedAt: Date
}

// In-memory store (same Node process)
const progressStore = new Map<string, PayrollProgress>()

export function updateProgress(periodId: string, progress: Partial<PayrollProgress>): void
export function getProgress(periodId: string): PayrollProgress | undefined
export function clearProgress(periodId: string): void
```

### Integration with `generate-payroll-core.ts`

```typescript
// Add onProgress callback to generatePayrollForOrganization
interface GeneratePayrollParams {
  // ... existing params
  onProgress?: (current: number, total: number) => void
}

// In the for loop (line ~100):
for (const user of usersWithContracts) {
  // ... existing logic
  documentsGenerated++
  params.onProgress?.(documentsGenerated, usersWithContracts.length)
}
```

### Cleanup
- Progress entry removed 60s after completion
- If no SSE client connects within 30s of start, entry still cleaned up on completion
- On server restart, Map is empty (no persistence needed)

### Edge Cases
- Browser disconnect → SSE connection closes, progress store unaffected
- Browser reconnect → new SSE connection picks up current progress from store
- Multiple tabs → each gets its own SSE connection reading same store entry
