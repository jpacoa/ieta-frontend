<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

interface TabItem {
  value: string
  label: string
}

const props = defineProps<{
  items: TabItem[]
  modelValue: string
  label?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { t } = useI18n()
const activeIndex = computed(() => {
  const index = props.items.findIndex((item) => item.value === props.modelValue)
  return Math.max(index, 0)
})

function selectTab(value: string) {
  emit('update:modelValue', value)
}

function moveFocus(event: KeyboardEvent, currentIndex: number) {
  if (props.items.length === 0) return

  const lastIndex = props.items.length - 1
  let nextIndex = currentIndex

  if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % props.items.length
  else if (event.key === 'ArrowLeft')
    nextIndex = (currentIndex - 1 + props.items.length) % props.items.length
  else if (event.key === 'Home') nextIndex = 0
  else if (event.key === 'End') nextIndex = lastIndex
  else return

  event.preventDefault()
  const nextTab = props.items[nextIndex]
  if (!nextTab) return

  selectTab(nextTab.value)
  const tabs = (
    event.currentTarget as HTMLElement
  ).parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
  tabs?.[nextIndex]?.focus()
}
</script>

<template>
  <div class="tab-nav-scroll">
    <div
      class="tab-nav"
      role="tablist"
      :aria-label="label || t('aria.tabs')"
      :style="{ '--tab-count': items.length, '--active-index': activeIndex }"
    >
      <button
        v-for="(item, index) in items"
        :key="item.value"
        class="tab-nav__tab"
        type="button"
        role="tab"
        :aria-selected="item.value === modelValue"
        :tabindex="item.value === modelValue ? 0 : -1"
        @click="selectTab(item.value)"
        @keydown="moveFocus($event, index)"
      >
        {{ item.label }}
      </button>
      <span class="tab-nav__indicator" aria-hidden="true"></span>
    </div>
  </div>
</template>

<style scoped>
.tab-nav-scroll {
  overflow-x: auto;
  scrollbar-width: thin;
}

.tab-nav {
  position: relative;
  display: grid;
  grid-template-columns: repeat(var(--tab-count), minmax(7.5rem, 1fr));
  min-width: max-content;
  border-bottom: 1px solid var(--color-desactivado);
}

.tab-nav__tab {
  min-height: 3rem;
  padding: var(--space-2);
  border: 0;
  background: transparent;
  color: var(--color-tinta);
  font: inherit;
  font-size: var(--text-small-size);
  font-weight: 500;
  cursor: pointer;
}

.tab-nav__tab:hover,
.tab-nav__tab[aria-selected='true'] {
  color: var(--color-rosa-carmin);
}

.tab-nav__tab:focus-visible {
  outline: 2px solid var(--color-resaltador);
  outline-offset: -3px;
}

.tab-nav__indicator {
  position: absolute;
  right: auto;
  bottom: -1px;
  left: 0;
  width: calc(100% / var(--tab-count));
  height: 3px;
  background: var(--color-rosa-carmin);
  transform: translateX(calc(var(--active-index) * 100%));
  transition: transform 0.25s ease;
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .tab-nav__indicator {
    transition: none;
  }
}
</style>
