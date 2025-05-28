interface User {
  date: string
  name: string
  address: string
}

interface Card {
  id: number
  name: string
  status: 'running' | 'completed' | 'failed'
  createTime: string
  description: string
  items: string[]
}

interface TableRow {
  col1name: string
  col2compType: 'select' | 'input_number'
  col3name: string
  col4compType: 'select' | 'input_number'
}

enum Type {
  npu = 'npu',
  gpu = 'gpu'
}
// 系统配置相关类型
export interface SystemConfig {
  id: string
  timestamp: number
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
  newName: string
  useType: string
  modelType: string
  defaultConfigurations: string
  type: string
  processingMode: string
  Matrix16: number
  Vector16: number
  memory1GIB: number
  memory1GBps: number
  memory2GIB: number
  memory2GBps: number
  bandWidth1: number
  bandWidth2: number
  'size1(GB)': number
  'size2(GB)': number
  latency1: number
  latency2: number
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
