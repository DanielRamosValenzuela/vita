# Data Model: Bandeja de Entrada y Sistema de Notificaciones

**Date**: 2026-02-17
**Branch**: `003-inbox-notifications`

## Prisma Schema Addition

### NotificationType Enum

```prisma
enum NotificationType {
  INVITATION_PENDING
  AREA_ASSIGNED
  SHIFT_CREATED
  SHIFT_UPDATED
  SHIFT_CANCELLED
  GENERAL
}
```

### Notification Model

```prisma
model Notification {
  id             String           @id @default(cuid())
  userId         String           // Recipient
  actorId        String?          // Who triggered the action (null for system-generated)
  organizationId String?          // For display context (which org generated this)
  type           NotificationType
  title          String           // Pre-rendered title (e.g., "Juan Pérez te invitó a Hospital Central")
  description    String?          // Optional additional detail
  actionUrl      String           // Where to navigate on click (e.g., "/dashboard/profile?section=invitations")
  isRead         Boolean          @default(false)
  createdAt      DateTime         @default(now())

  user         User          @relation("NotificationRecipient", fields: [userId], references: [id], onDelete: Cascade)
  actor        User?         @relation("NotificationActor", fields: [actorId], references: [id], onDelete: SetNull)
  organization Organization? @relation(fields: [organizationId], references: [id], onDelete: SetNull)

  @@index([userId, isRead, createdAt(sort: Desc)])
  @@index([userId, createdAt(sort: Desc)])
  @@index([userId, type])
}
```

### User Model Changes

Add two new relation fields to the existing `User` model:

```prisma
model User {
  // ... existing fields ...
  notificationsReceived Notification[] @relation("NotificationRecipient")
  notificationsActed    Notification[] @relation("NotificationActor")
}
```

### Organization Model Changes

Add notification relation to the existing `Organization` model:

```prisma
model Organization {
  // ... existing fields ...
  notifications Notification[]
}
```

## Entity Relationships

```
User (recipient) ←── 1:N ──→ Notification
User (actor)     ←── 1:N ──→ Notification (optional)
Organization     ←── 1:N ──→ Notification (optional)
```

- A notification always has a recipient (`userId`, required).
- A notification optionally has an actor (`actorId`, nullable — for system-generated notifications or if the actor user is deleted).
- A notification optionally references an organization (`organizationId`, nullable — for display context like "from Hospital Central").
- Deleting a User cascades to their received notifications. Actor reference is set to null on user deletion.
- Deleting an Organization sets the organizationId to null (notification remains visible but without org context).

## Indexes

| Index | Purpose |
|-------|---------|
| `(userId, isRead, createdAt DESC)` | Primary query: unread notifications for user, sorted by newest. Also used for unread count (`COUNT WHERE isRead=false`). |
| `(userId, createdAt DESC)` | All notifications for user (inbox page, all statuses). |
| `(userId, type)` | Filter by notification type. |

## Field Details

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `id` | String (cuid) | Yes | auto | Primary key |
| `userId` | String | Yes | - | FK to User. Recipient of notification. |
| `actorId` | String | No | null | FK to User. Who triggered the event. Null if system-generated or actor deleted. |
| `organizationId` | String | No | null | FK to Organization. Display context. Null if org deleted. |
| `type` | NotificationType | Yes | - | Determines icon, color, and toast message template. |
| `title` | String | Yes | - | Pre-rendered at creation time. Includes actor name and context. Immutable. |
| `description` | String | No | null | Additional detail (e.g., shift date/time, area name). |
| `actionUrl` | String | Yes | - | Relative URL path for click navigation. Stored without locale prefix. |
| `isRead` | Boolean | Yes | false | Toggled by user action. Only transition: false → true (no unread toggle). |
| `createdAt` | DateTime | Yes | now() | Immutable creation timestamp. Used for sorting and "recent" filtering. |

## NotificationType Values and Behaviors

| Type | Icon (lucide) | Badge Color | Action URL Pattern | Title Template |
|------|---------------|-------------|-------------------|----------------|
| `INVITATION_PENDING` | `Mail` | blue | `/dashboard/profile?section=invitations` | "{actor} te invitó a {organization}" |
| `AREA_ASSIGNED` | `LayoutGrid` | green | `/dashboard/areas` | "{actor} te asignó al área {areaName}" |
| `SHIFT_CREATED` | `Calendar` | purple | `/dashboard/shifts` | "{actor} te asignó un turno el {date}" |
| `SHIFT_UPDATED` | `RefreshCw` | orange | `/dashboard/shifts` | "{actor} modificó tu turno del {date}" |
| `SHIFT_CANCELLED` | `XCircle` | red | `/dashboard/shifts` | "{actor} canceló tu turno del {date}" |
| `GENERAL` | `Bell` | gray | `/dashboard/inbox` | Varies |

## State Transitions

Notification lifecycle is simple and linear:

```
Created (isRead: false) → Read (isRead: true) → Deleted (hard delete)
```

- No state reversal (cannot mark as unread).
- Content is immutable after creation.
- Hard delete on user request (FR-007).
- Cascade delete when recipient User is deleted.
