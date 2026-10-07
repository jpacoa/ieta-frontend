# Plan de Implementación — Frontend Sitio Web IETA

**Propósito:** guía práctica, paso a paso, para la construcción del Frontend en Vue.js. Es un documento operativo: cada paso produce algo verificable antes de pasar al siguiente. Úsalo como checklist de avance real durante la Fase 3 (Implementación) de tu Plan de Trabajo.

**Documentos relacionados que esta guía asume como contexto:**
- `GUIA_IMPLEMENTACION_FRONTEND_IETA.md` — lineamientos de diseño, arquitectura, animaciones y patrones de componentes (no se repiten aquí, se referencian).
- Guía de instalación y configuración inicial de Vue (entregada previamente): Node, Vite, Axios, Sanctum/cookies, variables de entorno.

**Regla de oro de esta guía:** no se avanza a un paso nuevo si el paso anterior no tiene algo visible/verificable funcionando. Evita construir "a ciegas" 10 vistas antes de confirmar que la base (routing, estilos, consumo de API) realmente funciona.

---

## Fase 0 — Antes de escribir código

- [ ] Confirmar con tu compañero de Backend la URL base de la API en local (`http://localhost:8000/api` o la que definan).
- [ ] Confirmar el mecanismo de autenticación (Sanctum SPA vía cookies, según se definió) — aunque el Frontend no construya login, necesitas saber si tus peticiones Axios deben enviar `withCredentials: true` desde ya.
- [ ] Confirmar si existe ya al menos **un endpoint de prueba** disponible (real o con datos mock) para validar la conexión antes de construir vistas completas.
- [ ] Tener a mano: el mockup de Figma aprobado, la guía de estilo (colores/tipografía) y `GUIA_IMPLEMENTACION_FRONTEND_IETA.md`.
- [ ] Crear el repositorio en GitHub (o confirmar que ya existe) y clonarlo localmente.

---

## Fase 1 — Scaffolding del proyecto

- [ ] Crear el proyecto con `npm create vue@latest`, con las opciones: Vue Router sí, Pinia sí, ESLint + Prettier sí, TypeScript opcional (según lo decidido previamente).
- [ ] Borrar los archivos de ejemplo de Vite (`HelloWorld.vue`, logo de muestra, estilos por defecto).
- [ ] Instalar dependencias adicionales: `axios`, `vue-i18n`.
- [ ] Crear `.env` y `.env.local` con `VITE_API_URL`.
- [ ] Verificar que `npm run dev` levanta una página en blanco sin errores en consola.
- [ ] Primer commit: "chore: scaffolding inicial del proyecto".

**Resultado verificable de esta fase:** el proyecto corre localmente, sin contenido todavía, pero sin errores.

---

## Fase 2 — Fundamentos del sistema de diseño

- [ ] Crear `src/assets/styles/tokens.css` con las variables de color de la sección 3.1 de `GUIA_IMPLEMENTACION_FRONTEND_IETA.md`.
- [ ] Cargar la fuente DM Sans (variable font) vía `@font-face` o Google Fonts, y definir la escala tipográfica como clases utilitarias o estilos base (`h1`-`h6`, `.text-large`, `.text-normal`, etc.).
- [ ] Definir la escala de espaciado, radios y sombra como variables CSS (sección 3.3 de la guía de diseño).
- [ ] Crear una página de prueba temporal (`/dev-tokens`, se borra después) que muestre todos los colores y niveles tipográficos juntos — así validas visualmente el sistema completo de un vistazo antes de construir nada más.
- [ ] Borrar la página de prueba una vez validada.

**Resultado verificable:** una página que muestra correctamente la paleta y la tipografía reales del proyecto.

---

## Fase 3 — Estructura de carpetas y routing esqueleto

- [ ] Crear la estructura de carpetas: `layouts/`, `views/`, `components/`, `composables/`, `stores/`, `router/`, `locales/`, `assets/styles/`.
- [ ] Crear `PublicLayout.vue` (header + `<router-view>` + footer), vacío de contenido real por ahora (header con el nombre del sitio en texto plano, footer con un placeholder).
- [ ] Configurar `src/router/index.js` con **todas las rutas** de la tabla de la sección 4.1 de la guía de diseño, cada una apuntando a un componente de vista vacío (solo un `<h1>` con el nombre de la vista, usando `defineAsyncComponent` o import directo con lazy-loading `() => import(...)`).
- [ ] Verificar que las 18 rutas navegan correctamente escribiendo cada URL a mano en el navegador.
- [ ] Commit: "feat: routing esqueleto con todas las vistas del sitio".

**Resultado verificable:** puedes navegar a cualquier URL del sitemap y ver, como mínimo, el nombre de esa vista renderizado dentro del layout.

---

## Fase 4 — Header, Footer y Breadcrumb reales

- [ ] Construir el Header real: logo + forma curva de marca (sección 3.4), navegación principal con los ítems confirmados, botón "Ingresar" (enlace, sin lógica de auth), ícono de búsqueda (sin funcionalidad todavía si no está definida).
- [ ] Implementar el estado de **nav activo** (subrayado o color distinto en el ítem correspondiente a la ruta actual).
- [ ] Construir `Breadcrumb.vue` **genérico**, que lea la ruta activa de Vue Router y genere el breadcrumb automáticamente a partir de los `meta.title` de cada ruta — no hardcodear el breadcrumb en cada vista (evita el bug detectado en el mockup).
- [ ] Construir el Footer real: columnas de enlaces, datos de contacto, redes sociales, copyright.
- [ ] Construir `SectionHeaderBand.vue` (banda con degradado de marca + breadcrumb + título), para reutilizar en todas las vistas internas.
- [ ] Commit: "feat: header, footer y breadcrumb dinámico".

**Resultado verificable:** al navegar entre las rutas vacías de la Fase 3, el breadcrumb y el nav activo cambian correctamente solos, sin tocar código por vista.

---

## Fase 5 — Componentes base reutilizables (con datos de prueba)

Construir cada uno con **datos hardcodeados temporales** (array de ejemplo en el propio componente o en un archivo `mock-data.js`), para validar diseño e interacción antes de conectar la API real:

- [ ] `ContentCard.vue` (con variantes: noticia, curso, investigacion, edicion).
- [ ] `TabNav.vue` (con indicador de subrayado animado, sección 6.4 de la guía de diseño).
- [ ] `SearchFilterBar.vue` (input + selects opcionales + estado vacío integrado).
- [ ] `LoadMoreButton.vue`.
- [ ] `StatusBadge.vue` (lógica de cálculo de estado por fecha, para Detalle de Curso).
- [ ] `EmptyState.vue`.
- [ ] Commit: "feat: componentes base del sistema de diseño, con datos de prueba".

**Resultado verificable:** cada componente, probado de forma aislada (puedes usar una vista temporal `/dev-components` o Storybook si lo prefieres), se ve y se comporta como en el mockup de Figma.

---

## Fase 6 — Capa de conexión con la API

- [ ] Crear `src/api/client.js`: instancia de Axios con `baseURL` desde `VITE_API_URL`, `withCredentials` según corresponda, e interceptor de errores.
- [ ] Probar la conexión con el **endpoint de prueba** acordado con el Backend en la Fase 0 — confirmar que no hay errores de CORS y que la respuesta llega.
- [ ] Crear el primer composable real, `useNoticias.js`, consumiendo ese endpoint (o uno de Noticias si ya existe), con estados `data`, `loading`, `error`.
- [ ] Reemplazar los datos de prueba de `ContentCard` en una vista simple (ej. listado de Noticias) por datos reales del composable.
- [ ] Commit: "feat: primera conexión end-to-end Frontend–Backend (Noticias)".

**Resultado verificable:** una vista real del sitio (Noticias) muestra datos que vienen efectivamente de la API, no de un array local. Este es el hito más importante de toda la implementación — una vez logrado, el resto de las vistas son variaciones del mismo patrón.

---

## Fase 7 — Construcción de vistas (orden sugerido por complejidad creciente)

Para cada vista: crear su composable específico, conectar los componentes base ya construidos, y verificar contra el mockup de Figma antes de pasar a la siguiente.

- [ ] **Noticias** (listado + detalle) — ya tiene el composable de la Fase 6, falta el detalle.
- [ ] **Cursos y Talleres** (detalle de curso) — incluye `StatusBadge`.
- [ ] **Servicios** (overview + detalle por servicio).
- [ ] **Contacto** (estático + mapa embebido).
- [ ] **Acerca de** (con `TabNav`: ¿Quiénes Somos?, Misión y Visión, Objetivos, Personal, Reglamento).
- [ ] **Personal** (listado + ficha individual, dentro de Acerca de).
- [ ] **Investigación** (Líneas + Memorias, con `TabNav` y `SearchFilterBar`).
- [ ] **Recursos** (Banco de Datos con filtro Encuestas/Censos + Revistas de Estadística).
- [ ] **Revista Varianza** (la más compleja: Sobre la Revista, Comité, Autores + perfil, Ediciones + detalle + artículo, Instrucciones para Autores).
- [ ] **Home** (al final, porque consume casi todos los composables ya construidos: hero, últimas noticias, cursos destacados, accesos rápidos).
- [ ] **404** y vistas transversales.
- [ ] Commit por cada vista completada (no un solo commit gigante al final).

**Resultado verificable al cierre de esta fase:** el sitio completo navega con datos reales en todas sus secciones públicas.

---

## Fase 8 — Animaciones e interacción

Aplicar sobre las vistas ya funcionales (no antes, para no animar contenido que todavía puede cambiar de estructura):

- [ ] Scroll-reveal en grillas de tarjetas (Noticias, Cursos, Líneas de Investigación) — `IntersectionObserver` + clase `.reveal`.
- [ ] Hover de tarjetas (elevación + zoom de imagen).
- [ ] Indicador de tabs animado (si no quedó resuelto en la Fase 5).
- [ ] Header sticky con compresión al hacer scroll.
- [ ] Hero / carrusel de Inicio con autoplay, pausa en hover/foco, controles accesibles por teclado.
- [ ] Transición de fade entre rutas (`<transition>` en `router-view`).
- [ ] Verificar `prefers-reduced-motion` en cada una de las animaciones anteriores.
- [ ] Commit: "feat: animaciones e interacción según guía de diseño".

---

## Fase 9 — Responsive

- [ ] Revisar cada vista construida en Fase 7 en 3 anchos de referencia: 375px (mobile), 768px (tablet), 1440px (desktop).
- [ ] Menú hamburguesa por debajo de 960px.
- [ ] Tablas de datos (Banco de Datos, Ediciones) con scroll horizontal contenido en mobile.
- [ ] Verificar que ninguna vista produce scroll horizontal no intencional del body completo.

---

## Fase 10 — Accesibilidad

- [ ] Verificar contraste AA en textos sobre el degradado de marca y sobre `--color-resaltador`.
- [ ] Verificar foco visible en todo elemento interactivo (tab por teclado por el sitio completo, sin mouse).
- [ ] `aria-label` en íconos funcionales (contacto, redes sociales, descarga).
- [ ] Carrusel del hero operable por teclado.

---

## Fase 11 — Internacionalización (estructura, aunque el toggle no esté activo)

- [ ] Configurar `vue-i18n` con `src/locales/es.json` como archivo base.
- [ ] Mover todos los textos de interfaz (labels, botones, mensajes de estado, placeholders) a claves de traducción, aunque por ahora solo exista el archivo en español.
- [ ] Dejar el espacio del selector de idioma reservado en el header (sin activarlo), según lo indicado en la guía de diseño.

---

## Fase 12 — QA interna con el checklist de diseño

- [ ] Recorrer la sección 10 ("Checklist de revisión") de `GUIA_IMPLEMENTACION_FRONTEND_IETA.md` vista por vista.
- [ ] Verificar los 4 estados (loading/success/empty/error) probando manualmente: desconectar la API, forzar una búsqueda sin resultados, simular una respuesta lenta.
- [ ] Revisar que no quedó ningún texto de prueba, console.log, o dato hardcodeado de desarrollo.

---

## Fase 13 — Integración final con el Backend

- [ ] Reunión de integración con tu compañero: confirmar que todos los endpoints consumidos por los composables existen y devuelven la forma de datos esperada.
- [ ] Probar el flujo completo en un entorno compartido (no solo en local de cada uno).
- [ ] Resolver cualquier diferencia de formato de datos (fechas, URLs de imágenes, nulls) entre lo que el Backend entrega y lo que el Frontend espera.
- [ ] Pruebas end-to-end manuales de cada vista contra la API real (no mock).

---

## Fase 14 — Preparación para despliegue

- [ ] Configurar `.env.production` con la URL de la API de producción.
- [ ] `npm run build` y revisar que no haya errores ni advertencias críticas.
- [ ] Revisar tamaño del build (`dist/`) y aplicar lazy-loading de rutas si no se hizo desde la Fase 3.
- [ ] Verificar que las imágenes cargan con `loading="lazy"` salvo las above-the-fold.
- [ ] Entregar el build al responsable de despliegue (según lo que corresponda al Backend/infraestructura, fuera del alcance de este Frontend).

---

## Resumen visual del flujo de fases

```
Fase 0  → Confirmar acuerdos con Backend
Fase 1  → Proyecto corre vacío
Fase 2  → Sistema de diseño visible
Fase 3  → Todas las rutas navegables (vacías)
Fase 4  → Header/Footer/Breadcrumb reales y dinámicos
Fase 5  → Componentes base con datos de prueba
Fase 6  → Primera conexión real a la API (hito clave)
Fase 7  → Todas las vistas con datos reales
Fase 8  → Animaciones
Fase 9  → Responsive
Fase 10 → Accesibilidad
Fase 11 → i18n estructurado
Fase 12 → QA contra checklist de diseño
Fase 13 → Integración final con Backend
Fase 14 → Preparación de build para despliegue
```

No saltar fases ni adelantar la 7 antes de cerrar la 6 — construir vistas completas sin haber validado la conexión real a la API es la causa más común de tener que rehacer trabajo.
