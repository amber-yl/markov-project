# Schema配置化组件使用指南

本系统实现了基于JSON Schema的配置化表单和表格组件，允许通过配置而非硬编码来定义UI结构。

## 组件概述

### SchemaForm - 动态表单组件
基于JSON Schema自动生成表单，支持分组、验证、多种输入类型。

### SchemaTable - 动态表格组件
基于JSON Schema自动生成表格，支持筛选、排序、分页、列管理等功能。

## 配置结构

### JSON Schema扩展配置

```typescript
export const enhancedSystemConfigSchema = {
  type: 'object',
  title: 'SystemConfigCreate',
  
  // UI配置
  uiConfig: {
    form: {
      layout: {
        type: 'grid',
        columns: 2,
        gutter: 20
      },
      groups: [
        {
          title: '基本信息',
          fields: ['name', 'type', 'processing_mode']
        }
      ]
    },
    table: {
      columns: [
        {
          prop: 'name',
          label: '硬件名称',
          minWidth: 150,
          sortable: true,
          filterable: true,
          filterType: 'text'
        }
      ]
    }
  },
  
  properties: {
    name: {
      title: '硬件名称',
      type: 'string',
      uiType: 'input',
      uiProps: {
        placeholder: '请输入硬件名称',
        maxLength: 50
      }
    }
  }
}
```

## 表单字段配置

### 支持的UI类型

- `input`: 文本输入框
- `number`: 数字输入框
- `radio`: 单选框组
- `select`: 下拉选择框
- `switch`: 开关
- `array`: 数组类型（动态添加/删除）

### 字段配置示例

```typescript
// 文本输入
name: {
  title: '硬件名称',
  type: 'string',
  uiType: 'input',
  uiProps: {
    placeholder: '请输入硬件名称',
    maxLength: 50
  }
}

// 数字输入
tflops: {
  title: 'Cube算力(TFLOPS)',
  type: 'number',
  uiType: 'number',
  uiProps: {
    min: 0,
    step: 1,
    placeholder: '请输入Cube算力'
  }
}

// 单选框
type: {
  title: '硬件类型',
  type: 'string',
  uiType: 'radio',
  uiProps: {
    options: [
      { label: 'NPU', value: 'npu' },
      { label: 'GPU', value: 'gpu' }
    ]
  }
}

// 数组类型
networks: {
  title: '网络配置',
  type: 'array',
  uiType: 'array',
  uiProps: {
    addButtonText: '添加网络配置',
    removeButtonText: '删除'
  },
  items: {
    $ref: '#/$defs/Network'
  }
}
```

## 表格列配置

### 支持的格式化器

- `datetime`: 日期时间格式
- `number`: 数字格式（千分位）
- `percentage`: 百分比格式
- `memory`: 内存格式（GB/TB）
- `bandwidth`: 带宽格式（GB/s）
- `tag`: 标签格式

### 列配置示例

```typescript
{
  prop: 'created_at',
  label: '创建时间',
  minWidth: 160,
  sortable: true,
  filterable: false,
  formatter: 'datetime'
},
{
  prop: 'type',
  label: '硬件类型',
  minWidth: 120,
  sortable: true,
  filterable: true,
  filterType: 'select',
  formatter: 'tag'
},
{
  prop: 'matrix.float16.calibration_coefficient',
  label: 'Cube-利用率',
  minWidth: 150,
  sortable: true,
  filterable: false,
  formatter: 'percentage',
  defaultHidden: true
}
```

## 使用方法

### 1. 在页面中使用

```vue
<template>
  <!-- Schema表格 -->
  <schema-table
    :schema="configSchema"
    :data="configs"
    :loading="loading"
    @create="handleCreate"
    @edit="handleEdit"
    @delete="handleDelete"
  />

  <!-- Schema表单 -->
  <schema-form
    ref="formRef"
    :schema="configSchema"
    v-model="formData"
    @validate="handleValidate"
  />
</template>

<script setup>
import SchemaTable from '@/components/SchemaTable/index.vue'
import SchemaForm from '@/components/SchemaForm/index.vue'

// 获取Schema配置
const configSchema = computed(() => store.schemeConfigs)
</script>
```

### 2. API返回Schema配置

```typescript
// Mock API返回
{
  code: 200,
  data: {
    schema: enhancedSystemConfigSchema
  }
}
```

### 3. Store中获取Schema

```typescript
// 在store中获取和使用schema
async fetchSchemaConfigs() {
  const { data } = await markov_sim_get_create_model_schema()
  this.schemeConfigs = data.schema
}
```

## 优势

1. **配置驱动**: 通过JSON配置而非代码定义UI结构
2. **类型安全**: 基于JSON Schema的类型验证
3. **动态生成**: 自动根据Schema生成表单和表格
4. **高度可配置**: 支持丰富的UI组件和格式化选项
5. **易于维护**: 修改配置即可调整UI，无需修改代码
6. **复用性强**: 同一个Schema可以用于多个场景

## 扩展性

系统设计为高度可扩展：

1. **新增字段类型**: 在SchemaFormItem中添加新的uiType
2. **新增格式化器**: 在SchemaTableCell中添加新的formatter
3. **自定义验证**: 扩展JSON Schema验证规则
4. **主题定制**: 通过CSS变量定制样式

这个配置化系统让前端开发更加灵活和高效，特别适合需要频繁调整表单和表格结构的业务场景。 