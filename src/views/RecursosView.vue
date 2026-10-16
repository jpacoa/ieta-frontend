<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Calendar,
  Database,
  ExternalLink,
  FileSpreadsheet,
  Globe2,
  MapPin,
  Search,
  Tag,
} from '@lucide/vue'
import ContentCard from '@/components/common/ContentCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import LoadMoreButton from '@/components/common/LoadMoreButton.vue'
import SearchFilterBar from '@/components/common/SearchFilterBar.vue'
import TabNav from '@/components/common/TabNav.vue'
import SectionHeaderBand from '@/components/layout/SectionHeaderBand.vue'
import { useI18n } from 'vue-i18n'
import { mediaUrl, unwrapCollection } from '@/api/response'
import { AreasTematicasRepository, BancoDatosRepository } from '@/api/repositories.js'
import type { DataAreaApiItem, DataBankApiItem } from '@/api/types'
import { usePaginatedResource } from '@/composables/usePaginatedResource'
import { useGsapReveal } from '@/composables/useGsapReveal'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const resourcesRoot = ref<HTMLElement | null>(null)
const query = ref('')
const filterValues = ref<Record<string, string>>({ year: '' })
const activeTypeFilter = ref<string>('all')
const banks = usePaginatedResource<DataBankApiItem>((page) => BancoDatosRepository.list({ page }))
const thematicAreas = ref<DataAreaApiItem[]>([])
const areasError = ref(false)

useGsapReveal(resourcesRoot, {
  selector: '.resource-reveal',
  stagger: 0.08,
  y: 18,
})

const tabs = computed(() => [
  { value: 'banco-de-datos', label: t('tabs.database') },
  { value: 'revistas-de-estadistica', label: t('tabs.statsJournals') },
])

const activeTab = computed({
  get: () => (route.params.tab === 'revistas-de-estadistica' ? 'revistas-de-estadistica' : 'banco-de-datos'),
  set: (value: string) => {
    void router.replace({ name: 'recursos', params: { tab: value === 'banco-de-datos' ? undefined : value } })
  },
})

const yearOptions = computed(() => [
  ...new Set(banks.items.value.map((item) => item.anio).filter((year): year is number => typeof year === 'number')),
].sort((a, b) => b - a))

const visibleBanks = computed(() => {
  const search = query.value.trim().toLocaleLowerCase()
  return banks.items.value.filter((item) => {
    const text = `${item.titulo} ${item.codigo ?? ''} ${item.descripcion ?? ''} ${item.locacion ?? ''} ${item.areas_tematicas?.map((area) => area.nombre).join(' ') ?? ''}`
    const matchesQuery = !search || text.toLocaleLowerCase().includes(search)
    const matchesYear = !filterValues.value.year || String(item.anio ?? '') === filterValues.value.year
    const matchesType =
      activeTypeFilter.value === 'all' ||
      (activeTypeFilter.value === 'Encuesta' && (!item.tipo_dato || item.tipo_dato.toLowerCase().includes('encuesta'))) ||
      (activeTypeFilter.value === 'Censo' && item.tipo_dato && item.tipo_dato.toLowerCase().includes('censo')) ||
      item.tipo_dato === activeTypeFilter.value
    return matchesQuery && matchesYear && matchesType
  })
})

const journalsList = [
  {
    title: 'Revista Varianza',
    subtitle: 'Revista del Instituto de Estadística Teórica y Aplicada',
    description: 'Es una revista del Instituto de Estadística Teórica y Aplicada dependiente de la Carrera de Estadística de la Universidad Mayor de San Andrés, que publica artículos de investigación originales en las áreas de estadística y aplicaciones.',
    issue: 'Varianza No 26',
    link: '/revista-varianza',
    isInternal: true,
  },
  {
    title: 'International Journal of Statistics and Applications',
    subtitle: 'Scientific & Academic Publishing',
    description: 'Es una revista internacional totalmente arbitrada, que publica artículos de investigación originales y encuestas en todas las áreas de estadística y aplicaciones. Es una revista de amplia base que cubre todas las ramas de las ciencias estadísticas y sus aplicaciones.',
    issue: 'Acceso Abierto',
    link: 'http://www.sapub.org/journal/aimsandscope.aspx?journalid=1067',
    isInternal: false,
  },
  {
    title: 'Revista Electrónica de Análisis Estadístico Aplicado (EJASA)',
    subtitle: 'Open Access Research',
    description: 'Es una revista internacional OPEN ACCESS y revisada por pares, que publica artículos semestrales que aportan nuevas ideas de investigación en todas las áreas de la ciencia estadística, incluidas las aplicaciones sociales y económicas.',
    issue: 'EJASA Index',
    link: 'https://dialnet.unirioja.es/servlet/revista?codigo=15610',
    isInternal: false,
  },
  {
    title: 'Journal of Probability and Statistics',
    subtitle: 'Hindawi Publishing',
    description: 'Publica artículos sobre la teoría y aplicación de probabilidad y estadística que consideran nuevos métodos y enfoques para su implementación, o informan resultados significativos para el campo.',
    issue: 'Hindawi',
    link: 'https://www.hindawi.com/journals/jps/',
    isInternal: false,
  },
  {
    title: 'Revista Colombiana de Estadística',
    subtitle: 'Universidad Nacional de Colombia',
    description: 'La Revista Colombiana de Estadística es una publicación semestral del Departamento de Estadística de la Universidad Nacional de Colombia, orientada a difundir conocimientos, resultados, aplicaciones e historia de la estadística.',
    issue: 'Scimago Q4',
    link: 'https://revistas.unal.edu.co/index.php/estad',
    isInternal: false,
  },
]

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
  <div ref="resourcesRoot">
    <SectionHeaderBand
      :title="t('resources.title')"
      :subtitle="t('resources.subtitle')"
    />

    <main class="container view-body">
      <!-- Subnav Tabs (PDF Pages 8 & 9) -->
      <div class="tabs-bar resource-reveal">
        <TabNav v-model="activeTab" :items="tabs" label="Secciones de recursos" />
      </div>

      <Transition name="tab-panel-fade" mode="out-in">
        <div :key="activeTab" class="resource-tab-panel-wrap">
          <!-- 1. BANCO DE DATOS (PDF Page 8) -->
          <section v-if="activeTab === 'banco-de-datos'" class="resource-panel">
        <!-- Centered Header -->
        <header class="resource-centered-header">
          <h2 class="resource-centered-title">Banco de Datos</h2>
          <p class="resource-centered-lead">
            Repositorio centralizado de microdatos, conjuntos de datos (datasets). Esta herramienta facilita el desarrollo de proyectos de investigación, tesis universitarias y modelos de ciencia de datos con información veraz sobre temáticas académicas, sociales y económicas.
          </p>
        </header>

        <!-- Search & Filter Controls (PDF Page 8) -->
        <div class="resource-search-section">
          <h3 class="resource-search-title">Buscar</h3>

          <div class="resource-search-inputs">
            <!-- Keyword search -->
            <div class="search-input-col">
              <label class="search-input-label">palabras clave</label>
              <input
                v-model="query"
                type="text"
                placeholder="buscador por palabra clave"
                class="resource-text-input"
              />
            </div>

            <!-- Year dropdown -->
            <div class="search-input-col search-input-col--year">
              <label class="search-input-label">filtro por año</label>
              <select v-model="filterValues.year" class="resource-select-input">
                <option value="">SELECT Año</option>
                <option v-for="year in yearOptions" :key="year" :value="String(year)">
                  {{ year }}
                </option>
              </select>
            </div>
          </div>

          <!-- Type filter tabs/pills: [ Encuestas ] [ Censos ] -->
          <div class="resource-type-tabs" role="tablist" aria-label="Filtrar por tipo de conjunto de datos">
            <button
              type="button"
              class="resource-type-pill"
              :class="{ 'resource-type-pill--active': activeTypeFilter === 'all' }"
              @click="activeTypeFilter = 'all'"
            >
              Todos
            </button>
            <button
              type="button"
              class="resource-type-pill"
              :class="{ 'resource-type-pill--active': activeTypeFilter === 'Encuesta' }"
              @click="activeTypeFilter = 'Encuesta'"
            >
              <FileSpreadsheet :size="15" aria-hidden="true" />
              <span>Encuestas</span>
            </button>
            <button
              type="button"
              class="resource-type-pill"
              :class="{ 'resource-type-pill--active': activeTypeFilter === 'Censo' }"
              @click="activeTypeFilter = 'Censo'"
            >
              <Database :size="15" aria-hidden="true" />
              <span>Censos</span>
            </button>
          </div>
        </div>

        <!-- Loading Skeleton -->
        <div v-if="banks.loading.value && banks.items.value.length === 0" class="skeleton-grid-4col" role="status">
          <div v-for="n in 8" :key="n" class="skeleton-dataset-card"></div>
        </div>

        <!-- Error State -->
        <div v-else-if="banks.error.value && banks.items.value.length === 0" class="content-state" role="alert">
          <EmptyState
            title="No se pudo cargar el banco de datos"
            description="Ocurrió un error al consultar el repositorio."
            action-label="Reintentar"
            @action="banks.refresh"
          />
        </div>

        <!-- 4-Column Dataset Grid (PDF Page 8) -->
        <template v-else>
          <div v-if="visibleBanks.length" class="datasets-grid-4col">
            <article
              v-for="item in visibleBanks"
              :key="item.id"
              class="dataset-card"
            >
              <!-- Optional Cover Support without breaking design -->
              <div v-if="item.portada_url || item.imagen_url" class="dataset-card__cover">
                <img :src="mediaUrl(item.portada_url || item.imagen_url)" :alt="item.titulo" loading="lazy" />
              </div>

              <div class="dataset-card__body">
                <!-- Tag & Year Row -->
                <div class="dataset-card__header-row">
                  <span class="dataset-card__tag">
                    <FileSpreadsheet :size="14" aria-hidden="true" />
                    <span>{{ item.tipo_dato || 'Encuesta' }}</span>
                  </span>
                  <span class="dataset-card__year">{{ item.anio || '2014' }}</span>
                </div>

                <!-- Code / ID -->
                <p class="dataset-card__code">{{ item.codigo || 'esme14viv' }}</p>

                <!-- Title -->
                <h4 class="dataset-card__title">
                  {{ item.titulo }}
                </h4>

                <!-- Category / Location -->
                <p class="dataset-card__category">
                  {{ item.areas_tematicas?.[0]?.nombre || item.locacion || 'Vivienda' }}
                </p>

                <!-- Actions Row -->
                <div class="dataset-card__footer">
                  <a
                    v-if="item.archivo_url || item.enlace_url"
                    class="dataset-card__download-link"
                    :href="mediaUrl(item.archivo_url || item.enlace_url)"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Descargar
                  </a>
                  <RouterLink
                    v-else
                    class="dataset-card__download-link"
                    :to="`/recursos/banco-datos/${item.id}`"
                  >
                    Descargar
                  </RouterLink>

                  <span class="dataset-format-pill">
                    <span>.spss</span>
                    <span class="download-arrow">↓</span>
                  </span>
                </div>
              </div>
            </article>
          </div>

          <EmptyState
            v-else-if="!banks.loading.value && !query.trim() && !filterValues.year"
            title="No hay conjuntos de datos publicados"
            description="Los bancos de datos publicados por el IETA aparecerán en esta sección."
          />
          <EmptyState
            v-else
            title="No se encontraron coincidencias"
            description="Prueba con otros términos de búsqueda o cambia los filtros de año o tipo."
          />

          <!-- Load More Button (PDF Page 8) -->
          <div class="pagination-center">
            <LoadMoreButton
              :loading="banks.loadingMore.value"
              :has-more="banks.hasMore.value"
              label="Ver más encuestas →"
              @load="banks.loadMore"
            />
          </div>
        </template>
      </section>

      <!-- 2. REVISTAS DE ESTADÍSTICA (PDF Page 9) -->
      <section v-else class="journal-directory resource-reveal" aria-labelledby="journals-heading">
        <!-- Centered Header -->
        <header class="resource-centered-header">
          <h2 id="journals-heading" class="resource-centered-title">Revistas de Estadística</h2>
          <p class="resource-centered-lead">
            Accede a una red de revistas de estadística y ciencia de datos editadas por destacadas casas de estudio e instituciones académicas. Un recurso abierto diseñado para consultar artículos con referato, novedades teóricas y avances aplicados en diversas disciplinas.
          </p>
        </header>

        <!-- Horizontal Journal Cards List (PDF Page 9) -->
        <div class="journals-horizontal-list">
          <article
            v-for="journal in journalsList"
            :key="journal.title"
            class="journal-horizontal-card"
          >
            <!-- Left Cover Thumbnail -->
            <div class="journal-horizontal-card__cover">
              <div class="journal-cover-frame">
                <BookOpen :size="28" class="journal-cover-frame__icon" />
                <span class="journal-cover-frame__tag">{{ journal.issue }}</span>
              </div>
            </div>

            <!-- Right Body -->
            <div class="journal-horizontal-card__body">
              <h3 class="journal-horizontal-card__title">{{ journal.title }}</h3>
              <p class="journal-horizontal-card__desc">{{ journal.description }}</p>

              <div class="journal-horizontal-card__action">
                <RouterLink
                  v-if="journal.isInternal"
                  class="journal-action-btn"
                  :to="journal.link"
                >
                  <span>Consultar revista</span>
                  <ArrowRight :size="15" />
                </RouterLink>
                <a
                  v-else
                  class="journal-action-btn"
                  :href="journal.link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Consultar revista</span>
                  <ExternalLink :size="15" />
                </a>
              </div>
            </div>
          </article>
        </div>
      </section>
        </div>
      </Transition>
    </main>
  </div>
</template>

<style scoped>
.view-body {
  min-height: 48vh;
  padding-block: var(--space-4) var(--space-8);
}

.tabs-bar {
  margin-bottom: var(--space-6);
}

.resource-tab-panel-wrap {
  width: 100%;
}

/* Tab Panel Fade Transition */
.tab-panel-fade-enter-active,
.tab-panel-fade-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.tab-panel-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.tab-panel-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (prefers-reduced-motion: reduce) {
  .tab-panel-fade-enter-active,
  .tab-panel-fade-leave-active {
    transition: none;
  }
}

/* Centered Header (PDF Pages 8 & 9) */
.resource-centered-header {
  max-width: 860px;
  margin-inline: auto;
  text-align: center;
  margin-bottom: 2.5rem;
}

.resource-centered-title {
  color: #1b144b;
  font-size: clamp(2rem, 3.5vw, 2.6rem);
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1rem;
}

.resource-centered-lead {
  color: #4b5268;
  font-size: 1.02rem;
  line-height: 1.75;
}

/* Search Controls (PDF Page 8) */
.resource-search-section {
  margin-bottom: 2.25rem;
}

.resource-search-title {
  color: #1b144b;
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 1.25rem;
}

.resource-search-inputs {
  display: grid;
  grid-template-columns: 1fr 220px;
  gap: 1.25rem;
  margin-bottom: 1.25rem;
}

.search-input-col {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.search-input-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #1b144b;
}

.resource-text-input {
  width: 100%;
  height: 2.85rem;
  padding: 0.5rem 1rem;
  border: 1px solid rgba(220, 224, 235, 0.95);
  border-radius: var(--radius-sm);
  background: var(--color-blanco);
  font: inherit;
  font-size: 0.92rem;
  color: #1b144b;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.resource-text-input:focus {
  outline: none;
  border-color: #35449f;
  box-shadow: 0 0 0 3px rgba(53, 68, 159, 0.12);
}

.resource-select-input {
  width: 100%;
  height: 2.85rem;
  padding: 0.5rem 1rem;
  border: 1px solid rgba(220, 224, 235, 0.95);
  border-radius: var(--radius-sm);
  background: var(--color-blanco);
  font: inherit;
  font-size: 0.88rem;
  color: #555c73;
  cursor: pointer;
}

/* Type Filter Tabs / Pills: [ Encuestas ] [ Censos ] (PDF Page 8) */
.resource-type-tabs {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.resource-type-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 1.15rem;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(220, 224, 235, 0.95);
  background: var(--color-blanco);
  color: #2b3044;
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.resource-type-pill:hover {
  background: #f8f9fe;
  border-color: #35449f;
}

.resource-type-pill--active {
  background: #2b1b6d;
  color: #fff;
  border-color: #2b1b6d;
}

.resource-type-pill--active:hover {
  background: #1b144b;
  color: #fff;
}

/* 4-Column Dataset Grid (PDF Page 8) */
.datasets-grid-4col {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: clamp(1rem, 1.8vw, 1.5rem);
}

.dataset-card {
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(220, 224, 235, 0.85);
  border-radius: var(--radius-md);
  background: var(--color-blanco);
  box-shadow: 0 4px 18px rgba(27, 20, 75, 0.04);
  overflow: hidden;
  transition: transform 0.22s ease, box-shadow 0.22s ease;
}

.dataset-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px -4px rgba(27, 20, 75, 0.08);
}

.dataset-card__cover {
  height: 8.5rem;
  overflow: hidden;
  background: #f0f3fa;
}

.dataset-card__cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dataset-card__body {
  padding: 1.25rem 1.35rem;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 0.35rem;
}

.dataset-card__header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.82rem;
  color: #1b144b;
}

.dataset-card__tag {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: 700;
}

.dataset-card__year {
  color: #8c93a8;
  font-weight: 600;
}

.dataset-card__code {
  color: #8c93a8;
  font-size: 0.78rem;
  font-family: monospace;
  margin-top: 0.25rem;
}

.dataset-card__title {
  color: #2b1b6d;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.35;
  margin-block: 0.2rem 0.4rem;
}

.dataset-card__category {
  color: #555c73;
  font-size: 0.88rem;
}

.dataset-card__footer {
  margin-top: auto;
  padding-top: 1.15rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dataset-card__download-link {
  color: #1b144b;
  font-size: 0.88rem;
  font-weight: 700;
  text-decoration: none;
  transition: color 0.15s ease;
}

.dataset-card__download-link:hover {
  color: var(--color-rosa-carmin);
}

.dataset-format-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.55rem;
  border-radius: var(--radius-sm);
  background: #f0f3fa;
  color: #2b1b6d;
  font-size: 0.75rem;
  font-weight: 700;
}

.download-arrow {
  font-size: 0.85rem;
}

.pagination-center {
  display: flex;
  justify-content: center;
  margin-top: var(--space-6);
}

/* Horizontal Journal Cards List (PDF Page 9) */
.journals-horizontal-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 960px;
  margin-inline: auto;
}

.journal-horizontal-card {
  display: flex;
  align-items: stretch;
  gap: 1.75rem;
  padding: 1.5rem 1.75rem;
  border: 1px solid rgba(220, 224, 235, 0.85);
  border-radius: var(--radius-md);
  background: var(--color-blanco);
  box-shadow: 0 4px 18px rgba(27, 20, 75, 0.04);
  transition: transform 0.22s ease, box-shadow 0.22s ease;
}

.journal-horizontal-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 24px -4px rgba(27, 20, 75, 0.08);
}

.journal-horizontal-card__cover {
  width: 7.5rem;
  min-height: 9.5rem;
  flex-shrink: 0;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: linear-gradient(135deg, #1b144b 0%, #35449f 100%);
}

.journal-cover-frame {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #fff;
  padding: 1rem 0.5rem;
  text-align: center;
}

.journal-cover-frame__icon {
  opacity: 0.9;
}

.journal-cover-frame__tag {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  opacity: 0.85;
}

.journal-horizontal-card__body {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 0.65rem;
}

.journal-horizontal-card__title {
  color: #1b144b;
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.3;
}

.journal-horizontal-card__desc {
  color: #4b5268;
  font-size: 0.95rem;
  line-height: 1.65;
}

.journal-horizontal-card__action {
  margin-top: auto;
  padding-top: 0.5rem;
}

.journal-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: #35449f;
  font-size: 0.92rem;
  font-weight: 700;
  text-decoration: none;
  transition: color 0.15s ease, gap 0.15s ease;
}

.journal-action-btn:hover {
  color: var(--color-rosa-carmin);
  gap: 0.65rem;
}

/* Skeletons */
.skeleton-grid-4col {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1.25rem;
}

.skeleton-dataset-card {
  height: 14rem;
  border-radius: var(--radius-md);
  background: #edeef5;
}

.content-state {
  display: grid;
  min-height: 20rem;
  align-content: center;
  text-align: center;
}

/* Responsive */
@media (max-width: 1100px) {
  .datasets-grid-4col,
  .skeleton-grid-4col {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 850px) {
  .datasets-grid-4col,
  .skeleton-grid-4col {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .resource-search-inputs {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 620px) {
  .datasets-grid-4col,
  .skeleton-grid-4col {
    grid-template-columns: 1fr;
  }

  .journal-horizontal-card {
    flex-direction: column;
  }

  .journal-horizontal-card__cover {
    width: 100%;
    height: 6rem;
    min-height: auto;
  }
}
</style>
