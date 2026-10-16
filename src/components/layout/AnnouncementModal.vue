<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { Bell, ExternalLink, X } from '@lucide/vue'
import { ComunicadosRepository } from '@/api/repositories.js'
import { mediaUrl, unwrapResource } from '@/api/response'
import type { AnnouncementApiItem } from '@/api/types'

const props = defineProps<{
  forcePreview?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const announcement = ref<AnnouncementApiItem | null>(null)
const dialog = ref<HTMLDialogElement | null>(null)
const flyer = ref<string | undefined>()
const isPreviewMode = ref(false)

const defaultPreviewAnnouncement: AnnouncementApiItem = {
  id: 9999,
  titulo: 'Convocatoria Abierta: Revista Varianza — Volumen 23',
  tipo: 'Comunicado Oficial',
  descripcion:
    'El Instituto de Estadística Teórica y Aplicada (IETA) invita a docentes, investigadores y estudiantes a presentar artículos científicos y de divulgación para la próxima edición indexada.',
  texto_boton: 'Ver bases y requisitos',
  enlace_url: '/revista-varianza/instrucciones',
  activo: true,
  flyer_url: '',
}

function openModal(data: AnnouncementApiItem, isPreview = false) {
  announcement.value = data
  flyer.value = data.flyer_url ? mediaUrl(data.flyer_url) : undefined
  isPreviewMode.value = isPreview
  void nextTick(() => {
    dialog.value?.showModal()
  })
}

function dismiss() {
  if (announcement.value && !isPreviewMode.value) {
    try {
      sessionStorage.setItem('ieta-dismissed-announcement', String(announcement.value.id))
    } catch {
      // Storage can be unavailable in private browsing contexts.
    }
  }
  dialog.value?.close()
  emit('close')
}

// Handler for global preview event from DevComponents or elsewhere
function handlePreviewEvent(event?: Event) {
  const customDetail = (event as CustomEvent<AnnouncementApiItem>)?.detail
  openModal(customDetail || defaultPreviewAnnouncement, true)
}

onMounted(async () => {
  window.addEventListener('ieta:open-announcement-preview', handlePreviewEvent)

  // Check URL query parameter ?preview=comunicado for easy testing
  const urlParams = new URLSearchParams(window.location.search)
  if (props.forcePreview || urlParams.get('preview') === 'comunicado' || urlParams.get('preview') === 'anuncio') {
    openModal(defaultPreviewAnnouncement, true)
    return
  }

  try {
    const active = unwrapResource<AnnouncementApiItem>(await ComunicadosRepository.getActive())
    if (!active || active.activo === false) return
    try {
      if (sessionStorage.getItem('ieta-dismissed-announcement') === String(active.id)) return
    } catch {
      // Show when storage is unavailable
    }
    openModal(active, false)
  } catch {
    announcement.value = null
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('ieta:open-announcement-preview', handlePreviewEvent)
})

defineExpose({
  openPreview: (custom?: AnnouncementApiItem) => openModal(custom || defaultPreviewAnnouncement, true),
  close: dismiss,
})
</script>

<template>
  <dialog
    ref="dialog"
    class="announcement-dialog"
    aria-labelledby="announcement-title"
    @click.self="dismiss"
    @close="announcement = null"
  >
    <article v-if="announcement" class="announcement-dialog__panel">
      <!-- Header Bar / Top Accent -->
      <div class="announcement-dialog__accent"></div>

      <!-- Close Button -->
      <button
        class="announcement-dialog__close"
        type="button"
        aria-label="Cerrar comunicado"
        @click="dismiss"
      >
        <X :size="18" aria-hidden="true" />
      </button>

      <!-- Flyer or Visual Banner -->
      <div v-if="flyer" class="announcement-dialog__flyer-wrapper">
        <img class="announcement-dialog__flyer" :src="flyer" :alt="announcement.titulo" />
      </div>
      <div v-else class="announcement-dialog__banner-fallback">
        <div class="announcement-dialog__icon-badge">
          <Bell :size="24" aria-hidden="true" />
        </div>
        <span class="announcement-dialog__badge">
          {{ isPreviewMode ? 'Vista previa · ' : '' }}{{ announcement.tipo || 'Comunicado institucional' }}
        </span>
      </div>

      <!-- Content Body -->
      <div class="announcement-dialog__body">
        <div v-if="flyer" class="announcement-dialog__type-pill">
          <Bell :size="14" aria-hidden="true" />
          <span>{{ isPreviewMode ? 'Vista previa · ' : '' }}{{ announcement.tipo || 'Comunicado oficial' }}</span>
        </div>

        <h2 id="announcement-title" class="announcement-dialog__title">
          {{ announcement.titulo }}
        </h2>

        <p v-if="announcement.descripcion" class="announcement-dialog__desc">
          {{ announcement.descripcion }}
        </p>

        <div class="announcement-dialog__footer">
          <a
            v-if="announcement.enlace_url"
            class="announcement-dialog__action"
            :href="announcement.enlace_url"
            :target="announcement.enlace_url.startsWith('http') ? '_blank' : '_self'"
            :rel="announcement.enlace_url.startsWith('http') ? 'noopener noreferrer' : ''"
            @click="dismiss"
          >
            <span>{{ announcement.texto_boton || 'Más información' }}</span>
            <ExternalLink :size="16" aria-hidden="true" />
          </a>

          <button
            class="announcement-dialog__dismiss-btn"
            type="button"
            @click="dismiss"
          >
            Entendido
          </button>
        </div>
      </div>
    </article>
  </dialog>
</template>

<style scoped>
.announcement-dialog {
  width: min(36rem, calc(100vw - 2rem));
  max-width: calc(100vw - 2rem);
  max-height: min(90vh, 52rem);
  padding: 0;
  overflow: hidden;
  border: 0;
  border-radius: var(--radius-lg);
  background: transparent;
  color: var(--color-tinta);
  box-shadow: 0 25px 60px -15px rgba(20, 22, 28, 0.35);
}

.announcement-dialog::backdrop {
  background: rgba(15, 20, 48, 0.72);
  backdrop-filter: blur(4px);
}

.announcement-dialog[open] {
  animation: modal-enter 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes modal-enter {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.announcement-dialog__panel {
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: var(--radius-lg);
  background: var(--color-blanco);
}

.announcement-dialog__accent {
  height: 5px;
  background: linear-gradient(90deg, var(--color-indigo) 0%, var(--color-rosa-carmin) 50%, var(--color-magenta) 100%);
}

.announcement-dialog__close {
  position: absolute;
  z-index: 10;
  top: 1rem;
  right: 1rem;
  display: grid;
  width: 2.25rem;
  height: 2.25rem;
  place-items: center;
  border: 1px solid rgba(20, 22, 28, 0.12);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  color: var(--color-tinta);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.18s ease, background-color 0.18s ease, color 0.18s ease;
}

.announcement-dialog__close:hover {
  transform: rotate(90deg);
  background: var(--color-tinta);
  color: var(--color-blanco);
}

.announcement-dialog__close:focus-visible {
  outline: 2px solid var(--color-rosa-carmin);
  outline-offset: 2px;
}

/* Banner Fallback when no flyer image exists */
.announcement-dialog__banner-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  padding: var(--space-4) var(--space-3) var(--space-2);
  background: linear-gradient(135deg, #1d255a 0%, #35449f 60%, #4c3b9b 100%);
  color: var(--color-blanco);
  text-align: center;
}

.announcement-dialog__icon-badge {
  display: grid;
  width: 3.5rem;
  height: 3.5rem;
  place-items: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.25);
  color: #ff9ec4;
}

.announcement-dialog__badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  background: rgba(243, 0, 96, 0.25);
  border: 1px solid rgba(243, 0, 96, 0.45);
  color: #ffd4e5;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.announcement-dialog__flyer-wrapper {
  max-height: 40vh;
  overflow: hidden;
  background: #1d255a;
}

.announcement-dialog__flyer {
  width: 100%;
  height: 100%;
  max-height: 40vh;
  object-fit: cover;
}

.announcement-dialog__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: clamp(1.25rem, 3.5vw, 2rem);
}

.announcement-dialog__type-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  align-self: flex-start;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  background: var(--color-superficie);
  color: var(--color-rosa-carmin);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.announcement-dialog__title {
  color: var(--color-indigo);
  font-size: clamp(1.25rem, 3.2vw, 1.55rem);
  font-weight: 700;
  line-height: 1.25;
}

.announcement-dialog__desc {
  color: #3f4454;
  font-size: var(--text-body-size);
  line-height: 1.6;
}

.announcement-dialog__footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-2);
  margin-top: var(--space-2);
  padding-top: var(--space-2);
  border-top: 1px solid var(--color-desactivado);
}

.announcement-dialog__action {
  display: inline-flex;
  min-height: 2.6rem;
  align-items: center;
  gap: 0.45rem;
  padding: 0.5rem 1.25rem;
  border-radius: var(--radius-sm);
  background: var(--color-rosa-carmin);
  color: var(--color-blanco);
  font-size: var(--text-small-size);
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 4px 14px rgba(243, 0, 96, 0.35);
  transition: transform 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease;
}

.announcement-dialog__action:hover {
  transform: translateY(-2px);
  background: #db0056;
  box-shadow: 0 6px 18px rgba(243, 0, 96, 0.45);
}

.announcement-dialog__dismiss-btn {
  display: inline-flex;
  min-height: 2.6rem;
  align-items: center;
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-desactivado);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-tinta);
  font-size: var(--text-small-size);
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.announcement-dialog__dismiss-btn:hover {
  background: var(--color-superficie);
  border-color: #c7c9d1;
}

@media (max-width: 480px) {
  .announcement-dialog__footer {
    flex-direction: column-reverse;
  }
  .announcement-dialog__footer > * {
    width: 100%;
    justify-content: center;
  }
}
</style>
