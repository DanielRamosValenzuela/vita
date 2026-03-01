# Implementation Plan: Bandeja de Entrada y Sistema de Notificaciones

**Branch**: `003-inbox-notifications` | **Date**: 2026-02-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-inbox-notifications/spec.md`

## Summary

Create a persistent notification inbox ("Bandeja de Entrada") accessible via sidebar for ADMIN_HR, CHIEF_AREA, and STAFF roles. Notifications are generated automatically when system events occur (invitations, area assignments, shift CRUD) and displayed as an immutable TODO-style list with read/unread state, actor attribution, and click-to-navigate to the relevant context. The existing toast notification system (`PendingNotificationsToaster`) is extended to show all recent notification types instead of just invitations. Notifications are persisted in a new Prisma model and isolated per user.

## Technical Context

**Language/Version**: TypeScript strict, Next.js 16 (App Router), React 19
**Primary Dependencies**: Prisma, Shadcn UI, next-intl, Zod, lucide-react, date-fns, Sonner (toasts)
**Storage**: PostgreSQL (Supabase) — new `Notification` table via Prisma
**Testing**: Manual testing via UI; `npm run lint` + `npm run build`
**Target Platform**: Web (desktop + responsive mobile)
**Project Type**: Web application (FSD architecture)
**Performance Goals**: Inbox loads 20 notifications in < 1 second; badge count via lightweight COUNT query
**Constraints**: No WebSocket/SSE; notifications load on page access. Multi-tenant isolation by userId. All strings i18n.
**Scale/Scope**: ~100 notifications per user typical; paginate at 20+

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. FSD & Code Quality | PASS | New files placed in correct layers: `entities/notification`, `features/notifications`, `widgets/dashboard-sidebar`. Server Actions return `ActionResult<T>`. Zod validation on inputs. |
| II. Mandatory i18n | PASS | All UI strings via `useTranslations`/`getTranslations`. Keys in both `es.json` and `en.json`. Dates via `date-fns` + `formatDistanceToNow`. |
| III. Multi-Tenant Isolation | PASS | Notifications filtered by `userId` (user-scoped, not org-scoped). Auth guards on all Server Actions. Creator service receives `actorId` and `organizationId` from authenticated session. |
| IV. Testing Standards | PASS | `npm run lint` + `npm run build` before completion. Manual test flows documented per user story. |
| V. Consistent UX & Accessibility | PASS | Shadcn components (Badge, Button, AlertDialog). Semantic HTML. Keyboard-accessible list items. Responsive. |
| VI. Technology Stack Governance | PASS | No new dependencies. All within approved stack. Server Actions for all mutations. |

## Project Structure

### Documentation (this feature)

```text
specs/003-inbox-notifications/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Research decisions
├── data-model.md        # Prisma model + types
├── quickstart.md        # Quick start guide
├── contracts/           # Server Action contracts
│   └── notification-actions.md
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
prisma/
└── schema.prisma                    # Add Notification model + NotificationType enum

src/
├── shared/
│   └── lib/
│       └── constants/
│           └── notifications.ts     # Extend with new limits/types
│
├── entities/
│   └── notification/
│       └── lib/
│           ├── types.ts             # Extend NotificationType, add Notification interface
│           ├── pending-notifications.ts  # Rewrite: query from Notification table
│           ├── notification-repository.ts  # NEW: CRUD repository for Notification model
│           └── index.ts             # Re-export
│
├── features/
│   ├── notifications/
│   │   ├── api/
│   │   │   ├── notification-actions.ts    # NEW: Server Actions (markRead, markAllRead, delete, getUnreadCount)
│   │   │   └── index.ts
│   │   ├── lib/
│   │   │   ├── notification-service.ts    # NEW: createNotification helper (called from other actions)
│   │   │   └── index.ts
│   │   └── ui/
│   │       ├── pending-notifications-toaster.tsx  # MODIFY: extend to handle all notification types
│   │       ├── inbox-page.tsx             # NEW: main inbox page component
│   │       ├── notification-list.tsx      # NEW: list component with items
│   │       ├── notification-item.tsx      # NEW: single notification row
│   │       ├── inbox-filters.tsx          # NEW: status + type filter tabs
│   │       └── index.ts
│   │
│   ├── admin-hr/
│   │   └── api/
│   │       └── invitation-actions.ts      # MODIFY: add notification creation after invite
│   │
│   ├── area/
│   │   └── api/
│   │       └── area-actions.ts            # MODIFY: add notification on area assignment
│   │
│   └── shifts/
│       └── api/
│           └── shift-actions.ts           # MODIFY: add notification on shift CRUD
│
├── widgets/
│   └── dashboard-sidebar/
│       ├── constants.ts                   # MODIFY: add inbox nav item with badge
│       ├── types.ts                       # MODIFY: add optional badge to NavItem
│       └── dashboard-shell.tsx            # MODIFY: pass unread count for badge
│
└── app/
    └── [locale]/
        └── dashboard/
            ├── layout.tsx                 # MODIFY: fetch unread count, pass to shell
            └── inbox/
                └── page.tsx               # NEW: server page for inbox route
```

**Structure Decision**: FSD architecture maintained. Notification entity holds data access (repository). Notification feature holds Server Actions, service (creation helper), and UI. Existing features (admin-hr, area, shifts) are modified minimally — only adding a single `createNotification()` call after successful operations.

## Constitution Re-Check (Post-Design)

| Principle | Status | Notes |
|-----------|--------|-------|
| I. FSD & Code Quality | PASS (with documented violation) | Cross-feature import `features/notifications` → from other features documented in Complexity Tracking. All other FSD rules respected. |
| II. Mandatory i18n | PASS | Data model uses pre-rendered titles (already i18n'd at creation time via `getTranslations`). Inbox UI uses `useTranslations`. |
| III. Multi-Tenant Isolation | PASS | Queries filter by `userId`. `organizationId` on Notification is for display only, not access control. Existing auth guards used. |
| IV. Testing Standards | PASS | Manual test flows defined in quickstart.md. Lint + build verification. |
| V. Consistent UX & Accessibility | PASS | Shadcn Badge for counts, Button for actions, AlertDialog for delete. Semantic list markup. |
| VI. Technology Stack Governance | PASS | No new dependencies. Prisma for data, Server Actions for mutations, Sonner for toasts. |

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Cross-feature import: `features/admin-hr`, `features/area`, `features/shifts` import from `features/notifications/lib/notification-service.ts` | Need to create notifications when events occur in those features. The notification service is the single creation point. | Moving to `entities/` would mix data access with business logic (pre-rendering titles, computing actionUrl). Moving to `shared/` would violate "shared doesn't know entities". The cross-feature import is minimal (one function) and well-documented. |
| Principle III deviation: Notification queries filter by `userId` instead of `organizationId` | Users may belong to multiple organizations and must see notifications from all of them (spec edge case 5). Org-scoped isolation would hide cross-org notifications. The `organizationId` field exists on the model for display context only. | Filtering by `organizationId` would require separate inbox per org or a multi-org query, adding complexity without security benefit since notifications are user-private (not shared within org). User-scoped isolation is the correct boundary for personal notifications. |
