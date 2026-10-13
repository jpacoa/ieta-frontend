<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import EditorJsContent from '@/components/common/EditorJsContent.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import SectionHeaderBand from '@/components/layout/SectionHeaderBand.vue'
import { mediaUrl } from '@/api/response'
import { ServiciosRepository } from '@/api/repositories.js'
import type { ServiceApiItem } from '@/api/types'
import { useApiResource } from '@/composables/useApiResource'

const route = useRoute()
const serviceId = computed(() => String(route.params.slug ?? ''))
const { data: service, loading, error, reload } = useApiResource<ServiceApiItem>(
  serviceId,
  (id) => (/^\d+$/.test(id) ? ServiciosRepository.getById(id) : ServiciosRepository.getBySlug(id)),
)
const image = computed(() => mediaUrl(service.value?.imagen_url))
const apiBaseUrl = import.meta.env.VITE_API_URL
</script>

<template>
  <div>
    <SectionHeaderBand :title="service?.titulo || 'Servicio'" :subtitle="service?.descripcion || undefined" />
    <main class="container service-detail">
      <RouterLink class="service-detail__back" to="/servicios">Volver a Servicios</RouterLink>
      <div v-if="loading" class="service-detail__state" role="status">Cargando servicio…</div>
      <div v-else-if="error" class="service-detail__state" role="alert">
        <EmptyState
          title="No se pudo cargar el servicio"
          description="Comprueba el identificador o vuelve al listado."
          action-label="Reintentar"
          @action="reload"
        />
      </div>
      <article v-else-if="service" class="service-detail__content">
        <img v-if="image" :src="image" :alt="service.titulo" loading="lazy" />
        <EditorJsContent v-if="service.contenido" :content="service.contenido" :api-base-url="apiBaseUrl" />
        <p v-else-if="service.descripcion">{{ service.descripcion }}</p>
        <EmptyState v-else title="No hay información publicada para este servicio" />
      </article>
      <EmptyState v-else title="No se encontró el servicio" />
    </main>
  </div>
</template>

<style scoped>
.service-detail {
  min-height: 40vh;
  padding-block: var(--space-3) var(--space-8);
}

.service-detail__back {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  margin-bottom: var(--space-3);
  font-weight: 600;
}

.service-detail__content {
  max-width: 78ch;
  margin-inline: auto;
  line-height: 1.7;
}

.service-detail__content > img {
  width: 100%;
  max-height: 32rem;
  margin-bottom: var(--space-3);
  object-fit: cover;
}

.service-detail__state {
  display: grid;
  min-height: 18rem;
  align-content: center;
  text-align: center;
}
</style>
