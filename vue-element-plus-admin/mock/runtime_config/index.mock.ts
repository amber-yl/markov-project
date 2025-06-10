import Mock from 'mockjs'
import { SUCCESS_CODE } from '@/constants'
import { toAnyString } from '@/utils'
import { enhancedInferenceModelConfigSchema } from './jsonschema'
enum Type {
  pdSplit = 'pd-split',
  pdFusion = 'pd-fusion'
}

interface InferenceRuntimeConfigCreate {
  id?: string;
  /** 推理运行时名称 */
  name: string;

  /** 运行时类型 */
  type: Type;

  /** 运行时参数 */
  runtime_details: RuntimeDetails;
}

export interface RuntimeDetails {
  /** 指定 model config 文件，可设置多个 */
  model_list: string[];

  /** 负载输入输出长度，可设置多个 */
  sequence_length_list: SequenceLength[];

  /** 总卡数，PD分离时为P卡+D卡 */
  num_procs_list: number[];

  /** 依次为[weight_quant, activation_quant, cache_quant, communication_quant] */
  wac_bytes_list: WacBytes[];

  /** 依次为[matrix_flops_type, attn_flops_type, vector_flops_type] */
  flops_type_list: FlopsType[];

  /** TTFT和TPOT约束，单位ms，无约束时可配置[null, null] */
  time_limit_list: TimeLimit[];

  /** 芯片配置，PD分离时需分别配置P芯片和D芯片，PD融合时仅配置一个芯片 */
  sys_list: string[];

  /** 当PD分离的时候，可指定P/D各自的数目；缺省None，自动寻优最佳PD配置 */
  pd_num_procs_list?: (PdNumProcs | null)[] | null;

  /** 指定P阶段的运行时策略[DP,PP,TP]，当前pp未实现，默认1；MoE模型为Attn部分运行时策略 */
  p_parallel_config?: (PParallelConfig | null)[] | null;

  /** 指定D阶段的运行时策略[DP,PP,TP]，当前pp未实现，默认1；MoE模型为Attn部分运行时策略 */
  d_parallel_config?: DParallelConfig[] | null; // 注意：原结构中d_parallel_config的anyOf包含null，但required中无，故用可选

  /** 仅MoE模型生效，指定P阶段的MoE运行时策略[EP, Moe_TP, Moe_DP] */
  p_moe_parallel_config?: (PMoeParallelConfig | null)[] | null;

  /** 仅MoE模型生效，指定D阶段的MoE运行时策略[EP, Moe_TP, Moe_DP] */
  d_moe_parallel_config?: DMoEParallelConfig[] | null; // 注意：原结构中d_moe_parallel_config的anyOf包含null，但required中无，故用可选

  /** P阶段batch_size设置[global_bs, num_bs, bs],建议默认[1,1,1]节省寻优时间 */
  p_micro_batch_size?: (PMicroBatchSize | null)[] | null;

  /** D阶段batch_size设置[global_bs, num_bs, bs],建议默认[32,1,32] */
  d_micro_batch_size?: (DMicroBatchSize | null)[] | null;

  /** 仅MoE模型decode生效，D阶段基于卡数寻优不同冗余专家个数时的运行时策略 */
  num_redundant_expert_config?: number[] | number | null;

  /** 仅MOE模型decode生效，指定True时，考虑decode阶段每卡运行时1个共享专家 */
  deploy_shared_expert_config?: boolean | null;

  /** 序列长度 */
  seq_size?: number | null;

  /** 输出序列长度 */
  output_seq?: number | null;

  /** 吸收启动 */
  absorb_enabled?: boolean | null;

  /** 共享专家数量 */
  num_shared_experts?: number | null;

  /** 冗余专家数量 */
  num_redundant_experts?: number | null;

  /** 是否使用冗余专家（原注释可能有误，应为是否使用Flash Attention） */
  use_flash_attn?: boolean | null;
}

interface SequenceLength {
  /** 输入长度 */
  input_seq_length: number;
  /** 输出长度 */
  output_seq_length: number;
}

interface WacBytes {
  /** 权重精度 */
  weight_quant: number;
  /** 激活精度 */
  activation_quant: number;
  /** 缓存精度 */
  cache_quant: number;
  /** 通信精度 */
  communication_quant: number;
}

interface FlopsType {
  /** 矩阵运算精度 */
  matrix_flops_type: number;
  /** 注意力运算精度 */
  attn_flops_type: number;
  /** 向量运算精度 */
  vector_flops_type: number;
}

interface TimeLimit {
  /** TTFT约束 */
  TTFT: number | null;
  /** TPOT约束 */
  TPOT: number | null;
}

interface PdNumProcs {
  /** P卡数目 */
  p_num_procs: number;
  /** D卡数目 */
  d_num_procs: number;
}

interface PParallelConfig {
  /** P阶段DP策略 */
  DP: number;
  /** P阶段PP策略 */
  PP: number;
  /** P阶段TP策略 */
  TP: number;
}

interface DParallelConfig {
  /** D阶段DP策略 */
  DP: number;
  /** D阶段PP策略 */
  PP: number;
  /** D阶段TP策略 */
  TP: number;
}

interface PMoeParallelConfig {
  /** P阶段EP策略 */
  EP: number;
  /** P阶段Moe_TP策略 */
  Moe_TP: number;
  /** P阶段Moe_DP策略 */
  Moe_DP: number;
}

interface DMoEParallelConfig {
  /** D阶段EP策略 */
  EP: number;
  /** D阶段Moe_TP策略 */
  Moe_TP: number;
  /** D阶段Moe_DP策略 */
  Moe_DP: number;
}

interface PMicroBatchSize {
  /** 全局batch_size */
  global_bs: number;
  /** num_bs */
  num_bs: number;
  /** bs */
  bs: number;
}

interface DMicroBatchSize {
  /** 全局batch_size */
  global_bs: number;
  /** num_bs */
  num_bs: number;
  /** bs */
  bs: number;
}

const timeout = 1000
const count = 100

// 真实的硬件名称数据
const GPU_NAMES = [
  'NVIDIA RTX 4090',
  'NVIDIA RTX 4080',
  'NVIDIA RTX 4070 Ti',
  'NVIDIA RTX 4070',
  'NVIDIA RTX 4060 Ti',
  'NVIDIA RTX 4060',
  'NVIDIA RTX 3090 Ti',
  'NVIDIA RTX 3090',
  'NVIDIA RTX 3080 Ti',
  'NVIDIA RTX 3080',
  'NVIDIA RTX 3070 Ti',
  'NVIDIA RTX 3070',
  'NVIDIA A100',
  'NVIDIA H100',
  'NVIDIA V100',
  'NVIDIA T4',
  'Tesla P100',
  'AMD RX 7900 XTX',
  'AMD RX 7900 XT',
  'AMD RX 7800 XT',
  'AMD RX 7700 XT'
]

const NPU_NAMES = [
  'Huawei Ascend 910B',
  'Huawei Ascend 910A',
  'Huawei Ascend 310P',
  'Huawei Ascend 310',
  'Intel Gaudi2',
  'Intel Gaudi',
  'Google TPU v4',
  'Google TPU v3',
  'Google TPU v2',
  'Cambricon MLU370',
  'Cambricon MLU290',
  'Cambricon MLU270',
  'Cambricon MLU220',
  'Horizon Journey-5',
  'Horizon Journey-3',
  'Rockchip RK3588',
  'Sophgo BM1684X'
]

// 生成更真实的硬件配置数据
const generateHardwareConfig = (type: Type): Partial<InferenceRuntimeConfigCreate> => {
  const names = type === Type.pdFusion ? GPU_NAMES : NPU_NAMES
  const name = Mock.Random.pick(names)

  if (type === Type.pdFusion) {
    // GPU配置参数范围
    return {
      name,
      type,

    }
  } else {
    // NPU配置参数范围
    return {
      name,
      type,

    }
  }
}

let List: InferenceRuntimeConfigCreate[] = []

// 生成更真实的mock数据
for (let i = 0; i < count; i++) {
  const type = Mock.Random.pick([Type.pdFusion, Type.pdSplit])
  const config = generateHardwareConfig(type)
  const now = new Date()
  const createdAt = new Date(now.getTime() - Mock.Random.integer(0, 365 * 24 * 60 * 60 * 1000))
  const updatedAt = new Date(
    createdAt.getTime() + Mock.Random.integer(0, now.getTime() - createdAt.getTime())
  )

  List.push({
    id: toAnyString(),
    created_at: createdAt.toISOString(),
    updated_at: updatedAt.toISOString(),
    ...config
  } as InferenceRuntimeConfigCreate)
}

// 工具函数：处理分页
const paginate = (data: InferenceRuntimeConfigCreate[], page: number, perPage: number) => {
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
const filterData = (data: InferenceRuntimeConfigCreate[], filters: any) => {
  console.log('Mock API - 接收到的筛选条件:', filters)

  if (!filters) return data

  return data.filter((item) => {
    for (const [key, value] of Object.entries(filters)) {
      if (value === null || value === undefined || value === '') continue

      console.log(`筛选字段 ${key}, 筛选值:`, value, '数据项值:', item[key as keyof InferenceRuntimeConfigCreate])

      if (key === 'name') {
        if (typeof value === 'string') {
          if (!item.name.toLowerCase().includes(value.toLowerCase())) return false
        } else if (Array.isArray(value)) {
          if (!value.some((v) => item.name.toLowerCase().includes(v.toLowerCase()))) return false
        }
      } else if (key === 'type') {
        if (typeof value === 'string') {
          if (value !== item.type) return false
        } else if (Array.isArray(value)) {
          if (!value.includes(item.type)) return false
        }
      }
    }
    return true
  })
}

// 工具函数：处理排序
const sortData = (data: InferenceRuntimeConfigCreate[], orderBys: string[]) => {
  if (!orderBys || orderBys.length === 0) return data

  return data.sort((a, b) => {
    for (const orderBy of orderBys) {
      const isDesc = orderBy.startsWith('-')
      const field = isDesc ? orderBy.slice(1) : orderBy

      let aVal: any = a[field as keyof InferenceRuntimeConfigCreate]
      let bVal: any = b[field as keyof InferenceRuntimeConfigCreate]

      // 处理日期字段
      if (field === 'created_at' || field === 'updated_at') {
        aVal = new Date(aVal).getTime()
        bVal = new Date(bVal).getTime()
      }

      if (aVal < bVal) return isDesc ? 1 : -1
      if (aVal > bVal) return isDesc ? -1 : 1
    }
    return 0
  })
}

// 工具函数：查找单项数据
const findById = (id: string): InferenceRuntimeConfigCreate | undefined => {
  return List.find((item) => item.id === id)
}

// 工具函数：删除数据
const deleteByIds = (ids: string[]): boolean => {
  const initialLength = List.length
  List = List.filter((item) => !ids.includes(item.id!))
  return List.length < initialLength
}

// 工具函数：更新数据
const updateItem = (id: string, updateData: Partial<InferenceRuntimeConfigCreate>): InferenceRuntimeConfigCreate | null => {
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
const createItem = (data: Omit<InferenceRuntimeConfigCreate, 'id' | 'created_at' | 'updated_at'>): InferenceRuntimeConfigCreate => {
  const newItem: InferenceRuntimeConfigCreate = {
    ...data,
    id: toAnyString()
  }
  List.push(newItem)
  return newItem
}

export default [
  // 获取创建模型的JSON Schema - 返回增强的schema
  {
    url: '/markov_sim/api/v1/runtime_config/get_model_schema',
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
    url: '/markov_sim/api/v1/runtime_config/create',
    method: 'post',
    timeout,
    response: ({ body }: { body: Omit<InferenceRuntimeConfigCreate, 'id' | 'created_at' | 'updated_at'> }) => {
      try {
        // 验证必填字段
        if (!body.name || !body.type) {
          return {
            code: 400,
            message: '缺少必填字段：name 和 type'
          }
        }

        // 检查名称是否已存在
        const existing = List.find((item) => item.name === body.name)
        if (existing) {
          return {
            code: 400,
            message: '硬件名称已存在'
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
    url: '/markov_sim/api/v1/runtime_config/update',
    method: 'put',
    timeout,
    response: ({ body }: { body: InferenceRuntimeConfigCreate }) => {
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
              message: '硬件名称已被其他配置使用'
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
    url: '/markov_sim/api/v1/runtime_config/delete_by_ids',
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
    url: '/markov_sim/api/v1/runtime_config/get_by_id/:id',
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
    url: '/markov_sim/api/v1/runtime_config/get_all',
    method: 'post',
    timeout,
    response: ({
      body
    }: {
      body: {
        filters?: { name?: string; type?: Type }
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
  }
]
