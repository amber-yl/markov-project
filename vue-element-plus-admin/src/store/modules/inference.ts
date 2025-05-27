import { defineStore } from 'pinia'
import { store } from '../index'
import { Task } from '../types'

interface InferenceEvalInfoState {
  allTasks: Task[]
  personalTasks: Task[]
  selectedTasks: Task[]
}

export const useInferenceEvalStore = defineStore('inferenceEval', {
  state: (): InferenceEvalInfoState => {
    return {
      allTasks: [] as Task[],
      personalTasks: [] as Task[],
      selectedTasks: [] as Task[]
    }
  },
  getters: {},
  actions: {
    async fetchTasks() {
      // 实现获取任务列表的逻辑
      // const res = await fetch(' res = await fetch('URL_ADDRESS:3000/tasks')
      const tableData = [
        {
          id: 1,
          name: 'Tom',
          model: 'model1',
          hardware: 'hardware1',
          deployment: 'deployment1',
          status: 'pending',
          createTime: '2023-06-01',
          updateTime: '2023-06-01',
          creator: 'creator1'
        },
        {
          id: 2,
          name: 'Jerry',
          model: 'model2',
          hardware: 'hardware2',
          deployment: 'deployment2',
          status: 'running',
          createTime: '2023-06-02',
          updateTime: '2023-06-02',
          creator: 'creator2'
        },
        {
          id: 3,
          name: 'Alice',
          model: 'model3',
          hardware: 'hardware3',
          deployment: 'deployment3',
          status: 'completed',
          createTime: '2023-06-03',
          updateTime: '2023-06-03',
          creator: 'creator3'
        },
        {
          id: 4,
          name: 'Bob',
          model: 'model4',
          hardware: 'hardware4',
          deployment: 'deployment4',
          status: 'failed',
          createTime: '2023-06-04',
          updateTime: '2023-06-04',
          creator: 'creator4'
        },
        {
          id: 5,
          name: 'Eve',
          model: 'model5',
          hardware: 'hardware5',
          deployment: 'deployment5',
          status: 'pending',
          createTime: '2023-06-05',
          updateTime: '2023-06-05',
          creator: 'creator5'
        },
        {
          id: 6,
          name: 'Mallory',
          model: 'model6',
          hardware: 'hardware6',
          deployment: 'deployment6',
          status: 'running',
          createTime: '2023-06-06',
          updateTime: '2023-06-06',
          creator: 'creator6'
        }
      ]
      this.allTasks = tableData as Task[]
    },
    async createTask(task: Task) {
      // 实现创建任务的逻辑
    },
    async deleteTask(task: Task) {},
    setSelectedTasks(tasks: Task[]) {
      this.selectedTasks = tasks
    }
  },
  persist: true
})

// export const useInferenceOptimalStore = defineStore('inferenceOptimal', {
//   state: (): InferenceEvalInfoState => {
//     return {
//       inferenceEvalInfo: {}
//     }
//   },
//   getters: {},
//   actions: {},
//   persist: true
// })

export const useInferenceEvalStoreWithOut = () => {
  return useInferenceEvalStore(store)
}
// export const useInferenceOptimalStoreWithOut = () => {
//   return useInferenceOptimalStore(store)
// }
