import { defineStore } from 'pinia'
import { store } from '../index'
import { comparisonApi } from '@/api/common'
import type { ModelComparison, CollapseItem } from '../../types/system_config'

interface Task {
  hidden: number,
  feedforward: number,
  seq_size: null,
  model_names: string
}

interface ModelComporationState {
  comporationTasks: Task[]
  collapseList: CollapseItem[]
}

function transformData(comporationTasks: Task[]) {
  if (comporationTasks.length === 0) return []

  const keys = Object.keys(comporationTasks[0]).filter(key => key !== 'model_names')
  return keys.map((key) => {
    const llmTask = comporationTasks.find(item => item.model_names === 'llm')
    const moeTask = comporationTasks.find(item => item.model_names === 'moe')

    return {
      params: key,
      llm: llmTask ? llmTask[key] : null,
      moe: moeTask ? moeTask[key] : null
    }
  })
}

export const useModelComporationStore = defineStore('modelComporation', {
  state: (): ModelComporationState => {
    return {
      comporationTasks: [] as Task[],
      collapseList: [
        {
          collapseName: 1,
          headerName: "Model Parameters",
          iconName: 'vi-ant-design:bars-outlined'
        }, {
          collapseName: 2,
          headerName: "Hardware Parameters",
          iconName: 'vi-ant-design:bars-outlined'
        }, {
          collapseName: 3,
          headerName: "PD-Split Parameters",
          iconName: 'vi-ant-design:bars-outlined'
        }, {
          collapseName: 4,
          headerName: "PD-Split results",
          iconName: 'vi-ant-design:solution-outlined'
        }, {
          collapseName: 5,
          headerName: "PD-Split Charts",
          iconName: 'vi-ant-design:pie-chart-outlined'
        }
      ]
    }
  },
  getters: {
    getCurrentCollapseName: (state: ModelComporationState) => {
      return state.collapseList
    },
    getComporationTasks: (state: ModelComporationState) => {
      console.log(transformData(state.comporationTasks), "|  transformData(state.comporationTasks)");

      return transformData(state.comporationTasks)
    }
  },
  actions: {
    async fetchTasks() {
      // 实现获取任务列表的逻辑
      // const res = await fetch(' res = await fetch('URL_ADDRESS:3000/tasks')
      const tableData = [
        {
          hidden: 4096,
          feedforward: 14333,
          seq_size: null,
          model_names: 'llm'
        },
        {
          hidden: 222,
          feedforward: 333,
          seq_size: null,
          model_names: 'moe'
        }
      ]
      this.comporationTasks = tableData as Task[]
    }
  },
  persist: true
})

export const useuseModelComporationStoreStoreWithOut = () => {
  return useModelComporationStore(store)
}