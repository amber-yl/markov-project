import { defineStore } from 'pinia'
import type { ModelInfo, PerformanceIndicator, ResourceData } from '@/views/CardDetails/types'

export const useCardDetailsStore = defineStore('cardDetails', {
  state: () => ({
    modelInfo: null as ModelInfo | null,
    performanceIndicators: [] as PerformanceIndicator[],
    resourceData: [] as ResourceData[]
  }),

  actions: {
    async fetchModelInfo(modelId: string) {
      // 从API获取模型信息
    },
    async fetchPerformanceData(modelId: string) {
      // 从API获取性能数据
    },
    async fetchResourceData(modelId: string) {
      // 从API获取资源数据
    }
  }
})