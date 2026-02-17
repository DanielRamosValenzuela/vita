# Research: Bandeja de Entrada y Sistema de Notificaciones

**Date**: 2026-02-17
**Branch**: `003-inbox-notifications`

## R1: Notification Data Storage Strategy

**Decision**: New `Notification` Prisma model in PostgreSQL (not extending OrganizationInvitation).

**Rationale**: The current system has no Notification model — it queries `OrganizationInvitation` and transforms results into `PendingNotification` objects in memory. This approach doesn't scale to multiple notification types (shifts, areas). A dedicated model provides:
- Proper indexing for user+read status queries
- Persistence independent of source entities
- Immutable records (spec clarification: content doesn't change when source event resolves)
- Actor reference for "Juan Pérez te asignó un turno" messages

**Alternatives considered**:
- **Extend OrganizationInvitation**: Rejected — couples notification lifecycle to invitation lifecycle, doesn't support shift/area notifications.
- **JSON column on User**: Rejected — no indexing, no pagination, no multi-tenant safety.
- **External service (Novu, etc.)**: Rejected — adds dependency, VITA is early-stage, overkill for current scale.

## R2: Notification Creation Pattern

**Decision**: Synchronous `createNotification()` helper function called inline within existing Server Actions, after the primary operation succeeds.

**Rationale**: Since there's no real-time requirement and notifications only need to exist by the next page load, creating them synchronously within the same Server Action is the simplest approach. The `createNotification()` helper lives in `features/notifications/lib/notification-service.ts` and is called from `features/admin-hr`, `features/area`, and `features/shifts` actions.

**Alternatives considered**:
- **Event bus / pub-sub**: Rejected — adds architectural complexity (new dependency) for a synchronous use case. The number of hook points is small (5 Server Actions).
- **Database triggers**: Rejected — couples notification logic to DB layer, harder to test and maintain, constitution prohibits manual SQL DDL.
- **Background job queue**: Rejected — no real-time requirement, overkill for synchronous inserts.

**FSD compliance note**: `features/notifications/lib/notification-service.ts` is imported by other `features/*` actions. This is a cross-feature import. To maintain FSD purity, the service could live in `entities/notification/` instead. However, since it orchestrates a write operation (not just data access), placing it in `features/notifications/lib/` is more appropriate. The alternative is a `shared` utility, but that would violate the "shared doesn't know about entities" rule. **Decision**: Accept the cross-feature import as a pragmatic trade-off, documented in Complexity Tracking.

## R3: Sidebar Badge Implementation

**Decision**: Extend `NavItem` type with optional `badge?: number` field. Fetch unread count in dashboard layout (server component) and pass to `DashboardShell` → sidebar.

**Rationale**: The dashboard layout already fetches `getUserPendingNotifications()`. Instead, we'll fetch the unread notification count via a lightweight `COUNT(*)` query and pass it down. The sidebar renders the badge next to the "Bandeja de entrada" item when count > 0.

**Alternatives considered**:
- **Client-side polling**: Rejected — adds complexity, constitution prefers Server Components for server state.
- **Zustand global store**: Rejected — badge needs server data, not client state. Would require hydration.
- **Separate API route**: Rejected — constitution prohibits API Routes except for webhooks.

## R4: Toast System Extension

**Decision**: Modify `PendingNotificationsToaster` to receive all recent notifications (not just invitations) and handle each type with appropriate message and redirect URL.

**Rationale**: The existing toaster already:
- Receives notifications as props from dashboard layout
- Deduplicates via sessionStorage
- Limits to 3 toasts per load
- Navigates on click

We simply extend it to handle the new `NotificationType` values with a switch-case for message generation and redirect URLs.

**Alternatives considered**:
- **Separate toaster component**: Rejected — duplicates deduplication logic, no benefit.
- **Replace with client-side fetch**: Rejected — current server-fetch pattern is simpler and works.

## R5: Multi-Tenant Isolation for Notifications

**Decision**: Notifications are scoped by `userId` (not `organizationId`). The `organizationId` field on the Notification model is for display purposes (showing which org generated the notification), not for access control.

**Rationale**: A user only sees their own notifications. The `userId` field in the `where` clause is sufficient for isolation. Adding `organizationId` to the access control query would be redundant and problematic for users who might change organizations. The `organizationId` on the notification is stored at creation time for display context ("Invitación de Hospital Central") and is immutable.

**Alternatives considered**:
- **Filter by organizationId**: Rejected — user is the access boundary, not org. A user may have notifications from a previous org that are still relevant.

## R6: Pagination Strategy

**Decision**: Cursor-based pagination using `createdAt` + `id` as cursor, loading 20 items per page with a "Load more" button.

**Rationale**: Notifications are naturally ordered by `createdAt DESC`. Cursor-based pagination is efficient with the `@@index([userId, isRead, createdAt])` composite index. "Load more" is simpler than infinite scroll (no intersection observer complexity) and works well for a TODO-list metaphor.

**Alternatives considered**:
- **Offset-based pagination**: Rejected — less performant for large datasets, suffers from shifting pages when new notifications arrive.
- **Infinite scroll**: Rejected — more complex implementation (IntersectionObserver), premature for MVP.
