# Modelo de Negocio VITA

## SaaS Multi-Tenant B2B

**Target Principal:** Hospitales y clínicas en Chile

**Cómo Funciona:**

1. **Venta B2B:** Vendemos directamente a hospitales/clínicas, no a usuarios individuales
2. **Cobro Mensual:** Facturación manual según usuarios activos de cada organización
3. **Implementación:** Onboarding asistido + capacitación + soporte
4. **Pricing Flexible:** Cada hospital negocia según sus necesidades específicas

## Modelo de Pricing (B2B Negociado)

**IMPORTANTE:** No hay planes fijos. Cada hospital tiene pricing personalizado.

**Calculadora de Precios (Referencia Pública):**

```
Costo Base: $200 USD/mes
(Incluye: Plataforma + 5 cuentas ADMIN_HR gratis)

+ Personal de Salud (STAFF_HEALTH): $15 USD/mes por persona
+ Jefes de Área (CHIEF_AREA): $40 USD/mes por jefe
```

**Ejemplos de Pricing:**

| Organización         | Staff | Chiefs | HR         | Cálculo                     | Total/Mes      |
| -------------------- | ----- | ------ | ---------- | --------------------------- | -------------- |
| **Clínica Pequeña**  | 30    | 3      | 5 (gratis) | $200 + (30×$15) + (3×$40)   | **$770 USD**   |
| **Hospital Mediano** | 80    | 10     | 5 (gratis) | $200 + (80×$15) + (10×$40)  | **$1,800 USD** |
| **Hospital Grande**  | 200   | 25     | 5 (gratis) | $200 + (200×$15) + (25×$40) | **$4,200 USD** |

**Descuentos por Volumen (Negociables):**

- 100+ cuentas: 10% descuento
- 200+ cuentas: 15% descuento
- Contrato anual: 20% descuento adicional

**Cuentas GRATUITAS:**

- `ADMIN_HR` (Recursos Humanos): **5 cuentas gratis** por organización
- `SUPER_ADMIN` (Equipo VITA): Ilimitadas y gratis

## Pool de Cuentas

**Cómo Funciona:**

1. Hospital contrata X cantidad de cuentas (ej: 50 staff + 8 chiefs)
2. `ADMIN_HR` distribuye límites de vinculación entre jefes
3. Cada `CHIEF_AREA` puede vincular hasta su límite asignado
4. La organización paga por cuentas **activas y vinculadas**

**Ejemplo Práctico:**

```
Hospital Clínico Santiago:
- Contrata: 80 staff + 12 chiefs
- Paga: $200 (base) + $1,200 (staff) + $480 (chiefs) = $1,880 USD/mes

Distribución de límites:
├─ Jefe Enfermería UCI: 25 staff máx
├─ Jefe Médicos Urgencia: 20 staff máx
├─ Jefe Kinesiología: 15 staff máx
└─ ...
```

**Facturación:**

- Manual por parte de SUPER_ADMIN
- Registro de pagos en el sistema
- Si no pagan: Alerta en dashboard (NO se suspende automáticamente)
- SUPER_ADMIN decide suspensión manual con razón obligatoria

---

## Límites de Cuentas (Implementación)

### Tipos de Cuentas

| Tipo        | Rol          | Límite   | Costo |
| ----------- | ------------ | -------- | ----- |
| Admin HR    | `ADMIN_HR`   | maxAdminHR (5 gratis) | Gratis |
| Jefes       | `CHIEF_AREA` | maxChiefs | $$    |
| Staff       | `STAFF_HEALTH` | maxStaff | $   |

### Campos en Base de Datos

- `maxAdminHR`, `maxChiefs`, `maxStaff` en Organization
- Validación al invitar usuarios
- Badges de advertencia cuando se acerquen al límite

### Futuras Mejoras

- Pool vs pago por activos
- Staff multi-organización
- Tipos de turno: ADMIN_HR crea globales, CHIEF crea para sus áreas
- Gestión de Personal (`/dashboard/staff`): ADMIN_HR y CHIEF con alcances distintos
