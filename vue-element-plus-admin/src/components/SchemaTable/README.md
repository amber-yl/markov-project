# SchemaTable 组件优化说明

## 优化内容

### 1. 代码复用性优化

#### 问题
原代码中网络列（带宽）的两个子列（节点内带宽、节点间带宽）存在大量重复代码：
- 表头筛选器逻辑重复
- 单元格渲染逻辑硬编码

#### 解决方案
- 创建了 `TableFilterHeader` 组件来复用筛选器逻辑
- 使用动态循环 `networkSubColumns` 来渲染子列
- 提取了 `getNetworkValue` 方法来统一处理数组值的获取

### 2. 配置化优化

#### 网络子列配置
```javascript
const networkSubColumns = computed(() => {
  // 支持从 schema 配置中读取，也提供默认配置
  return props.schema.uiConfig?.table?.networkSubColumns || [
    { label: '节点内带宽', key: 'internal' },
    { label: '节点间带宽', key: 'external' }
  ]
})
```

### 3. 组件拆分优化

#### TableFilterHeader 组件
独立的筛选器头部组件，具有以下特点：
- 接收必要的 props 而不是使用 provide/inject
- 统一的事件处理机制
- 可复用的筛选器UI

### 4. 工具函数优化

#### getSubColumnWidth
```javascript
const getSubColumnWidth = (width?: number, count: number = 1) => {
  if (width && count > 1) {
    return Math.floor(width / count)  // 确保整数宽度
  }
  return width
}
```

#### getNetworkValue
```javascript
const getNetworkValue = (row: any, prop: string, index: number) => {
  const value = row[prop]
  if (Array.isArray(value) && value.length > index) {
    return value[index]
  }
  return '-'  // 安全的默认值
}
```

### 5. 样式优化

- 添加了统一的 CSS 变量使用
- 改进了表格和标签的视觉效果
- 添加了响应式和交互状态样式

## 使用示例

```vue
<template>
  <schema-table
    :schema="tableSchema"
    :data="tableData"
    :loading="loading"
    enable-search
    enable-pagination
  />
</template>

<script setup>
const tableSchema = {
  uiConfig: {
    table: {
      columns: [
        { prop: 'name', label: '名称', filterable: true },
        { prop: 'networks', label: '网络带宽', filterable: true }
      ],
      networkSubColumns: [
        { label: '节点内带宽', key: 'internal' },
        { label: '节点间带宽', key: 'external' }
      ]
    }
  }
}

const tableData = [
  {
    name: 'Server 1',
    networks: ['100Mbps', '1Gbps']
  }
]
</script>
```

## 优化效果

1. **减少代码重复**: 网络列相关代码从 ~60 行减少到 ~20 行
2. **提高可维护性**: 筛选器逻辑集中在一个组件中
3. **增强可配置性**: 支持通过 schema 配置网络子列
4. **改善用户体验**: 更好的样式和交互效果
5. **类型安全**: 完善的 TypeScript 类型定义 