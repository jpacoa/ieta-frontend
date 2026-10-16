<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ChevronLeft, ChevronRight } from '@lucide/vue'

interface HeroSlide {
  title: string
  description: string
  actionLabel: string
  actionTo: string
  image: string
  imageAlt?: string
  indexText: string
}

const props = withDefaults(
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

const slides = ref<HeroSlide[]>([
  {
    title: props.title,
    description: props.description,
    actionLabel: props.actionLabel,
    actionTo: props.actionTo,
    image: props.image,
    imageAlt: props.imageAlt,
    indexText: '01 / 03 · IETA',
  },
  {
    title: 'Modelos analíticos de alto impacto',
    description: 'Desarrollamos metodologías de inferencia, supervivencia, optimización y aprendizaje automático aplicadas a problemáticas nacionales.',
    actionLabel: 'Ver Líneas de Investigación',
    actionTo: '/investigacion/lineas-investigacion',
    image: props.image,
    imageAlt: 'Líneas de investigación IETA',
    indexText: '02 / 03 · CIENCIA',
  },
  {
    title: 'Revista Científica Varianza',
    description: 'Publicación periódica indexada con investigaciones originales en estadística teórica, métodos probabilísticos y ciencia de datos.',
    actionLabel: 'Explorar Ediciones',
    actionTo: '/revista-varianza',
    image: props.image,
    imageAlt: 'Revista Varianza',
    indexText: '03 / 03 · REVISTA',
  },
])

const currentSlideIndex = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

function nextSlide() {
  currentSlideIndex.value = (currentSlideIndex.value + 1) % slides.value.length
}

function prevSlide() {
  currentSlideIndex.value = (currentSlideIndex.value - 1 + slides.value.length) % slides.value.length
}

function setSlide(index: number) {
  currentSlideIndex.value = index
}

function startTimer() {
  if (!timer) {
    timer = setInterval(nextSlide, 7000)
  }
}

function pauseTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowLeft') {
    prevSlide()
  } else if (event.key === 'ArrowRight') {
    nextSlide()
  }
}

onMounted(() => {
  startTimer()
})

onBeforeUnmount(() => {
  pauseTimer()
})
</script>

<template>
  <section
    class="home-hero"
    :style="{ '--hero-image': `url('${slides[currentSlideIndex].image}')` }"
    role="region"
    aria-roledescription="carrusel"
    aria-label="Carrusel destacado del IETA"
    tabindex="0"
    @mouseenter="pauseTimer"
    @mouseleave="startTimer"
    @focusin="pauseTimer"
    @focusout="startTimer"
    @keydown="handleKeydown"
  >
    <div class="home-hero__image" role="img" :aria-label="slides[currentSlideIndex].imageAlt"></div>
    <div class="home-hero__shade" aria-hidden="true"></div>

    <div class="container home-hero__content">
      <p class="home-hero__eyebrow">Instituto de Estadística Teórica y Aplicada</p>
      <h1 :key="`title-${currentSlideIndex}`" class="home-hero__title-anim">
        {{ slides[currentSlideIndex].title }}
      </h1>
      <p :key="`desc-${currentSlideIndex}`" class="home-hero__description home-hero__desc-anim">
        {{ slides[currentSlideIndex].description }}
      </p>
      <RouterLink class="home-hero__action" :to="slides[currentSlideIndex].actionTo">
        {{ slides[currentSlideIndex].actionLabel }}
      </RouterLink>
    </div>

    <!-- Navigation Controls & Dots -->
    <div class="home-hero__nav" aria-label="Controles del carrusel">
      <button
        type="button"
        class="hero-arrow-btn"
        aria-label="Diapositiva anterior"
        @click="prevSlide"
      >
        <ChevronLeft :size="20" />
      </button>

      <div class="hero-dots">
        <button
          v-for="(_, index) in slides"
          :key="index"
          type="button"
          class="hero-dot"
          :class="{ 'hero-dot--active': currentSlideIndex === index }"
          :aria-label="`Ir a la diapositiva ${index + 1}`"
          @click="setSlide(index)"
        ></button>
      </div>

      <button
        type="button"
        class="hero-arrow-btn"
        aria-label="Diapositiva siguiente"
        @click="nextSlide"
      >
        <ChevronRight :size="20" />
      </button>
    </div>

    <span class="home-hero__index" aria-hidden="true">
      {{ slides[currentSlideIndex].indexText }}
    </span>
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

/* Carousel Nav Controls */
.home-hero__nav {
  position: absolute;
  left: max(var(--space-4), calc((100vw - var(--container-max)) / 2 + var(--space-4)));
  bottom: var(--space-3);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  z-index: 2;
}

.hero-arrow-btn {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.hero-arrow-btn:hover {
  background: #f3007b;
  border-color: #f3007b;
  transform: scale(1.08);
}

.hero-dots {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.hero-dot {
  width: 0.65rem;
  height: 0.65rem;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
}

.hero-dot--active {
  background: #f3007b;
  width: 1.5rem;
  border-radius: 999px;
}

.home-hero__title-anim {
  animation: heroTextFade 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}

.home-hero__desc-anim {
  animation: heroTextFade 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes heroTextFade {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

  .home-hero__index {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-hero__action,
  .home-hero__title-anim,
  .home-hero__desc-anim {
    animation: none;
    transition: none;
  }
}
</style>
