<script setup lang="ts">
// Vista: Personal IETA
// Estado: esqueleto — Fase 3 / contenido real en Fase 7
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import EmptyState from '@/components/common/EmptyState.vue'
import SectionHeaderBand from '@/components/layout/SectionHeaderBand.vue'
import { mediaUrl } from '@/api/response'
import { PersonalRepository } from '@/api/repositories.js'
import type { StaffApiItem } from '@/api/types'
import { useApiResource } from '@/composables/useApiResource'

const route = useRoute()
const staffId = computed(() => String(route.params.slug ?? ''))
const { data: member, loading, error, reload } = useApiResource<StaffApiItem>(
  staffId,
  (id) => PersonalRepository.getById(id),
)
const name = computed(() => member.value?.persona?.nombre_completo || [
  member.value?.persona?.p_nombre,
  member.value?.persona?.p_apellido_paterno,
  member.value?.persona?.p_apellido_materno,
].filter(Boolean).join(' ') || 'Personal IETA')
const photo = computed(() => mediaUrl(member.value?.persona?.foto_url))
</script>

<template>
  <div>
    <SectionHeaderBand :title="name" :subtitle="member?.cargo?.nombre || 'Personal IETA'" />
    <main class="container staff-profile">
      <RouterLink class="staff-profile__back" to="/acerca-de/personal">Volver a Acerca de</RouterLink>
      <div v-if="loading" class="staff-profile__state" role="status">Cargando ficha…</div>
      <div v-else-if="error" class="staff-profile__state" role="alert">
        <EmptyState title="No se pudo cargar la ficha" action-label="Reintentar" @action="reload" />
      </div>
      <EmptyState v-else-if="!member" title="No se encontró la ficha de personal" />
      <article v-else class="staff-profile__content">
        <img v-if="photo" :src="photo" :alt="name" loading="lazy" />
        <div>
          <h2>{{ name }}</h2>
          <p class="staff-profile__role">{{ member.cargo?.nombre }}</p>
          <p v-if="member.descripcion">{{ member.descripcion }}</p>
          <a v-if="member.persona?.p_correo" :href="`mailto:${member.persona.p_correo}`">{{ member.persona.p_correo }}</a>
          <p v-if="member.fecha_ingreso">Ingreso: {{ member.fecha_ingreso }}</p>
        </div>
      </article>
    </main>
  </div>
</template>

<style scoped>
.staff-profile {
  min-height: 40vh;
  padding-block: var(--space-3) var(--space-8);
}

.staff-profile__back {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  margin-bottom: var(--space-3);
  font-weight: 600;
}

.staff-profile__content {
  display: grid;
  grid-template-columns: minmax(12rem, 0.4fr) minmax(0, 1fr);
  gap: var(--space-3);
  max-width: 58rem;
  margin-inline: auto;
  padding: var(--space-3);
  background: var(--color-superficie);
}

.staff-profile__content > img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
}

.staff-profile__content h2 {
  color: #202e71;
  font-size: var(--text-h4-size);
}

.staff-profile__role {
  margin-block: var(--space-1);
  color: var(--color-rosa-carmin);
  font-weight: 700;
}

.staff-profile__state {
  display: grid;
  min-height: 18rem;
  align-content: center;
  text-align: center;
}

@media (max-width: 640px) {
  .staff-profile__content {
    grid-template-columns: 1fr;
  }

  .staff-profile__content > img {
    max-width: 15rem;
  }
}
</style>
