# Sistema de Roles VITA

## Jerarquía

```
SUPER_ADMIN (Equipo VITA)
    │
    ▼
ORGANIZACIÓN (Hospital/Clínica)
    │
    ├── ADMIN_HR (Recursos Humanos - 5 gratis)
    │       │
    │       ▼
    └── CHIEF_AREA (Jefes de Área - SE COBRA)
            │
            ▼
        STAFF (Personal de Salud - SE COBRA)
```

## SUPER_ADMIN

**Scope:** Global (todas las organizaciones)

**Funcionalidades:**

- Dashboard con métricas: organizaciones activas, ingresos, usuarios totales
- CRUD de organizaciones
- Registro manual de pagos
- Suspensión/reactivación de organizaciones (con razón obligatoria)
- Historial de pagos y eventos

**NO puede:** Ver datos internos de turnos de una organización, crear usuarios dentro de organizaciones

---

## ADMIN_HR (Recursos Humanos)

**Scope:** Una organización específica

**Funcionalidades:**

- **Áreas:** Crear áreas (Enfermería UCI, Médicos Urgencia, etc.)
- **Tipos de Turno:** Crear tipos globales disponibles para todos los jefes
- **Gestión de Personal:** Página `/dashboard/staff` - Ver todo (staff y jefes), asignar/cambiar área a staff y jefes. Solo ADMIN_HR cambia áreas de jefes.
- **Pool de Cuentas:** Asignar límites a cada `CHIEF_AREA`
- **Tarifas:** Configurar tarifa por persona (día/noche, bonos, multiplicadores)
- **Reportes:** Ver resumen de turnos y horas trabajadas

**NO puede:** Asignar turnos directamente, ver calendario detallado del personal

---

## CHIEF_AREA (Jefe de Área)

**Scope:** Su área específica (ej: Enfermería UCI)

**Funcionalidades Principales:**

1. **Vinculación de Personal:** Ingresa código, personal aprueba, puede desvincular
2. **Gestión de Personal:** Página `/dashboard/staff` - Ve solo staff de sus áreas. Puede asignar/cambiar área al staff. No puede cambiar áreas de jefes.
3. **Tipos de Turno:** Usa globales (HR) o crea específicos para sus áreas (isGlobal=false)
4. **Asignación de Turnos:** Manual o abiertos, calendario de su equipo
5. **Aprobaciones:** Intercambios, postulaciones, override de validaciones legales
6. **Asistencia:** Acreditar manualmente (MVP1)

**NO puede:** Ver turnos de otras áreas, modificar tarifas, crear cuentas de otros jefes

---

## STAFF (Personal de Salud)

**Scope:** Multi-organización (puede trabajar en varios hospitales)

**Características Únicas:**

- **Código de Vinculación:** Al crear cuenta obtiene código único
- **Calendario Unificado:** Ve turnos de TODAS las organizaciones donde trabaja
- **Alertas de Conflicto:** Si tiene turnos superpuestos en distintos hospitales

**Funcionalidades:**

1. **Vinculaciones:** Aprueba/rechaza solicitudes
2. **Turnos:** Calendario mensual, filtros por organización, badges por tipo
3. **Postulaciones:** Ve turnos abiertos, postula con mensaje
4. **Intercambios:** Solicita a compañero, jefe aprueba
5. **Notificaciones:** Turno asignado, intercambiado, recordatorio 24h antes
