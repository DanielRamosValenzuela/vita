# Quickstart: Bandeja de Entrada y Sistema de Notificaciones

**Branch**: `003-inbox-notifications`

## Prerequisites

- Node.js, npm, PostgreSQL (Supabase) running
- `npm install` completed
- `npx prisma generate` after schema changes

## Implementation Order

### Phase 1: Data Model + Repository (Foundation)

1. Add `NotificationType` enum and `Notification` model to `prisma/schema.prisma`
2. Add relation fields to `User` and `Organization` models
3. Run `npx prisma db push` to apply schema
4. Create `notification-repository.ts` in `src/entities/notification/lib/`
5. Extend `types.ts` with new notification types and `NotificationWithActor` interface

### Phase 2: Notification Service + Server Actions

1. Create `notification-service.ts` in `src/features/notifications/lib/`
2. Create `notification-actions.ts` in `src/features/notifications/api/`
3. Add i18n keys to `messages/es.json` and `messages/en.json`

### Phase 3: Inbox UI

1. Create inbox page at `app/[locale]/dashboard/inbox/page.tsx`
2. Create `inbox-page.tsx` in `src/features/notifications/ui/`
3. Create `notification-list.tsx` and `notification-item.tsx` components
4. Create `inbox-filters.tsx` for status/type filtering

### Phase 4: Sidebar Integration

1. Extend `NavItem` type with optional `badge` field
2. Add "Bandeja de entrada" item to sidebar constants
3. Fetch unread count in dashboard layout
4. Pass count to `DashboardShell` for badge rendering

### Phase 5: Hook into Existing Actions

1. Add `createNotification()` call to `inviteChiefAction` and `inviteStaffAction`
2. Add `createNotification()` call to `assignChiefsToAreaAction` and `assignStaffToAreaAction`
3. Add `createNotification()` call to `createShiftAction`, `updateShiftAction`, `deleteShiftAction`

### Phase 6: Toast Extension

1. Modify `PendingNotificationsToaster` to query from Notification model
2. Update dashboard layout to pass recent notifications
3. Add switch cases for all notification types

### Phase 7: Polish

1. Run `npm run lint` and fix errors
2. Run `npm run build` and fix type errors
3. Update `docs/vita-workflows.md`

## Key Files to Modify

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add Notification model + enum |
| `src/entities/notification/lib/types.ts` | Extend types |
| `src/entities/notification/lib/pending-notifications.ts` | Rewrite to query Notification table |
| `src/widgets/dashboard-sidebar/constants.ts` | Add inbox nav item |
| `src/widgets/dashboard-sidebar/types.ts` | Add badge to NavItem |
| `src/features/admin-hr/api/invitation-actions.ts` | Add notification hook |
| `src/features/area/api/area-actions.ts` | Add notification hook |
| `src/features/shifts/api/shift-actions.ts` | Add notification hook |
| `src/features/notifications/ui/pending-notifications-toaster.tsx` | Extend for all types |
| `app/[locale]/dashboard/layout.tsx` | Fetch unread count |

## Key Files to Create

| File | Purpose |
|------|---------|
| `src/entities/notification/lib/notification-repository.ts` | Prisma data access |
| `src/features/notifications/lib/notification-service.ts` | createNotification helper |
| `src/features/notifications/api/notification-actions.ts` | Server Actions |
| `src/features/notifications/ui/inbox-page.tsx` | Main inbox component |
| `src/features/notifications/ui/notification-list.tsx` | List component |
| `src/features/notifications/ui/notification-item.tsx` | Item row component |
| `src/features/notifications/ui/inbox-filters.tsx` | Filter tabs |
| `app/[locale]/dashboard/inbox/page.tsx` | Route page |

## Verification

```bash
npm run lint    # No new lint errors
npm run build   # Build succeeds
```

Manual test flow:
1. Login as ADMIN_HR → invite a user → verify notification appears in invitee's inbox
2. Login as CHIEF → create shift for STAFF → verify notification in STAFF's inbox
3. Verify badge count in sidebar updates when marking as read
4. Verify toast shows for recent notifications on page load
