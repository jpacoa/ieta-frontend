# Guía de Implementación — Frontend Sitio Web IETA
**Propósito de este documento:** establecer los lineamientos de diseño, arquitectura, navegación, animación e integración con el CMS que debe seguir cualquier desarrollador o asistente de IA que participe en la etapa de implementación del Frontend del sitio web del Instituto de Estadística Teórica y Aplicada (IETA). Este documento es la fuente de verdad para revisar si una implementación respeta los parámetros definidos en la etapa de diseño (Figma, guía de estilo, mockup aprobado).

**No cubre:** lógica de Backend, autenticación, panel administrador ni gestión de roles — esos componentes son responsabilidad del equipo de Backend (Laravel) y no se construyen en este Frontend.

---

## 1. Principio rector del proyecto

El sitio es **100% alimentado por un CMS**. Esto no es un detalle técnico menor, es la regla que condiciona todo lo demás:

- **Ningún componente debe asumir una cantidad fija de contenido.** Una lista de Noticias puede tener 0, 1 o 200 elementos; una tarjeta de Curso puede tener un título de 3 palabras o de 20. Todo componente debe comportarse correctamente en ambos extremos.
- **Ningún componente debe tener texto, fechas, cifras o nombres hardcodeados**, salvo los textos de interfaz (labels, botones, mensajes de estado) gestionados por `vue-i18n`.
- **Todo componente que liste o muestre contenido dinámico debe contemplar explícitamente 4 estados:** cargando (loading), con datos (success), sin resultados (empty) y con error (error). No se considera terminado un componente que solo maneja el estado "con datos".
- **Las imágenes son siempre opcionales.** El CMS puede no tener una imagen cargada para una Noticia, un Curso o una Línea de Investigación. Todo componente con imagen debe definir un estado de reemplazo (placeholder visual, nunca un espacio roto o vacío).

---

## 2. Stack tecnológico de referencia

| Capa | Herramienta |
|---|---|
| Framework | Vue 3 (Composition API, `<script setup>`) |
| Build tool | Vite |
| Enrutamiento | Vue Router 4 |
| Estado global | Pinia (solo para lo estrictamente necesario: idioma activo, sesión del usuario si aplica a Mi Perfil) |
| Cliente HTTP | Axios, instancia centralizada (ver guía de configuración de Vue entregada previamente) |
| Internacionalización | vue-i18n (ES/EN) |
| Animación | CSS nativo (transitions/animations) + Intersection Observer API para scroll-reveal. No se requiere una librería de animación pesada (evitar GSAP salvo que una interacción puntual lo justifique) |
| Tipografía | DM Sans (Google Fonts, variable font) |

No usar frameworks de componentes UI genéricos (Vuetify, Element Plus, PrimeVue, etc.) que impongan su propio sistema de diseño — el sitio tiene una guía de estilo propia y estos frameworks son difíciles de re-skinear por completo sin dejar rastros visuales del framework original.

---

## 3. Sistema de diseño

### 3.1 Color

```css
:root {
  /* Marca */
  --color-indigo: #35449F;     /* Color primario: header, botones principales, nav activo */
  --color-magenta: #F50088;    /* Uso decorativo puntual (franjas, acentos de marca) */
  --color-rosa-carmin: #F30060;/* Acento de interacción: links, "ver más", elementos activos */
  --color-violeta: #71589F;    /* Uso secundario, tags, apoyo de ilustración */
  --color-purpura: #3E2987;    /* Extremo oscuro de los degradados de marca */
  --color-resaltador: #6C81C7; /* Fondos tenues, hover suave, estados de foco */

  /* Neutros */
  --color-tinta: #14161C;      /* Texto principal, footer */
  --color-superficie: #F5F5F8; /* Fondo alterno de secciones */
  --color-desactivado: #E0E0E0;/* Estados disabled, bordes sutiles */
  --color-blanco: #FFFFFF;

  /* Degradado de marca (usado en bandas de cabecera de sección) */
  --gradient-marca: linear-gradient(135deg, var(--color-indigo) 0%, var(--color-purpura) 100%);
}
```

**Reglas de uso:**

- El degradado `--gradient-marca` se reserva para las **bandas de cabecera de página** (el bloque que contiene el breadcrumb + título de sección, visible en todas las vistas internas) y para el hero de Inicio. No usarlo en botones, tarjetas ni elementos pequeños — es un recurso de jerarquía a nivel de página, no un efecto decorativo repetible.
- `--color-rosa-carmin` es el único acento de interacción del sitio: enlaces "ver más", tabs activos, subrayados de navegación activa, íconos de descarga. No introducir un segundo color de acento para esta misma función.
- `--color-magenta` y `--color-violeta` se limitan a apoyos visuales menores (franjas del logo, separadores decorativos) — no deben competir con `--color-rosa-carmin` como color de acción.
- Validar contraste AA en cualquier texto sobre `--gradient-marca`: el blanco puro funciona sobre el extremo índigo/púrpura, pero evitar texto en tonos grises claros sobre este fondo (fue una inconsistencia detectada y corregida durante el mockup).

### 3.2 Tipografía — DM Sans

```css
@font-face {
  font-family: 'DM Sans';
  font-weight: 100 1000; /* variable font */
  src: url('/fonts/DMSans-Variable.woff2') format('woff2-variations');
}
```

| Nivel | Tamaño / Line-height | Peso |
|---|---|---|
| H1 | 56px / 61.6px | 700 |
| H2 | 48px / 52.8px | 700 |
| H3 | 40px / 44px | 600 |
| H4 | 32px / 35.2px | 600 |
| H5 | 24px / 26.4px | 500 |
| H6 | 20px / 22px | 500 |
| Large text | 20px / 28px | 400 / 700 |
| Medium text | 18px / 25.2px | 400 / 700 |
| Normal text (body) | 16px / 22.4px | 400 / 700 |
| Small text | 14px / 19.6px | 400 / 700 |
| UI (botones, nav, tabs, labels) | según contexto | 500 |

Reglas: no usar menos de 12px en ningún texto del sitio; activar `font-variant-numeric: tabular-nums` en toda celda de tabla o dato numérico (Banco de Datos, metadatos de artículos, cifras de edición).

### 3.3 Espaciado, radios y sombra

- Escala de espaciado en múltiplos de 8px (8/16/24/32/48/64/96).
- Radio de borde: 4px en chips/badges pequeños, 8px en tarjetas, 12px en modales y contenedores grandes.
- Sombra: un solo nivel de elevación para tarjetas en hover (`0 4px 12px rgba(20,22,28,0.08)`); no apilar múltiples niveles de sombra en el mismo componente.

### 3.4 Logo y motivo de marca

El header utiliza una **forma curva blanca diagonal** detrás del logo y el nombre de la institución, que se recorta sobre la banda de color de la página. Este es un recurso de marca recurrente — replicarlo de forma consistente en el header de todas las páginas (no reinterpretarlo distinto por sección).

---

## 4. Arquitectura de información y mapa de navegación

Esta es la estructura aprobada en el mockup de Figma. Cualquier cambio a esta arquitectura debe aprobarse explícitamente antes de implementarse — **no improvisar secciones nuevas ni reorganizar el menú durante la programación.**

```
Inicio
├── Acerca de
│   ├── ¿Quiénes Somos?
│   ├── Misión y Visión
│   ├── Objetivos
│   ├── Personal IETA (listado → ficha individual)
│   └── Reglamento Interno
├── Investigación
│   ├── Líneas de Investigación (listado → detalle por línea)
│   └── Memorias de Investigación (listado filtrable por año/palabra clave)
├── Revista Varianza
│   ├── Sobre la Revista
│   ├── Comité Editor
│   ├── Autores Varianza (listado → perfil de autor)
│   ├── Todas las Ediciones (listado → detalle de edición → detalle de artículo)
│   └── Instrucciones para Autores (índice + contenido ancla en la misma página)
├── Servicios
│   └── (overview de 5 servicios → página de detalle por servicio)
├── Noticias
│   └── (listado filtrable por palabra clave → detalle de noticia)
├── Recursos
│   ├── Banco de Datos (filtro Encuestas/Censos + palabra clave + año)
│   └── Revistas de Estadística (directorio externo)
└── Contacto
    └── (datos de contacto, mapa, oficinas, infraestructura)
```

**Nota de implementación:** "Cursos y Talleres" existe como contenido (se muestra en Inicio y tiene página de detalle de curso), pero **no está confirmado como ítem del menú principal** — no agregarlo al nav superior sin validación explícita. Tratar su acceso como: Inicio → tarjeta de curso → detalle de curso, y breadcrumb `Inicio / Cursos y Talleres / [Nombre del curso]`.

**Selector de idioma ES/EN:** pendiente de definición de diseño final (no aparece en el mockup aprobado). Implementar el componente de header de modo que el selector de idioma pueda insertarse en el área superior derecha sin reestructurar el layout — dejar el espacio contemplado, aunque el toggle no esté activo todavía.

### 4.1 Rutas (Vue Router) — referencia

| Ruta | Vista |
|---|---|
| `/` | Home |
| `/acerca-de/:tab?` | Acerca (tabs: quienes-somos, mision-vision, objetivos, personal, reglamento) |
| `/acerca-de/personal/:slug` | Ficha de personal |
| `/investigacion/lineas` | Líneas de Investigación |
| `/investigacion/lineas/:slug` | Detalle de línea de investigación |
| `/investigacion/memorias` | Memorias de Investigación |
| `/revista-varianza/:tab?` | Revista Varianza (tabs: sobre, comite, autores, ediciones, instrucciones) |
| `/revista-varianza/autores/:slug` | Perfil de autor |
| `/revista-varianza/ediciones/:numero` | Detalle de edición |
| `/revista-varianza/articulos/:slug` | Detalle de artículo |
| `/servicios` | Overview de Servicios |
| `/servicios/:slug` | Detalle de servicio |
| `/noticias` | Listado de Noticias |
| `/noticias/:slug` | Detalle de noticia |
| `/cursos-talleres/:slug` | Detalle de curso (acceso desde Home) |
| `/recursos/:tab?` | Recursos (tabs: banco-de-datos, revistas-de-estadistica) |
| `/contacto` | Contacto |
| `/:pathMatch(.*)*` | 404 |

Todas las rutas públicas, sin guards de autenticación (ver sección 1, alcance del Frontend).

---

## 5. Patrones de componentes reutilizables

Construir estos componentes **una sola vez**, como piezas base del sistema, y reutilizarlos en todas las vistas que lo requieran. No duplicar su implementación por sección.

| Componente | Usado en | Reglas |
|---|---|---|
| `ContentCard.vue` | Noticias, Cursos, Ediciones, Líneas de Investigación, Memorias | Imagen opcional + eyebrow + título + meta (fecha/autor). Variantes por `tipo` (noticia, curso, investigacion, edicion), no componentes separados. |
| `SearchFilterBar.vue` | Noticias, Memorias, Banco de Datos, Autores | Input de palabra clave + 0-2 selects opcionales (año, tipo). Incluye estado "sin coincidencias" integrado. |
| `TabNav.vue` | Acerca de, Investigación, Revista Varianza, Recursos | Indicador de subrayado animado (ver sección 6.4). Nunca reconstruir esta lógica de tabs de forma ad-hoc por página. |
| `Breadcrumb.vue` | Todas las vistas internas | Generado dinámicamente a partir de la ruta activa, nunca hardcodeado en cada vista (esto evitará el bug de breadcrumb incorrecto detectado en el mockup). |
| `LoadMoreButton.vue` | Noticias, Autores, Banco de Datos, Memorias | Patrón estándar de paginación del sitio: "cargar más", no numeración de páginas salvo que una vista lo justifique explícitamente. |
| `StatusBadge.vue` | Detalle de Curso | Estado calculado a partir de fecha de inscripción vs. fecha actual: `Inscripciones abiertas` / `Inscripciones cerradas` / `Finalizado`. |
| `EmptyState.vue` | Cualquier buscador/filtro | Ícono + mensaje + acción de limpiar filtros. |
| `SectionHeaderBand.vue` | Todas las vistas internas | Banda con `--gradient-marca`, breadcrumb y título de sección. |

---

## 6. Animaciones y efectos de interacción

Se toma como referencia de vocabulario de interacción el tipo de experiencia de temas de WordPress de investigación/laboratorio (ej. plantillas tipo "Labflox"): revelado progresivo del contenido al hacer scroll, contadores animados, tarjetas con elevación en hover, header que se comprime al desplazar la página, y transiciones de carrusel en el hero. **Se reproduce el vocabulario de interacción, no el diseño ni el contenido de ninguna plantilla de terceros** — todo se implementa con los colores, tipografía y componentes propios definidos en este documento.

### 6.1 Scroll reveal (revelado progresivo)

Al entrar en el viewport, los bloques de contenido (tarjetas, secciones, bloques de texto) deben aparecer con una transición sutil de opacidad + desplazamiento vertical:

```css
.reveal {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.5s ease-out, transform 0.5s ease-out;
}
.reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
}
```

Implementar con `IntersectionObserver`, no con librerías de scroll pesadas. Aplicar un pequeño `transition-delay` escalonado (50-80ms) entre elementos de una misma grilla (tarjetas de Noticias, Cursos, Líneas de Investigación) para que no aparezcan todos simultáneamente.

### 6.2 Contadores animados

Si en algún momento se incorporan cifras institucionales (ej. "X artículos publicados", "Y años de trayectoria" en Acerca de), animar el conteo desde 0 hasta el valor final cuando el bloque entra en el viewport, con una duración de 1.2-1.5s y easing `ease-out`. No usar esta animación para datos que cambian en tiempo real (ej. resultados de un filtro) — es exclusiva de cifras estáticas/institucionales.

### 6.3 Tarjetas (ContentCard)

- Hover: elevación sutil (`transform: translateY(-4px)`) + sombra (ver 3.3), transición 0.2s.
- Si la tarjeta tiene imagen, aplicar un ligero zoom de la imagen en hover (`transform: scale(1.04)`) dentro de un contenedor con `overflow: hidden`, nunca desbordando la tarjeta.
- El título de la tarjeta puede cambiar a `--color-rosa-carmin` en hover para reforzar que es interactiva.

### 6.4 Tabs (TabNav)

El indicador de subrayado activo debe desplazarse con una transición suave entre tabs (`transition: transform 0.25s ease, width 0.25s ease`), no saltar instantáneamente. El contenido del tab puede tener un crossfade breve (0.2s) al cambiar.

### 6.5 Header

- Sticky en todas las vistas.
- Al hacer scroll hacia abajo más de ~80px, reducir ligeramente el alto del header (compresión) y añadir una sombra sutil — señal visual de que el usuario se desplazó.
- La transición de compresión debe ser suave (0.2-0.3s), nunca abrupta.

### 6.6 Hero / Carrusel de Inicio

- Transición entre slides tipo fade o slide horizontal, duración 0.6-0.8s, con autoplay cada 5-6 segundos y pausa al interactuar (hover o foco con teclado).
- Controles de flecha prev/next y dots de posición, ambos accesibles por teclado.
- El contenido de texto del slide (título, subtítulo, botón) puede entrar con un `reveal` (ver 6.1) sincronizado con el cambio de slide.

### 6.7 Transiciones entre rutas

Usar `<router-view>` con `<transition>` de Vue para una transición de fade simple (0.2-0.3s) entre vistas. No usar transiciones de slide direccional complejas entre rutas completas — el patrón de "slide" se reserva para prototipos de navegación (como el demo interactivo ya construido), no es necesariamente el comportamiento final de producción salvo que se decida explícitamente.

### 6.8 Botones

Transición de fondo/color en hover (0.15-0.2s). El botón primario (fondo `--color-indigo`) oscurece ligeramente en hover; el botón secundario/outline rellena su fondo con `--color-superficie` o `--color-resaltador` tenue.

### 6.9 Reglas transversales de animación

- **Nunca animar `width`, `height`, `top` o `left` directamente** — usar `transform` y `opacity` exclusivamente por rendimiento.
- **Ninguna animación debe superar ~0.6s** salvo el autoplay del carrusel del hero.
- **Respetar `prefers-reduced-motion`:** si el usuario lo tiene activado, desactivar scroll-reveal, contadores animados y autoplay del carrusel (mostrar el contenido directamente, sin transición).
- Las animaciones son un refuerzo de jerarquía y feedback, no deben retrasar la percepción de que el sitio cargó o respondió — nunca ocultar contenido detrás de una animación de más de 1 segundo.

---

## 7. Integración con el CMS (consumo de API)

- Un composable por recurso (`useNoticias`, `useCursos`, `useLineasInvestigacion`, `useMemorias`, `useBancoDeDatos`, `useEdicionesVarianza`, `useAutores`, `useServicios`, `usePersonal`), cada uno exponiendo `data`, `loading`, `error` y los métodos de fetch/paginación necesarios.
- Las imágenes entregadas por el CMS deben cargarse con `loading="lazy"` salvo la primera imagen visible en el viewport (ej. imagen del hero o de la noticia destacada).
- Todo listado filtrable (Noticias, Memorias, Banco de Datos, Autores) debe aplicar debounce (~300-400ms) al input de palabra clave antes de disparar la petición a la API.
- Las fechas que entrega el CMS deben formatearse en el cliente según el locale activo (ES/EN cuando se implemente) — no asumir formato de fecha fijo en el Backend.

---

## 8. Responsive

- Grid de 12 columnas en desktop (≥1280px), 8 en tablet (768-1279px), 4 en mobile (<768px).
- El menú principal colapsa a menú hamburguesa por debajo de 960px.
- Las grillas de tarjetas (Noticias, Cursos, Líneas de Investigación) pasan de 3-4 columnas en desktop a 1 columna en mobile, sin recortar contenido de las tarjetas.
- Las tablas de datos (Banco de Datos, Ediciones) deben permitir scroll horizontal contenido en mobile, nunca desbordar la página completa.

---

## 9. Accesibilidad

- Contraste mínimo AA en todo texto, verificado especialmente sobre `--gradient-marca` y sobre `--color-resaltador`.
- Estado de foco visible (outline) en todo elemento interactivo: enlaces, botones, tabs, inputs, controles del carrusel.
- Todo ícono funcional (teléfono, email, redes sociales, descarga) debe tener texto accesible (`aria-label` o texto visualmente oculto), no depender solo del ícono.
- El carrusel del hero debe ser operable por teclado y pausar con `prefers-reduced-motion` o al recibir foco.

---

## 10. Checklist de revisión antes de dar por terminada una vista

Antes de considerar implementada cualquier vista del sitio, verificar:

- [ ] ¿El contenido viene 100% de la API, sin textos ni datos hardcodeados (fuera de los labels de interfaz vía i18n)?
- [ ] ¿Están resueltos los 4 estados (loading, success, empty, error)?
- [ ] ¿El breadcrumb se genera dinámicamente y coincide con la ruta real?
- [ ] ¿Los componentes reutilizados (card, tabs, filtro, paginación) son instancias de los componentes base de la sección 5, no reimplementaciones?
- [ ] ¿Las animaciones respetan `prefers-reduced-motion`?
- [ ] ¿La vista es usable en mobile sin scroll horizontal no intencional?
- [ ] ¿Los colores usados corresponden exactamente a los tokens de la sección 3.1 (sin hex sueltos fuera de ese set)?
- [ ] ¿La tipografía usa exclusivamente los niveles y pesos definidos en la sección 3.2?

---

## 11. Fuera de alcance de este documento (y de este Frontend)

- Login, registro y manejo de sesión.
- Panel Administrador / CMS en sí (gestión de contenido).
- Lógica de negocio, validaciones de servidor y base de datos.
- Cualquier interfaz de flujo editorial tipo OJS (postulación, arbitraje) — no forma parte del alcance del proyecto.

Cualquier solicitud de implementación que caiga en estos puntos debe devolverse al equipo de Backend o aclararse con el tutor antes de construirse en este repositorio.
