import request from '@/axios'
import { RequestResponse } from './types'
import { InferenceModelConfigs } from '@/types/inference_model_config'

interface ListResponse {
  items: InferenceModelConfigs[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

// 获取创建模型的JSON Schema
export const markov_sim_get_create_model_schema = () => {
  return request.get({
    url: '/markov_sim/api/v1/inference_model_config/get_model_schema'
  })
}

// 获取所有系统配置（支持分页、筛选、排序）
export const markov_sim_get_all_configs = (params: {
  filters?: { name?: string; type?: string; processing_mode?: string }
  order_bys?: string[]
  page?: number
  page_size?: number
}) => {
  return request.post<ListResponse>({
    url: '/markov_sim/api/v1/inference_model_config/get_all',
    data: params
  })
}

// 根据ID获取系统配置详情
export const markov_sim_get_config_by_id = (id: string) => {
  console.log(id, '| id')

  return request.get<InferenceModelConfigs>({
    url: `/markov_sim/api/v1/inference_model_config/get_by_id/${id}`
  })
}

// 创建系统配置
export const markov_sim_create_config = (
  params: Omit<InferenceModelConfigs, 'id' | 'created_at' | 'updated_at'>
) => {
  return request.post<InferenceModelConfigs>({
    url: '/markov_sim/api/v1/inference_model_config/create',
    data: params
  })
}

// 更新系统配置
export const markov_sim_update_config = (params: InferenceModelConfigs) => {
  return request.put<InferenceModelConfigs>({
    url: '/markov_sim/api/v1/inference_model_config/update',
    data: params
  })
}

// 根据ID列表批量删除系统配置
export const markov_sim_delete_configs_by_ids = (ids: string[]) => {
  return request.post<RequestResponse>({
    url: '/markov_sim/api/v1/inference_model_config/delete_by_ids',
    data: { ids }
  })
}