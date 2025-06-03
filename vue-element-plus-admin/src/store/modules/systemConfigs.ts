import { defineStore } from 'pinia'
import { store } from '../index'
import {
  markov_sim_get_all_configs,
  markov_sim_get_config_by_id,
  markov_sim_create_config,
  markov_sim_delete_configs_by_ids,
  markov_sim_update_config,
  markov_sim_get_create_model_schema,
  markov_sim_get_config_stats
} from '@/api/request'
import type { SystemConfig, TableColumn, TableFilter, PaginationConfig } from '@/store/types'
import { ElMessage } from 'element-plus'
import { uiConfig } from '../config'

interface SystemConfigState {
  configs: SystemConfig[]
  loading: boolean
  pagination: PaginationConfig
  filters: TableFilter
  columns: TableColumn[]
  selectedConfigs: string[]
  schemeConfigs: any
  serverPagination: {
    total: number
    page: number
    per_page: number
    total_pages: number
  }
  sortConfig: {
    order_bys: string[]
  }
}

export const useSystemConfigStore = defineStore('systemConfig', {
  state: (): SystemConfigState => ({
    configs: [],
    schemeConfigs: {
      uiConfig: uiConfig
    },
    loading: false,
    pagination: {
      currentPage: 1,
      pageSize: 10,
      total: 0,
      pageSizes: [5, 10, 20, 30, 40, 50]
    },
    serverPagination: {
      total: 0,
      page: 1,
      per_page: 10,
      total_pages: 0
    },
    sortConfig: {
      order_bys: []
    },
    filters: {},
    columns: [
      { label: '硬件名称', prop: 'name', minWidth: '150', isShow: false },
      { label: '硬件类型', prop: 'type', minWidth: '120', isShow: false },
      { label: '创建时间', prop: 'created_at', minWidth: '160', isShow: false },
      { label: '更新时间', prop: 'updated_at', minWidth: '160', isShow: false },
      { label: '性能模式', prop: 'processing_mode', minWidth: '120', isShow: false },
      {
        label: 'Cube-理论算力',
        prop: 'matrix.float16.tflops',
        minWidth: '180',
        isShow: false
      },
      {
        label: 'Cube-利用率',
        prop: 'matrix.float16.calibration_coefficient',
        minWidth: '180',
        isShow: false
      },
      {
        label: 'Vector-理论算力',
        prop: 'vector.float16.tflops',
        minWidth: '180',
        isShow: false
      },
      {
        label: 'Vector-利用率',
        prop: 'vector.float16.calibration_coefficient',
        minWidth: '180',
        isShow: false
      },
      { label: '显存容量', prop: 'mem1.GiB', minWidth: '120', isShow: false },
      { label: '显存带宽', prop: 'mem1.GBps', minWidth: '120', isShow: false },
      {
        label: 'Cube算力利用率',
        prop: 'mem1.cube_calibration_coefficient',
        minWidth: '180',
        isShow: false
      },
      {
        label: 'Vector算力利用率',
        prop: 'mem1.vector_calibration_coefficient',
        minWidth: '180',
        isShow: false
      },
      { label: 'CPU内存容量', prop: 'mem2.GiB', minWidth: '120', isShow: false },
      { label: 'CPU内存带宽', prop: 'mem2.GBps', minWidth: '120', isShow: false },
      { label: '网络配置', prop: 'networks', minWidth: '120', isShow: false },
      { label: '操作', prop: 'operations', fixed: 'right', minWidth: '200', isShow: true }
    ],
    selectedConfigs: []
  }),

  getters: {
    // 获取可见的列
    visibleColumns: (state) =>
      state.columns.filter((col) => col.isShow),

    // 获取隐藏的列
    hiddenColumns: (state) =>
      state.columns.filter((col) => !col.isShow),

    // 获取某列的所有唯一值
    getColumnValues: (state) => (prop: string) => {
      const values = new Set()
      state.configs.forEach(config => {
        const value = getNestedValue(config, prop)
        if (value !== undefined && value !== null) {
          values.add(String(value))
        }
      })
      return Array.from(values) as string[]
    },

    // 获取当前应用的筛选器
    activeFilters: (state) => {
      const active: Record<string, any> = {}
      Object.keys(state.filters).forEach(key => {
        const value = state.filters[key]
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value) && value.length > 0) {
            active[key] = value
          } else if (typeof value === 'string' && value.trim()) {
            active[key] = value.trim()
          }
        }
      })
      return active
    }
  },

  actions: {
    // 获取配置列表（支持分页、筛选、排序）
    async fetchConfigs(resetPage = false) {
      this.loading = true
      try {
        if (resetPage) {
          this.pagination.currentPage = 1
        }
        const params = {
          filters: this.activeFilters,
          order_bys: this.sortConfig.order_bys,
          page: this.pagination.currentPage,
          per_page: this.pagination.pageSize
        }
        const { data } = await markov_sim_get_all_configs(params)
        const responseData = data.data || data
        this.configs = responseData.list || []
        this.serverPagination = {
          total: responseData.total || 0,
          page: responseData.page || 1,
          per_page: responseData.per_page || 10,
          total_pages: responseData.total_pages || 0
        }

        // 同步本地分页状态
        this.pagination.total = this.serverPagination.total
        this.pagination.currentPage = this.serverPagination.page

      } catch (error) {
        console.error('Failed to fetch configs:', error)
        ElMessage.error('获取配置列表失败')
        this.configs = []
        this.serverPagination = { total: 0, page: 1, per_page: 10, total_pages: 0 }
      } finally {
        this.loading = false
      }
    },

    // 获取Schema配置
    async fetchSchemaConfigs() {
      this.loading = true
      try {
        const { data } = await markov_sim_get_create_model_schema()
        console.log(data.schema, "| data.schema");

        // data.schema 的代码正确，AI不要修改
        this.schemeConfigs = Object.assign(this.schemeConfigs, data.schema) || {}
        console.log('获取到的Schema配置:', this.schemeConfigs)
      } catch (error) {
        console.error('Failed to fetch schema configs:', error)
        ElMessage.error('获取Schema配置失败')
      } finally {
        this.loading = false
      }
    },

    // 创建配置
    async createConfig(configData: Omit<SystemConfig, 'id' | 'created_at' | 'updated_at'>) {
      this.loading = true
      try {
        const { data } = await markov_sim_create_config(configData)
        if (data) {
          ElMessage.success('创建成功')
          await this.fetchConfigs()
          return data
        } else {
          throw new Error('创建失败')
        }
      } catch (error: any) {
        console.error('Failed to create config:', error)
        const message = error.response?.data?.message || error.message || '创建失败'
        ElMessage.error(message)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 更新配置
    async updateConfig(id: string, configData: Omit<SystemConfig, 'id' | 'created_at' | 'updated_at'>) {
      this.loading = true
      try {
        const updateData = { ...configData, id } as SystemConfig
        const { data } = await markov_sim_update_config(updateData)

        if (data) {
          ElMessage.success('更新成功')
          await this.fetchConfigs()
          return data
        } else {
          throw new Error('更新失败')
        }
      } catch (error: any) {
        console.error('Failed to update config:', error)
        const message = error.response?.data?.message || error.message || '更新失败'
        ElMessage.error(message)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 获取配置详情
    async getConfigDetail(id: string): Promise<SystemConfig> {
      this.loading = true
      try {
        const { data } = await markov_sim_get_config_by_id(id)
        if (data) {
          return data
        } else {
          throw new Error('获取详情失败')
        }
      } catch (error: any) {
        console.error('Failed to fetch config detail:', error)
        const message = error.response?.data?.message || error.message || '获取详情失败'
        ElMessage.error(message)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 删除配置（单个或批量）
    async deleteConfigs(ids: string[]) {
      if (!ids || ids.length === 0) {
        ElMessage.warning('请选择要删除的配置')
        return
      }

      this.loading = true
      try {
        await markov_sim_delete_configs_by_ids(ids)
        ElMessage.success(`成功删除 ${ids.length} 条记录`)
        await this.fetchConfigs()
      } catch (error: any) {
        console.error('Failed to delete configs:', error)
        const message = error.response?.data?.message || error.message || '删除失败'
        ElMessage.error(message)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 克隆配置
    async cloneConfig(id: string, newName: string) {
      try {
        const originalConfig = await this.getConfigDetail(id)
        const cloneData = {
          ...originalConfig,
          name: newName
        }
        delete (cloneData as any).id
        delete (cloneData as any).created_at
        delete (cloneData as any).updated_at

        return await this.createConfig(cloneData)
      } catch (error) {
        console.error('Failed to clone config:', error)
        throw error
      }
    },

    // 设置排序
    setSorting(orderBys: string[]) {
      this.sortConfig.order_bys = orderBys
      this.fetchConfigs(true)
    },

    // 设置筛选器
    setFilter(prop: string, value: string[] | string | null) {
      console.log(`设置筛选器 ${prop}:`, value)
      if (value === null || value === undefined || value === '' ||
        (Array.isArray(value) && value.length === 0)) {
        delete this.filters[prop]
      } else {
        this.filters[prop] = value
      }
      console.log('更新后的筛选条件:', this.filters)
      this.fetchConfigs(true) // 筛选时重置到第一页
    },

    // 清除筛选器
    clearFilter(prop?: string) {
      if (prop) {
        delete this.filters[prop]
      } else {
        this.filters = {}
      }
      this.fetchConfigs(true)
    },

    // 设置分页
    setPagination(pagination: Partial<PaginationConfig>) {
      this.pagination = { ...this.pagination, ...pagination }
      this.fetchConfigs()
    },

    // 设置列可见性
    // setColumnVisibility(prop: string, visible: boolean) {
    //   const column = this.columns.find((col) => col.prop === prop)
    //   if (column && column.prop !== 'operations') {
    //     column.isShow = visible
    //   }
    // },

    // 批量设置列可见性
    // setColumnsVisibility(columns: string[]) {
    //   this.columns.forEach((col) => {
    //     if (col.prop !== 'operations') {
    //       col.isShow = columns.includes(col.prop)
    //     }
    //   })
    // },

    // 获取Transfer数据
    getTransferData() {
      return this.schemeConfigs.uiConfig.table.columns
        .filter((col) => col.prop !== 'operations')
        .map((col) => ({
          key: col.prop,
          label: col.label,
          disabled: false
        }))
    },

    // 获取右侧已选中的列
    getRightValue() {
      return this.schemeConfigs.uiConfig.table.columns
        .filter((col) => !col.defaultHidden && col.prop !== 'operations')
        .map((col) => col.prop)
    },

    // 处理Transfer变化
    handleTransferChange(targetKeys: string[]) {
      this.schemeConfigs.uiConfig.table.columns.forEach((col) => {
        if (col.prop !== 'operations') {
          col.defaultHidden = !targetKeys.includes(col.prop)
        }
      })
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
      this.sortConfig.order_bys = []
    },

    // 获取统计信息
    async getStats() {
      try {
        const { data } = await markov_sim_get_config_stats()
        return data
      } catch (error) {
        console.error('Failed to fetch stats:', error)
        return null
      }
    }
  }
})

// 工具函数：获取嵌套对象的值
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

export const useSystemConfigStoreWithOut = () => {
  return useSystemConfigStore(store)
}
