# SchemaForm 组件

一个基于 JSON Schema 的动态表单组件，支持多种字段类型和完整的表单验证。

## 特性

- 🚀 基于 JSON Schema 自动生成表单
- 📝 支持多种字段类型：字符串、数字、布尔值、枚举、数组、对象等
- ✅ 完整的表单验证规则
- 🎯 支持嵌套对象和数组
- 🎨 响应式布局
- 🔧 支持自定义 UI 配置

## 基本用法

```vue
<template>
  <div>
    <schema-form 
      v-model="formData" 
      :schema="schema" 
      @validate="handleValidate"
      ref="formRef"
    />
    
    <div style="margin-top: 20px;">
      <el-button type="primary" @click="submitForm">提交</el-button>
      <el-button @click="resetForm">重置</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SchemaForm from '@/components/SchemaForm'

const formRef = ref()
const formData = ref({})

const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      title: '姓名',
      description: '请输入您的姓名',
      minLength: 2,
      maxLength: 20
    },
    age: {
      type: 'integer',
      title: '年龄',
      minimum: 1,
      maximum: 120
    },
    email: {
      type: 'string',
      title: '邮箱',
      pattern: '^[^@]+@[^@]+\\.[^@]+$'
    },
    gender: {
      type: 'string',
      title: '性别',
      enum: ['male', 'female', 'other']
    },
    isVip: {
      type: 'boolean',
      title: 'VIP会员'
    },
    hobbies: {
      type: 'array',
      title: '爱好',
      items: {
        type: 'string'
      },
      minItems: 1
    },
    address: {
      type: 'object',
      title: '地址信息',
      properties: {
        province: {
          type: 'string',
          title: '省份'
        },
        city: {
          type: 'string',
          title: '城市'
        }
      }
    }
  },
  required: ['name', 'age', 'email']
}

const handleValidate = (valid, fields) => {
  if (valid) {
    console.log('表单验证通过')
  } else {
    console.log('表单验证失败', fields)
  }
}

const submitForm = async () => {
  const valid = await formRef.value?.validate()
  if (valid) {
    console.log('提交数据:', formData.value)
  }
}

const resetForm = () => {
  formRef.value?.resetFields()
}
</script>
```

## 支持的字段类型

### 基本类型

#### 字符串 (string)
```json
{
  "type": "string",
  "title": "用户名",
  "minLength": 2,
  "maxLength": 20,
  "pattern": "^[a-zA-Z0-9_]+$"
}
```

#### 数字 (number/integer)
```json
{
  "type": "integer",
  "title": "年龄",
  "minimum": 0,
  "maximum": 150,
  "exclusiveMinimum": 0
}
```

#### 布尔值 (boolean)
```json
{
  "type": "boolean",
  "title": "是否同意条款"
}
```

### 枚举类型

```json
{
  "type": "string",
  "title": "状态",
  "enum": ["active", "inactive", "pending"]
}
```

### 数组类型

#### 基本类型数组
```json
{
  "type": "array",
  "title": "标签",
  "items": {
    "type": "string"
  },
  "minItems": 1,
  "maxItems": 5
}
```

#### 对象数组
```json
{
  "type": "array",
  "title": "联系人",
  "items": {
    "type": "object",
    "properties": {
      "name": {
        "type": "string",
        "title": "姓名"
      },
      "phone": {
        "type": "string",
        "title": "电话"
      }
    }
  }
}
```

### 对象类型

```json
{
  "type": "object",
  "title": "地址",
  "properties": {
    "street": {
      "type": "string",
      "title": "街道"
    },
    "city": {
      "type": "string",
      "title": "城市"
    }
  }
}
```

### anyOf 类型支持

```json
{
  "title": "可选数值",
  "anyOf": [
    {
      "type": "number",
      "minimum": 0
    },
    {
      "type": "null"
    }
  ]
}
```

## UI 配置

可以通过 `uiConfig` 来自定义表单布局：

```json
{
  "type": "object",
  "uiConfig": {
    "form": {
      "layout": {
        "columns": 2,
        "gutter": 20
      },
      "groups": [
        {
          "title": "基本信息",
          "fields": ["name", "age", "email"]
        },
        {
          "title": "联系信息",
          "fields": ["phone", "address"]
        }
      ]
    }
  },
  "properties": {
    // ... 字段定义
  }
}
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| schema | JSON Schema 定义 | object | - |
| modelValue | 表单数据 | object | {} |
| labelWidth | 标签宽度 | string | '120px' |
| size | 表单尺寸 | string | 'default' |
| flattenContainers | 需要展平的容器名称数组 | string[] | ['float16'] |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 表单数据更新 | (value: any) |
| validate | 表单验证 | (valid: boolean, fields?: any) |

### Methods

| 方法名 | 说明 | 参数 |
|--------|------|------|
| validate | 验证表单 | - |
| resetFields | 重置表单 | - |
| clearValidate | 清空验证 | - |

## 验证规则

组件会根据 JSON Schema 自动生成验证规则：

- **required**: 必填验证
- **type**: 类型验证
- **minLength/maxLength**: 字符串长度验证
- **minimum/maximum**: 数值范围验证
- **exclusiveMinimum/exclusiveMaximum**: 数值排他性范围验证
- **pattern**: 正则表达式验证
- **minItems/maxItems**: 数组长度验证
- **enum**: 枚举值验证

## 注意事项

1. Schema 必须符合 JSON Schema 规范
2. 支持 anyOf 类型，会自动选择非 null 的类型进行渲染
3. 枚举类型少于等于3个选项时使用单选框，否则使用下拉选择
4. 字符串类型超过100个字符限制时自动使用多行文本框
5. 数组和对象类型支持动态添加和删除 

## 特殊字段处理

#### Networks 字段
组件对 `networks` 数组字段提供特殊处理，支持动态添加和删除网络配置：

```vue
<template>
  <schema-form 
    v-model="formData" 
    :schema="schema" 
    :flatten-containers="['float16']"
    ref="formRef"
  />
</template>

<script setup>
const schema = {
  type: 'object',
  properties: {
    matrix: {
      type: 'object',
      properties: {
        float16: {
          type: 'object',
          properties: {
            tflops: {
              type: 'number',
              title: 'TFLOPS'
            },
            calibration_coefficient: {
              type: 'number',
              title: '校准系数'
            }
          }
        }
      }
    },
    networks: {
      type: 'array',
      maxItems: 1,
      items: {
        type: 'object',
        properties: {
          bandWidth: {
            type: 'number',
            title: '带宽'
          }
        }
      }
    }
  }
}
</script>
```

显示效果：
- 第一个网络：`networks.0.bandWidth` → **节点内带宽.bandWidth**
- 第一个网络：`networks.0.latency` → **节点内带宽.latency**  
- 第二个网络：`networks.1.bandWidth` → **节点间带宽.bandWidth**
- 第二个网络：`networks.1.latency` → **节点间带宽.latency**

特点：
- 🎯 **默认一项**：networks 数组默认初始化为1项
- ➕ **动态添加**：用户可以添加第二个网络配置
- ➖ **动态删除**：可以删除多余的网络配置（保留至少1项）
- 🔒 **最大限制**：最多只能添加2项网络配置
- 🏷️ **智能标签**：根据索引自动显示"节点内带宽"或"节点间带宽"
- 📊 **数据完整**：保持完整的数组数据结构

## 展平容器显示

SchemaForm 支持展平指定的容器，直接显示其子字段而不显示容器本身。这对于简化复杂嵌套结构的表单很有用。

### 基本用法

```vue
<template>
  <schema-form 
    v-model="formData" 
    :schema="schema" 
    :flatten-containers="['float16']"
    ref="formRef"
  />
</template>

<script setup>
const schema = {
  type: 'object',
  properties: {
    matrix: {
      type: 'object',
      properties: {
        float16: {
          type: 'object',
          properties: {
            tflops: {
              type: 'number',
              title: 'TFLOPS'
            },
            calibration_coefficient: {
              type: 'number',
              title: '校准系数'
            }
          }
        }
      }
    },
    networks: {
      type: 'array',
      maxItems: 1,
      items: {
        type: 'object',
        properties: {
          bandWidth: {
            type: 'number',
            title: '带宽'
          }
        }
      }
    }
  }
}
</script>
```

在上面的例子中：
- 设置 `:flatten-containers="['float16']"` 会展平 `float16` 容器
- 字段会显示为：
  - `matrix.tflops` 而不是 `matrix.float16.tflops`
  - `matrix.calibration_coefficient` 而不是 `matrix.float16.calibration_coefficient`
  - `networks.0.bandWidth` （数组字段会自动处理索引）

### 多个容器展平

```vue
<template>
  <schema-form 
    v-model="formData" 
    :schema="schema" 
    :flatten-containers="['float16', 'system']"
    ref="formRef"
  />
</template>
```

### Props 扩展

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| flattenContainers | 需要展平的容器名称数组 | string[] | ['float16'] |

展平功能的特点：
- 🎯 **智能展平**：只展平指定的容器，保留其他嵌套结构
- 📍 **路径保持**：数据绑定路径保持完整，确保数据正确性
- 🔄 **数组支持**：自动处理对象数组的索引展示
- 🏷️ **标签优化**：显示简化的字段路径作为标签 