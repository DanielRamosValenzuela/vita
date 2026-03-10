-- ============================================
-- VITA QA E2E — Verification Queries
-- Run via Supabase MCP after each phase
-- ============================================

-- Phase 0: Verify 11 manual accounts created
SELECT id, email, name, role, "organizationId", "docNumber"
FROM "User"
WHERE email LIKE 'vita.qa.%'
ORDER BY email;

-- Phase 1: Verify organization created
SELECT id, name, country, currency, plan, "maxAdminHR", "maxChiefs", "maxStaff", "billingDay"
FROM "Organization"
WHERE name = 'Clinica Ejemplo Santiago';

-- Phase 1: Verify ADMIN_HR linked
SELECT u.email, u.role, u."organizationId", o.name as org_name
FROM "User" u
JOIN "Organization" o ON u."organizationId" = o.id
WHERE u.email = 'vita.qa.adminhr1@gmail.com';

-- Phase 2: Verify 8 CHIEFs linked
SELECT email, role, "organizationId"
FROM "User"
WHERE email LIKE 'vita.qa.chief%'
ORDER BY email;

-- Phase 2: Verify invitation statuses
SELECT oi.status, u.email, oi.role
FROM "OrganizationInvitation" oi
JOIN "User" u ON oi."userId" = u.id
WHERE u.email LIKE 'vita.qa.%'
ORDER BY u.email;

-- Phase 3: Verify 102 STAFF total
SELECT COUNT(*) as staff_count
FROM "User"
WHERE email LIKE 'vita.qa.staff%'
  AND role = 'STAFF';

-- Phase 3: Verify STAFF with org
SELECT COUNT(*) as linked_staff
FROM "User"
WHERE email LIKE 'vita.qa.staff%'
  AND role = 'STAFF'
  AND "organizationId" IS NOT NULL;

-- Phase 4: Verify sectors
SELECT s.id, s.name, COUNT(sa."B") as area_count
FROM "Sector" s
LEFT JOIN "_SectorToArea" sa ON sa."A" = s.id
WHERE s."organizationId" = (
  SELECT id FROM "Organization" WHERE name = 'Clinica Ejemplo Santiago'
)
GROUP BY s.id, s.name;

-- Phase 4: Verify areas
SELECT a.id, a.name, a."dayStartTime", a."dayEndTime"
FROM "Area" a
WHERE a."organizationId" = (
  SELECT id FROM "Organization" WHERE name = 'Clinica Ejemplo Santiago'
)
ORDER BY a.name;

-- Phase 5: Verify shift types
SELECT st.id, st.name, st.classification, st."durationMinutes", st."isGlobal"
FROM "ShiftType" st
WHERE st."organizationId" = (
  SELECT id FROM "Organization" WHERE name = 'Clinica Ejemplo Santiago'
)
ORDER BY st.name;

-- Phase 6: Verify rate templates
SELECT rt.id, rt.name, rt."isActive",
  (SELECT COUNT(*) FROM "RateComponent" rc WHERE rc."rateTemplateId" = rt.id) as component_count
FROM "RateTemplate" rt
WHERE rt."organizationId" = (
  SELECT id FROM "Organization" WHERE name = 'Clinica Ejemplo Santiago'
)
ORDER BY rt.name;

-- Phase 6: Verify contracts assigned
SELECT COUNT(*) as total_contracts,
  COUNT(DISTINCT "userId") as unique_users
FROM "Contract" c
WHERE c."organizationId" = (
  SELECT id FROM "Organization" WHERE name = 'Clinica Ejemplo Santiago'
)
AND c."isActive" = true;

-- Phase 6: Verify double rate (users with 2+ contracts)
SELECT u.email, COUNT(c.id) as contract_count
FROM "Contract" c
JOIN "User" u ON c."userId" = u.id
WHERE c."organizationId" = (
  SELECT id FROM "Organization" WHERE name = 'Clinica Ejemplo Santiago'
)
AND c."isActive" = true
GROUP BY u.email
HAVING COUNT(c.id) > 1;

-- Phase 7: Verify UserArea assignments
SELECT u.email, a.name as area_name
FROM "UserArea" ua
JOIN "User" u ON ua."userId" = u.id
JOIN "Area" a ON ua."areaId" = a.id
WHERE u.email LIKE 'vita.qa.chief%'
ORDER BY u.email, a.name;

-- Phase 8: Verify staff distribution by area
SELECT a.name, COUNT(ua."userId") as staff_count
FROM "UserArea" ua
JOIN "Area" a ON ua."areaId" = a.id
WHERE a."organizationId" = (
  SELECT id FROM "Organization" WHERE name = 'Clinica Ejemplo Santiago'
)
GROUP BY a.name
ORDER BY a.name;

-- Phase 9: Verify rotations
SELECT r.id, r.name, r.status, a.name as area_name,
  (SELECT COUNT(*) FROM "RotationGroup" rg WHERE rg."rotationId" = r.id) as group_count,
  (SELECT COUNT(*) FROM "Shift" s WHERE s."rotationId" = r.id) as shift_count
FROM "Rotation" r
JOIN "Area" a ON r."areaId" = a.id
WHERE r."organizationId" = (
  SELECT id FROM "Organization" WHERE name = 'Clinica Ejemplo Santiago'
)
ORDER BY r.name;

-- Phase 10: Verify payroll
SELECT pp.month, pp.year, pp.status, pp."totalDocuments", pp."totalAmount"
FROM "PayrollPeriod" pp
WHERE pp."organizationId" = (
  SELECT id FROM "Organization" WHERE name = 'Clinica Ejemplo Santiago'
);

-- Phase 10: Verify payroll documents count
SELECT COUNT(*) as doc_count
FROM "PayrollDocument" pd
WHERE pd."organizationId" = (
  SELECT id FROM "Organization" WHERE name = 'Clinica Ejemplo Santiago'
);

-- Phase 11: Verify swap requests
SELECT sr.type, sr.status, u.email as requester
FROM "ShiftSwapRequest" sr
JOIN "User" u ON sr."requesterId" = u.id
WHERE sr."organizationId" = (
  SELECT id FROM "Organization" WHERE name = 'Clinica Ejemplo Santiago'
);

-- Final summary
SELECT
  (SELECT COUNT(*) FROM "User" WHERE "organizationId" = o.id) as total_users,
  (SELECT COUNT(*) FROM "User" WHERE "organizationId" = o.id AND role = 'STAFF') as staff,
  (SELECT COUNT(*) FROM "User" WHERE "organizationId" = o.id AND role IN ('CHIEF_AREA', 'CHIEF_SECTOR')) as chiefs,
  (SELECT COUNT(*) FROM "User" WHERE "organizationId" = o.id AND role = 'ADMIN_HR') as admin_hr,
  (SELECT COUNT(*) FROM "Sector" WHERE "organizationId" = o.id) as sectors,
  (SELECT COUNT(*) FROM "Area" WHERE "organizationId" = o.id) as areas,
  (SELECT COUNT(*) FROM "ShiftType" WHERE "organizationId" = o.id) as shift_types,
  (SELECT COUNT(*) FROM "RateTemplate" WHERE "organizationId" = o.id) as rate_templates,
  (SELECT COUNT(*) FROM "Contract" WHERE "organizationId" = o.id AND "isActive" = true) as active_contracts,
  (SELECT COUNT(*) FROM "Rotation" WHERE "organizationId" = o.id) as rotations,
  (SELECT COUNT(*) FROM "Shift" WHERE "organizationId" = o.id) as shifts
FROM "Organization" o
WHERE o.name = 'Clinica Ejemplo Santiago';
