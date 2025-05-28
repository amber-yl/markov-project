import { defineStore } from 'pinia'
import { store } from '../index'
import {
  markov_sim_get_sys_list,
  markov_sim_get_sys_detail_by_id,
  markov_sim_post_sys_create,
  markov_sim_post_sys_delete,
  markov_sim_post_sys_update
} from '@/api/request'
import type { SystemConfig, TableColumn, TableFilter, PaginationConfig } from '@/store/types'

interface SystemConfigState {
  configs: any[]
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
      { label: 'Operations', prop: 'operations', fixed: 'right', minWidth: '100', isShow: true }
    ],
    selectedConfigs: []
  }),

  getters: {
    // 获取可见的列
    visibleColumns: (state) => state.columns.filter((col) => col.isShow),

    // 获取隐藏的列
    hiddenColumns: (state) => state.columns.filter((col) => !col.isShow),

    // 获取过滤后的配置列表
    filteredConfigs: (state) => {
      let filtered = [...state.configs]

      // 应用过滤器
      Object.keys(state.filters).forEach((prop) => {
        const filterValue = state.filters[prop]
        if (Array.isArray(filterValue) && filterValue.length > 0) {
          filtered = filtered.filter((config) =>
            filterValue.includes(config[prop as keyof SystemConfig] as string)
          )
        } else if (typeof filterValue === 'string' && filterValue) {
          filtered = filtered.filter((config) =>
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
      Object.keys(state.filters).forEach((prop) => {
        const filterValue = state.filters[prop]
        if (Array.isArray(filterValue) && filterValue.length > 0) {
          filtered = filtered.filter((config) =>
            filterValue.includes(config[prop as keyof SystemConfig] as string)
          )
        } else if (typeof filterValue === 'string' && filterValue) {
          filtered = filtered.filter((config) =>
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
      const values = new Set(state.configs.map((config) => config[prop as keyof SystemConfig]))
      return Array.from(values)
    }
  },

  actions: {
    // 获取配置列表
    async fetchConfigs() {
      this.loading = true
      try {
        // 模拟数据，实际应该调用API
        const { data } = await markov_sim_get_sys_list()
        const { list, total } = data
        this.configs = list
        this.pagination.total = total
      } catch (error) {
        console.error('Failed to fetch configs:', error)
      } finally {
        this.loading = false
      }
    },

    // 创建配置
    async createConfig(data: SystemConfig) {
      this.loading = true
      try {
        const res = await markov_sim_post_sys_create(data)
        console.log(res, '| 创建配置')
      } catch (error) {
        console.error('Failed to create config:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 删除配置
    async deleteConfig(id: string) {
      this.loading = true
      try {
        // await configApi.deleteConfig(id)
        await markov_sim_post_sys_delete({ ids: id })
      } catch (error) {
        console.error('Failed to delete config:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 获取配置详情
    async getConfigDetail(id: string) {
      this.loading = true
      try {
        const res = await markov_sim_get_sys_detail_by_id(id)
        return res.data
      } catch (error) {
        console.error('Failed to fetch config detail:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 更新配置
    async updateConfig(id: number, data: SystemConfig) {
      this.loading = true
      try {
        // 通过id查找配置
        const config = this.configs.find((config) => config.id === id)
        if (!config) {
          throw new Error('Config not found')
        }
        // 更新配置
        Object.assign(config, data)
        // 发送更新请求
        const res = await markov_sim_post_sys_update(data)
        console.log(res, '| 更新配置')
      } catch (error) {
        console.error('Failed to update config:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 克隆配置实现
    async cloneConfig(id: number, newName: string) {
      this.loading = true
      try {
        const originalConfig = this.configs.find((config) => config.id === id)
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
      const column = this.columns.find((col) => col.prop === prop)
      if (column && column.prop !== 'operations') {
        column.isShow = visible
      }
    },

    // 批量设置列可见性
    setColumnsVisibility(columns: string[]) {
      this.columns.forEach((col) => {
        if (col.prop !== 'operations') {
          col.isShow = columns.includes(col.prop)
        }
      })
    },

    // 获取Transfer数据
    getTransferData() {
      return this.columns
        .filter((col) => col.prop !== 'operations')
        .map((col) => ({
          key: col.prop,
          label: col.label,
          disabled: false
        }))
    },

    // 获取右侧已选中的列
    getRightValue() {
      return this.columns
        .filter((col) => col.isShow && col.prop !== 'operations')
        .map((col) => col.prop)
    },

    // 处理Transfer变化
    handleTransferChange(targetKeys: string[]) {
      this.columns.forEach((col) => {
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
