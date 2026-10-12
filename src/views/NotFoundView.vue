<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="not-found">
    <div class="container not-found__inner">
      <span class="not-found__code" aria-hidden="true">404</span>
      <h1 class="not-found__title">Página no encontrada</h1>
      <p class="not-found__desc">
        La página que buscas no existe o fue movida a otra dirección.
      </p>
      <RouterLink to="/" class="not-found__back">
        Volver al Inicio
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: var(--header-height);
  background: var(--color-superficie);
}

.not-found__inner {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
}

.not-found__code {
  font-size: 7rem;
  font-weight: 700;
  line-height: 1;
  color: var(--color-desactivado);
  letter-spacing: -0.05em;
}

.not-found__title {
  font-size: var(--text-h3-size);
  font-weight: var(--text-h3-weight);
  color: var(--color-tinta);
}

.not-found__desc {
  font-size: var(--text-medium-size);
  color: var(--color-violeta);
  max-width: 40ch;
}

.not-found__back {
  display: inline-block;
  background: var(--color-indigo);
  color: var(--color-blanco);
  text-decoration: none;
  font-size: var(--text-body-size);
  font-weight: 500;
  padding: 0.75rem 2rem;
  border-radius: var(--radius-sm);
  transition: background-color 0.15s ease;
  margin-top: var(--space-2);
}
.not-found__back:hover {
  background-color: var(--color-purpura);
  color: var(--color-blanco);
}
.not-found__back:focus-visible {
  outline: 2px solid var(--color-rosa-carmin);
  outline-offset: 3px;
}
</style>
