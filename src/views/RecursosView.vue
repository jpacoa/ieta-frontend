<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import ContentCard from '@/components/common/ContentCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import LoadMoreButton from '@/components/common/LoadMoreButton.vue'
import SearchFilterBar from '@/components/common/SearchFilterBar.vue'
import TabNav from '@/components/common/TabNav.vue'
import SectionHeaderBand from '@/components/layout/SectionHeaderBand.vue'
import { mediaUrl, unwrapCollection } from '@/api/response'
import { AreasTematicasRepository, BancoDatosRepository } from '@/api/repositories.js'
import type { DataAreaApiItem, DataBankApiItem } from '@/api/types'
import { usePaginatedResource } from '@/composables/usePaginatedResource'

const route = useRoute()
const router = useRouter()
const query = ref('')
const filterValues = ref<Record<string, string>>({ year: '', type: '' })
const banks = usePaginatedResource<DataBankApiItem>((page) => BancoDatosRepository.list({ page }))
const thematicAreas = ref<DataAreaApiItem[]>([])
const areasError = ref(false)

const tabs = [
  { value: 'banco-de-datos', label: 'Banco de Datos' },
  { value: 'revistas-de-estadistica', label: 'Revistas de Estadística' },
]

const activeTab = computed({
  get: () => (route.params.tab === 'revistas-de-estadistica' ? 'revistas-de-estadistica' : 'banco-de-datos'),
  set: (value: string) => {
    void router.replace({ name: 'recursos', params: { tab: value === 'banco-de-datos' ? undefined : value } })
  },
})

const filterOptions = computed(() => [
  {
    key: 'year',
    label: 'Año',
    options: [...new Set(banks.items.value.map((item) => item.anio).filter((year): year is number => typeof year === 'number'))]
      .sort((first, second) => second - first)
      .map((year) => ({ value: String(year), label: String(year) })),
  },
  {
    key: 'type',
    label: 'Tipo',
    options: [...new Set(banks.items.value.map((item) => item.tipo_dato).filter((type): type is string => Boolean(type)))]
      .map((type) => ({ value: type, label: type })),
  },
])

const visibleBanks = computed(() => {
  const search = query.value.trim().toLocaleLowerCase()
  return banks.items.value.filter((item) => {
    const text = `${item.titulo} ${item.codigo ?? ''} ${item.descripcion ?? ''} ${item.locacion ?? ''} ${item.areas_tematicas?.map((area) => area.nombre).join(' ') ?? ''}`
    const matchesQuery = !search || text.toLocaleLowerCase().includes(search)
    const matchesYear = !filterValues.value.year || String(item.anio ?? '') === filterValues.value.year
    const matchesType = !filterValues.value.type || item.tipo_dato === filterValues.value.type
    return matchesQuery && matchesYear && matchesType
  })
})

async function loadAreas() {
  areasError.value = false
  try {
    thematicAreas.value = unwrapCollection<DataAreaApiItem>(await AreasTematicasRepository.list({ page: 1 })).data
  } catch {
    areasError.value = true
  }
}

watch(activeTab, (tab) => {
  if (tab === 'banco-de-datos' && banks.page.value === 0) void banks.refresh()
}, { immediate: true })

onMounted(loadAreas)
</script>

<template>
  <div>
    <SectionHeaderBand title="Recursos" subtitle="Datos y publicaciones para apoyar el análisis estadístico." />
    <main class="container view-body">
      <TabNav v-model="activeTab" :items="tabs" label="Secciones de recursos" />

      <section v-if="activeTab === 'banco-de-datos'" class="resource-panel">
        <div v-if="thematicAreas.length" class="resource-areas" aria-label="Áreas temáticas">
          <span v-for="area in thematicAreas" :key="area.id">{{ area.nombre }}</span>
        </div>
        <p v-else-if="areasError" class="resource-inline-error" role="status">
          No se pudieron cargar las áreas temáticas.
        </p>

        <SearchFilterBar
          v-model="query"
          v-model:filter-values="filterValues"
          :filters="filterOptions"
          :no-results="query.trim().length > 0 && visibleBanks.length === 0"
        />

        <div v-if="banks.loading.value && banks.items.value.length === 0" class="resource-state" role="status">
          Cargando banco de datos…
        </div>
        <div v-else-if="banks.error.value && banks.items.value.length === 0" class="resource-state" role="alert">
          <p>No se pudo cargar el banco de datos.</p>
          <button type="button" class="retry-button" @click="banks.refresh">Reintentar</button>
        </div>
        <template v-else>
          <div v-if="visibleBanks.length" class="resource-grid">
            <ContentCard
              v-for="item in visibleBanks"
              :key="item.id"
              type="edicion"
              :title="item.titulo"
              :eyebrow="item.tipo_dato || 'Banco de Datos'"
              :summary="[item.locacion, item.areas_tematicas?.map((area) => area.nombre).join(', ')].filter(Boolean).join(' · ') || item.descripcion || undefined"
              :date="item.anio ? String(item.anio) : undefined"
              :image="mediaUrl(item.portada_url)"
              :image-alt="item.titulo"
              :to="`/recursos/banco-datos/${item.id}`"
            />
          </div>
          <EmptyState
            v-else-if="!banks.loading.value && !query.trim() && !filterValues.year && !filterValues.type"
            title="No hay conjuntos de datos publicados"
            description="Los bancos de datos publicados por el IETA aparecerán en esta sección."
          />
          <LoadMoreButton
            :loading="banks.loadingMore.value"
            :has-more="banks.hasMore.value"
            @load="banks.loadMore"
          />
        </template>
      </section>

      <section v-else class="journal-directory">
        <header>
          <p>Publicaciones estadísticas</p>
          <h2>Revistas de Estadística</h2>
        </header>
        <article class="journal-directory__item">
          <div>
            <p>Publicación científica del IETA</p>
            <h3>Revista Varianza</h3>
            <span>Artículos originales de estadística teórica y aplicada.</span>
          </div>
          <RouterLink to="/revista-varianza">Consultar revista</RouterLink>
        </article>
      </section>
    </main>
  </div>
</template>

<style scoped>
.view-body {
  min-height: 40vh;
  padding-block: var(--space-5) var(--space-8);
}

.resource-panel {
  padding-top: var(--space-3);
}

.resource-areas {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  margin-bottom: var(--space-2);
}

.resource-areas span {
  padding: 0.35rem 0.65rem;
  border-left: 3px solid var(--color-rosa-carmin);
  background: var(--color-superficie);
  color: #202e71;
  font-size: var(--text-small-size);
  font-weight: 600;
}

.resource-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-2);
  margin-top: var(--space-3);
}

.resource-state {
  display: grid;
  min-height: 17rem;
  align-content: center;
  justify-items: center;
  gap: var(--space-2);
}

.resource-inline-error {
  margin-bottom: var(--space-2);
  color: var(--color-rosa-carmin);
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

.journal-directory {
  display: grid;
  gap: var(--space-3);
  padding-top: var(--space-4);
}

.journal-directory header > p,
.journal-directory__item > div > p {
  margin-bottom: var(--space-1);
  color: var(--color-rosa-carmin);
  font-size: var(--text-small-size);
  font-weight: 700;
}

.journal-directory h2 {
  color: #202e71;
  font-size: var(--text-h4-size);
}

.journal-directory__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3);
  border-left: 4px solid #f50088;
  background: #fff;
}

.journal-directory__item h3 {
  margin-bottom: var(--space-1);
  color: #202e71;
}

.journal-directory__item span {
  color: #565363;
}

.journal-directory__item a {
  flex: 0 0 auto;
  font-weight: 700;
}

@media (max-width: 900px) {
  .resource-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 620px) {
  .resource-grid {
    grid-template-columns: 1fr;
  }

  .journal-directory__item {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
