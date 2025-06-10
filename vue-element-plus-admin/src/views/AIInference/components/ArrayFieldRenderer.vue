<template>
  <div class="array-field-container">
    <!-- 数组项列表 -->
    <div class="array-items" v-if="arrayValue.length > 0">
      <el-card v-for="(item, index) in arrayValue" :key="index" class="array-item-card"
        :body-style="{ padding: '16px' }">
        <div class="array-item-content">
          <!-- 简单类型数组项 -->
          <template v-if="isSimpleType">
            <el-input v-if="itemSchema.type === 'string'" :model-value="item || ''"
              @update:model-value="(value) => updateArrayItem(index, value)"
              :placeholder="itemSchema.description || '请输入'" style="flex: 1" />
            <el-input-number v-else-if="itemSchema.type === 'integer' || itemSchema.type === 'number'"
              :model-value="typeof item === 'number' ? item : undefined"
              @update:model-value="(value) => updateArrayItem(index, value)" :controls="false"
              :step="itemSchema.type === 'integer' ? 1 : 0.1" :precision="itemSchema.type === 'integer' ? 0 : undefined"
              style="flex: 1; width: 100%" />
          </template>

          <!-- 对象类型数组项 -->
          <template v-else-if="itemSchema.type === 'object' && itemSchema.properties">
            <div class="object-fields">
              <div v-for="(propKey, propIndex) in Object.keys(itemSchema.properties)" :key="propKey"
                class="object-field">
                <label class="field-label">
                  {{ itemSchema.properties[propKey].title || propKey }}
                  <span v-if="itemSchema.required?.includes(propKey)" class="required-star">*</span>
                </label>

                <!-- 根据属性类型渲染不同输入组件 -->
                <el-input v-if="itemSchema.properties[propKey].type === 'string'"
                  :model-value="getObjectFieldValue(item, propKey)"
                  @update:model-value="(value) => updateObjectField(index, propKey, value)"
                  :placeholder="itemSchema.properties[propKey].description" size="small" />
                <el-input-number
                  v-else-if="itemSchema.properties[propKey].type === 'integer' || itemSchema.properties[propKey].type === 'number'"
                  :model-value="getObjectFieldValue(item, propKey)"
                  @update:model-value="(value) => updateObjectField(index, propKey, value)" :controls="false"
                  :step="itemSchema.properties[propKey].type === 'integer' ? 1 : 0.1"
                  :precision="itemSchema.properties[propKey].type === 'integer' ? 0 : undefined" size="small"
                  style="width: 100%" />
                <el-select v-else-if="itemSchema.properties[propKey].enum"
                  :model-value="getObjectFieldValue(item, propKey)"
                  @update:model-value="(value) => updateObjectField(index, propKey, value)" clearable size="small"
                  style="width: 100%">
                  <el-option v-for="option in itemSchema.properties[propKey].enum" :key="option" :label="option"
                    :value="option" />
                </el-select>
                <el-switch v-else-if="itemSchema.properties[propKey].type === 'boolean'"
                  :model-value="getObjectFieldValue(item, propKey) === true"
                  @update:model-value="(value) => updateObjectField(index, propKey, value)" size="small" />
                <!-- anyOf类型处理 -->
                <template v-else-if="itemSchema.properties[propKey].anyOf">
                  <el-input-number v-if="getNonNullType(itemSchema.properties[propKey].anyOf) === 'integer'"
                    :model-value="getObjectFieldValue(item, propKey)"
                    @update:model-value="(value) => updateObjectField(index, propKey, value)" :controls="false"
                    :step="1" :precision="0" size="small" style="width: 100%" />
                  <el-input-number v-else-if="getNonNullType(itemSchema.properties[propKey].anyOf) === 'number'"
                    :model-value="getObjectFieldValue(item, propKey)"
                    @update:model-value="(value) => updateObjectField(index, propKey, value)" :controls="false"
                    :step="0.1" size="small" style="width: 100%" />
                  <el-switch v-else-if="getNonNullType(itemSchema.properties[propKey].anyOf) === 'boolean'"
                    :model-value="getObjectFieldValue(item, propKey) === true"
                    @update:model-value="(value) => updateObjectField(index, propKey, value)" size="small" />
                  <el-input v-else :model-value="getObjectFieldValue(item, propKey)"
                    @update:model-value="(value) => updateObjectField(index, propKey, value)"
                    :placeholder="itemSchema.properties[propKey].description" size="small" />
                </template>
              </div>
            </div>
          </template>

          <!-- 删除按钮 -->
          <el-button type="danger" size="small" circle @click="removeArrayItem(index)" class="remove-btn">
            <Icon icon="vi-ep:delete" />
          </el-button>
        </div>
      </el-card>
    </div>

    <!-- 空状态提示 -->
    <div v-else class="empty-state">
      <span class="empty-text">暂无数据，点击下方按钮添加</span>
    </div>

    <!-- 添加按钮 -->
    <el-button type="primary" size="small" @click="addArrayItem" class="add-btn">
      <Icon icon="vi-ep:plus" />
      添加项
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  fieldKey: string
  fieldSchema: any
  value: any[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  update: [value: any[]]
}>()

// 计算属性
const arrayValue = computed(() => Array.isArray(props.value) ? props.value : [])
const itemSchema = computed(() => props.fieldSchema.items || {})
const isSimpleType = computed(() => {
  const type = itemSchema.value.type
  return ['string', 'number', 'integer', 'boolean'].includes(type)
})

// 获取对象字段值
const getObjectFieldValue = (item: any, key: string) => {
  return item && typeof item === 'object' ? item[key] : undefined
}

// 获取anyOf中的非null类型
const getNonNullType = (anyOfArray: any[]) => {
  const nonNullType = anyOfArray.find(item => item.type !== 'null')
  return nonNullType?.type
}

// 添加数组项
const addArrayItem = () => {
  const newItem = getDefaultValue(itemSchema.value)
  const newArray = [...arrayValue.value, newItem]
  emit('update', newArray)
}

// 删除数组项
const removeArrayItem = (index: number) => {
  const newArray = arrayValue.value.filter((_, i) => i !== index)
  emit('update', newArray)
}

// 更新数组项
const updateArrayItem = (index: number, value: any) => {
  const newArray = [...arrayValue.value]
  newArray[index] = value
  emit('update', newArray)
}

// 更新对象字段
const updateObjectField = (index: number, fieldKey: string, value: any) => {
  const newArray = [...arrayValue.value]
  if (!newArray[index] || typeof newArray[index] !== 'object') {
    newArray[index] = {}
  }
  newArray[index] = { ...newArray[index], [fieldKey]: value }
  emit('update', newArray)
}

// 获取默认值
const getDefaultValue = (schema: any) => {
  if (schema.default !== undefined) {
    return schema.default
  }

  // 处理anyOf类型
  if (schema.anyOf && Array.isArray(schema.anyOf)) {
    const nonNullType = schema.anyOf.find((item: any) => item.type !== 'null')
    if (nonNullType) {
      return getDefaultValue(nonNullType)
    }
    return null
  }

  switch (schema.type) {
    case 'string':
      return ''
    case 'number':
    case 'integer':
      return undefined
    case 'boolean':
      return false
    case 'object':
      if (schema.properties) {
        const obj: any = {}
        Object.keys(schema.properties).forEach(key => {
          obj[key] = getDefaultValue(schema.properties[key])
        })
        return obj
      }
      return {}
    case 'array':
      return []
    default:
      return null
  }
}
</script>

<style lang="less" scoped>
.array-field-container {
  width: 100%;
}

.array-items {
  margin-bottom: 12px;
}

.array-item-card {
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
}

.array-item-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.object-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  flex: 1;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.object-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
  line-height: 1.4;
}

.required-star {
  color: var(--el-color-danger);
  margin-left: 2px;
}

.remove-btn {
  flex-shrink: 0;
  margin-top: 4px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
  color: #999;
  background: #fafafa;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 14px;
}

.add-btn {
  width: 100%;
  border-style: dashed;
}
</style>