# Contract: Shift Swap

## Server Actions

**Location**: `src/features/swap/api/swap-actions.ts`

---

### `createSwapRequestAction`

**Auth**: STAFF only (requireAuth + role check)

**Input**:
```typescript
{
  shiftId: string       // The shift the STAFF wants to swap
  type: 'DIRECT' | 'OPEN'
  targetUserId?: string // Required if type=DIRECT
  reason?: string
}
```

**Validation**:
- Shift must belong to the requesting user
- Shift must be in the future (startTime > now)
- Shift must be status SCHEDULED
- No existing active swap request for same shift
- If DIRECT: targetUser must be in same area

**Logic**:
1. Create `ShiftSwapRequest` with status `PENDING_PEER`
2. Set `expiresAt` = shift startTime - 24h (auto-expire before shift)
3. If DIRECT: notify targetUser
4. If OPEN: notify all STAFF in same area

**Output**: `ActionResult<{ requestId: string }>`

---

### `createSwapOfferAction`

**Auth**: STAFF only

**Input**:
```typescript
{
  swapRequestId: string
  offeredShiftId: string
  note?: string
}
```

**Validation**:
- Request must be in PENDING_PEER or PENDING_SELECTION status
- Offerer must be in same area as request
- Offerer cannot be the requester
- Offered shift must belong to offerer
- Offered shift must be status SCHEDULED
- No duplicate offer from same offerer

**Logic**:
1. Create `ShiftSwapOffer` with status `PENDING`
2. Update request status to `PENDING_SELECTION` (if first offer for OPEN type)
3. Notify requester

**Output**: `ActionResult<{ offerId: string }>`

---

### `acceptSwapOfferAction`

**Auth**: STAFF only (must be the requester)

**Input**:
```typescript
{
  offerId: string
}
```

**Logic**:
1. Accept the offer (status → ACCEPTED)
2. Reject all other offers for this request (status → REJECTED)
3. Set request.targetUserId and request.targetShiftId from offer
4. Update request status to `PENDING_CHIEF`
5. Set peerRespondedAt
6. Notify area CHIEFs

**Output**: `ActionResult<{ requestId: string }>`

---

### `approveSwapAction`

**Auth**: CHIEF_AREA with area access

**Input**:
```typescript
{
  requestId: string
  approved: boolean
  note?: string
}
```

**Logic if approved**:
1. Swap the shifts: update userId on both shifts (requesterShift.userId ↔ targetShift.userId)
2. Update request status to `APPROVED`
3. Set chiefId, chiefNote, chiefRespondedAt
4. Notify both STAFF users
5. Revalidate calendar paths

**Logic if denied**:
1. Update request status to `REJECTED_BY_CHIEF`
2. Set chiefId, chiefNote, chiefRespondedAt
3. Notify both STAFF users

**Output**: `ActionResult<{ status: string }>`

---

### `getSwapRequestsAction`

**Auth**: Any authenticated user

**Input**:
```typescript
{
  status?: SwapRequestStatus[]
  areaId?: string
  role: 'requester' | 'approver' | 'all'
}
```

**Logic**:
- STAFF: own requests (as requester or target)
- CHIEF: requests in accessible areas (for approval)
- ADMIN_HR: all requests in org

**Output**: `ActionResult<SwapRequestWithDetails[]>`

---

### `cancelSwapRequestAction`

**Auth**: STAFF (must be requester)

**Input**: `{ requestId: string }`

**Logic**:
1. Can only cancel if status is PENDING_PEER, PENDING_SELECTION, or PENDING_CHIEF
2. Update status to CANCELLED
3. Withdraw all pending offers
4. Notify relevant users

**Output**: `ActionResult<void>`

## Notification Types

| Event | Recipient | Type |
|-------|-----------|------|
| New swap request (OPEN) | All STAFF in area | SWAP_REQUEST_CREATED |
| New swap request (DIRECT) | Target STAFF | SWAP_REQUEST_CREATED |
| New offer received | Requester | SWAP_OFFER_RECEIVED |
| Offer accepted | Offerer | SWAP_OFFER_ACCEPTED |
| Pending CHIEF approval | Area CHIEFs | SWAP_PENDING_APPROVAL |
| Swap approved | Both STAFF | SWAP_APPROVED |
| Swap rejected by CHIEF | Both STAFF | SWAP_REJECTED |
| Swap cancelled | Affected users | SWAP_CANCELLED |
