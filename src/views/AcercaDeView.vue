<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import ContentCard from '@/components/common/ContentCard.vue'
import EditorJsContent from '@/components/common/EditorJsContent.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import LoadMoreButton from '@/components/common/LoadMoreButton.vue'
import TabNav from '@/components/common/TabNav.vue'
import SectionHeaderBand from '@/components/layout/SectionHeaderBand.vue'
import { SobreNosotrosRepository } from '@/api/repositories.js'
import { PersonalRepository } from '@/api/repositories.js'
import type { StaffApiItem } from '@/api/types'
import { mediaUrl } from '@/api/response'
import { usePaginatedResource } from '@/composables/usePaginatedResource'

interface AboutContent {
  id: number
  mision: string
  vision: string
  historia: string
  objetivos: unknown
  contenido: unknown
}

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const tabs = computed(() => [
  { value: 'quienes-somos', label: t('tabs.whoWeAre') },
  { value: 'mision-vision', label: t('tabs.missionVision') },
  { value: 'objetivos', label: t('tabs.objectives') },
  { value: 'personal', label: t('tabs.staff') },
  { value: 'reglamento', label: t('tabs.regulations') },
])
const activeTab = computed({
  get() {
    const routeTab = route.params.tab
    return typeof routeTab === 'string' && tabs.value.some((tab) => tab.value === routeTab)
      ? routeTab
      : 'quienes-somos'
  },
  set(tab: string) {
    void router.replace({
      name: 'acerca-de',
      params: { tab: tab === 'quienes-somos' ? undefined : tab },
    })
  },
})
const content = ref<AboutContent | null>(null)
const staffResource = usePaginatedResource<StaffApiItem>((page) => PersonalRepository.list({ page }))
const loading = ref(true)
const error = ref(false)

const apiBaseUrl = import.meta.env.VITE_API_URL

async function loadAboutContent() {
  loading.value = true
  error.value = false

  try {
    content.value = (await SobreNosotrosRepository.get()) as AboutContent
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

async function loadStaff() {
  await staffResource.refresh()
}

onMounted(loadAboutContent)
onMounted(loadStaff)
</script>

<template>
  <div>
    <SectionHeaderBand title="Acerca de" />

    <div class="container view-body">
      <TabNav v-model="activeTab" :items="tabs" :label="t('aria.aboutSections')" />

      <div v-if="loading" class="content-state" role="status" aria-live="polite">
        {{ t('common.loading') }}
      </div>

      <div v-else-if="error" class="content-state" role="alert">
        <p>{{ t('common.error') }}</p>
        <button class="retry-button" type="button" @click="loadAboutContent">
          {{ t('common.tryAgain') }}
        </button>
      </div>

      <template v-else-if="content">
        <section v-if="activeTab === 'quienes-somos'" class="about-panel">
          <h2>{{ t('about.whoWeAreHeading') }}</h2>
          <section v-if="content.historia" class="about-subsection">
            <h3>{{ t('about.historyHeading') }}</h3>
            <EditorJsContent :content="content.historia" :api-base-url="apiBaseUrl" />
          </section>

          <section v-if="content.contenido" class="about-subsection">
            <EditorJsContent :content="content.contenido" :api-base-url="apiBaseUrl" />
          </section>
          <EmptyState v-if="!content.historia && !content.contenido" />
        </section>

        <section v-else-if="activeTab === 'mision-vision'" class="about-panel mission-vision">
          <article v-if="content.mision" class="mission-vision__item">
            <h2>{{ t('about.missionHeading') }}</h2>
            <p>{{ content.mision }}</p>
          </article>
          <article v-if="content.vision" class="mission-vision__item">
            <h2>{{ t('about.visionHeading') }}</h2>
            <p>{{ content.vision }}</p>
          </article>
          <EmptyState v-if="!content.mision && !content.vision" />
        </section>

        <section v-else-if="activeTab === 'objetivos'" class="about-panel">
          <EditorJsContent v-if="content.objetivos" :content="content.objetivos" />
          <EmptyState v-else />
        </section>

        <section v-else-if="activeTab === 'personal'" class="about-panel">
          <div v-if="staffResource.loading.value && staffResource.items.value.length === 0" class="content-state" role="status">Cargando personal…</div>
          <div v-else-if="staffResource.error.value && staffResource.items.value.length === 0" class="content-state" role="alert">
            <p>{{ t('common.error') }}</p>
            <button class="retry-button" type="button" @click="loadStaff">{{ t('common.tryAgain') }}</button>
          </div>
          <div v-else-if="staffResource.items.value.length" class="staff-grid">
            <ContentCard
              v-for="member in staffResource.items.value.filter((person) => person.estado !== false)"
              :key="member.id"
              type="investigacion"
              :title="member.persona?.nombre_completo || [member.persona?.p_nombre, member.persona?.p_apellido_paterno, member.persona?.p_apellido_materno].filter(Boolean).join(' ') || 'Personal IETA'"
              :eyebrow="member.cargo?.nombre || t('tabs.staff')"
              :summary="member.descripcion || undefined"
              :image="mediaUrl(member.persona?.foto_url)"
              :image-alt="member.persona?.nombre_completo || t('tabs.staff')"
              :to="`/acerca-de/personal/${member.id}`"
            />
          </div>
          <EmptyState v-else :title="t('common.noResults')" />
          <LoadMoreButton
            :loading="staffResource.loadingMore.value"
            :has-more="staffResource.hasMore.value"
            @load="staffResource.loadMore"
          />
        </section>

        <EmptyState
          v-else
          :title="t('about.sectionUnavailable')"
          :description="t('about.sectionUnavailableDescription')"
        />
      </template>

      <EmptyState v-else :title="t('common.noResults')" />
    </div>
  </div>
</template>

<style scoped>
.view-body {
  padding-block: var(--space-6) var(--space-8);
  min-height: 40vh;
}

.about-panel {
  max-width: 78ch;
  min-height: 18rem;
  margin-inline: auto;
  padding-block: var(--space-4);
}

.about-panel :deep(h2) {
  margin-bottom: var(--space-2);
  font-size: var(--text-h4-size);
  line-height: var(--text-h4-lh);
}

.about-panel :deep(h3) {
  margin-bottom: var(--space-2);
  font-size: var(--text-h5-size);
  line-height: var(--text-h5-lh);
}

.about-panel :deep(p),
.about-panel :deep(ul) {
  margin-block: 0 var(--space-2);
  line-height: 1.75;
}

.about-panel :deep(ul) {
  padding-left: var(--space-3);
}

.about-panel :deep(iframe) {
  width: min(100%, 40rem);
  aspect-ratio: 16 / 9;
  height: auto;
  margin-block: var(--space-3);
  border: 0;
  border-radius: var(--radius-md);
}

.about-panel :deep(figure) {
  margin-block: var(--space-3);
}

.about-panel :deep(figcaption) {
  margin-top: var(--space-1);
  color: var(--color-violeta);
  font-size: var(--text-small-size);
}

.about-panel :deep(img) {
  max-width: min(100%, 40rem);
  height: auto;
  margin-block: var(--space-3);
  border-radius: var(--radius-sm);
}

.about-subsection {
  margin-top: var(--space-6);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-desactivado);
}

.mission-vision {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-3);
  max-width: 100%;
}

.mission-vision__item {
  padding: var(--space-3);
  border-top: 3px solid var(--color-rosa-carmin);
  background: var(--color-superficie);
}

.mission-vision__item h2 {
  font-size: var(--text-h5-size);
  line-height: 1.25;
}

.mission-vision__item p {
  line-height: 1.75;
}

.content-state {
  display: grid;
  justify-items: center;
  gap: var(--space-2);
  min-height: 18rem;
  align-content: center;
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
  .mission-vision {
    grid-template-columns: 1fr;
  }
}
</style>
