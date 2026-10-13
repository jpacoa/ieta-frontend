<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import { X } from '@lucide/vue'
import { ComunicadosRepository } from '@/api/repositories.js'
import { mediaUrl, unwrapResource } from '@/api/response'
import type { AnnouncementApiItem } from '@/api/types'

const announcement = ref<AnnouncementApiItem | null>(null)
const dialog = ref<HTMLDialogElement | null>(null)
const flyer = ref<string | undefined>()

function dismiss() {
  if (announcement.value) {
    try {
      sessionStorage.setItem('ieta-dismissed-announcement', String(announcement.value.id))
    } catch {
      // Storage can be unavailable in private browsing contexts.
    }
  }
  dialog.value?.close()
}

onMounted(async () => {
  try {
    const active = unwrapResource<AnnouncementApiItem>(await ComunicadosRepository.getActive())
    if (!active || active.activo === false) return
    try {
      if (sessionStorage.getItem('ieta-dismissed-announcement') === String(active.id)) return
    } catch {
      // Show the active notice when storage is unavailable.
    }
    announcement.value = active
    flyer.value = mediaUrl(active.flyer_url)
    await nextTick()
    dialog.value?.showModal()
  } catch {
    announcement.value = null
  }
})
</script>

<template>
  <dialog ref="dialog" class="announcement-dialog" @click.self="dismiss" @close="announcement = null">
    <article v-if="announcement" class="announcement-dialog__panel" aria-labelledby="announcement-title">
      <button class="announcement-dialog__close" type="button" aria-label="Cerrar comunicado" @click="dismiss">
        <X :size="20" aria-hidden="true" />
      </button>
      <img v-if="flyer" class="announcement-dialog__flyer" :src="flyer" :alt="announcement.titulo" />
      <div class="announcement-dialog__body">
        <p class="announcement-dialog__type">{{ announcement.tipo || 'Comunicado institucional' }}</p>
        <h2 id="announcement-title">{{ announcement.titulo }}</h2>
        <p v-if="announcement.descripcion">{{ announcement.descripcion }}</p>
        <a
          v-if="announcement.enlace_url"
          class="announcement-dialog__action"
          :href="announcement.enlace_url"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ announcement.texto_boton || 'Más información' }}
        </a>
      </div>
    </article>
  </dialog>
</template>

<style scoped>
.announcement-dialog {
  width: min(42rem, calc(100vw - 2rem));
  max-width: calc(100vw - 2rem);
  max-height: min(90vh, 54rem);
  padding: 0;
  overflow: auto;
  border: 0;
  background: transparent;
  color: #14161c;
}

.announcement-dialog::backdrop {
  background: rgb(15 20 48 / 72%);
  backdrop-filter: blur(2px);
}

.announcement-dialog__panel {
  position: relative;
  overflow: hidden;
  border-top: 5px solid #f50088;
  background: #fff;
  box-shadow: 0 20px 70px rgb(0 0 0 / 28%);
}

.announcement-dialog__close {
  position: absolute;
  z-index: 1;
  top: 0.75rem;
  right: 0.75rem;
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  place-items: center;
  border: 1px solid rgb(255 255 255 / 45%);
  border-radius: 50%;
  background: rgb(32 46 113 / 88%);
  color: #fff;
  cursor: pointer;
}

.announcement-dialog__close:focus-visible,
.announcement-dialog__action:focus-visible {
  outline: 3px solid #f50088;
  outline-offset: 3px;
}

.announcement-dialog__flyer {
  width: 100%;
  max-height: 58vh;
  object-fit: contain;
  background: #202e71;
}

.announcement-dialog__body {
  display: grid;
  gap: var(--space-1);
  padding: clamp(1.25rem, 4vw, 2rem);
}

.announcement-dialog__type {
  color: #f50088;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.announcement-dialog__body h2 {
  color: #202e71;
  font-size: clamp(1.5rem, 5vw, 2rem);
  line-height: 1.2;
}

.announcement-dialog__body > p:not(.announcement-dialog__type) {
  line-height: 1.6;
}

.announcement-dialog__action {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  justify-self: start;
  margin-top: var(--space-1);
  padding-inline: var(--space-2);
  border-radius: var(--radius-sm);
  background: #f50088;
  color: #fff;
  font-weight: 700;
  text-decoration: none;
}
</style>
