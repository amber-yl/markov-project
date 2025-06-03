import { ref, computed } from 'vue'

export function usePagination<T>(list: T[], defaultPageSize = 5) {
  console.log(list, "| list");

  const currentPage = ref(1)
  const pageSize = ref(defaultPageSize)
  const total = ref(list.length)

  const currentList = computed(() => {
    const startIndex = (currentPage.value - 1) * pageSize.value
    const endIndex = startIndex + pageSize.value
    return list.slice(startIndex, endIndex)
  })

  const handleCurrentChange = (val: number) => {
    currentPage.value = val
  }

  const handleSizeChange = (val: number) => {
    pageSize.value = val
    currentPage.value = 1
  }

  return {
    currentPage,
    pageSize,
    total,
    currentList,
    handleCurrentChange,
    handleSizeChange
  }
}
