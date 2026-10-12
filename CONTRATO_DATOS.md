# Contrato de Datos — Frontend ↔ Backend (Sitio Web IETA)

**Propósito:** este documento es el acuerdo vivo entre Frontend y Backend sobre la forma exacta de los datos que viajan entre ambos. Es la fuente de verdad que reemplaza a "le pregunto por chat y espero que no cambie" — cualquier cambio de un campo, endpoint o estructura debe reflejarse aquí, con fecha, antes de darse por válido.

**Cómo se usa:**
- Cada recurso tiene su propia sección, con el mismo formato siempre (copia la plantilla de la sección 3 para agregar uno nuevo).
- El estado de cada recurso es uno de: 🟢 **Estable** (ya implementado y acordado, no debería cambiar sin aviso) · 🟡 **En desarrollo** (existe pero puede cambiar) · ⚪ **Propuesto** (lo redactó el Frontend como borrador, el Backend aún no lo confirmó).
- Nada se marca 🟢 Estable sin que ambos lo hayan revisado explícitamente.

---

## 1. Convenciones generales (aplican a todos los endpoints salvo que se indique lo contrario)

| Convención | Valor acordado | Estado |
|---|---|---|
| URL base (local) | `http://localhost:8000/api` | ⚪ Propuesto |
| URL base (producción) | *(pendiente)* | ⚪ Propuesto |
| Formato de fecha | ISO 8601 (`2026-09-15T00:00:00Z`) | ⚪ Propuesto |
| Autenticación | Laravel Sanctum, modalidad SPA (cookies, `withCredentials: true`) | ⚪ Propuesto |
| Formato de error de validación | `422` + `{ "message": "...", "errors": { "campo": ["mensaje"] } }` | ⚪ Propuesto |
| Formato de error genérico (404, 500) | `{ "message": "..." }` | ⚪ Propuesto |
| Formato de paginación | `{ "data": [...], "meta": { "current_page": 1, "last_page": 5, "total": 42 } }` | ⚪ Propuesto |
| URLs de imágenes/archivos | Completas (`https://.../storage/...`), no relativas | ⚪ Propuesto |
| Multi-idioma | *(pendiente de decisión: campos duplicados `_es`/`_en` vs. parámetro `?lang=`)* | ⚪ Propuesto |

> Edita esta tabla primero, en conjunto con tu compañero — todo lo demás del documento asume estas convenciones. Si una convención cambia, impacta a todos los recursos de golpe.

---

## 2. Plantilla para agregar un recurso nuevo (copiar y pegar)

```markdown
### [Nombre del recurso]

**Estado:** ⚪ Propuesto · **Última actualización:** [fecha]

| Acción | Método | Endpoint |
|---|---|---|
| Listado | GET | `/api/...` |
| Detalle | GET | `/api/.../{slug}` |

**Campos de listado:**

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `id` | number | sí | |

**Campos adicionales en detalle** (los que no vienen en el listado):

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|

**Paginación:** sí/no — parámetros (`?page=`, `?per_page=`)

**Filtros/búsqueda disponibles:** `?q=`, `?año=`, etc.
```

---

## 3. Recursos de lectura (GET)

### Noticias

**Estado:** ⚪ Propuesto · **Última actualización:** —

| Acción | Método | Endpoint |
|---|---|---|
| Listado | GET | `/api/noticias` |
| Detalle | GET | `/api/noticias/{slug}` |

**Campos de listado:**

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `id` | number | sí | |
| `slug` | string | sí | usado en la URL del detalle |
| `titulo` | string | sí | |
| `resumen` | string | no | texto corto para la tarjeta |
| `imagen_url` | string | no | puede venir `null`, el Frontend muestra placeholder |
| `fecha_publicacion` | string (ISO 8601) | sí | |

**Campos adicionales en detalle:**

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `contenido_html` o `contenido` | string | sí | confirmar si viene HTML ya formateado o texto plano/markdown |
| `autor` | string | no | nombre del autor de la noticia |

**Paginación:** sí — `?page=`

**Filtros/búsqueda disponibles:** `?q=` (palabra clave)

---

### Cursos y Talleres

**Estado:** ⚪ Propuesto · **Última actualización:** —

| Acción | Método | Endpoint |
|---|---|---|
| Listado | GET | `/api/cursos` |
| Detalle | GET | `/api/cursos/{slug}` |

**Campos de listado:**

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `id` | number | sí | |
| `slug` | string | sí | |
| `titulo` | string | sí | |
| `tipo` | string | sí | `"curso"` \| `"taller"` |
| `imagen_url` | string | no | |

**Campos adicionales en detalle:**

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `dictado_por` | string | no | |
| `modalidad` | string | sí | `"virtual"` \| `"presencial"` |
| `horas_academicas` | number | sí | |
| `fecha_inicio_clases` | string (ISO 8601) | sí | usado para calcular el `StatusBadge` |
| `fecha_inicio_inscripcion` | string (ISO 8601) | sí | usado para calcular el `StatusBadge` |
| `fecha_fin_inscripcion` | string (ISO 8601) | sí | usado para calcular el `StatusBadge` |
| `duracion` | string | no | texto libre o rango de fechas |
| `horario` | string | no | |
| `sobre_el_curso` | string | sí | |
| `contenido` | array de string | sí | temario, lista |
| `sobre_el_pago` | string | no | |
| `inversion` | array de `{ categoria, monto }` | no | |
| `contacto_celular` | string | no | |
| `contacto_correo` | string | no | |

**Paginación:** no (lista corta, sin filtro por ahora)

---

### Líneas de Investigación

**Estado:** ⚪ Propuesto · **Última actualización:** —

| Acción | Método | Endpoint |
|---|---|---|
| Listado | GET | `/api/investigacion/lineas` |
| Detalle | GET | `/api/investigacion/lineas/{slug}` |

**Campos de listado:**

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `id` | number | sí | |
| `slug` | string | sí | |
| `titulo` | string | sí | |
| `descripcion_corta` | string | sí | *(hoy todas comparten el mismo texto de prueba en el mockup — confirmar que cada línea tendrá su propia descripción)* |
| `imagen_url` | string | no | |

**Campos adicionales en detalle:**

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `descripcion` | string | sí | |
| `enfoques_metodologicos` | array de string | no | |
| `ambitos_aplicacion` | array de string | no | |

**Paginación:** no

---

### Memorias de Investigación

**Estado:** ⚪ Propuesto · **Última actualización:** —

| Acción | Método | Endpoint |
|---|---|---|
| Listado | GET | `/api/investigacion/memorias` |
| Detalle | GET | `/api/investigacion/memorias/{id}` |

**Campos de listado:**

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `id` | number | sí | |
| `titulo` | string | sí | |
| `anio` | number | sí | |
| `autor` | string | sí | |
| `archivo_url` | string | no | enlace de descarga/ver investigación |

**Paginación:** sí — `?page=`

**Filtros/búsqueda disponibles:** `?q=`, `?anio=`

---

### Personal IETA

**Estado:** ⚪ Propuesto · **Última actualización:** —

| Acción | Método | Endpoint |
|---|---|---|
| Listado | GET | `/api/personal` |
| Detalle | GET | `/api/personal/{slug}` |

**Campos de listado:**

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `id` | number | sí | |
| `slug` | string | sí | |
| `nombre_completo` | string | sí | |
| `cargo` | string | sí | |
| `foto_url` | string | no | |

**Campos adicionales en detalle:**

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `email` | string | no | |
| `telefono` | string | no | |
| `biografia` | string | no | |

**Paginación:** no

---

### Servicios

**Estado:** ⚪ Propuesto · **Última actualización:** —

| Acción | Método | Endpoint |
|---|---|---|
| Listado (overview) | GET | `/api/servicios` |
| Detalle | GET | `/api/servicios/{slug}` |

**Campos de listado:**

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `id` | number | sí | |
| `slug` | string | sí | |
| `titulo` | string | sí | |
| `descripcion_corta` | string | sí | |
| `imagen_url` | string | no | |

**Campos adicionales en detalle:**

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `descripcion` | string | sí | |
| `areas_de_intervencion` | array de string | no | |

**Paginación:** no

---

### Revista Varianza — Autores

**Estado:** ⚪ Propuesto · **Última actualización:** —

| Acción | Método | Endpoint |
|---|---|---|
| Listado | GET | `/api/varianza/autores` |
| Perfil | GET | `/api/varianza/autores/{slug}` |

**Campos de listado:**

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `id` | number | sí | |
| `slug` | string | sí | |
| `nombre_completo` | string | sí | |

**Campos adicionales en detalle:**

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `foto_url` | string | no | |
| `especialidades` | array de string | no | *(el componente debe ocultar la sección si viene vacío — ver bug detectado en el mockup)* |
| `formacion_academica` | array de string | no | |
| `trayectoria` | array de string | no | |
| `contacto_email` | string | no | |
| `articulos` | array de `{ id, titulo, anio, rol, edicion, url_descarga }` | no | |

**Paginación:** sí — `?page=`

**Filtros/búsqueda disponibles:** `?q=` (nombre), `?categoria=`

---

### Revista Varianza — Ediciones y Artículos

**Estado:** ⚪ Propuesto · **Última actualización:** —

| Acción | Método | Endpoint |
|---|---|---|
| Listado de ediciones | GET | `/api/varianza/ediciones` |
| Detalle de edición | GET | `/api/varianza/ediciones/{numero}` |
| Detalle de artículo | GET | `/api/varianza/articulos/{slug}` |

**Campos de listado (edición):**

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `numero` | number | sí | |
| `fecha_publicacion` | string (ISO 8601) | sí | |
| `portada_url` | string | no | |
| `nro_articulos_originales` | number | sí | |
| `nro_paginas` | number | sí | |
| `issn_impreso` | string | no | |
| `issn_en_linea` | string | no | |
| `archivo_descarga_url` | string | sí | |

**Campos adicionales en detalle de edición:**

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `presentacion` | string | sí | texto de presentación de la edición |
| `articulos` | array de `{ slug, titulo, autores, archivo_descarga_url }` | sí | |

**Campos de detalle de artículo:**

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `titulo` | string | sí | |
| `titulo_en` | string | no | |
| `autores` | array de `{ nombre, orcid, afiliacion }` | sí | |
| `palabras_clave` | array de string | no | |
| `doi` | string | no | |
| `numero_paginas` | number | no | |
| `fecha_recibido` | string (ISO 8601) | no | |
| `fecha_aceptado` | string (ISO 8601) | no | |
| `archivo_descarga_url` | string | sí | |

**Paginación:** sí, en ediciones — `?page=`

**Filtros/búsqueda disponibles:** `?q=`, `?anio=`

---

### Recursos — Banco de Datos

**Estado:** ⚪ Propuesto · **Última actualización:** —

| Acción | Método | Endpoint |
|---|---|---|
| Listado | GET | `/api/recursos/banco-de-datos` |

**Campos de listado:**

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `id` | number | sí | |
| `tipo` | string | sí | `"censo"` \| `"encuesta"` |
| `codigo` | string | sí | ej. `cs2013`, `esme14viv` |
| `titulo` | string | sí | |
| `categoria` | string | no | ej. "Vivienda", "Población", "Agropecuario" |
| `region` | string | no | ej. "Bolivia" |
| `anio` | number | sí | |
| `formato_archivo` | string | sí | `"csv"` \| `"rar"` \| `"spss"` |
| `archivo_descarga_url` | string | sí | |

**Paginación:** sí — `?page=`

**Filtros/búsqueda disponibles:** `?q=`, `?anio=`, `?tipo=censo|encuesta`

---

### Recursos — Revistas de Estadística (directorio externo)

**Estado:** ⚪ Propuesto · **Última actualización:** —

| Acción | Método | Endpoint |
|---|---|---|
| Listado | GET | `/api/recursos/revistas-estadistica` |

**Campos de listado:**

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `id` | number | sí | |
| `nombre` | string | sí | |
| `descripcion` | string | sí | |
| `imagen_url` | string | no | |
| `url_externa` | string | sí | |

**Paginación:** no

---

## 4. Formularios (envío de datos — POST/PUT)

### Suscripción al boletín (Home)

**Estado:** ⚪ Propuesto · **Última actualización:** —

| | |
|---|---|
| Endpoint | `POST /api/suscripciones` |

**Campos enviados por el Frontend:**

| Campo | Tipo | Obligatorio | Validación esperada |
|---|---|---|---|
| `email` | string | sí | formato de email válido |

**Respuesta de éxito (200/201):**

```json
{ "message": "Suscripción registrada correctamente." }
```

**Respuesta de error (422):**

```json
{ "message": "...", "errors": { "email": ["El correo electrónico ya está suscrito."] } }
```

---

### Generar CTP / Inscripción a curso (Detalle de Curso)

**Estado:** ⚪ Propuesto · **Última actualización:** —

| | |
|---|---|
| Endpoint | `POST /api/cursos/{id}/inscripciones` *(a confirmar con Backend)* |

**Campos enviados por el Frontend:**

| Campo | Tipo | Obligatorio | Validación esperada |
|---|---|---|---|
| `curso_id` | number | sí | debe existir |
| `nombre_completo` | string | sí | |
| `email` | string | sí | formato de email válido |
| `categoria` | string | sí | uno de: `"estudiante"`, `"profesional_no_docente"`, `"profesional_docente"` |
| `celular` | string | no | |

**Respuesta de éxito (200/201):**

```json
{ "message": "Inscripción registrada.", "comprobante_url": "..." }
```

*(confirmar con Backend si "Generar CTP" devuelve una URL de pago/comprobante o solo confirma el registro)*

**Respuesta de error (422):**

```json
{ "message": "...", "errors": { "email": ["El campo email es obligatorio."] } }
```

---

## 5. Pendientes de decisión (no bloquean el inicio de la implementación, pero deben resolverse pronto)

- [ ] Confirmar a qué dos formularios se refería el Backend con "Formulario A / Formulario B" — ¿coinciden con Suscripción e Inscripción a curso, o son otros?
- [ ] Definir estrategia de multi-idioma (campos duplicados vs. parámetro `?lang=`) — impacta a todos los recursos de contenido.
- [ ] Confirmar si existe un endpoint de "Contacto" (formulario de contacto) o si esa sección es solo informativa (datos fijos, sin envío).
- [ ] Confirmar el formato real de `inversion` en Cursos (¿array de objetos, o texto libre como en el wireframe original?).

---

## 6. Historial de cambios

| Fecha | Recurso | Cambio | Quién lo reportó |
|---|---|---|---|
| *(fecha de creación)* | — | Versión inicial del contrato, propuesta por Frontend a partir del mockup de Figma. Pendiente de revisión por Backend. | Frontend |

> Agrega una fila cada vez que un campo, endpoint o estructura cambie — es lo que te permite rastrear, cuando algo se rompa en integración, exactamente qué cambió y cuándo.
