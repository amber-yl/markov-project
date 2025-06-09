import Mock from 'mockjs'
import { SUCCESS_CODE } from '@/constants'
import { toAnyString } from '@/utils'

const timeout = 1000
const count = 100

interface Task {
  id: string
  name: string
  model: string
  status: string
  createTime: string
  updateTime?: string
  creator?: string
  hardware?: string
  deployment?: string
}

// 真实的硬件名称数据
const Model_NAMES = [
  'llama_3_70b',
  'llama_3_8b',
  'gpt_4',
  'claude_3',
  'claude_2',
  'chatglm_6b',
  'chatglm_2_6b',
  'chatglm2_6b',
  'chatglm3_6b'
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

const STATUS_CODES = ['running', 'pending', 'completed', 'failed', 'stopped']

const CREATOR = ['admin', 'user1', 'user2', 'user3', 'user4', 'user5']

const DevelopmentMode = ['Training', 'Inference', 'Evaluation', 'Debugging', 'Optimization']
// 生成更真实的硬件配置数据
const generateHardwareConfig = (): Partial<Task> => {
  const name = Mock.Random.pick(NPU_NAMES)
  const model = Mock.Random.pick(Model_NAMES)
  const status = Mock.Random.pick(STATUS_CODES)
  const creator = Mock.Random.pick(CREATOR)
  const hardware = Mock.Random.pick(NPU_NAMES)
  const deployment = Mock.Random.pick(DevelopmentMode)
  return {
    name,
    model,
    status,
    creator,
    hardware,
    deployment
  }
}

let List: Task[] = []

// 生成更真实的mock数据
for (let i = 0; i < count; i++) {
  const config = generateHardwareConfig()
  const now = new Date()
  const createTime = new Date(now.getTime() - Mock.Random.integer(0, 365 * 24 * 60 * 60 * 1000))
  const updateTime = new Date(
    createTime.getTime() + Mock.Random.integer(0, now.getTime() - createTime.getTime())
  )
  List.push({
    id: toAnyString(),
    created_at: createTime.toISOString(),
    updated_at: updateTime.toISOString(),
    ...config
  } as Task)
}

// 工具函数：处理分页
const paginate = (data: Task[], page: number, perPage: number) => {
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
const filterData = (data: Task[], filters: any) => {
  console.log('Mock API - 接收到的筛选条件:', filters)

  if (!filters) return data

  return data.filter((item) => {
    for (const [key, value] of Object.entries(filters)) {
      if (value === null || value === undefined || value === '') continue

      console.log(`筛选字段 ${key}, 筛选值:`, value, '数据项值:', item[key as keyof Task])

      if (key === 'name') {
        if (typeof value === 'string') {
          if (!item.name.toLowerCase().includes(value.toLowerCase())) return false
        } else if (Array.isArray(value)) {
          if (!value.some((v) => item.name.toLowerCase().includes(v.toLowerCase()))) return false
        }
      }
    }
    return true
  })
}

// 工具函数：处理排序
const sortData = (data: Task[], orderBys: string[]) => {
  if (!orderBys || orderBys.length === 0) return data

  return data.sort((a, b) => {
    for (const orderBy of orderBys) {
      const isDesc = orderBy.startsWith('-')
      const field = isDesc ? orderBy.slice(1) : orderBy

      let aVal: any = a[field as keyof Task]
      let bVal: any = b[field as keyof Task]

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
const findById = (id: string): Task | undefined => {
  return List.find((item) => item.id === id)
}

// 工具函数：删除数据
const deleteByIds = (ids: string[]): boolean => {
  const initialLength = List.length
  List = List.filter((item) => !ids.includes(item.id!))
  return List.length < initialLength
}

// 工具函数：更新数据
const updateItem = (id: string, updateData: Partial<Task>): Task | null => {
  const index = List.findIndex((item) => item.id === id)
  if (index === -1) return null

  List[index] = {
    ...List[index],
    ...updateData,
    id,
    updateTime: new Date().toISOString()
  }
  return List[index]
}

// 工具函数：创建数据
const createItem = (data: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Task => {
  const newItem: Task = {
    ...data,
    id: toAnyString(),
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString()
  }
  List.push(newItem)
  return newItem
}

export default [
  // 创建系统配置
  {
    url: '/markov_sim/api/v1/all_tasks/create',
    method: 'post',
    timeout,
    response: ({ body }: { body: Omit<Task, 'id' | 'created_at' | 'updated_at'> }) => {
      try {
        // 验证必填字段
        if (!body.name) {
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
    url: '/markov_sim/api/v1/all_tasks/update',
    method: 'put',
    timeout,
    response: ({ body }: { body: Task }) => {
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
    url: '/markov_sim/api/v1/all_tasks/delete_by_ids',
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
    url: '/markov_sim/api/v1/all_tasks/get_by_id/:id',
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
    url: '/markov_sim/api/v1/all_tasks/get_all',
    method: 'post',
    timeout,
    response: ({
      body
    }: {
      body: {
        filters?: { name?: string }
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
