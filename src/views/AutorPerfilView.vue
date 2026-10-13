<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import ContentCard from '@/components/common/ContentCard.vue'
import EditorJsContent from '@/components/common/EditorJsContent.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import SectionHeaderBand from '@/components/layout/SectionHeaderBand.vue'
import { authorName } from '@/api/normalizers'
import { mediaUrl } from '@/api/response'
import { AutoresRepository } from '@/api/repositories.js'
import type { AuthorApiItem } from '@/api/types'
import { useApiResource } from '@/composables/useApiResource'

const route = useRoute()
const slug = computed(() => String(route.params.slug ?? ''))
const { data: author, loading, error, reload } = useApiResource<AuthorApiItem>(
  slug,
  (id) => AutoresRepository.getBySlug(id),
)
const name = computed(() => (author.value ? authorName(author.value) : 'Perfil de Autor'))
const photo = computed(() => mediaUrl(author.value?.persona?.foto_url))
</script>

<template>
  <div>
    <SectionHeaderBand :title="name" subtitle="Autor de la Revista Varianza" />
    <main class="container author-profile">
      <RouterLink class="author-profile__back" to="/revista-varianza/autores">Volver a Autores Varianza</RouterLink>
      <div v-if="loading" class="author-profile__state" role="status">Cargando perfil…</div>
      <div v-else-if="error" class="author-profile__state" role="alert">
        <EmptyState title="No se pudo cargar el perfil" action-label="Reintentar" @action="reload" />
      </div>
      <EmptyState v-else-if="!author" title="No se encontró el perfil de autor" />
      <article v-else class="author-profile__layout">
        <aside class="author-profile__identity">
          <img v-if="photo" :src="photo" :alt="name" loading="lazy" />
          <span v-else class="author-profile__monogram" aria-hidden="true">{{ name.slice(0, 1) }}</span>
          <h2>{{ name }}</h2>
          <p v-if="author.grado_academico?.abreviatura">{{ author.grado_academico.abreviatura }}</p>
          <p v-if="author.especialidad?.nombre">{{ author.especialidad.nombre }}</p>
          <p v-if="author.tipo_autor?.nombre">{{ author.tipo_autor.nombre }}</p>
          <a v-if="author.persona?.p_correo" :href="`mailto:${author.persona.p_correo}`">{{ author.persona.p_correo }}</a>
          <a v-if="author.persona?.p_sitio_web" :href="author.persona.p_sitio_web" target="_blank" rel="noreferrer">Sitio / ORCID</a>
        </aside>
        <div class="author-profile__body">
          <section v-if="author.biografia" class="author-profile__section">
            <h3>Biografía</h3>
            <EditorJsContent :content="author.biografia" />
          </section>
          <section v-if="author.intereses_cientificos" class="author-profile__section">
            <h3>Intereses científicos</h3>
            <p>{{ author.intereses_cientificos }}</p>
          </section>
          <section class="author-profile__section">
            <h3>Artículos publicados</h3>
            <div v-if="author.articulos?.length" class="author-profile__articles">
              <ContentCard
                v-for="article in author.articulos"
                :key="article.id"
                type="edicion"
                :title="article.titulo"
                :summary="article.resumen ?? article.abstracto ?? undefined"
                :date="article.fecha_aceptado || article.fecha_recepcion || undefined"
                :to="`/revista-varianza/articulos/${article.id}`"
              />
            </div>
            <EmptyState v-else title="No hay artículos asociados al perfil" />
          </section>
        </div>
      </article>
    </main>
  </div>
</template>

<style scoped>
.author-profile {
  min-height: 40vh;
  padding-block: var(--space-3) var(--space-8);
}

.author-profile__back {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  margin-bottom: var(--space-3);
  font-weight: 600;
}

.author-profile__layout {
  display: grid;
  grid-template-columns: minmax(14rem, 0.42fr) minmax(0, 1fr);
  gap: var(--space-4);
  align-items: start;
}

.author-profile__identity {
  display: grid;
  justify-items: start;
  gap: 0.25rem;
  padding: var(--space-2);
  border-top: 4px solid #f50088;
  background: #fff;
}

.author-profile__identity img,
.author-profile__monogram {
  display: grid;
  width: 100%;
  max-width: 18rem;
  aspect-ratio: 1;
  place-items: center;
  object-fit: cover;
  background: #e8e8ed;
}

.author-profile__monogram {
  color: #202e71;
  font-size: 5rem;
  font-weight: 700;
}

.author-profile__identity h2 {
  margin-top: var(--space-1);
  color: #202e71;
  font-size: var(--text-h5-size);
}

.author-profile__identity p,
.author-profile__identity a {
  font-size: var(--text-small-size);
  overflow-wrap: anywhere;
}

.author-profile__body {
  display: grid;
  gap: var(--space-3);
  min-width: 0;
}

.author-profile__section h3 {
  margin-bottom: var(--space-1);
  color: #202e71;
  font-size: var(--text-h5-size);
}

.author-profile__articles {
  display: grid;
  gap: var(--space-2);
}

.author-profile__state {
  display: grid;
  min-height: 18rem;
  align-content: center;
  text-align: center;
}

@media (max-width: 700px) {
  .author-profile__layout {
    grid-template-columns: 1fr;
  }

  .author-profile__identity img,
  .author-profile__monogram {
    max-width: 12rem;
  }
}
</style>
