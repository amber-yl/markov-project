# RuntimeSchemaForm 组件

基于 JSON Schema 的动态表单渲染组件，支持复杂的表单验证和数据绑定。

## 功能特性

- 🚀 **自动表单生成**: 根据 JSON Schema 自动生成表单字段
- 🔧 **灵活的字段类型**: 支持文本、数字、选择器、开关等多种表单控件
- ✅ **强大的验证功能**: 支持必填、类型、范围、枚举等多种验证规则
- 🎨 **响应式布局**: 自适应不同屏幕尺寸的表单布局
- 🔍 **搜索功能**: 内置搜索功能，支持配置项搜索
- 🌐 **国际化支持**: 支持多语言表单标签和验证消息

## 组件结构

```
├── RuntimeSchemaForm.vue     # 主表单组件
├── FormFieldRenderer.vue    # 字段渲染器
├── ExampleUsage.vue         # 使用示例
└── README.md               # 文档说明
```

## 使用方法

### 基础用法

```vue
<template>
  <RuntimeSchemaForm 
    v-model="formData"
    @validate="onValidate"
    @search="onSearch"
  />
</template>

<script setup>
import { ref } from 'vue'
import RuntimeSchemaForm from './components/RuntimeSchemaForm.vue'

const formData = ref({})

const onValidate = (valid, fields) => {
  if (valid) {
    console.log('表单验证通过')
  } else {
    console.log('验证失败', fields)
  }
}

const onSearch = (keyword) => {
  console.log('搜索:', keyword)
}
</script>
```

### 高级用法

```vue
<template>
  <RuntimeSchemaForm 
    ref="formRef"
    v-model="formData"
    size="large"
    label-width="150px"
    @validate="onValidate"
    @search="onSearch"
  />
</template>

<script setup>
const formRef = ref()

// 手动验证表单
const validateForm = async () => {
  const valid = await formRef.value.validate()
  return valid
}

// 重置表单
const resetForm = () => {
  formRef.value.resetForm()
}
</script>
```

## Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| modelValue | Object | {} | 表单数据，支持 v-model |
| size | String | 'default' | 表单尺寸：'large' \| 'default' \| 'small' |
| labelWidth | String | '120px' | 标签宽度 |
| flattenContainers | Array | ['float16'] | 需要展平的容器名称 |

## Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| update:modelValue | (value: Object) | 表单数据更新事件 |
| validate | (valid: boolean, fields?: Object) | 表单验证结果事件 |
| search | (keyword: string) | 搜索事件 |

## Methods

通过 ref 调用组件方法：

| 方法名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| validate | - | Promise\<boolean\> | 验证整个表单 |
| resetForm | - | void | 重置表单到初始状态 |

## Schema 支持

### 支持的字段类型

- **string**: 文本输入框
- **number/integer**: 数字输入框
- **boolean**: 开关控件
- **enum**: 下拉选择器

### 支持的验证规则

- **required**: 必填验证
- **minimum/maximum**: 数字范围验证
- **minLength/maxLength**: 字符串长度验证
- **pattern**: 正则表达式验证
- **enum**: 枚举值验证

### Schema 示例

```javascript
const schema = {
  type: 'object',
  title: 'InferenceRuntimeConfigCreate',
  properties: {
    name: {
      description: '推理运行时名称',
      title: 'Runtime Selection',
      type: 'string',
      examples: ['example_configs']
    },
    type: {
      description: '运行时类型',
      enum: ['pd-split', 'pd-fusion'],
      title: 'Type',
      type: 'string'
    },
    runtime_details: {
      description: '运行时参数',
      title: 'RuntimeDetails',
      type: 'object',
      required: ['model_list', 'sequence_length_list'],
      properties: {
        // ... 更多属性定义
      }
    }
  },
  required: ['name', 'type', 'runtime_details']
}
```

## 样式定制

组件使用 Element Plus 的主题系统，可以通过 CSS 变量进行样式定制：

```css
:root {
  --el-color-primary: #409eff;
  --el-color-danger: #f56c6c;
  --el-border-radius-base: 4px;
}
```

## 注意事项

1. **Schema 验证**: 确保提供的 schema 符合 JSON Schema 规范
2. **性能优化**: 对于大型表单，建议使用虚拟滚动或分页
3. **浏览器兼容**: 支持现代浏览器，IE11+ 需要 polyfill
4. **内存管理**: 组件会自动清理事件监听器，避免内存泄漏

## 常见问题

### Q: 如何处理复杂的嵌套对象？
A: 组件支持 anyOf 类型，可以处理可选的嵌套对象结构。

### Q: 如何自定义字段渲染？
A: 可以通过修改 FormFieldRenderer 组件来扩展字段类型。

### Q: 如何实现条件显示/隐藏字段？
A: 可以在 getFieldComponentProps 方法中实现条件逻辑。

## 更新日志

### v1.0.0
- 初始版本发布
- 支持基础字段类型渲染
- 实现表单验证功能
- 添加搜索功能

## 贡献指南

欢迎提交 Issue 和 Pull Request 来改进这个组件。

## 许可证

MIT License 