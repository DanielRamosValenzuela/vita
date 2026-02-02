# Plan de Desarrollo y Roadmap

## Fases Principales

| Fase | Nombre | Estado |
|------|--------|--------|
| 0 | Investigación Competitiva (Rflex) | Pendiente |
| 1 | Landing Page & Branding | Completado |
| 2 | Base de Datos y Configuración | Completado |
| 3 | Autenticación | Completado |
| 4 | Dashboard SUPER_ADMIN | Completado |
| 5 | Gestión de Pagos | Pendiente |
| 6 | Analytics | Pendiente |
| 7 | Dashboard ADMIN_HR | En progreso |
| 8 | Dashboard CHIEF_AREA | Parcial |
| 9 | Dashboard STAFF_HEALTH | Parcial |
| 10 | Seguridad y Upload | Pendiente |
| 11 | Calendario Visual | Completado |
| 12 | Sistema de Notificaciones | Pendiente |
| 13 | Testing y Pulido | Pendiente |

## Próximos Pasos Inmediatos (Feb 2026)

1. ~~**UserArea en schema**~~ ✅ Chief ↔ Área (modelo UserArea, migración aplicada)
2. ~~**Gestión de Personal** (`/dashboard/staff`)~~ ✅ ADMIN_HR y CHIEF ven la página; ADMIN_HR todo el personal, CHIEF solo personal de sus áreas (según UserArea)
3. **Asignar jefes a áreas** desde UI (crear/editar UserArea cuando ADMIN_HR asigna un jefe a un área)
4. **Completar vistas de detalle** de organización
5. **Testing manual** de flujos CRUD

## Prioridad 1: Completar Dashboard ADMIN_HR

- Gestión de Áreas ✅
- Gestión de Tipos de Turno ✅
- Gestión de Tarifas/Contratos ✅
- Gestión de Personal (staff page activa; falta UI para asignar jefes a áreas)
- Dashboard con métricas reales

## Prioridad 2: SUPER_ADMIN

- Layout y Sidebar ✅
- Historial de pagos
- Sistema de notificaciones
- Export a Excel/PDF

## Prioridad 3: Auth y Testing

- Onboarding funcional
- Middleware robusto
- Testing manual completo
