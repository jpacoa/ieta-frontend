<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  ExternalLink,
  GraduationCap,
  Mail,
  User,
} from '@lucide/vue'
import ContentCard from '@/components/common/ContentCard.vue'
import EditorJsContent from '@/components/common/EditorJsContent.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import SectionHeaderBand from '@/components/layout/SectionHeaderBand.vue'
import { authorName } from '@/api/normalizers'
import { mediaUrl } from '@/api/response'
import { AutoresRepository } from '@/api/repositories.js'
import type { AuthorApiItem } from '@/api/types'
import { useApiResource } from '@/composables/useApiResource'
import { useGsapReveal } from '@/composables/useGsapReveal'

const route = useRoute()
const authorRoot = ref<HTMLElement | null>(null)
const slug = computed(() => String(route.params.slug ?? ''))

const { data: author, loading, error, reload } = useApiResource<AuthorApiItem>(
  slug,
  (id) => AutoresRepository.getBySlug(id),
)

const name = computed(() => (author.value ? authorName(author.value) : 'Perfil de Autor'))
const photo = computed(() => mediaUrl(author.value?.persona?.foto_url))

useGsapReveal(authorRoot, {
  selector: '.author-reveal',
  stagger: 0.08,
  y: 18,
})
</script>

<template>
  <div ref="authorRoot">
    <SectionHeaderBand
      :title="name"
      :subtitle="author?.especialidad?.nombre || 'Investigador / Autor de Revista Varianza'"
    />

    <main class="container author-profile">
      <!-- Back Navigation -->
      <nav class="author-profile__nav author-reveal" aria-label="Navegación de retorno">
        <RouterLink class="author-profile__back" to="/revista-varianza/autores">
          <ArrowLeft :size="16" aria-hidden="true" />
          <span>Volver a Autores Varianza</span>
        </RouterLink>
      </nav>

      <!-- Loading State -->
      <div v-if="loading" class="author-skeleton" role="status" aria-label="Cargando autor">
        <div class="skeleton-sidebar"></div>
        <div class="skeleton-main"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="author-profile__state" role="alert">
        <EmptyState
          title="No se pudo cargar el perfil del autor"
          description="Por favor, verifica el enlace o inténtalo nuevamente."
          action-label="Reintentar"
          @action="reload"
        />
      </div>

      <!-- Not Found -->
      <EmptyState v-else-if="!author" title="No se encontró el perfil de autor solicitado" />

      <!-- Loaded Profile Layout -->
      <article v-else class="author-profile__layout">
        <!-- Identity Sidebar -->
        <aside class="author-identity-sidebar author-reveal" aria-label="Datos del autor">
          <div class="identity-card">
            <div class="identity-card__media">
              <img v-if="photo" :src="photo" :alt="name" class="identity-photo" loading="lazy" />
              <div v-else class="identity-monogram" aria-hidden="true">
                <span>{{ name.slice(0, 1) }}</span>
              </div>
            </div>

            <div class="identity-card__info">
              <span v-if="author.grado_academico?.abreviatura" class="degree-pill">
                {{ author.grado_academico.abreviatura }}
              </span>

              <h2 class="identity-name">{{ name }}</h2>

              <p v-if="author.especialidad?.nombre" class="identity-specialty">
                {{ author.especialidad.nombre }}
              </p>

              <span v-if="author.tipo_autor?.nombre" class="author-type-tag">
                {{ author.tipo_autor.nombre }}
              </span>

              <div class="identity-links">
                <a
                  v-if="author.persona?.p_correo"
                  class="identity-link-btn"
                  :href="`mailto:${author.persona.p_correo}`"
                >
                  <Mail :size="15" aria-hidden="true" />
                  <span>{{ author.persona.p_correo }}</span>
                </a>

                <a
                  v-if="author.persona?.p_sitio_web"
                  class="identity-link-btn identity-link-btn--secondary"
                  :href="author.persona.p_sitio_web"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink :size="15" aria-hidden="true" />
                  <span>ORCID / Sitio Web</span>
                </a>
              </div>
            </div>
          </div>
        </aside>

        <!-- Main Body -->
        <div class="author-profile__main">
          <!-- Biography -->
          <section v-if="author.biografia" class="profile-section author-reveal">
            <h2 class="section-heading">Biografía y Trayectoria</h2>
            <div class="bio-box">
              <EditorJsContent :content="author.biografia" />
            </div>
          </section>

          <!-- Research Interests -->
          <section v-if="author.intereses_cientificos" class="profile-section author-reveal">
            <h2 class="section-heading">Intereses Científicos y Líneas de Trabajo</h2>
            <div class="interests-box">
              <p>{{ author.intereses_cientificos }}</p>
            </div>
          </section>

          <!-- Published Articles -->
          <section class="profile-section author-reveal">
            <h2 class="section-heading">
              <span>Artículos Publicados en Varianza</span>
              <span v-if="author.articulos?.length" class="articles-count-pill">
                {{ author.articulos.length }}
              </span>
            </h2>

            <div v-if="author.articulos?.length" class="author-articles-grid">
              <div v-for="article in author.articulos" :key="article.id" class="article-wrap">
                <ContentCard
                  type="edicion"
                  :title="article.titulo"
                  :eyebrow="article.doi || 'Revista Varianza'"
                  :summary="article.resumen ?? article.abstracto ?? undefined"
                  :date="article.fecha_aceptado || article.fecha_recepcion || undefined"
                  :to="`/revista-varianza/articulos/${article.id}`"
                />
              </div>
            </div>

            <EmptyState
              v-else
              title="No hay artículos asociados en este momento"
              description="Las contribuciones de este autor aparecerán en próximas ediciones."
            />
          </section>
        </div>
      </article>
    </main>
  </div>
</template>

<style scoped>
.author-profile {
  min-height: 48vh;
  padding-block: var(--space-4) var(--space-8);
}

.author-profile__nav {
  margin-bottom: var(--space-4);
}

.author-profile__back {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--color-indigo);
  font-size: var(--text-small-size);
  font-weight: 700;
  text-decoration: none;
  transition: transform 0.15s ease, color 0.15s ease;
}

.author-profile__back:hover {
  transform: translateX(-4px);
  color: var(--color-rosa-carmin);
}

/* Layout */
.author-profile__layout {
  display: grid;
  grid-template-columns: minmax(16rem, 20rem) minmax(0, 1fr);
  gap: clamp(1.5rem, 4vw, 3rem);
  align-items: start;
}

/* Sidebar */
.author-identity-sidebar {
  position: sticky;
  top: calc(var(--header-height) + 1.5rem);
}

.identity-card {
  overflow: hidden;
  border: 1px solid var(--color-desactivado);
  border-radius: var(--radius-md);
  background: var(--color-blanco);
  box-shadow: 0 4px 18px rgba(20, 22, 28, 0.06);
}

.identity-card__media {
  aspect-ratio: 1;
  overflow: hidden;
  background: #edeef5;
}

.identity-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.identity-monogram {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  background: linear-gradient(135deg, #182042 0%, #35449f 60%, #71589f 100%);
  color: #fff;
  font-size: 4rem;
  font-weight: 700;
}

.identity-card__info {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  padding: clamp(1.25rem, 2.5vw, 1.5rem);
}

.degree-pill {
  display: inline-block;
  align-self: flex-start;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  background: rgba(243, 0, 96, 0.1);
  color: var(--color-rosa-carmin);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.identity-name {
  color: var(--color-indigo);
  font-size: var(--text-h5-size);
  font-weight: 700;
  line-height: 1.25;
}

.identity-specialty {
  color: #555c73;
  font-size: var(--text-small-size);
  font-weight: 600;
}

.author-type-tag {
  display: inline-block;
  align-self: flex-start;
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius-sm);
  background: var(--color-superficie);
  color: var(--color-violeta);
  font-size: 0.75rem;
  font-weight: 700;
}

.identity-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: var(--space-2);
  padding-top: var(--space-2);
  border-top: 1px solid var(--color-superficie);
}

.identity-link-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.85rem;
  border-radius: var(--radius-sm);
  background: var(--color-indigo);
  color: var(--color-blanco);
  font-size: var(--text-small-size);
  font-weight: 600;
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: background-color 0.15s ease;
}

.identity-link-btn:hover {
  background: #253381;
}

.identity-link-btn--secondary {
  border: 1px solid var(--color-desactivado);
  background: var(--color-blanco);
  color: var(--color-tinta);
}

.identity-link-btn--secondary:hover {
  background: var(--color-superficie);
}

/* Main */
.author-profile__main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.profile-section {
  display: flex;
  flex-direction: column;
}

.section-heading {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  color: var(--color-indigo);
  font-size: var(--text-h5-size);
  font-weight: 700;
  margin-bottom: var(--space-3);
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--color-superficie);
}

.articles-count-pill {
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  background: rgba(53, 68, 159, 0.1);
  color: var(--color-indigo);
  font-size: 0.75rem;
  font-weight: 700;
}

.bio-box {
  padding: clamp(1.25rem, 2.5vw, 1.75rem);
  border: 1px solid var(--color-desactivado);
  border-radius: var(--radius-md);
  background: var(--color-blanco);
  line-height: 1.7;
}

.interests-box {
  padding: 1.25rem 1.5rem;
  border-left: 4px solid var(--color-rosa-carmin);
  background: var(--color-superficie);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  color: #2b324b;
  font-size: var(--text-body-size);
  line-height: 1.6;
}

.author-articles-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(1rem, 2vw, 1.5rem);
}

.article-wrap {
  display: flex;
}

.article-wrap :deep(.content-card) {
  width: 100%;
}

/* Skeleton */
.author-skeleton {
  display: grid;
  grid-template-columns: 18rem 1fr;
  gap: 2rem;
}

.skeleton-sidebar {
  height: 24rem;
  border-radius: var(--radius-md);
  background: #edeef5;
}

.skeleton-main {
  height: 28rem;
  border-radius: var(--radius-md);
  background: #edeef5;
}

.author-profile__state {
  display: grid;
  min-height: 20rem;
  align-content: center;
  text-align: center;
}

@media (max-width: 860px) {
  .author-profile__layout {
    grid-template-columns: 1fr;
  }
  .author-identity-sidebar {
    position: static;
  }
  .author-articles-grid {
    grid-template-columns: 1fr;
  }
}
</style>
