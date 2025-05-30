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
  configs: SystemConfig[]
  loading: boolean
  pagination: PaginationConfig
  filters: TableFilter
  columns: TableColumn[]
  selectedConfigs: string[]
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
      { label: '硬件名称', prop: 'name', minWidth: '150', isShow: true },
      { label: '硬件类型', prop: 'type', minWidth: '120', isShow: true },
      { label: '创建时间', prop: 'created_at', minWidth: '120', isShow: true },
      { label: '更新时间', prop: 'updated_at', minWidth: '120', isShow: false },
      { label: '性能模式', prop: 'processing_mode', minWidth: '120', isShow: true },
      { label: 'Cube-float16-理论算力', prop: 'matrix.float16.tflops', minWidth: '180', isShow: true },
      { label: 'Cube-float16-利用率', prop: 'matrix.float16.calibration_coefficient', minWidth: '180', isShow: false },
      { label: 'Vector-float16-理论算力', prop: 'vector.float16.tflops', minWidth: '180', isShow: false },
      { label: 'Vector-float16-利用率', prop: 'vector.float16.calibration_coefficient', minWidth: '180', isShow: false },
      { label: '显存容量', prop: 'men1.GiB', minWidth: '120', isShow: false },
      { label: '显存带宽', prop: 'men1.GiBps', minWidth: '120', isShow: false },
      { label: 'Cube算力利用率', prop: 'men1.cube_calibration_coefficient', minWidth: '180', isShow: false },
      { label: 'Vector算力利用率', prop: 'men1.vector_calibration_coefficient', minWidth: '180', isShow: false },
      { label: 'GPU内存容量', prop: 'men2.GiB', minWidth: '120', isShow: false },
      { label: 'GPU内存带宽', prop: 'men2.GiBps', minWidth: '120', isShow: false },
      { label: '网络相关', prop: 'netWorks', minWidth: '120', isShow: false },
      { label: '操作', prop: 'operations', fixed: 'right', minWidth: '200', isShow: true }

    ],
    selectedConfigs: []
  }),

  getters: {
    // 获取可见的列
    visibleColumns: (state) => state.columns.filter((col) => {
      return col.isShow
    }),

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
      if (Object.keys(state.filters).length > 0) {
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
      }
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
        const { data } = await markov_sim_get_sys_list()
        const { list } = data
        // 确保所有配置都有id字段
        this.configs = list.map((item: any) => ({
          ...item
        }))

        console.log(this.configs, "| this.configs");

        this.pagination.total = this.configs.length
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
        await markov_sim_post_sys_create(data)
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
        console.log(res.data);
        return res.data
      } catch (error) {
        console.error('Failed to fetch config detail:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 更新配置
    async updateConfig(id: string, data: SystemConfig) {
      this.loading = true
      try {
        // 通过id查找配置
        const config = this.configs.find((config) => config.id === id)
        if (!config) {
          throw new Error('Config not found')
        }
        // 更新配置
        // 发送更新请求
        await markov_sim_post_sys_update(Object.assign(data, { id }))
      } catch (error) {
        console.error('Failed to update config:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 克隆配置实现
    async cloneConfig(id: string, newName: string) {
      this.loading = true
      try {
        const originalConfig = this.configs.find((config) => config.id === id)
        if (originalConfig) {
          const clonedConfig: SystemConfig = {
            ...originalConfig,
            id: String(Date.now()),
            name: newName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
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
    setSelectedConfigs(ids: string[]) {
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

  // persist: true
})

export const useSystemConfigStoreWithOut = () => {
  return useSystemConfigStore(store)
}
