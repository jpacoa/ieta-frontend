<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ContentCard from '@/components/common/ContentCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import LoadMoreButton from '@/components/common/LoadMoreButton.vue'
import SearchFilterBar from '@/components/common/SearchFilterBar.vue'
import SectionHeaderBand from '@/components/layout/SectionHeaderBand.vue'
import TabNav from '@/components/common/TabNav.vue'
import { LineasInvestigacionRepository, MemoriasInvestigacionRepository } from '@/api/repositories.js'
import type { ResearchMemoryApiItem } from '@/api/types'
import { authorName, formatApiDate, memoryDate, memoryDescription, memoryTitle } from '@/api/normalizers'
import { mediaUrl } from '@/api/response'
import { usePaginatedResource } from '@/composables/usePaginatedResource'

const { t } = useI18n()
const tabs = computed(() => [
  { value: 'lineas', label: t('tabs.lineas') },
  { value: 'memorias', label: t('tabs.memorias') },
])
const activeTab = ref('lineas')
const memoryQuery = ref('')
const memoryFilters = ref<Record<string, string>>({ year: '' })
const memories = usePaginatedResource<ResearchMemoryApiItem>((page) =>
  MemoriasInvestigacionRepository.list({ page }),
)

interface ResearchLine {
  id: number
  titulo: string
  slug: string
  descripcion: string
  imagen_url?: string | null
}

interface LinesResponse {
  data: ResearchLine[]
  meta?: {
    current_page?: number
    last_page?: number
  }
}

const lines = ref<ResearchLine[]>([])
const currentPage = ref(0)
const lastPage = ref(1)
const loading = ref(true)
const loadingMore = ref(false)
const error = ref(false)
const hasMore = computed(() => currentPage.value < lastPage.value)
const apiBaseUrl = import.meta.env.VITE_API_URL

const memoryFilterOptions = computed(() => [{
  key: 'year',
  label: 'Año',
  options: [...new Set(memories.items.value.map((memory) => {
    const date = new Date(memoryDate(memory))
    return Number.isNaN(date.getTime()) ? '' : String(date.getFullYear())
  }).filter(Boolean))]
    .sort((first, second) => second.localeCompare(first))
    .map((year) => ({ value: year, label: year })),
}])

const visibleMemories = computed(() => {
  const query = memoryQuery.value.trim().toLocaleLowerCase()
  return memories.items.value.filter((memory) => {
    const author = memory.autor ? authorName(memory.autor) : ''
    const searchable = `${memoryTitle(memory)} ${memoryDescription(memory)} ${memory.etiqueta ?? memory.mdi_etiqueta ?? ''} ${author}`
    const date = new Date(memoryDate(memory))
    const year = Number.isNaN(date.getTime()) ? '' : String(date.getFullYear())
    return (!query || searchable.toLocaleLowerCase().includes(query)) &&
      (!memoryFilters.value.year || year === memoryFilters.value.year)
  })
})

watch(activeTab, (tab) => {
  if (tab === 'memorias' && memories.page.value === 0) void memories.refresh()
})

async function loadLines(loadNextPage = false) {
  if (loadNextPage) loadingMore.value = true
  else loading.value = true
  error.value = false

  const page = loadNextPage ? currentPage.value + 1 : 1

  try {
    const response = (await LineasInvestigacionRepository.list({ page })) as LinesResponse
    const pageLines = Array.isArray(response.data) ? response.data : []

    lines.value = loadNextPage ? [...lines.value, ...pageLines] : pageLines
    currentPage.value = response.meta?.current_page ?? page
    lastPage.value = response.meta?.last_page ?? currentPage.value
  } catch {
    error.value = true
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

function detailPath(line: ResearchLine): string {
  return `/investigacion/lineas-investigacion/${line.id}`
}

function imageUrl(path?: string | null): string | undefined {
  if (!path) return undefined

  try {
    const url = new URL(path, apiBaseUrl)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : undefined
  } catch {
    return undefined
  }
}

onMounted(() => loadLines())
</script>

<template>
  <div>
    <SectionHeaderBand :title="t('research.linesTitle')" />

    <main class="container view-body">
      <TabNav v-model="activeTab" :items="tabs" :label="t('aria.researchSections')" />

      <section v-if="activeTab === 'memorias'" class="memories-panel" aria-labelledby="memories-heading">
        <header class="memories-panel__heading">
          <div>
            <p>Producción académica</p>
            <h2 id="memories-heading">{{ t('tabs.memorias') }}</h2>
          </div>
          <span>Registro institucional</span>
        </header>
        <SearchFilterBar
          v-model="memoryQuery"
          v-model:filter-values="memoryFilters"
          :filters="memoryFilterOptions"
          :no-results="memoryQuery.trim().length > 0 && visibleMemories.length === 0"
        />
        <div v-if="memories.loading.value && memories.items.value.length === 0" class="content-state" role="status">
          Cargando memorias…
        </div>
        <div v-else-if="memories.error.value && memories.items.value.length === 0" class="content-state" role="alert">
          <p>{{ t('common.error') }}</p>
          <button class="retry-button" type="button" @click="memories.refresh">{{ t('common.tryAgain') }}</button>
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
          <EmptyState v-else-if="memories.items.value.length === 0" :title="t('common.noResults')" />
          <EmptyState v-else title="No hay coincidencias" description="Cambia la búsqueda o limpia el filtro de año." />
          <LoadMoreButton
            :loading="memories.loadingMore.value"
            :has-more="memories.hasMore.value"
            @load="memories.loadMore"
          />
        </template>
      </section>

      <template v-else>
        <div v-if="loading" class="content-state" role="status" aria-live="polite">
          {{ t('common.loading') }}
        </div>

        <div v-else-if="error && lines.length === 0" class="content-state" role="alert">
          <p>{{ t('common.error') }}</p>
          <button class="retry-button" type="button" @click="loadLines()">
            {{ t('common.tryAgain') }}
          </button>
        </div>

        <template v-else>
          <p v-if="error" class="inline-error" role="alert">{{ t('common.error') }}</p>

          <div v-if="lines.length" class="lines-grid">
            <ContentCard
              v-for="line in lines"
              :key="line.id"
              type="investigacion"
              :title="line.titulo"
              :summary="line.descripcion"
              :image="imageUrl(line.imagen_url)"
              :image-alt="line.titulo"
              :to="detailPath(line)"
            />
          </div>
          <EmptyState v-else :title="t('common.noResults')" />

          <LoadMoreButton :loading="loadingMore" :has-more="hasMore" @load="loadLines(true)" />
        </template>
      </template>
    </main>
  </div>
</template>

<style scoped>
.view-body {
  min-height: 40vh;
  padding-block: var(--space-6) var(--space-8);
}

.lines-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-3);
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

.inline-error {
  margin-bottom: var(--space-2);
  color: var(--color-rosa-carmin);
}

.memories-panel {
  padding-block: var(--space-3);
}

.memories-panel__heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.memories-panel__heading p {
  color: var(--color-rosa-carmin);
  font-size: var(--text-small-size);
  font-weight: 700;
  text-transform: uppercase;
}

.memories-panel__heading h2 {
  margin-top: 0.25rem;
  color: #202e71;
  font-size: var(--text-h4-size);
}

.memories-panel__heading > span {
  color: var(--color-violeta);
  font-size: var(--text-small-size);
}

.memories-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-2);
  margin-top: var(--space-3);
}

@media (max-width: 960px) {
  .lines-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .memories-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .lines-grid {
    grid-template-columns: 1fr;
  }

  .memories-grid {
    grid-template-columns: 1fr;
  }
}
</style>
