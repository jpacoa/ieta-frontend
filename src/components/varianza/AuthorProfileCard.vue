<script setup lang="ts">
import { RouterLink } from 'vue-router'

defineProps<{
  name: string
  image?: string
  specialty?: string
  to: string
  compact?: boolean
}>()
</script>

<template>
  <RouterLink class="author-card" :class="{ 'author-card--compact': compact }" :to="to">
    <div class="author-card__portrait">
      <img v-if="image" :src="image" :alt="`Retrato de ${name}`" loading="lazy" />
      <span v-else aria-hidden="true">{{ name.slice(0, 1) }}</span>
    </div>
    <div class="author-card__copy">
      <h3>{{ name }}</h3>
      <p v-if="specialty">{{ specialty }}</p>
    </div>
  </RouterLink>
</template>

<style scoped>
.author-card {
  display: grid;
  min-width: 0;
  overflow: hidden;
  background: #fff;
  color: #202e71;
  text-decoration: none;
}

.author-card__portrait {
  display: grid;
  aspect-ratio: 1.08;
  place-items: center;
  overflow: hidden;
  background: #e2e3e8;
}

.author-card__portrait img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.25s ease;
}

.author-card:hover .author-card__portrait img {
  transform: scale(1.04);
}

.author-card__portrait span {
  color: #202e71;
  font-size: 2rem;
  font-weight: 700;
}

.author-card__copy {
  display: grid;
  gap: 0.15rem;
  padding: 0.5rem;
}

.author-card__copy h3 {
  font-size: 0.8125rem;
  line-height: 1.25;
  overflow-wrap: anywhere;
}

.author-card__copy p {
  color: #5b5d69;
  font-size: 0.6875rem;
}

.author-card:hover h3 {
  color: #f50088;
}

.author-card:focus-visible {
  position: relative;
  z-index: 1;
  outline: 3px solid #6c81c7;
  outline-offset: -3px;
}

.author-card--compact {
  grid-template-columns: 4.5rem minmax(0, 1fr);
  align-items: center;
}

.author-card--compact .author-card__portrait {
  aspect-ratio: 1;
}

.author-card--compact .author-card__copy {
  padding: 0.65rem 0.85rem;
}

.author-card--compact .author-card__copy h3 {
  font-size: 0.9375rem;
}

.author-card--compact .author-card__copy p {
  font-size: 0.75rem;
}

@media (prefers-reduced-motion: reduce) {
  .author-card__portrait img {
    transition: none;
  }
}
</style>
