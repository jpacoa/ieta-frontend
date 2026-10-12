<script setup lang="ts">
import SectionHeaderBand from '@/components/layout/SectionHeaderBand.vue'
// Vista: Noticias
// Estado: esqueleto — Fase 3 / contenido real en Fase 7
</script>

<template>
  <div>
    <SectionHeaderBand title="Noticias" />
    <div class="container view-body">
      <p class="view-placeholder">Contenido de <strong>Noticias</strong> — se implementa en Fase 7</p>
    </div>
  </div>
</template>

<style scoped>
.view-body {
  padding-block: var(--space-8);
  min-height: 40vh;
}
.view-placeholder {
  color: var(--color-violeta);
  font-size: var(--text-small-size);
  text-align: center;
}
</style>
