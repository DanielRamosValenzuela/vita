# Sistema de Validación de Documentos, Múltiples Emails e Imágenes

**Fecha**: 2 Febrero 2026  
**Estado**: ✅ Implementado

---

## Resumen

Sistema completo para gestionar:

1. **Documentos únicos por organización**
2. **Múltiples emails por usuario**
3. **Imágenes de perfil** (Google OAuth + subida personalizada)
4. **Historial de documentos** (auditoría)

---

## 1. Sistema de Documentos Únicos

### Reglas de Validación

**Sin organización**:

- ✅ Dos personas pueden tener el mismo número de documento
- ⚠️ Solo si **no** pertenecen a ninguna organización

**Con organización**:

- ❌ El número debe ser **único dentro de cada organización**
- ❌ Error al invitar si ya existe en la org
- ❌ Error al modificar si ya existe en alguna org del usuario
- ✅ Puede estar duplicado en organizaciones diferentes

### Flujos Implementados

#### Caso 1: Invitar Usuario a Organización

**Validaciones**:

1. Usuario ya tiene cuenta en plataforma
2. Usuario tiene número de documento registrado
3. Documento NO existe en la organización destino
4. Usuario no está en otra organización actualmente

**Archivos**:

- `features/admin-hr/api/invitation-actions.ts` (CHIEF y STAFF)
- `features/super-admin/api/admin-hr-invitation-actions.ts` (ADMIN_HR)

**Código**:

```typescript
// En inviteChiefAction, inviteStaffAction, inviteAdminHRAction
if (user.country && user.docType && user.docNumber) {
  const docExists = await checkDocumentExistsInOrganization(
    user.country,
    user.docType,
    user.docNumber,
    organizationId,
    userId
  )

  if (docExists) {
    return {
      success: false,
      error: `El documento ${user.docNumber} ya está registrado en esta organización por otro usuario`,
    }
  }
}
```

#### Caso 2: Modificar Documento en Perfil

**Validaciones**:

1. Usuario tiene organización → validar unicidad en la org
2. Usuario sin organización → validar solo globalmente
3. Guardar historial del documento anterior

**Archivo**: `features/profile/data/profile-repository.ts`

**Código**:

```typescript
// Validar en organización
if (user.organizationId) {
  const existingInOrg = await prisma.user.findFirst({
    where: {
      AND: [
        { id: { not: userId } },
        { organizationId: user.organizationId },
        { country },
        { docNumber: cleanDocNumber },
      ],
    },
  })

  if (existingInOrg) {
    return {
      error: `Este número ya está registrado en tu organización (${existingInOrg.name})`,
    }
  }
}

// Guardar historial
if (user.docNumber) {
  await prisma.userDocumentHistory.create({
    data: {
      userId,
      country: user.country,
      docType: user.docType,
      docNumber: user.docNumber,
      validFrom: user.createdAt,
      validUntil: new Date(),
      changeReason: 'change',
    },
  })
}
```

### Tabla: UserDocumentHistory

```prisma
model UserDocumentHistory {
  id           String    @id @default(cuid())
  userId       String
  country      Country
  docType      DocType
  docNumber    String
  validFrom    DateTime  @default(now())
  validUntil   DateTime?
  changeReason String?   // "initial", "correction", "change"
  createdAt    DateTime  @default(now())
  user         User      @relation(...)
}
```

**Propósito**: Solo auditoría, NO se valida contra el historial.

---

## 2. Sistema de Múltiples Emails

### Schema

```prisma
model UserEmail {
  id          String         @id @default(cuid())
  userId      String
  email       String         @unique
  isPrimary   Boolean        @default(false)
  isVerified  Boolean        @default(false)
  provider    EmailProvider? // GOOGLE, CREDENTIALS, GITHUB, etc.
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
  user        User           @relation(...)
}

enum EmailProvider {
  GOOGLE
  CREDENTIALS
  GITHUB
  FACEBOOK
  APPLE
}
```

### Reglas

1. **Email principal** (`User.email`):
   - Mantiene compatibilidad con NextAuth
   - Es el email primario en `UserEmail` con `isPrimary = true`
   - Solo UN email puede ser primario

2. **Agregar email**:
   - Debe ser único globalmente
   - Se crea como NO verificado
   - Provider se detecta automáticamente

3. **Establecer como primario**:
   - Solo si está verificado
   - Actualiza `User.email` al nuevo primario
   - Marca el anterior como NO primario

4. **Eliminar email**:
   - No se puede eliminar el primario
   - Solo el dueño puede eliminarlo

### Acciones

**Archivo**: `features/profile/api/email-actions.ts`

- `getUserEmailsAction()` - Obtiene todos los emails del usuario
- `addEmailAction(email)` - Agrega nuevo email
- `removeEmailAction(emailId)` - Elimina email secundario
- `setPrimaryEmailAction(emailId)` - Establece email como principal

### UI

**Componente**: `features/profile/ui/emails-management-section.tsx`

Características:

- ✅ Lista de emails con badges (Primario, Verificado, Provider)
- ✅ Agregar email con validación en tiempo real
- ✅ Marcar como primario (solo verificados)
- ✅ Eliminar emails secundarios
- ✅ Confirmación antes de eliminar

---

## 3. Sistema de Imágenes de Perfil

### Schema

```prisma
model User {
  image            String?           // OAuth (Google, GitHub)
  customImage      String?           // Supabase Storage
  imageProvider    ImageProvider?    // Último usado
}

enum ImageProvider {
  OAUTH       // Google, GitHub
  UPLOAD      // Supabase Storage
  GRAVATAR    // Futuro
}
```

### Prioridad de Imagen

```typescript
function getProfileImage(user: User): string | null {
  if (user.customImage) return user.customImage // 1. Custom (prioritario)
  if (user.image) return user.image // 2. OAuth
  return null // 3. Initials (UI)
}
```

### Supabase Storage

**Bucket**: `avatars` (público)

**Estructura**:

```
avatars/
  {userId}/
    avatar.jpg
    avatar.png
```

**Políticas RLS**:

- Usuarios pueden subir/actualizar/eliminar solo su avatar
- Todos pueden ver avatars (público)

### Acciones

**Archivo**: `features/profile/api/profile-image-actions.ts`

- `uploadAvatarAction(formData)` - Sube imagen a Supabase
- `deleteAvatarAction()` - Elimina imagen custom

### UI

**Componente**: `features/profile/ui/avatar-upload-form.tsx`

Características:

- ✅ Preview de imagen actual (custom > OAuth > initials)
- ✅ Subida drag & drop / click
- ✅ Validación: tamaño (5MB) y formato (image/\*)
- ✅ Preview instantáneo antes de subir
- ✅ Botón eliminar (solo para custom)
- ✅ Loading state durante upload

### Helpers

**Archivo**: `shared/lib/utils/profile-image.ts`

```typescript
getUserInitials(name: string): string
getProfileImageUrl(user: UserImageData): string | null
getProfileImageSource(user: UserImageData): ImageProvider | 'INITIALS'
buildAvatarUrl(user: UserImageData): { url, fallback, source }
```

---

## 4. Cambios en el Sistema de Autenticación

### NextAuth Types

**Archivo**: `types/next-auth.d.ts`

```typescript
interface User {
  customImage?: string // ← Nuevo
}

interface Session {
  user: {
    customImage?: string // ← Nuevo
  }
}

interface JWT {
  customImage?: string // ← Nuevo
}
```

### Auth Config

**Archivo**: `shared/lib/auth/config.ts`

```typescript
// En jwt callback
if (user) {
  token.customImage = user.customImage
}

// En session callback
session.user.customImage = token.customImage
```

---

## 5. Casos de Uso Completos

### Caso 1: Usuario Sin Organización Cambia Documento

```
Usuario A: docNumber = "12345678", organizationId = null
```

**Acción**: Cambiar a "87654321"

**Validación**:

- ✅ No tiene organización → solo validar globalmente
- ✅ "87654321" no existe → OK

**Resultado**:

- ✅ Se actualiza el documento
- ✅ Se guarda en historial

### Caso 2: ADMIN_HR Invita Usuario con Documento Duplicado

```
Usuario A: docNumber = "12345678", organizationId = "org-123"
Usuario B: docNumber = "12345678", organizationId = null
```

**Acción**: ADMIN_HR de org-123 invita a Usuario B

**Validación**:

- ❌ "12345678" ya existe en org-123 (Usuario A)

**Resultado**:

- ❌ Error: "El documento 12345678 ya está registrado en esta organización por otro usuario"

### Caso 3: Usuario Tiene 2 Organizaciones

```
Usuario A:
  - docNumber = "12345678"
  - organizationId = "org-123"
```

**Acción**: Cambiar documento a "87654321" que ya existe en org-123

**Validación**:

- ❌ "87654321" ya existe en org-123

**Resultado**:

- ❌ Error: "Este número de documento ya está registrado en tu organización (Nombre del otro usuario)"

### Caso 4: Usuario Agrega Email Ya Registrado

```
Usuario A: email = "juan@email.com"
Usuario B: intenta agregar "juan@email.com"
```

**Resultado**:

- ❌ Error: "Este email ya está en uso por otro usuario"

### Caso 5: Usuario Establece Email Secundario como Primario

```
Usuario A:
  - Email primario: "juan@email.com" (verificado)
  - Email secundario: "juan@trabajo.com" (verificado)
```

**Acción**: Establecer "juan@trabajo.com" como primario

**Resultado**:

- ✅ "juan@trabajo.com" → `isPrimary = true`
- ✅ "juan@email.com" → `isPrimary = false`
- ✅ `User.email` = "juan@trabajo.com"

---

## 6. Archivos Creados/Modificados

### Schema

- ✅ `prisma/schema.prisma` - Nuevos modelos y campos

### Validación

- ✅ `shared/lib/validation/document-validation.ts` - Validaciones de documento
- ✅ `shared/lib/validation/index.ts` - Exports

### Storage

- ✅ `shared/lib/storage/supabase-storage.ts` - Cliente de Supabase
- ✅ `shared/lib/storage/index.ts` - Exports

### Utils

- ✅ `shared/lib/utils/profile-image.ts` - Helpers de imagen
- ✅ `shared/config/env.server.ts` - Variables Supabase

### API Actions

- ✅ `features/profile/api/email-actions.ts` - CRUD de emails
- ✅ `features/profile/api/profile-image-actions.ts` - Upload/delete avatar
- ✅ `features/profile/data/profile-repository.ts` - Historial de documentos
- ✅ `features/admin-hr/api/invitation-actions.ts` - Validación en invitaciones
- ✅ `features/super-admin/api/admin-hr-invitation-actions.ts` - Validación en invitaciones

### UI Components

- ✅ `features/profile/ui/avatar-upload-form.tsx` - Subida de avatar
- ✅ `features/profile/ui/emails-management-section.tsx` - Gestión de emails
- ✅ `shared/ui/avatar.tsx` - Componente Avatar (shadcn/ui)

### Pages

- ✅ `app/[locale]/dashboard/profile/page.tsx` - Incluye nuevas secciones

### Types

- ✅ `types/next-auth.d.ts` - Soporte customImage
- ✅ `types/currentUser.ts` - Soporte customImage
- ✅ `shared/lib/auth/types.ts` - Soporte customImage
- ✅ `shared/lib/auth/config.ts` - JWT y Session con customImage
- ✅ `shared/lib/auth/session.ts` - getCurrentUser con customImage

### Traducciones

- ✅ `messages/es.json` - Traducciones completas
- ✅ `messages/en.json` - Traducciones completas

### Documentacion

- `prisma/schema.prisma` - Modelos UserEmail, UserDocumentHistory, campos de imagen en User

---

## 7. Configuracion de Supabase Storage (Avatares)

### Variables de Entorno

Agrega a `.env`:

```env
SUPABASE_URL="https://tu-proyecto.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key-aqui"
```

Obtener credenciales: Supabase Dashboard > Settings > API > Project URL y service_role key.

### Crear Bucket

1. Dashboard > Storage > New bucket > Nombre: `avatars` > Publico: activado

O via SQL:

```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
```

### Estructura de archivos: `avatars/{userId}/avatar.jpg`

### Limites: 5MB por imagen, formatos JPG/PNG/GIF/WebP. Free tier Supabase: 1GB almacenamiento, 2GB transferencia/mes.

---

## 8. Casos de Uso Detallados

### Escenario A: Hospital Invita Dos Médicos con Mismo RUT

**Contexto**:

- Dr. Juan Pérez: RUT 12.345.678-9
- Dr. Pedro López: También registró RUT 12.345.678-9 (error humano)
- Ambos sin organización

**Flujo**:

1. ADMIN_HR invita a Dr. Juan → ✅ Aceptado
2. ADMIN_HR invita a Dr. Pedro → ❌ Error: "El documento 12345678-9 ya está registrado en esta organización"

**Resultado**: El hospital detecta el error y puede corregirlo antes de contratar.

### Escenario B: Médico Trabaja en 2 Hospitales

**Contexto**:

- Dra. María González: RUT 98.765.432-1
- Trabaja en Hospital A (org-123)
- Quiere trabajar en Hospital B (org-456)

**Flujo**:

1. Hospital A la contrató con RUT 98.765.432-1 → ✅
2. Hospital B la invita → ✅ Puede aceptar (organizaciones diferentes)
3. Tiene mismo RUT en ambas organizaciones → ✅ Válido

**Restricción actual**: Schema actual solo permite 1 organización. Para múltiples orgs necesitamos refactorizar a tabla pivot `UserOrganization`.

### Escenario C: Usuario Agrega Email de Google

**Contexto**:

- Juan: Registrado con juan@email.com (credentials)
- Tiene cuenta Google: juan.perez@gmail.com

**Flujo**:

1. Va a `/dashboard/profile`
2. Click en "Vincular con Google" (futuro)
3. OAuth de Google → obtiene juan.perez@gmail.com
4. Sistema crea:
   - `UserEmail` con provider = GOOGLE, isVerified = true
   - `Account` en NextAuth
5. Ahora puede login con Google O credentials

**Estado actual**: UI creada, falta implementar OAuth flow para vincular.

---

## 9. Mejoras Futuras (No Implementadas)

### Corto Plazo

- [ ] Botón "Vincular con Google" en pantalla de perfil
- [ ] Verificación de email por código
- [ ] Envío de email de confirmación
- [ ] Soporte para múltiples organizaciones por usuario

### Mediano Plazo

- [ ] Redimensionamiento automático de imágenes
- [ ] Conversión a WebP
- [ ] Thumbnails (128x128px)
- [ ] CDN edge caching

### Largo Plazo

- [ ] Gravatar fallback
- [ ] Detección de duplicados de documentos con IA
- [ ] Historial de cambios de email
- [ ] 2FA con email secundario

---

## 10. Testing Manual

### Test 1: Validación de Documento en Invitación

1. Usuario A se registra con RUT 12.345.678-9
2. ADMIN_HR invita a Usuario A → ✅ OK
3. Usuario A acepta invitación → ✅ OK
4. Usuario B se registra con RUT 12.345.678-9 (sin org)
5. ADMIN_HR invita a Usuario B → ❌ Error mostrado
6. Usuario B cambia RUT a 11.111.111-1
7. ADMIN_HR invita a Usuario B → ✅ OK

### Test 2: Subida de Avatar

1. Login → ir a `/dashboard/profile`
2. Ver imagen de Google (si existe)
3. Click "Subir foto" → seleccionar imagen JPG < 5MB
4. Imagen se sube y muestra inmediatamente
5. Click "Eliminar" → vuelve a imagen de Google
6. Si no hay imagen Google → muestra initials

### Test 3: Agregar Email Secundario

1. Ir a `/dashboard/profile`
2. Sección "Emails de Cuenta"
3. Ingresar nuevo@email.com
4. Click "Agregar Email"
5. Email aparece como "No verificado"
6. Intentar establecer como primario → ❌ Error (no verificado)

---

**Última actualización**: 2 Feb 2026, 23:20 hrs
