<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { ArrowUpRight } from '@lucide/vue'
import { RouterLink } from 'vue-router'
import ContentCard from '@/components/common/ContentCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import HomeHero from '@/components/home/HomeHero.vue'
import HomeSectionHeading from '@/components/home/HomeSectionHeading.vue'
import { courseTitle, courseType, formatApiDate, newsDate, newsIsFeatured, newsIsPublished, newsSummary, newsTitle } from '@/api/normalizers'
import { mediaUrl } from '@/api/response'
import { CursosRepository, NoticiasRepository } from '@/api/repositories.js'
import type { CourseApiItem, NewsApiItem } from '@/api/types'
import { usePaginatedResource } from '@/composables/usePaginatedResource'
import { homePresentation } from '@/data/home-presentation'

const courseResource = usePaginatedResource<CourseApiItem>((page) => CursosRepository.list({ page }))
const newsResource = usePaginatedResource<NewsApiItem>((page) => NoticiasRepository.list({ page }))
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

function coursePath(course: CourseApiItem) {
  return `/cursos-talleres/${encodeURIComponent(course.slug || String(course.id))}`
}

onMounted(() => {
  void Promise.all([refreshCourses(), refreshNews()])
})
</script>

<template>
  <main class="home-view">
    <HomeHero v-bind="homePresentation.hero" />

    <section class="home-view__section home-view__section--courses" aria-labelledby="home-courses">
      <div class="container">
        <HomeSectionHeading
          id="home-courses"
          eyebrow="Formación continua"
          title="Cursos y talleres"
          :link-label="featuredCourses.length ? 'Ver cursos' : undefined"
          :link-to="featuredCourses[0] ? coursePath(featuredCourses[0]) : undefined"
        />
        <div class="home-view__course-grid">
          <ContentCard
            v-for="course in featuredCourses"
            :key="course.id"
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
        <p v-if="coursesLoading" class="home-view__state" role="status">Cargando cursos…</p>
        <EmptyState
          v-if="coursesError && courseItems.length === 0"
          title="No se pudieron cargar los cursos"
          description="Vuelve a intentarlo en unos momentos."
          action-label="Reintentar"
          @action="refreshCourses"
        />
        <EmptyState
          v-else-if="coursesEmpty"
          title="No hay cursos publicados"
          description="Los próximos cursos y talleres aparecerán aquí."
        />
      </div>
    </section>

    <section class="home-view__section home-view__section--news" aria-labelledby="home-news">
      <div class="container">
        <HomeSectionHeading
          id="home-news"
          eyebrow="Actualidad"
          title="Últimas noticias"
          link-label="Ver todas las noticias"
          link-to="/noticias"
        />
        <div class="home-view__news-grid">
          <ContentCard
            v-for="(article, index) in recentNews"
            :key="article.id"
            type="noticia"
            :title="newsTitle(article)"
            :eyebrow="newsIsFeatured(article) ? 'Destacada' : 'Noticias'"
            :summary="newsSummary(article)"
            :date="formatApiDate(newsDate(article))"
            :image="mediaUrl(article.portada_url)"
            :image-alt="newsTitle(article)"
            :image-loading="index === 0 ? 'eager' : 'lazy'"
            :to="`/noticias/${article.id}`"
          />
        </div>
        <p v-if="newsLoading" class="home-view__state" role="status">Cargando noticias…</p>
        <EmptyState
          v-if="newsError && newsItems.length === 0"
          title="No se pudieron cargar las noticias"
          description="Vuelve a intentarlo en unos momentos."
          action-label="Reintentar"
          @action="refreshNews"
        />
        <EmptyState
          v-else-if="newsEmpty"
          title="No hay noticias publicadas"
          description="Las novedades institucionales aparecerán aquí."
        />
      </div>
    </section>

    <section class="home-view__links" aria-labelledby="home-links">
      <div class="container">
        <HomeSectionHeading id="home-links" eyebrow="Explora el instituto" title="Enlaces de interés" />
        <nav class="home-view__link-grid" aria-label="Enlaces de interés">
          <RouterLink
            v-for="link in homePresentation.quickLinks"
            :key="link.number"
            :to="link.to"
            class="home-view__quick-link"
          >
            <span>{{ link.number }}</span>
            <strong>{{ link.label }}</strong>
            <ArrowUpRight :size="19" aria-hidden="true" />
          </RouterLink>
        </nav>
      </div>
    </section>
  </main>
</template>

<style scoped>
.home-view {
  overflow: clip;
}

.home-view__section {
  padding-block: clamp(var(--space-6), 8vw, var(--space-8));
}

.home-view__section--courses {
  background: #f5f5f8;
}

.home-view__section--news {
  background: #fff;
}

.home-view__state {
  padding-block: var(--space-3);
  color: var(--color-violeta);
  text-align: center;
}

.home-view__course-grid,
.home-view__news-grid {
  display: grid;
  gap: var(--space-2);
}

.home-view__course-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.home-view__news-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.home-view__links {
  padding-block: var(--space-6) var(--space-8);
  background: #f5f5f8;
}

.home-view__link-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-top: 1px solid #ccd1df;
  border-bottom: 1px solid #ccd1df;
}

.home-view__quick-link {
  display: grid;
  min-width: 0;
  min-height: 7rem;
  grid-template-columns: 1fr auto;
  align-content: space-between;
  gap: var(--space-1);
  padding: var(--space-2);
  border-right: 1px solid #ccd1df;
  color: #202e71;
}

.home-view__quick-link:first-child {
  border-left: 1px solid #ccd1df;
}

.home-view__quick-link > span {
  grid-column: 1 / -1;
  color: #f50088;
  font-size: 0.75rem;
  font-weight: 700;
}

.home-view__quick-link strong {
  align-self: end;
  font-size: 1rem;
  line-height: 1.3;
}

.home-view__quick-link svg {
  align-self: end;
  color: #f50088;
}

.home-view__quick-link:hover strong {
  color: #f50088;
}

.home-view__quick-link:focus-visible {
  position: relative;
  z-index: 1;
  outline: 3px solid #6c81c7;
  outline-offset: -3px;
}

@media (max-width: 900px) {
  .home-view__news-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .home-view__link-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .home-view__quick-link:nth-child(3) {
    border-left: 1px solid #ccd1df;
  }
}

@media (max-width: 620px) {
  .home-view__course-grid,
  .home-view__news-grid {
    grid-template-columns: 1fr;
  }

  .home-view__quick-link {
    min-height: 6rem;
  }
}
</style>
