<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'

type ContentType = 'noticia' | 'curso' | 'investigacion' | 'edicion' | 'servicio'

interface Props {
  type: ContentType
  title: string
  eyebrow?: string
  summary?: string
  date?: string
  author?: string
  image?: string
  imageAlt?: string
  imageLoading?: 'eager' | 'lazy'
  headingLevel?: 2 | 3
  to?: string
  href?: string
}

const props = withDefaults(defineProps<Props>(), {
  imageLoading: 'lazy',
  headingLevel: 3,
})
const { t } = useI18n()

const imageFailed = ref(false)
const cardComponent = computed(() => (props.to ? RouterLink : props.href ? 'a' : 'article'))
const cardTarget = computed(() => {
  if (props.to) return { to: props.to }
  if (props.href) return { href: props.href, target: '_blank', rel: 'noopener noreferrer' }
  return {}
})

watch(
  () => props.image,
  () => {
    imageFailed.value = false
  },
)
</script>

<template>
  <component
    :is="cardComponent"
    v-bind="cardTarget"
    class="content-card"
    :class="[`content-card--${type}`, { 'content-card--linked': to || href }]"
  >
    <div class="content-card__media">
      <img
        v-if="image && !imageFailed"
        :src="image"
        :alt="imageAlt || ''"
        :loading="imageLoading"
        @error="imageFailed = true"
      />
      <span v-else class="content-card__placeholder" aria-hidden="true"></span>
    </div>

    <div class="content-card__body">
      <p v-if="eyebrow" class="content-card__eyebrow">{{ eyebrow }}</p>
      <component :is="headingLevel === 2 ? 'h2' : 'h3'" class="content-card__title">
        {{ title }}
      </component>
      <p v-if="summary" class="content-card__summary">{{ summary }}</p>
      <dl v-if="date || author" class="content-card__meta">
        <div v-if="date">
          <dt class="sr-only">{{ t('common.date') }}</dt>
          <dd>{{ date }}</dd>
        </div>
        <div v-if="author">
          <dt class="sr-only">{{ t('common.author') }}</dt>
          <dd>{{ author }}</dd>
        </div>
      </dl>
    </div>
  </component>
</template>

<style scoped>
.content-card {
  display: flex;
  min-width: 0;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--color-desactivado);
  border-radius: var(--radius-md);
  background: var(--color-blanco);
  color: var(--color-tinta);
  text-decoration: none;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.content-card--linked:hover {
  transform: translateY(-4px);
  border-color: var(--color-resaltador);
  box-shadow: var(--shadow-card-hover);
}

.content-card--linked:focus-visible {
  outline: 3px solid var(--color-resaltador);
  outline-offset: 3px;
}

.content-card__media {
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: var(--color-superficie);
}

.content-card__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s ease;
}

.content-card--linked:hover .content-card__media img {
  transform: scale(1.04);
}

.content-card__placeholder {
  display: block;
  width: 100%;
  height: 100%;
  background:
    linear-gradient(135deg, transparent 49.8%, var(--color-desactivado) 50%),
    var(--color-superficie);
}

.content-card__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-1);
  padding: var(--space-3);
}

.content-card__eyebrow {
  color: var(--color-rosa-carmin);
  font-size: var(--text-small-size);
  font-weight: 700;
}

.content-card__title {
  font-size: var(--text-h5-size);
  font-weight: var(--text-h5-weight);
  line-height: 1.25;
  overflow-wrap: anywhere;
  transition: color 0.15s ease;
}

.content-card--linked:hover .content-card__title {
  color: var(--color-rosa-carmin);
}

.content-card__summary {
  color: var(--color-tinta);
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.content-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: auto;
  padding-top: var(--space-2);
  color: var(--color-violeta);
  font-size: var(--text-small-size);
}

.content-card__meta div {
  min-width: 0;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (prefers-reduced-motion: reduce) {
  .content-card,
  .content-card__media img,
  .content-card__title {
    transition: none;
  }
}
</style>
