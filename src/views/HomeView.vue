<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Code2,
  Database,
  ExternalLink,
  FlaskConical,
  GraduationCap,
  Layers,
  School,
} from '@lucide/vue'
import { RouterLink } from 'vue-router'
import ContentCard from '@/components/common/ContentCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import HomeHero from '@/components/home/HomeHero.vue'
import HomeSectionHeading from '@/components/home/HomeSectionHeading.vue'
import {
  courseTitle,
  courseType,
  formatApiDate,
  newsDate,
  newsIsFeatured,
  newsIsPublished,
  newsSummary,
  newsTitle,
} from '@/api/normalizers'
import { mediaUrl } from '@/api/response'
import { CursosRepository, NoticiasRepository } from '@/api/repositories.js'
import type { CourseApiItem, NewsApiItem } from '@/api/types'
import { useI18n } from 'vue-i18n'
import { usePaginatedResource } from '@/composables/usePaginatedResource'
import { useGsapReveal } from '@/composables/useGsapReveal'
import { homePresentation } from '@/data/home-presentation'

const { t } = useI18n()
const homeRoot = ref<HTMLElement | null>(null)
const institutionalTrack = ref<HTMLElement | null>(null)
const resourcesTrack = ref<HTMLElement | null>(null)
const courseResource = usePaginatedResource<CourseApiItem>((page) => CursosRepository.list({ page }))
const newsResource = usePaginatedResource<NewsApiItem>((page) => NoticiasRepository.list({ page }))

useGsapReveal(homeRoot, {
  selector: '.home-reveal',
  stagger: 0.08,
  y: 20,
})

const {
  items: courseItems,
  loading: coursesLoading,
  error: coursesError,
  isEmpty: coursesEmpty,
  refresh: refreshCourses,
} = courseResource
const {
  items: newsItems,
  loading: newsLoading,
  error: newsError,
  isEmpty: newsEmpty,
  refresh: refreshNews,
} = newsResource

const featuredCourses = computed(() =>
  courseItems.value.filter((course) => course.activo !== false).slice(0, 2),
)
const recentNews = computed(() =>
  newsItems.value
    .filter(newsIsPublished)
    .sort((first, second) => {
      const featuredDifference = Number(newsIsFeatured(second)) - Number(newsIsFeatured(first))
      if (featuredDifference) return featuredDifference
      return new Date(newsDate(second)).getTime() - new Date(newsDate(first)).getTime()
    })
    .slice(0, 3),
)

// Friendly Quick Access Cards (Directly beneath Hero)
const quickAccessCards = [
  {
    number: '01',
    label: 'Líneas de investigación',
    desc: 'Ejes temáticos, métodos probabilísticos y líneas activas del IETA.',
    to: '/investigacion/lineas-investigacion',
    icon: FlaskConical,
    tone: 'purple',
  },
  {
    number: '02',
    label: 'Revista Varianza',
    desc: 'Publicación científica indexada con artículos originales y referato.',
    to: '/revista-varianza',
    icon: BookOpen,
    tone: 'pink',
  },
  {
    number: '03',
    label: 'Servicios estadísticos',
    desc: 'Consultoría, análisis de datos y asesoría técnica para proyectos.',
    to: '/servicios',
    icon: Briefcase,
    tone: 'blue',
  },
  {
    number: '04',
    label: 'Banco de datos',
    desc: 'Microdatos, censos y encuestas disponibles para investigación.',
    to: '/recursos',
    icon: Database,
    tone: 'emerald',
  },
]

// Carousel 1: Enlaces de Interés (Institucionales)
const institutionalLinks = [
  { name: 'UMSA', label: 'Universidad Mayor de San Andrés', url: 'https://www.umsa.bo', tag: 'UNIVERSIDAD' },
  { name: 'FCPN', label: 'Facultad de Ciencias Puras y Naturales', url: 'https://fcpn.umsa.bo', tag: 'FACULTAD' },
  { name: 'Carrera de Estadística', label: 'Carrera de Estadística — UMSA', url: 'https://estadistica.umsa.bo', tag: 'CARRERA' },
  { name: 'CEIES', label: 'Centro de Estudiantes de Estadística', url: 'https://www.facebook.com/ceies.umsa', tag: 'ESTUDIANTIL' },
  { name: 'DIPGIS', label: 'Dirección de Investigación y Posgrado', url: 'https://dipgis.umsa.bo', tag: 'INVESTIGACIÓN' },
  { name: 'Biblioteca Central', label: 'Repositorio Institucional UMSA', url: 'https://repositorio.umsa.bo', tag: 'REPOSITORIO' },
]

// Carousel 2: Enlaces de Recursos Estadísticos (Herramientas y Software)
const statisticalResources = [
  { name: 'Python', desc: 'Ecosistema NumPy, SciPy, Pandas y Scikit-Learn', url: 'https://www.python.org', tag: 'LENGUAJE' },
  { name: 'R Project', desc: 'Computación estadística, CRAN y gráficos de alta calidad', url: 'https://www.r-project.org', tag: 'SOFTWARE' },
  { name: 'Posit / RStudio', desc: 'Entorno integral para ciencia de datos y reproducibilidad', url: 'https://posit.co', tag: 'IDE' },
  { name: 'Julia Language', desc: 'Computación numérica de alto rendimiento para inferencia', url: 'https://julialang.org', tag: 'LENGUAJE' },
  { name: 'Stan', desc: 'Modelación estadística bayesiana e inferencia MCMC', url: 'https://mc-stan.org', tag: 'BAYESIANO' },
  { name: 'INE Bolivia', desc: 'Instituto Nacional de Estadística del Estado Plurinacional', url: 'https://www.ine.gob.bo', tag: 'OFICIAL' },
]

function scrollTrack(trackRef: HTMLElement | null, direction: 'left' | 'right') {
  if (!trackRef) return
  const amount = 340
  trackRef.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' })
}

function coursePath(course: CourseApiItem) {
  return `/cursos-talleres/${encodeURIComponent(course.slug || String(course.id))}`
}

onMounted(() => {
  void Promise.all([refreshCourses(), refreshNews()])
})
</script>

<template>
  <main ref="homeRoot" class="home-view">
    <!-- Hero Banner with Branding & Multi-slide Mockup -->
    <HomeHero v-bind="homePresentation.hero" />

    <!-- 1. ACCESOS RÁPIDOS (Directamente debajo del Hero, diseño amigable) -->
    <section class="home-view__quick-access home-reveal" aria-labelledby="home-quick-access">
      <div class="container">
        <div class="friendly-access-grid">
          <RouterLink
            v-for="item in quickAccessCards"
            :key="item.number"
            :to="item.to"
            class="friendly-card"
            :class="`friendly-card--${item.tone}`"
          >
            <div class="friendly-card__header">
              <div class="friendly-card__icon-box">
                <component :is="item.icon" :size="24" aria-hidden="true" />
              </div>
              <span class="friendly-card__num">{{ item.number }}</span>
            </div>

            <div class="friendly-card__body">
              <h3 class="friendly-card__title">{{ item.label }}</h3>
              <p class="friendly-card__desc">{{ item.desc }}</p>
            </div>

            <div class="friendly-card__footer">
              <span class="friendly-card__action">Ingresar</span>
              <ArrowUpRight :size="16" class="friendly-card__arrow" />
            </div>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- 2. Cursos y Talleres Destacados -->
    <section class="home-view__section home-view__section--courses home-reveal" aria-labelledby="home-courses">
      <div class="container">
        <HomeSectionHeading
          id="home-courses"
          eyebrow="Formación continua y capacitación"
          title="Cursos y Talleres"
          :link-label="featuredCourses.length ? 'Ver todos los cursos' : undefined"
          :link-to="featuredCourses[0] ? coursePath(featuredCourses[0]) : undefined"
        />

        <div v-if="featuredCourses.length" class="home-view__course-grid">
          <div v-for="course in featuredCourses" :key="course.id" class="course-card-wrap">
            <ContentCard
              type="curso"
              :title="courseTitle(course)"
              :eyebrow="courseType(course)"
              :summary="course.descripcion ?? undefined"
              :date="formatApiDate(course.fecha_inicio)"
              :image="mediaUrl(course.portada_url)"
              :image-alt="courseTitle(course)"
              :to="coursePath(course)"
            />
          </div>
        </div>

        <div v-if="coursesLoading" class="home-view__skeleton-grid" role="status">
          <div v-for="n in 2" :key="n" class="skeleton-card skeleton-card--course"></div>
        </div>

        <EmptyState
          v-else-if="coursesError && courseItems.length === 0"
          title="No se pudieron cargar los cursos"
          description="Vuelve a intentarlo en unos momentos."
          :action-label="t('common.tryAgain')"
          @action="refreshCourses"
        />
        <EmptyState
          v-else-if="coursesEmpty"
          title="No hay cursos abiertos actualmente"
          description="Los próximos cursos y talleres del instituto aparecerán en esta sección."
        />
      </div>
    </section>

    <!-- 3. Últimas Noticias y Divulgación -->
    <section class="home-view__section home-view__section--news home-reveal" aria-labelledby="home-news">
      <div class="container">
        <HomeSectionHeading
          id="home-news"
          eyebrow="Actualidad e investigación"
          title="Últimas Noticias"
          link-label="Ver todas las noticias"
          link-to="/noticias"
        />

        <div v-if="recentNews.length" class="home-view__news-grid">
          <div v-for="(article, index) in recentNews" :key="article.id" class="news-card-wrap">
            <ContentCard
              type="noticia"
              :title="newsTitle(article)"
              :eyebrow="newsIsFeatured(article) ? 'Destacada' : 'Actualidad'"
              :summary="newsSummary(article)"
              :date="formatApiDate(newsDate(article))"
              :image="mediaUrl(article.portada_url)"
              :image-alt="newsTitle(article)"
              :image-loading="index === 0 ? 'eager' : 'lazy'"
              :to="`/noticias/${article.id}`"
            />
          </div>
        </div>

        <div v-if="newsLoading" class="home-view__skeleton-grid home-view__skeleton-grid--3" role="status">
          <div v-for="n in 3" :key="n" class="skeleton-card"></div>
        </div>

        <EmptyState
          v-else-if="newsError && newsItems.length === 0"
          title="No se pudieron cargar las noticias"
          description="Vuelve a intentarlo en unos momentos."
          action-label="Reintentar"
          @action="refreshNews"
        />
        <EmptyState
          v-else-if="newsEmpty"
          title="No hay noticias publicadas"
          description="Las novedades institucionales del IETA aparecerán aquí."
        />
      </div>
    </section>

    <!-- 4. Carrusel 1: Enlaces de Interés (Institucionales) -->
    <section class="home-view__section home-view__section--carousel home-reveal" aria-labelledby="home-institutional">
      <div class="container">
        <div class="carousel-section-header">
          <div>
            <p class="carousel-eyebrow">RED ACADÉMICA Y UNIVERSITARIA</p>
            <h2 id="home-institutional" class="carousel-title">Enlaces de Interés</h2>
          </div>
          <div class="carousel-nav-btns">
            <button
              type="button"
              class="carousel-nav-btn"
              aria-label="Desplazar a la izquierda"
              @click="scrollTrack(institutionalTrack, 'left')"
            >
              <ChevronLeft :size="18" />
            </button>
            <button
              type="button"
              class="carousel-nav-btn"
              aria-label="Desplazar a la derecha"
              @click="scrollTrack(institutionalTrack, 'right')"
            >
              <ChevronRight :size="18" />
            </button>
          </div>
        </div>

        <div ref="institutionalTrack" class="logo-carousel-track">
          <a
            v-for="item in institutionalLinks"
            :key="item.name"
            :href="item.url"
            target="_blank"
            rel="noopener noreferrer"
            class="logo-link-card"
          >
            <div class="logo-link-card__badge">{{ item.tag }}</div>
            <h3 class="logo-link-card__name">{{ item.name }}</h3>
            <p class="logo-link-card__label">{{ item.label }}</p>
            <span class="logo-link-card__external">
              <span>Sitio oficial</span>
              <ExternalLink :size="13" />
            </span>
          </a>
        </div>
      </div>
    </section>

    <!-- 5. Carrusel 2: Recursos Estadísticos (Python, R, Julia, Stan, otros) -->
    <section class="home-view__section home-view__section--carousel home-view__section--alt-bg home-reveal" aria-labelledby="home-resources">
      <div class="container">
        <div class="carousel-section-header">
          <div>
            <p class="carousel-eyebrow">ECOSISTEMA CIENTÍFICO</p>
            <h2 id="home-resources" class="carousel-title">Recursos y Herramientas Estadísticas</h2>
          </div>
          <div class="carousel-nav-btns">
            <button
              type="button"
              class="carousel-nav-btn"
              aria-label="Desplazar a la izquierda"
              @click="scrollTrack(resourcesTrack, 'left')"
            >
              <ChevronLeft :size="18" />
            </button>
            <button
              type="button"
              class="carousel-nav-btn"
              aria-label="Desplazar a la derecha"
              @click="scrollTrack(resourcesTrack, 'right')"
            >
              <ChevronRight :size="18" />
            </button>
          </div>
        </div>

        <div ref="resourcesTrack" class="logo-carousel-track">
          <a
            v-for="res in statisticalResources"
            :key="res.name"
            :href="res.url"
            target="_blank"
            rel="noopener noreferrer"
            class="logo-link-card logo-link-card--resource"
          >
            <div class="logo-link-card__badge logo-link-card__badge--tool">{{ res.tag }}</div>
            <h3 class="logo-link-card__name">{{ res.name }}</h3>
            <p class="logo-link-card__label">{{ res.desc }}</p>
            <span class="logo-link-card__external">
              <span>Documentación</span>
              <ExternalLink :size="13" />
            </span>
          </a>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.home-view {
  overflow: clip;
}

.home-view__section {
  padding-block: clamp(var(--space-6), 6vw, var(--space-8));
}

.home-view__section--courses {
  background: var(--color-superficie);
}

.home-view__section--news {
  background: var(--color-blanco);
}

.home-view__section--carousel {
  background: var(--color-blanco);
}

.home-view__section--alt-bg {
  background: #f7f8fc;
}

/* Accesos Rápidos - Friendly Cards */
.home-view__access {
  padding-block: clamp(2rem, 4vw, 3rem);
  background: linear-gradient(180deg, #ffffff 0%, #f7f8fd 100%);
  border-bottom: 1px solid #eaedf6;
}

.friendly-access-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1.25rem;
  margin-top: 1.25rem;
}

.friendly-card {
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e4e7f2;
  text-decoration: none;
  transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s ease, border-color 0.22s ease;
  position: relative;
  overflow: hidden;
}

.friendly-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: transparent;
  transition: background-color 0.2s ease;
}

.friendly-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 28px rgba(30, 20, 80, 0.09);
  border-color: rgba(30, 20, 80, 0.16);
}

.friendly-card--purple:hover::before {
  background: #2b1b6d;
}

.friendly-card--pink:hover::before {
  background: #f30060;
}

.friendly-card--blue:hover::before {
  background: #35449f;
}

.friendly-card--emerald:hover::before {
  background: #0d9488;
}

.friendly-card__icon-box {
  display: grid;
  place-items: center;
  width: 2.85rem;
  height: 2.85rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  transition: transform 0.2s ease;
}

.friendly-card:hover .friendly-card__icon-box {
  transform: scale(1.08);
}

.friendly-card__icon-box--purple {
  background: rgba(43, 27, 109, 0.08);
  color: #2b1b6d;
}

.friendly-card__icon-box--pink {
  background: rgba(243, 0, 96, 0.09);
  color: #f30060;
}

.friendly-card__icon-box--blue {
  background: rgba(53, 68, 159, 0.09);
  color: #35449f;
}

.friendly-card__icon-box--emerald {
  background: rgba(13, 148, 136, 0.09);
  color: #0d9488;
}

.friendly-card__content {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.friendly-card__title {
  font-size: 1.08rem;
  font-weight: 800;
  color: #1b144b;
  margin: 0 0 0.35rem;
  line-height: 1.3;
}

.friendly-card__desc {
  font-size: 0.85rem;
  color: #5c627a;
  line-height: 1.45;
  margin: 0 0 1rem;
  flex-grow: 1;
}

.friendly-card__action {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.82rem;
  font-weight: 700;
  color: #f30060;
  transition: gap 0.2s ease;
}

.friendly-card:hover .friendly-card__action {
  gap: 0.55rem;
}

/* Grids for Courses & News */
.home-view__course-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(1rem, 2.5vw, 2rem);
  margin-top: var(--space-3);
}

.course-card-wrap,
.news-card-wrap {
  display: flex;
}

.course-card-wrap :deep(.content-card),
.news-card-wrap :deep(.content-card) {
  width: 100%;
}

.home-view__news-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(1rem, 2.5vw, 1.75rem);
  margin-top: var(--space-3);
}

/* Carousel Section Styles */
.carousel-section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.carousel-eyebrow {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #f30060;
  margin: 0 0 0.25rem;
}

.carousel-title {
  font-size: clamp(1.35rem, 2.5vw, 1.85rem);
  font-weight: 800;
  color: #1b144b;
  margin: 0;
  line-height: 1.25;
}

.carousel-nav-btns {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.carousel-nav-btn {
  display: grid;
  place-items: center;
  width: 2.35rem;
  height: 2.35rem;
  border-radius: 50%;
  border: 1px solid #d4d8e5;
  background: #ffffff;
  color: #1b144b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.carousel-nav-btn:hover {
  border-color: #f30060;
  color: #f30060;
  box-shadow: 0 4px 12px rgba(243, 0, 96, 0.15);
  transform: translateY(-1px);
}

.logo-carousel-track {
  display: flex;
  gap: 1.25rem;
  overflow-x: auto;
  scroll-behavior: smooth;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding-block: 0.5rem 1rem;
}

.logo-carousel-track::-webkit-scrollbar {
  display: none;
}

.logo-link-card {
  flex: 0 0 250px;
  scroll-snap-align: start;
  background: #ffffff;
  border: 1px solid #e4e7f2;
  border-radius: 12px;
  padding: 1.25rem;
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
  position: relative;
}

.logo-link-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 24px rgba(30, 20, 80, 0.08);
  border-color: #f30060;
}

.logo-link-card__badge {
  align-self: flex-start;
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  background: rgba(43, 27, 109, 0.08);
  color: #2b1b6d;
  margin-bottom: 0.75rem;
}

.logo-link-card__badge--tool {
  background: rgba(243, 0, 96, 0.08);
  color: #f30060;
}

.logo-link-card__name {
  font-size: 1.05rem;
  font-weight: 800;
  color: #1b144b;
  margin: 0 0 0.25rem;
}

.logo-link-card__label {
  font-size: 0.82rem;
  color: #64748b;
  line-height: 1.4;
  margin: 0 0 1rem;
  flex-grow: 1;
}

.logo-link-card__external {
  font-size: 0.78rem;
  font-weight: 700;
  color: #35449f;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  transition: gap 0.2s ease;
}

.logo-link-card:hover .logo-link-card__external {
  gap: 0.55rem;
  color: #f30060;
}

/* Skeletons */
.home-view__skeleton-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.home-view__skeleton-grid--3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.skeleton-card {
  height: 18rem;
  border-radius: var(--radius-md);
  background: #edeef5;
}

.skeleton-card--course {
  height: 20rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .friendly-access-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .home-view__news-grid,
  .home-view__skeleton-grid--3 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .friendly-access-grid,
  .home-view__course-grid,
  .home-view__news-grid,
  .home-view__skeleton-grid,
  .home-view__skeleton-grid--3 {
    grid-template-columns: 1fr;
  }

  .logo-link-card {
    flex: 0 0 210px;
  }
}
</style>
