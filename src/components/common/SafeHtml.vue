<script setup lang="ts">
import { computed } from 'vue'
import { sanitizeHtml } from '@/utils/sanitize'

const props = defineProps<{
  content: string
}>()

const cleanContent = computed(() => sanitizeHtml(props.content))
</script>

<template>
  <div class="safe-html-content" v-html="cleanContent"></div>
</template>