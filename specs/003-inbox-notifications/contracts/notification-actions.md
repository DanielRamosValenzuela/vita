# Server Action Contracts: Notification System

**Date**: 2026-02-17
**Location**: `src/features/notifications/api/notification-actions.ts`

## Actions

### getNotificationsAction

Fetch paginated notifications for the authenticated user.

```typescript
'use server'

interface GetNotificationsParams {
  cursor?: string        // Notification ID for cursor-based pagination
  limit?: number         // Default: 20, max: 50
  filter?: 'all' | 'unread' | 'read'  // Default: 'all'
  type?: NotificationType  // Optional type filter
}

async function getNotificationsAction(
  params: GetNotificationsParams
): Promise<ActionResult<{
  notifications: NotificationWithActor[]
  nextCursor: string | null
}>>
```

**Auth**: `requireAuth()` — any authenticated org role (ADMIN_HR, CHIEF_AREA, STAFF).
**Filter**: `where: { userId: session.id }` + optional isRead/type filters.
**Sort**: `createdAt DESC`.
**Pagination**: Cursor-based using `id` field.

---

### getUnreadCountAction

Return the count of unread notifications for the authenticated user. Used by sidebar badge.

```typescript
'use server'

async function getUnreadCountAction(): Promise<ActionResult<number>>
```

**Auth**: `requireAuth()`.
**Query**: `prisma.notification.count({ where: { userId, isRead: false } })`.

---

### markNotificationReadAction

Mark a single notification as read.

```typescript
'use server'

async function markNotificationReadAction(
  notificationId: string
): Promise<ActionResult<null>>
```

**Auth**: `requireAuth()`.
**Validation**: Notification must exist and belong to the authenticated user.
**Mutation**: `update({ where: { id, userId }, data: { isRead: true } })`.

---

### markAllNotificationsReadAction

Mark all unread notifications as read for the authenticated user.

```typescript
'use server'

async function markAllNotificationsReadAction(): Promise<ActionResult<{ count: number }>>
```

**Auth**: `requireAuth()`.
**Mutation**: `updateMany({ where: { userId, isRead: false }, data: { isRead: true } })`.
**Returns**: Count of notifications marked as read.

---

### deleteNotificationAction

Hard-delete a single notification.

```typescript
'use server'

async function deleteNotificationAction(
  notificationId: string
): Promise<ActionResult<null>>
```

**Auth**: `requireAuth()`.
**Validation**: Notification must exist and belong to the authenticated user.
**Mutation**: `delete({ where: { id, userId } })`.

---

## Service Contract (Internal)

### createNotification

Helper function called by other Server Actions to create notifications. NOT a Server Action itself.

```typescript
// src/features/notifications/lib/notification-service.ts

interface CreateNotificationParams {
  userId: string           // Recipient
  actorId: string          // Who triggered the action
  organizationId?: string  // Optional org context
  type: NotificationType
  title: string            // Pre-rendered title with actor name
  description?: string     // Additional detail
  actionUrl: string        // Relative URL (no locale prefix)
}

async function createNotification(
  params: CreateNotificationParams
): Promise<void>
```

**Usage**: Called inline in existing Server Actions after successful operations:
- `inviteChiefAction` / `inviteStaffAction` → `INVITATION_PENDING`
- `assignChiefsToAreaAction` / `assignStaffToAreaAction` → `AREA_ASSIGNED`
- `createShiftAction` → `SHIFT_CREATED`
- `updateShiftAction` → `SHIFT_UPDATED`
- `deleteShiftAction` → `SHIFT_CANCELLED`

**Error handling**: Notification creation failures are logged but do not fail the parent operation. The primary action (invite, shift create, etc.) must always succeed even if notification insert fails.

---

## Notification Repository Contract

### Location: `src/entities/notification/lib/notification-repository.ts`

```typescript
// Data access functions (no auth checks — callers handle auth)

async function createNotificationRecord(
  data: Prisma.NotificationCreateInput
): Promise<Notification>

async function getNotificationsByUser(
  userId: string,
  options: { cursor?: string; limit: number; isRead?: boolean; type?: NotificationType }
): Promise<{ notifications: NotificationWithActor[]; nextCursor: string | null }>

async function getUnreadCount(userId: string): Promise<number>

async function markAsRead(id: string, userId: string): Promise<Notification>

async function markAllAsRead(userId: string): Promise<number>

async function deleteNotification(id: string, userId: string): Promise<void>

async function getRecentUnread(
  userId: string,
  sinceMinutes: number
): Promise<NotificationWithActor[]>
```

### Types

```typescript
// src/entities/notification/lib/types.ts

interface NotificationWithActor {
  id: string
  userId: string
  actorId: string | null
  organizationId: string | null
  type: NotificationType  // Prisma enum
  title: string
  description: string | null
  actionUrl: string
  isRead: boolean
  createdAt: Date
  actor: {
    id: string
    name: string
    image: string | null
    customImage: string | null
  } | null
  organization: {
    id: string
    name: string
  } | null
}
```
