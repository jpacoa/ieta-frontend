<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import {
  Compass,
  Eye,
  FileText,
  GraduationCap,
  Sparkles,
  Target,
  Users,
} from '@lucide/vue'
import ContentCard from '@/components/common/ContentCard.vue'
import EditorJsContent from '@/components/common/EditorJsContent.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import LoadMoreButton from '@/components/common/LoadMoreButton.vue'
import TabNav from '@/components/common/TabNav.vue'
import SectionHeaderBand from '@/components/layout/SectionHeaderBand.vue'
import { SobreNosotrosRepository } from '@/api/repositories.js'
import { PersonalRepository } from '@/api/repositories.js'
import type { StaffApiItem } from '@/api/types'
import { mediaUrl } from '@/api/response'
import { usePaginatedResource } from '@/composables/usePaginatedResource'
import { useGsapReveal } from '@/composables/useGsapReveal'

interface AboutContent {
  id: number
  mision: string
  vision: string
  historia: string
  objetivos: unknown
  contenido: unknown
}

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const aboutRoot = ref<HTMLElement | null>(null)

const tabs = computed(() => [
  { value: 'quienes-somos', label: t('tabs.whoWeAre') },
  { value: 'mision-vision', label: t('tabs.missionVision') },
  { value: 'objetivos', label: t('tabs.objectives') },
  { value: 'personal', label: t('tabs.staff') },
  { value: 'reglamento', label: t('tabs.regulations') },
])

const activeTab = computed({
  get() {
    const routeTab = route.params.tab
    return typeof routeTab === 'string' && tabs.value.some((tab) => tab.value === routeTab)
      ? routeTab
      : 'quienes-somos'
  },
  set(tab: string) {
    void router.replace({
      name: 'acerca-de',
      params: { tab: tab === 'quienes-somos' ? undefined : tab },
    })
  },
})

const content = ref<AboutContent | null>(null)
const staffResource = usePaginatedResource<StaffApiItem>((page) => PersonalRepository.list({ page }))
const loading = ref(true)
const error = ref(false)
const apiBaseUrl = import.meta.env.VITE_API_URL

useGsapReveal(aboutRoot, {
  selector: '.about-reveal',
  stagger: 0.08,
  y: 18,
})

async function loadAboutContent() {
  loading.value = true
  error.value = false

  try {
    content.value = (await SobreNosotrosRepository.get()) as AboutContent
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

async function loadStaff() {
  await staffResource.refresh()
}

onMounted(() => {
  void loadAboutContent()
  void loadStaff()
})
</script>

<template>
  <div ref="aboutRoot">
    <SectionHeaderBand
      title="Acerca de"
      subtitle="Identidad, trayectoria, objetivos y el equipo humano del IETA."
    />

    <div class="container view-body">
      <!-- Tabs Navigation -->
      <div class="tabs-wrapper about-reveal">
        <TabNav v-model="activeTab" :items="tabs" :label="t('aria.aboutSections')" />
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="about-skeleton" role="status" aria-live="polite">
        <div class="skeleton-line skeleton-line--title"></div>
        <div class="skeleton-box"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="content-state" role="alert">
        <EmptyState
          title="No se pudo cargar la información institucional"
          description="Ocurrió un error al consultar los datos de Acerca de."
          action-label="Reintentar"
          @action="loadAboutContent"
        />
      </div>

      <template v-else-if="content">
        <Transition name="tab-panel-fade" mode="out-in">
          <div :key="activeTab" class="about-tab-panel-wrap">
            <!-- 1. QUIÉNES SOMOS (PDF Page 1) -->
            <section v-if="activeTab === 'quienes-somos'" class="about-panel about-panel--full">
          <!-- Top Centered Intro -->
          <div class="container about-intro-section">
            <h2 class="about-intro-title">Instituto de Estadística Teórica y Aplicada</h2>
            <p class="about-intro-lead">
              El Instituto de Estadística Teórica y Aplicada tiene el objetivo de incentivar e innovar la investigación e interacción social en estudiantes y docentes sabiendo que la estadística se constituye en una ciencia científica transversal de uso y aplicación a todas las ciencias del conocimiento humano.
            </p>

            <!-- Video / Multimedia Showcase Box -->
            <div class="about-video-box">
              <div class="about-video-banner">
                <span class="about-video-banner__title">ÚLTIMAS DOS EDICIONES DE LA REVISTA VARIANZA</span>
                <span class="about-video-banner__sub">Nro 25 Y 26</span>
              </div>
              <div class="about-video-preview">
                <div class="about-video-play-btn" aria-label="Reproducir presentación">
                  <div class="play-triangle"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Full-Width Dark Historia Banner (PDF Page 1) -->
          <div class="about-history-banner">
            <div class="container about-history-banner__inner">
              <div class="about-history-banner__text">
                <h2 class="about-history-banner__title">Historia</h2>
                <div v-if="content.historia">
                  <EditorJsContent :content="content.historia" :api-base-url="apiBaseUrl" />
                </div>
                <div v-else class="about-history-copy">
                  <p>
                    Un martes 1ro octubre de 1985, en la gestión del rector Lic. Pablo Ramos Sánchez, el decano Lic. Luis Zapata Escobar y el jefe de carrera, Lic. Raúl Marquiagui Navarro, crean el Instituto de Estadística Teórica y Aplicada (IETA) con el objetivo de incentivar e innovar la investigación e interacción social en estudiantes y docentes sabiendo que la estadística se constituye en una ciencia científica transversal de uso y aplicación a todas las ciencias del conocimiento humano.
                  </p>
                  <p>
                    Ese mismo año se iniciaron los trámites para el reconocimiento del instituto por la comisión académica universitaria (CAU) de la UMSA; sin embargo, los estatutos y reglamentos del IETA fueron presentados recién el año 1993 para su aprobación y reconocimiento ante el Honorable Consejo Universitario, pero es el 7 de julio de 1994 cuando se promulga la Resolución N° 082/94 del HCU, a través de la cual se reconoce la creación del IETA y se aprueban sus reglamentos de funcionamiento interno.
                  </p>
                  <p>
                    El director del instituto es elegido por claustro y con base en normas universitarias cada tres años y su actividad principal es de promover la investigación en estadística a favor de la Universidad Mayor de San Andrés y la sociedad. Las actividades de investigación e interacción social están integradas en el IETA.
                  </p>
                </div>
              </div>

              <!-- Right: Founders Photos -->
              <div class="about-history-banner__founders">
                <div class="founder-card">
                  <div class="founder-card__avatar founder-card__avatar--raul">
                    <span class="founder-initials">RM</span>
                  </div>
                  <span class="founder-card__name">M. Sc. Raúl Marquiagui Navarro</span>
                </div>

                <div class="founder-card">
                  <div class="founder-card__avatar founder-card__avatar--luis">
                    <span class="founder-initials">LZ</span>
                  </div>
                  <span class="founder-card__name">M. Sc. Luis Zapata Escobar</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Centered Section: Investigación en el IETA (PDF Page 1) -->
          <div class="container about-research-section">
            <h2 class="about-research-title">Investigación en el IETA</h2>
            <div v-if="content.contenido">
              <EditorJsContent :content="content.contenido" :api-base-url="apiBaseUrl" />
            </div>
            <div v-else class="about-research-copy">
              <p>
                Los proyectos desarrollados por el IETA son bajo recursos propios enmarcados en el análisis de la estadística, fuente primordial de aquellas investigaciones que requieren del análisis cualitativo y cuantitativo de la información estadística para la toma de decisiones en planes, proyectos, programas de desarrollo social y económico.
              </p>
              <p>
                Los docentes y estudiantes de la carrera participan como investigadores dentro de las líneas de investigación determinadas, que también desarrollan sus propias investigaciones.
              </p>
              <p>
                Actualmente las oficinas del IETA se encuentran en el primer piso del bloque FCPN en los ambientes de Cota Cota.
              </p>
            </div>
          </div>
        </section>

        <!-- 2. MISIÓN Y VISIÓN (PDF Page 1 & User requirement: con imagen o icono alusivo) -->
        <section v-else-if="activeTab === 'mision-vision'" class="about-panel about-panel--wide about-reveal">
          <header class="panel-header panel-header--centered">
            <span class="panel-eyebrow">PROPÓSITO INSTITUCIONAL</span>
            <h2 class="panel-title">Misión y Visión Estratégica</h2>
            <p class="panel-lead">Fundamentos que guían la excelencia estadística y el compromiso científico del IETA.</p>
          </header>

          <div class="mission-vision-grid">
            <!-- Misión Card -->
            <article class="mv-card mv-card--mission">
              <div class="mv-card__header-visual">
                <div class="mv-card__icon-badge">
                  <Target :size="32" aria-hidden="true" />
                </div>
                <div class="mv-card__graphic-tag">PROPÓSITO CIENTÍFICO</div>
              </div>
              <div class="mv-card__body">
                <h3 class="mv-card__title">{{ t('about.missionHeading') }}</h3>
                <p class="mv-card__text">
                  {{ content.mision || 'Desarrollar y promover la investigación científica en estadística teórica y aplicada, generando metodologías rigurosas, transferencia de conocimiento e interacción social para responder a las problemáticas del desarrollo nacional.' }}
                </p>
              </div>
            </article>

            <!-- Visión Card -->
            <article class="mv-card mv-card--vision">
              <div class="mv-card__header-visual">
                <div class="mv-card__icon-badge">
                  <Eye :size="32" aria-hidden="true" />
                </div>
                <div class="mv-card__graphic-tag">PROYECCIÓN AL FUTURO</div>
              </div>
              <div class="mv-card__body">
                <h3 class="mv-card__title">{{ t('about.visionHeading') }}</h3>
                <p class="mv-card__text">
                  {{ content.vision || 'Consolidarse como el centro de referencia y excelencia en investigación estadística y ciencia de datos a nivel nacional e internacional, reconocido por la calidad de sus publicaciones, aportes metodológicos y liderazgo académico.' }}
                </p>
              </div>
            </article>
          </div>
        </section>

        <!-- 3. OBJETIVOS (con iconos y soporte visual) -->
        <section v-else-if="activeTab === 'objetivos'" class="about-panel about-panel--wide about-reveal">
          <header class="panel-header panel-header--centered">
            <span class="panel-eyebrow">METAS INSTITUCIONALES</span>
            <h2 class="panel-title">{{ t('tabs.objectives') }}</h2>
            <p class="panel-lead">Lineamientos operativos y metas estratégicas del Instituto.</p>
          </header>

          <div v-if="content.objetivos" class="about-card objectives-box">
            <EditorJsContent :content="content.objetivos" :api-base-url="apiBaseUrl" />
          </div>
          <div v-else class="objectives-grid">
            <article class="objective-card">
              <div class="objective-card__icon"><Sparkles :size="24" /></div>
              <h3 class="objective-card__title">Investigación de Excelencia</h3>
              <p class="objective-card__text">Promover investigaciones teóricas y empíricas que enriquezcan la disciplina estadística y resuelvan problemas complejos.</p>
            </article>
            <article class="objective-card">
              <div class="objective-card__icon"><GraduationCap :size="24" /></div>
              <h3 class="objective-card__title">Formación Continua</h3>
              <p class="objective-card__text">Fomentar la capacitación de docentes, investigadores y estudiantes en herramientas analíticas avanzadas y ciencia de datos.</p>
            </article>
            <article class="objective-card">
              <div class="objective-card__icon"><Users :size="24" /></div>
              <h3 class="objective-card__title">Interacción Social</h3>
              <p class="objective-card__text">Articular la producción científica con instituciones públicas y privadas para la formulación de políticas basadas en evidencia.</p>
            </article>
          </div>
        </section>

        <!-- 4. PERSONAL IETA -->
        <section v-else-if="activeTab === 'personal'" class="about-panel about-panel--wide about-reveal">
          <header class="panel-header">
            <span class="panel-eyebrow">EQUIPO HUMANO Y DOCENTE</span>
            <h2 class="panel-title">Comunidad de Investigadores y Docentes</h2>
            <p class="panel-lead">Profesionales que impulsan la estadística teórica y aplicada en la UMSA.</p>
          </header>

          <div
            v-if="staffResource.loading.value && staffResource.items.value.length === 0"
            class="staff-skeleton-grid"
            role="status"
          >
            <div v-for="n in 6" :key="n" class="skeleton-staff-card"></div>
          </div>

          <div
            v-else-if="staffResource.error.value && staffResource.items.value.length === 0"
            class="content-state"
            role="alert"
          >
            <EmptyState
              title="No se pudo cargar el listado de personal"
              description="Por favor, inténtalo de nuevo."
              action-label="Reintentar"
              @action="loadStaff"
            />
          </div>

          <div v-else-if="staffResource.items.value.length" class="staff-grid">
            <ContentCard
              v-for="member in staffResource.items.value.filter((person) => person.estado !== false)"
              :key="member.id"
              type="investigacion"
              :title="member.persona?.nombre_completo || [member.persona?.p_nombre, member.persona?.p_apellido_paterno, member.persona?.p_apellido_materno].filter(Boolean).join(' ') || 'Personal IETA'"
              :eyebrow="member.cargo?.nombre || t('tabs.staff')"
              :summary="member.descripcion || undefined"
              :image="mediaUrl(member.persona?.foto_url)"
              :image-alt="member.persona?.nombre_completo || t('tabs.staff')"
              :to="`/acerca-de/personal/${member.id}`"
            />
          </div>

          <EmptyState
            v-else
            title="No hay personal registrado"
            description="El directorio de personal se encuentra en actualización."
          />

          <div class="staff-pagination">
            <LoadMoreButton
              :loading="staffResource.loadingMore.value"
              :has-more="staffResource.hasMore.value"
              @load="staffResource.loadMore"
            />
          </div>
        </section>

        <!-- 5. REGLAMENTO -->
        <section v-else-if="activeTab === 'reglamento'" class="about-panel about-reveal">
          <header class="panel-header">
            <span class="panel-eyebrow">NORMATIVA INSTITUCIONAL</span>
            <h2 class="panel-title">{{ t('tabs.regulations') }}</h2>
          </header>

          <div class="about-card regulation-card">
            <div class="card-icon-badge">
              <FileText :size="22" aria-hidden="true" />
            </div>
            <div class="card-body">
              <h3 class="card-subtitle">Reglamento Interno del IETA</h3>
              <p>
                El Instituto de Estadística Teórica y Aplicada se rige bajo los estatutos orgánicos de la Universidad Mayor de San Andrés y la Facultad de Ciencias Puras y Naturales.
              </p>
              <div v-if="content.contenido">
                <EditorJsContent :content="content.contenido" :api-base-url="apiBaseUrl" />
              </div>
            </div>
          </div>
        </section>

        <EmptyState
          v-else
          :title="t('about.sectionUnavailable')"
          :description="t('about.sectionUnavailableDescription')"
        />
          </div>
        </Transition>
      </template>

      <EmptyState v-else :title="t('common.noResults')" />
    </div>
  </div>
</template>

<style scoped>
.view-body {
  padding-block: var(--space-4) var(--space-8);
  min-height: 48vh;
}

.tabs-wrapper {
  margin-bottom: var(--space-4);
}

.about-panel {
  max-width: 78ch;
  margin-inline: auto;
  padding-block: var(--space-2);
}

.about-tab-panel-wrap {
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

.about-panel--wide {
  max-width: 100%;
}

.about-panel--full {
  max-width: 100%;
  margin-inline: 0;
  padding-block: 0;
}

/* 1. Quiénes Somos (PDF Page 1) */
.about-intro-section {
  max-width: 860px;
  margin-inline: auto;
  text-align: center;
  padding-top: var(--space-4);
  margin-bottom: 3.5rem;
}

.about-intro-title {
  font-size: clamp(1.8rem, 3.2vw, 2.5rem);
  font-weight: 700;
  color: #1b144b;
  margin-bottom: 1.25rem;
  line-height: 1.2;
}

.about-intro-lead {
  font-size: 1.05rem;
  line-height: 1.75;
  color: #444b62;
  margin-bottom: 2.25rem;
}

.about-video-box {
  max-width: 540px;
  margin-inline: auto;
  border: 1px solid rgba(220, 224, 235, 0.9);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: 0 12px 36px rgba(27, 20, 75, 0.08);
  background: #fff;
}

.about-video-banner {
  background: #fff;
  padding: 0.65rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  border-bottom: 1px solid #edf0f5;
}

.about-video-banner__title {
  font-size: 0.72rem;
  font-weight: 800;
  color: #b52222;
  letter-spacing: 0.06em;
}

.about-video-banner__sub {
  font-size: 0.75rem;
  font-weight: 800;
  color: #35449f;
}

.about-video-preview {
  position: relative;
  height: 18rem;
  background: linear-gradient(135deg, #d3cbbd 0%, #e8d0b5 50%, #b8d0ea 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.about-video-play-btn {
  width: 4.5rem;
  height: 4.5rem;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s ease;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.about-video-play-btn:hover {
  transform: scale(1.08);
  background: rgba(243, 0, 96, 0.9);
}

.play-triangle {
  width: 0;
  height: 0;
  border-top: 12px solid transparent;
  border-bottom: 12px solid transparent;
  border-left: 20px solid #fff;
  margin-left: 4px;
}

/* Full Width Dark Historia Banner */
.about-history-banner {
  background: #2b1b6d;
  color: #fff;
  padding-block: clamp(3rem, 5vw, 4.5rem);
  margin-block: 3.5rem;
}

.about-history-banner__inner {
  display: grid;
  grid-template-columns: 1.25fr 0.75fr;
  gap: clamp(2rem, 4vw, 4.5rem);
  align-items: center;
}

.about-history-banner__title {
  font-size: clamp(2rem, 3.5vw, 2.75rem);
  font-weight: 700;
  color: #fff;
  margin-bottom: 1.25rem;
}

.about-history-copy {
  color: rgba(255, 255, 255, 0.92);
  font-size: 0.98rem;
  line-height: 1.75;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.about-history-banner__founders {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
}

.founder-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
  width: 100%;
  max-width: 280px;
}

.founder-card__avatar {
  width: 100%;
  height: 10rem;
  border-radius: var(--radius-sm);
  border: 3px solid rgba(255, 255, 255, 0.22);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.3);
}

.founder-card__avatar--raul {
  background: linear-gradient(135deg, #44567e, #273148);
}

.founder-card__avatar--luis {
  background: linear-gradient(135deg, #5b4776, #322349);
}

.founder-initials {
  color: rgba(255, 255, 255, 0.35);
  font-size: 2.75rem;
  font-weight: 800;
  letter-spacing: 0.05em;
}

.founder-card__name {
  color: #fff;
  font-size: 0.88rem;
  font-weight: 700;
}

/* Bottom Centered Research Section */
.about-research-section {
  max-width: 860px;
  margin-inline: auto;
  text-align: center;
  padding-block: 2.5rem 4rem;
}

.about-research-title {
  font-size: clamp(1.6rem, 2.8vw, 2.2rem);
  font-weight: 700;
  color: #1b144b;
  margin-bottom: 1.25rem;
}

.about-research-copy {
  color: #444b62;
  font-size: 1rem;
  line-height: 1.75;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Panel Header Centered */
.panel-header--centered {
  text-align: center;
  max-width: 720px;
  margin-inline: auto;
}

/* Objectives Grid */
.objectives-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: clamp(1rem, 2.5vw, 1.75rem);
  margin-top: var(--space-4);
}

.objective-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: clamp(1.25rem, 2.5vw, 1.75rem);
  border: 1px solid var(--color-desactivado);
  border-radius: var(--radius-md);
  background: var(--color-blanco);
  box-shadow: 0 4px 18px rgba(27, 20, 75, 0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.objective-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px -4px rgba(27, 20, 75, 0.08);
}

.objective-card__icon {
  width: 3rem;
  height: 3rem;
  border-radius: var(--radius-sm);
  background: rgba(53, 68, 159, 0.08);
  color: var(--color-indigo);
  display: grid;
  place-items: center;
}

.objective-card__title {
  color: #1b144b;
  font-size: 1.1rem;
  font-weight: 700;
}

.objective-card__text {
  color: #4b5268;
  font-size: 0.95rem;
  line-height: 1.6;
}

/* Mission & Vision Visuals */
.mv-card__header-visual {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.mv-card__icon-badge {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: var(--radius-md);
  background: rgba(53, 68, 159, 0.08);
  color: var(--color-indigo);
  display: grid;
  place-items: center;
}

.mv-card--vision .mv-card__icon-badge {
  background: rgba(243, 0, 96, 0.08);
  color: var(--color-rosa-carmin);
}

.mv-card__graphic-tag {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: #6d758d;
}

/* Panel Header */
.panel-header {
  margin-bottom: var(--space-4);
  text-align: left;
}

.panel-eyebrow {
  display: inline-block;
  color: var(--color-rosa-carmin);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  margin-bottom: 0.35rem;
}

.panel-title {
  color: var(--color-indigo);
  font-size: clamp(1.6rem, 3.5vw, 2.25rem);
  font-weight: 700;
  line-height: 1.22;
}

.panel-lead {
  color: #555c73;
  font-size: var(--text-large-size);
  margin-top: 0.4rem;
}

/* About Cards */
.about-card {
  padding: clamp(1.25rem, 3vw, 2rem);
  border: 1px solid var(--color-desactivado);
  border-radius: var(--radius-md);
  background: var(--color-blanco);
  box-shadow: 0 4px 16px rgba(20, 22, 28, 0.04);
  margin-bottom: var(--space-4);
}

.history-card,
.regulation-card {
  display: flex;
  gap: var(--space-3);
  align-items: flex-start;
}

.card-icon-badge {
  display: grid;
  width: 3rem;
  height: 3rem;
  place-items: center;
  border-radius: var(--radius-sm);
  background: rgba(53, 68, 159, 0.08);
  color: var(--color-indigo);
  flex-shrink: 0;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  line-height: 1.7;
}

.card-subtitle {
  color: var(--color-indigo);
  font-size: var(--text-h5-size);
  font-weight: 700;
}

/* Mission & Vision Grid */
.mission-vision-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(1rem, 3vw, 2rem);
  margin-top: var(--space-2);
}

.mv-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: clamp(1.5rem, 3vw, 2.25rem);
  border: 1px solid var(--color-desactivado);
  border-radius: var(--radius-md);
  background: var(--color-blanco);
  box-shadow: 0 4px 18px rgba(20, 22, 28, 0.05);
  overflow: hidden;
  transition: transform 0.22s ease, box-shadow 0.22s ease;
}

.mv-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 24px -4px rgba(20, 22, 28, 0.09);
}

.mv-card__accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.mv-card--mission .mv-card__accent {
  background: var(--color-indigo);
}

.mv-card--vision .mv-card__accent {
  background: var(--color-rosa-carmin);
}

.mv-card__icon-box {
  display: grid;
  width: 3.5rem;
  height: 3.5rem;
  place-items: center;
  border-radius: 50%;
  background: var(--color-superficie);
  color: var(--color-indigo);
}

.mv-card--vision .mv-card__icon-box {
  color: var(--color-rosa-carmin);
  background: rgba(243, 0, 96, 0.08);
}

.mv-card__title {
  color: var(--color-indigo);
  font-size: var(--text-h5-size);
  font-weight: 700;
}

.mv-card__text {
  color: #3b4258;
  font-size: var(--text-body-size);
  line-height: 1.7;
}

/* Staff Grid */
.staff-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(1rem, 2.5vw, 1.75rem);
  margin-top: var(--space-3);
}

.staff-pagination {
  display: flex;
  justify-content: center;
  margin-top: var(--space-6);
}

/* Skeletons */
.about-skeleton {
  max-width: 78ch;
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem 0;
}

.skeleton-box {
  height: 18rem;
  border-radius: var(--radius-md);
  background: #edeef5;
}

.staff-skeleton-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.skeleton-staff-card {
  height: 16rem;
  border-radius: var(--radius-md);
  background: #edeef5;
}

.content-state {
  display: grid;
  min-height: 20rem;
  align-content: center;
  text-align: center;
}

@media (max-width: 960px) {
  .staff-grid,
  .staff-skeleton-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .mission-vision-grid {
    grid-template-columns: 1fr;
  }
  .staff-grid,
  .staff-skeleton-grid {
    grid-template-columns: 1fr;
  }
  .history-card,
  .regulation-card {
    flex-direction: column;
  }
}
</style>
