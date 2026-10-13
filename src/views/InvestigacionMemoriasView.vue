<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import ContentCard from '@/components/common/ContentCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import LoadMoreButton from '@/components/common/LoadMoreButton.vue'
import SearchFilterBar from '@/components/common/SearchFilterBar.vue'
import SectionHeaderBand from '@/components/layout/SectionHeaderBand.vue'
import { authorName, formatApiDate, memoryDate, memoryDescription, memoryTitle } from '@/api/normalizers'
import { mediaUrl } from '@/api/response'
import { MemoriasInvestigacionRepository } from '@/api/repositories.js'
import type { ResearchMemoryApiItem } from '@/api/types'
import { usePaginatedResource } from '@/composables/usePaginatedResource'

const query = ref('')
const filterValues = ref<Record<string, string>>({ year: '' })
const resource = usePaginatedResource<ResearchMemoryApiItem>((page) =>
  MemoriasInvestigacionRepository.list({ page }),
)

function memoryYear(memory: ResearchMemoryApiItem) {
  const value = memoryDate(memory)
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : String(date.getFullYear())
}

const filters = computed(() => [{
  key: 'year',
  label: 'Año',
  options: [...new Set(resource.items.value.map(memoryYear).filter(Boolean))]
    .sort((first, second) => second.localeCompare(first))
    .map((year) => ({ value: year, label: year })),
}])

const visibleMemories = computed(() => {
  const search = query.value.trim().toLocaleLowerCase()
  return resource.items.value.filter((memory) => {
    const text = `${memoryTitle(memory)} ${memoryDescription(memory)} ${memory.etiqueta ?? memory.mdi_etiqueta ?? ''} ${authorName(memory.autor ?? { id: 0, slug: '' })}`
    const matchesQuery = !search || text.toLocaleLowerCase().includes(search)
    const matchesYear = !filterValues.value.year || memoryYear(memory) === filterValues.value.year
    return matchesQuery && matchesYear
  })
})

onMounted(() => resource.refresh())
</script>

<template>
  <div>
    <SectionHeaderBand
      title="Memorias de Investigación"
      subtitle="Informes, documentos y resultados de investigación del IETA."
    />
    <main class="container view-body">
      <SearchFilterBar
        v-model="query"
        v-model:filter-values="filterValues"
        :filters="filters"
        :no-results="query.trim().length > 0 && visibleMemories.length === 0"
      />
      <div v-if="resource.loading.value && resource.items.value.length === 0" class="content-state" role="status">
        Cargando memorias…
      </div>
      <div v-else-if="resource.error.value && resource.items.value.length === 0" class="content-state" role="alert">
        <p>No se pudieron cargar las memorias de investigación.</p>
        <button class="retry-button" type="button" @click="resource.refresh">Reintentar</button>
      </div>
      <template v-else>
        <div v-if="visibleMemories.length" class="memories-grid">
          <ContentCard
            v-for="memory in visibleMemories"
            :key="memory.id"
            type="investigacion"
            :title="memoryTitle(memory) || 'Memoria de investigación'"
            :eyebrow="memory.etiqueta || memory.mdi_etiqueta || 'Investigación'"
            :summary="memoryDescription(memory)"
            :date="formatApiDate(memoryDate(memory))"
            :author="memory.autor ? authorName(memory.autor) : undefined"
            :href="mediaUrl(memory.archivo_url || memory.enlace_url || memory.mdi_enlace_url)"
          />
        </div>
        <EmptyState
          v-else-if="!resource.loading.value && !query.trim()"
          title="No hay memorias publicadas"
          description="Los documentos de investigación disponibles aparecerán aquí."
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

.memories-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-2);
  margin-top: var(--space-3);
}

.content-state {
  display: grid;
  min-height: 17rem;
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

@media (max-width: 900px) {
  .memories-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 620px) {
  .memories-grid {
    grid-template-columns: 1fr;
  }
}
</style>
