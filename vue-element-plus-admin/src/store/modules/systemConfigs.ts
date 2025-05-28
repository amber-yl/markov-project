import { defineStore } from 'pinia'
import { store } from '../index'
import { configApi } from '@/api/common'
import type {
  SystemConfig,
  ConfigFormData,
  TableColumn,
  TableFilter,
  PaginationConfig
} from '@/store/types'

interface SystemConfigState {
  configs: SystemConfig[]
  loading: boolean
  pagination: PaginationConfig
  filters: TableFilter
  columns: TableColumn[]
  selectedConfigs: number[]
}

export const useSystemConfigStore = defineStore('systemConfig', {
  state: (): SystemConfigState => ({
    configs: [],
    loading: false,
    pagination: {
      currentPage: 1,
      pageSize: 10,
      total: 0,
      pageSizes: [5, 10, 20, 30, 40]
    },
    filters: {},
    columns: [
      { label: 'Date', prop: 'date', isShow: true, fixed: 'left', minWidth: '50' },
      { label: 'Name', prop: 'name', isShow: true, minWidth: '50' },
      { label: 'Address', prop: 'address', isShow: true, minWidth: '100' },
      { label: 'Zip', prop: 'zip', isShow: false, minWidth: '50' },
      { label: 'Tag', prop: 'tag', isShow: false, minWidth: '50' },
      { label: 'Operations', prop: 'operations', fixed: 'right', minWidth: '100', isShow: true }
    ],
    selectedConfigs: []
  }),

  getters: {
    // 获取可见的列
    visibleColumns: (state) => state.columns.filter(col => col.isShow),

    // 获取隐藏的列
    hiddenColumns: (state) => state.columns.filter(col => !col.isShow),

    // 获取过滤后的配置列表
    filteredConfigs: (state) => {
      let filtered = [...state.configs]

      // 应用过滤器
      Object.keys(state.filters).forEach(prop => {
        const filterValue = state.filters[prop]
        if (Array.isArray(filterValue) && filterValue.length > 0) {
          filtered = filtered.filter(config =>
            filterValue.includes(config[prop as keyof SystemConfig] as string)
          )
        } else if (typeof filterValue === 'string' && filterValue) {
          filtered = filtered.filter(config =>
            String(config[prop as keyof SystemConfig])
              .toLowerCase()
              .includes(filterValue.toLowerCase())
          )
        }
      })

      return filtered
    },

    // 获取分页后的配置列表
    paginatedConfigs: (state) => {
      let filtered = [...state.configs]

      // 应用过滤器
      Object.keys(state.filters).forEach(prop => {
        const filterValue = state.filters[prop]
        if (Array.isArray(filterValue) && filterValue.length > 0) {
          filtered = filtered.filter(config =>
            filterValue.includes(config[prop as keyof SystemConfig] as string)
          )
        } else if (typeof filterValue === 'string' && filterValue) {
          filtered = filtered.filter(config =>
            String(config[prop as keyof SystemConfig])
              .toLowerCase()
              .includes(filterValue.toLowerCase())
          )
        }
      })

      const startIndex = (state.pagination.currentPage - 1) * state.pagination.pageSize
      const endIndex = startIndex + state.pagination.pageSize
      return filtered.slice(startIndex, endIndex)
    },

    // 获取某列的所有唯一值
    getColumnValues: (state) => (prop: string) => {
      const values = new Set(state.configs.map(config => config[prop as keyof SystemConfig]))
      return Array.from(values)
    }
  },

  actions: {
    // 获取配置列表
    async fetchConfigs(params?: {
      page?: number
      pageSize?: number
      type?: string
    }) {
      this.loading = true
      try {
        // 模拟数据，实际应该调用API
        const mockData = [
          {
            id: 1,
            name: 'Config 1',
            type: 'llm-08',
            value: { model: 'llama_3_8b' },
            description: 'Test config 1',
            createTime: '2023-06-01',
            updateTime: '2023-06-01'
          },
          {
            id: 2,
            name: 'Config 2',
            type: 'llm-16',
            value: { model: 'llama_3_70b' },
            description: 'Test config 2',
            createTime: '2023-06-02',
            updateTime: '2023-06-02'
          }
        ]

        this.configs = mockData
        this.pagination.total = mockData.length

        // 实际API调用
        // const response = await configApi.getConfigs(params)
        // this.configs = response.data.list
        // this.pagination.total = response.data.total
      } catch (error) {
        console.error('Failed to fetch configs:', error)
      } finally {
        this.loading = false
      }
    },

    // 创建配置
    async createConfig(data: ConfigFormData) {
      this.loading = true
      try {
        // const response = await configApi.createConfig(data)
        // this.configs.unshift(response.data)
        // this.pagination.total++

        // 模拟创建
        const newConfig: SystemConfig = {
          id: Date.now(),
          name: data.newName,
          type: data.useType,
          value: data,
          createTime: new Date().toISOString(),
          updateTime: new Date().toISOString()
        }
        this.configs.unshift(newConfig)
        this.pagination.total++

        return newConfig
      } catch (error) {
        console.error('Failed to create config:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 更新配置
    async updateConfig(id: number, data: Partial<ConfigFormData>) {
      this.loading = true
      try {
        // const response = await configApi.updateConfig(id, data)
        const index = this.configs.findIndex(config => config.id === id)
        if (index !== -1) {
          this.configs[index] = {
            ...this.configs[index],
            ...data,
            updateTime: new Date().toISOString()
          }
        }
      } catch (error) {
        console.error('Failed to update config:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 删除配置
    async deleteConfig(id: number) {
      this.loading = true
      try {
        // await configApi.deleteConfig(id)
        const index = this.configs.findIndex(config => config.id === id)
        if (index !== -1) {
          this.configs.splice(index, 1)
          this.pagination.total--
        }
      } catch (error) {
        console.error('Failed to delete config:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 克隆配置
    async cloneConfig(id: number, newName: string) {
      this.loading = true
      try {
        // const response = await configApi.cloneConfig(id, newName)
        const originalConfig = this.configs.find(config => config.id === id)
        if (originalConfig) {
          const clonedConfig: SystemConfig = {
            ...originalConfig,
            id: Date.now(),
            name: newName,
            createTime: new Date().toISOString(),
            updateTime: new Date().toISOString()
          }
          this.configs.unshift(clonedConfig)
          this.pagination.total++
          return clonedConfig
        }
      } catch (error) {
        console.error('Failed to clone config:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 设置过滤器
    setFilter(prop: string, value: string[] | string) {
      this.filters[prop] = value
      this.pagination.currentPage = 1 // 重置到第一页
    },

    // 清除过滤器
    clearFilter(prop?: string) {
      if (prop) {
        delete this.filters[prop]
      } else {
        this.filters = {}
      }
      this.pagination.currentPage = 1
    },

    // 设置列可见性
    setColumnVisibility(prop: string, visible: boolean) {
      const column = this.columns.find(col => col.prop === prop)
      if (column && column.prop !== 'operations') {
        column.isShow = visible
      }
    },

    // 批量设置列可见性
    setColumnsVisibility(columns: string[]) {
      this.columns.forEach(col => {
        if (col.prop !== 'operations') {
          col.isShow = columns.includes(col.prop)
        }
      })
    },

    // 获取Transfer数据
    getTransferData() {
      return this.columns
        .filter(col => col.prop !== 'operations')
        .map(col => ({
          key: col.prop,
          label: col.label,
          disabled: false
        }))
    },

    // 获取右侧已选中的列
    getRightValue() {
      return this.columns
        .filter(col => col.isShow && col.prop !== 'operations')
        .map(col => col.prop)
    },

    // 处理Transfer变化
    handleTransferChange(targetKeys: string[]) {
      this.columns.forEach(col => {
        if (col.prop !== 'operations') {
          col.isShow = targetKeys.includes(col.prop)
        }
      })
    },

    // 设置分页
    setPagination(pagination: Partial<PaginationConfig>) {
      this.pagination = { ...this.pagination, ...pagination }
    },

    // 设置选中的配置
    setSelectedConfigs(ids: number[]) {
      this.selectedConfigs = ids
    },

    // 重置状态
    resetState() {
      this.configs = []
      this.filters = {}
      this.pagination.currentPage = 1
      this.selectedConfigs = []
    }
  },

  persist: true
})

export const useSystemConfigStoreWithOut = () => {
  return useSystemConfigStore(store)
} 