<template>
  <el-form-item :label="displayPath" :prop="fieldPath">
    <!-- 枚举字段 - 单选框组 (选项少时) -->
    <el-radio-group v-if="fieldConfig.uiType === 'radio'" :model-value="fieldValue" @update:model-value="handleUpdate">
      <el-radio v-for="option in fieldConfig.options" :key="option.value" :value="option.value">
        {{ option.label }}
      </el-radio>
    </el-radio-group>

    <!-- 枚举字段 - 选择框 (选项多时) -->
    <el-select v-else-if="fieldConfig.uiType === 'select'" :model-value="fieldValue" @update:model-value="handleUpdate"
      style="width: 100%" clearable :placeholder="`请选择${getFieldLabel()}`">
      <el-option v-for="option in fieldConfig.options" :key="option.value" :label="option.label"
        :value="option.value" />
    </el-select>

    <!-- 开关 -->
    <el-switch v-else-if="fieldConfig.uiType === 'switch'" :model-value="fieldValue"
      @update:model-value="handleUpdate" />

    <!-- 整数输入框 -->
    <el-input-number v-else-if="fieldConfig.uiType === 'integer'" :model-value="fieldValue"
      @update:model-value="handleUpdate" controls-position="right" :controls="false" style="width: 100%" :precision="0"
      :step="1" :min="fieldConfig.minimum" :max="fieldConfig.maximum" />

    <!-- 数字输入框 -->
    <el-input-number v-else-if="fieldConfig.uiType === 'number'" :model-value="fieldValue"
      @update:model-value="handleUpdate" controls-position="right" :controls="false" style="width: 100%"
      :precision="fieldConfig.precision || 2" :step="fieldConfig.step || 0.1" :min="fieldConfig.minimum"
      :max="fieldConfig.maximum" />

    <!-- 多行文本 -->
    <el-input v-else-if="fieldConfig.uiType === 'textarea'" :model-value="fieldValue" @update:model-value="handleUpdate"
      type="textarea" :rows="fieldConfig.rows || 3" :placeholder="fieldConfig.description || `请输入${getFieldLabel()}`" />

    <!-- 数组类型 -->
    <div v-else-if="fieldConfig.uiType === 'array'" class="array-field">
      <div v-for="(item, index) in fieldValue" :key="index" class="array-item">
        <div class="array-item-content">
          <!-- 基本类型数组 -->
          <template v-if="!arrayItemSchema.properties">
            <el-input v-if="arrayItemSchema.type === 'string'" :model-value="item"
              @update:model-value="(val) => updateArrayItem(index, val)"
              :placeholder="`${getFieldLabel()} 第${index + 1}项`" />
            <el-input-number v-else-if="arrayItemSchema.type === 'number'" :model-value="item"
              @update:model-value="(val) => updateArrayItem(index, val)" style="width: 100%" />
            <el-input-number v-else-if="arrayItemSchema.type === 'integer'" :model-value="item"
              @update:model-value="(val) => updateArrayItem(index, val)" style="width: 100%" :precision="0" />
          </template>
          <!-- 对象类型数组 -->
          <template v-else>
            <el-row :gutter="12">
              <el-col v-for="(subProperty, subKey) in arrayItemSchema.properties" :key="subKey"
                :span="24 / Math.min(Object.keys(arrayItemSchema.properties).length, 3)">
                <schema-form-item :field-path="`${fieldPath}.${index}.${subKey}`" :schema="props.schema"
                  :form-data="formData" @update:value="handleArrayItemUpdate" />
              </el-col>
            </el-row>
          </template>
        </div>
        <el-button type="danger" size="small" @click="removeArrayItem(index)" class="remove-btn" :icon="'Delete'">
          删除
        </el-button>
      </div>
      <el-button type="primary" size="small" @click="addArrayItem" class="add-btn" :icon="'Plus'">
        添加{{ getFieldLabel() }}
      </el-button>
    </div>

    <!-- 对象类型 -->
    <div v-else-if="fieldConfig.uiType === 'object'" class="object-field">
      <el-card shadow="never" class="object-card">
        <el-row :gutter="12">
          <el-col v-for="(subProperty, subKey) in fieldConfig.properties" :key="subKey"
            :span="24 / Math.min(Object.keys(fieldConfig.properties).length, 2)">
            <schema-form-item :field-path="`${fieldPath}.${subKey}`" :schema="props.schema" :form-data="formData"
              @update:value="handleUpdate" />
          </el-col>
        </el-row>
      </el-card>
    </div>

    <!-- 默认字符串输入框 -->
    <el-input v-else :model-value="fieldValue" @update:model-value="handleUpdate"
      :placeholder="fieldConfig.description || `请输入${getFieldLabel()}`" :maxlength="fieldConfig.maxLength"
      :show-word-limit="!!fieldConfig.maxLength" />
  </el-form-item>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  fieldPath: string
  displayPath?: string
  schema: any
  formData: any
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:value': [fieldPath: string, value: any]
}>()

// 获取字段配置
const fieldConfig = computed(() => {
  const pathParts = props.fieldPath.split('.')
  let currentSchema = props.schema
  let currentProperty: any = null

  // 遍历路径找到对应的字段配置
  for (let i = 0; i < pathParts.length; i++) {
    const part = pathParts[i]

    if (currentSchema.properties?.[part]) {
      currentProperty = currentSchema.properties[part]
      currentSchema = currentProperty
    } else if (!isNaN(Number(part))) {
      // 如果是数组索引，继续使用当前的array items schema
      if (currentProperty?.type === 'array' && currentProperty.items) {
        currentSchema = currentProperty.items
        // 跳过数组索引，但保持currentProperty指向数组本身
        continue
      }
    } else {
      // 如果找不到属性且不是数组索引，尝试在items中查找
      if (currentSchema.properties?.[part]) {
        currentProperty = currentSchema.properties[part]
        currentSchema = currentProperty
      } else {
        break
      }
    }
  }

  // 确保currentProperty不为null
  if (!currentProperty) {
    currentProperty = {}
  }

  // 处理 anyOf 类型 (如可选的 calibration_coefficient 字段)
  if (currentProperty.anyOf && Array.isArray(currentProperty.anyOf)) {
    // 从 anyOf 中找到非 null 的类型定义
    const nonNullType = currentProperty.anyOf.find((item: any) => item.type !== null && item.type !== 'null')
    if (nonNullType) {
      // 将非 null 的类型信息合并到当前属性
      currentProperty = {
        ...currentProperty,
        type: nonNullType.type,
        exclusiveMinimum: nonNullType.exclusiveMinimum || currentProperty.exclusiveMinimum,
        maximum: nonNullType.maximum || currentProperty.maximum,
        minimum: nonNullType.minimum || currentProperty.minimum
      }
    }
  }

  // 根据schema的类型和属性推断UI类型
  let uiType = 'string'
  let options: any[] = []

  if (currentProperty.enum && Array.isArray(currentProperty.enum)) {
    // 枚举类型
    uiType = currentProperty.enum.length <= 3 ? 'radio' : 'select'
    options = currentProperty.enum.map((value: any) => ({
      label: value,
      value: value
    }))
  } else if (currentProperty.type === 'boolean') {
    uiType = 'switch'
  } else if (currentProperty.type === 'integer') {
    uiType = 'integer'
  } else if (currentProperty.type === 'number') {
    uiType = 'number'
  } else if (currentProperty.type === 'array') {
    uiType = 'array'
  } else if (currentProperty.type === 'object') {
    uiType = 'object'
  } else if (currentProperty.type === 'string') {
    // 根据长度限制或其他属性判断是否使用textarea
    if (currentProperty.maxLength && currentProperty.maxLength > 100) {
      uiType = 'textarea'
    } else {
      uiType = 'string'
    }
  }

  return {
    ...currentProperty,
    uiType,
    options,
    title: currentProperty.title || currentProperty.label,
    label: currentProperty.label || currentProperty.title
  }
})

// 获取数组项的schema
const arrayItemSchema = computed(() => {
  if (fieldConfig.value.type === 'array' && fieldConfig.value.items) {
    return fieldConfig.value.items
  }
  return {}
})

// 获取字段值
const fieldValue = computed(() => {
  return getNestedValue(props.formData, props.fieldPath)
})

// 获取嵌套值
const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

// 处理值更新
const handleUpdate = (value: any) => {
  emit('update:value', props.fieldPath, value)
}

// 处理数组项更新
const handleArrayItemUpdate = (itemFieldPath: string, value: any) => {
  emit('update:value', itemFieldPath, value)
}

// 添加数组项
const addArrayItem = () => {
  const currentArray = fieldValue.value || []
  const newItem = createDefaultItem(arrayItemSchema.value)
  emit('update:value', props.fieldPath, [...currentArray, newItem])
}

// 删除数组项
const removeArrayItem = (index: number) => {
  const currentArray = fieldValue.value || []
  const newArray = currentArray.filter((_: any, i: number) => i !== index)
  emit('update:value', props.fieldPath, newArray)
}

// 创建默认项
const createDefaultItem = (schema: any) => {
  const item: any = {}

  if (schema.properties) {
    Object.keys(schema.properties).forEach(key => {
      const property = schema.properties[key]
      if (property.default !== undefined) {
        item[key] = property.default
      } else {
        // 处理 anyOf 类型的字段
        if (property.anyOf && Array.isArray(property.anyOf)) {
          const nonNullType = property.anyOf.find((item: any) => item.type !== null && item.type !== 'null')
          if (nonNullType) {
            item[key] = getDefaultValueByType(nonNullType.type, property.default)
          } else {
            item[key] = property.default !== undefined ? property.default : null
          }
        } else {
          item[key] = getDefaultValueByType(property.type, property.default)
        }
      }
    })
  }

  return item
}

// 根据类型获取默认值
const getDefaultValueByType = (type: string, defaultValue?: any) => {
  if (defaultValue !== undefined) return defaultValue

  switch (type) {
    case 'string':
      return ''
    case 'number':
      return 0
    case 'integer':
      return 0
    case 'boolean':
      return false
    case 'array':
      return []
    case 'object':
      return {}
    default:
      return null
  }
}

// 处理数组项更新
const updateArrayItem = (index: number, value: any) => {
  const currentArray = fieldValue.value || []
  const newArray = [...currentArray]
  newArray[index] = value
  emit('update:value', props.fieldPath, newArray)
}

// 显示标签
const displayLabel = computed(() => {
  if (props.displayPath) {
    return fieldConfig.value.title || fieldConfig.value.label || props.displayPath
  }
  return fieldConfig.value.title || fieldConfig.value.label || props.fieldPath
})

// 获取字段标签
const getFieldLabel = () => {
  // 特殊处理 networks 字段
  if (props.fieldPath.startsWith('networks.')) {
    const match = props.fieldPath.match(/networks\.(\d+)\.(.+)/)
    if (match) {
      const index = parseInt(match[1])
      const subField = match[2]
      const networkLabel = index === 0 ? '节点内带宽' : index === 1 ? '节点间带宽' : `网络${index + 1}`
      return `${networkLabel}.${subField}`
    }
  }

  // 处理其他字段，移除 float16.
  let label = ''
  if (props.displayPath) {
    label = fieldConfig.value.title || fieldConfig.value.label || props.displayPath
  } else {
    label = fieldConfig.value.title || fieldConfig.value.label || props.fieldPath
  }

  // 移除 float16. 部分
  return label.replace('float16.', '')
}

// 获取显示标签
const getDisplayLabel = () => {
  // 特殊处理 networks 字段
  if (props.fieldPath.startsWith('networks.')) {
    const match = props.fieldPath.match(/networks\.(\d+)\.(.+)/)
    if (match) {
      const index = parseInt(match[1])
      const subField = match[2]
      const networkLabel = index === 0 ? '节点内带宽' : index === 1 ? '节点间带宽' : `网络${index + 1}`
      return `${networkLabel}.${subField}`
    }
  }

  // 处理其他字段
  let label = ''
  if (props.displayPath) {
    label = fieldConfig.value.title || fieldConfig.value.label || props.displayPath
  } else {
    label = fieldConfig.value.title || fieldConfig.value.label || props.fieldPath
  }

  // 移除 float16. 部分
  return label.replace('float16.', '')
}
</script>

<style lang="less" scoped>
.array-field {
  .array-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 12px;
    padding: 12px;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    background-color: #fafafa;

    .array-item-content {
      flex: 1;
      margin-right: 12px;

      .el-form-item {
        :deep(.el-form-item__label-wrap) {
          margin-left: 0 !important;
        }
      }
    }

    .remove-btn {
      flex-shrink: 0;
    }
  }

  .add-btn {
    width: 100%;
  }
}

.object-field {
  .object-card {
    border: 1px solid #e4e7ed;

    :deep(.el-card__body) {
      padding: 16px;
    }
  }
}
</style>
