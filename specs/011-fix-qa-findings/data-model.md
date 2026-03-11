# Data Model: 011-fix-qa-findings

**Date**: 2026-03-10

## Existing Models (No Schema Changes Needed)

### ShiftPayment (already in schema)
```
ShiftPayment {
  id                    String     @id @default(cuid())
  shiftId               String     @unique
  totalAmount           Float
  baseAmount            Float
  calendarMultiplier    Float      @default(1.0)
  finalAmount           Float
  minutesWorked         Int
  isPartialCompletion   Boolean    @default(false)
  status                PaymentStatus @default(PENDING)
  calculatedAt          DateTime   @default(now())
  approvedAt            DateTime?
  approvedBy            String?
  paidAt                DateTime?
  notes                 String?
  → shift: Shift (1:1 via shiftId)
  → breakdowns: ShiftPaymentBreakdown[]
}
```

### ShiftPaymentBreakdown (already in schema)
```
ShiftPaymentBreakdown {
  id              String
  shiftPaymentId  String
  componentId     String
  componentName   String
  componentType   ComponentType
  baseValue       Float
  calculatedValue Float
  appliedMinutes  Int?
  notes           String?
  → shiftPayment: ShiftPayment
  → component: RateComponent
}
```

### ShiftSwapRequest (already in schema)
```
ShiftSwapRequest {
  id               String
  organizationId   String
  type             SwapRequestType (DIRECT | OPEN)
  status           SwapRequestStatus (PENDING_PEER | PENDING_SELECTION | PENDING_CHIEF | APPROVED | REJECTED_BY_PEER | REJECTED_BY_CHIEF | CANCELLED | EXPIRED)
  requesterId      String
  requesterShiftId String
  targetUserId     String?
  targetShiftId    String?
  areaId           String
  reason           String?
  chiefId          String?
  chiefNote        String?
  peerRespondedAt  DateTime?
  chiefRespondedAt DateTime?
  expiresAt        DateTime?
  → offers: ShiftSwapOffer[]
}
```

### ShiftSwapOffer (already in schema)
```
ShiftSwapOffer {
  id             String
  swapRequestId  String
  offererId      String
  offeredShiftId String
  status         SwapOfferStatus (PENDING | ACCEPTED | REJECTED | WITHDRAWN)
  note           String?
  → swapRequest: ShiftSwapRequest
  → offerer: User
  → offeredShift: Shift
}
```

## Schema Changes Required

### 1. Remove CHIEF_SECTOR from Role enum

```prisma
// BEFORE
enum Role {
  SUPER_ADMIN
  ADMIN_HR
  CHIEF_AREA
  CHIEF_SECTOR    // ← REMOVE
  STAFF
}

// AFTER
enum Role {
  SUPER_ADMIN
  ADMIN_HR
  CHIEF_AREA
  STAFF
}
```

**Migration note**: Verify 0 users have role=CHIEF_SECTOR before migration. The `UserSector` table is preserved.

### 2. Add PayrollPeriodStatus value (if not exists)

```prisma
enum PayrollPeriodStatus {
  GENERATING
  COMPLETED
  COMPLETED_WITH_ERRORS  // Verify this exists
  FAILED                 // Verify this exists
}
```

**Note**: `generate-payroll-core.ts` already uses `COMPLETED_WITH_ERRORS` and `FAILED` as status strings. Verify they exist in the enum.

## State Transitions

### Shift Status Lifecycle
```
SCHEDULED → COMPLETED (via batch completion by CHIEF)
SCHEDULED → IN_PROGRESS → COMPLETED (future: real-time tracking)
SCHEDULED → CANCELLED (manual cancellation)
SCHEDULED → NO_SHOW (post-fact marking)
COMPLETED → (terminal, creates ShiftPayment)
```

### ShiftSwapRequest Lifecycle
```
(create) → PENDING_PEER
PENDING_PEER → PENDING_SELECTION (if type=OPEN, offers received)
PENDING_SELECTION → PENDING_CHIEF (requester accepts an offer)
PENDING_PEER → PENDING_CHIEF (if type=DIRECT, target accepts)
PENDING_CHIEF → APPROVED (CHIEF approves → shifts swapped)
PENDING_CHIEF → REJECTED_BY_CHIEF
PENDING_PEER → REJECTED_BY_PEER
ANY → CANCELLED (requester cancels)
ANY → EXPIRED (expiresAt passed)
```

### ShiftPayment Lifecycle
```
(create at shift completion) → PENDING
PENDING → CALCULATED (auto, after calculation)
CALCULATED → APPROVED (by CHIEF/ADMIN)
APPROVED → PAID (via payroll)
ANY → DISPUTED
```

## Relationships Summary

```
User ──1:N── Shift ──1:1── ShiftPayment ──1:N── ShiftPaymentBreakdown
                                                        │
                                                        └──→ RateComponent

User ──1:N── ShiftSwapRequest (as requester)
User ──1:N── ShiftSwapRequest (as target)
User ──1:N── ShiftSwapOffer (as offerer)
ShiftSwapRequest ──1:N── ShiftSwapOffer

User ──N:M── Sector (via UserSector, kept as metadata)
CHIEF_AREA + UserSector → badge "Sector: X" in UI
```
