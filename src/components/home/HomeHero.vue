<script setup lang="ts">
import { RouterLink } from 'vue-router'

withDefaults(
  defineProps<{
    title: string
    description: string
    actionLabel: string
    actionTo: string
    image: string
    imageAlt?: string
  }>(),
  { imageAlt: '' },
)
</script>

<template>
  <section class="home-hero" :style="{ '--hero-image': `url('${image}')` }">
    <div class="home-hero__image" role="img" :aria-label="imageAlt"></div>
    <div class="home-hero__shade" aria-hidden="true"></div>
    <div class="container home-hero__content">
      <p class="home-hero__eyebrow">Instituto de Estadística Teórica y Aplicada</p>
      <h1>{{ title }}</h1>
      <p class="home-hero__description">{{ description }}</p>
      <RouterLink class="home-hero__action" :to="actionTo">{{ actionLabel }}</RouterLink>
    </div>
    <span class="home-hero__index" aria-hidden="true">01 / IETA</span>
  </section>
</template>

<style scoped>
.home-hero {
  position: relative;
  display: flex;
  min-height: min(50rem, 92svh);
  align-items: center;
  overflow: hidden;
  background: #202e71;
  color: var(--color-blanco);
  isolation: isolate;
}

.home-hero__image,
.home-hero__shade {
  position: absolute;
  z-index: -1;
  inset: 0;
}

.home-hero__image {
  background-image: var(--hero-image);
  background-position: center 44%;
  background-size: cover;
  transform: scale(1.015);
}

.home-hero__shade {
  background: linear-gradient(90deg, rgb(17 25 75 / 82%) 0%, rgb(32 46 113 / 58%) 52%, rgb(32 46 113 / 12%) 100%);
}

.home-hero__content {
  padding-top: calc(var(--header-height) + var(--space-8));
  padding-bottom: var(--space-8);
}

.home-hero__eyebrow {
  max-width: 34rem;
  margin-bottom: var(--space-2);
  color: #f6d1e3;
  font-size: var(--text-small-size);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.home-hero h1 {
  max-width: 10ch;
  color: var(--color-blanco);
  font-size: clamp(2.75rem, 5rem, var(--text-h1-size));
  line-height: 1.08;
}

.home-hero__description {
  max-width: 35rem;
  margin-top: var(--space-2);
  color: rgb(255 255 255 / 88%);
  font-size: var(--text-medium-size);
  line-height: var(--text-medium-lh);
}

.home-hero__action {
  display: inline-flex;
  min-height: 3rem;
  align-items: center;
  margin-top: var(--space-3);
  padding-inline: var(--space-3);
  border-radius: var(--radius-sm);
  background: #f3007b;
  color: var(--color-blanco);
  font-weight: 700;
  transition: background-color 0.18s ease, transform 0.18s ease;
}

.home-hero__action:hover {
  transform: translateY(-2px);
  background: #d9006f;
  color: var(--color-blanco);
}

.home-hero__action:focus-visible {
  outline: 3px solid white;
  outline-offset: 3px;
}

.home-hero__index {
  position: absolute;
  right: max(var(--space-4), calc((100vw - var(--container-max)) / 2 + var(--space-4)));
  bottom: var(--space-3);
  color: rgb(255 255 255 / 78%);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

@media (max-width: 680px) {
  .home-hero {
    min-height: 39rem;
  }

  .home-hero__image {
    background-position: 58% center;
  }

  .home-hero__shade {
    background: linear-gradient(90deg, rgb(17 25 75 / 86%) 0%, rgb(32 46 113 / 64%) 100%);
  }

  .home-hero__content {
    padding-top: calc(var(--header-height) + var(--space-6));
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-hero__action {
    transition: none;
  }
}
</style>
