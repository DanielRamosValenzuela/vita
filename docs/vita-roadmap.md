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
| 7 | Dashboard ADMIN_HR | Completado |
| 8 | Dashboard CHIEF_AREA | Parcial |
| 9 | Dashboard STAFF_HEALTH | Parcial |
| 10 | Seguridad y Upload | Completado |
| 11 | Calendario Visual | Completado |
| 12 | Perfiles de Usuario Avanzados | Completado |
| 13 | Sistema de Notificaciones | Pendiente |
| 14 | Testing y Pulido | Pendiente |

## Próximos Pasos Inmediatos (Feb 2026)

1. ~~**UserArea en schema**~~ ✅ Chief ↔ Área (modelo UserArea, migración aplicada)
2. ~~**Gestión de Personal** (`/dashboard/staff`)~~ ✅ ADMIN_HR y CHIEF ven la página; ADMIN_HR todo el personal, CHIEF solo personal de sus áreas (según UserArea)
3. ~~**Asignar jefes a áreas**~~ ✅ UI completa desde tabla de jefes (ChiefAreaSelector)
4. ~~**Sistema de Tarifas Flexibles**~~ ✅ Schema, backend API, UI completo con presets
5. ~~**Sistema de Perfiles Avanzados**~~ ✅ Validación documentos únicos, múltiples emails, imágenes personalizadas
6. **UI para gestión del calendario organizacional** (marcar feriados)
7. **Implementar cálculo de pagos** (usar RateComponent en Shift)
8. **Testing manual** de flujos CRUD de tarifas y contratos

## Prioridad 1: Completar Dashboard ADMIN_HR ✅

- Gestión de Áreas ✅
- Gestión de Tipos de Turno ✅
- Gestión de Tarifas/Contratos ✅
  - **Sistema de Tarifas Flexibles** ✅ (v2.0)
    - Plantillas de tarifas con componentes
    - 18 tipos de componentes + custom
    - Presets predefinidos (guardia, seguridad, etc.)
    - Formateo dinámico por moneda/país
    - Calendario organizacional para días especiales
- Gestión de Personal ✅
  - **Módulo simplificado** ✅ (solo visualización)
  - Link directo a Tarifas para gestión de contratos
- Dashboard con métricas reales ✅
- Asignación de jefes a áreas ✅

## Prioridad 1.5: Perfiles de Usuario ✅

- **Sistema de Validación de Documentos**
  - Documentos únicos por organización ✅
  - Validación en invitaciones y actualizaciones ✅
  - Historial de cambios de documento (auditoría) ✅
- **Sistema de Múltiples Emails**
  - Múltiples emails por usuario ✅
  - Email principal y secundarios ✅
  - Preparado para vinculación OAuth ✅
- **Sistema de Imágenes Personalizadas**
  - Integración con Supabase Storage ✅
  - Upload/delete de avatares (2MB max) ✅
  - Prioridad: Custom > OAuth > Iniciales ✅
  - RLS policies configuradas ✅

## Prioridad 2: SUPER_ADMIN

- Layout y Sidebar ✅
- Historial de pagos
- Sistema de notificaciones
- Export a Excel/PDF

## Prioridad 3: Auth y Testing

- Onboarding funcional
- Middleware robusto
- Testing manual completo
