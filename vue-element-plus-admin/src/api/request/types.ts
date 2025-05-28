enum Type {
  npu = 'npu',
  gpu = 'gpu'
}

interface ListProps {
  id?: string
  timestamp?: number
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
  processing_mode: string
  netWorks: {
    bandWidth: number
    efficiency: number
    size: number
    latency: number
  }[]
}

export interface RequestResponse {
  list: ListProps[]
  total: number
}
