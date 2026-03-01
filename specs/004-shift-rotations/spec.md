# Feature Specification: Shift Rotations (Rotativas)

**Feature Branch**: `004-shift-rotations`
**Created**: 2026-02-24
**Status**: Draft
**Input**: User description: "Sistema de rotativas para asignar grupos de personas a patrones de turnos ciclicos (ej. cuarto turno: Largo, Noche, Libre, Libre) que cubren un area 24/7."

## Clarifications

### Session 2026-02-24

- Q: Is the "cuarto turno" the only supported pattern? → A: No. "Cuarto turno" is just one example. Each organization creates its own rotations with whatever shift types and coverage hours they need. Partial coverage (e.g., only 12h/day) is equally valid.
- Q: Where do generated shift start/end times come from? → A: Defined per shift type within each rotation configuration. Each rotation specifies the start time for each shift type it uses (e.g., "Largo starts at 08:00", "Noche starts at 20:00"). End time is calculated using the existing durationMinutes. Area's dayStartTime/dayEndTime is for tariff calculation only, not for rotation scheduling.
- Q: Where should rotations be managed in the UI? → A: Dedicated page at /dashboard/rotations with its own sidebar entry. Rotations are a distinct entity with their own CRUD, groups, generation, and coverage view.
- Q: Can an area have multiple active rotations simultaneously? → A: Yes, unlimited. Different staff specializations within an area (e.g., nurses, technicians, doctors) can each have their own active rotation.
- Q: How is shift generation triggered? → A: Manual with proactive alerts. The CHIEF generates on demand, but the system alerts when the generated coverage is about to run out (few days remaining). The goal is that once the rotation is configured with staff, generating shifts is a one-click action that produces the full pattern for each person.
- Q: Should the system offer predefined rotation templates? → A: No, not for now. The CHIEF configures everything manually. Templates can be added as a future iteration once common patterns are identified from real usage.
- Q: How should the system handle understaffing and extra shift filling? → A: The rotation coverage overview shows a warning icon on understaffed days. The CHIEF can fill gaps with "extra" shift types (e.g., "Largo Extra", "Noche Extra") which have their own tariff rates via existing RateComponent/ShiftType system. The system suggests available candidates ordered by smart tiers based on shift context.
- Q: How should extra candidate suggestions work? → A: Cross-area suggestions are valid if the person belongs to both areas. Candidates are ordered by tiers: (1) person already on Largo that day can extend to Noche Extra (best), (2) people on Libre who did NOT come from a Noche, (3) people on Libre who came from a Noche (least preferred). Noche → Largo Extra direction is never recommended. The system shows warnings if area limits (maxConsecutiveHours, minRestHours) would be violated, but the CHIEF makes the final decision.
- Q: Should intelligent tiers and cross-area be in MVP or deferred? → A: Full MVP from day 1. Warnings + fill with extra + smart tiers + cross-area suggestions all included in initial release.
- Q: How are extras notified? → A: Direct assignment with informational notification (same as regular shifts today). The CHIEF has authority to assign; no confirmation required from staff.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create a Rotation for an Area (Priority: P1)

As a CHIEF_AREA, I want to create a rotation (rotativa) for one of my areas, defining a repeating pattern of shift types and rest days, so that I can automate the scheduling of my staff instead of assigning each shift manually.

**Why this priority**: This is the foundational capability. Without the ability to define a rotation pattern, nothing else works. A rotation tied to an area with a defined cycle pattern (e.g., "cuarto turno": Largo, Noche, Libre, Libre) is the minimum viable unit of this feature.

**Independent Test**: Can be tested by creating a rotation named "Cuarto Turno Emergencias" for the "Emergencias" area with the pattern [Largo, Noche, Libre, Libre] and verifying it persists and is visible.

**Acceptance Scenarios**:

1. **Given** a CHIEF_AREA with an active area "Emergencias", **When** they create a new rotation with name "Cuarto Turno", select the area, and define the pattern as [Largo, Noche, Libre, Libre], **Then** the rotation is saved and visible in the rotations list for that area.
2. **Given** a CHIEF_AREA tries to create a rotation, **When** the selected area is inactive, **Then** the system shows an error and prevents creation.
3. **Given** a CHIEF_AREA, **When** they create a rotation and select shift types for the pattern, **Then** only shift types that are active and assigned to that area (via AreaShiftType or global) are available for selection.
4. **Given** a CHIEF_AREA who manages areas "Emergencias" and "UCI", **When** they create a rotation, **Then** they can only select areas they are assigned to via UserArea.
5. **Given** an ADMIN_HR, **When** they create a rotation, **Then** they can select any active area within their organization.

---

### User Story 2 - Define Rotation Groups and Assign Staff (Priority: P1)

As a CHIEF_AREA, I want to create multiple groups (e.g., A, B, C, D) within a rotation and assign staff members to each group, so that all group members follow the same shift pattern but each group starts at a different offset in the cycle, ensuring continuous coverage.

**Why this priority**: Groups are essential for the rotation to function. A rotation without groups and staff has no practical use. The group offset mechanism is what enables 24/7 coverage.

**Independent Test**: Can be tested by adding 4 groups to a rotation, assigning 2-3 staff to each group, and verifying each group has the correct members listed.

**Acceptance Scenarios**:

1. **Given** a rotation with pattern [Largo, Noche, Libre, Libre], **When** the CHIEF_AREA adds groups A, B, C, D, **Then** each group is automatically assigned an offset position in the cycle (A=0, B=1, C=2, D=3) so they rotate in sequence.
2. **Given** a rotation group, **When** the CHIEF_AREA assigns staff members, **Then** only staff (STAFF) who belong to the rotation's area (via UserArea) are available for selection.
3. **Given** a staff member already assigned to another active rotation in the same area, **When** the CHIEF_AREA tries to assign them to a new rotation group, **Then** the system warns about the potential conflict but allows the assignment (shift conflict detection during generation handles overlaps).
4. **Given** a rotation with 4 groups of 10 people each, **When** viewed by the CHIEF_AREA, **Then** the system shows a summary: total staff (40), staff per group, and the coverage pattern.
5. **Given** a CHIEF_AREA removes a staff member from a group, **When** there are future generated shifts for that person in this rotation, **Then** the system asks whether to also cancel those future shifts or leave them.

---

### User Story 3 - Generate Shifts from Rotation (Priority: P1)

As a CHIEF_AREA, I want to generate individual shifts for all members of all groups in a rotation for a selected date range, so that each person's shifts appear in the existing calendar and shift management views.

**Why this priority**: This is the core value proposition. Generating shifts automatically for an entire month for 40 people in 4 groups (instead of creating each shift manually) saves hours of administrative work. The generated shifts allow each staff member to see their complete pattern (e.g., Largo, Noche, Libre, Libre repeating) in advance.

**Independent Test**: Can be tested by selecting a rotation with defined groups and staff, choosing a date range (e.g., March 1-31), generating shifts, and verifying the correct shifts appear in the calendar for each person.

**Acceptance Scenarios**:

1. **Given** a "Cuarto Turno" rotation with 4 groups (A, B, C, D) and pattern [Largo, Noche, Libre, Libre] starting March 1st, **When** the CHIEF_AREA generates shifts for March, **Then**:
   - Group A on March 1st gets Largo (08:00-20:00), March 2nd Noche (20:00-08:00), March 3-4 Libre
   - Group B on March 1st gets Libre, March 2nd Largo, March 3rd Noche, March 4th Libre
   - Group C on March 1st gets Libre, March 2nd Libre, March 3rd Largo, March 4th Noche
   - Group D on March 1st gets Noche, March 2nd Libre, March 3rd Libre, March 4th Largo
   - Pattern repeats every 4 days for the entire month
2. **Given** generated shifts from a rotation, **When** viewed in the existing shift calendar, **Then** they appear like any other shift with the correct shift type, user, area, and times.
3. **Given** a date range where shifts already exist for some staff (manual or from a previous generation), **When** the CHIEF_AREA generates rotation shifts, **Then** the system detects conflicts and shows them before confirming, allowing the CHIEF_AREA to skip conflicting days or override existing shifts.
4. **Given** a rotation generation for March, **When** the rotation configuration defines start times per shift type (e.g., Largo starts 08:00, Noche starts 20:00), **Then** generated shifts use those configured start times and calculate the end time from the shift type's durationMinutes.
5. **Given** generated shifts, **When** the CHIEF_AREA views them, **Then** each shift is tagged/linked to its source rotation and group for traceability.

---

### User Story 4 - View Rotation Coverage Overview (Priority: P2)

As a CHIEF_AREA, I want to see a visual overview of my rotation showing which group is working on which day across the month, so I can verify that coverage meets my requirements and there are no unintended gaps.

**Why this priority**: Visualization is important for verification and confidence, but the rotation already works without it (shifts appear in the existing calendar). This adds a dedicated rotation-centric view.

**Independent Test**: Can be tested by viewing a rotation's overview page and verifying the grid shows the correct group assignments per day, highlighting any days without shift coverage.

**Acceptance Scenarios**:

1. **Given** a "Cuarto Turno" rotation with 4 groups, **When** the CHIEF_AREA opens the rotation overview, **Then** a calendar-like grid shows each group's status per day (Largo, Noche, Libre) with color-coded indicators.
2. **Given** the rotation overview, **When** there is a day with no group assigned to any shift, **Then** that day is highlighted as a potential coverage gap (informational warning, not blocking).
3. **Given** the rotation overview, **When** the CHIEF_AREA hovers over a day cell for a group, **Then** they see the list of staff members working that day and the shift type details.

---

### User Story 5 - Edit and Manage Rotation Configuration (Priority: P2)

As a CHIEF_AREA, I want to edit an existing rotation's configuration (name, pattern, groups, staff assignments) and regenerate shifts when changes are needed, so the rotation adapts to changing requirements.

**Why this priority**: Operational flexibility is necessary for real-world use, but initial creation and generation are more critical.

**Independent Test**: Can be tested by modifying a rotation's pattern or group membership, regenerating shifts for a future period, and verifying the new shifts reflect the changes.

**Acceptance Scenarios**:

1. **Given** an existing rotation, **When** the CHIEF_AREA edits its name or pattern, **Then** the changes are saved and future generations use the new pattern.
2. **Given** a rotation with already generated shifts, **When** the CHIEF_AREA modifies the pattern and regenerates, **Then** the system asks whether to replace future shifts or keep them, showing a comparison of what would change.
3. **Given** a rotation, **When** the CHIEF_AREA deactivates it, **Then** no new shifts can be generated from it, but existing generated shifts remain in the calendar.
4. **Given** a rotation, **When** the CHIEF_AREA deletes it, **Then** the system warns that this is irreversible, and asks whether to also delete all future generated shifts linked to this rotation.

---

### User Story 6 - Staff Views Their Rotation Assignment (Priority: P3)

As a STAFF, I want to see which rotation and group I belong to and preview my upcoming shift pattern, so I know my schedule in advance without needing to ask my supervisor.

**Why this priority**: Staff visibility is important for satisfaction and planning, but the generated shifts already appear in their existing calendar views. This adds a rotation-specific context.

**Independent Test**: Can be tested by logging in as STAFF, navigating to the shifts view, and verifying the rotation/group assignment is visible alongside upcoming generated shifts.

**Acceptance Scenarios**:

1. **Given** a STAFF assigned to Group B of "Cuarto Turno Emergencias", **When** they view their shifts, **Then** they see a label indicating their rotation and group assignment.
2. **Given** a STAFF in a rotation, **When** they view their upcoming shifts, **Then** shifts generated from the rotation are visually distinguishable from manually created shifts.
3. **Given** a STAFF not assigned to any rotation, **When** they view their shifts, **Then** no rotation information is shown and their experience is unchanged.

---

### User Story 7 - Fill Understaffing with Extra Shifts (Priority: P2)

As a CHIEF_AREA, when my rotation group has fewer members than the shift type's minimum staff required, I want the system to warn me and help me quickly assign extra shifts to available staff, so I can maintain adequate coverage without leaving the rotation view.

**Why this priority**: Understaffing is a daily operational reality in hospitals. The ability to detect gaps and fill them efficiently with properly-categorized "extra" shift types (which have different tariff rates) is critical for both coverage and correct payment calculation.

**Independent Test**: Can be tested by creating a rotation group with 8 members where the shift type requires 10, viewing the coverage overview, seeing the warning, and using the "fill with extra" action to assign 2 additional staff with "Largo Extra" shift type.

**Acceptance Scenarios**:

1. **Given** a rotation group with 8 members and a shift type with `minStaffRequired: 10`, **When** the CHIEF_AREA views the rotation coverage overview, **Then** each day where that group is active shows a warning icon indicating understaffing (8/10).
2. **Given** an understaffed day, **When** the CHIEF_AREA clicks "Fill with extra", **Then** the system shows available candidates ordered by recommendation tiers:
   - Tier 1 (best): Person already on Largo that day who can extend to Noche Extra
   - Tier 2 (good): People on Libre who did NOT come from a Noche shift
   - Tier 3 (available but less ideal): People on Libre who came from a Noche shift
   - Never recommended: Person coming off a Noche for a Largo Extra (night-to-day 24h)
3. **Given** a candidate whose assignment would violate area limits (maxConsecutiveHours or minRestHours), **When** shown in the suggestion list, **Then** they appear with a visible warning about the limit violation, but the CHIEF_AREA can still assign them.
4. **Given** a person belonging to two areas and free in both, **When** the CHIEF_AREA fills an extra in either area, **Then** that person appears as a candidate in both areas' suggestion lists.
5. **Given** the CHIEF_AREA selects a candidate and an "extra" shift type (e.g., "Largo Extra"), **When** they confirm, **Then** a regular shift is created with the extra shift type, which the tariff system calculates at the extra rate defined in the staff member's contract.

---

### Edge Cases

- What happens when a staff member is transferred to a different area while assigned to a rotation? The system should automatically remove them from the rotation group and optionally cancel their future generated shifts.
- What happens when a shift type used in a rotation pattern is deactivated? The system should warn the CHIEF_AREA and prevent generation until the pattern is updated.
- What happens if the CHIEF_AREA tries to generate shifts for a past date range? The system should only allow generation for today onwards.
- What happens when all groups have fewer members than the minimum staff required by the shift type? The system should warn about understaffing but still allow generation.
- What happens when a generated shift is individually edited (time change, user swap)? The shift should be marked as "manually modified" and excluded from future regeneration for that specific date.
- What happens during daylight saving time transitions? Shift times should follow the area's configured times regardless of DST, as Chilean hospitals operate on fixed local schedules.
- What happens when a rotation is generated for a period that spans holidays or special dates? Generated shifts proceed normally; the CHIEF_AREA can manually adjust individual shifts afterward.
- What happens when someone on Largo is assigned a Noche Extra (24h total) and the area's maxConsecutiveHours is 24? The system shows a warning but allows it, since the CHIEF_AREA decides based on operational needs.
- What happens when all candidates for an extra are coming off a Noche? The system still shows them (Tier 3) with warnings; it never hides available staff, only orders and warns.
- What happens when an extra shift type (e.g., "Largo Extra") doesn't have a rate configured in the staff's contract? The shift is created normally, but the tariff system won't calculate payment for that component. This is an existing tariff system concern, not specific to rotations.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow CHIEF_AREA and ADMIN_HR users to create rotation configurations tied to a single active area within their organization.
- **FR-002**: System MUST allow defining a rotation pattern as an ordered sequence of steps, where each step is either a shift type (from the area's available shift types) or a rest day.
- **FR-003**: System MUST support configurable number of groups per rotation (minimum 2, maximum 6), where each group follows the same pattern but offset by one position in the cycle.
- **FR-004**: System MUST allow assigning staff members (STAFF users in the rotation's area) to rotation groups. A staff member can only belong to one group within a rotation. If a staff member is already in another active rotation in the same area, the system warns about potential conflicts but does not block the assignment (shift conflict detection during generation handles overlaps).
- **FR-005**: System MUST auto-generate individual shifts for all staff in all groups of a rotation for a selected date range, respecting the pattern, group offsets, and shift type time configurations.
- **FR-006**: Generated shifts MUST appear in the existing calendar and shift management views, indistinguishable in functionality from manually created shifts.
- **FR-007**: Generated shifts MUST maintain a link to their source rotation and group for traceability and management.
- **FR-008**: System MUST detect and report conflicts (overlapping shifts) before confirming generation, allowing the user to resolve conflicts before proceeding.
- **FR-009**: System MUST show an informational coverage summary for the rotation pattern (which days/times have shift coverage), highlighting any gaps as warnings. Coverage validation is informational only and never blocks generation, since organizations may intentionally choose partial coverage (e.g., only daytime shifts).
- **FR-010**: System MUST allow deactivating a rotation (stops future generation) and deleting a rotation (with options for handling linked shifts).
- **FR-011**: System MUST enforce multi-tenant isolation: rotations, groups, and generated shifts are scoped to the organization.
- **FR-012**: System MUST enforce area-based access control: CHIEF_AREA users can only manage rotations for areas they are assigned to via UserArea.
- **FR-013**: System MUST send notifications to staff members when they are assigned to a rotation group or when shifts are generated for them.
- **FR-014**: System MUST allow individually editing or cancelling generated shifts without affecting the rotation configuration or other generated shifts.
- **FR-015**: System MUST mark individually modified shifts so they are excluded from regeneration operations.
- **FR-016**: System MUST proactively alert the CHIEF_AREA when an active rotation's generated coverage is about to run out (e.g., fewer than 7 days of generated shifts remaining), prompting them to generate the next period.
- **FR-017**: System MUST detect understaffing by comparing rotation group member count against the shift type's `minStaffRequired` and display a warning icon on understaffed days in the coverage overview.
- **FR-018**: System MUST provide a "fill with extra" action from understaffed days that shows available candidates ordered by smart recommendation tiers, considering: (1) current shift context (Largo can extend to Noche, but not Noche to Largo), (2) previous day's shift (came from Noche = less ideal), (3) cross-area availability. Candidates MUST be assigned to the CHIEF's area via UserArea; a person not assigned to the area never appears regardless of qualifications. "Cross-area" means the system checks the person's Libre status across all their rotations in all their assigned areas to determine availability.
- **FR-019**: System MUST show warnings when an extra assignment would violate area limits (maxConsecutiveHours, minRestHours) but MUST NOT block the assignment. The CHIEF_AREA makes the final decision.
- **FR-020**: Extra shifts MUST use distinct shift types (e.g., "Largo Extra", "Noche Extra") so the existing tariff system (RateComponent with SPECIFIC_SHIFT_TYPE condition) calculates the correct extra rate automatically.

### Key Entities

- **Rotation (Rotativa)**: A named rotation configuration tied to one area within an organization. Contains a pattern (ordered sequence of shift types and rest days), status (active/inactive), and references the area it covers. One area can have multiple rotations (e.g., for different staff specializations or coverage needs). Rotations are not limited to 24/7 patterns; organizations define whatever coverage suits their needs.
- **RotationStep (Paso de Rotativa)**: A single step in the rotation pattern. Either references a shift type (e.g., "Largo", "Noche") or marks a rest day ("Libre"). Has an order position within the pattern. The pattern length determines the cycle duration (e.g., 4 steps = 4-day cycle).
- **RotationShiftConfig (Configuracion de Turno en Rotativa)**: Defines the start time for each shift type used within a specific rotation (e.g., "In this rotation, Largo starts at 08:00 and Noche starts at 20:00"). End time is calculated from the shift type's durationMinutes. This allows different rotations in different areas to use the same shift type with different start times.
- **RotationGroup (Grupo de Rotativa)**: A named group within a rotation (e.g., "A", "B", "C", "D"). Has a cycle offset (position 0, 1, 2, 3...) that determines when the group starts its pattern relative to the rotation's start date.
- **RotationMember (Miembro de Rotativa)**: Links a staff member (user) to a rotation group. A user can only be an active member of one rotation per area.
- **Shift (Turno)** *(existing, extended)*: Existing shift entity gains an optional link to its source rotation and group, enabling traceability and regeneration management.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A CHIEF_AREA can create a full "cuarto turno" rotation (pattern + 4 groups + staff assignment) and generate a month of shifts for 40 people in under 5 minutes, compared to hours of manual shift creation.
- **SC-002**: Generated rotation shifts match the intended coverage pattern defined by the organization, verified by the coverage overview accurately reflecting the configured pattern (e.g., zero gap warnings for a 24/7 "cuarto turno", or expected gaps for a 12h-only pattern).
- **SC-003**: 100% of generated shifts appear correctly in the existing calendar views (both the organization calendar and individual staff calendars) without any manual intervention after generation.
- **SC-004**: Staff members can see their rotation assignment and upcoming generated shifts immediately after generation, without needing to contact their supervisor.
- **SC-005**: Rotation management (create, edit groups, regenerate) can be performed entirely by a CHIEF_AREA without requiring ADMIN_HR or technical support involvement.
- **SC-006**: Conflict detection catches 100% of overlapping shifts before generation, preventing double-booking of any staff member.

## Assumptions

- The rotation pattern is cyclical and repeats indefinitely (every N days, where N = number of steps in the pattern).
- The "cuarto turno" (Largo, Noche, Libre, Libre with 4 groups) is one common example, but the system is fully flexible: each organization creates its own rotations with any shift types, any number of steps (2-8), any number of groups (2-6), and any coverage level (full 24/7, daytime only, etc.).
- Shift start/end times for generated shifts come from the rotation's own shift config (start time per shift type), combined with the shift type's existing durationMinutes to calculate end time. The area's dayStartTime/dayEndTime is unrelated (used only for tariff calculations).
- Generated shifts use the same underlying Shift model, maintaining full compatibility with existing features (payments, contracts, notifications, conflict checking).
- Rest days ("Libre") in the pattern do not generate a shift record; the absence of a shift implies rest.
- The CHIEF_AREA is the primary user of this feature, with ADMIN_HR having supervisory access.
- Rotations may operate within the legal framework of Chilean labor law (DL 2763, Art. 72) when used for 24/7 coverage, but the system does not enforce any specific legal pattern. Compliance is the organization's responsibility.

## Dependencies

- Requires active Areas.
- Requires active ShiftTypes assigned to the area (start times are configured per rotation, not on ShiftType itself).
- Requires staff members (STAFF) linked to the area via UserArea.
- Depends on existing shift conflict detection logic (checkShiftConflicts).
- Depends on existing notification system for staff notifications.
