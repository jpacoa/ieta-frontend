<script setup lang="ts">
import Breadcrumb from '@/components/layout/Breadcrumb.vue'

defineProps<{
  title: string
  subtitle: string
  breadcrumbLabel?: string
}>()
</script>

<template>
  <section class="varianza-hero">
    <div class="container varianza-hero__inner">
      <Breadcrumb class="varianza-hero__breadcrumb" :append-label="breadcrumbLabel" />
      <div class="varianza-hero__title">
        <p>Publicación científica</p>
        <h1>{{ title }}</h1>
        <span>{{ subtitle }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.varianza-hero {
  position: relative;
  overflow: hidden;
  background: #202e71;
  color: #f5f5f8;
}

.varianza-hero::after {
  position: absolute;
  right: -10rem;
  bottom: -16rem;
  width: 34rem;
  aspect-ratio: 1;
  border: 1px solid rgb(255 255 255 / 12%);
  border-radius: 50%;
  content: '';
  pointer-events: none;
}

.varianza-hero__inner {
  position: relative;
  z-index: 1;
  min-height: 14rem;
  padding-top: calc(var(--header-height) + 0.5rem);
  padding-bottom: var(--space-4);
}

.varianza-hero__breadcrumb {
  color: rgb(255 255 255 / 72%);
}

.varianza-hero__title {
  display: grid;
  justify-items: center;
  margin-top: var(--space-1);
  text-align: center;
}

.varianza-hero__title p {
  color: #f6d1e3;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.varianza-hero__title h1 {
  color: #f50088;
  font-size: clamp(2.75rem, 5vw, 3.5rem);
  line-height: 1.12;
}

.varianza-hero__title span {
  color: #f5f5f8;
  font-size: clamp(1rem, 2.5vw, 1.4rem);
  line-height: 1.35;
}

@media (max-width: 680px) {
  .varianza-hero__inner {
    min-height: 12rem;
    padding-top: calc(var(--header-height) + var(--space-1));
  }
}
</style>
