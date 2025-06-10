import Mock from 'mockjs'
import { SUCCESS_CODE } from '@/constants'
import { toAnyString } from '@/utils'
import { enhancedInferenceModelConfigSchema } from './jsonschema'
import { InferenceModelConfigs, STRUCTUR_TYPE, ATTN_TYPE, NORM_TYPE } from './inference_model_config'

const timeout = 1000
const count = 50

// 真实的模型名称数据
const MODEL_NAMES = [
  'deepseek-v2', 'deepseek-coder', 'llama-3-70b', 'llama-3-8b', 'qwen-72b', 'qwen-14b',
  'baichuan-13b', 'chatglm-6b', 'internlm-7b', 'yi-34b', 'mixtral-8x7b', 'gpt-4-turbo'
]

// 生成基础配置
const generateBaseOptions = (structureType: STRUCTUR_TYPE) => {
  const attnType = Mock.Random.pick([ATTN_TYPE.GQA, ATTN_TYPE.MHA, ATTN_TYPE.MLA])

  return {
    structure_type: structureType,
    hidden: Mock.Random.integer(512, 8192), // 隐藏层维度
    feedforward: Mock.Random.integer(1024, 16384), // 反馈层维度
    attn_heads: Mock.Random.pick([8, 16, 32, 64, 128]), // 注意力头数
    attn_size: Mock.Random.integer(64, 256), // 注意力大小
    attn_type: attnType,
    num_blocks: Mock.Random.integer(12, 96), // 模型层数
    num_query_groups: Mock.Random.boolean() ? Mock.Random.integer(1, 16) : null
  }
}

// 生成MLA扩展配置
const generateMlaExtendOptions = () => {
  if (Mock.Random.boolean()) { // 50%的概率生成MLA配置
    return {
      q_lora_rank: Mock.Random.boolean() ? Mock.Random.integer(64, 512) : null,
      kv_lora_rank: Mock.Random.boolean() ? Mock.Random.integer(64, 512) : null,
      qk_rope_head_dim: Mock.Random.boolean() ? Mock.Random.integer(32, 128) : null,
      qk_nope_head_dim: Mock.Random.boolean() ? Mock.Random.integer(32, 128) : null,
      q_head_dim: Mock.Random.boolean() ? Mock.Random.integer(64, 256) : null,
      v_head_dim: Mock.Random.boolean() ? Mock.Random.integer(64, 256) : null
    }
  }
  return null
}

// 生成MOE基础配置
const generateMoeBaseOptions = (structureType: STRUCTUR_TYPE) => {
  if (structureType === STRUCTUR_TYPE.moe) {
    return {
      num_experts: Mock.Random.integer(8, 64),
      route_expert_hidden: Mock.Random.boolean() ? Mock.Random.integer(256, 2048) : null,
      num_shared_experts: Mock.Random.boolean() ? Mock.Random.integer(1, 8) : null,
      shared_expert_hidden: Mock.Random.boolean() ? Mock.Random.integer(256, 2048) : null,
      top_experts_activation: Mock.Random.boolean() ? Mock.Random.integer(1, 8) : null,
      moe_capacity_factor: Mock.Random.boolean() ? Mock.Random.float(1, 10, 1, 2) : null,
      moe_block_interval: Mock.Random.boolean() ? Mock.Random.integer(1, 4) : null
    }
  }
  return null
}

// 生成高级配置
const generateAdvanceOptions = () => {
  if (Mock.Random.boolean()) { // 50%的概率生成高级配置
    return {
      hybrid_model_enable: Mock.Random.boolean(),
      hybrid_moe_blocks_num: Mock.Random.boolean() ? Mock.Random.integer(0, 48) : null,
      hybrid_dense_blocks_num: Mock.Random.boolean() ? Mock.Random.integer(0, 48) : null,
      mtp_module_num: Mock.Random.boolean() ? Mock.Random.integer(1, 8) : null,
      embedding_output_share: Mock.Random.boolean(),
      norm: Mock.Random.pick([NORM_TYPE.RMSNorm, NORM_TYPE.LayerNorm]),
      embedding_size: Mock.Random.boolean() ? Mock.Random.integer(32000, 128000) : null
    }
  }
  return null
}

// 生成完整的推理模型配置
const generateInferenceModelConfig = (): InferenceModelConfigs => {
  const structureType = Mock.Random.pick([STRUCTUR_TYPE.dense, STRUCTUR_TYPE.moe])
  const name = Mock.Random.pick(MODEL_NAMES)

  return {
    id: toAnyString(),
    name: `${name}-${Mock.Random.string('lower', 3, 5)}`,
    base_options: generateBaseOptions(structureType),
    mla_extend_options: generateMlaExtendOptions(),
    moe_base_options: generateMoeBaseOptions(structureType),
    advance_options: generateAdvanceOptions()
  }
}

// 初始化数据
let List: InferenceModelConfigs[] = []
for (let i = 0; i < count; i++) {
  List.push(generateInferenceModelConfig())
}

// 工具函数：处理分页
const paginate = (data: InferenceModelConfigs[], page: number, perPage: number) => {
  const start = (page - 1) * perPage
  const end = start + perPage
  return {
    items: data.slice(start, end),
    total: data.length,
    page,
    perPage,
    totalPages: Math.ceil(data.length / perPage)
  }
}

// 工具函数：处理筛选
const filterData = (data: InferenceModelConfigs[], filters: any) => {
  console.log('Mock API - 接收到的筛选条件:', filters)

  if (!filters) return data

  return data.filter((item) => {
    for (const [key, value] of Object.entries(filters)) {
      if (value === null || value === undefined || value === '') continue

      console.log(`筛选字段 ${key}, 筛选值:`, value, '数据项值:', item[key as keyof InferenceModelConfigs])

      if (key === 'name') {
        if (typeof value === 'string') {
          if (!item.name.toLowerCase().includes(value.toLowerCase())) return false
        } else if (Array.isArray(value)) {
          if (!value.some((v) => item.name.toLowerCase().includes(v.toLowerCase()))) return false
        }
      } else if (key === 'structure_type') {
        if (typeof value === 'string') {
          if (value !== item.base_options.structure_type) return false
        } else if (Array.isArray(value)) {
          if (!value.includes(item.base_options.structure_type)) return false
        }
      } else if (key === 'attn_type') {
        if (typeof value === 'string') {
          if (value !== item.base_options.attn_type) return false
        } else if (Array.isArray(value)) {
          if (!value.includes(item.base_options.attn_type)) return false
        }
      }
    }
    return true
  })
}

// 工具函数：处理排序
const sortData = (data: InferenceModelConfigs[], orderBys: string[]) => {
  if (!orderBys || orderBys.length === 0) return data

  return data.sort((a, b) => {
    for (const orderBy of orderBys) {
      const isDesc = orderBy.startsWith('-')
      const field = isDesc ? orderBy.slice(1) : orderBy

      let aVal: any
      let bVal: any

      // 处理嵌套字段
      if (field === 'structure_type') {
        aVal = a.base_options.structure_type
        bVal = b.base_options.structure_type
      } else if (field === 'attn_type') {
        aVal = a.base_options.attn_type
        bVal = b.base_options.attn_type
      } else {
        aVal = a[field as keyof InferenceModelConfigs]
        bVal = b[field as keyof InferenceModelConfigs]
      }

      if (aVal < bVal) return isDesc ? 1 : -1
      if (aVal > bVal) return isDesc ? -1 : 1
    }
    return 0
  })
}

// 工具函数：查找单项数据
const findById = (id: string): InferenceModelConfigs | undefined => {
  return List.find((item) => item.id === id)
}

// 工具函数：删除数据
const deleteByIds = (ids: string[]): boolean => {
  const initialLength = List.length
  List = List.filter((item) => !ids.includes(item.id!))
  return List.length < initialLength
}

// 工具函数：更新数据
const updateItem = (id: string, updateData: Partial<InferenceModelConfigs>): InferenceModelConfigs | null => {
  const index = List.findIndex((item) => item.id === id)
  if (index === -1) return null

  List[index] = {
    ...List[index],
    ...updateData,
    id
  }
  return List[index]
}

// 工具函数：创建数据
const createItem = (data: Omit<InferenceModelConfigs, 'id'>): InferenceModelConfigs => {
  const newItem: InferenceModelConfigs = {
    ...data,
    id: toAnyString()
  }
  List.push(newItem)
  return newItem
}

export default [
  // 获取创建模型的JSON Schema - 返回增强的schema
  {
    url: '/markov_sim/api/v1/inference_model_config/get_model_schema',
    method: 'get',
    timeout,
    response: () => {
      return {
        code: SUCCESS_CODE,
        message: 'operation successful SchemaResponse',
        data: enhancedInferenceModelConfigSchema
      }
    }
  },

  // 创建系统配置
  {
    url: '/markov_sim/api/v1/inference_model_config/create',
    method: 'post',
    timeout,
    response: ({ body }: { body: Omit<InferenceModelConfigs, 'id'> }) => {
      try {
        // 验证必填字段
        if (!body.name || !body.base_options) {
          return {
            code: 400,
            message: '缺少必填字段：name 和 base_options'
          }
        }

        // 验证base_options必填字段
        const requiredBaseFields = ['structure_type', 'hidden', 'feedforward', 'attn_heads', 'attn_size', 'attn_type', 'num_blocks']
        for (const field of requiredBaseFields) {
          if (!body.base_options[field as keyof typeof body.base_options]) {
            return {
              code: 400,
              message: `缺少base_options必填字段：${field}`
            }
          }
        }

        // 检查名称是否已存在
        const existing = List.find((item) => item.name === body.name)
        if (existing) {
          return {
            code: 400,
            message: '模型名称已存在'
          }
        }

        const newItem = createItem(body)
        return {
          code: SUCCESS_CODE,
          data: newItem,
          message: '创建成功'
        }
      } catch (error) {
        return {
          code: 500,
          message: '创建失败：' + error
        }
      }
    }
  },

  // 更新系统配置
  {
    url: '/markov_sim/api/v1/inference_model_config/update',
    method: 'put',
    timeout,
    response: ({ body }: { body: InferenceModelConfigs }) => {
      try {
        if (!body.id) {
          return {
            code: 400,
            message: '缺少必填字段：id'
          }
        }

        // 检查名称是否已被其他项使用
        if (body.name) {
          const existing = List.find((item) => item.name === body.name && item.id !== body.id)
          if (existing) {
            return {
              code: 400,
              message: '模型名称已被其他配置使用'
            }
          }
        }

        const updatedItem = updateItem(body.id, body)
        if (!updatedItem) {
          return {
            code: 404,
            message: '未找到指定的配置项'
          }
        }

        return {
          code: SUCCESS_CODE,
          data: updatedItem,
          message: '更新成功'
        }
      } catch (error) {
        return {
          code: 500,
          message: '更新失败：' + error
        }
      }
    }
  },

  // 根据ID批量删除
  {
    url: '/markov_sim/api/v1/inference_model_config/delete_by_ids',
    method: 'post',
    timeout,
    response: ({ body }: { body: { ids: string[] } }) => {
      try {
        const { ids } = body

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
          return {
            code: 400,
            message: '请提供要删除的ID列表'
          }
        }

        const deleted = deleteByIds(ids)
        if (!deleted) {
          return {
            code: 404,
            message: '未找到要删除的数据'
          }
        }

        return {
          code: SUCCESS_CODE,
          message: `成功删除 ${ids.length} 条记录`
        }
      } catch (error) {
        return {
          code: 500,
          message: '删除失败：' + error
        }
      }
    }
  },

  // 根据ID获取单个配置
  {
    url: '/markov_sim/api/v1/inference_model_config/get_by_id/:id',
    method: 'get',
    timeout,
    response: ({ query }: { query: { id: string } }) => {
      try {
        const { id } = query
        if (!id) {
          return {
            code: 400,
            message: '缺少参数：id'
          }
        }

        const item = findById(id)
        if (!item) {
          return {
            code: 404,
            message: '未找到指定的配置项'
          }
        }

        return {
          code: SUCCESS_CODE,
          message: '查询成功',
          data: item
        }
      } catch (error) {
        return {
          code: 500,
          message: '查询失败：' + error
        }
      }
    }
  },

  // 获取所有配置（支持分页、筛选、排序）
  {
    url: '/markov_sim/api/v1/inference_model_config/get_all',
    method: 'post',
    timeout,
    response: ({
      body
    }: {
      body: {
        filters?: {
          name?: string
          structure_type?: STRUCTUR_TYPE
          attn_type?: ATTN_TYPE
        }
        order_bys?: string[]
        page?: number
        page_size?: number
      }
    }) => {
      try {
        const { filters, order_bys = [], page = 1, page_size = 10 } = body || {}

        // 验证分页参数
        if (page < 1 || page_size < 1 || page_size > 100) {
          return {
            code: 400,
            message: '无效的分页参数'
          }
        }

        // 应用筛选
        let filteredData = filterData(List, filters)

        // 应用排序
        filteredData = sortData(filteredData, order_bys)

        // 应用分页
        const paginatedResult = paginate(filteredData, page, page_size)

        return {
          code: SUCCESS_CODE,
          message: 'operation successful',
          data: {
            items: paginatedResult.items,
            total: paginatedResult.total,
            page: paginatedResult.page,
            page_size: paginatedResult.perPage,
            total_pages: paginatedResult.totalPages
          }
        }
      } catch (error) {
        return {
          code: 500,
          message: '查询失败：' + error
        }
      }
    }
  },
]
