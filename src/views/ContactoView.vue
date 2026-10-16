<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Clock3,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
} from '@lucide/vue'
import EditorJsContent from '@/components/common/EditorJsContent.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import SectionHeaderBand from '@/components/layout/SectionHeaderBand.vue'
import { ContactoRepository } from '@/api/repositories.js'
import { useGsapReveal } from '@/composables/useGsapReveal'

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
const contactRoot = ref<HTMLElement | null>(null)
const contact = ref<ContactInfo | null>(null)
const loading = ref(true)
const error = ref(false)
const apiBaseUrl = import.meta.env.VITE_API_URL

useGsapReveal(contactRoot, {
  selector: '.contact-reveal',
  stagger: 0.08,
  y: 18,
})

const openingHours = computed(() => {
  if (!contact.value || !contact.value.dia_inicio) return ''
  return `${contact.value.dia_inicio} a ${contact.value.dia_fin} · ${formatTime(contact.value.hora_apertura)} – ${formatTime(contact.value.hora_cierre)}`
})

const mapUrl = computed(() => {
  if (!contact.value?.direccion) return 'https://maps.google.com/?q=IETA+UMSA+La+Paz'
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.value.direccion)}`
})

function formatTime(value?: string): string {
  if (!value) return ''
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
  <div ref="contactRoot">
    <SectionHeaderBand
      :title="t('contact.title')"
    />

    <main class="contact-view">
      <!-- Loading Skeleton -->
      <div v-if="loading" class="container contact-skeleton" role="status" aria-live="polite">
        <div class="skeleton-grid">
          <div v-for="n in 4" :key="n" class="skeleton-card"></div>
        </div>
        <div class="skeleton-map"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="container contact-state" role="alert">
        <EmptyState
          title="No se pudo cargar la información de contacto"
          description="Ocurrió un problema de comunicación con el servidor institucional."
          action-label="Reintentar"
          @action="loadContact"
        />
      </div>

      <!-- Loaded Content -->
      <template v-else-if="contact">
        <!-- Top Section: Channels (Left) & Map (Right) -->
        <section class="container contact-main-grid contact-reveal" aria-label="Canales directos de atención y mapa">
          <!-- Left Column: 4 Channel Cards -->
          <div class="contact-cards-stack">
            <!-- Phone Card -->
            <article class="channel-card channel-card--phone">
              <div class="channel-card__icon-box">
                <Phone :size="24" aria-hidden="true" />
              </div>
              <div class="channel-card__body">
                <h2 class="channel-card__title">{{ t('contact.phones') }}:</h2>
                <div v-if="contact.telefonos?.length" class="channel-card__list">
                  <a
                    v-for="phone in contact.telefonos"
                    :key="phone"
                    class="channel-link"
                    :href="`tel:${phone.replace(/[^+\d]/g, '')}`"
                  >
                    {{ phone }}
                  </a>
                </div>
                <div v-else class="channel-card__list">
                  <a class="channel-link" href="tel:+5912612824">+591 261-2824</a>
                  <a class="channel-link" href="tel:+5912612844">+591 261-2844</a>
                </div>
              </div>
            </article>

            <!-- Hours Card -->
            <article class="channel-card channel-card--hours">
              <div class="channel-card__icon-box">
                <Clock3 :size="24" aria-hidden="true" />
              </div>
              <div class="channel-card__body">
                <h2 class="channel-card__title">{{ t('contact.hours') }}:</h2>
                <div class="channel-card__list">
                  <span class="channel-card__text">{{ contact.dia_inicio ? `${contact.dia_inicio} a ${contact.dia_fin}` : 'Lunes a Viernes' }}</span>
                  <span class="channel-card__text">{{ contact.hora_apertura ? `${formatTime(contact.hora_apertura)} a ${formatTime(contact.hora_cierre)} hrs.` : '08:00 a 16:00 hrs.' }}</span>
                </div>
              </div>
            </article>

            <!-- Address Card -->
            <article class="channel-card channel-card--address">
              <div class="channel-card__icon-box">
                <MapPin :size="24" aria-hidden="true" />
              </div>
              <div class="channel-card__body">
                <h2 class="channel-card__title">{{ t('contact.address') }}:</h2>
                <p class="channel-card__text">
                  {{ contact.direccion || 'Primer Piso, Bloque FCPN, Calle 27, Zona Cota-Cota' }}
                </p>
                <p class="channel-card__text channel-card__text--sub">La Paz – Bolivia.</p>
              </div>
            </article>

            <!-- Email Card -->
            <article class="channel-card channel-card--email">
              <div class="channel-card__icon-box">
                <Mail :size="24" aria-hidden="true" />
              </div>
              <div class="channel-card__body">
                <h2 class="channel-card__title">{{ t('contact.email') }}:</h2>
                <div v-if="contact.emails?.length" class="channel-card__list">
                  <a
                    v-for="email in contact.emails"
                    :key="email"
                    class="channel-link"
                    :href="`mailto:${email}`"
                  >
                    {{ email }}
                  </a>
                </div>
                <div v-else class="channel-card__list">
                  <a class="channel-link" href="mailto:ieta@umsa.bo">ieta@umsa.bo</a>
                  <a class="channel-link" href="mailto:ieta.estadistica@gmail.com">ieta.estadistica@gmail.com</a>
                </div>
              </div>
            </article>
          </div>

          <!-- Right Column: Interactive Map -->
          <div class="contact-map-card">
            <div class="map-frame-wrapper">
              <iframe
                class="map-iframe"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3824.72581499431!2d-68.07045072484262!3d-16.539934184209898!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x915f21001b2ec101%3A0xf3c213514d2a060d!2sInstituto%20de%20Estad%C3%ADstica%20Te%C3%B3rica%20y%20Aplicada%20(IETA)!5e0!3m2!1ses!2sbo!4v1791734816299!5m2!1ses!2sbo"
                width="100%"
                height="100%"
                style="border:0;"
                loading="lazy"
                referrerpolicy="strict-origin-when-cross-origin"
                title="Mapa del Instituto de Estadística Teórica y Aplicada (IETA)"
              ></iframe>
            </div>
          </div>
        </section>

        <!-- Bottom Full-Width Section: Oficinas (PDF Page 2) -->
        <section class="contact-offices-banner contact-reveal" aria-label="Instalaciones y Oficinas del IETA">
          <div class="container contact-offices-banner__inner">
            <div class="contact-offices-banner__content">
              <h2 class="contact-offices-banner__title">Oficinas</h2>
              <p class="contact-offices-banner__text">
                El IETA (Instituto de Estadística Teórica y Aplicada) dependiente de la Carrera de Estadística de la Facultad de Ciencias Puras y Naturales de la UMSA tiene sus oficinas en el primer piso del Edificio del Bloque FCPN en el campus universitario de Cota Cota.
              </p>
              <div v-if="contact.contenido" class="contact-extra-content">
                <EditorJsContent :content="contact.contenido" :api-base-url="apiBaseUrl" />
              </div>
            </div>

            <div class="contact-offices-banner__visual">
              <div class="office-photo-frame">
                <div class="office-door-badge">CARRERA DE ESTADÍSTICA</div>
                <div class="office-door-illustration">
                  <div class="office-glass-window">
                    <span class="office-pin-note">IETA</span>
                  </div>
                  <div class="office-wood-door">
                    <div class="office-handle"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </template>

      <EmptyState v-else :title="t('common.noResults')" />
    </main>
  </div>
</template>

<style scoped>
.contact-view {
  min-height: 48vh;
  padding-bottom: 0;
}

/* Top Section: Channels Stack + Map Side-by-Side */
.contact-main-grid {
  display: grid;
  grid-template-columns: 1fr 1.35fr;
  gap: clamp(1.25rem, 2.5vw, 2.25rem);
  margin-block: var(--space-6);
  align-items: stretch;
}

.contact-cards-stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.channel-card {
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  padding: 1.15rem 1.4rem;
  border: 1px solid rgba(220, 224, 235, 0.8);
  border-radius: var(--radius-md);
  background: var(--color-blanco);
  box-shadow: 0 4px 18px rgba(27, 20, 75, 0.04);
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, border-color 0.2s ease;
}

.channel-card:hover {
  transform: translateY(-2px);
  border-color: rgba(53, 68, 159, 0.35);
  box-shadow: 0 8px 24px -4px rgba(27, 20, 75, 0.08);
}

.channel-card__icon-box {
  display: grid;
  width: 2.85rem;
  height: 2.85rem;
  place-items: center;
  border-radius: 50%;
  background: rgba(53, 68, 159, 0.08);
  color: var(--color-indigo);
  flex-shrink: 0;
  margin-top: 0.15rem;
}

.channel-card--hours .channel-card__icon-box {
  background: rgba(113, 88, 159, 0.1);
  color: var(--color-violeta);
}

.channel-card--address .channel-card__icon-box {
  background: rgba(53, 68, 159, 0.08);
  color: var(--color-indigo);
}

.channel-card--email .channel-card__icon-box {
  background: rgba(243, 0, 96, 0.08);
  color: var(--color-rosa-carmin);
}

.channel-card__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.25rem;
}

.channel-card__title {
  color: #1b144b;
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.3;
}

.channel-card__list {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.channel-link {
  color: #2b3044;
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.15s ease;
}

.channel-link:hover {
  color: var(--color-rosa-carmin);
}

.channel-card__text {
  color: #434960;
  font-size: 0.95rem;
  line-height: 1.45;
}

.channel-card__text--sub {
  color: #636b83;
}

/* Map Card */
.contact-map-card {
  display: flex;
  flex-direction: column;
  min-height: 28rem;
}

.map-frame-wrapper {
  flex: 1;
  width: 100%;
  min-height: 28rem;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid rgba(220, 224, 235, 0.8);
  box-shadow: 0 4px 20px rgba(27, 20, 75, 0.06);
}

.map-iframe {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 28rem;
}

/* Bottom Oficinas Banner (PDF Page 2) */
.contact-offices-banner {
  background: #2b1b6d;
  color: var(--color-blanco);
  padding-block: clamp(3rem, 5vw, 4.5rem);
  margin-top: clamp(2.5rem, 4vw, 4rem);
}

.contact-offices-banner__inner {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: clamp(2rem, 4vw, 4rem);
  align-items: center;
}

.contact-offices-banner__title {
  color: var(--color-blanco);
  font-size: clamp(2rem, 3.5vw, 2.75rem);
  font-weight: 700;
  margin-bottom: 1.25rem;
  letter-spacing: -0.01em;
}

.contact-offices-banner__text {
  color: rgba(255, 255, 255, 0.92);
  font-size: clamp(1rem, 1.2vw, 1.15rem);
  line-height: 1.7;
}

.office-photo-frame {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.28);
  border: 4px solid rgba(255, 255, 255, 0.15);
  background: #fff;
  min-height: 22rem;
  display: flex;
  flex-direction: column;
}

.office-door-badge {
  background: #b52222;
  color: #fff;
  font-weight: 900;
  font-size: 0.95rem;
  letter-spacing: 0.08em;
  padding: 0.65rem 1rem;
  text-align: center;
  border-bottom: 2px solid #8e1818;
}

.office-door-illustration {
  flex: 1;
  background: linear-gradient(180deg, #e7ecf2 0%, #cfd7e4 100%);
  display: flex;
  align-items: stretch;
  padding: 1.5rem;
  gap: 1rem;
}

.office-glass-window {
  flex: 1;
  background: linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(200,225,245,0.7) 100%);
  border: 3px solid #7c889a;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: inset 0 2px 8px rgba(0,0,0,0.1);
}

.office-pin-note {
  background: #fbf5b7;
  color: #4b3d11;
  font-weight: 800;
  font-size: 0.85rem;
  padding: 0.5rem 0.85rem;
  border-radius: 2px;
  box-shadow: 1px 2px 6px rgba(0,0,0,0.15);
  transform: rotate(-3deg);
  border: 1px solid #ebd974;
}

.office-wood-door {
  flex: 0 0 45%;
  background: linear-gradient(90deg, #9d5926 0%, #b86e34 50%, #8b4c1e 100%);
  border: 4px solid #6b3711;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 0.75rem;
  position: relative;
  box-shadow: inset 0 0 12px rgba(0,0,0,0.3);
}

.office-handle {
  width: 12px;
  height: 48px;
  border-radius: 6px;
  background: linear-gradient(180deg, #d3c49e 0%, #9e8e66 100%);
  box-shadow: 1px 2px 4px rgba(0,0,0,0.35);
}

.contact-extra-content {
  margin-top: 1.5rem;
}

/* Skeleton Loading */
.contact-skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding-block: var(--space-6);
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
}

.skeleton-card {
  height: 8rem;
  border-radius: var(--radius-md);
  background: #edeef5;
}

.skeleton-map {
  height: 24rem;
  border-radius: var(--radius-md);
  background: #edeef5;
}

.contact-state {
  display: grid;
  min-height: 20rem;
  align-content: center;
  text-align: center;
}

/* Responsive */
@media (max-width: 960px) {
  .contact-main-grid {
    grid-template-columns: 1fr;
  }

  .contact-offices-banner__inner {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .office-photo-frame {
    max-width: 480px;
    margin-inline: auto;
    width: 100%;
  }
}
</style>
