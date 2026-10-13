<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import ContentCard from '@/components/common/ContentCard.vue'
import EditorJsContent from '@/components/common/EditorJsContent.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import LoadMoreButton from '@/components/common/LoadMoreButton.vue'
import SectionHeaderBand from '@/components/layout/SectionHeaderBand.vue'
import { authorName, formatApiDate } from '@/api/normalizers'
import { mediaUrl } from '@/api/response'
import { EdicionesVarianzaRepository } from '@/api/repositories.js'
import type { VarianzaIssueApiItem } from '@/api/types'
import { useApiResource } from '@/composables/useApiResource'

const route = useRoute()
const issueIdOrSlug = computed(() => String(route.params.numero ?? ''))
const { data: issue, loading, error, reload } = useApiResource<VarianzaIssueApiItem>(
  issueIdOrSlug,
  (idOrSlug) => EdicionesVarianzaRepository.getBySlug(idOrSlug),
)
const cover = computed(() => mediaUrl(issue.value?.portada_url))
const articles = computed(() => issue.value?.articulos ?? [])
const apiBaseUrl = import.meta.env.VITE_API_URL

function articlePath(article: { id: number; slug?: string | null }) {
  return `/revista-varianza/articulos/${article.id}`
}
</script>

<template>
  <div class="issue-detail-page">
    <SectionHeaderBand :title="issue?.titulo || 'Edición de Varianza'" :subtitle="issue ? [issue.mes, issue.anio].filter(Boolean).join(' · ') : undefined" />
    <main class="container issue-detail">
      <RouterLink class="issue-detail__back" to="/revista-varianza/ediciones">Volver a Ediciones</RouterLink>
      <div v-if="loading" class="issue-detail__state" role="status">Cargando edición…</div>
      <div v-else-if="error" class="issue-detail__state" role="alert">
        <EmptyState title="No se pudo cargar la edición" description="Comprueba el enlace o inténtalo de nuevo." action-label="Reintentar" @action="reload" />
      </div>
      <EmptyState v-else-if="!issue" title="No se encontró la edición" />
      <article v-else>
        <section class="issue-detail__hero">
          <img v-if="cover" class="issue-detail__cover" :src="cover" :alt="`Portada de ${issue.titulo}`" />
          <span v-else class="issue-detail__cover issue-detail__cover--placeholder" aria-hidden="true">VARIANZA<br />N° {{ issue.numero }}</span>
          <div class="issue-detail__summary">
            <p>{{ [issue.mes, issue.anio].filter(Boolean).join(' · ') }}</p>
            <h2>{{ issue.titulo }}</h2>
            <p v-if="issue.editorial">{{ issue.editorial }}</p>
            <dl>
              <div v-if="issue.volumen"><dt>Volumen</dt><dd>{{ issue.volumen }}</dd></div>
              <div v-if="issue.fecha_publicacion"><dt>Publicado</dt><dd>{{ formatApiDate(issue.fecha_publicacion) }}</dd></div>
              <div v-if="issue.num_paginas"><dt>Páginas</dt><dd>{{ issue.num_paginas }}</dd></div>
              <div v-if="issue.doi"><dt>DOI</dt><dd>{{ issue.doi }}</dd></div>
              <div v-if="issue.issn_impresa"><dt>ISSN impreso</dt><dd>{{ issue.issn_impresa }}</dd></div>
              <div v-if="issue.issn_electronica"><dt>ISSN electrónico</dt><dd>{{ issue.issn_electronica }}</dd></div>
            </dl>
            <a v-if="mediaUrl(issue.archivo_url)" class="issue-detail__download" :href="mediaUrl(issue.archivo_url)" target="_blank" rel="noreferrer">Descargar edición</a>
          </div>
        </section>

        <section v-if="issue.presentacion" class="issue-detail__presentation">
          <h2>Presentación</h2>
          <EditorJsContent :content="issue.presentacion" :api-base-url="apiBaseUrl" />
        </section>

        <section class="issue-detail__articles" aria-labelledby="issue-articles-heading">
          <header>
            <p>Contenido del número</p>
            <h2 id="issue-articles-heading">Artículos</h2>
          </header>
          <div v-if="articles.length" class="issue-detail__article-grid">
            <ContentCard
              v-for="article in articles"
              :key="article.id"
              type="edicion"
              :title="article.titulo"
              :eyebrow="article.tipo_articulo?.nombre || article.doi || 'Investigación original'"
              :summary="article.resumen || article.abstracto || undefined"
              :date="formatApiDate(article.fecha_aceptado || article.fecha_recepcion)"
              :author="article.autores?.map(authorName).join(', ')"
              :image="mediaUrl(article.edicion?.portada_url || issue.portada_url)"
              :image-alt="`Portada de ${issue.titulo}`"
              :to="articlePath(article)"
            />
          </div>
          <EmptyState v-else title="Esta edición aún no tiene artículos publicados" />
        </section>
      </article>
    </main>
  </div>
</template>

<style scoped>
.issue-detail-page {
  background: #f5f5f8;
}

.issue-detail {
  min-height: 45vh;
  padding-block: var(--space-3) var(--space-8);
}

.issue-detail__back {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  margin-bottom: var(--space-3);
  font-weight: 700;
}

.issue-detail__hero {
  display: grid;
  grid-template-columns: minmax(13rem, 0.38fr) minmax(0, 1fr);
  gap: var(--space-4);
  align-items: start;
  padding: var(--space-3);
  background: #202e71;
  color: #fff;
}

.issue-detail__cover {
  width: 100%;
  max-height: 32rem;
  aspect-ratio: 0.74;
  object-fit: contain;
}

.issue-detail__cover--placeholder {
  display: grid;
  place-content: center;
  background: linear-gradient(155deg, #f50088, #202e71 68%);
  color: #fff;
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
}

.issue-detail__summary > p:first-child,
.issue-detail__articles header > p {
  color: #ffc4e0;
  font-size: var(--text-small-size);
  font-weight: 700;
}

.issue-detail__summary h2 {
  margin-block: var(--space-1);
  color: #fff;
  font-size: var(--text-h4-size);
}

.issue-detail__summary > p:nth-of-type(2) {
  margin-bottom: var(--space-2);
  line-height: 1.55;
}

.issue-detail__summary dl {
  display: grid;
  gap: 0.45rem;
  margin-top: var(--space-2);
}

.issue-detail__summary dl div {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.issue-detail__summary dt {
  font-weight: 700;
}

.issue-detail__download {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  margin-top: var(--space-3);
  padding-inline: var(--space-2);
  border-radius: var(--radius-sm);
  background: #f50088;
  color: #fff;
  font-weight: 700;
}

.issue-detail__presentation,
.issue-detail__articles {
  padding-block: var(--space-4);
}

.issue-detail__presentation h2,
.issue-detail__articles h2 {
  margin-bottom: var(--space-2);
  color: #202e71;
  font-size: var(--text-h5-size);
}

.issue-detail__articles header {
  margin-bottom: var(--space-2);
}

.issue-detail__articles header > p {
  color: #f50088;
  text-transform: uppercase;
}

.issue-detail__article-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-2);
}

.issue-detail__state {
  display: grid;
  min-height: 18rem;
  align-content: center;
  text-align: center;
}

@media (max-width: 700px) {
  .issue-detail__hero {
    grid-template-columns: 1fr;
  }

  .issue-detail__cover {
    max-width: 15rem;
  }

  .issue-detail__article-grid {
    grid-template-columns: 1fr;
  }
}
</style>
