<script setup lang="ts">
/**
 * SectionHeaderBand.vue — Banda con degradado de marca.
 * Guía §3.1: --gradient-marca reservado para bandas de cabecera.
 * Guía §5: reutilizable en todas las vistas internas.
 *
 * Props:
 * - title: título principal de la sección (requerido)
 * - subtitle: subtítulo opcional debajo del título
 * - showBreadcrumb: mostrar breadcrumb (true por defecto)
 */
import Breadcrumb from './Breadcrumb.vue'

interface Props {
  title: string
  subtitle?: string
  showBreadcrumb?: boolean
}

withDefaults(defineProps<Props>(), {
  showBreadcrumb: true,
})
</script>

<template>
  <section class="section-header-band">
    <div class="container section-header-band__inner">
      <Breadcrumb v-if="showBreadcrumb" class="section-header-band__breadcrumb" />
      <h1 class="section-header-band__title">{{ title }}</h1>
      <p v-if="subtitle" class="section-header-band__subtitle">{{ subtitle }}</p>
    </div>
  </section>
</template>

<style scoped>
.section-header-band {
  background: var(--gradient-marca);
  color: var(--color-blanco);
  padding-top: calc(var(--header-height) + var(--space-6));
  padding-bottom: var(--space-8);
  position: relative;
  overflow: hidden;
}

/* Motivo decorativo sutil de fondo */
.section-header-band::before {
  content: '';
  position: absolute;
  top: -40%;
  right: -10%;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.04);
  pointer-events: none;
}

.section-header-band__inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.section-header-band__breadcrumb {
  margin-bottom: var(--space-1);
}

.section-header-band__title {
  /* Usar H2 en la banda (H1 semántico pero tamaño H2 visualmente en secciones) */
  font-size: clamp(1.75rem, 4vw, var(--text-h2-size));
  font-weight: var(--text-h2-weight);
  line-height: var(--text-h2-lh);
  color: var(--color-blanco);
  margin: 0;
  /* Contraste AA garantizado: blanco sobre índigo/púrpura — Guía §3.1 */
}

.section-header-band__subtitle {
  font-size: var(--text-medium-size);
  line-height: var(--text-medium-lh);
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
  max-width: 60ch;
}

@media (max-width: 768px) {
  .section-header-band {
    padding-top: calc(var(--header-height) + var(--space-4));
    padding-bottom: var(--space-6);
  }
}
</style>

