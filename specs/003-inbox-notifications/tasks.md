# Tasks: Bandeja de Entrada y Sistema de Notificaciones

**Input**: Design documents from `/specs/003-inbox-notifications/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in specification. Tests are NOT included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. Since the project already has a partial notification system (entity types, toast toaster, invitation-only pending notifications), tasks build on existing infrastructure.

**Existing Infrastructure (already done)**:
- Toast system: `PendingNotificationsToaster` component exists and works for invitations
- Entity structure: `src/entities/notification/lib/types.ts` and `pending-notifications.ts` exist
- Constants: `src/shared/lib/constants/notifications.ts` with limits
- Shadcn components: Badge, Button, AlertDialog, Tabs all installed
- Auth guards: `requireAuth`, `requireAdminHRWithOrg`, `requireAdminHROrChiefArea` all exist
- Dashboard layout: Integrates notification fetching and toaster rendering
- i18n keys: `notifications.invitationPending` and `notifications.actions.view` exist in both locales

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- FSD structure: `src/shared/`, `src/entities/`, `src/features/`, `src/widgets/`
- Entity code: `src/entities/notification/`
- Feature code: `src/features/notifications/`
- Widget: `src/widgets/dashboard-sidebar/`
- Route: `app/[locale]/dashboard/inbox/`
- i18n: `messages/es.json`, `messages/en.json`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the Prisma data model and shared types that all user stories depend on.

- [x] T001 Add `NotificationType` enum (`INVITATION_PENDING`, `AREA_ASSIGNED`, `SHIFT_CREATED`, `SHIFT_UPDATED`, `SHIFT_CANCELLED`, `GENERAL`) and `Notification` model to `prisma/schema.prisma`. Include fields: `id` (cuid), `userId` (String, required), `actorId` (String?, FK to User), `organizationId` (String?, FK to Organization), `type` (NotificationType), `title` (String), `description` (String?), `actionUrl` (String), `isRead` (Boolean, default false), `createdAt` (DateTime, default now). Add relations: `user` (NotificationRecipient, onDelete Cascade), `actor` (NotificationActor, onDelete SetNull), `organization` (onDelete SetNull). Add indexes: `@@index([userId, isRead, createdAt(sort: Desc)])`, `@@index([userId, createdAt(sort: Desc)])`, `@@index([userId, type])`. Also add `notificationsReceived Notification[] @relation("NotificationRecipient")` and `notificationsActed Notification[] @relation("NotificationActor")` to User model, and `notifications Notification[]` to Organization model. Run `npx prisma db push` after.

- [x] T002 [P] Rewrite `src/entities/notification/lib/types.ts`. Replace the old `NOTIFICATION_TYPES` constant and `PendingNotification` interface with: import `NotificationType` from `@prisma/client`, export a `NOTIFICATION_TYPE_CONFIG` map that maps each `NotificationType` to its `icon` (lucide component name as string), `color` (Tailwind semantic class), and default `actionUrl` pattern. Also export `NotificationWithActor` interface matching the Prisma include shape: `{ id, userId, actorId, organizationId, type, title, description, actionUrl, isRead, createdAt, actor: { id, name, image, customImage } | null, organization: { id, name } | null }`.

- [x] T003 [P] Create `src/entities/notification/lib/notification-repository.ts`. Implement data access functions using Prisma: `createNotificationRecord(data)`, `getNotificationsByUser(userId, { cursor?, limit, isRead?, type? })` returning `{ notifications: NotificationWithActor[], nextCursor: string | null }` with cursor-based pagination, `getUnreadCount(userId)` returning number, `markAsRead(id, userId)`, `markAllAsRead(userId)` returning count, `deleteNotification(id, userId)`, `getRecentUnread(userId, sinceMinutes)` returning `NotificationWithActor[]`. All queries must include `where: { userId }` for isolation. Include actor and organization via Prisma `include`.

- [x] T004 [P] Add i18n keys for inbox and notification types to `messages/es.json`. Under `notifications` (extend existing): add `inbox` object with keys: `title: "Bandeja de Entrada"`, `empty: "No tienes notificaciones"`, `emptyDescription: "Cuando recibas notificaciones, aparecerán aquí"`, `markAllRead: "Marcar todas como leídas"`, `markAllReadSuccess: "{count} notificaciones marcadas como leídas"`, `deleteConfirm: "¿Eliminar esta notificación?"`, `deleteSuccess: "Notificación eliminada"`, `loadMore: "Cargar más"`, `filters.all: "Todas"`, `filters.unread: "No leídas"`, `filters.read: "Leídas"`, `typeFilters.all: "Todos los tipos"`, `typeFilters.INVITATION_PENDING: "Invitaciones"`, `typeFilters.AREA_ASSIGNED: "Áreas"`, `typeFilters.SHIFT_CREATED: "Turnos"`, `typeFilters.SHIFT_UPDATED: "Turnos"`, `typeFilters.SHIFT_CANCELLED: "Turnos"`, `typeFilters.GENERAL: "General"`. Under `notifications` add `types` object: `INVITATION_PENDING: "{actor} te invitó a {organization}"`, `AREA_ASSIGNED: "{actor} te asignó al área {area}"`, `SHIFT_CREATED: "{actor} te asignó un turno el {date}"`, `SHIFT_UPDATED: "{actor} modificó tu turno del {date}"`, `SHIFT_CANCELLED: "{actor} canceló tu turno del {date}"`, `GENERAL: "Notificación"`. Under sidebar translations add `inbox: "Bandeja de entrada"`.

- [x] T005 [P] Add equivalent i18n keys to `messages/en.json`. Mirror the same structure as T004 with English translations: inbox (Inbox, No notifications, When you receive notifications they will appear here, Mark all as read, etc.), type filters (All types, Invitations, Areas, Shifts, General), notification type templates ({actor} invited you to {organization}, etc.), sidebar (Inbox).

- [x] T006 [P] Verify Shadcn components exist: Badge at `src/shared/ui/badge.tsx`, Button at `src/shared/ui/button.tsx`, AlertDialog at `src/shared/ui/alert-dialog.tsx`, Tabs at `src/shared/ui/tabs.tsx`. If Tabs is missing, install with `npx shadcn@latest add tabs`.

**Checkpoint**: Data model ready, types defined, repository functions available, i18n keys in place. User story implementation can begin.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create the notification creation service and Server Actions that all user stories and the inbox UI depend on.

**⚠️ CRITICAL**: User story work depends on these being in place.

- [x] T007 Create `src/features/notifications/lib/notification-service.ts`. Export `createNotification(params: { userId, actorId, organizationId?, type, title, description?, actionUrl })` that calls `createNotificationRecord` from the entity repository. Wrap in try/catch — notification creation failures must be logged (console.error) but never throw (must not break the parent operation). This function is the single entry point for all notification creation across features.

- [x] T008 Create `src/features/notifications/api/notification-actions.ts`. Implement 5 Server Actions with `'use server'` directive: (1) `getNotificationsAction({ cursor?, limit?, filter?, type? })` — calls `requireAuth()`, queries via `getNotificationsByUser`, returns `ActionResult<{ notifications, nextCursor }>`. (2) `getUnreadCountAction()` — calls `requireAuth()`, returns `ActionResult<number>`. (3) `markNotificationReadAction(id)` — calls `requireAuth()`, validates ownership, updates via repository, revalidates `/dashboard/inbox`. (4) `markAllNotificationsReadAction()` — calls `requireAuth()`, updates all unread via `markAllAsRead`, revalidates, returns count. (5) `deleteNotificationAction(id)` — calls `requireAuth()`, validates ownership, hard deletes, revalidates.

- [x] T009 Rewrite `src/entities/notification/lib/pending-notifications.ts`. Change `getUserPendingNotifications()` to query the new `Notification` model via `getRecentUnread(userId, 15)` from the repository instead of querying `OrganizationInvitation`. Return `NotificationWithActor[]` instead of the old `PendingNotification[]`. Update the function signature and return type accordingly. **Also update `src/features/notifications/ui/pending-notifications-toaster.tsx`** prop type from `PendingNotification[]` to `NotificationWithActor[]` to prevent build breakage (the component can still only handle `INVITATION_PENDING` at this stage — full multi-type support is added in T025).

- [x] T010 Create barrel exports. Create `src/entities/notification/lib/index.ts` exporting from `types.ts`, `notification-repository.ts`, and `pending-notifications.ts`. Create `src/entities/notification/index.ts` re-exporting from `./lib`. Create `src/features/notifications/lib/index.ts` exporting from `notification-service.ts`. Create `src/features/notifications/api/index.ts` exporting from `notification-actions.ts`. Create `src/features/notifications/ui/index.ts` exporting from existing `pending-notifications-toaster.tsx`.

**Checkpoint**: Foundation ready — notification creation service, Server Actions, and entity repository all functional. Inbox UI and action hooks can now be built.

---

## Phase 3: User Story 1 — Ver y gestionar la Bandeja de Entrada (Priority: P1) 🎯 MVP

**Goal**: ADMIN_HR, CHIEF_AREA, and STAFF can access their inbox from the sidebar, see a chronological list of notifications with read/unread state, click to navigate, and mark all as read. Sidebar shows unread badge.

**Independent Test**: Create an invitation for a user (seed manually in DB or via ADMIN_HR UI), login as that user. Verify badge in sidebar, notification in inbox, click navigates to profile, mark-as-read updates badge.

### Implementation for User Story 1

- [x] T011 [US1] Create `app/[locale]/dashboard/inbox/page.tsx`. Server component that calls `requireAuth()` (redirect SUPER_ADMIN to dashboard), fetches initial notifications via `getNotificationsAction({ limit: 20 })` and unread count via `getUnreadCountAction()`, renders `InboxPage` client component with initial data.

- [x] T012 [US1] Create `src/features/notifications/ui/notification-item.tsx`. Client component receiving a `NotificationWithActor` prop. Renders: notification type icon (from `NOTIFICATION_TYPE_CONFIG`), actor avatar (prioritize customImage > image > initials), title text, description (if present), organization name as secondary text when `notification.organization` is present (FR-013: multi-org context), relative date via `formatDistanceToNow` from date-fns with tooltip showing absolute date, unread indicator (blue dot or bold styling). The entire row should use a semantic `<button>` or `<a>` element (not `<div onClick>`) for keyboard accessibility — on click/Enter calls `markNotificationReadAction(id)` then navigates to `actionUrl` (prepend `/${locale}` if relative). Use `useRouter` for navigation.

- [x] T013 [US1] Create `src/features/notifications/ui/notification-list.tsx`. Client component receiving `initialNotifications`, `initialNextCursor`. Renders list of `NotificationItem` components. Includes "Load more" button when `nextCursor` is not null — on click calls `getNotificationsAction({ cursor })` and appends results. Uses `useTransition` for loading state. Shows empty state with icon and message when no notifications (`t('inbox.empty')` and `t('inbox.emptyDescription')`).

- [x] T014 [US1] Create `src/features/notifications/ui/inbox-page.tsx`. Client component that composes the inbox page. Renders page title (`t('inbox.title')`), "Mark all as read" button (calls `markAllNotificationsReadAction`, shows toast with count, refreshes list via `router.refresh()`), and `NotificationList`. Accepts `initialNotifications`, `nextCursor`, and `unreadCount` as props.

- [x] T015 [US1] Extend `src/widgets/dashboard-sidebar/types.ts` — add optional `badge?: number` field to `NavItem` interface.

- [x] T016 [US1] Update `src/widgets/dashboard-sidebar/constants.ts` — add inbox nav item with `href: '/dashboard/inbox'`, `label: t('inbox')`, `icon: Inbox` (from lucide-react), `roles: [Role.ADMIN_HR, Role.CHIEF_AREA, Role.STAFF]`. Place it after the Dashboard/Calendar item and before role-specific items. Import `Inbox` from lucide-react.

- [x] T017 [US1] Update sidebar rendering to show badge. Read `src/widgets/dashboard-sidebar/dashboard-shell.tsx` (or the component that renders `NavItem` list). Add badge rendering: when `item.badge` is defined and > 0, show a `Badge` component (variant="destructive", small size) next to the label. The badge should show the count (cap at "99+" if > 99).

- [x] T018 [US1] Update `app/[locale]/dashboard/layout.tsx`. After fetching the user, call `getUnreadCount(userId)` from the notification repository (server-side, not via Server Action). Pass `unreadCount` to `DashboardShell` as a new prop. In `DashboardShell`, pass the count to the sidebar so the inbox `NavItem` gets its `badge` value. The `PendingNotificationsToaster` prop type was already updated in T009 — verify it receives `NotificationWithActor[]` from `getUserPendingNotifications()` correctly.

- [x] T019 [US1] Update `src/features/notifications/ui/index.ts` — export `InboxPage`, `NotificationList`, `NotificationItem` alongside existing `PendingNotificationsToaster`.

**Checkpoint**: User Story 1 fully functional — inbox page accessible from sidebar with badge, notification list with read/unread, click-to-navigate, mark all as read. Independently testable by creating a notification record directly in DB.

---

## Phase 4: User Story 2 — Generación automática de notificaciones (Priority: P2)

**Goal**: System generates notifications automatically when events occur: invitations, area assignments, shift CRUD. Each event creates a persistent notification in the affected user's inbox.

**Independent Test**: Login as ADMIN_HR, invite a user. Login as that user, verify notification appears in inbox. Login as CHIEF, create a shift for a STAFF. Login as STAFF, verify shift notification appears.

### Implementation for User Story 2

- [x] T020 [US2] Hook into `src/features/admin-hr/api/invitation-actions.ts`. In both `inviteChiefAction` and `inviteStaffAction`, after the successful `createInvitation()` call and before the return, add: `await createNotification({ userId: targetUserId, actorId: session.id, organizationId, type: 'INVITATION_PENDING', title: t('types.INVITATION_PENDING', { actor: session.name, organization: orgName }), actionUrl: '/dashboard/profile?section=invitations' })`. Use `getTranslations('notifications')` for server-side i18n. Wrap in try/catch to not break the parent action.

- [x] T021 [US2] Hook into `src/features/area/api/area-actions.ts`. In `assignChiefsToAreaAction`, after the successful transaction, for each newly assigned chief userId: `await createNotification({ userId, actorId: session.id, organizationId: orgId, type: 'AREA_ASSIGNED', title: t('types.AREA_ASSIGNED', { actor: session.name, area: area.name }), actionUrl: '/dashboard/areas' })`. Similarly in `assignStaffToAreaAction` for each newly assigned staff. Only notify users who were NOT previously assigned (compare before/after sets to avoid spamming on re-assignment).

- [x] T022 [US2] Hook into `src/features/shifts/api/shift-actions.ts` — `createShiftAction`. After the successful `prisma.shift.create()`, call: `await createNotification({ userId: shift.userId, actorId: session.id, organizationId: session.organizationId, type: 'SHIFT_CREATED', title: t('types.SHIFT_CREATED', { actor: session.name, date: formatShiftDate(shift.startTime) }), description: areaName + ' — ' + shiftTypeName, actionUrl: '/dashboard/shifts' })`. Only create notification if `shift.userId !== session.id` (don't self-notify).

- [x] T023 [US2] Hook into `src/features/shifts/api/shift-actions.ts` — `updateShiftAction`. After the successful update, call: `await createNotification({ userId: shift.userId, actorId: session.id, organizationId: session.organizationId, type: 'SHIFT_UPDATED', title: t('types.SHIFT_UPDATED', { actor: session.name, date: formatShiftDate(shift.startTime) }), actionUrl: '/dashboard/shifts' })`. Only if `shift.userId !== session.id`.

- [x] T024 [US2] Hook into `src/features/shifts/api/shift-actions.ts` — `deleteShiftAction`. Before the status update to CANCELLED, fetch the shift to get `userId`. After the successful cancellation: `await createNotification({ userId: shift.userId, actorId: session.id, organizationId: session.organizationId, type: 'SHIFT_CANCELLED', title: t('types.SHIFT_CANCELLED', { actor: session.name, date: formatShiftDate(shift.startTime) }), actionUrl: '/dashboard/shifts' })`. Only if `shift.userId !== session.id`.

**Checkpoint**: User Story 2 complete — all 5 event types generate notifications automatically. Combined with US1, the inbox now has real content from system actions.

---

## Phase 5: User Story 3 — Mejora de notificaciones toast (Priority: P3)

**Goal**: Extend the existing toast system to show all notification types (not just invitations) and link to the inbox.

**Independent Test**: Create a shift for a STAFF, login as that STAFF. Verify a toast appears with "X te asignó un turno" and a "Ver" button that navigates to `/dashboard/inbox`.

### Implementation for User Story 3

- [x] T025 [US3] Extend `src/features/notifications/ui/pending-notifications-toaster.tsx` with multi-type support. The prop type was already changed to `NotificationWithActor[]` in T009. Update the `useEffect` to handle ALL `NotificationType` values via switch-case (or a lookup from `NOTIFICATION_TYPE_CONFIG`) instead of only `INVITATION_PENDING`. For each type, generate the appropriate toast message using the notification's `title` field (already pre-rendered). The action button should navigate to the notification's `actionUrl` (prepend locale). Keep existing deduplication via sessionStorage and `NOTIFICATIONS_LIMITS.TOASTS_PER_LOAD`.

- [x] T026 [US3] Verify toast integration in `app/[locale]/dashboard/layout.tsx` — confirm that `getUserPendingNotifications()` (rewritten in T009) returns `NotificationWithActor[]` and passes correctly to `PendingNotificationsToaster` (type updated in T009, multi-type logic added in T025). This task is a verification pass — fix any remaining type mismatches or rendering issues for non-invitation notification types in toasts.

**Checkpoint**: User Story 3 complete — toasts show all notification types on dashboard load, not just invitations.

---

## Phase 6: User Story 4 — Filtrado y organización de la bandeja (Priority: P4)

**Goal**: Users can filter inbox by status (all/read/unread) and by type (invitations/shifts/areas/general). Users can delete individual notifications.

**Independent Test**: Create multiple notification types for a user. Verify status and type filters work. Verify delete with AlertDialog confirmation removes the notification.

### Implementation for User Story 4

- [x] T027 [US4] Create `src/features/notifications/ui/inbox-filters.tsx`. Client component using Shadcn `Tabs` or a row of `Button` variants. Two filter groups: (1) Status: "Todas", "No leídas", "Leídas" (using i18n keys `inbox.filters.*`). (2) Type: "Todos los tipos", "Invitaciones", "Turnos", "Áreas", "General" (using i18n keys `inbox.typeFilters.*`). The component receives `onFilterChange(filter, type)` callback. The active filter is highlighted.

- [x] T028 [US4] Update `src/features/notifications/ui/inbox-page.tsx` to integrate `InboxFilters`. Add state for `filter` (all/read/unread) and `typeFilter` (all/specific type). When filters change, call `getNotificationsAction({ filter, type, limit: 20 })` via `useTransition` and replace the notification list. Reset cursor on filter change.

- [x] T029 [US4] Add delete functionality to `src/features/notifications/ui/notification-item.tsx`. Add a small delete button (X icon or Trash2 icon) on hover/focus of each notification row. Clicking opens an `AlertDialog` with confirmation message (`t('inbox.deleteConfirm')`). On confirm, calls `deleteNotificationAction(id)`, shows success toast, and removes the item from the list (parent callback `onDelete(id)`). Update `NotificationList` to handle the `onDelete` callback by filtering the local state.

- [x] T030 [US4] Update `src/features/notifications/ui/index.ts` — export `InboxFilters` alongside other components.

**Checkpoint**: User Story 4 complete — filters and delete all functional. Full inbox feature is complete.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, lint, build, and documentation.

- [x] T031 [P] Run `npm run lint` on all modified and new files. Fix any ESLint errors (especially `react/jsx-no-literals`, `curly`, `no-comments/disallowComments`).

- [x] T032 [P] Run `npx next build` and verify the build succeeds with no TypeScript errors.

- [x] T033 Update `docs/vita-workflows.md` — add a new section "Sistema de Notificaciones (Bandeja de Entrada)" under "Workflows transversales" documenting: ✅ Inbox page for ADMIN_HR, CHIEF_AREA, STAFF; ✅ Auto-generation from invitations, area assignments, shift CRUD; ✅ Toast integration for all types; ✅ Status and type filters; ⏳ SUPER_ADMIN notifications — pending; ⏳ Real-time updates (WebSocket/SSE) — pending; ⏳ Email notifications — pending.

- [x] T034 Update `docs/vita-roadmap.md` — change "Sistema de Notificaciones" status from "Pendiente" to "Parcial" and add completion notes.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately. T001 blocks T002-T003. T004-T006 are parallelizable.
- **Foundational (Phase 2)**: Depends on T001 (Prisma model), T002 (types), T003 (repository). BLOCKS all user stories.
- **User Story 1 (Phase 3)**: Depends on Phase 2. No dependency on other stories.
- **User Story 2 (Phase 4)**: Depends on Phase 2 (needs `createNotification` from T007). No dependency on US1 (notifications created in DB regardless of inbox UI).
- **User Story 3 (Phase 5)**: Depends on Phase 2 (needs rewritten `pending-notifications.ts` from T009). No dependency on US1/US2.
- **User Story 4 (Phase 6)**: Depends on US1 (needs inbox page from T014 to add filters/delete to).
- **Polish (Phase 7)**: Depends on all user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Phase 2 → T011 → T012 → T013 → T014 → T015 → T016 → T017 → T018 → T019
- **User Story 2 (P2)**: Phase 2 → T020, T021, T022, T023, T024 (all parallelizable — different files)
- **User Story 3 (P3)**: Phase 2 → T025 → T026
- **User Story 4 (P4)**: US1 → T027 → T028 → T029 → T030

### Within Each User Story

- Entity/repository before service
- Service before Server Actions
- Server Actions before UI
- Page route before page components
- Core components before integration wiring
- Export/barrel updates last

### Parallel Opportunities

**Phase 1** (after T001 completes):
```
T002 (types)  ||  T003 (repository)  ||  T004 (es.json)  ||  T005 (en.json)  ||  T006 (shadcn check)
```

**Phase 2** (T007-T008 after T002+T003, T009 after T003, T010 after all):
```
T007 (service) → T008 (actions)
T009 (rewrite pending-notifications)
T010 (barrel exports, after T007-T009)
```

**User Stories** (can run in parallel after Phase 2, except US4 needs US1):
```
US1: T011 → T012 → T013 → T014 (sequential: page→item→list→page-component)
     T015 → T016 → T017 → T018 (sequential: type→constant→render→layout)
US2: T020 || T021 || T022 || T023 || T024 (all parallel — different files)
US3: T025 → T026 (sequential: toaster→verify)
US4: (after US1) T027 → T028 → T029 → T030
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T010)
3. Complete Phase 3: User Story 1 (T011-T019)
4. **STOP and VALIDATE**: Create a notification record in DB, test inbox page
5. Run `npm run lint` + `npm run build`

### Incremental Delivery

1. Setup + Foundational → Shared infrastructure ready
2. Add User Story 1 → Test inbox independently → **MVP ready**
3. Add User Story 2 → Test auto-generation → Inbox has real content
4. Add User Story 3 → Test toast for all types → Proactive notifications
5. Add User Story 4 → Test filters + delete → Full feature
6. Polish → Lint, build, docs update

### Recommended Execution Order (Sequential)

For a single developer working sequentially:

1. T001 (Prisma model + push)
2. T002, T003 (types + repository — parallel)
3. T004, T005, T006 (i18n + shadcn — parallel)
4. T007 → T008 (service → actions)
5. T009 (rewrite pending-notifications)
6. T010 (barrel exports)
7. T011 → T012 → T013 → T014 (US1: page → item → list → inbox-page)
8. T015 → T016 → T017 → T018 (US1: sidebar type → constant → badge render → layout)
9. T019 (US1: exports)
10. T020 → T021 → T022 → T023 → T024 (US2: hooks — can be parallel)
11. T025 → T026 (US3: toast extension)
12. T027 → T028 → T029 → T030 (US4: filters + delete)
13. T031 → T032 → T033 → T034 (Polish)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Prisma schema change is the only blocking task — everything else flows from it
- The `createNotification()` service is a cross-feature import (documented violation in plan.md Complexity Tracking)
- Notification creation in hooks (US2) wraps in try/catch — parent action must never fail due to notification
- `actorId` + `title` are pre-rendered at creation time (immutable notifications per spec clarification)
- SUPER_ADMIN is excluded from notifications in this iteration (no sidebar item, no inbox route access)
- Notification titles use `getTranslations` (server-side) since they're created in Server Actions
- Commit after each phase or logical group
- Stop at any checkpoint to validate story independently
