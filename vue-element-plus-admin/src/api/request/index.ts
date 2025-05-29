import request from '@/axios'
import { RequestResponse } from './types'
import type { SystemConfig } from '@/store/types'

// 获取系统列表
export const markov_sim_get_sys_list = () => {
  return request.get<RequestResponse>({
    url: '/markov_sim/api/v1/system_config/list'
  })
}

export const markov_sim_get_sys_detail_by_id = (id: string) => {
  return request.get({
    url: `/markov_sim/api/v1/system_config/detail?id=${id}`
  })
}

export const markov_sim_post_sys_create = (params: SystemConfig) => {
  return request.post({
    url: `/markov_sim/api/v1/system_config/create`,
    data: params
  })
}

export const markov_sim_post_sys_delete = (params: { ids: string }) => {
  return request.post({
    url: `/markov_sim/api/v1/system_config/delete`,
    data: params
  })
}

export const markov_sim_post_sys_update = (params: SystemConfig) => {
  return request.post({
    url: `/markov_sim/api/v1/system_config/update`,
    data: params
  })
}
