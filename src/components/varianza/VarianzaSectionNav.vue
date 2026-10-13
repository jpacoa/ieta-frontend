<script setup lang="ts">
import { RouterLink } from 'vue-router'

defineProps<{
  active: string
  items: Array<{ value: string; label: string; to: string }>
}>()
</script>

<template>
  <nav class="varianza-nav" aria-label="Secciones de la Revista Varianza">
    <div class="varianza-nav__inner">
      <RouterLink
        v-for="item in items"
        :key="item.value"
        :to="item.to"
        class="varianza-nav__link"
        :class="{ 'varianza-nav__link--active': active === item.value }"
        :aria-current="active === item.value ? 'page' : undefined"
      >
        {{ item.label }}
      </RouterLink>
    </div>
  </nav>
</template>

<style scoped>
.varianza-nav {
  position: relative;
  z-index: 2;
  background: #f5f5f8;
}

.varianza-nav__inner {
  display: flex;
  width: min(100%, 90rem);
  min-height: 3.5rem;
  align-items: stretch;
  justify-content: center;
  gap: clamp(0.5rem, 2.4vw, 2rem);
  margin-inline: auto;
  padding-inline: var(--space-3);
  overflow-x: auto;
  scrollbar-width: thin;
}

.varianza-nav__link {
  position: relative;
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  color: #202e71;
  font-size: 0.875rem;
  font-weight: 700;
  white-space: nowrap;
}

.varianza-nav__link::after {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 3px;
  background: #f50088;
  content: '';
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.22s ease;
}

.varianza-nav__link:hover,
.varianza-nav__link--active {
  color: #f50088;
}

.varianza-nav__link--active::after {
  transform: scaleX(1);
}

.varianza-nav__link:focus-visible {
  outline: 2px solid #6c81c7;
  outline-offset: -4px;
}

@media (max-width: 680px) {
  .varianza-nav__inner {
    justify-content: flex-start;
    gap: var(--space-3);
    padding-inline: var(--space-2);
  }
}

@media (prefers-reduced-motion: reduce) {
  .varianza-nav__link::after {
    transition: none;
  }
}
</style>
