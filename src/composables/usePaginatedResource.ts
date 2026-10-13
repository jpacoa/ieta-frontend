import { computed, ref, shallowRef } from 'vue'
import { paginationHasMore, unwrapCollection } from '@/api/response'

export function usePaginatedResource<T>(fetchPage: (page: number) => Promise<unknown>) {
  const items = shallowRef<T[]>([])
  const page = ref(0)
  const loading = ref(false)
  const loadingMore = ref(false)
  const error = ref(false)
  const hasMore = ref(false)
  const isEmpty = computed(() => !loading.value && !error.value && items.value.length === 0)

  async function load(nextPage: number) {
    if (loading.value || loadingMore.value) return
    if (nextPage === 1) loading.value = true
    else loadingMore.value = true
    error.value = false

    try {
      const response = unwrapCollection<T>(await fetchPage(nextPage))
      items.value = nextPage === 1 ? response.data : [...items.value, ...response.data]
      page.value = response.meta?.current_page ?? nextPage
      hasMore.value = paginationHasMore(response.meta, page.value, response.data.length)
    } catch {
      error.value = true
    } finally {
      loading.value = false
      loadingMore.value = false
    }
  }

  function refresh() {
    return load(1)
  }

  function loadMore() {
    if (!hasMore.value) return Promise.resolve()
    return load(page.value + 1)
  }

  return { items, page, loading, loadingMore, error, hasMore, isEmpty, refresh, loadMore }
}
