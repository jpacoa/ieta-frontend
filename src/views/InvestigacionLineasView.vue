<script setup lang="ts">
// Vista: Líneas de Investigación
// Ruta: /investigacion/lineas
// Estado: esqueleto — Fase 3
</script>

<template>
  <div class="view-skeleton">
    <h1>Líneas de Investigación</h1>
    <p class="view-skeleton__route">Ruta: <code>/investigacion/lineas</code></p>
  </div>
</template>

<style scoped>
.view-skeleton {
  padding: var(--space-8) 0;
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  text-align: center;
}
.view-skeleton h1 {
  color: var(--color-indigo);
}
.view-skeleton__route {
  color: var(--color-violeta);
  font-size: var(--text-small-size);
}
</style>
