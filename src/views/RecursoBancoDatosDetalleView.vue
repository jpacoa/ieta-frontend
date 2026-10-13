<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import EmptyState from '@/components/common/EmptyState.vue'
import SectionHeaderBand from '@/components/layout/SectionHeaderBand.vue'
import { mediaUrl } from '@/api/response'
import { BancoDatosRepository } from '@/api/repositories.js'
import type { DataBankApiItem } from '@/api/types'
import { useApiResource } from '@/composables/useApiResource'

const route = useRoute()
const resourceId = computed(() => String(route.params.id ?? ''))
const { data: dataset, loading, error, reload } = useApiResource<DataBankApiItem>(
  resourceId,
  (id) => BancoDatosRepository.getById(id),
)
const title = computed(() => dataset.value?.titulo || 'Conjunto de datos')
const cover = computed(() => mediaUrl(dataset.value?.portada_url))
</script>

<template>
  <div>
    <SectionHeaderBand :title="title" subtitle="Banco de Datos del IETA" />
    <main class="container dataset-detail">
      <RouterLink class="dataset-detail__back" to="/recursos">Volver a Recursos</RouterLink>
      <div v-if="loading" class="dataset-detail__state" role="status">Cargando conjunto de datos…</div>
      <div v-else-if="error" class="dataset-detail__state" role="alert">
        <EmptyState title="No se pudo cargar el conjunto de datos" action-label="Reintentar" @action="reload" />
      </div>
      <EmptyState v-else-if="!dataset" title="No se encontró el conjunto de datos" />
      <article v-else class="dataset-detail__content">
        <img v-if="cover" class="dataset-detail__cover" :src="cover" :alt="title" loading="lazy" />
        <div class="dataset-detail__intro">
          <p>{{ dataset.tipo_dato || 'Banco de Datos' }}<span v-if="dataset.anio"> · {{ dataset.anio }}</span></p>
          <h2>{{ title }}</h2>
          <p v-if="dataset.descripcion">{{ dataset.descripcion }}</p>
        </div>
        <dl class="dataset-detail__meta">
          <div v-if="dataset.codigo"><dt>Código</dt><dd>{{ dataset.codigo }}</dd></div>
          <div v-if="dataset.locacion"><dt>Ubicación</dt><dd>{{ dataset.locacion }}</dd></div>
          <div v-if="dataset.areas_tematicas?.length"><dt>Áreas temáticas</dt><dd>{{ dataset.areas_tematicas.map((area) => area.nombre).join(', ') }}</dd></div>
        </dl>
        <nav class="dataset-detail__links" aria-label="Archivos del conjunto de datos">
          <a v-if="mediaUrl(dataset.bdd_url)" :href="mediaUrl(dataset.bdd_url)" target="_blank" rel="noreferrer">Abrir base de datos</a>
          <a v-if="mediaUrl(dataset.archivo_url)" :href="mediaUrl(dataset.archivo_url)" target="_blank" rel="noreferrer">Descargar archivo</a>
          <a v-if="mediaUrl(dataset.url)" :href="mediaUrl(dataset.url)" target="_blank" rel="noreferrer">Abrir recurso externo</a>
        </nav>
        <EmptyState
          v-if="!dataset.descripcion && !dataset.archivo_url && !dataset.bdd_url && !dataset.url"
          title="Este conjunto aún no tiene recursos disponibles"
        />
      </article>
    </main>
  </div>
</template>

<style scoped>
.dataset-detail {
  min-height: 40vh;
  padding-block: var(--space-3) var(--space-8);
}

.dataset-detail__back {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  margin-bottom: var(--space-3);
  font-weight: 600;
}

.dataset-detail__content {
  max-width: 76ch;
  margin-inline: auto;
}

.dataset-detail__cover {
  width: 100%;
  max-height: 30rem;
  margin-bottom: var(--space-3);
  object-fit: cover;
}

.dataset-detail__intro > p:first-child {
  color: var(--color-violeta);
  font-size: var(--text-small-size);
  font-weight: 700;
}

.dataset-detail__intro h2 {
  margin-block: var(--space-1);
  color: #202e71;
  font-size: var(--text-h4-size);
}

.dataset-detail__intro > p:last-child {
  line-height: 1.65;
}

.dataset-detail__meta {
  display: grid;
  gap: 0.5rem;
  margin-block: var(--space-3);
  padding: var(--space-2);
  border-left: 4px solid #f50088;
  background: var(--color-superficie);
}

.dataset-detail__meta div {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
}

.dataset-detail__meta dt {
  font-weight: 700;
}

.dataset-detail__links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  margin-block: var(--space-3);
}

.dataset-detail__links a {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  padding-inline: var(--space-2);
  border-radius: var(--radius-sm);
  background: #202e71;
  color: #fff;
  font-weight: 700;
}

.dataset-detail__state {
  display: grid;
  min-height: 18rem;
  align-content: center;
  text-align: center;
}
</style>
