<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import logoIeta from '@/assets/images/logoieta_400.png'
import type { InstitutionConfigApiItem } from '@/api/types'
import { mediaUrl } from '@/api/response'

const props = defineProps<{ institutionConfig?: InstitutionConfigApiItem | null }>()
const route = useRoute()
const logoUrl = computed(() => mediaUrl(props.institutionConfig?.logo_principal_url) || logoIeta)
const institutionName = computed(() => props.institutionConfig?.nombre_institucion || 'Instituto de Estadística Teórica y Aplicada')
const institutionShortName = computed(() => props.institutionConfig?.siglas || 'IETA')
const institutionSlogan = computed(() => props.institutionConfig?.slogan || 'Carrera de Estadística')

// ── Estado de compresión al scroll (Guía §6.5) ────────────────
const isScrolled = ref(false)
const SCROLL_THRESHOLD = 80

function handleScroll() {
  isScrolled.value = window.scrollY > SCROLL_THRESHOLD
}

onMounted(() => window.addEventListener('scroll', handleScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', handleScroll))

// ── Menú hamburguesa (mobile < 960px) ─────────────────────────
const menuOpen = ref(false)

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function closeMenu() {
  menuOpen.value = false
}

// ── Ítems de navegación principal ─────────────────────────────
const navItems = [
  { label: 'Acerca de', to: '/acerca-de' },
  { label: 'Investigación', to: '/investigacion/lineas-investigacion' },
  { label: 'Revista Varianza', to: '/revista-varianza' },
  { label: 'Servicios', to: '/servicios' },
  { label: 'Noticias', to: '/noticias' },
  { label: 'Recursos', to: '/recursos' },
  { label: 'Multimedia', to: '/multimedia' },
  { label: 'Contacto', to: '/contacto' },
]

// Helper: un ítem está activo si la ruta actual empieza con su `to`
// Necesario porque RouterLink active-class solo detecta match exacto con path params
function isActive(to: string): boolean {
  if (to === '/') return route.path === '/'
  return route.path.startsWith(to)
}
</script>

<template>
  <header
    class="app-header"
    :class="{ 'app-header--scrolled': isScrolled, 'app-header--menu-open': menuOpen }"
  >
    <div class="container header-inner">
      <!-- ── Brand / Logo ──────────────────────────────────────── -->
      <RouterLink to="/" class="header-brand" @click="closeMenu" aria-label="IETA — Ir al inicio">
        <!-- Forma curva de marca (Guía §3.4): SVG inline, colour blanco -->
        <span class="header-brand__curve" aria-hidden="true">
          <svg
            viewBox="0 0 120 56"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid meet"
          >
            <path d="M0 56 H100 Q120 56 120 36 V0 H0 Z" fill="white"/>
          </svg>
        </span>
        <img class="header-brand__logo" :src="logoUrl" alt="" />
        <span class="header-brand__text">
          <span class="header-brand__full">
          <span class="header-brand__full-name">{{ institutionName }}</span>
          <span class="header-brand__short-name">{{ institutionShortName }}</span>
          </span>
          <span class="header-brand__career">{{ institutionSlogan }}</span>
        </span>
      </RouterLink>

      <!-- ── Nav principal (desktop) ───────────────────────────── -->
      <nav class="header-nav" aria-label="Navegación principal">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="header-nav__link"
          :class="{ 'header-nav__link--active': isActive(item.to) }"
        >
          {{ item.label }}
        </RouterLink>
      </nav>

      <!-- ── Acciones: idioma (reservado) + Ingresar ──────────── -->
      <div class="header-actions">
        <!-- Espacio reservado para selector ES/EN — Guía §4, pendiente de diseño final -->
        <!-- <LangToggle /> -->
        <RouterLink to="#" class="btn-ingresar">Ingresar</RouterLink>
      </div>

      <!-- ── Botón hamburguesa (mobile) ───────────────────────── -->
      <button
        class="header-hamburger"
        :class="{ 'header-hamburger--open': menuOpen }"
        :aria-label="menuOpen ? 'Cerrar menú' : 'Abrir menú'"
        :aria-expanded="menuOpen"
        aria-controls="mobile-nav"
        @click="toggleMenu"
      >
        <span class="header-hamburger__bar" />
        <span class="header-hamburger__bar" />
        <span class="header-hamburger__bar" />
      </button>
    </div>

    <!-- ── Menú móvil ────────────────────────────────────────── -->
    <Transition name="mobile-nav">
      <nav
        v-if="menuOpen"
        id="mobile-nav"
        class="header-mobile-nav"
        aria-label="Navegación principal (móvil)"
      >
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="header-mobile-nav__link"
          :class="{ 'header-mobile-nav__link--active': isActive(item.to) }"
          @click="closeMenu"
        >
          {{ item.label }}
        </RouterLink>
        <RouterLink to="#" class="header-mobile-nav__ingresar" @click="closeMenu">
          Ingresar
        </RouterLink>
      </nav>
    </Transition>
  </header>
</template>

<style scoped>
/* ── Base ────────────────────────────────────────────────────── */
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 200;
  background: var(--color-indigo);
  color: var(--color-blanco);
  height: var(--header-height);
  transition:
    height 0.25s ease,
    box-shadow 0.25s ease;
}

/* Compresión al hacer scroll — Guía §6.5 */
.app-header--scrolled {
  height: var(--header-height-compact);
  box-shadow: 0 2px 16px rgba(20, 22, 28, 0.18);
}

/* ── Inner ───────────────────────────────────────────────────── */
.header-inner {
  display: flex;
  align-items: center;
  height: 100%;
  gap: var(--space-3);
  position: relative;
}

/* ── Brand ───────────────────────────────────────────────────── */
.header-brand {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  text-decoration: none;
  color: var(--color-blanco);
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.header-brand__logo {
  display: block;
  width: 3.25rem;
  height: 3.25rem;
  flex: 0 0 auto;
  object-fit: contain;
}

.header-brand__curve {
  position: absolute;
  top: auto;
  right: -35px;
  bottom: -10px;
  left: -35px;
  z-index: -1;
  pointer-events: none;
}

.header-brand__curve svg {
  display: block;
  width: 100%;
  height: 100%;
}

.header-brand__text {
  color: var(--color-indigo);
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}
.header-brand__full {
  max-width: 22rem;
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.15;
}

/* Nombre completo visible por defecto */
.header-brand__short-name {
  display: none;
}

.header-brand__full-name {
  display: inline;
}

/* ── Adaptación para móviles ───────────────────────────── */
@media (max-width: 1270px) {
  .header-brand__full-name {
    display: none;
  }

  .header-brand__short-name {
    display: inline;
    font-size: 1rem;
    font-weight: 700;
  }

  .header-brand__career {
    font-size: 0.6875rem;
  }
}

.header-brand__career {
  font-size: 0.75rem;
  font-weight: 400;
  line-height: 1.2;
  opacity: 0.82;
  white-space: nowrap;
}

/* ── Nav desktop ─────────────────────────────────────────────── */
.header-nav {
  display: flex;
  align-items: center;
  gap: 0;
  flex: 1;
  justify-content: center;
}

.header-nav__link {
  color: var(--color-blanco);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.375rem 0.75rem;
  position: relative;
  transition: opacity 0.15s ease;
}

/* Subrayado activo — Guía §3.1: --color-rosa-carmin */
.header-nav__link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0.75rem;
  right: 0.75rem;
  height: 2px;
  background: var(--color-rosa-carmin);
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.2s ease;
  border-radius: 1px;
}

.header-nav__link:hover::after {
  transform: scaleX(0.6);
}
.header-nav__link--active::after {
  transform: scaleX(1);
}
.header-nav__link--active {
  opacity: 1;
}
.header-nav__link:not(.header-nav__link--active) {
  opacity: 0.85;
}
.header-nav__link:hover {
  opacity: 1;
  color: var(--color-blanco);
}

/* ── Acciones ────────────────────────────────────────────────── */
.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

.btn-ingresar {
  color: var(--color-blanco);
  text-decoration: none;
  font-size: 0.8125rem;
  font-weight: 500;
  border: 1.5px solid rgba(255, 255, 255, 0.45);
  padding: 0.375rem 1.125rem;
  border-radius: var(--radius-sm);
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;
  white-space: nowrap;
}
.btn-ingresar:hover {
  background-color: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.75);
  color: var(--color-blanco);
}

/* ── Hamburguesa ─────────────────────────────────────────────── */
.header-hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 40px;
  height: 40px;
  padding: 6px;
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: background-color 0.15s ease;
  flex-shrink: 0;
  margin-left: auto;
}

.header-hamburger:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
.header-hamburger:focus-visible {
  outline: 2px solid var(--color-rosa-carmin);
  outline-offset: 2px;
}

.header-hamburger__bar {
  display: block;
  height: 2px;
  background: var(--color-blanco);
  border-radius: 1px;
  transition:
    transform 0.25s ease,
    opacity 0.25s ease;
}

/* Animación X al abrir */
.header-hamburger--open .header-hamburger__bar:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}
.header-hamburger--open .header-hamburger__bar:nth-child(2) {
  opacity: 0;
  transform: scaleX(0);
}
.header-hamburger--open .header-hamburger__bar:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

/* ── Menú móvil ──────────────────────────────────────────────── */
.header-mobile-nav {
  display: flex;
  flex-direction: column;
  background: var(--color-indigo);
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  padding: var(--space-2) 0 var(--space-3);
}

.header-mobile-nav__link {
  color: var(--color-blanco);
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  padding: var(--space-1) var(--space-4);
  border-left: 3px solid transparent;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;
}
.header-mobile-nav__link:hover,
.header-mobile-nav__link--active {
  background-color: rgba(255, 255, 255, 0.08);
  border-left-color: var(--color-rosa-carmin);
  color: var(--color-blanco);
}

.header-mobile-nav__ingresar {
  display: inline-block;
  margin: var(--space-2) var(--space-4) 0;
  color: var(--color-blanco);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1.5px solid rgba(255, 255, 255, 0.45);
  padding: 0.5rem 1.25rem;
  border-radius: var(--radius-sm);
  text-align: center;
  transition: background-color 0.15s ease;
}
.header-mobile-nav__ingresar:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--color-blanco);
}

/* ── Transición menú móvil ───────────────────────────────────── */
.mobile-nav-enter-active,
.mobile-nav-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.mobile-nav-enter-from,
.mobile-nav-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ── Responsive ──────────────────────────────────────────────── */
@media (max-width: 960px) {
  .header-nav,
  .header-actions {
    display: none;
  }
  .header-hamburger {
    display: flex;
  }
}

@media (max-width: 520px) {
  .header-brand__logo {
    width: 2.75rem;
    height: 2.75rem;
  }

  .header-brand__full {
    max-width: 14rem;
    font-size: 0.8rem;
  }

  .header-brand__career {
    font-size: 0.6875rem;
  }
}

/* Focus visible global para accesibilidad */
.header-nav__link:focus-visible,
.header-brand:focus-visible,
.btn-ingresar:focus-visible {
  outline: 2px solid var(--color-rosa-carmin);
  outline-offset: 3px;
  border-radius: var(--radius-sm);
}
</style>
