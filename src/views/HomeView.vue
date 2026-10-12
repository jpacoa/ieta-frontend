<script setup lang="ts">
// Vista: Inicio
// Ruta: /
// Estado: esqueleto — Fase 3 / pendiente contenido real en Fase 7
</script>

<template>
  <div class="home-view">
    <!-- El hero de la home ocupa el lugar de la SectionHeaderBand.
         Se implementará en Fase 7. Por ahora: placeholder con fondo degradado -->
    <section class="home-hero">
      <div class="container">
        <h1>Instituto de Estadística<br>Teórica y Aplicada</h1>
        <p>Universidad Mayor de San Andrés</p>
      </div>
    </section>

    <section class="home-placeholder container">
      <p>Contenido del Home — se implementa en Fase 7</p>
    </section>
  </div>
</template>

<style scoped>
.home-hero {
  background: var(--gradient-marca);
  color: var(--color-blanco);
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding-top: var(--header-height);
}
.home-hero h1 {
  font-size: clamp(2rem, 5vw, var(--text-h1-size));
  margin-bottom: var(--space-2);
}
.home-hero p {
  font-size: var(--text-large-size);
  opacity: 0.8;
}
.home-placeholder {
  padding-block: var(--space-8);
  color: var(--color-violeta);
  font-size: var(--text-small-size);
  text-align: center;
}
</style>
