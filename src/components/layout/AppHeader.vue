<script setup lang="ts">
// AppHeader placeholder — Fase 3 (esqueleto)
// Implementación real: Fase 4
import { RouterLink, useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

const navItems = [
  { label: 'Acerca de', to: '/acerca-de' },
  { label: 'Investigación', to: '/investigacion/lineas' },
  { label: 'Revista Varianza', to: '/revista-varianza' },
  { label: 'Servicios', to: '/servicios' },
  { label: 'Noticias', to: '/noticias' },
  { label: 'Recursos', to: '/recursos' },
  { label: 'Contacto', to: '/contacto' },
]
</script>

<template>
  <header class="app-header">
    <div class="container header-inner">
      <RouterLink to="/" class="header-brand">
        <span class="header-brand__name">IETA</span>
        <span class="header-brand__full">Instituto de Estadística Teórica y Aplicada</span>
      </RouterLink>

      <nav class="header-nav" aria-label="Navegación principal">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="header-nav__link"
          active-class="header-nav__link--active"
        >
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="header-actions">
        <!-- Espacio reservado para selector de idioma ES/EN -->
        <a href="#" class="btn-ingresar">Ingresar</a>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: var(--header-height);
  background: var(--color-indigo);
  color: var(--color-blanco);
  transition: height 0.25s ease, box-shadow 0.25s ease;
}

.header-inner {
  display: flex;
  align-items: center;
  height: 100%;
  gap: var(--space-4);
}

.header-brand {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: var(--color-blanco);
  flex-shrink: 0;
}
.header-brand__name {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
}
.header-brand__full {
  font-size: 0.65rem;
  font-weight: 400;
  opacity: 0.8;
  line-height: 1.2;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  flex: 1;
  justify-content: center;
}
.header-nav__link {
  color: var(--color-blanco);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  transition: color 0.15s ease, background-color 0.15s ease;
  position: relative;
}
.header-nav__link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--color-rosa-carmin);
  transform: scaleX(0);
  transition: transform 0.2s ease;
}
.header-nav__link:hover::after,
.header-nav__link--active::after {
  transform: scaleX(1);
}
.header-nav__link--active {
  color: var(--color-blanco);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

.btn-ingresar {
  color: var(--color-blanco);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid rgba(255, 255, 255, 0.4);
  padding: 0.375rem 1rem;
  border-radius: var(--radius-sm);
  transition: background-color 0.15s ease, border-color 0.15s ease;
}
.btn-ingresar:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.7);
  color: var(--color-blanco);
}

/* Responsive: hamburguesa por debajo de 960px — Fase 9 */
@media (max-width: 960px) {
  .header-nav {
    display: none; /* Fase 9 implementará el menú hamburguesa */
  }
}
</style>
