import request from '@/axios'
import type {
  Task,
  SystemConfig,
  ConfigFormData,
  ModelComparison,
  ListResponse
} from '@/store/types'

// 任务相关API
export const taskApi = {
  // 获取任务列表
  getTasks: (params?: {
    page?: number
    pageSize?: number
    status?: string
    model?: string
  }): Promise<IResponse<ListResponse<Task>>> => {
    return request.get({
      url: '/api/tasks',
      params
    })
  },

  // 创建任务
  createTask: (data: Partial<Task>): Promise<IResponse<Task>> => {
    return request.post({
      url: '/api/tasks',
      data
    })
  },

  // 更新任务
  updateTask: (id: number, data: Partial<Task>): Promise<IResponse<Task>> => {
    return request.put({
      url: `/api/tasks/${id}`,
      data
    })
  },

  // 删除任务
  deleteTask: (id: number): Promise<IResponse<void>> => {
    return request.delete({
      url: `/api/tasks/${id}`
    })
  },

  // 获取任务详情
  getTaskDetail: (id: number): Promise<IResponse<Task>> => {
    return request.get({
      url: `/api/tasks/${id}`
    })
  },

  // 批量删除任务
  batchDeleteTasks: (ids: number[]): Promise<IResponse<void>> => {
    return request.delete({
      url: '/api/tasks/batch',
      data: { ids }
    })
  }
}

// 系统配置相关API
export const configApi = {
  // 获取配置列表
  getConfigs: (params?: {
    page?: number
    pageSize?: number
    type?: string
  }): Promise<IResponse<ListResponse<SystemConfig>>> => {
    return request.get({
      url: '/api/configs',
      params
    })
  },

  // 创建配置
  createConfig: (data: ConfigFormData): Promise<IResponse<SystemConfig>> => {
    return request.post({
      url: '/api/configs',
      data
    })
  },

  // 更新配置
  updateConfig: (id: number, data: Partial<ConfigFormData>): Promise<IResponse<SystemConfig>> => {
    return request.put({
      url: `/api/configs/${id}`,
      data
    })
  },

  // 删除配置
  deleteConfig: (id: number): Promise<IResponse<void>> => {
    return request.delete({
      url: `/api/configs/${id}`
    })
  },

  // 克隆配置
  cloneConfig: (id: number, newName: string): Promise<IResponse<SystemConfig>> => {
    return request.post({
      url: `/api/configs/${id}/clone`,
      data: { newName }
    })
  }
}

// 模型对比相关API
export const comparisonApi = {
  // 获取对比数据
  getComparisonData: (taskIds: number[]): Promise<IResponse<ModelComparison[]>> => {
    return request.post({
      url: '/api/comparison',
      data: { taskIds }
    })
  },

  // 获取对比图表数据
  getComparisonCharts: (taskIds: number[]): Promise<IResponse<any>> => {
    return request.post({
      url: '/api/comparison/charts',
      data: { taskIds }
    })
  }
}

// 通用API
export const commonApi = {
  // 获取选项数据
  getOptions: (type: string): Promise<IResponse<Array<{ label: string; value: string }>>> => {
    return request.get({
      url: `/api/options/${type}`
    })
  },

  // 文件上传
  uploadFile: (file: File): Promise<IResponse<{ url: string }>> => {
    const formData = new FormData()
    formData.append('file', file)
    return request.post({
      url: '/api/upload',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 导出数据
  exportData: (type: string, params?: any): Promise<IResponse<Blob>> => {
    return request.get({
      url: `/api/export/${type}`,
      params,
      responseType: 'blob'
    })
  }
}
