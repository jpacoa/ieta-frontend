<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import EditorJsContent from '@/components/common/EditorJsContent.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import SectionHeaderBand from '@/components/layout/SectionHeaderBand.vue'
import { LineasInvestigacionRepository } from '@/api/repositories.js'

interface ResearchLine {
  id: number
  titulo: string
  slug: string
  descripcion: string
  contenido: unknown
  imagen_url?: string | null
}

interface LineDetailResponse {
  data: ResearchLine
}

const route = useRoute()
const { t } = useI18n()
const line = ref<ResearchLine | null>(null)
const loading = ref(true)
const error = ref(false)
const apiBaseUrl = import.meta.env.VITE_API_URL
const lineId = computed(() => String(route.params.id ?? ''))
let requestSequence = 0

const imageUrl = computed(() => {
  if (!line.value?.imagen_url) return undefined

  try {
    const url = new URL(line.value.imagen_url, apiBaseUrl)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : undefined
  } catch {
    return undefined
  }
})

async function loadLine(id: string) {
  const sequence = ++requestSequence
  loading.value = true
  error.value = false
  line.value = null

  if (!/^\d+$/.test(id)) {
    error.value = true
    loading.value = false
    return
  }

  try {
    const response = (await LineasInvestigacionRepository.getById(id)) as LineDetailResponse
    if (sequence === requestSequence) line.value = response.data ?? null
  } catch {
    if (sequence === requestSequence) error.value = true
  } finally {
    if (sequence === requestSequence) loading.value = false
  }
}

watch(lineId, loadLine, { immediate: true })
</script>

<template>
  <div>
    <SectionHeaderBand :title="line?.titulo || t('research.lineDetailTitle')" />

    <main class="container view-body">
      <RouterLink class="back-link" to="/investigacion/lineas-investigacion">
        {{ t('research.backToLines') }}
      </RouterLink>

      <div v-if="loading" class="content-state" role="status" aria-live="polite">
        {{ t('common.loading') }}
      </div>

      <div v-else-if="error" class="content-state" role="alert">
        <p>{{ t('common.error') }}</p>
        <button class="retry-button" type="button" @click="loadLine(lineId)">
          {{ t('common.tryAgain') }}
        </button>
      </div>

      <article v-else-if="line" class="line-detail">
        <p v-if="line.descripcion" class="line-detail__description">{{ line.descripcion }}</p>

        <figure v-if="imageUrl" class="line-detail__image">
          <img :src="imageUrl" :alt="line.titulo" loading="lazy" />
        </figure>

        <section v-if="line.contenido" class="line-detail__content">
          <EditorJsContent :content="line.contenido" :api-base-url="apiBaseUrl" />
        </section>
        <EmptyState v-else :title="t('common.noResults')" />
      </article>

      <EmptyState v-else :title="t('common.noResults')" />
    </main>
  </div>
</template>

<style scoped>
.view-body {
  min-height: 40vh;
  padding-block: var(--space-4) var(--space-8);
}

.back-link {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  margin-bottom: var(--space-3);
  font-weight: 600;
}

.back-link:focus-visible {
  outline: 3px solid var(--color-resaltador);
  outline-offset: 2px;
}

.line-detail {
  max-width: 78ch;
  margin-inline: auto;
}

.line-detail__description {
  margin-bottom: var(--space-4);
  font-size: var(--text-large-size);
  line-height: var(--text-large-lh);
}

.line-detail__image {
  margin-block: var(--space-4);
}

.line-detail__image img {
  width: 100%;
  max-height: 32rem;
  border-radius: var(--radius-md);
  object-fit: cover;
}

.line-detail__content {
  margin-top: var(--space-4);
  line-height: 1.75;
}

.line-detail__content :deep(h2),
.line-detail__content :deep(h3) {
  margin-block: var(--space-4) var(--space-2);
  font-size: var(--text-h5-size);
  line-height: var(--text-h5-lh);
}

.line-detail__content :deep(p),
.line-detail__content :deep(ul),
.line-detail__content :deep(ol) {
  margin-bottom: var(--space-2);
}

.line-detail__content :deep(ul),
.line-detail__content :deep(ol) {
  padding-left: var(--space-4);
}

.content-state {
  display: grid;
  min-height: 18rem;
  align-content: center;
  justify-items: center;
  gap: var(--space-2);
  text-align: center;
}

.retry-button {
  min-height: 2.75rem;
  padding: var(--space-1) var(--space-2);
  border: 1px solid var(--color-indigo);
  border-radius: var(--radius-sm);
  background: var(--color-indigo);
  color: var(--color-blanco);
  font: inherit;
  cursor: pointer;
}

.retry-button:focus-visible {
  outline: 3px solid var(--color-resaltador);
  outline-offset: 2px;
}
</style>
