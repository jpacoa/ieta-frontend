<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import EditorJsContent from '@/components/common/EditorJsContent.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import SectionHeaderBand from '@/components/layout/SectionHeaderBand.vue'
import { ContactoRepository } from '@/api/repositories.js'

interface ContactInfo {
  id: number
  telefonos: string[]
  dia_inicio: string
  dia_fin: string
  hora_apertura: string
  hora_cierre: string
  direccion: string
  emails: string[]
  contenido: unknown
}

const { t } = useI18n()
const contact = ref<ContactInfo | null>(null)
const loading = ref(true)
const error = ref(false)
const apiBaseUrl = import.meta.env.VITE_API_URL

const openingHours = computed(() => {
  if (!contact.value) return ''
  return `${contact.value.dia_inicio} a ${contact.value.dia_fin}, ${formatTime(contact.value.hora_apertura)} a ${formatTime(contact.value.hora_cierre)}`
})

const mapUrl = computed(() => {
  if (!contact.value?.direccion) return undefined
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.value.direccion)}`
})

function formatTime(value: string): string {
  return value.slice(0, 5)
}

async function loadContact() {
  loading.value = true
  error.value = false

  try {
    const response = (await ContactoRepository.get()) as ContactInfo | { data: ContactInfo }
    contact.value = 'data' in response ? response.data : response
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(loadContact)
</script>

<template>
  <div>
    <SectionHeaderBand :title="t('contact.title')" />

    <main class="container contact-view">
      <div v-if="loading" class="contact-state" role="status" aria-live="polite">
        {{ t('common.loading') }}
      </div>

      <div v-else-if="error" class="contact-state" role="alert">
        <p>{{ t('common.error') }}</p>
        <button class="retry-button" type="button" @click="loadContact">
          {{ t('common.tryAgain') }}
        </button>
      </div>

      <template v-else-if="contact">
        <div class="contact-layout">
          <section class="contact-details" :aria-label="t('contact.details')">
            <div v-if="contact.telefonos?.length" class="contact-group">
              <h2>{{ t('contact.phones') }}</h2>
              <ul>
                <li v-for="phone in contact.telefonos" :key="phone">
                  <a :href="`tel:${phone.replace(/[^+\d]/g, '')}`">{{ phone }}</a>
                </li>
              </ul>
            </div>


            <div v-if="contact.emails?.length" class="contact-group">
              <h2>{{ t('contact.email') }}</h2>
              <ul>
                <li v-for="email in contact.emails" :key="email">
                  <a :href="`mailto:${email}`">{{ email }}</a>
                </li>
              </ul>
            </div>

            <div v-if="contact.direccion" class="contact-group">
              <h2>{{ t('contact.address') }}</h2>
              <p>{{ contact.direccion }}</p>
              <a
                v-if="mapUrl"
                :href="mapUrl"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ t('contact.openMap') }}
              </a>
            </div>

            <div v-if="openingHours" class="contact-group">
              <h2>{{ t('contact.hours') }}</h2>
              <p>{{ openingHours }}</p>
            </div>
          </section>

          <section v-if="contact.contenido" class="contact-content">
            <EditorJsContent :content="contact.contenido" :api-base-url="apiBaseUrl" />
          </section>
          <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3824.72581499431!2d-68.07045072484262!3d-16.539934184209898!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x915f21001b2ec101%3A0xf3c213514d2a060d!2sInstituto%20de%20Estad%C3%ADstica%20Te%C3%B3rica%20y%20Aplicada%20(IETA)!5e0!3m2!1ses!2sbo!4v1791734816299!5m2!1ses!2sbo" width="600" height="450" style="border:0;"  loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>

        </div>

        <EmptyState
          v-if="!contact.telefonos?.length && !contact.emails?.length && !contact.direccion && !contact.contenido"
          :title="t('common.noResults')"
        />
      </template>

      <EmptyState v-else :title="t('common.noResults')" />
    </main>
  </div>
</template>

<style scoped>
.contact-view {
  min-height: 40vh;
  padding-block: var(--space-6) var(--space-8);
}

.contact-layout {
  display: grid;
  grid-template-columns: minmax(16rem, 0.8fr) minmax(0, 1.2fr);
  gap: var(--space-6);
  align-items: start;
}

.contact-details {
  display: grid;
  gap: var(--space-3);
}

.contact-group {
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--color-desactivado);
}

.contact-group h2 {
  margin-bottom: var(--space-1);
  font-size: var(--text-h6-size);
  line-height: var(--text-h6-lh);
}

.contact-group ul {
  display: grid;
  gap: var(--space-1);
  padding: 0;
  list-style: none;
}

.contact-group p {
  margin-bottom: var(--space-1);
}

.contact-content {
  min-width: 0;
}

.contact-content :deep(h2),
.contact-content :deep(h3) {
  margin-block: var(--space-3) var(--space-2);
  font-size: var(--text-h5-size);
  line-height: var(--text-h5-lh);
}

.contact-content :deep(p) {
  margin-bottom: var(--space-2);
  line-height: 1.75;
}

.contact-content :deep(img) {
  width: 100%;
  max-height: 32rem;
  border-radius: var(--radius-md);
  object-fit: cover;
}

.contact-content :deep(figure) {
  margin-block: var(--space-3);
}

.contact-content :deep(figcaption) {
  margin-top: var(--space-1);
  color: var(--color-violeta);
  font-size: var(--text-small-size);
}

.contact-state {
  display: grid;
  min-height: 18rem;
  align-content: center;
  justify-items: center;
  gap: var(--space-2);
  text-align: center;
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

.retry-button:focus-visible {
  outline: 3px solid var(--color-resaltador);
  outline-offset: 2px;
}

@media (max-width: 768px) {
  .contact-layout {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }
}
</style>
