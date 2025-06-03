<template>
  <div class="schema-form">
    <el-form ref="formRef" :model="formData" :rules="formRules" :label-width="labelWidth" :size="size">
      <template v-if="schema.uiConfig?.form?.groups">
        <!-- 分组表单 -->
        <div v-for="group in schema.uiConfig.form.groups" :key="group.title" class="form-group">
          <h3 class="group-title">{{ group.title }}</h3>
          <el-row :gutter="schema.uiConfig.form.layout?.gutter || 20">
            <template v-for="fieldPath in group.fields" :key="fieldPath">
              <el-col :span="24 / (schema.uiConfig.form.layout?.columns || 2)">
                <schema-form-item :field-path="fieldPath" :schema="schema" :form-data="formData"
                  @update:value="handleFieldUpdate" />
              </el-col>
            </template>
          </el-row>
        </div>
      </template>
      <template v-else>
        <!-- 默认表单 -->
        <el-row :gutter="20">
          <template v-for="(property, key) in schema.properties" :key="key">
            <el-col :span="12">
              <schema-form-item :field-path="String(key)" :schema="schema" :form-data="formData"
                @update:value="handleFieldUpdate" />
            </el-col>
          </template>
        </el-row>
      </template>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElForm } from 'element-plus'
import SchemaFormItem from './SchemaFormItem.vue'

interface Props {
  schema: any
  modelValue: any
  labelWidth?: string
  size?: 'default' | 'small' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  labelWidth: '120px',
  size: 'default'
})

const emit = defineEmits<{
  'update:modelValue': [value: any]
  'validate': [valid: boolean, fields?: any]
}>()

const formRef = ref<InstanceType<typeof ElForm>>()
const formData = ref<any>({})

// 初始化表单数据
const initFormData = () => {
  const data: any = {}

  const initFromProperties = (properties: any, prefix = '') => {
    Object.keys(properties).forEach(key => {
      const fullKey = prefix ? `${prefix}.${key}` : key
      const property = properties[key]

      if (property.$ref) {
        // 处理引用
        const refPath = property.$ref.replace('#/$defs/', '')
        const refSchema = props.schema.$defs?.[refPath]
        if (refSchema && refSchema.properties) {
          initFromProperties(refSchema.properties, fullKey)
        }
      } else if (property.type === 'object' && property.properties) {
        // 处理嵌套对象
        initFromProperties(property.properties, fullKey)
      } else if (property.type === 'array') {
        // 处理数组 - 如果是必填且有minItems，初始化相应数量的默认项
        const minItems = property.minItems || 0
        const isRequired = props.schema.required?.includes(key)

        if (isRequired && minItems > 0 && property.items) {
          // 为必填数组字段创建最小数量的默认项
          const defaultItems: any[] = []
          for (let i = 0; i < minItems; i++) {
            if (property.items.$ref) {
              const refPath = property.items.$ref.replace('#/$defs/', '')
              const refSchema = props.schema.$defs?.[refPath]
              if (refSchema) {
                defaultItems.push(createDefaultObject(refSchema))
              }
            } else if (property.items.properties) {
              defaultItems.push(createDefaultObject(property.items))
            } else {
              defaultItems.push(getDefaultValueByType(property.items.type || 'string'))
            }
          }
          setNestedValue(data, fullKey, defaultItems)
        } else {
          setNestedValue(data, fullKey, [])
        }
      } else {
        // 处理基本类型
        const defaultValue = property.default ?? getDefaultValueByType(property.type)
        setNestedValue(data, fullKey, defaultValue)
      }
    })
  }

  initFromProperties(props.schema.properties)
  return data
}

// 根据类型获取默认值
const getDefaultValueByType = (type: string) => {
  switch (type) {
    case 'string':
      return ''
    case 'number':
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

// 创建默认对象
const createDefaultObject = (schema: any): any => {
  if (!schema || !schema.properties) return {}

  const obj: any = {}
  Object.keys(schema.properties).forEach(key => {
    const property = schema.properties[key]
    if (property.default !== undefined) {
      obj[key] = property.default
    } else {
      obj[key] = getDefaultValueByType(property.type)
    }
  })
  return obj
}

// 设置嵌套值
const setNestedValue = (obj: any, path: string, value: any) => {
  const keys = path.split('.')
  let current = obj

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {}
    }
    current = current[key]
  }

  current[keys[keys.length - 1]] = value
}

// 获取嵌套值
const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

// 检查字段是否必填
const isFieldRequired = (fieldPath: string): boolean => {
  const pathParts = fieldPath.split('.')
  let currentSchema = props.schema
  let currentRequired = props.schema.required || []

  // 检查根级别是否必填
  if (currentRequired.includes(pathParts[0])) {
    return true
  }

  // 检查嵌套对象的必填字段
  for (let i = 0; i < pathParts.length; i++) {
    const part = pathParts[i]

    if (currentSchema.properties?.[part]) {
      currentSchema = currentSchema.properties[part]

      // 如果是对象类型，检查其required字段
      if (currentSchema.type === 'object' && currentSchema.required) {
        const nextPart = pathParts[i + 1]
        if (nextPart && currentSchema.required.includes(nextPart)) {
          return true
        }
      }
    } else if (currentSchema.$ref) {
      const refPath = currentSchema.$ref.replace('#/$defs/', '')
      currentSchema = props.schema.$defs?.[refPath] || {}

      if (currentSchema.required && currentSchema.required.includes(part)) {
        return true
      }
    }
  }

  return false
}

// 生成表单验证规则
const formRules = computed(() => {
  const rules: any = {}

  const generateRules = (properties: any, prefix = '') => {
    Object.keys(properties).forEach(key => {
      const fullKey = prefix ? `${prefix}.${key}` : key
      const property = properties[key]

      if (property.$ref) {
        const refPath = property.$ref.replace('#/$defs/', '')
        const refSchema = props.schema.$defs?.[refPath]
        if (refSchema && refSchema.properties) {
          generateRules(refSchema.properties, fullKey)
        }
      } else if (property.type === 'object' && property.properties) {
        generateRules(property.properties, fullKey)
      } else {
        const fieldRules: any[] = []

        // 必填验证 - 使用更准确的检查逻辑
        if (isFieldRequired(fullKey)) {
          fieldRules.push({
            required: true,
            message: `请输入${property.title || key}`,
            trigger: property.type === 'string' ? 'blur' : 'change'
          })
        }

        // 类型验证
        if (property.type === 'number') {
          fieldRules.push({
            type: 'number',
            message: `${property.title || key}必须是数字`,
            trigger: 'change'
          })

          if (property.exclusiveMinimum !== undefined) {
            fieldRules.push({
              validator: (rule: any, value: any, callback: any) => {
                if (value !== null && value !== undefined && value <= property.exclusiveMinimum) {
                  callback(new Error(`${property.title || key}必须大于${property.exclusiveMinimum}`))
                } else {
                  callback()
                }
              },
              trigger: 'change'
            })
          }

          if (property.maximum !== undefined) {
            fieldRules.push({
              validator: (rule: any, value: any, callback: any) => {
                if (value !== null && value !== undefined && value > property.maximum) {
                  callback(new Error(`${property.title || key}必须小于等于${property.maximum}`))
                } else {
                  callback()
                }
              },
              trigger: 'change'
            })
          }
        }

        if (fieldRules.length > 0) {
          rules[fullKey] = fieldRules
        }
      }
    })
  }

  generateRules(props.schema.properties)
  return rules
})

// 处理字段更新
const handleFieldUpdate = (fieldPath: string, value: any) => {
  setNestedValue(formData.value, fieldPath, value)
  emit('update:modelValue', formData.value)
}

// 验证表单
const validate = async () => {
  if (!formRef.value) return false

  try {
    const valid = await formRef.value.validate()
    emit('validate', valid)
    return valid
  } catch (error) {
    emit('validate', false, error)
    return false
  }
}

// 重置表单
const resetFields = () => {
  formRef.value?.resetFields()
  formData.value = initFormData()
  emit('update:modelValue', formData.value)
}

// 清空验证
const clearValidate = () => {
  formRef.value?.clearValidate()
}

// 监听外部数据变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && JSON.stringify(newValue) !== JSON.stringify(formData.value)) {
      formData.value = { ...newValue }
    }
  },
  { deep: true, immediate: true }
)

// 监听schema变化，重新初始化表单
watch(
  () => props.schema,
  () => {
    if (!props.modelValue || Object.keys(props.modelValue).length === 0) {
      formData.value = initFormData()
      emit('update:modelValue', formData.value)
    }
  },
  { immediate: true }
)

// 暴露公共方法
defineExpose({
  validate,
  resetFields,
  clearValidate,
  formRef
})
</script>

<style lang="less" scoped>
.schema-form {
  .form-group {
    margin-bottom: 24px;

    .group-title {
      margin: 0 0 16px 0;
      padding-bottom: 8px;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      border-bottom: 1px solid #e4e7ed;
    }
  }
}
</style>