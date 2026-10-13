<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import EmptyState from '@/components/common/EmptyState.vue'
import SectionHeaderBand from '@/components/layout/SectionHeaderBand.vue'
import { formatApiDate } from '@/api/normalizers'
import { authorName } from '@/api/normalizers'
import { mediaUrl } from '@/api/response'
import { ArticulosRepository } from '@/api/repositories.js'
import type { ArticleApiItem } from '@/api/types'
import { useApiResource } from '@/composables/useApiResource'

const route = useRoute()
const articleId = computed(() => String(route.params.slug ?? ''))
const { data: article, loading, error, reload } = useApiResource<ArticleApiItem>(
  articleId,
  (id) => ArticulosRepository.getById(id),
)
const title = computed(() => article.value?.titulo || 'Artículo')
</script>

<template>
  <div>
    <SectionHeaderBand :title="title" :subtitle="article?.edicion?.titulo || 'Artículo de la Revista Varianza'" />
    <main class="container article-detail">
      <RouterLink class="article-detail__back" to="/revista-varianza/ediciones">Volver a Ediciones</RouterLink>
      <div v-if="loading" class="article-detail__state" role="status">Cargando artículo…</div>
      <div v-else-if="error" class="article-detail__state" role="alert">
        <EmptyState title="No se pudo cargar el artículo" action-label="Reintentar" @action="reload" />
      </div>
      <EmptyState v-else-if="!article" title="No se encontró el artículo" />
      <article v-else class="article-detail__content">
        <p v-if="article.resumen" class="article-detail__summary">{{ article.resumen }}</p>
        <dl class="article-detail__meta">
          <div v-if="article.tipo_articulo?.nombre"><dt>Tipo</dt><dd>{{ article.tipo_articulo.nombre }}</dd></div>
          <div v-if="article.autores?.length">
            <dt>Autores</dt>
            <dd>
              <RouterLink
                v-for="author in article.autores"
                :key="author.id"
                :to="`/revista-varianza/autores/${encodeURIComponent(author.slug || String(author.id))}`"
              >{{ authorName(author) }}</RouterLink>
            </dd>
          </div>
          <div v-if="article.doi"><dt>DOI</dt><dd>{{ article.doi }}</dd></div>
          <div v-if="article.orcid"><dt>ORCID</dt><dd>{{ article.orcid }}</dd></div>
          <div v-if="article.fecha_aceptado"><dt>Fecha de publicación</dt><dd>{{ formatApiDate(article.fecha_aceptado) }}</dd></div>
          <div v-if="article.rango_paginas || article.pag_inicio || article.num_paginas"><dt>Páginas</dt><dd>{{ article.rango_paginas || [article.pag_inicio, article.pag_fin].filter(Boolean).join('–') || article.num_paginas }}</dd></div>
          <div v-if="article.edicion"><dt>Edición</dt><dd><RouterLink :to="`/revista-varianza/ediciones/${encodeURIComponent(article.edicion.slug || String(article.edicion.id))}`">{{ article.edicion.titulo || `N° ${article.edicion.numero}` }}</RouterLink></dd></div>
          <div v-if="article.etiquetas?.length"><dt>Etiquetas</dt><dd>{{ article.etiquetas.map((tag) => tag.nombre).join(', ') }}</dd></div>
          <div v-if="article.vistas !== undefined"><dt>Vistas</dt><dd>{{ article.vistas }}</dd></div>
        </dl>
        <section v-if="article.abstracto" class="article-detail__section">
          <h2>Resumen</h2>
          <p>{{ article.abstracto }}</p>
        </section>
        <section v-if="article.referencias" class="article-detail__section">
          <h2>Referencias</h2>
          <p>{{ article.referencias }}</p>
        </section>
        <a v-if="mediaUrl(article.archivo_url)" class="article-detail__download" :href="mediaUrl(article.archivo_url)" target="_blank" rel="noreferrer">
          Abrir artículo completo
        </a>
        <section v-if="article.articulos_similares?.length" class="article-detail__related">
          <h2>Artículos similares</h2>
          <ul>
            <li v-for="related in article.articulos_similares" :key="related.id">
              <RouterLink :to="`/revista-varianza/articulos/${related.id}`">{{ related.titulo }}</RouterLink>
            </li>
          </ul>
        </section>
        <section v-if="article.mas_leidos_autor?.length" class="article-detail__related">
          <h2>Más leídos del autor</h2>
          <ul>
            <li v-for="related in article.mas_leidos_autor" :key="related.id">
              <RouterLink :to="`/revista-varianza/articulos/${related.id}`">{{ related.titulo }}</RouterLink>
            </li>
          </ul>
        </section>
        <EmptyState v-if="!article.resumen && !article.abstracto && !article.referencias && !article.archivo_url" title="El artículo aún no tiene contenido disponible" />
      </article>
    </main>
  </div>
</template>

<style scoped>
.article-detail {
  min-height: 40vh;
  padding-block: var(--space-3) var(--space-8);
}

.article-detail__back {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  margin-bottom: var(--space-3);
  font-weight: 600;
}

.article-detail__content {
  max-width: 78ch;
  margin-inline: auto;
}

.article-detail__summary {
  margin-bottom: var(--space-3);
  color: #202e71;
  font-size: var(--text-large-size);
  line-height: 1.55;
}

.article-detail__meta {
  display: grid;
  gap: 0.55rem;
  padding: var(--space-2);
  border-left: 4px solid #f50088;
  background: var(--color-superficie);
}

.article-detail__meta div {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
}

.article-detail__meta dt {
  font-weight: 700;
}

.article-detail__meta dd {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.article-detail__section {
  margin-top: var(--space-3);
  line-height: 1.7;
}

.article-detail__section h2 {
  margin-bottom: var(--space-1);
  color: #202e71;
  font-size: var(--text-h5-size);
}

.article-detail__download {
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

.article-detail__related {
  margin-top: var(--space-4);
}

.article-detail__related h2 {
  margin-bottom: var(--space-1);
  color: #202e71;
  font-size: var(--text-h5-size);
}

.article-detail__related ul {
  display: grid;
  gap: 0.35rem;
  padding-left: var(--space-2);
}

.article-detail__state {
  display: grid;
  min-height: 18rem;
  align-content: center;
  text-align: center;
}
</style>
