<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import EmptyState from './EmptyState.vue'

interface FilterOption {
  value: string
  label: string
}

interface FilterDefinition {
  key: string
  label: string
  options: FilterOption[]
}

const props = withDefaults(
  defineProps<{
    modelValue?: string
    filters?: FilterDefinition[]
    filterValues?: Record<string, string>
    noResults?: boolean
  }>(),
  {
    modelValue: '',
    filters: () => [],
    filterValues: () => ({}),
    noResults: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:filterValues': [values: Record<string, string>]
  clear: []
}>()

const { t } = useI18n()
const localSearch = ref(props.modelValue)
let searchTimer: ReturnType<typeof setTimeout> | undefined

watch(
  () => props.modelValue,
  (value) => {
    clearTimeout(searchTimer)
    localSearch.value = value
  },
)

function handleSearchInput() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => emit('update:modelValue', localSearch.value), 350)
}

function updateFilter(key: string, value: string) {
  emit('update:filterValues', { ...props.filterValues, [key]: value })
}

function clearFilters() {
  clearTimeout(searchTimer)
  localSearch.value = ''
  emit('update:modelValue', '')
  emit(
    'update:filterValues',
    Object.fromEntries(props.filters.slice(0, 2).map((filter) => [filter.key, ''])),
  )
  emit('clear')
}

onBeforeUnmount(() => clearTimeout(searchTimer))
</script>

<template>
  <div class="search-filter-bar">
    <div class="search-filter-bar__controls">
      <label class="search-filter-bar__search">
        <span class="search-filter-bar__label">{{ t('common.search') }}</span>
        <input
          v-model="localSearch"
          type="search"
          :placeholder="t('common.search')"
          @input="handleSearchInput"
        />
      </label>

      <label
        v-for="filter in filters.slice(0, 2)"
        :key="filter.key"
        class="search-filter-bar__filter"
      >
        <span class="search-filter-bar__label">{{ filter.label }}</span>
        <select
          :value="filterValues[filter.key] || ''"
          :aria-label="filter.label"
          @change="updateFilter(filter.key, ($event.target as HTMLSelectElement).value)"
        >
          <option value="">{{ t('common.all') }}</option>
          <option v-for="option in filter.options" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>
    </div>

    <EmptyState
      v-if="noResults"
      class="search-filter-bar__empty"
      :action-label="t('common.clearFilters')"
      @action="clearFilters"
    />
  </div>
</template>

<style scoped>
.search-filter-bar {
  display: grid;
  gap: var(--space-2);
}

.search-filter-bar__controls {
  display: grid;
  grid-template-columns: minmax(12rem, 2fr) repeat(2, minmax(9rem, 1fr));
  gap: var(--space-2);
  align-items: end;
}

.search-filter-bar__search,
.search-filter-bar__filter {
  display: grid;
  gap: var(--space-1);
  min-width: 0;
}

.search-filter-bar__label {
  color: var(--color-tinta);
  font-size: var(--text-small-size);
  font-weight: 600;
}

.search-filter-bar input,
.search-filter-bar select {
  width: 100%;
  min-height: 2.75rem;
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--color-desactivado);
  border-radius: var(--radius-sm);
  background: var(--color-blanco);
  color: var(--color-tinta);
  font: inherit;
}

.search-filter-bar input:focus-visible,
.search-filter-bar select:focus-visible {
  outline: 3px solid var(--color-resaltador);
  outline-offset: 2px;
}

.search-filter-bar__empty {
  padding-block: var(--space-6);
}

@media (max-width: 768px) {
  .search-filter-bar__controls {
    grid-template-columns: 1fr;
  }
}
</style>
