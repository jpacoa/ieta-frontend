<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import ContentCard from '@/components/common/ContentCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { LayoutGrid, List } from '@lucide/vue'
import LoadMoreButton from '@/components/common/LoadMoreButton.vue'
import SearchFilterBar from '@/components/common/SearchFilterBar.vue'
import EditorJsContent from '@/components/common/EditorJsContent.vue'
import EditorialMemberCard from '@/components/varianza/EditorialMemberCard.vue'
import EditorialStatement from '@/components/varianza/EditorialStatement.vue'
import AuthorProfileCard from '@/components/varianza/AuthorProfileCard.vue'
import IssueFeature from '@/components/varianza/IssueFeature.vue'
import MagazineIssueRow from '@/components/varianza/MagazineIssueRow.vue'
import VarianzaHero from '@/components/varianza/VarianzaHero.vue'
import VarianzaSectionNav from '@/components/varianza/VarianzaSectionNav.vue'
import { authorName } from '@/api/normalizers'
import { formatApiDate } from '@/api/normalizers'
import { mediaUrl } from '@/api/response'
import {
  AutoresRepository,
  ComiteEditorialRepository,
  EdicionesVarianzaRepository,
  InstruccionesAutoresRepository,
  RevistaVarianzaRepository,
} from '@/api/repositories.js'
import type {
  AuthorApiItem,
  AuthorGuidelineApiItem,
  EditorialMemberApiItem,
  VarianzaIssueApiItem,
  VarianzaProfileApiItem,
} from '@/api/types'
import { unwrapResource } from '@/api/response'
import { usePaginatedResource } from '@/composables/usePaginatedResource'

const route = useRoute()
const authorQuery = ref('')
const authorFilters = ref<Record<string, string>>({ specialty: '' })
const authorViewMode = ref<'gallery' | 'list'>('gallery')
const authorsResource = usePaginatedResource<AuthorApiItem>((page) => AutoresRepository.list({ page }))
const committeeResource = usePaginatedResource<EditorialMemberApiItem>((page) =>
  ComiteEditorialRepository.list({ page }),
)
const issuesResource = usePaginatedResource<VarianzaIssueApiItem>((page) => EdicionesVarianzaRepository.list({ page }))
const guidelinesResource = usePaginatedResource<AuthorGuidelineApiItem>((page) => InstruccionesAutoresRepository.list({ page }))
const varianzaProfile = ref<VarianzaProfileApiItem | null>(null)
const latestIssue = ref<VarianzaIssueApiItem | null>(null)
const profileLoading = ref(true)
const profileError = ref(false)
const latestIssueLoading = ref(true)
const latestIssueError = ref(false)
const editorialEmail = computed(() => varianzaProfile.value?.correo_contacto || '')
const latestIssueCover = computed(() => mediaUrl(latestIssue.value?.portada_url))
const apiBaseUrl = import.meta.env.VITE_API_URL
const activeGuidelines = computed(() => guidelinesResource.items.value
  .filter((item) => item.activo !== false)
  .sort((first, second) => (first.orden ?? 0) - (second.orden ?? 0)))

function guidelineAnchor(item: AuthorGuidelineApiItem) {
  return `instruccion-${item.id}`
}

const sectionItems = [
  { value: 'sobre', label: 'Sobre la revista', to: '/revista-varianza' },
  { value: 'comite-editor', label: 'Comité Editor', to: '/revista-varianza/comite-editor' },
  { value: 'autores', label: 'Autores Varianza', to: '/revista-varianza/autores' },
  { value: 'ediciones', label: 'Todas las Ediciones', to: '/revista-varianza/ediciones' },
  { value: 'articulos', label: 'Artículos', to: '/revista-varianza/articulos' },
  {
    value: 'instrucciones-autores',
    label: 'Instrucciones para autores',
    to: '/revista-varianza/instrucciones-autores',
  },
]

const activeSection = computed(() => {
  const tab = String(route.params.tab ?? '')
  if (!tab) return 'sobre'
  return sectionItems.find((item) => item.value === tab)?.value ?? 'sobre'
})

const authorFiltersConfig = computed(() => {
  const specialties = [...new Set(authorsResource.items.value
    .map((author) => author.especialidad?.nombre)
    .filter((specialty): specialty is string => Boolean(specialty)))]
  return [{
    key: 'specialty',
    label: 'Especialidad',
    options: specialties.map((specialty) => ({ value: specialty, label: specialty })),
  }]
})

const authorResults = computed(() => {
  const query = authorQuery.value.trim().toLocaleLowerCase()
  const specialty = authorFilters.value.specialty
  return authorsResource.items.value.filter((author) => {
    const matchesQuery = !query || `${authorName(author)} ${author.intereses_cientificos ?? ''}`.toLocaleLowerCase().includes(query)
    const matchesSpecialty = !specialty || author.especialidad?.nombre === specialty
    return matchesQuery && matchesSpecialty
  })
})

const alphabeticalAuthors = computed(() =>
  [...authorResults.value].sort((first, second) => authorName(first).localeCompare(authorName(second), 'es')),
)
const displayedAuthors = computed(() =>
  authorViewMode.value === 'list' ? alphabeticalAuthors.value : authorResults.value,
)

function authorPath(author: AuthorApiItem) {
  return `/revista-varianza/autores/${encodeURIComponent(author.slug || String(author.id))}`
}

function clearAuthorFilters() {
  authorQuery.value = ''
  authorFilters.value = { specialty: '' }
}

const committeeGroups = computed(() => {
  const groups = new Map<string, EditorialMemberApiItem[]>()
  for (const member of committeeResource.items.value) {
    const groupName = member.tipo?.trim() || 'Comité Editorial'
    groups.set(groupName, [...(groups.get(groupName) ?? []), member])
  }
  return [...groups.entries()].map(([title, members]) => ({ title, members }))
})

function memberName(member: EditorialMemberApiItem) {
  return member.persona?.nombre_completo?.trim() ||
    [member.persona?.p_nombre, member.persona?.p_apellido_paterno, member.persona?.p_apellido_materno]
      .filter(Boolean)
      .join(' ') ||
    'Integrante del comité'
}

function memberInstitution(member: EditorialMemberApiItem) {
  return [member.institucion?.nombre, member.institucion?.ciudad, member.institucion?.pais]
    .filter(Boolean)
    .join(' · ')
}

watch(activeSection, (section) => {
  if (section === 'autores' && authorsResource.page.value === 0) void authorsResource.refresh()
  if (section === 'comite-editor' && committeeResource.page.value === 0) {
    void committeeResource.refresh()
  }
  if (section === 'ediciones' && issuesResource.page.value === 0) void issuesResource.refresh()
  if (section === 'instrucciones-autores' && guidelinesResource.page.value === 0) void guidelinesResource.refresh()
}, { immediate: true })

async function loadEditorialProfile() {
  profileLoading.value = true
  profileError.value = false
  try {
    varianzaProfile.value = unwrapResource<VarianzaProfileApiItem>(await RevistaVarianzaRepository.get())
  } catch {
    profileError.value = true
  } finally {
    profileLoading.value = false
  }
}

async function loadLatestIssue() {
  latestIssueLoading.value = true
  latestIssueError.value = false
  try {
    latestIssue.value = unwrapResource<VarianzaIssueApiItem>(await EdicionesVarianzaRepository.getLatest())
  } catch {
    latestIssueError.value = true
  } finally {
    latestIssueLoading.value = false
  }
}

onMounted(() => {
  void loadEditorialProfile()
  void loadLatestIssue()
})
</script>

<template>
  <main class="varianza-view">
    <VarianzaHero
      :title="varianzaProfile?.titulo || 'Varianza'"
      :subtitle="varianzaProfile?.subtitulo || 'Revista Científica del IETA'"
      :breadcrumb-label="sectionItems.find((item) => item.value === activeSection)?.label"
    />
    <VarianzaSectionNav :active="activeSection" :items="sectionItems" />

    <template v-if="activeSection === 'sobre'">
      <section class="varianza-about">
        <div class="container varianza-about__inner">
          <div class="varianza-about__copy">
            <p class="varianza-about__eyebrow">{{ varianzaProfile?.subtitulo || 'Publicación científica del IETA' }}</p>
            <h2>{{ varianzaProfile?.titulo || 'Sobre la revista' }}</h2>
            <p v-if="profileLoading" class="varianza-resource-state" role="status">Cargando perfil editorial…</p>
            <p v-else-if="profileError" class="varianza-resource-state" role="alert">No se pudo cargar el perfil editorial.</p>
            <EditorJsContent v-else-if="varianzaProfile?.contenido" :content="varianzaProfile.contenido" :api-base-url="apiBaseUrl" />
            <p v-else>No hay presentación editorial disponible.</p>
            <dl class="varianza-about__issn">
              <div v-if="varianzaProfile?.issn_impreso">
                <dt>ISSN versión impresa</dt>
                <dd>{{ varianzaProfile.issn_impreso }}</dd>
              </div>
              <div v-if="varianzaProfile?.issn_electronico">
                <dt>ISSN versión en línea</dt>
                <dd>{{ varianzaProfile.issn_electronico }}</dd>
              </div>
              <div v-if="varianzaProfile?.periodicidad"><dt>Periodicidad</dt><dd>{{ varianzaProfile.periodicidad }}</dd></div>
            </dl>
            <a v-if="editorialEmail" :href="`mailto:${editorialEmail}`">
              {{ editorialEmail }}
            </a>
            <a href="https://ieta.umsa.bo/" target="_blank" rel="noreferrer">
              Sitio del IETA <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div v-if="latestIssueLoading" class="varianza-resource-state" role="status">Cargando última edición…</div>
          <div v-else-if="latestIssueError" class="varianza-resource-state" role="alert">
            <p>No se pudo cargar la última edición.</p>
            <button type="button" class="retry-button" @click="loadLatestIssue">Reintentar</button>
          </div>
          <IssueFeature
            v-else-if="latestIssue"
            :title="latestIssue.titulo"
            :issue="[latestIssue.numero, latestIssue.volumen, latestIssue.anio].filter(Boolean).join(' · ')"
            :cover="latestIssueCover"
            :cover-alt="`Portada de ${latestIssue.titulo}`"
            :to="`/revista-varianza/ediciones/${encodeURIComponent(latestIssue.slug || String(latestIssue.id))}`"
          />
        </div>
      </section>

      <EditorialStatement title="Misión" v-if="varianzaProfile?.mision">
        <p>{{ varianzaProfile.mision }}</p>
      </EditorialStatement>
      <EditorialStatement title="Visión" v-if="varianzaProfile?.vision">
        <p>{{ varianzaProfile.vision }}</p>
      </EditorialStatement>
      <EditorialStatement title="Alcance" v-if="varianzaProfile?.alcance">
        <EditorJsContent :content="varianzaProfile.alcance" :api-base-url="apiBaseUrl" />
      </EditorialStatement>
      <EditorialStatement title="Políticas editoriales" v-if="varianzaProfile?.politicas">
        <EditorJsContent :content="varianzaProfile.politicas" :api-base-url="apiBaseUrl" />
      </EditorialStatement>
    </template>

    <template v-else-if="activeSection === 'comite-editor'">
      <EditorialStatement title="Comité Editor">
        <p>El equipo académico es responsable de la gestión editorial, la revisión por pares y la excelencia científica de la Revista Varianza del IETA.</p>
      </EditorialStatement>
      <section class="varianza-directory" aria-labelledby="varianza-committee-heading">
        <div class="container">
          <h2 id="varianza-committee-heading" class="varianza-directory__heading">Integrantes</h2>
          <p v-if="committeeResource.loading.value" class="varianza-resource-state" role="status">Cargando comité editorial…</p>
          <div v-else-if="committeeResource.error.value" class="varianza-resource-state" role="alert">
            <p>No se pudo cargar el comité editorial.</p>
            <button type="button" class="retry-button" @click="committeeResource.refresh">Reintentar</button>
          </div>
          <template v-else-if="committeeGroups.length">
            <section
              v-for="(group, index) in committeeGroups"
              :key="group.title"
              class="varianza-directory__group"
              :class="{ 'varianza-directory--soft': index % 2 === 1 }"
            >
              <h3 class="varianza-directory__heading">{{ group.title }}</h3>
              <div class="varianza-directory__grid">
                <EditorialMemberCard
                  v-for="member in group.members"
                  :key="member.id"
                  :name="memberName(member)"
                  :role="member.cargo?.nombre || member.tipo || 'Comité Editorial'"
                  :institution="memberInstitution(member)"
                  :email="member.persona?.p_correo || undefined"
                />
              </div>
            </section>
            <LoadMoreButton
              :loading="committeeResource.loadingMore.value"
              :has-more="committeeResource.hasMore.value"
              @load="committeeResource.loadMore"
            />
          </template>
          <EmptyState v-else title="No hay integrantes publicados" description="La información del comité aparecerá aquí cuando esté disponible en el sistema editorial." />
        </div>
      </section>
    </template>

    <template v-else-if="activeSection === 'autores'">
      <section class="varianza-listing">
        <div class="container">
          <header class="varianza-authors-intro">
            <div>
              <p>Comunidad científica</p>
              <h2>Autores Varianza</h2>
            </div>
            <p>
              Espacio dedicado a investigadores, docentes y profesionales que contribuyen al
              desarrollo de la ciencia de datos y la estadística aplicada.
            </p>
          </header>
          <SearchFilterBar
            v-model="authorQuery"
            v-model:filter-values="authorFilters"
            :filters="authorFiltersConfig"
            @clear="clearAuthorFilters"
          />
          <div class="author-view-switch" role="group" aria-label="Vista del directorio de autores">
            <button
              type="button"
              :aria-pressed="authorViewMode === 'gallery'"
              :class="{ 'author-view-switch__button--active': authorViewMode === 'gallery' }"
              @click="authorViewMode = 'gallery'"
            >
              <LayoutGrid :size="17" aria-hidden="true" />
              <span>Fotos</span>
            </button>
            <button
              type="button"
              :aria-pressed="authorViewMode === 'list'"
              :class="{ 'author-view-switch__button--active': authorViewMode === 'list' }"
              @click="authorViewMode = 'list'"
            >
              <List :size="17" aria-hidden="true" />
              <span>Listado</span>
            </button>
          </div>
          <p v-if="authorsResource.loading.value" class="varianza-resource-state" role="status">Cargando autores…</p>
          <div v-else-if="authorsResource.error.value && authorsResource.items.value.length === 0" class="varianza-resource-state" role="alert">
            <p>No se pudo cargar el directorio de autores.</p>
            <button type="button" class="retry-button" @click="authorsResource.refresh">Reintentar</button>
          </div>
          <div v-else-if="displayedAuthors.length" :class="authorViewMode === 'gallery' ? 'varianza-authors-grid' : 'varianza-authors-list'">
            <AuthorProfileCard
              v-for="author in displayedAuthors"
              :key="author.id"
              :name="authorName(author)"
              :image="mediaUrl(author.persona?.foto_url)"
              :specialty="author.especialidad?.nombre || undefined"
              :to="authorPath(author)"
              :compact="authorViewMode === 'list'"
            />
          </div>
          <EmptyState
            v-else-if="!authorsResource.loading.value && authorsResource.items.value.length === 0"
            title="No hay autores publicados"
            description="El directorio de autores aparecerá aquí cuando tenga registros."
          />
          <EmptyState
            v-else-if="authorResults.length === 0 && !authorQuery.trim()"
            title="No hay autores para mostrar"
            description="Prueba con otra especialidad o limpia los filtros."
            action-label="Limpiar filtros"
            @action="clearAuthorFilters"
          />
          <LoadMoreButton
            :loading="authorsResource.loadingMore.value"
            :has-more="authorsResource.hasMore.value"
            @load="authorsResource.loadMore"
          />
        </div>
      </section>
    </template>

    <template v-else-if="activeSection === 'ediciones'">
      <section v-if="latestIssue" class="varianza-current-issue">
        <div class="container varianza-current-issue__inner">
          <div>
            <p>{{ [latestIssue.mes, latestIssue.anio].filter(Boolean).join(' · ') }}</p>
            <h2>{{ latestIssue.titulo }}</h2>
            <p v-if="latestIssue.editorial">{{ latestIssue.editorial }}</p>
            <dl>
              <div v-if="latestIssue.articulos_originales_count ?? latestIssue.num_art_originales_declarado">
                <dt>Artículos originales</dt><dd>{{ latestIssue.articulos_originales_count ?? latestIssue.num_art_originales_declarado }}</dd>
              </div>
              <div v-if="latestIssue.notas_cientificas_count ?? latestIssue.notas_cientificas_declarado">
                <dt>Notas científicas</dt><dd>{{ latestIssue.notas_cientificas_count ?? latestIssue.notas_cientificas_declarado }}</dd>
              </div>
              <div v-if="latestIssue.num_paginas"><dt>Páginas</dt><dd>{{ latestIssue.num_paginas }}</dd></div>
              <div v-if="latestIssue.doi"><dt>DOI</dt><dd>{{ latestIssue.doi }}</dd></div>
              <div v-if="latestIssue.issn_impresa"><dt>ISSN impreso</dt><dd>{{ latestIssue.issn_impresa }}</dd></div>
              <div v-if="latestIssue.issn_electronica"><dt>ISSN electrónico</dt><dd>{{ latestIssue.issn_electronica }}</dd></div>
            </dl>
            <RouterLink
              :to="`/revista-varianza/ediciones/${encodeURIComponent(latestIssue.slug || String(latestIssue.id))}`"
              class="varianza-current-issue__action"
            >Ver edición <span aria-hidden="true">↗</span></RouterLink>
            <a v-if="mediaUrl(latestIssue.archivo_url)" :href="mediaUrl(latestIssue.archivo_url)" class="varianza-current-issue__action" target="_blank" rel="noreferrer">Descargar número</a>
          </div>
          <img v-if="latestIssueCover" :src="latestIssueCover" :alt="`Portada de ${latestIssue.titulo}`" width="260" height="350" />
          <span v-else class="varianza-current-issue__cover-placeholder" aria-hidden="true">VARIANZA<br />N° {{ latestIssue.numero }}</span>
        </div>
      </section>
      <section class="varianza-issues">
        <div class="container">
          <header class="varianza-listing__heading">
            <p>Archivo editorial</p>
            <h2>Todas las ediciones</h2>
          </header>
          <p v-if="issuesResource.loading.value && issuesResource.items.value.length === 0" class="varianza-resource-state" role="status">Cargando ediciones…</p>
          <div v-else-if="issuesResource.error.value && issuesResource.items.value.length === 0" class="varianza-resource-state" role="alert">
            <p>No se pudieron cargar las ediciones.</p>
            <button type="button" class="retry-button" @click="issuesResource.refresh">Reintentar</button>
          </div>
          <div v-else-if="issuesResource.items.value.length" class="varianza-issues__list">
            <MagazineIssueRow
              v-for="issue in issuesResource.items.value"
              :key="issue.id"
              :number="issue.numero"
              :date="[issue.mes, issue.anio].filter(Boolean).join(' · ')"
              :title="issue.titulo"
              :cover="mediaUrl(issue.portada_url)"
              :cover-alt="`Portada de ${issue.titulo}`"
              :to="`/revista-varianza/ediciones/${encodeURIComponent(issue.slug || String(issue.id))}`"
              :article-count="Number(issue.articulos_count ?? issue.articulos_originales_count ?? issue.num_art_originales_declarado ?? 0)"
              :pages="issue.num_paginas ?? undefined"
            />
          </div>
          <EmptyState v-else-if="!issuesResource.loading.value" title="No hay ediciones publicadas" />
          <LoadMoreButton
            :loading="issuesResource.loadingMore.value"
            :has-more="issuesResource.hasMore.value"
            @load="issuesResource.loadMore"
          />
          <section v-if="latestIssue?.articulos?.length" class="varianza-article-directory" aria-labelledby="varianza-articles-heading">
            <header class="varianza-listing__heading"><p>Publicaciones de la edición actual</p><h2 id="varianza-articles-heading">Artículos publicados</h2></header>
            <div class="varianza-article-directory__grid">
              <ContentCard v-for="article in latestIssue.articulos" :key="article.id" type="edicion" :title="article.titulo" :eyebrow="article.tipo_articulo?.nombre || article.doi || 'Artículo de investigación'" :summary="article.resumen || article.abstracto || undefined" :date="formatApiDate(article.fecha_aceptado || article.fecha_recepcion)" :author="article.autores?.map(authorName).join(', ')" :image="mediaUrl(article.portada_url || latestIssue.portada_url)" :image-alt="article.titulo" :to="`/revista-varianza/articulos/${article.id}`" />
            </div>
          </section>
        </div>
      </section>
    </template>

    <template v-else>
      <section class="varianza-guidelines">
        <div class="container">
          <header class="varianza-listing__heading">
            <p>Publicar en Varianza</p>
            <h2>Instrucciones para autores</h2>
          </header>
          <p v-if="guidelinesResource.loading.value && guidelinesResource.items.value.length === 0" class="varianza-resource-state" role="status">Cargando instrucciones…</p>
          <div v-else-if="guidelinesResource.error.value && guidelinesResource.items.value.length === 0" class="varianza-resource-state" role="alert">
            <p>No se pudieron cargar las instrucciones para autores.</p>
            <button type="button" class="retry-button" @click="guidelinesResource.refresh">Reintentar</button>
          </div>
          <EmptyState v-else-if="activeGuidelines.length === 0" title="No hay directrices publicadas" description="Las instrucciones editoriales aparecerán aquí cuando estén disponibles." />
          <div v-else class="varianza-guidelines__layout">
            <nav class="varianza-guidelines__index" aria-label="Índice de instrucciones">
              <h3>Índice</h3>
              <a v-for="item in activeGuidelines" :key="item.id" :href="`#${guidelineAnchor(item)}`">{{ item.titulo_seccion }}</a>
            </nav>
            <div class="varianza-guidelines__content">
              <section
                v-for="item in activeGuidelines"
                :id="guidelineAnchor(item)"
                :key="item.id"
              >
                <h3>{{ item.titulo_seccion }}</h3>
                <EditorJsContent :content="item.contenido" :api-base-url="apiBaseUrl" />
              </section>
              <a v-if="editorialEmail" class="varianza-guidelines__external" :href="`mailto:${editorialEmail}`">Contactar a la revista <span aria-hidden="true">↗</span></a>
              <LoadMoreButton :loading="guidelinesResource.loadingMore.value" :has-more="guidelinesResource.hasMore.value" @load="guidelinesResource.loadMore" />
            </div>
          </div>
        </div>
      </section>
    </template>
  </main>
</template>

<style scoped>
.varianza-view {
  --varianza-navy: #202e71;
  --varianza-pink: #f50088;
  overflow: clip;
  background: #f5f5f8;
}

.varianza-about {
  background: var(--varianza-navy);
  color: #f6f7fb;
}

.varianza-about__inner {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(20rem, 0.9fr);
  align-items: center;
  gap: clamp(var(--space-4), 8vw, var(--space-8));
  padding-block: clamp(var(--space-5), 7vw, var(--space-8));
}

.varianza-about__copy {
  max-width: 38rem;
}

.varianza-about__eyebrow,
.varianza-listing__heading > p {
  margin-bottom: var(--space-1);
  color: var(--varianza-pink);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.varianza-about__copy h2 {
  margin-bottom: var(--space-2);
  color: var(--varianza-pink);
  font-size: clamp(1.75rem, 3.4vw, 2.5rem);
  font-weight: 500;
  line-height: 1.15;
}

.varianza-about__copy > p:not(.varianza-about__eyebrow) {
  max-width: 52ch;
  line-height: 1.65;
}

.varianza-about__issn {
  display: grid;
  gap: 0.3rem;
  margin-block: var(--space-2);
}

.varianza-about__issn div {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.varianza-about__issn dt {
  font-weight: 700;
}

.varianza-about__copy > a {
  display: block;
  width: fit-content;
  color: #f50088;
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

.varianza-about__copy > a + a {
  margin-top: 0.2rem;
}

.varianza-directory,
.varianza-issues,
.varianza-listing,
.varianza-guidelines {
  padding-block: var(--space-4);
}

.varianza-directory--soft {
  border-block: 1px solid #aab3d0;
  background: #eeeff5;
}

.varianza-directory__heading {
  margin-bottom: var(--space-2);
  color: var(--varianza-navy);
  font-size: 1.5rem;
  font-weight: 500;
}

.varianza-directory__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
}

.varianza-directory__group + .varianza-directory__group {
  margin-top: var(--space-4);
}

.varianza-resource-state {
  display: grid;
  min-height: 12rem;
  align-content: center;
  justify-items: center;
  gap: var(--space-2);
  text-align: center;
}

.retry-button {
  min-height: 2.75rem;
  padding: var(--space-1) var(--space-2);
  border: 1px solid var(--varianza-navy);
  border-radius: var(--radius-sm);
  background: var(--varianza-navy);
  color: #fff;
  font: inherit;
  cursor: pointer;
}

.varianza-listing__heading {
  margin-bottom: var(--space-3);
}

.varianza-listing__heading h2 {
  color: var(--varianza-pink);
  font-size: clamp(1.75rem, 3.4vw, 2.5rem);
  font-weight: 500;
}

.varianza-authors-intro {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(18rem, 1fr);
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.varianza-authors-intro > div > p {
  margin-bottom: var(--space-1);
  color: var(--varianza-pink);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.varianza-authors-intro h2 {
  color: var(--varianza-pink);
  font-size: clamp(1.75rem, 3.4vw, 2.5rem);
  font-weight: 500;
}

.varianza-authors-intro > p {
  line-height: 1.6;
}

.varianza-authors-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: var(--space-1);
  margin-top: var(--space-3);
}

.author-view-switch {
  display: inline-grid;
  grid-template-columns: repeat(2, auto);
  gap: 2px;
  margin-top: var(--space-2);
  padding: 3px;
  border: 1px solid #c9cddd;
  border-radius: var(--radius-sm);
  background: #fff;
}

.author-view-switch button {
  display: inline-flex;
  min-height: 2.5rem;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding-inline: 0.75rem;
  border: 0;
  border-radius: 3px;
  background: transparent;
  color: #202e71;
  font: inherit;
  font-size: 0.8125rem;
  cursor: pointer;
}

.author-view-switch button[aria-pressed='true'] {
  background: #202e71;
  color: #fff;
}

.author-view-switch button:focus-visible {
  outline: 2px solid #f50088;
  outline-offset: 2px;
}

.varianza-authors-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.4rem var(--space-2);
  margin-top: var(--space-2);
}

.varianza-authors-directory {
  margin-top: var(--space-4);
  padding: var(--space-2);
  border-top: 1px solid #aab3d0;
}

.varianza-authors-directory h3 {
  margin-bottom: var(--space-1);
  color: var(--varianza-navy);
  font-size: 1.25rem;
  font-weight: 500;
}

.varianza-authors-directory ul {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.25rem var(--space-2);
  padding: 0;
  list-style: none;
}

.varianza-authors-directory a {
  display: block;
  padding: 0.3rem 0.5rem;
  border-left: 3px solid #202e71;
  background: #fff;
  color: #202e71;
  font-size: 0.8125rem;
  overflow-wrap: anywhere;
}

.varianza-authors-directory li:first-child a {
  border-color: var(--varianza-pink);
  color: var(--varianza-pink);
}

.varianza-authors-directory a:hover {
  background: #f8e7f0;
}

.varianza-current-issue {
  background: var(--varianza-navy);
  color: #f6f7fb;
}

.varianza-current-issue__inner {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 16rem;
  align-items: center;
  gap: var(--space-4);
  padding-block: var(--space-4);
}

.varianza-current-issue__inner > div > p {
  color: #f5c5dd;
}

.varianza-current-issue h2 {
  margin-bottom: var(--space-2);
  color: #fff;
  font-size: clamp(1.75rem, 3.5vw, 2.5rem);
}

.varianza-current-issue dl {
  display: grid;
  gap: 0.45rem;
  margin-bottom: var(--space-2);
}

.varianza-current-issue dl div {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.varianza-current-issue dt {
  font-weight: 700;
}

.varianza-current-issue__inner > img {
  width: 100%;
  max-height: 24rem;
  object-fit: contain;
}

.varianza-current-issue__action,
.varianza-guidelines__external {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  gap: 0.5rem;
  padding-inline: var(--space-2);
  border-radius: var(--radius-sm);
  background: var(--varianza-pink);
  color: #fff;
  font-weight: 700;
}

.varianza-current-issue__action:hover,
.varianza-guidelines__external:hover {
  background: #d9006f;
  color: #fff;
}

.varianza-issues {
  background: #f5f5f8;
}

.varianza-issues__list {
  display: grid;
  max-width: 64rem;
  gap: 0.6rem;
  margin-inline: auto;
}

.varianza-article-directory {
  margin-top: var(--space-6);
  padding-top: var(--space-4);
  border-top: 1px solid #aab3d0;
}

.varianza-article-directory__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-2);
}

.varianza-guidelines__layout {
  display: grid;
  grid-template-columns: minmax(12rem, 0.42fr) minmax(0, 1fr);
  gap: var(--space-4);
  align-items: start;
}

.varianza-guidelines__index {
  position: sticky;
  top: calc(var(--header-height) + var(--space-2));
  display: grid;
  gap: 0.3rem;
  padding: var(--space-2);
  background: #fff;
}

.varianza-guidelines__index h3 {
  margin-bottom: var(--space-1);
  color: var(--varianza-navy);
  font-size: 1.25rem;
}

.varianza-guidelines__index a {
  padding: 0.35rem 0.5rem;
  color: #20212a;
  font-size: 0.875rem;
}

.varianza-guidelines__index a:hover {
  background: #f6d8e8;
  color: #202e71;
}

.varianza-guidelines__content {
  display: grid;
  gap: var(--space-2);
  padding-top: var(--space-1);
}

.varianza-guidelines__content > section {
  scroll-margin-top: calc(var(--header-height) + var(--space-3));
}

.varianza-guidelines__content h3 {
  margin-bottom: 0.25rem;
  color: var(--varianza-navy);
  font-size: 1.25rem;
}

.varianza-guidelines__content h4 {
  margin-top: var(--space-1);
  font-size: 1rem;
}

.varianza-guidelines__content p {
  max-width: 74ch;
  font-size: 0.9375rem;
  line-height: 1.55;
}

.varianza-guidelines__external {
  justify-self: start;
  margin-top: var(--space-1);
}

@media (max-width: 760px) {
  .varianza-about__inner {
    grid-template-columns: 1fr;
  }

  .varianza-about__inner :deep(.issue-feature) {
    max-width: 35rem;
  }

  .varianza-guidelines__layout {
    grid-template-columns: 1fr;
  }

  .varianza-authors-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .varianza-authors-list {
    grid-template-columns: 1fr;
  }

  .varianza-guidelines__index {
    position: static;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .varianza-guidelines__index h3 {
    grid-column: 1 / -1;
  }
}

@media (max-width: 560px) {
  .varianza-directory__grid {
    grid-template-columns: 1fr;
  }

  .varianza-article-directory__grid {
    grid-template-columns: 1fr;
  }

  .varianza-current-issue__inner {
    grid-template-columns: 1fr;
  }

  .varianza-current-issue__inner > img {
    width: min(100%, 16rem);
    justify-self: center;
  }

  .varianza-guidelines__index {
    grid-template-columns: 1fr;
  }

  .varianza-authors-intro,
  .varianza-authors-directory ul {
    grid-template-columns: 1fr;
  }

  .varianza-authors-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
