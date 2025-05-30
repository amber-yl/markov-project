import Mock from 'mockjs'
import { SUCCESS_CODE } from '@/constants'
import { toAnyString } from '@/utils'

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

let List: ListProps[] = []

for (let i = 0; i < count; i++) {
  List.push(
    Mock.mock({
      id: toAnyString(),
      created_at: '@datetime',
      updated_at: '@datetime',
      name: '@name',
      type: Mock.Random.pick([Type.npu, Type.gpu]),
      matrix: {
        float16: {
          tflops: '@integer(100, 1000)',
          calibration_coefficient: '@float(0, 1, 2, 2)'
        }
      },
      vector: {
        float16: {
          tflops: '@integer(1, 100)',
          calibration_coefficient: '@float(0, 1, 2, 2)'
        }
      },
      men1: {
        GiB: '@integer(1, 100)',
        GiBps: '@integer(100, 1000)',
        cube_calibration_coefficient: '@float(0, 1, 2, 2)',
        vector_calibration_coefficient: '@float(0, 1, 2, 2)'
      },
      men2: {
        GiB: '@float(100, 1000)',
        GiBps: '@float(1, 100, 2, 2)'
      },
      processing_mode: Mock.Random.pick([ProcessingMode.noOverlap, ProcessingMode.roofline]),
      netWorks: [
        {
          bandWidth: '@integer(100, 1000)',
          efficiency: '@float(0, 1, 2, 2)',
          size: '@integer(100, 1000)',
          latency: '@float(0, 1, 2, 2)'
        }
      ]
    })
  )
}
export default [
  // 列表接口
  {
    url: '/markov_sim/api/v1/system_config/list',
    method: 'get',
    timeout,
    response: () => {
      return {
        code: SUCCESS_CODE,
        data: {
          total: List.length,
          list: List
        }
      }
    }
  },
  // 保存接口
  {
    url: '/markov_sim/api/v1/system_config/create',
    method: 'post',
    timeout,
    response: ({ body }) => {
      List.push(body)
      return {
        code: SUCCESS_CODE,
        message: '添加成功'
      }
    }
  },
  // 详情接口
  {
    url: '/markov_sim/api/v1/system_config/detail',
    method: 'get',
    response: ({ query }) => {
      const { id } = query
      for (const example of List) {
        if (example.id === id) {
          return {
            code: SUCCESS_CODE,
            data: example
          }
        }
      }
    }
  },
  // 删除接口
  {
    url: '/markov_sim/api/v1/system_config/delete',
    method: 'post',
    response: ({ body }) => {
      const ids = body.ids
      console.log(ids, "| ids");
      if (!ids) {
        return {
          code: 500,
          message: '请选择需要删除的数据'
        }
      } else {
        List = List.filter((item) => !ids.includes(item.id))
        return {
          code: SUCCESS_CODE,
          message: '删除成功'
        }
      }
    }
  },
  // 编辑接口
  {
    url: '/markov_sim/api/v1/system_config/update',
    method: 'post',
    response: ({ body }) => {
      const {
        id,
        name,
        type,
        created_at,
        updated_at,
        matrix,
        vector,
        men1,
        men2,
        processing_mode,
        netWorks
      } = body
      for (const example of List) {
        if (example.id === id) {
          example.name = name
          example.type = type
          example.created_at = created_at
          example.updated_at = updated_at
          example.matrix = matrix
          example.vector = vector
          example.men1 = men1
          example.men2 = men2
          example.processing_mode = processing_mode
          example.netWorks = netWorks
          return {
            code: SUCCESS_CODE,
            message: '编辑成功'
          }
        }
      }
    }
  }
]
