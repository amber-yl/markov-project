import { defineStore } from 'pinia'
import { store } from '../index'

interface inferenceEvalInfo {
  isLock?: boolean
  password?: string
}

interface InferenceEvalInfoState {
  inferenceEvalInfo: inferenceEvalInfo
}

export const useInferenceEvalStore = defineStore('inferenceEval', {
  state: (): InferenceEvalInfoState => {
    return {
      inferenceEvalInfo: {
      }
    }
  },
  getters: {},
  actions: {},
  persist: true
})

export const useInferenceOptimalStore = defineStore('inferenceOptimal', {
  state: (): InferenceEvalInfoState => {
    return {
      inferenceEvalInfo: {
      }
    }
  },
  getters: {},
  actions: {},
  persist: true
})

export const useInferenceEvalStoreWithOut = () => {
  return useInferenceEvalStore(store)
}
export const useInferenceOptimalStoreWithOut = () => {
  return useInferenceOptimalStore(store)
}
