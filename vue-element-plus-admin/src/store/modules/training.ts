import { defineStore } from 'pinia'
import { store } from '../index'

interface trainingLLMEvalInfo {
  isLock?: boolean
  password?: string
}

interface TrainingLLMEvalState {
  trainingLLMEvalInfo: trainingLLMEvalInfo
}

export const useTrainingLLMEvalStore = defineStore('trainingLLMEval', {
  state: (): TrainingLLMEvalState => {
    return {
      trainingLLMEvalInfo: {}
    }
  },
  getters: {},
  actions: {},
  persist: true
})
export const useTrainingMMEvalStore = defineStore('trainingMMEval', {
  state: (): TrainingLLMEvalState => {
    return {
      trainingLLMEvalInfo: {}
    }
  },
  getters: {},
  actions: {},
  persist: true
})

export const useTrainingLLMOptimalStore = defineStore('trainingLLMOptimal', {
  state: (): TrainingLLMEvalState => {
    return {
      trainingLLMEvalInfo: {}
    }
  },
  getters: {},
  actions: {},
  persist: true
})
export const useTrainingMMOptimalStore = defineStore('trainingMMOptimal', {
  state: (): TrainingLLMEvalState => {
    return {
      trainingLLMEvalInfo: {}
    }
  },
  getters: {},
  actions: {},
  persist: true
})
export const useTrainingLLMEvalStoreWithOut = () => {
  return useTrainingLLMEvalStore(store)
}
export const useTrainingLLMOptimalStoreWithOut = () => {
  return useTrainingLLMOptimalStore(store)
}
export const useTrainingMMEvalStoreWithOut = () => {
  return useTrainingMMEvalStore(store)
}
export const useTrainingMMOptimalStoreWithOut = () => {
  return useTrainingMMOptimalStore(store)
}


