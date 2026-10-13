<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterView } from 'vue-router'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import AnnouncementModal from '@/components/layout/AnnouncementModal.vue'
import { ConfiguracionRepository } from '@/api/repositories.js'
import { unwrapResource } from '@/api/response'
import type { InstitutionConfigApiItem } from '@/api/types'

const route = useRoute()
const footerVariant = computed(() =>
  route.path.startsWith('/revista-varianza') ? 'editorial' : 'default',
)
const institutionConfig = ref<InstitutionConfigApiItem | null>(null)

onMounted(async () => {
  try {
    institutionConfig.value = unwrapResource<InstitutionConfigApiItem>(await ConfiguracionRepository.get())
  } catch {
    institutionConfig.value = null
  }
})
</script>

<template>
  <div class="public-layout">
    <AppHeader :institution-config="institutionConfig" />

    <main class="main-content">
      <!-- Transición fade entre rutas — Guía §6.7 -->
      <RouterView v-slot="{ Component, route }">
        <Transition name="page-fade" mode="out-in">
          <component :is="Component" :key="route.path" />
        </Transition>
      </RouterView>
    </main>

    <AppFooter :variant="footerVariant" :institution-config="institutionConfig" />
    <AnnouncementModal />
  </div>
</template>

<style scoped>
.public-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  /* El header es fixed, las vistas internas con SectionHeaderBand
     ya contemplan el padding-top internamente.
     Para la home y otras vistas sin banda, se añade padding base. */
}

/* Transición fade entre páginas — Guía §6.7: 0.2-0.3s */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.2s ease;
}
.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}

/* Respetar prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .page-fade-enter-active,
  .page-fade-leave-active {
    transition: none;
  }
}
</style>
