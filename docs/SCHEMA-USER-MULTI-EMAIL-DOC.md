# Schema: Sistema de Múltiples Emails, Historial de Documentos e Imágenes

**Fecha**: 2 Febrero 2026  
**Estado**: 🚧 En Diseño

---

## Problemática

1. **Número de Documento único por organización**:
   - Sin organización: pueden repetirse
   - Con organización: debe ser único dentro de cada org
   - Error al invitar si ya existe en la org
   - Error al modificar si ya existe en alguna org del usuario

2. **Múltiples emails por usuario**:
   - Usuario puede registrar varios emails
   - Un email puede tener cuenta Google (OAuth)
   - Un email puede ser credentials
   - Un email es primario

3. **Imágenes de perfil**:
   - Imagen de Google (OAuth)
   - Imagen subida por usuario (Supabase Storage)
   - Prioridad: Custom > Google > Initials

4. **Historial de números de documento**:
   - Guardar cambios históricos
   - Solo para auditoría, no validar

---

## Schema Propuesto

### 1. UserEmail (Nueva Tabla)

```prisma
model UserEmail {
  id          String   @id @default(cuid())
  userId      String
  email       String   @unique
  isPrimary   Boolean  @default(false)
  isVerified  Boolean  @default(false)
  provider    EmailProvider?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([email])
  @@unique([userId, isPrimary])  // Solo un email primario por usuario
}

enum EmailProvider {
  GOOGLE
  CREDENTIALS
  GITHUB
  // ... otros providers de NextAuth
}
```

**Reglas**:

- Solo UN email puede tener `isPrimary = true` por usuario
- `User.email` mantiene compatibilidad con NextAuth (es el primario)
- Al agregar email de Google, crear también `Account` en NextAuth

### 2. UserDocumentHistory (Nueva Tabla)

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

  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([docNumber])
}
```

**Reglas**:

- Al crear usuario: crear registro con `validFrom = now()`
- Al modificar documento:
  - Cerrar registro anterior (`validUntil = now()`)
  - Crear nuevo registro con nuevo documento
- **NO validar** unicidad por org en historial (solo auditoría)

### 3. Modificaciones a User

```prisma
model User {
  // ... campos existentes ...

  // Modificaciones para imágenes
  image            String?           // OAuth image (Google, GitHub, etc.)
  customImage      String?           // Supabase Storage URL
  imageProvider    ImageProvider?    // Último proveedor usado

  // Nuevas relaciones
  emails               UserEmail[]
  documentHistory      UserDocumentHistory[]
}

enum ImageProvider {
  OAUTH       // Google, GitHub, etc.
  UPLOAD      // Supabase Storage
  GRAVATAR    // Gravatar (futuro)
}
```

**Prioridad de imagen**:

1. `customImage` (si existe) ← Supabase Storage
2. `image` (OAuth) ← Google
3. Initials fallback (UI)

### 4. Validación de Documento Único por Org

**Helper Function**:

```typescript
async function validateDocumentUniqueness(
  userId: string,
  country: Country,
  docType: DocType,
  docNumber: string
): Promise<ValidationResult> {
  // 1. Obtener todas las organizaciones del usuario
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      organization: true,
      // Si puede estar en múltiples orgs, incluir relación
    },
  })

  // 2. Verificar si el documento ya existe en alguna org del usuario
  const conflicts = await prisma.user.findMany({
    where: {
      AND: [
        { country, docType, docNumber },
        { organizationId: { in: userOrgIds } },
        { id: { not: userId } }, // Excluir el mismo usuario
      ],
    },
    include: { organization: true },
  })

  if (conflicts.length > 0) {
    return {
      valid: false,
      error: `El documento ya existe en: ${conflicts.map((c) => c.organization.name).join(', ')}`,
    }
  }

  return { valid: true }
}
```

---

## Flujos de Validación

### Caso 1: Invitación por ADMIN_HR

```typescript
// En inviteChiefAction o inviteStaffAction
async function inviteUser(organizationId: string, userId: string) {
  // 1. Obtener datos del usuario
  const user = await prisma.user.findUnique({ where: { id: userId } })

  // 2. Verificar si tiene documento
  if (!user.docNumber) {
    // Enviar invitación, pero marcar que debe completar perfil
    return { requiresDocumentCompletion: true }
  }

  // 3. Verificar si el documento ya existe en esta org
  const existingUser = await prisma.user.findFirst({
    where: {
      country: user.country,
      docType: user.docType,
      docNumber: user.docNumber,
      organizationId: organizationId,
      id: { not: userId },
    },
  })

  if (existingUser) {
    return {
      success: false,
      error: `El documento ${user.docNumber} ya existe en esta organización (${existingUser.name})`,
    }
  }

  // 4. Proceder con invitación
  // ...
}
```

### Caso 2: Modificación de Documento en Perfil

```typescript
async function updateUserDocument(
  userId: string,
  newCountry: Country,
  newDocType: DocType,
  newDocNumber: string
) {
  // 1. Obtener usuario actual
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { organization: true },
  })

  // 2. Si tiene organización, validar unicidad
  if (user.organizationId) {
    const validation = await validateDocumentUniqueness(
      userId,
      newCountry,
      newDocType,
      newDocNumber
    )

    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      }
    }
  }

  // 3. Guardar en historial
  if (user.docNumber) {
    await prisma.userDocumentHistory.create({
      data: {
        userId,
        country: user.country!,
        docType: user.docType!,
        docNumber: user.docNumber,
        validFrom: user.createdAt,
        validUntil: new Date(),
        changeReason: 'change',
      },
    })
  }

  // 4. Actualizar usuario
  await prisma.user.update({
    where: { id: userId },
    data: {
      country: newCountry,
      docType: newDocType,
      docNumber: newDocNumber,
    },
  })

  // 5. Crear nuevo registro de historial
  await prisma.userDocumentHistory.create({
    data: {
      userId,
      country: newCountry,
      docType: newDocType,
      docNumber: newDocNumber,
      changeReason: 'change',
    },
  })
}
```

### Caso 3: Agregar Email con Vinculación Google

```typescript
async function addGoogleEmail(userId: string) {
  // 1. Iniciar flujo OAuth de Google
  // 2. Al completar OAuth, agregar email a UserEmail
  await prisma.userEmail.create({
    data: {
      userId,
      email: googleEmail,
      isVerified: true,
      provider: 'GOOGLE',
    },
  })

  // 3. Crear Account en NextAuth para OAuth
  await prisma.account.create({
    data: {
      userId,
      type: 'oauth',
      provider: 'google',
      providerAccountId: googleId,
      // ... otros datos de Google
    },
  })
}
```

---

## Supabase Storage: Configuración

### Bucket: `avatars`

```sql
-- Crear bucket público para avatars
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true);

-- Policy: usuarios autenticados pueden subir su avatar
create policy "Users can upload their own avatar"
on storage.objects for insert
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: todos pueden ver avatars (público)
create policy "Avatars are publicly accessible"
on storage.objects for select
using (bucket_id = 'avatars');

-- Policy: usuarios pueden actualizar su avatar
create policy "Users can update their own avatar"
on storage.objects for update
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: usuarios pueden eliminar su avatar
create policy "Users can delete their own avatar"
on storage.objects for delete
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);
```

**Estructura de paths**:

```
avatars/
  {userId}/
    avatar.jpg          ← Imagen principal
    avatar-thumb.jpg    ← Thumbnail (opcional)
```

---

## Funciones Helper

### `getProfileImage(user: User): string`

```typescript
export function getProfileImage(user: User): string {
  // 1. Imagen custom (prioritaria)
  if (user.customImage) {
    return user.customImage
  }

  // 2. Imagen OAuth (Google, etc.)
  if (user.image) {
    return user.image
  }

  // 3. Gravatar (futuro)
  // if (user.email) {
  //   return getGravatarUrl(user.email)
  // }

  // 4. Initials fallback (se maneja en UI)
  return null
}
```

### `uploadUserAvatar(userId: string, file: File): Promise<string>`

```typescript
export async function uploadUserAvatar(userId: string, file: File) {
  // 1. Validar archivo (tipo, tamaño)
  if (!file.type.startsWith('image/')) {
    throw new Error('El archivo debe ser una imagen')
  }

  if (file.size > 5 * 1024 * 1024) {
    // 5MB
    throw new Error('La imagen no debe superar 5MB')
  }

  // 2. Subir a Supabase Storage
  const ext = file.name.split('.').pop()
  const path = `${userId}/avatar.${ext}`

  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true })

  if (error) throw error

  // 3. Obtener URL pública
  const {
    data: { publicUrl },
  } = supabase.storage.from('avatars').getPublicUrl(path)

  // 4. Actualizar usuario
  await prisma.user.update({
    where: { id: userId },
    data: {
      customImage: publicUrl,
      imageProvider: 'UPLOAD',
    },
  })

  return publicUrl
}
```

---

## Próximos Pasos

1. ✅ Crear migración Prisma
2. ⏳ Implementar validaciones de documento
3. ⏳ Implementar sistema de múltiples emails
4. ⏳ Implementar subida de imágenes
5. ⏳ Crear UI para gestión de emails
6. ⏳ Crear UI para subida de avatar
7. ⏳ Actualizar componentes existentes

---

**Última actualización**: 2 Feb 2026, 22:30 hrs
