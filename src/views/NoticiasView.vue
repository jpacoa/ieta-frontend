<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import ContentCard from '@/components/common/ContentCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import LoadMoreButton from '@/components/common/LoadMoreButton.vue'
import SearchFilterBar from '@/components/common/SearchFilterBar.vue'
import SectionHeaderBand from '@/components/layout/SectionHeaderBand.vue'
import { formatApiDate, newsDate, newsIsFeatured, newsIsPublished, newsSummary, newsTitle } from '@/api/normalizers'
import { mediaUrl } from '@/api/response'
import { NoticiasRepository } from '@/api/repositories.js'
import type { NewsApiItem } from '@/api/types'
import { usePaginatedResource } from '@/composables/usePaginatedResource'

const query = ref('')
const resource = usePaginatedResource<NewsApiItem>((page) => NoticiasRepository.list({ page }))
const filteredNews = computed(() => {
  const search = query.value.trim().toLocaleLowerCase()
  return resource.items.value.filter((item) => {
    if (!newsIsPublished(item)) return false
    return !search || `${newsTitle(item)} ${newsSummary(item)}`.toLocaleLowerCase().includes(search)
  })
})

onMounted(() => resource.refresh())
</script>

<template>
  <div>
    <SectionHeaderBand title="Noticias" subtitle="Actualidad, investigación e interacción social del IETA." />
    <main class="container view-body">
      <SearchFilterBar
        v-model="query"
        :no-results="query.trim().length > 0 && filteredNews.length === 0"
      />

      <div v-if="resource.loading.value && resource.items.value.length === 0" class="content-state" role="status">
        Cargando noticias…
      </div>
      <div v-else-if="resource.error.value && resource.items.value.length === 0" class="content-state" role="alert">
        <p>No se pudieron cargar las noticias.</p>
        <button class="retry-button" type="button" @click="resource.refresh">Reintentar</button>
      </div>
      <template v-else>
        <p v-if="resource.error.value" class="inline-error" role="alert">No fue posible cargar la siguiente página.</p>
        <div v-if="filteredNews.length" class="news-grid">
          <ContentCard
            v-for="(item, index) in filteredNews"
            :key="item.id"
            type="noticia"
            :title="newsTitle(item) || 'Noticia sin título'"
            :eyebrow="newsIsFeatured(item) ? 'Destacada' : 'Actualidad'"
            :summary="newsSummary(item)"
            :date="formatApiDate(newsDate(item))"
            :author="item.persona?.nombre_completo || undefined"
            :image="mediaUrl(item.portada_url)"
            :image-alt="newsTitle(item)"
            :image-loading="index === 0 ? 'eager' : 'lazy'"
            :to="`/noticias/${item.id}`"
          />
        </div>
        <EmptyState
          v-else-if="!resource.loading.value && !query.trim()"
          title="No hay noticias publicadas"
          description="Las noticias publicadas por el instituto aparecerán aquí."
        />
        <LoadMoreButton
          :loading="resource.loadingMore.value"
          :has-more="resource.hasMore.value"
          @load="resource.loadMore"
        />
      </template>
    </main>
  </div>
</template>

<style scoped>
.view-body {
  min-height: 40vh;
  padding-block: var(--space-6) var(--space-8);
}

.news-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-2);
  margin-top: var(--space-3);
}

.content-state {
  display: grid;
  min-height: 16rem;
  align-content: center;
  justify-items: center;
  gap: var(--space-2);
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

.inline-error {
  margin-top: var(--space-2);
  color: var(--color-rosa-carmin);
}

@media (max-width: 900px) {
  .news-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 620px) {
  .news-grid {
    grid-template-columns: 1fr;
  }
}
</style>
