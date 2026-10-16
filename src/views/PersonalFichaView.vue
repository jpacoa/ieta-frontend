<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import {
  ArrowLeft,
  Calendar,
  GraduationCap,
  Mail,
  User,
} from '@lucide/vue'
import EmptyState from '@/components/common/EmptyState.vue'
import SectionHeaderBand from '@/components/layout/SectionHeaderBand.vue'
import { mediaUrl } from '@/api/response'
import { PersonalRepository } from '@/api/repositories.js'
import type { StaffApiItem } from '@/api/types'
import { useApiResource } from '@/composables/useApiResource'
import { useGsapReveal } from '@/composables/useGsapReveal'

const route = useRoute()
const profileRoot = ref<HTMLElement | null>(null)
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
const roleName = computed(() => member.value?.cargo?.nombre || 'Investigador / Docente IETA')

useGsapReveal(profileRoot, {
  selector: '.profile-reveal',
  stagger: 0.08,
  y: 18,
})
</script>

<template>
  <div ref="profileRoot">
    <SectionHeaderBand :title="name" :subtitle="roleName" />

    <main class="container staff-profile">
      <!-- Back Navigation -->
      <nav class="staff-profile__nav profile-reveal" aria-label="Navegación de retorno">
        <RouterLink class="staff-profile__back" to="/acerca-de/personal">
          <ArrowLeft :size="16" aria-hidden="true" />
          <span>Volver al directorio de personal</span>
        </RouterLink>
      </nav>

      <!-- Loading State -->
      <div v-if="loading" class="profile-skeleton" role="status" aria-label="Cargando perfil">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-info">
          <div class="skeleton-line skeleton-line--title"></div>
          <div class="skeleton-line skeleton-line--role"></div>
          <div class="skeleton-line skeleton-line--bio"></div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="staff-profile__state" role="alert">
        <EmptyState
          title="No se pudo cargar la ficha de personal"
          description="Por favor verifica el identificador o inténtalo nuevamente."
          action-label="Reintentar"
          @action="reload"
        />
      </div>

      <!-- Not Found -->
      <EmptyState v-else-if="!member" title="No se encontró la ficha de personal" />

      <!-- Profile Card -->
      <article v-else class="profile-card profile-reveal">
        <div class="profile-card__accent"></div>

        <div class="profile-card__content">
          <!-- Photo or Monogram Avatar -->
          <div class="profile-card__media">
            <img
              v-if="photo"
              class="profile-card__photo"
              :src="photo"
              :alt="name"
              loading="lazy"
            />
            <div v-else class="profile-card__avatar-fallback" aria-hidden="true">
              <User :size="64" />
            </div>
          </div>

          <!-- Information Body -->
          <div class="profile-card__body">
            <div class="profile-card__header">
              <span class="profile-card__role-pill">
                <GraduationCap :size="14" aria-hidden="true" />
                <span>{{ roleName }}</span>
              </span>
              <h1 class="profile-card__name">{{ name }}</h1>
            </div>

            <!-- Description / Bio -->
            <div v-if="member.descripcion" class="profile-card__bio">
              <p>{{ member.descripcion }}</p>
            </div>
            <p v-else class="profile-card__bio-empty">
              Miembro del equipo de investigación y docencia del Instituto de Estadística Teórica y Aplicada.
            </p>

            <!-- Metadata List -->
            <div class="profile-card__meta-bar">
              <a
                v-if="member.persona?.p_correo"
                class="meta-btn meta-btn--email"
                :href="`mailto:${member.persona.p_correo}`"
              >
                <Mail :size="15" aria-hidden="true" />
                <span>{{ member.persona.p_correo }}</span>
              </a>

              <span v-if="member.fecha_ingreso" class="meta-pill">
                <Calendar :size="14" aria-hidden="true" />
                <span>Ingreso: {{ member.fecha_ingreso }}</span>
              </span>
            </div>
          </div>
        </div>
      </article>
    </main>
  </div>
</template>

<style scoped>
.staff-profile {
  min-height: 48vh;
  padding-block: var(--space-3) var(--space-8);
}

.staff-profile__nav {
  margin-bottom: var(--space-4);
}

.staff-profile__back {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--color-indigo);
  font-size: var(--text-small-size);
  font-weight: 700;
  text-decoration: none;
  transition: transform 0.15s ease, color 0.15s ease;
}

.staff-profile__back:hover {
  transform: translateX(-4px);
  color: var(--color-rosa-carmin);
}

/* Profile Card */
.profile-card {
  max-width: 58rem;
  margin-inline: auto;
  overflow: hidden;
  border: 1px solid var(--color-desactivado);
  border-radius: var(--radius-md);
  background: var(--color-blanco);
  box-shadow: 0 4px 20px rgba(20, 22, 28, 0.06);
}

.profile-card__accent {
  height: 4px;
  background: linear-gradient(90deg, var(--color-indigo) 0%, var(--color-rosa-carmin) 100%);
}

.profile-card__content {
  display: grid;
  grid-template-columns: minmax(13rem, 18rem) minmax(0, 1fr);
  gap: clamp(1.5rem, 3.5vw, 2.5rem);
  padding: clamp(1.5rem, 3.5vw, 2.5rem);
  align-items: start;
}

/* Media Avatar */
.profile-card__media {
  overflow: hidden;
  border-radius: var(--radius-md);
  box-shadow: 0 2px 10px rgba(20, 22, 28, 0.08);
  border: 1px solid var(--color-desactivado);
}

.profile-card__photo {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  display: block;
}

.profile-card__avatar-fallback {
  display: grid;
  width: 100%;
  aspect-ratio: 1;
  place-items: center;
  background: linear-gradient(135deg, #202b66 0%, #35449f 60%, #614aa3 100%);
  color: #fff;
  opacity: 0.9;
}

/* Body */
.profile-card__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.profile-card__role-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  background: rgba(243, 0, 96, 0.1);
  color: var(--color-rosa-carmin);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.profile-card__name {
  color: var(--color-indigo);
  font-size: clamp(1.6rem, 3.5vw, 2.25rem);
  font-weight: 700;
  line-height: 1.2;
}

.profile-card__bio {
  color: #3b4258;
  font-size: var(--text-body-size);
  line-height: 1.65;
  margin-top: 0.25rem;
}

.profile-card__bio-empty {
  color: #636b83;
  font-size: var(--text-body-size);
  font-style: italic;
  margin-top: 0.25rem;
}

.profile-card__meta-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  margin-top: var(--space-3);
  padding-top: var(--space-2);
  border-top: 1px solid var(--color-desactivado);
}

.meta-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.95rem;
  border-radius: var(--radius-sm);
  font-size: var(--text-small-size);
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.15s ease, background-color 0.15s ease;
}

.meta-btn--email {
  background: var(--color-indigo);
  color: var(--color-blanco);
}

.meta-btn--email:hover {
  background: #253381;
  transform: translateY(-2px);
}

.meta-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: #626a82;
  font-size: var(--text-small-size);
}

/* Skeleton Loading */
.profile-skeleton {
  max-width: 58rem;
  margin-inline: auto;
  display: grid;
  grid-template-columns: 16rem 1fr;
  gap: 2rem;
  padding: 2.5rem;
  background: #fff;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-desactivado);
}

.skeleton-avatar {
  aspect-ratio: 1;
  border-radius: var(--radius-md);
  background: #edeef5;
}

.skeleton-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-line--title {
  width: 70%;
  height: 2.5rem;
}

.skeleton-line--role {
  width: 40%;
  height: 1.5rem;
}

.skeleton-line--bio {
  width: 100%;
  height: 6rem;
}

.staff-profile__state {
  display: grid;
  min-height: 20rem;
  align-content: center;
  text-align: center;
}

@media (max-width: 680px) {
  .profile-card__content {
    grid-template-columns: 1fr;
  }
  .profile-card__media {
    max-width: 14rem;
    margin-inline: auto;
  }
  .profile-skeleton {
    grid-template-columns: 1fr;
  }
}
</style>
