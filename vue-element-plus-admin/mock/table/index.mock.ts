import Mock from 'mockjs'
import { SUCCESS_CODE } from '@/constants'
import { toAnyString } from '@/utils'
import { userSchema } from './jsonschema'

const timeout = 1000
const count = 100

enum Type {
  npu = 'npu',
  gpu = 'gpu'
}

enum ProcessingMode {
  roofline = 'roofline',
  noOverlap = 'no_overlap'
}

interface ListProps {
  id?: string
  created_at: string
  updated_at: string
  name: string // 硬件名称
  type: Type // 硬件类型
  matrix: {
    float16: {
      tflops: number
      calibration_coefficient: number
    }
  }
  vector: {
    float16: {
      tflops: number
      calibration_coefficient: number
    }
  }
  men1: {
    GiB: number
    GiBps: number
    cube_calibration_coefficient: number
    vector_calibration_coefficient: number
  }
  men2: {
    GiB: number
    GiBps: number
    cube_calibration_coefficient?: number
    vector_calibration_coefficient?: number
  }
  processing_mode: ProcessingMode
  netWorks: {
    bandWidth: number
    efficiency: number
    size: number
    latency: number
  }[]
}

// 真实的硬件名称数据
const GPU_NAMES = [
  'NVIDIA RTX 4090', 'NVIDIA RTX 4080', 'NVIDIA RTX 4070 Ti', 'NVIDIA RTX 4070',
  'NVIDIA RTX 4060 Ti', 'NVIDIA RTX 4060', 'NVIDIA RTX 3090 Ti', 'NVIDIA RTX 3090',
  'NVIDIA RTX 3080 Ti', 'NVIDIA RTX 3080', 'NVIDIA RTX 3070 Ti', 'NVIDIA RTX 3070',
  'NVIDIA A100', 'NVIDIA H100', 'NVIDIA V100', 'NVIDIA T4', 'Tesla P100',
  'AMD RX 7900 XTX', 'AMD RX 7900 XT', 'AMD RX 7800 XT', 'AMD RX 7700 XT'
]

const NPU_NAMES = [
  'Huawei Ascend 910B', 'Huawei Ascend 910A', 'Huawei Ascend 310P', 'Huawei Ascend 310',
  'Intel Gaudi2', 'Intel Gaudi', 'Google TPU v4', 'Google TPU v3', 'Google TPU v2',
  'Cambricon MLU370', 'Cambricon MLU290', 'Cambricon MLU270', 'Cambricon MLU220',
  'Horizon Journey-5', 'Horizon Journey-3', 'Rockchip RK3588', 'Sophgo BM1684X'
]

// 生成更真实的硬件配置数据
const generateHardwareConfig = (type: Type): Partial<ListProps> => {
  const names = type === Type.gpu ? GPU_NAMES : NPU_NAMES
  const name = Mock.Random.pick(names)

  if (type === Type.gpu) {
    // GPU配置参数范围
    return {
      name,
      type,
      matrix: {
        float16: {
          tflops: Mock.Random.integer(50, 320), // GPU Matrix性能范围
          calibration_coefficient: Mock.Random.float(0.6, 0.95, 2, 2)
        }
      },
      vector: {
        float16: {
          tflops: Mock.Random.integer(20, 160), // GPU Vector性能范围
          calibration_coefficient: Mock.Random.float(0.7, 0.9, 2, 2)
        }
      },
      men1: {
        GiB: Mock.Random.pick([8, 12, 16, 24, 32, 48, 64, 80, 128]), // 常见GPU显存配置
        GiBps: Mock.Random.integer(400, 2000), // GPU显存带宽
        cube_calibration_coefficient: Mock.Random.float(0.5, 0.8, 2, 2),
        vector_calibration_coefficient: Mock.Random.float(0.3, 0.7, 2, 2)
      },
      men2: {
        GiB: Mock.Random.pick([16, 32, 64, 128, 256, 512]), // 系统内存
        GiBps: Mock.Random.integer(50, 200) // 系统内存带宽
      },
      processing_mode: Mock.Random.pick([ProcessingMode.roofline, ProcessingMode.noOverlap]),
      netWorks: Mock.Random.pick([
        [{ bandWidth: 100, efficiency: 0.8, size: 1, latency: 0.001 }], // 单卡
        [{ bandWidth: 400, efficiency: 0.85, size: 2, latency: 0.002 }], // 双卡
        [{ bandWidth: 600, efficiency: 0.9, size: 4, latency: 0.003 }], // 四卡
        [{ bandWidth: 800, efficiency: 0.92, size: 8, latency: 0.005 }]  // 八卡
      ])
    }
  } else {
    // NPU配置参数范围
    return {
      name,
      type,
      matrix: {
        float16: {
          tflops: Mock.Random.integer(64, 512), // NPU Matrix性能通常更高
          calibration_coefficient: Mock.Random.float(0.7, 0.95, 2, 2)
        }
      },
      vector: {
        float16: {
          tflops: Mock.Random.integer(32, 256), // NPU Vector性能
          calibration_coefficient: Mock.Random.float(0.75, 0.92, 2, 2)
        }
      },
      men1: {
        GiB: Mock.Random.pick([32, 64, 128, 256, 512]), // NPU显存配置
        GiBps: Mock.Random.integer(900, 3000), // NPU显存带宽通常更高
        cube_calibration_coefficient: Mock.Random.float(0.6, 0.85, 2, 2),
        vector_calibration_coefficient: Mock.Random.float(0.4, 0.75, 2, 2)
      },
      men2: {
        GiB: Mock.Random.pick([64, 128, 256, 512, 1024]), // NPU系统内存
        GiBps: Mock.Random.integer(100, 400)
      },
      processing_mode: Mock.Random.pick([ProcessingMode.roofline, ProcessingMode.noOverlap]),
      netWorks: Mock.Random.pick([
        [{ bandWidth: 200, efficiency: 0.85, size: 1, latency: 0.0005 }],
        [{ bandWidth: 800, efficiency: 0.9, size: 4, latency: 0.001 }],
        [{ bandWidth: 1600, efficiency: 0.92, size: 8, latency: 0.002 }],
        [{ bandWidth: 3200, efficiency: 0.95, size: 16, latency: 0.003 }]
      ])
    }
  }
}

let List: ListProps[] = []

// 生成更真实的mock数据
for (let i = 0; i < count; i++) {
  const type = Mock.Random.pick([Type.npu, Type.gpu])
  const config = generateHardwareConfig(type)
  const now = new Date()
  const createdAt = new Date(now.getTime() - Mock.Random.integer(0, 365 * 24 * 60 * 60 * 1000))
  const updatedAt = new Date(createdAt.getTime() + Mock.Random.integer(0, (now.getTime() - createdAt.getTime())))

  List.push({
    id: toAnyString(),
    created_at: createdAt.toISOString(),
    updated_at: updatedAt.toISOString(),
    ...config
  } as ListProps)
}

// 工具函数：处理分页
const paginate = (data: ListProps[], page: number, perPage: number) => {
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
const filterData = (data: ListProps[], filters: any) => {
  console.log('Mock API - 接收到的筛选条件:', filters)

  if (!filters) return data

  return data.filter(item => {
    for (const [key, value] of Object.entries(filters)) {
      if (value === null || value === undefined || value === '') continue

      console.log(`筛选字段 ${key}, 筛选值:`, value, '数据项值:', item[key as keyof ListProps])

      if (key === 'name') {
        if (typeof value === 'string') {
          if (!item.name.toLowerCase().includes(value.toLowerCase())) return false
        } else if (Array.isArray(value)) {
          if (!value.some(v => item.name.toLowerCase().includes(v.toLowerCase()))) return false
        }
      } else if (key === 'type') {
        if (typeof value === 'string') {
          if (value !== item.type) return false
        } else if (Array.isArray(value)) {
          if (!value.includes(item.type)) return false
        }
      } else if (key === 'processing_mode') {
        if (typeof value === 'string') {
          if (value !== item.processing_mode) return false
        } else if (Array.isArray(value)) {
          if (!value.includes(item.processing_mode)) return false
        }
      }
    }
    return true
  })
}

// 工具函数：处理排序
const sortData = (data: ListProps[], orderBys: string[]) => {
  if (!orderBys || orderBys.length === 0) return data

  return data.sort((a, b) => {
    for (const orderBy of orderBys) {
      const isDesc = orderBy.startsWith('-')
      const field = isDesc ? orderBy.slice(1) : orderBy

      let aVal: any = a[field as keyof ListProps]
      let bVal: any = b[field as keyof ListProps]

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
const findById = (id: string): ListProps | undefined => {
  return List.find(item => item.id === id)
}

// 工具函数：删除数据
const deleteByIds = (ids: string[]): boolean => {
  const initialLength = List.length
  List = List.filter(item => !ids.includes(item.id!))
  return List.length < initialLength
}

// 工具函数：更新数据
const updateItem = (id: string, updateData: Partial<ListProps>): ListProps | null => {
  const index = List.findIndex(item => item.id === id)
  if (index === -1) return null

  List[index] = {
    ...List[index],
    ...updateData,
    id,
    updated_at: new Date().toISOString()
  }
  return List[index]
}

// 工具函数：创建数据
const createItem = (data: Omit<ListProps, 'id' | 'created_at' | 'updated_at'>): ListProps => {
  const newItem: ListProps = {
    ...data,
    id: toAnyString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  List.push(newItem)
  return newItem
}

export default [
  // 获取创建模型的JSON Schema
  {
    url: '/markov_sim/api/v1/system_config/get_create_model_schema',
    method: 'get',
    timeout,
    response: () => {
      return {
        code: SUCCESS_CODE,
        data: {
          schema: Mock.toJSONSchema(userSchema)
        }
      }
    }
  },

  // 创建系统配置
  {
    url: '/markov_sim/api/v1/system_config/create',
    method: 'post',
    timeout,
    response: ({ body }: { body: Omit<ListProps, 'id' | 'created_at' | 'updated_at'> }) => {
      try {
        // 验证必填字段
        if (!body.name || !body.type) {
          return {
            code: 400,
            message: '缺少必填字段：name 和 type'
          }
        }

        // 检查名称是否已存在
        const existing = List.find(item => item.name === body.name)
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
    url: '/markov_sim/api/v1/system_config/update',
    method: 'put',
    timeout,
    response: ({ body }: { body: ListProps }) => {
      try {
        if (!body.id) {
          return {
            code: 400,
            message: '缺少必填字段：id'
          }
        }

        // 检查名称是否已被其他项使用
        if (body.name) {
          const existing = List.find(item => item.name === body.name && item.id !== body.id)
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
    url: '/markov_sim/api/v1/system_config/delete_by_ids',
    method: 'delete',
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
    url: '/markov_sim/api/v1/system_config/get_by_id',
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
    url: '/markov_sim/api/v1/system_config/get_all',
    method: 'post',
    timeout,
    response: ({ body }: {
      body: {
        filters?: { name?: string; type?: Type; processing_mode?: ProcessingMode };
        order_bys?: string[];
        page?: number;
        per_page?: number;
      }
    }) => {
      try {
        const { filters, order_bys = [], page = 1, per_page = 10 } = body || {}

        // 验证分页参数
        if (page < 1 || per_page < 1 || per_page > 100) {
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
        const paginatedResult = paginate(filteredData, page, per_page)

        return {
          code: SUCCESS_CODE,
          data: {
            list: paginatedResult.items,
            total: paginatedResult.total,
            page: paginatedResult.page,
            per_page: paginatedResult.perPage,
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

  // 获取硬件类型统计
  {
    url: '/markov_sim/api/v1/system_config/stats',
    method: 'get',
    timeout,
    response: () => {
      const stats = List.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1
        return acc
      }, {} as Record<Type, number>)

      return {
        code: SUCCESS_CODE,
        data: {
          total: List.length,
          by_type: stats,
          by_processing_mode: List.reduce((acc, item) => {
            acc[item.processing_mode] = (acc[item.processing_mode] || 0) + 1
            return acc
          }, {} as Record<ProcessingMode, number>)
        }
      }
    }
  }
]
