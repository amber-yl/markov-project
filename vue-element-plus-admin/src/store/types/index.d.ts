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

export interface Task {
  id: number
  name: string
  model: string
  hardware: string
  deployment: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  createTime: string
  updateTime: string
  creator: string
}

export interface FormData {
  name: string
  model: string
  hardware: string
  deployment: string
  // 其他表单字段
}

// 系统配置相关类型
export interface SystemConfig {
  id: number
  name: string
  type: string
  value: any
  description?: string
  createTime: string
  updateTime: string
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
