# Configuración de Supabase Storage para Imágenes de Perfil

**Fecha**: 2 Febrero 2026  
**Estado**: 🚧 Configuración Requerida

---

## Variables de Entorno Necesarias

Agrega estas variables a tu archivo `.env`:

```env
# Supabase (para Storage de imágenes)
SUPABASE_URL="https://tu-proyecto.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key-aqui"
```

---

## Dónde Obtener las Credenciales

### 1. SUPABASE_URL

1. Ve a tu proyecto en [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Ve a **Settings** > **API**
3. Copia el **Project URL** (ejemplo: `https://tkfsyqywlojjztkewonv.supabase.co`)

### 2. SUPABASE_SERVICE_ROLE_KEY

1. En la misma página de **Settings** > **API**
2. Busca **service_role** key (⚠️ NO uses la `anon` key)
3. Revela y copia la key completa
4. ⚠️ **IMPORTANTE**: Esta key tiene permisos completos, NUNCA la expongas en el frontend

---

## Crear el Bucket de Avatars

### Opción A: Dashboard (más fácil)

1. Ve a **Storage** en el dashboard de Supabase
2. Click en **New bucket**
3. Nombre: `avatars`
4. Public bucket: ✅ (activar)
5. Click **Create bucket**

### Opción B: SQL (automático)

Ejecuta esto en el SQL Editor de Supabase:

```sql
-- Crear bucket público
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Policy: usuarios autenticados pueden subir su avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: todos pueden ver avatars
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Policy: usuarios pueden actualizar su avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: usuarios pueden eliminar su avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## Estructura de Archivos

Los avatars se guardarán con esta estructura:

```
avatars/
  {userId}/
    avatar.jpg
    avatar.png
    ...
```

Cada usuario solo puede acceder a su propia carpeta debido a las políticas de RLS.

---

## Verificar que Funciona

1. Configura las variables de entorno
2. Reinicia el servidor de desarrollo (`npm run dev`)
3. Ve a `/dashboard/profile`
4. Haz click en "Subir foto"
5. Selecciona una imagen
6. Debería subirse y mostrarse inmediatamente

---

## Límites y Consideraciones

### Supabase Storage (Free Tier)

- **Almacenamiento**: 1 GB
- **Transferencia**: 2 GB/mes
- **Tamaño máximo por archivo**: 50 MB (límite del servicio)

### Límites Configurados en la App

- **Tamaño máximo**: 5 MB por imagen
- **Formatos**: JPG, PNG, GIF, WebP
- **Optimización**: Ninguna (por ahora)

### Mejoras Futuras

- [ ] Redimensionamiento automático a 512x512px
- [ ] Conversión a WebP para mejor compresión
- [ ] Thumbnails (128x128px)
- [ ] CDN de Supabase para carga rápida

---

## Troubleshooting

### Error: "Missing Supabase credentials"

**Solución**: Asegúrate de que las variables están en `.env` y reinicia el servidor.

### Error: "Error al subir la imagen"

**Posibles causas**:

1. Bucket `avatars` no existe → Créalo en el dashboard
2. Políticas RLS no configuradas → Ejecuta el SQL de arriba
3. Service role key incorrecta → Verifica que copiaste la correcta

### La imagen se sube pero no se ve

**Solución**: Asegúrate de que el bucket sea **público** (checkbox activado al crear).

---

**Última actualización**: 2 Feb 2026, 23:15 hrs
