<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import ContentCard from '@/components/common/ContentCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import LoadMoreButton from '@/components/common/LoadMoreButton.vue'
import SearchFilterBar from '@/components/common/SearchFilterBar.vue'
import SectionHeaderBand from '@/components/layout/SectionHeaderBand.vue'
import { mediaUrl } from '@/api/response'
import { ServiciosRepository } from '@/api/repositories.js'
import type { ServiceApiItem } from '@/api/types'
import { usePaginatedResource } from '@/composables/usePaginatedResource'

const query = ref('')
const resource = usePaginatedResource<ServiceApiItem>((page) => ServiciosRepository.list({ page }))
const filteredServices = computed(() => {
  const search = query.value.trim().toLocaleLowerCase()
  return resource.items.value.filter((service) =>
    !search || `${service.titulo} ${service.descripcion ?? ''}`.toLocaleLowerCase().includes(search),
  )
})

onMounted(() => resource.refresh())
</script>

<template>
  <div>
    <SectionHeaderBand
      title="Servicios"
      subtitle="Asesoría y soporte estadístico para investigación, instituciones y sociedad."
    />
    <main class="container view-body">
      <SearchFilterBar
        v-model="query"
        :no-results="query.trim().length > 0 && filteredServices.length === 0"
      />
      <div v-if="resource.loading.value && resource.items.value.length === 0" class="content-state" role="status">
        Cargando servicios…
      </div>
      <div v-else-if="resource.error.value && resource.items.value.length === 0" class="content-state" role="alert">
        <p>No se pudieron cargar los servicios.</p>
        <button class="retry-button" type="button" @click="resource.refresh">Reintentar</button>
      </div>
      <template v-else>
        <div v-if="filteredServices.length" class="services-grid">
          <ContentCard
            v-for="service in filteredServices"
            :key="service.id"
            type="servicio"
            eyebrow="Servicio institucional"
            :title="service.titulo"
            :summary="service.descripcion ?? undefined"
            :image="mediaUrl(service.imagen_url)"
            :image-alt="service.titulo"
            :to="`/servicios/${service.id}`"
          />
        </div>
        <EmptyState
          v-else-if="!resource.loading.value && !query.trim()"
          title="Aún no hay servicios publicados"
          description="Los servicios disponibles del IETA aparecerán en esta sección."
        />
        <LoadMoreButton
          :loading="resource.loadingMore.value"
          :has-more="resource.hasMore.value"
          @load="resource.loadMore"
        />
      </template>
    </main>
  </div>
</template>

<style scoped>
.view-body {
  min-height: 40vh;
  padding-block: var(--space-6) var(--space-8);
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-2);
  margin-top: var(--space-3);
}

.content-state {
  display: grid;
  min-height: 17rem;
  align-content: center;
  justify-items: center;
  gap: var(--space-2);
}

.retry-button {
  min-height: 2.75rem;
  padding: var(--space-1) var(--space-2);
  border: 1px solid var(--color-indigo);
  border-radius: var(--radius-sm);
  background: var(--color-indigo);
  color: var(--color-blanco);
  font: inherit;
  cursor: pointer;
}

@media (max-width: 900px) {
  .services-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 620px) {
  .services-grid {
    grid-template-columns: 1fr;
  }
}
</style>
