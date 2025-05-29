export enum Type {
  npu = 'npu',
  gpu = 'gpu'
}
// 枚举导入
export enum ProcessingMode {
  roofline = 'roofline',
  noOverlap = 'no_overlap'
}

// 系统配置相关类型
export interface SystemConfig {
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

export interface ConfigFormData {
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

// 表格过滤相关类型
export interface TableFilter {
  [key: string]: string[] | string
}

export interface TableColumn {
  label: string
  prop: string
  isShow: boolean
  fixed?: string
  minWidth?: string
  width?: string
}

// 模型对比相关类型
export interface ModelComparison {
  id: number
  hidden: number
  feedforward: number
  seq_size: number | null
  model_names: string
}

export interface CollapseItem {
  collapseName: number
  headerName: string
  iconName: string
}

// 表单字段相关类型
export interface FormField {
  field: string
  label: string
  component: 'Select' | 'InputNumber' | 'Switch' | 'Input' | 'Radio'
  componentProps?: Record<string, any>
  options?: Array<{ label: string; value: string | number }>
  required?: boolean
  validator?: (value: any) => boolean | string
}

export interface FormSection {
  key: string
  title: string
  required?: boolean
  visible?: () => boolean
  fields: FormField[]
  isSingleCol?: boolean
}

// 分页相关类型
export interface PaginationConfig {
  currentPage: number
  pageSize: number
  total: number
  pageSizes: number[]
}

// API响应类型
export interface ApiResponse<T = any> {
  code: number
  data: T
  message: string
  success: boolean
}

export interface ListResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export type { User, Card, TableRow }
