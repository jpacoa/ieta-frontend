<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ArrowRight, Download, ExternalLink, LayoutGrid, List } from '@lucide/vue'
import EmptyState from '@/components/common/EmptyState.vue'
import LoadMoreButton from '@/components/common/LoadMoreButton.vue'
import EditorJsContent from '@/components/common/EditorJsContent.vue'
import EditorialMemberCard from '@/components/varianza/EditorialMemberCard.vue'
import AuthorProfileCard from '@/components/varianza/AuthorProfileCard.vue'
import MagazineIssueRow from '@/components/varianza/MagazineIssueRow.vue'
import VarianzaHero from '@/components/varianza/VarianzaHero.vue'
import VarianzaSectionNav from '@/components/varianza/VarianzaSectionNav.vue'
import { authorName } from '@/api/normalizers'
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
const issueQuery = ref('')
const selectedIssueYear = ref('')

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

const editorialEmail = computed(() => varianzaProfile.value?.correo_contacto || 'estadistica@umsa.bo')
const latestIssueCover = computed(() => mediaUrl(latestIssue.value?.portada_url))
const apiBaseUrl = import.meta.env.VITE_API_URL

const activeGuidelines = computed(() => guidelinesResource.items.value
  .filter((item) => item.activo !== false)
  .sort((first, second) => (first.orden ?? 0) - (second.orden ?? 0)))

function guidelineAnchor(item: { id: number | string }) {
  return `instruccion-${item.id}`
}

const { t } = useI18n()

const sectionItems = computed(() => [
  { value: 'sobre', label: t('tabs.about'), to: '/revista-varianza' },
  { value: 'comite-editor', label: t('tabs.committee'), to: '/revista-varianza/comite-editor' },
  { value: 'autores', label: t('tabs.authors'), to: '/revista-varianza/autores' },
  { value: 'ediciones', label: t('tabs.editions'), to: '/revista-varianza/ediciones' },
  {
    value: 'instrucciones-autores',
    label: t('tabs.instructions'),
    to: '/revista-varianza/instrucciones-autores',
  },
])

const activeSection = computed(() => {
  const tab = String(route.params.tab ?? '')
  if (!tab) return 'sobre'
  if (tab === 'instrucciones') return 'instrucciones-autores'
  return sectionItems.value.find((item) => item.value === tab)?.value ?? 'sobre'
})

// Fallback guidelines matching PDF Page 14
const fallbackGuidelines = [
  {
    id: 1,
    titulo_seccion: 'Tipos de Manuscrito',
    contenido: `<p>En la Revista Varianza se publican principalmente artículos originales, aquéllos que resultan de una investigación científica y que contribuyen, en alguna medida, al conocimiento científico y/o solución de alguna problemática. Los artículos originales pueden ser de naturaleza teórica o práctica. Los de naturaleza práctica se enfocan en dar respuesta, con base en el uso de métodos y/o técnicas estadísticas apropiadas, a problemas o preguntas de investigación en distintos campos de la vida; mientras los de naturaleza teórica presentan un nuevo método o técnica estadística, o pueden ofrecer una versión mejorada de uno existente.</p>
    <p>Además, si bien no son artículos originales de investigación, en la Revista Varianza también se publican otro tipo de manuscritos, como ser:</p>
    <h4>De revisión</h4>
    <p>Constituyen básicamente informes sobre avances o estado del arte de un tema particular, con base en la recopilación y selección de artículos científicos originales.</p>
    <h4>Comunicaciones breves</h4>
    <p>Manuscritos que comunican de manera breve algunos datos de una investigación original que el editor cree que serán interesantes para muchos investigadores y que probablemente estimularán más la investigación en esa área.</p>
    <h4>Estudios de caso</h4>
    <p>Informan los resultados sobre casos específicos de fenómenos interesantes. Su propósito es hacer que otros investigadores conozcan la posibilidad de que un fenómeno específico pueda ocurrir.</p>
    <h4>Reseñas</h4>
    <p>Consisten en resúmenes concisos generalmente sobre libros recientemente publicados en el campo de la Estadística.</p>
    <h4>Notas científicas</h4>
    <p>Presentan observaciones y descripciones científicas breves de métodos o resultados, comunican resultados de estudios pequeños, avances de trabajos de investigación o noticias de interés científico.</p>
    <h4>De enseñanza</h4>
    <p>Son manuscritos sobre temas relacionados a la enseñanza de la Estadística, por ejemplo la comprensión de un teorema o un método de estimación. Tiene el propósito de clarificar y complementar los conocimientos estadísticos de los estudiantes y los docentes.</p>`,
  },
  {
    id: 2,
    titulo_seccion: 'Recepción de Manuscritos',
    contenido: '<p>Los manuscritos deben enviarse en formato digital a través del correo oficial de la revista o mediante el formulario de contacto institucional del IETA.</p>',
  },
  {
    id: 3,
    titulo_seccion: 'Proceso de Revisión de Manuscritos',
    contenido: '<p>Todos los artículos son evaluados por pares académicos bajo la modalidad doble ciego (double-blind peer review) garantizando total imparcialidad y rigor científico.</p>',
  },
  {
    id: 4,
    titulo_seccion: 'Formato para Artículos Originales de Investigación',
    contenido: '<p>Los manuscritos deben estructurarse en: Título, Resumen (en español e inglés), Palabras Clave, Introducción, Métodos, Resultados, Discusión, Conclusiones y Referencias bibliográficas en norma APA o IEEE.</p>',
  },
  {
    id: 5,
    titulo_seccion: 'Especificación para la presentación de manuscritos',
    contenido: '<p>Se sugiere el uso de LaTeX con la plantilla oficial de la Revista Varianza o formato Word con tipografía estándar, interlineado 1.5 y gráficos en formato vectorial de alta resolución.</p>',
  },
  {
    id: 6,
    titulo_seccion: 'Periodicidad de la Publicación',
    contenido: '<p>La Revista Varianza se publica de forma semestral (ediciones en abril y octubre de cada año calendario).</p>',
  },
  {
    id: 7,
    titulo_seccion: 'Conflicto de Intereses',
    contenido: '<p>Los autores deben declarar explícitamente cualquier relación financiera, laboral o personal que pudiera representar un conflicto de intereses con el trabajo publicado.</p>',
  },
  {
    id: 8,
    titulo_seccion: 'Ética de Publicación',
    contenido: '<p>El comité editorial adhiere a las directrices de integridad y buenas prácticas editoriales internacionales del Committee on Publication Ethics (COPE).</p>',
  },
  {
    id: 9,
    titulo_seccion: 'Financiamiento de la revista',
    contenido: '<p>La Revista Varianza es enteramente financiada por la Universidad Mayor de San Andrés y la Carrera de Estadística, sin costos de procesamiento ni cobro a los autores (Open Access diamante).</p>',
  },
  {
    id: 10,
    titulo_seccion: 'Propiedad Intelectual',
    contenido: '<p>Los autores conservan los derechos patrimoniales y morales sobre sus investigaciones, autorizando su difusión en acceso abierto institucional.</p>',
  },
  {
    id: 11,
    titulo_seccion: 'Licenciamiento',
    contenido: '<p>Las publicaciones se distribuyen bajo la licencia internacional Creative Commons Atribución-NoComercial 4.0 Internacional (CC BY-NC 4.0).</p>',
  },
]

const displayedGuidelines = computed(() => {
  return activeGuidelines.value.length > 0 ? activeGuidelines.value : fallbackGuidelines
})

// Fallback issues matching PDF Page 11
const fallbackIssues = [
  {
    id: 25,
    numero: '25',
    titulo: 'Varianza Nro. 25',
    mes: 'Abril',
    anio: 2025,
    num_art_originales_declarado: 2,
    num_paginas: 51,
    director: 'Dr.(c) Ramiro Coa Clemente',
    tamano_archivo: '1.7 Mb.',
    issn_impresa: '2789-3510',
    issn_electronica: '2789-3529',
    slug: 'varianza-25',
  },
  {
    id: 24,
    numero: '24',
    titulo: 'Varianza Nro. 24',
    mes: 'Octubre',
    anio: 2024,
    num_art_originales_declarado: 2,
    num_paginas: 61,
    director: 'Dr.(c) Ramiro Coa Clemente',
    tamano_archivo: '2.8 Mb.',
    issn_impresa: '2789-3510',
    issn_electronica: '2789-3529',
    slug: 'varianza-24',
  },
  {
    id: 23,
    numero: '23',
    titulo: 'Varianza Nro. 23',
    mes: 'Abril',
    anio: 2024,
    num_art_originales_declarado: 2,
    num_paginas: 51,
    director: 'Dr.(c) Ramiro Coa Clemente',
    tamano_archivo: '1.7 Mb.',
    issn_impresa: '2789-3510',
    issn_electronica: '2789-3529',
    slug: 'varianza-23',
  },
  {
    id: 22,
    numero: '22',
    titulo: 'Varianza Nro. 22',
    mes: 'Octubre',
    anio: 2023,
    num_art_originales_declarado: 2,
    num_paginas: 51,
    director: 'Dr.(c) Ramiro Coa Clemente',
    tamano_archivo: '1.7 Mb.',
    issn_impresa: '2789-3510',
    issn_electronica: '2789-3529',
    slug: 'varianza-22',
  },
  {
    id: 21,
    numero: '21',
    titulo: 'Varianza Nro. 21',
    mes: 'Abril',
    anio: 2023,
    num_art_originales_declarado: 2,
    num_paginas: 51,
    director: 'Dr.(c) Ramiro Coa Clemente',
    tamano_archivo: '1.7 Mb.',
    issn_impresa: '2789-3510',
    issn_electronica: '2789-3529',
    slug: 'varianza-21',
  },
  {
    id: 20,
    numero: '20',
    titulo: 'Varianza Nro. 20',
    mes: 'Octubre',
    anio: 2022,
    num_art_originales_declarado: 2,
    num_paginas: 51,
    director: 'Dr.(c) Ramiro Coa Clemente',
    tamano_archivo: '1.7 Mb.',
    issn_impresa: '2789-3510',
    issn_electronica: '2789-3529',
    slug: 'varianza-20',
  },
]

const availableIssueYears = computed(() => {
  const years = new Set<string>()
  for (const item of issuesResource.items.value) {
    if (item.anio) years.add(String(item.anio))
  }
  if (years.size === 0) {
    return ['2025', '2024', '2023', '2022']
  }
  return [...years].sort((a, b) => b.localeCompare(a))
})

const filteredIssues = computed(() => {
  const q = issueQuery.value.trim().toLowerCase()
  const y = selectedIssueYear.value.trim()
  const baseItems = issuesResource.items.value.length > 0 ? issuesResource.items.value : fallbackIssues
  return baseItems.filter((issue) => {
    const matchesQ = !q || issue.titulo.toLowerCase().includes(q) || (issue.numero && String(issue.numero).includes(q))
    const matchesY = !y || String(issue.anio ?? '') === y
    return matchesQ && matchesY
  })
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

    <Transition name="tab-panel-fade" mode="out-in">
      <div :key="activeSection" class="varianza-tab-panel-wrap">
        <!-- 1. SOBRE LA REVISTA (PDF Page 15) -->
        <template v-if="activeSection === 'sobre'">
          <section class="varianza-about">
        <div class="container varianza-about__inner">
          <div class="varianza-about__copy">
            <h2 class="varianza-pink-heading">{{ varianzaProfile?.titulo || 'Sobre la revista' }}</h2>
            <div class="varianza-about__text">
              <p v-if="profileLoading" class="varianza-resource-state" role="status">Cargando perfil editorial…</p>
              <p v-else-if="profileError" class="varianza-resource-state" role="alert">No se pudo cargar el perfil editorial.</p>
              <EditorJsContent v-else-if="varianzaProfile?.contenido" :content="varianzaProfile.contenido" :api-base-url="apiBaseUrl" />
              <p v-else>
                Revista Varianza es una revista del Instituto de Estadística Teórica y Aplicada (IETA), dependiente de la Carrera de Estadística de la Universidad Mayor de San Andrés, que publica en forma periódica principalmente artículos originales de investigación aplicada en distintos ámbitos.
              </p>
            </div>

            <dl class="varianza-about__issn">
              <div>
                <dt>ISSN versión impresa:</dt>
                <dd>{{ varianzaProfile?.issn_impreso || '2789-3510' }}</dd>
              </div>
              <div>
                <dt>ISSN versión en línea:</dt>
                <dd>{{ varianzaProfile?.issn_electronico || '2789-3529' }}</dd>
              </div>
              <div v-if="varianzaProfile?.periodicidad">
                <dt>Periodicidad:</dt>
                <dd>{{ varianzaProfile.periodicidad }}</dd>
              </div>
            </dl>

            <a class="varianza-external-link" href="http://ieta.umsa.bo/revista-varianza" target="_blank" rel="noreferrer">
              http://ieta.umsa.bo/revista-varianza
            </a>
          </div>

          <!-- Right side: Latest Issue card preview (PDF Page 15) -->
          <div class="varianza-about__featured">
            <div v-if="latestIssueLoading" class="varianza-resource-state" role="status">Cargando última edición…</div>
            <div v-else class="varianza-latest-card">
              <RouterLink
                :to="latestIssue ? `/revista-varianza/ediciones/${encodeURIComponent(latestIssue.slug || String(latestIssue.id))}` : '/revista-varianza/ediciones'"
                class="varianza-latest-card__cover-link"
              >
                <img
                  v-if="latestIssueCover"
                  :src="latestIssueCover"
                  :alt="`Portada de ${latestIssue?.titulo || 'Varianza'}`"
                  class="varianza-latest-card__img"
                />
                <div v-else class="varianza-latest-card__placeholder">
                  <span>VARIANZA</span>
                  <span>N° {{ latestIssue?.numero || '26' }}</span>
                </div>
              </RouterLink>
              <div class="varianza-latest-card__meta">
                <span class="varianza-latest-card__label">Última Edición</span>
                <RouterLink
                  :to="latestIssue ? `/revista-varianza/ediciones/${encodeURIComponent(latestIssue.slug || String(latestIssue.id))}` : '/revista-varianza/ediciones'"
                  class="varianza-latest-card__title-link"
                >
                  <span>{{ latestIssue?.titulo || 'Varianza Nº 26' }}</span>
                  <ArrowRight :size="16" aria-hidden="true" />
                </RouterLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Clean dividers and sections matching PDF Page 15 -->
      <hr class="varianza-divider" />

      <section class="varianza-statement-block">
        <div class="container">
          <h2 class="varianza-statement-title">Misión</h2>
          <div class="varianza-statement-body">
            <p v-if="varianzaProfile?.mision">{{ varianzaProfile.mision }}</p>
            <p v-else>
              Difundir principalmente artículos originales de investigación científica en los ámbitos social, económico y medioambiental, basados en el uso de métodos y técnicas estadísticas apropiadas. También difundir artículos de naturaleza teórica en el campo de la estadística. Todo ello con el propósito de contribuir a la formulación de políticas orientadas a impulsar el desarrollo de nuestra sociedad.
            </p>
          </div>
        </div>
      </section>

      <hr class="varianza-divider" />

      <section class="varianza-statement-block">
        <div class="container">
          <h2 class="varianza-statement-title">Visión</h2>
          <div class="varianza-statement-body">
            <p v-if="varianzaProfile?.vision">{{ varianzaProfile.vision }}</p>
            <p v-else>
              Llegar a ser la revista científica nacional de mayor calidad e impacto en el campo de la estadística aplicada y teórica, así como ser el principal referente para el contexto internacional.
            </p>
          </div>
        </div>
      </section>

      <hr class="varianza-divider" />

      <section class="varianza-statement-block">
        <div class="container">
          <h2 class="varianza-statement-title">Alcance</h2>
          <div class="varianza-statement-body">
            <EditorJsContent v-if="varianzaProfile?.alcance" :content="varianzaProfile.alcance" :api-base-url="apiBaseUrl" />
            <template v-else>
              <p>
                En la Revista Varianza se publican artículos científicos relacionados con cualquier ámbito, sea social, económico, cultural, medioambiental u otro, es decir, no existe restricción en cuanto al área de aplicación. Sin embargo, por tratarse de una revista científica editada por una institución vinculada netamente al campo estadístico, los artículos originales publicados deben ser rigurosos en cuanto a los métodos estadísticos usados en el análisis de sus datos.
              </p>
              <p>
                Por otra parte, la Revista Varianza está dirigida en general a toda la población, sin ninguna restricción, pero particularmente está orientada tanto a la comunidad académica, incluido los estudiantes, docentes, investigadores y profesionales, así como a los tomadores de decisión, incluido las autoridades nacionales, regionales y locales.
              </p>
            </template>
          </div>
        </div>
      </section>

      <template v-if="varianzaProfile?.politicas">
        <hr class="varianza-divider" />
        <section class="varianza-statement-block">
          <div class="container">
            <h2 class="varianza-statement-title">Políticas editoriales</h2>
            <div class="varianza-statement-body">
              <EditorJsContent :content="varianzaProfile.politicas" :api-base-url="apiBaseUrl" />
            </div>
          </div>
        </section>
      </template>
    </template>

    <!-- 2. COMITÉ EDITOR (PDF Page 10) -->
    <template v-else-if="activeSection === 'comite-editor'">
      <section class="varianza-committee-section">
        <div class="container">
          <div class="varianza-committee-header">
            <h2 class="varianza-committee-title">Comité Editor</h2>
            <p class="varianza-committee-desc">
              El equipo académico responsable de la gestión editorial, la revisión por pares y la excelencia científica de la Revista Varianza del IETA.
            </p>
          </div>
          <div class="varianza-pink-bar"></div>

          <p v-if="committeeResource.loading.value && committeeResource.items.value.length === 0" class="varianza-resource-state" role="status">Cargando comité editorial…</p>
          <div v-else-if="committeeResource.error.value && committeeResource.items.value.length === 0" class="varianza-resource-state" role="alert">
            <p>No se pudo cargar el comité editorial.</p>
            <button type="button" class="retry-button" @click="committeeResource.refresh">Reintentar</button>
          </div>

          <div v-else class="varianza-committee-content">
            <template v-if="committeeGroups.length">
              <div
                v-for="(group, idx) in committeeGroups"
                :key="group.title"
                class="varianza-committee-group"
              >
                <h3 class="varianza-group-title">{{ group.title }}</h3>
                <div class="varianza-group-grid" :class="{ 'varianza-group-grid--single': group.title.toLowerCase().includes('editor') && !group.title.toLowerCase().includes('comit') }">
                  <EditorialMemberCard
                    v-for="member in group.members"
                    :key="member.id"
                    :name="memberName(member)"
                    :role="member.cargo?.nombre || member.tipo || 'Comité Editorial'"
                    :institution="memberInstitution(member)"
                    :email="member.persona?.p_correo || undefined"
                  />
                </div>
                <hr v-if="idx < committeeGroups.length - 1" class="varianza-divider" />
              </div>
            </template>

            <template v-else>
              <!-- Fallback layout matching PDF Page 10 exactly -->
              <div class="varianza-committee-group">
                <h3 class="varianza-group-title">Editor</h3>
                <div class="varianza-group-grid varianza-group-grid--single">
                  <EditorialMemberCard
                    name="Ramiro Coa Clemente, Dr(c)."
                    role="Director IETA, Carrera de Estadística"
                    institution="Universidad Mayor de San Andrés, La Paz, Bolivia"
                    email="estadistica@umsa.bo"
                  />
                </div>
                <hr class="varianza-divider" />
              </div>

              <div class="varianza-committee-group">
                <h3 class="varianza-group-title">Comité Editorial Internacional</h3>
                <div class="varianza-group-grid">
                  <EditorialMemberCard
                    name="Lizbeth Román Padilla, Ph.D."
                    role="Estadístico"
                    institution="Universidad Anáhuac (Norte), Ciudad de México, México"
                    email="lizroman@hotmail.com"
                  />
                  <EditorialMemberCard
                    name="Yolanda M. Gómez Olmos, Dra."
                    role="Estadístico"
                    institution="Universidad de Bío Bío, Concepción, Chile"
                    email="ygomez@ubiobio.cl"
                  />
                  <EditorialMemberCard
                    name="Omar Chocotea Poca, Dr."
                    role="Estadístico"
                    institution="Universidad Santiago de Chile, Santiago, Chile"
                    email="omar.chocotea@usach.cl"
                  />
                  <EditorialMemberCard
                    name="Luz Mery González García, Ph.D."
                    role="Estadístico"
                    institution="Universidad Nacional de Colombia, Bogotá, Colombia"
                    email="lgonzalezg@unal.edu.co"
                  />
                  <EditorialMemberCard
                    name="Martha Patricia Bohorquez Castañeda, Ph.D."
                    role="Estadístico"
                    institution="Universidad Nacional de Colombia, Bogotá, Colombia"
                    email="mpbohorquezc@unal.edu.co"
                  />
                  <EditorialMemberCard
                    name="Adriana D'Amelio, Mg."
                    role="Estadístico"
                    institution="Universidad Nacional de Cuyo, Mendoza, Argentina"
                    email="ostat06@hotmail.com"
                  />
                </div>
                <hr class="varianza-divider" />
              </div>

              <div class="varianza-committee-group">
                <h3 class="varianza-group-title">Comité Editorial Nacional</h3>
                <div class="varianza-group-grid">
                  <EditorialMemberCard
                    name="María Eugenia Aparicio Torrico, M. Sc."
                    role="Economista"
                    institution="Universidad Autónoma Juan Misael Saracho UAJMS, Tarija-Bolivia"
                    email="apariciouajms@gmail.com"
                  />
                  <EditorialMemberCard
                    name="Arminda Flora Casso Lisarazu, M. Sc."
                    role="Economista"
                    institution="Universidad Autónoma Juan Misael Saracho UAJMS, Tarija-Bolivia"
                    email="armindacasso@gmail.com"
                  />
                </div>
              </div>
            </template>
          </div>
        </div>
      </section>
    </template>

    <!-- 3. AUTORES VARIANZA -->
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

          <div class="author-filters-row">
            <input
              v-model="authorQuery"
              type="search"
              placeholder="Buscar autor por nombre o tema de investigación…"
              class="author-search-input"
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
          </div>

          <p v-if="authorsResource.loading.value && authorsResource.items.value.length === 0" class="varianza-resource-state" role="status">Cargando autores…</p>
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

    <!-- 4. TODAS LAS EDICIONES (PDF Page 11) -->
    <template v-else-if="activeSection === 'ediciones'">
      <section class="varianza-editions-section">
        <div class="container">
          <!-- Featured Issue Card (PDF Page 11) -->
          <div class="varianza-current-issue-card">
            <div class="varianza-current-issue-card__media">
              <img
                v-if="latestIssueCover"
                :src="latestIssueCover"
                :alt="`Portada de ${latestIssue?.titulo || 'Varianza Nro. 26'}`"
                class="current-issue-cover"
              />
              <div v-else class="current-issue-cover-placeholder">
                <span class="cover-placeholder__vol">VARIANZA</span>
                <span class="cover-placeholder__num">N° {{ latestIssue?.numero || '26' }}</span>
              </div>
            </div>
            <div class="varianza-current-issue-card__info">
              <span class="current-issue-date">{{ [latestIssue?.mes || 'Octubre', latestIssue?.anio || '2025'].filter(Boolean).join(', ') }}</span>
              <h2 class="current-issue-title">{{ latestIssue?.titulo || 'Varianza Nro. 26' }}</h2>
              <dl class="current-issue-specs">
                <div>
                  <dt>Nro. Artículos Originales:</dt>
                  <dd>{{ latestIssue?.articulos_originales_count ?? latestIssue?.num_art_originales_declarado ?? 4 }}</dd>
                </div>
                <div>
                  <dt>Nro. Páginas:</dt>
                  <dd>{{ latestIssue?.num_paginas || 67 }}</dd>
                </div>
                <div>
                  <dt>Director del IETA:</dt>
                  <dd>{{ 'Lic. Esp. Raúl León Delgado Álvarez' }}</dd>
                </div>
                <div>
                  <dt>Tamaño archivo:</dt>
                  <dd>{{ '2.88 Mb.' }}</dd>
                </div>
                <div>
                  <dt>ISSN versión impresa:</dt>
                  <dd>{{ latestIssue?.issn_impresa || '2789-3510' }}</dd>
                </div>
                <div>
                  <dt>ISSN versión en línea:</dt>
                  <dd>{{ latestIssue?.issn_electronica || '2789-3529' }}</dd>
                </div>
              </dl>
              <div class="current-issue-actions">
                <RouterLink
                  v-if="latestIssue"
                  :to="`/revista-varianza/ediciones/${encodeURIComponent(latestIssue.slug || String(latestIssue.id))}`"
                  class="btn-pink-pill"
                >
                  <span>Ver Revista</span>
                  <ArrowRight :size="16" aria-hidden="true" />
                </RouterLink>
                <RouterLink
                  v-else
                  to="/revista-varianza/ediciones/26"
                  class="btn-pink-pill"
                >
                  <span>Ver Revista</span>
                  <ArrowRight :size="16" aria-hidden="true" />
                </RouterLink>

                <a
                  v-if="latestIssue?.archivo_url"
                  :href="mediaUrl(latestIssue.archivo_url)"
                  class="btn-pink-outline"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>Descargar</span>
                  <Download :size="16" aria-hidden="true" />
                </a>
                <button v-else type="button" class="btn-pink-outline">
                  <span>Descargar</span>
                  <Download :size="16" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          <!-- Section heading and search filter -->
          <header class="varianza-all-editions-header">
            <h2 class="all-editions-title">Todas las ediciones</h2>
            <div class="all-editions-filters">
              <div class="filter-field">
                <label for="editions-search" class="filter-field__label">palabras clave</label>
                <input
                  id="editions-search"
                  v-model="issueQuery"
                  type="search"
                  placeholder="buscador por palabra clave"
                  class="filter-field__input"
                />
              </div>
              <div class="filter-field filter-field--year">
                <label for="editions-year" class="filter-field__label">filtro por año</label>
                <select id="editions-year" v-model="selectedIssueYear" class="filter-field__select">
                  <option value="">Año</option>
                  <option v-for="y in availableIssueYears" :key="y" :value="y">{{ y }}</option>
                </select>
              </div>
            </div>
          </header>

          <div v-if="filteredIssues.length" class="varianza-issues__list">
            <MagazineIssueRow
              v-for="issue in filteredIssues"
              :key="issue.id"
              :number="issue.numero"
              :date="[issue.mes, issue.anio].filter(Boolean).join(', ')"
              :title="issue.titulo"
              :cover="mediaUrl(issue.portada_url)"
              :cover-alt="`Portada de ${issue.titulo}`"
              :to="`/revista-varianza/ediciones/${encodeURIComponent(issue.slug || String(issue.id))}`"
              :article-count="Number(issue.articulos_count ?? issue.articulos_originales_count ?? issue.num_art_originales_declarado ?? 2)"
              :pages="issue.num_paginas ?? 51"
            />
          </div>

          <EmptyState
            v-else
            title="No se encontraron ediciones"
            description="Prueba con otros términos de búsqueda o selecciona otro año."
          />

          <div class="varianza-load-more-wrap">
            <button type="button" class="btn-load-more-magazines" @click="issuesResource.loadMore">
              <span>Cargar más revistas</span>
              <ArrowRight :size="16" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>
    </template>

    <!-- 5. INSTRUCCIONES PARA AUTORES (PDF Page 14) -->
    <template v-else-if="activeSection === 'instrucciones-autores'">
      <section class="varianza-guidelines-section">
        <div class="container">
          <h2 class="varianza-guidelines-title">Instrucciones para autores</h2>
          <div class="varianza-pink-bar"></div>

          <div class="varianza-guidelines__layout">
            <nav class="varianza-guidelines__index" aria-label="Índice de instrucciones">
              <h3 class="index-title">Índice</h3>
              <ul class="index-list">
                <li v-for="item in displayedGuidelines" :key="item.id">
                  <a :href="`#${guidelineAnchor(item)}`">{{ item.titulo_seccion }}</a>
                </li>
              </ul>
            </nav>
            <div class="varianza-guidelines__content">
              <section
                v-for="item in displayedGuidelines"
                :id="guidelineAnchor(item)"
                :key="item.id"
                class="guideline-entry"
              >
                <h3 class="guideline-entry__title">{{ item.titulo_seccion }}</h3>
                <EditorJsContent
                  v-if="typeof item.contenido === 'object' && item.contenido !== null"
                  :content="item.contenido"
                  :api-base-url="apiBaseUrl"
                />
                <div
                  v-else
                  class="guideline-raw-content"
                  v-html="item.contenido"
                ></div>
              </section>

              <div class="guideline-contact-box">
                <p>¿Tienes dudas sobre las normas editoriales o el proceso de envío?</p>
                <a class="varianza-guidelines__external" :href="`mailto:${editorialEmail}`">
                  <span>Contactar a la revista</span>
                  <ExternalLink :size="14" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</Transition>
</main>
</template>

<style scoped>
.varianza-view {
  --varianza-navy: #1b144b;
  --varianza-pink: #f50088;
  overflow: clip;
  background: var(--color-superficie);
}

.varianza-tab-panel-wrap {
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

/* Common Dividers & Bars */
.varianza-divider {
  border: 0;
  height: 1px;
  background: #eaedf6;
  margin: clamp(2rem, 4vw, 3rem) 0;
}

.varianza-pink-bar {
  height: 3px;
  background: var(--varianza-pink);
  margin-block: 1rem 2.25rem;
  border-radius: 2px;
}

.varianza-pink-heading {
  color: var(--varianza-pink);
  font-size: clamp(1.85rem, 3.5vw, 2.5rem);
  font-weight: 800;
  letter-spacing: -0.01em;
  margin: 0 0 1rem;
}

.varianza-statement-block {
  padding-block: 0.5rem;
}

.varianza-statement-title {
  color: var(--varianza-navy);
  font-size: clamp(1.4rem, 2.5vw, 1.85rem);
  font-weight: 800;
  margin: 0 0 1rem;
}

.varianza-statement-body {
  color: #334155;
  font-size: 1rem;
  line-height: 1.7;
  max-width: 84ch;
}

.varianza-statement-body p + p {
  margin-top: 1rem;
}

/* 1. SOBRE LA REVISTA */
.varianza-about {
  padding-top: clamp(1.5rem, 3vw, 2.5rem);
}

.varianza-about__inner {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(18rem, 0.85fr);
  align-items: center;
  gap: clamp(2rem, 5vw, 4rem);
}

.varianza-about__copy {
  max-width: 44rem;
}

.varianza-about__text {
  color: #334155;
  font-size: 1.02rem;
  line-height: 1.7;
}

.varianza-about__issn {
  display: grid;
  gap: 0.4rem;
  margin-block: 1.5rem;
  font-size: 0.95rem;
  color: #1e293b;
}

.varianza-about__issn div {
  display: flex;
  gap: 0.5rem;
}

.varianza-about__issn dt {
  font-weight: 700;
  color: #1b144b;
}

.varianza-about__issn dd {
  margin: 0;
  color: #475569;
}

.varianza-external-link {
  display: inline-block;
  color: var(--varianza-pink);
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 0.25em;
  font-size: 0.95rem;
  transition: opacity 0.2s ease;
}

.varianza-external-link:hover {
  opacity: 0.85;
}

/* Latest Card Preview (Right side) */
.varianza-latest-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: var(--color-superficie);
  padding: 1.5rem;
}

.varianza-latest-card__cover-link {
  display: block;
  width: min(100%, 15rem);
  box-shadow: 0 12px 32px rgba(27, 20, 75, 0.16);
  border-radius: 6px;
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.varianza-latest-card__cover-link:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 36px rgba(27, 20, 75, 0.22);
}

.varianza-latest-card__img {
  width: 100%;
  aspect-ratio: 0.72;
  object-fit: cover;
  display: block;
}

.varianza-latest-card__placeholder {
  display: grid;
  place-content: center;
  aspect-ratio: 0.72;
  background: linear-gradient(145deg, #18113c, #2b1a6c);
  color: #ffffff;
  font-weight: 800;
  font-size: 1.25rem;
  gap: 0.35rem;
}

.varianza-latest-card__meta {
  margin-top: 1rem;
}

.varianza-latest-card__label {
  display: block;
  font-size: 0.82rem;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.varianza-latest-card__title-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--varianza-pink);
  font-size: 1.2rem;
  font-weight: 800;
  text-decoration: none;
  margin-top: 0.2rem;
  transition: gap 0.2s ease;
}

.varianza-latest-card__title-link:hover {
  gap: 0.6rem;
}

/* 2. COMITÉ EDITOR (PDF Page 10) */
.varianza-committee-section {
  padding-block: clamp(1.5rem, 3vw, 2.5rem);
}

.varianza-committee-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 2rem;
}

.varianza-committee-title {
  color: var(--varianza-pink);
  font-size: clamp(1.85rem, 3.5vw, 2.5rem);
  font-weight: 800;
  margin: 0;
}

.varianza-committee-desc {
  color: #475569;
  font-size: 0.95rem;
  line-height: 1.5;
  max-width: 44ch;
  margin: 0;
  text-align: right;
}

.varianza-group-title {
  color: var(--varianza-navy);
  font-size: 1.35rem;
  font-weight: 800;
  margin: 0 0 1.25rem;
}

.varianza-group-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;
}

.varianza-group-grid--single {
  grid-template-columns: minmax(0, 32rem);
}

/* 3. AUTORES */
.varianza-listing {
  padding-block: clamp(1.5rem, 3vw, 2.5rem);
}

.varianza-authors-intro {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 2rem;
  margin-bottom: 1.75rem;
}

.varianza-authors-intro p:first-child {
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--varianza-pink);
  margin: 0 0 0.25rem;
}

.varianza-authors-intro h2 {
  font-size: clamp(1.85rem, 3.5vw, 2.5rem);
  font-weight: 800;
  color: var(--varianza-pink);
  margin: 0;
}

.varianza-authors-intro > p {
  color: #475569;
  font-size: 0.95rem;
  line-height: 1.5;
  max-width: 44ch;
  margin: 0;
  text-align: right;
}

.author-filters-row {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.author-search-input {
  flex-grow: 1;
  max-width: 36rem;
  height: 2.85rem;
  padding: 0 1.15rem;
  border-radius: 8px;
  border: 1px solid #d4d8e5;
  background: #ffffff;
  font-size: 0.92rem;
  outline: none;
  transition: border-color 0.2s ease;
}

.author-search-input:focus {
  border-color: var(--varianza-pink);
}

.author-view-switch {
  display: inline-flex;
  border: 1px solid #d4d8e5;
  border-radius: 8px;
  padding: 3px;
  background: #ffffff;
}

.author-view-switch button {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  height: 2.25rem;
  padding: 0 0.85rem;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--varianza-navy);
  font-weight: 700;
  font-size: 0.82rem;
  cursor: pointer;
}

.author-view-switch button[aria-pressed='true'] {
  background: var(--varianza-navy);
  color: #ffffff;
}

.varianza-authors-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 1.25rem;
}

.varianza-authors-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

/* 4. TODAS LAS EDICIONES (PDF Page 11) */
.varianza-editions-section {
  padding-block: clamp(1.5rem, 3vw, 2.5rem);
}

.varianza-current-issue-card {
  display: grid;
  grid-template-columns: 14rem minmax(0, 1fr);
  gap: 2.5rem;
  align-items: center;
  background: linear-gradient(135deg, #1b144b 0%, #291a66 100%);
  color: #ffffff;
  border-radius: 12px;
  padding: clamp(1.75rem, 3.5vw, 2.5rem);
  box-shadow: 0 12px 36px rgba(27, 20, 75, 0.18);
  margin-bottom: 3.5rem;
}

.varianza-current-issue-card__media {
  width: 100%;
}

.current-issue-cover {
  width: 100%;
  aspect-ratio: 0.72;
  object-fit: cover;
  border-radius: 6px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
}

.current-issue-cover-placeholder {
  display: grid;
  place-content: center;
  aspect-ratio: 0.72;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 6px;
  text-align: center;
  gap: 0.35rem;
}

.cover-placeholder__vol {
  font-size: 1.3rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: #ffffff;
}

.cover-placeholder__num {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
}

.current-issue-date {
  font-size: 0.92rem;
  color: #f6d1e3;
  font-weight: 600;
  letter-spacing: 0.03em;
}

.current-issue-title {
  color: #ffffff;
  font-size: clamp(1.75rem, 3vw, 2.35rem);
  font-weight: 800;
  margin: 0.25rem 0 1.25rem;
}

.current-issue-specs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem 2rem;
  font-size: 0.88rem;
  color: #e2e8f0;
  margin-bottom: 1.75rem;
}

.current-issue-specs div {
  display: flex;
  gap: 0.4rem;
}

.current-issue-specs dt {
  font-weight: 700;
  color: #ffffff;
}

.current-issue-specs dd {
  margin: 0;
  color: rgba(255, 255, 255, 0.85);
}

.current-issue-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.btn-pink-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  height: 2.75rem;
  padding: 0 1.5rem;
  border-radius: 999px;
  background: var(--varianza-pink);
  color: #ffffff;
  font-weight: 800;
  font-size: 0.9rem;
  text-decoration: none;
  transition: transform 0.2s ease, background 0.2s ease;
}

.btn-pink-pill:hover {
  background: #db007a;
  transform: translateY(-2px);
}

.btn-pink-outline {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  height: 2.75rem;
  padding: 0 1.5rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
  font-weight: 700;
  font-size: 0.9rem;
  text-decoration: none;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.btn-pink-outline:hover {
  border-color: #ffffff;
  background: rgba(255, 255, 255, 0.16);
}

/* All Editions Header & Filter */
.varianza-all-editions-header {
  margin-bottom: 2rem;
}

.all-editions-title {
  color: var(--varianza-navy);
  font-size: clamp(1.6rem, 2.8vw, 2.1rem);
  font-weight: 800;
  margin: 0 0 1.25rem;
}

.all-editions-filters {
  display: flex;
  gap: 1.5rem;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex-grow: 1;
}

.filter-field--year {
  flex-grow: 0;
  width: 12rem;
}

.filter-field__label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--varianza-navy);
}

.filter-field__input,
.filter-field__select {
  height: 2.65rem;
  border: 1px solid #d4d8e5;
  border-radius: 6px;
  padding: 0 0.85rem;
  font-size: 0.9rem;
  outline: none;
}

.filter-field__input:focus,
.filter-field__select:focus {
  border-color: var(--varianza-pink);
}

.varianza-issues__list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;
}

.varianza-load-more-wrap {
  display: flex;
  justify-content: center;
  margin-top: 2.5rem;
}

.btn-load-more-magazines {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  height: 2.65rem;
  padding: 0 1.5rem;
  border-radius: 999px;
  border: 1px solid var(--varianza-pink);
  background: transparent;
  color: var(--varianza-pink);
  font-weight: 800;
  font-size: 0.88rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-load-more-magazines:hover {
  background: var(--varianza-pink);
  color: #ffffff;
}

/* 5. INSTRUCCIONES PARA AUTORES (PDF Page 14) */
.varianza-guidelines-section {
  padding-block: clamp(1.5rem, 3vw, 2.5rem);
}

.varianza-guidelines-title {
  color: var(--varianza-pink);
  font-size: clamp(1.85rem, 3.5vw, 2.5rem);
  font-weight: 800;
  margin: 0;
}

.varianza-guidelines__layout {
  display: grid;
  grid-template-columns: minmax(14rem, 18rem) minmax(0, 1fr);
  gap: clamp(2rem, 4vw, 4rem);
  align-items: start;
}

.varianza-guidelines__index {
  position: sticky;
  top: calc(var(--header-height) + 1.5rem);
  background: #ffffff;
}

.index-title {
  color: var(--varianza-navy);
  font-size: 1.35rem;
  font-weight: 800;
  margin: 0 0 1rem;
}

.index-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.index-list a {
  display: block;
  font-size: 0.92rem;
  color: #334155;
  text-decoration: none;
  padding: 0.45rem 0.75rem;
  border-radius: 6px;
  line-height: 1.4;
  transition: color 0.18s ease, background 0.18s ease;
}

.index-list a:hover {
  background: rgba(245, 0, 136, 0.08);
  color: var(--varianza-pink);
  font-weight: 700;
}

.varianza-guidelines__content {
  display: flex;
  flex-direction: column;
  gap: 2.25rem;
}

.guideline-entry {
  scroll-margin-top: calc(var(--header-height) + 1.5rem);
}

.guideline-entry__title {
  color: var(--varianza-navy);
  font-size: 1.4rem;
  font-weight: 800;
  margin: 0 0 0.85rem;
}

.guideline-raw-content {
  color: #334155;
  font-size: 0.96rem;
  line-height: 1.7;
}

.guideline-raw-content :deep(p) {
  margin: 0 0 1rem;
}

.guideline-raw-content :deep(h4) {
  color: var(--varianza-navy);
  font-size: 1.05rem;
  font-weight: 800;
  margin: 1.25rem 0 0.35rem;
}

.guideline-contact-box {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: #f8f9fd;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.guideline-contact-box p {
  margin: 0 0 0.85rem;
  font-weight: 700;
  color: var(--varianza-navy);
}

.varianza-guidelines__external {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--varianza-pink);
  font-weight: 800;
  font-size: 0.92rem;
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

.varianza-resource-state {
  display: grid;
  place-content: center;
  min-height: 8rem;
  color: #64748b;
  font-size: 0.95rem;
}

.retry-button {
  margin-top: 0.75rem;
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  border: 1px solid var(--varianza-navy);
  background: var(--varianza-navy);
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;
}

/* Responsive */
@media (max-width: 1024px) {
  .varianza-authors-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .varianza-issues__list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .varianza-about__inner {
    grid-template-columns: 1fr;
  }

  .varianza-committee-header,
  .varianza-authors-intro {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .varianza-committee-desc,
  .varianza-authors-intro > p {
    text-align: left;
  }

  .varianza-group-grid {
    grid-template-columns: 1fr;
  }

  .varianza-current-issue-card {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .varianza-current-issue-card__media {
    max-width: 14rem;
    margin-inline: auto;
  }

  .current-issue-specs {
    grid-template-columns: 1fr;
  }

  .current-issue-actions {
    justify-content: center;
  }

  .all-editions-filters {
    flex-direction: column;
  }

  .filter-field--year {
    width: 100%;
  }

  .varianza-guidelines__layout {
    grid-template-columns: 1fr;
  }

  .varianza-guidelines__index {
    position: static;
  }

  .author-filters-row {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 640px) {
  .varianza-authors-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .varianza-authors-list {
    grid-template-columns: 1fr;
  }
}
</style>
