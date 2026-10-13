<script setup lang="ts">
import MediaGallery, { type MediaGalleryItem } from '@/components/multimedia/MediaGallery.vue'
import SectionHeaderBand from '@/components/layout/SectionHeaderBand.vue'

const galleryItems: MediaGalleryItem[] = []
</script>

<template>
  <div class="multimedia-view">
    <SectionHeaderBand
      title="Multimedia"
      subtitle="Fotografías y videos de las actividades, espacios e iniciativas del IETA."
    />
    <main class="container multimedia-view__main">
      <header class="multimedia-view__heading">
        <p>Archivo institucional</p>
        <h2>Galería del IETA</h2>
      </header>
      <MediaGallery :items="galleryItems" />
    </main>
  </div>
</template>

<style scoped>
.multimedia-view {
  min-height: 48vh;
  background: #f5f5f8;
}

.multimedia-view__main {
  padding-block: var(--space-5) var(--space-8);
}

.multimedia-view__heading {
  margin-bottom: var(--space-3);
}

.multimedia-view__heading p {
  margin-bottom: 0.35rem;
  color: #f30060;
  font-size: var(--text-small-size);
  font-weight: 700;
  text-transform: uppercase;
}

.multimedia-view__heading h2 {
  color: #202e71;
  font-size: var(--text-h4-size);
}
</style>
