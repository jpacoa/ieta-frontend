<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Clock3, Mail, MapPin, Phone } from '@lucide/vue'
import { ContactoRepository } from '@/api/repositories.js'
import logoIeta from '@/assets/images/logoieta_400.png'
import type { InstitutionConfigApiItem } from '@/api/types'
import { mediaUrl } from '@/api/response'

const props = withDefaults(defineProps<{
  variant?: 'default' | 'editorial'
  institutionConfig?: InstitutionConfigApiItem | null
}>(), { variant: 'default', institutionConfig: null })
const footerLogo = computed(() => mediaUrl(props.institutionConfig?.logo_principal_url) || logoIeta)
const institutionName = computed(() => props.institutionConfig?.nombre_institucion || 'Instituto de Estadística Teórica y Aplicada')
const institutionCopyright = computed(() => props.institutionConfig?.copyright || `© ${new Date().getFullYear()} IETA — Instituto de Estadística Teórica y Aplicada. Todos los derechos reservados.`)

interface ContactInfo {
  telefonos: string[]
  dia_inicio: string
  dia_fin: string
  hora_apertura: string
  hora_cierre: string
  direccion: string
  emails: string[]
}

const contact = ref<ContactInfo | null>(null)

onMounted(async () => {
  try {
    const response = (await ContactoRepository.get()) as ContactInfo | { data: ContactInfo }
    contact.value = 'data' in response ? response.data : response
  } catch {
    contact.value = null
  }
})

function phoneHref(phone: string) {
  return `tel:${phone.replace(/[^+\d]/g, '')}`
}

function formatTime(value: string) {
  return value.slice(0, 5)
}
</script>

<template>
  <footer class="app-footer" :class="`app-footer--${variant}`" aria-labelledby="footer-heading">
    <h2 id="footer-heading" class="visually-hidden">Pie de página</h2>

    <div class="footer-body">
      <div class="container footer-body__inner">
        <!-- ── Brand e info institucional ──────────────────────── -->
        <div class="footer-brand">
          <RouterLink to="/" class="footer-brand__logo" aria-label="IETA — Ir al inicio">
            <img :src="footerLogo" alt="" />
          </RouterLink>
          <p class="footer-brand__name">{{ institutionName }}</p>
          <p class="footer-brand__org">Universidad Mayor de San Andrés</p>

          <address v-if="contact || institutionConfig" class="footer-contact">
            <a
              v-if="institutionConfig?.email_principal"
              :href="`mailto:${institutionConfig.email_principal}`"
              class="footer-contact__item"
            >
              <Mail class="footer-contact__icon" aria-hidden="true" />
              {{ institutionConfig.email_principal }}
            </a>
            <a
              v-else
              v-for="email in contact?.emails || []"
              :key="email"
              :href="`mailto:${email}`"
              class="footer-contact__item"
            >
              <Mail class="footer-contact__icon" aria-hidden="true" />
              {{ email }}
            </a>
            <a
              v-if="institutionConfig?.telefono_principal"
              :href="phoneHref(institutionConfig.telefono_principal)"
              class="footer-contact__item"
            >
              <Phone class="footer-contact__icon" aria-hidden="true" />
              {{ institutionConfig.telefono_principal }}
            </a>
            <a
              v-else
              v-for="phone in contact?.telefonos || []"
              :key="phone"
              :href="phoneHref(phone)"
              class="footer-contact__item"
            >
              <Phone class="footer-contact__icon" aria-hidden="true" />
              {{ phone }}
            </a>
            <p v-if="institutionConfig?.direccion_principal || contact?.direccion" class="footer-contact__item">
              <MapPin class="footer-contact__icon" aria-hidden="true" />
              {{ institutionConfig?.direccion_principal || contact?.direccion }}
            </p>
            <p v-if="contact?.dia_inicio && contact?.dia_fin" class="footer-contact__item">
              <Clock3 class="footer-contact__icon" aria-hidden="true" />
              {{ contact.dia_inicio }} a {{ contact.dia_fin }},
              {{ formatTime(contact.hora_apertura) }}–{{ formatTime(contact.hora_cierre) }}
            </p>
          </address>
          <address v-else class="footer-contact">
            <RouterLink to="/contacto" class="footer-contact__item">
              <MapPin class="footer-contact__icon" aria-hidden="true" />
              Ver datos de contacto
            </RouterLink>
          </address>
        </div>

        <!-- ── Columnas de navegación ───────────────────────────── -->
        <nav class="footer-nav" aria-label="Navegación del pie de página">
          <div class="footer-nav__col">
            <h3 class="footer-nav__title">Institución</h3>
            <ul class="footer-nav__list">
              <li><RouterLink to="/acerca-de">¿Quiénes somos?</RouterLink></li>
              <li><RouterLink to="/acerca-de/mision-vision">Misión y Visión</RouterLink></li>
              <li><RouterLink to="/acerca-de/personal">Personal IETA</RouterLink></li>
              <li><RouterLink to="/acerca-de/reglamento">Reglamento Interno</RouterLink></li>
              <li><RouterLink to="/contacto">Contacto</RouterLink></li>
            </ul>
          </div>

          <div class="footer-nav__col">
            <h3 class="footer-nav__title">Investigación</h3>
            <ul class="footer-nav__list">
              <li>
                <RouterLink to="/investigacion/lineas-investigacion"
                  >Líneas de Investigación</RouterLink
                >
              </li>
              <li><RouterLink to="/investigacion/memorias">Memorias</RouterLink></li>
              <li><RouterLink to="/revista-varianza">Revista Varianza</RouterLink></li>
              <li><RouterLink to="/revista-varianza/ediciones">Todas las Ediciones</RouterLink></li>
            </ul>
          </div>

          <div class="footer-nav__col">
            <h3 class="footer-nav__title">Servicios y Recursos</h3>
            <ul class="footer-nav__list">
              <li><RouterLink to="/servicios">Servicios</RouterLink></li>
              <li><RouterLink to="/noticias">Noticias</RouterLink></li>
              <li><RouterLink to="/recursos">Banco de Datos</RouterLink></li>
              <li>
                <RouterLink to="/recursos/revistas-de-estadistica"
                  >Revistas de Estadística</RouterLink
                >
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </div>

    <!-- ── Barra inferior ─────────────────────────────────────── -->
    <div class="footer-bottom">
      <div class="container footer-bottom__inner">
        <p class="footer-bottom__copy">
          {{ institutionCopyright }}
        </p>
        <!-- Redes sociales — íconos funcionales con aria-label — Guía §9 -->
        <div class="footer-social" role="list" aria-label="Redes sociales">
          <a
            v-if="!institutionConfig || institutionConfig.redes_sociales?.facebook"
            :href="institutionConfig?.redes_sociales?.facebook || 'https://facebook.com'"
            target="_blank"
            rel="noopener noreferrer"
            class="footer-social__link"
            role="listitem"
            aria-label="IETA en Facebook (abre en nueva pestaña)"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path
                d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
              />
            </svg>
          </a>
          <a
            v-if="!institutionConfig || institutionConfig.redes_sociales?.twitter"
            :href="institutionConfig?.redes_sociales?.twitter || 'https://twitter.com'"
            target="_blank"
            rel="noopener noreferrer"
            class="footer-social__link"
            role="listitem"
            aria-label="IETA en X / Twitter (abre en nueva pestaña)"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path
                d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
              />
            </svg>
          </a>
          <a
            v-if="!institutionConfig || institutionConfig.redes_sociales?.youtube"
            :href="institutionConfig?.redes_sociales?.youtube || 'https://youtube.com'"
            target="_blank"
            rel="noopener noreferrer"
            class="footer-social__link"
            role="listitem"
            aria-label="IETA en YouTube (abre en nueva pestaña)"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path
                d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
              />
            </svg>
          </a>
          <a
            v-if="institutionConfig?.redes_sociales?.linkedin"
            :href="institutionConfig.redes_sociales.linkedin"
            target="_blank"
            rel="noopener noreferrer"
            class="footer-social__link footer-social__text-link"
            role="listitem"
            aria-label="IETA en LinkedIn (abre en nueva pestaña)"
          >in</a>
          <a
            v-if="institutionConfig?.redes_sociales?.instagram"
            :href="institutionConfig.redes_sociales.instagram"
            target="_blank"
            rel="noopener noreferrer"
            class="footer-social__link footer-social__text-link"
            role="listitem"
            aria-label="IETA en Instagram (abre en nueva pestaña)"
          >ig</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* ── Visually hidden (accesibilidad) ─────────────────────────── */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* ── Footer base ─────────────────────────────────────────────── */
.app-footer {
  background: var(--color-tinta);
  color: var(--color-blanco);
  margin-top: auto;
}

/* ── Body del footer ─────────────────────────────────────────── */
.footer-body {
  padding-block: var(--space-8);
}

.footer-body__inner {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: var(--space-8);
  align-items: start;
}

/* ── Brand ───────────────────────────────────────────────────── */
.footer-brand {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.footer-brand__logo {
  text-decoration: none;
  display: inline-block;
  margin-bottom: var(--space-1);
}
.footer-brand__acronym {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-blanco);
  line-height: 1;
  letter-spacing: -0.03em;
}
.footer-brand__name {
  font-size: var(--text-body-size);
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.4;
}
.footer-brand__org {
  font-size: var(--text-small-size);
  color: rgba(255, 255, 255, 0.55);
  margin-top: var(--space-1);
}

/* ── Contacto ────────────────────────────────────────────────── */
.footer-contact {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin-top: var(--space-3);
  font-style: normal;
}

.footer-contact__item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: var(--text-small-size);
  transition: color 0.15s ease;
}
.footer-contact__item:hover {
  color: var(--color-blanco);
}
.footer-contact__icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* ── Nav columnas ────────────────────────────────────────────── */
.footer-nav {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
}

.footer-nav__title {
  font-size: var(--text-small-size);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.45);
  margin-bottom: var(--space-2);
}

.footer-nav__list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-nav__list a {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: var(--text-small-size);
  line-height: 1.5;
  transition: color 0.15s ease;
}
.footer-nav__list a:hover {
  color: var(--color-blanco);
}
.footer-nav__list a:focus-visible {
  outline: 2px solid var(--color-rosa-carmin);
  outline-offset: 2px;
  border-radius: 2px;
}

/* ── Bottom bar ──────────────────────────────────────────────── */
.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-block: var(--space-3);
}

.footer-bottom__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.footer-bottom__copy {
  font-size: var(--text-small-size);
  color: rgba(255, 255, 255, 0.4);
}

/* ── Redes sociales ──────────────────────────────────────────── */
.footer-social {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.footer-social__link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}
.footer-social__link:hover {
  background-color: var(--color-rosa-carmin);
  color: var(--color-blanco);
}
.footer-social__link:focus-visible {
  outline: 2px solid var(--color-rosa-carmin);
  outline-offset: 3px;
}
.footer-social__link svg {
  width: 16px;
  height: 16px;
}

.footer-social__text-link {
  font-size: 0.75rem;
  font-weight: 800;
}

.app-footer--editorial {
  background: #fff;
  color: #14161c;
}

.app-footer--editorial .footer-body {
  padding-block: var(--space-2) 0;
}

.app-footer--editorial .footer-body__inner {
  grid-template-columns: 1fr;
  justify-items: center;
  gap: var(--space-1);
  text-align: center;
}

.app-footer--editorial .footer-brand {
  align-items: center;
  gap: 0.25rem;
}

.app-footer--editorial .footer-brand__logo {
  width: 4.25rem;
  height: 4.25rem;
  margin: 0;
}

.app-footer--editorial .footer-brand__logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.app-footer--editorial .footer-brand__name {
  color: #14161c;
  font-size: 0.9375rem;
  font-weight: 700;
}

.app-footer--editorial .footer-brand__org,
.app-footer--editorial .footer-nav {
  display: none;
}

.app-footer--editorial .footer-contact {
  align-items: center;
  gap: 0.1rem;
  margin-top: 0.25rem;
}

.app-footer--editorial .footer-contact__item {
  justify-content: center;
  color: #333;
  font-size: 0.75rem;
  line-height: 1.35;
}

.app-footer--editorial .footer-contact__icon {
  display: none;
}

.app-footer--editorial .footer-bottom {
  padding-block: var(--space-1) var(--space-2);
  border-top: 0;
  background: #fff;
}

.app-footer--editorial .footer-bottom__inner {
  flex-direction: column;
  justify-content: center;
  gap: 0.3rem;
  text-align: center;
}

.app-footer--editorial .footer-social {
  order: -1;
  gap: 0.5rem;
}

.app-footer--editorial .footer-social__link {
  width: 2rem;
  height: 2rem;
  background: transparent;
  color: #49328d;
}

.app-footer--editorial .footer-social__link:hover {
  background: #f4e8ef;
  color: #f50088;
}

.app-footer--editorial .footer-bottom__copy {
  color: #555;
  font-size: 0.6875rem;
}

/* ── Responsive ──────────────────────────────────────────────── */
@media (max-width: 1024px) {
  .footer-body__inner {
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }
  .footer-nav {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .footer-nav {
    grid-template-columns: 1fr 1fr;
  }
  .footer-bottom__inner {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
  }
}

@media (max-width: 480px) {
  .footer-nav {
    grid-template-columns: 1fr;
  }

  .app-footer--editorial .footer-bottom__inner {
    align-items: center;
  }
}
</style>
