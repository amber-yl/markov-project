import { ref } from 'vue'
import { useInferenceEvalStore } from '@/store/modules/inference'

export const useInferenceData = () => {
  const store = useInferenceEvalStore()
  const loading = ref(false)

  const fetchData = async () => {
    loading.value = true
    try {
      await store.fetchTasks()
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    fetchData
  }
}
