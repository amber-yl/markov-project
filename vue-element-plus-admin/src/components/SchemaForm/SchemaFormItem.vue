<template>
  <el-form-item :label="fieldConfig.title" :prop="fieldPath">
    <!-- 输入框 -->
    <el-input v-if="fieldConfig.type === 'string' && !(fieldConfig?.enum?.length > 0)" :model-value="fieldValue"
      @update:model-value="handleUpdate"  />

    <!-- 整数输入框 -->
    <el-input-number v-else-if="fieldConfig.type === 'integer'" :model-value="fieldValue"
      @update:model-value="handleUpdate" controls-position="right" :controls="false" style="width: 100%"
      :precision="0" :step="1"  />

    <!-- 数字输入框 -->
    <el-input-number v-else-if="fieldConfig.type === 'number'" :model-value="fieldValue"
      @update:model-value="handleUpdate" controls-position="right" :controls="false" style="width: 100%"
       />

    <!-- 单选框组 -->
    <el-radio-group v-else-if="fieldConfig.type === 'radio'" :model-value="fieldValue"
      @update:model-value="handleUpdate">
      <el-radio v-for="option in fieldConfig.uiProps?.options" :key="option.value" :value="option.value">
        {{ option.label }}
      </el-radio>
    </el-radio-group>

    <!-- 选择框 -->
    <el-select v-else-if="fieldConfig.type === 'select'" :model-value="fieldValue" @update:model-value="handleUpdate"
      style="width: 100%" >
      <el-option v-for="option in fieldConfig.uiProps?.options" :key="option.value" :label="option.label"
        :value="option.value" />
    </el-select>

    <!-- 开关 -->
    <el-switch v-else-if="fieldConfig.type === 'switch'" :model-value="fieldValue" @update:model-value="handleUpdate"
       />

    <!-- 数组类型 -->
    <div v-else-if="fieldConfig.type === 'array'" class="array-field">
      <div v-for="(item, index) in fieldValue" :key="index" class="array-item">
        <div class="array-item-content">
          <schema-form-item v-for="(subProperty, subKey) in Object.keys(item)" :key="subKey"
            :field-path="`${fieldPath}.${index}.${subProperty}`" :schema="props.schema" :form-data="formData"
            @update:value="handleArrayItemUpdate" />
        </div>
        <el-button type="danger" size="small" @click="removeArrayItem(index)" class="remove-btn">
          删除
        </el-button>
      </div>
      <el-button type="primary" size="small" @click="addArrayItem" class="add-btn">
        添加
      </el-button>
    </div>
    <!-- 默认输入框 -->
    <el-input v-else :model-value="fieldValue" @update:model-value="handleUpdate"
      :placeholder="fieldConfig.description" />
  </el-form-item>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  fieldPath: string
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

  // 处理 anyOf 类型 (如可选的 cube_calibration_coefficient 和 vector_calibration_coefficient)
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
  if (currentProperty.enum) {
    currentProperty.type = currentProperty.enum.length <= 2 ? 'radio' : 'select'
    currentProperty.uiProps = {
      options: currentProperty.enum.map((value: any) => ({
        label: value,
        value: value
      }))
    }
  }
  if (currentProperty.type === 'boolean') {
    currentProperty.type = 'switch'
  }
  // 推断UI类型
  if (!currentProperty.type) {
    if (currentProperty.enum) {
      currentProperty.type = currentProperty.enum.length <= 3 ? 'radio' : 'select'
      currentProperty.uiProps = {
        options: currentProperty.enum.map((value: any) => ({
          label: value,
          value: value
        }))
      }
    } else if (currentProperty.type === 'number') {
      currentProperty.type = 'number'
    } else if (currentProperty.type === 'integer') {
      currentProperty.type = 'integer'
    } else if (currentProperty.type === 'boolean') {
      currentProperty.type = 'switch'
    } else if (currentProperty.type === 'array') {
      currentProperty.type = 'array'
    } else {
      currentProperty.type = 'input'
    }
  }
  console.log(currentProperty, "| currentProperty");
  return currentProperty
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
</style>