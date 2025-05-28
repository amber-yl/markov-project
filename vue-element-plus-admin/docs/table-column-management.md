# 表格列管理功能优化文档

## 概述

本项目对表格列管理功能进行了全面优化，提供了统一的数据管理、公共逻辑封装和优化的用户交互体验。

## 主要优化点

### 1. 数据统一管理 (Store)

#### SystemConfig Store
- 路径: `src/store/modules/systemConfigs.ts`
- 功能: 统一管理系统配置的表格数据、列配置、过滤器、分页等
- 主要方法:
  - `fetchConfigs()`: 获取配置列表
  - `setColumnVisibility()`: 设置单列可见性
  - `handleTransferChange()`: 处理Transfer组件变化
  - `getTransferData()`: 获取Transfer数据

#### Inference Store
- 路径: `src/store/modules/inference.ts`
- 功能: 管理AI推理任务数据，包含分页、过滤功能

### 2. 公共逻辑封装 (Composables)

#### useTableColumns
- 路径: `src/composables/useTableColumns.ts`
- 功能: 封装表格列管理的通用逻辑
- 主要特性:
  - 响应式列配置管理
  - Transfer组件数据自动生成
  - 列可见性双向同步
  - 批量操作支持

```typescript
// 使用示例
import { useTableColumns } from '@/composables/useTableColumns'

const initialColumns = [
  { label: 'Name', prop: 'name', isShow: true },
  { label: 'Date', prop: 'date', isShow: false },
  // ...
]

const {
  columns,
  visibleColumns,
  transferData,
  rightValue,
  handleTransferChange,
  setColumnVisibility,
  showAllColumns,
  hideAllColumns
} = useTableColumns(initialColumns)
```

#### usePagination
- 路径: `src/composables/usePagination.ts`
- 功能: 封装分页逻辑，支持响应式数据处理

### 3. API服务层优化

#### 统一API管理
- 路径: `src/api/common/index.ts`
- 功能: 提供统一的API接口
- 包含服务:
  - `taskApi`: 任务相关API
  - `configApi`: 配置相关API
  - `comparisonApi`: 模型对比API
  - `commonApi`: 通用API

### 4. Transfer组件优化

#### 主要改进
1. **左右侧明确定义**:
   - 左侧: 隐藏的列
   - 右侧: 显示的列

2. **数据双向同步**:
   - Transfer变化自动更新表格列
   - 表格列变化自动更新Transfer

3. **用户体验优化**:
   - 添加统计信息展示
   - 提供快捷操作按钮
   - 优化空状态提示
   - 美化UI样式

#### 实现示例

```vue
<template>
  <el-transfer 
    v-model="transferRightValue" 
    :titles="['隐藏的列', '显示的列']"
    :data="transferData" 
    @change="handleTransferChange"
    filterable>
    
    <!-- 自定义选项显示 -->
    <template #default="{ option }">
      <span>{{ option.label }}</span>
    </template>
    
    <!-- 空状态优化 -->
    <template #left-empty>
      <el-empty description="所有列都已显示">
        <el-button @click="hideAllColumns">隐藏一些列</el-button>
      </el-empty>
    </template>
  </el-transfer>
  
  <!-- 快捷操作 -->
  <div class="transfer-actions">
    <el-button @click="showAllColumns">显示所有</el-button>
    <el-button @click="hideAllColumns">隐藏所有</el-button>
    <el-button @click="resetColumns">重置默认</el-button>
  </div>
</template>
```

## 类型定义扩展

### 新增类型
- `TableColumn`: 表格列配置
- `TableFilter`: 表格过滤器
- `PaginationConfig`: 分页配置
- `SystemConfig`: 系统配置
- `ConfigFormData`: 配置表单数据

## 使用指南

### 1. 在新页面中使用

```vue
<script setup>
import { useTableColumns } from '@/composables/useTableColumns'
import { useSystemConfigStore } from '@/store/modules/systemConfigs'

const store = useSystemConfigStore()
const {
  transferData,
  rightValue: transferRightValue,
  handleTransferChange,
  showAllColumns,
  hideAllColumns,
  resetColumns
} = useTableColumns(store.columns)

// 在页面挂载时获取数据
onMounted(() => {
  store.fetchConfigs()
})
</script>
```

### 2. 自定义列配置

```typescript
const customColumns = [
  { 
    label: '用户名', 
    prop: 'username', 
    isShow: true, 
    fixed: 'left',
    minWidth: '100'
  },
  { 
    label: '创建时间', 
    prop: 'createTime', 
    isShow: false,
    minWidth: '150'
  },
  // 操作列自动排除，无需手动管理
  { 
    label: '操作', 
    prop: 'operations', 
    isShow: true, 
    fixed: 'right'
  }
]
```

## 最佳实践

### 1. 状态管理
- 将表格相关状态统一放在对应的store中
- 使用计算属性处理派生数据
- 合理使用持久化存储用户偏好

### 2. 性能优化
- 使用虚拟滚动处理大量数据
- 合理使用防抖和节流
- 避免不必要的响应式转换

### 3. 用户体验
- 提供清晰的操作反馈
- 保存用户的列配置偏好
- 提供合理的默认配置

## 后续扩展

### 计划功能
1. 列排序功能
2. 列宽度调整
3. 列固定位置调整
4. 导入/导出列配置
5. 预设配置模板

### 技术优化
1. 增加单元测试覆盖
2. 添加TypeScript严格模式
3. 性能监控和优化
4. 无障碍访问支持 