# Problemas de UI/UX

**Fecha**: 2026-03-05
**Estado**: Completado

---

### [ALTO] UX-001: Clave i18n expuesta al usuario en pagina de Tarifas -- RESUELTO (pre-existente)

- **Ubicacion:** `/es/dashboard/rates` - seccion "Fecha de facturacion"
- **Rol:** ADMIN_HR
- **Test Case:** TC-UX-004
- **Descripcion:** El boton muestra el literal `payroll.billingDay.~common.save` en vez de texto traducido.
- **Impacto:** Apariencia no profesional, confuso para el usuario
- **Ubicacion Codigo:** `src/features/admin-hr/ui/billing-day-config.tsx:68`
- **Correccion:** Ver BUG-003 en `02-bugs.md`

---

### [MEDIO] UX-002: Signout page en ingles (NextAuth default) -- RESUELTO (fix: signOut redirect:true callbackUrl login)

- **Ubicacion:** `/api/auth/signout`
- **Rol:** Todos
- **Test Case:** TC-AUTH-004
- **Descripcion:** La pagina de confirmacion de cierre de sesion de NextAuth muestra "Signout" / "Are you sure you want to sign out?" / "Sign out" en ingles puro.
- **Impacto:** Rompe la consistencia i18n del sistema (todo en espanol excepto esta pagina)
- **Ubicacion Codigo:**
  - Buscar customizacion de `pages.signOut` en NextAuth config
  - Actualmente usa la pagina default de NextAuth sin traduccion
- **Correccion sugerida:** Crear pagina custom `/es/logout` o interceptar el signOut para no mostrar pagina de confirmacion (usar `signOut({ redirect: true, callbackUrl: '/es/login' })` directamente sin pagina intermedia)

---

### [MEDIO] UX-003: Tabla de personal en Organizacion sin paginacion -- RESUELTO (fix: useClientPagination 10/page)

- **Ubicacion:** `/es/dashboard/admin-hr/organization` - seccion "Personal de Salud"
- **Rol:** ADMIN_HR
- **Test Case:** TC-AH-002
- **Descripcion:** La tabla de 52 miembros de staff se renderiza completa sin paginacion, creando una pagina muy larga.
- **Impacto:** Scroll excesivo, pagina lenta con muchos registros
- **Ubicacion Codigo:** Componente de organizacion en `src/features/admin-hr/` - la tabla de personal
- **Correccion sugerida:** Agregar paginacion (10-20 por pagina) similar a la tabla de Staff en `/es/dashboard/staff`

---

### [BAJO] UX-004: Encabezado de pagina duplicado en varias secciones -- RESUELTO (fix: eliminados headers duplicados en areas, shift-types, sectors)

- **Ubicacion:** `/es/dashboard/areas`, `/es/dashboard/shift-types`, `/es/dashboard/sectors`
- **Rol:** ADMIN_HR
- **Test Case:** TC-UX General
- **Descripcion:** El titulo y descripcion aparecen duplicados: una vez como heading de pagina y otra vez dentro del Card. Por ejemplo en Areas: "Gestion de Areas" + "Administra las areas de tu organizacion" aparece 2 veces.
- **Impacto:** Redundancia visual, desperdicio de espacio
- **Ubicacion Codigo:** Revisar componentes de layout de pagina vs componentes Card internos
- **Correccion sugerida:** Eliminar uno de los dos: o el heading de pagina o el del Card interno

---

### [BAJO] UX-005: Sidebar muestra "Jefe de Sector" en vez de "Jefe de Area" para CHIEF_AREA -- NO ES BUG (comportamiento correcto: UserSector asignado = Jefe de Sector)

- **Ubicacion:** Sidebar del dashboard
- **Rol:** CHIEF_AREA (javer@hospital.infierno.com)
- **Test Case:** TC-CA-001
- **Descripcion:** El sidebar muestra "Jefe de Sector" como subtitulo. Esto es porque el usuario tiene un UserSector asignado, pero su rol en BD es CHIEF_AREA.
- **Impacto:** Confuso si el usuario no es jefe de sector sino de area
- **Ubicacion Codigo:** `app/[locale]/dashboard/layout.tsx:29-30` — logica de `displayRole` basada en `UserSector.count`
- **Correccion sugerida:** Evaluar si mostrar el rol real o el displayRole. Si el usuario tiene ambos roles, mostrar el mas relevante o ambos.

---

### [ALTO] UX-006: Seccion de documento/RUT al final del perfil en vez de arriba -- RESUELTO (fix: DocumentSection movido antes de PersonalInfoForm)

- **Ubicacion:** `/es/dashboard/profile`
- **Rol:** Todos
- **Test Case:** TC-ST-019
- **Pasos para reproducir:**
  1. Login con cualquier cuenta
  2. Navegar a `/es/dashboard/profile`
  3. Observar el orden de las secciones
- **Resultado esperado:** La seccion de "Documento/RUT" y pais deberia estar antes de "Informacion Personal", ya que el pais del documento determina el formato de telefono, moneda y otros campos.
- **Resultado obtenido:** El orden actual es: Foto > Informacion Personal > Cambiar Contrasena > Emails > Invitaciones > Organizaciones > Documento. El documento queda al final, invisible sin scroll.
- **Impacto:** El sistema no puede formatear el telefono segun el pais porque el pais se define en la seccion de documento que esta debajo. El usuario llena informacion personal sin contexto de pais.
- **Ubicacion Codigo:** `app/[locale]/dashboard/profile/page.tsx:92-98` — `<DocumentSection>` es el ultimo componente renderizado
- **Correccion sugerida:**
  ```tsx
  // En app/[locale]/dashboard/profile/page.tsx, mover DocumentSection arriba:
  <AvatarUploadForm ... />
  <DocumentSection ... />   {/* MOVER AQUI - antes de PersonalInfoForm */}
  <PersonalInfoForm ... />
  <ChangePasswordForm />
  <EmailsManagementSection ... />
  // etc.
  ```

---

### [ALTO] UX-007: Calendario de fecha de nacimiento sin selector de ano - imposible elegir fecha lejana -- RESUELTO (fix: captionLayout dropdown + fromYear/toYear)

- **Ubicacion:** `/es/dashboard/profile` - campo "Fecha de Nacimiento"
- **Rol:** Todos
- **Test Case:** TC-ST-019
- **Pasos para reproducir:**
  1. Login con cualquier cuenta
  2. Navegar a `/es/dashboard/profile`
  3. Click en "Selecciona una fecha" (Fecha de Nacimiento)
  4. Intentar seleccionar un ano como 1993
- **Resultado esperado:** Poder seleccionar ano y mes con dropdown (selector rapido)
- **Resultado obtenido:** Solo hay flechitas `< March 2026 >` para avanzar mes a mes. Para llegar a 1993 hay que hacer click ~396 veces en la flecha izquierda. Completamente inutilizable para fecha de nacimiento.
- **Evidencia:** Screenshot muestra calendario con solo navegacion mes a mes, sin dropdown de ano
- **Impacto:** Feature practicamente inutilizable - ningun usuario va a hacer 396 clicks para elegir su fecha de nacimiento
- **Ubicacion Codigo:**
  - `src/features/profile/ui/personal-info-form.tsx:129` — `<Calendar>` sin props de dropdown
  - `src/shared/ui/calendar.tsx:14` — Default es `captionLayout = 'label'`, pero ya soporta `'dropdown'`
- **Correccion sugerida:**
  ```tsx
  // En src/features/profile/ui/personal-info-form.tsx linea 129, cambiar:
  <Calendar
    mode="single"
    captionLayout="dropdown"        // AGREGAR: habilita dropdowns de mes y ano
    fromYear={1920}                  // AGREGAR: limite inferior
    toYear={new Date().getFullYear()} // AGREGAR: limite superior (ano actual)
    selected={birthDate}
    onSelect={(date) => { ... }}
    disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
    initialFocus
  />
  ```

---

### [MEDIO] UX-008: Input de telefono acepta letras y caracteres invalidos -- RESUELTO (fix: onInput filter + maxLength 20)

- **Ubicacion:** `/es/dashboard/profile` - campo "Telefono"
- **Rol:** Todos
- **Test Case:** TC-ST-019
- **Pasos para reproducir:**
  1. Login con cualquier cuenta
  2. Navegar a `/es/dashboard/profile`
  3. Escribir "abcdef123" en el campo Telefono
- **Resultado esperado:** El input solo deberia aceptar numeros, +, espacios, parentesis y guiones. Letras no deberian ser ingresables.
- **Resultado obtenido:** El input acepta "abcdef123" sin problema. La validacion Zod existe (`/^[+]?[0-9\s()-]*$/`) pero solo se ejecuta al hacer submit, no previene el input en tiempo real.
- **Evidencia:** Input muestra "abcdef123" aceptado visualmente
- **Impacto:** Mala experiencia - el usuario puede escribir cualquier cosa y solo se entera del error al guardar
- **Ubicacion Codigo:**
  - `src/features/profile/ui/personal-info-form.tsx:99-104` — Input con `type="tel"` (no previene letras en browsers)
  - `src/features/profile/lib/schemas/personal-info-schema.ts:5-11` — Zod valida pero solo en submit
- **Correccion sugerida:**

  ```tsx
  // Opcion A: Agregar inputMode y pattern
  <Input
    id="phone"
    type="tel"
    inputMode="tel"
    maxLength={20}
    placeholder={t('phone.placeholder')}
    {...register('phone')}
  />

  // Opcion B (mejor): Usar input mask con imask (ya existe en el proyecto)
  <Input
    id="phone"
    type="tel"
    mask={getPhoneMask(userCountry)}  // Similar a getCurrencyMask
    maxLength={20}
    ...
  />
  ```

---

### [MEDIO] UX-009: Placeholder de telefono en formato US para usuario chileno -- RESUELTO (fix: placeholder cambiado a +56 9 1234 5678)

- **Ubicacion:** `/es/dashboard/profile` - campo "Telefono"
- **Rol:** Todos
- **Test Case:** TC-ST-019
- **Pasos para reproducir:**
  1. Login como usuario con pais Chile
  2. Navegar a `/es/dashboard/profile`
  3. Observar el placeholder del campo Telefono
- **Resultado esperado:** Placeholder en formato chileno: "+56 9 1234 5678"
- **Resultado obtenido:** Placeholder muestra "+1 555 123 4567" (formato estadounidense)
- **Impacto:** Confuso para usuarios chilenos, no guia al formato correcto
- **Ubicacion Codigo:**
  - `messages/es.json` — clave `profile.personalInfo.phone.placeholder`
  - Idealmente el placeholder deberia ser dinamico segun el pais del documento del usuario
- **Correccion sugerida:** Cambiar el placeholder estatico a "+56 9 1234 5678" para es.json. Idealmente, hacer dinamico basado en `user.country`.

---

### [BAJO] UX-010: Input de telefono sin maxLength -- RESUELTO (fix: maxLength=20 en Input)

- **Ubicacion:** `/es/dashboard/profile` - campo "Telefono"
- **Rol:** Todos
- **Descripcion:** El input de telefono no tiene atributo `maxLength`, permitiendo escribir un numero infinito de caracteres.
- **Impacto:** Posible input excesivo, datos inconsistentes
- **Ubicacion Codigo:** `src/features/profile/ui/personal-info-form.tsx:99-104`
- **Correccion sugerida:** Agregar `maxLength={20}` al Input (los telefonos internacionales no superan ~15 digitos + formato)
