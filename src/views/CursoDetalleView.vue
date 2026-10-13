<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import EditorJsContent from '@/components/common/EditorJsContent.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import SectionHeaderBand from '@/components/layout/SectionHeaderBand.vue'
import { courseTitle, courseType, formatApiDate } from '@/api/normalizers'
import { mediaUrl } from '@/api/response'
import { CursosRepository } from '@/api/repositories.js'
import type { CourseApiItem } from '@/api/types'
import { useApiResource } from '@/composables/useApiResource'

const route = useRoute()
const courseId = computed(() => String(route.params.slug ?? ''))
const { data: course, loading, error, reload } = useApiResource<CourseApiItem>(
  courseId,
  (id) => CursosRepository.getBySlug(id),
)
const apiBaseUrl = import.meta.env.VITE_API_URL
const cover = computed(() => mediaUrl(course.value?.portada_url))
const title = computed(() => (course.value ? courseTitle(course.value) : 'Curso y Taller'))
const content = computed(() => course.value?.contenido)
</script>

<template>
  <div>
    <SectionHeaderBand :title="title" subtitle="Cursos y talleres del IETA" />
    <main class="container course-detail">
      <RouterLink class="course-detail__back" to="/">Volver al inicio</RouterLink>
      <div v-if="loading" class="course-detail__state" role="status">Cargando información del curso…</div>
      <div v-else-if="error" class="course-detail__state" role="alert">
        <EmptyState
          title="No se pudo cargar el curso"
          description="Revisa el enlace o inténtalo de nuevo."
          action-label="Reintentar"
          @action="reload"
        />
      </div>
      <EmptyState v-else-if="!course" title="No se encontró el curso" />
      <article v-else class="course-detail__layout">
        <div class="course-detail__main">
          <img v-if="cover" class="course-detail__cover" :src="cover" :alt="title" />
          <div class="course-detail__heading">
            <p>{{ courseType(course) }}<span v-if="course.modalidad_curso"> · {{ course.modalidad_curso.nombre || course.modalidad_curso.mc_nombre }}</span></p>
            <h2>{{ title }}</h2>
            <StatusBadge
              :registration-start="course.fecha_inicio ?? undefined"
              :registration-end="course.fecha_inicio ?? undefined"
              :course-end="course.fecha_fin ?? undefined"
            />
          </div>
          <p v-if="course.descripcion" class="course-detail__description">{{ course.descripcion }}</p>
          <EditorJsContent v-if="content" :content="content" :api-base-url="apiBaseUrl" />
          <EmptyState v-else title="El curso aún no tiene más información publicada" />
        </div>
        <aside class="course-detail__facts" aria-label="Información del curso">
          <h3>Información</h3>
          <dl>
            <div v-if="course.docente"><dt>Docente</dt><dd>{{ course.docente }}</dd></div>
            <div v-if="course.fecha_inicio"><dt>Inicio</dt><dd>{{ formatApiDate(course.fecha_inicio) }}</dd></div>
            <div v-if="course.fecha_fin"><dt>Finalización</dt><dd>{{ formatApiDate(course.fecha_fin) }}</dd></div>
            <div v-if="course.hora_inicio"><dt>Horario</dt><dd>{{ course.hora_inicio }}<template v-if="course.hora_fin">–{{ course.hora_fin }}</template></dd></div>
            <div v-if="course.duracion"><dt>Duración</dt><dd>{{ course.duracion }}</dd></div>
            <div v-if="course.costo"><dt>Inversión</dt><dd>{{ course.costo }}</dd></div>
          </dl>
          <a v-if="course.email_info" :href="`mailto:${course.email_info}`">Consultar por correo</a>
          <a v-if="course.telefono_ref" :href="`tel:${course.telefono_ref.replace(/[^+\d]/g, '')}`">{{ course.telefono_ref }}</a>
        </aside>
      </article>
    </main>
  </div>
</template>

<style scoped>
.course-detail {
  min-height: 40vh;
  padding-block: var(--space-3) var(--space-8);
}

.course-detail__back {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  margin-bottom: var(--space-2);
  font-weight: 600;
}

.course-detail__layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(15rem, 0.36fr);
  gap: var(--space-4);
  align-items: start;
}

.course-detail__main {
  min-width: 0;
}

.course-detail__cover {
  width: 100%;
  max-height: 30rem;
  margin-bottom: var(--space-3);
  object-fit: cover;
}

.course-detail__heading > p {
  margin-bottom: var(--space-1);
  color: var(--color-violeta);
  font-weight: 700;
}

.course-detail__heading h2 {
  margin-bottom: var(--space-2);
  color: #202e71;
  font-size: var(--text-h4-size);
  line-height: 1.2;
}

.course-detail__description {
  max-width: 72ch;
  margin-block: var(--space-3);
  line-height: 1.65;
}

.course-detail__facts {
  padding: var(--space-2);
  border-top: 3px solid var(--color-rosa-carmin);
  background: var(--color-superficie);
}

.course-detail__facts h3 {
  margin-bottom: var(--space-2);
  color: #202e71;
  font-size: var(--text-h6-size);
}

.course-detail__facts dl {
  display: grid;
  gap: var(--space-1);
}

.course-detail__facts dl div {
  display: grid;
  gap: 0.15rem;
}

.course-detail__facts dt {
  color: var(--color-violeta);
  font-size: var(--text-small-size);
  font-weight: 700;
}

.course-detail__facts dd {
  overflow-wrap: anywhere;
}

.course-detail__facts a {
  display: block;
  margin-top: var(--space-1);
}

.course-detail__state {
  display: grid;
  min-height: 18rem;
  align-content: center;
  text-align: center;
}

@media (max-width: 760px) {
  .course-detail__layout {
    grid-template-columns: 1fr;
  }
}
</style>
