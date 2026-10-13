<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import EditorJsContent from '@/components/common/EditorJsContent.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import SectionHeaderBand from '@/components/layout/SectionHeaderBand.vue'
import { formatApiDate, newsContent, newsDate, newsSummary, newsTitle } from '@/api/normalizers'
import { mediaUrl, unwrapResource } from '@/api/response'
import { NoticiasRepository } from '@/api/repositories.js'
import type { NewsApiItem } from '@/api/types'

const route = useRoute()
const article = ref<NewsApiItem | null>(null)
const loading = ref(true)
const error = ref(false)
const apiBaseUrl = import.meta.env.VITE_API_URL
const newsId = computed(() => String(route.params.slug ?? ''))
const title = computed(() => newsTitle(article.value ?? { id: 0 }) || 'Noticia')
const image = computed(() => mediaUrl(article.value?.portada_url))
let requestSequence = 0

async function loadNews(id: string) {
  const sequence = ++requestSequence
  article.value = null
  error.value = false
  loading.value = true

  if (!/^\d+$/.test(id)) {
    error.value = true
    loading.value = false
    return
  }

  try {
    const response = await NoticiasRepository.getById(id)
    const result = unwrapResource<NewsApiItem>(response)
    if (sequence === requestSequence) article.value = result
  } catch {
    if (sequence === requestSequence) error.value = true
  } finally {
    if (sequence === requestSequence) loading.value = false
  }
}

watch(newsId, loadNews, { immediate: true })
</script>

<template>
  <div>
    <SectionHeaderBand :title="title" :subtitle="article ? formatApiDate(newsDate(article)) : undefined" />
    <main class="container view-body">
      <RouterLink class="back-link" to="/noticias">Volver a Noticias</RouterLink>

      <div v-if="loading" class="content-state" role="status">Cargando noticia…</div>
      <div v-else-if="error" class="content-state" role="alert">
        <EmptyState
          title="No se pudo cargar la noticia"
          description="Comprueba el identificador o vuelve al listado de noticias."
        />
      </div>
      <article v-else-if="article" class="news-detail">
        <img v-if="image" class="news-detail__cover" :src="image" :alt="title" />
        <p v-if="newsSummary(article)" class="news-detail__summary">{{ newsSummary(article) }}</p>
        <p v-if="article.persona?.nombre_completo" class="news-detail__author">
          Por {{ article.persona.nombre_completo }}
        </p>
        <EditorJsContent
          v-if="newsContent(article)"
          class="news-detail__content"
          :content="newsContent(article)"
          :api-base-url="apiBaseUrl"
        />
        <EmptyState v-else title="Esta noticia no tiene contenido publicado" />
      </article>
      <EmptyState v-else title="No se encontró la noticia" />
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

.news-detail {
  max-width: 76ch;
  margin-inline: auto;
}

.news-detail__cover {
  width: 100%;
  max-height: 35rem;
  margin-bottom: var(--space-3);
  object-fit: cover;
}

.news-detail__summary {
  margin-bottom: var(--space-1);
  color: #202e71;
  font-size: var(--text-large-size);
  line-height: var(--text-large-lh);
}

.news-detail__author {
  margin-bottom: var(--space-3);
  color: var(--color-violeta);
  font-size: var(--text-small-size);
}

.news-detail__content {
  line-height: 1.7;
}

.content-state {
  display: grid;
  min-height: 18rem;
  align-content: center;
  text-align: center;
}
</style>
