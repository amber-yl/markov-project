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

export type { User, Card, TableRow }
