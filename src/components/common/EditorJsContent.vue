<script setup lang="ts">
import { computed } from 'vue'
import SafeHtml from './SafeHtml.vue'

interface RenderBlock {
  key: string
  html: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function renderList(items: unknown, ordered: boolean, depth = 0): string {
  if (!Array.isArray(items) || depth > 8) return ''

  const tag = ordered ? 'ol' : 'ul'
  const listItems = items
    .map((item) => {
      if (typeof item === 'string') return `<li>${item}</li>`
      if (!isRecord(item)) return ''

      const text = typeof item.content === 'string' ? item.content : ''
      const children = renderList(item.items, ordered, depth + 1)
      return `<li>${text}${children}</li>`
    })
    .join('')

  return `<${tag}>${listItems}</${tag}>`
}

function normalizeString(content: string): RenderBlock[] {
  const trimmed = content.trim()
  if (!trimmed) return []

  const html = /<\/?[a-z][\s\S]*>/i.test(trimmed)
    ? trimmed
    : trimmed
        .split(/\n+/)
        .filter(Boolean)
        .map((line) => `<p>${escapeHtml(line)}</p>`)
        .join('')

  return [{ key: 'text-content', html }]
}

function normalizeEditorJs(content: unknown): RenderBlock[] {
  if (typeof content === 'string') return normalizeString(content)
  if (!isRecord(content) || !Array.isArray(content.blocks)) return []

  return content.blocks.flatMap((block, index) => {
    if (!isRecord(block) || !isRecord(block.data)) return []

    const { type, data } = block
    const key = typeof block.id === 'string' ? block.id : `editor-block-${index}`

    if (type === 'paragraph' && typeof data.text === 'string') {
      return [{ key, html: `<p>${data.text}</p>` }]
    }

    if (type === 'header' && typeof data.text === 'string') {
      const level = typeof data.level === 'number' ? Math.min(Math.max(data.level, 2), 6) : 2
      return [{ key, html: `<h${level}>${data.text}</h${level}>` }]
    }

    if (type === 'list') {
      const ordered = data.style === 'ordered'
      const html = renderList(data.items, ordered)
      return html ? [{ key, html }] : []
    }

    if (type === 'image' && isRecord(data.file) && typeof data.file.url === 'string') {
      const imageUrl = escapeHtml(data.file.url)
      const caption = typeof data.caption === 'string' ? escapeHtml(data.caption) : ''
      const html = `<figure><img src="${imageUrl}" alt="${caption}">${caption ? `<figcaption>${caption}</figcaption>` : ''}</figure>`
      return [{ key, html }]
    }

    if (type === 'embed' && data.service === 'youtube' && typeof data.embed === 'string') {
      try {
        const embedUrl = new URL(data.embed)
        const isYoutubeEmbed =
          embedUrl.protocol === 'https:' &&
          [
            'youtube.com',
            'www.youtube.com',
            'youtube-nocookie.com',
            'www.youtube-nocookie.com',
          ].includes(embedUrl.hostname) &&
          /^\/embed\/[\w-]+$/.test(embedUrl.pathname)

        if (!isYoutubeEmbed) return []

        const width =
          typeof data.width === 'number' ? Math.min(Math.max(data.width, 320), 1200) : 640
        const height =
          typeof data.height === 'number' ? Math.min(Math.max(data.height, 180), 900) : 360
        const caption =
          typeof data.caption === 'string' ? escapeHtml(data.caption) : 'Video de YouTube'
        const html = `<figure><iframe src="${escapeHtml(embedUrl.href)}" width="${width}" height="${height}" title="${caption}" allowfullscreen></iframe>${data.caption ? `<figcaption>${caption}</figcaption>` : ''}</figure>`
        return [{ key, html }]
      } catch {
        return []
      }
    }

    return []
  })
}

const props = defineProps<{
  content: unknown
  apiBaseUrl?: string
}>()

const blocks = computed(() => normalizeEditorJs(props.content))
</script>

<template>
  <div class="editor-content">
    <SafeHtml
      v-for="block in blocks"
      :key="block.key"
      :content="block.html"
      :api-base-url="apiBaseUrl"
    />
  </div>
</template>

<style scoped>
.editor-content {
  display: grid;
  gap: var(--space-1);
}

.editor-content :deep(figure) {
  margin: var(--space-2) 0;
}

.editor-content :deep(figcaption) {
  margin-top: var(--space-1);
  color: var(--color-violeta);
  font-size: var(--text-small-size);
}
</style>
