<template>
  <div class="schema-form">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="auto" :size="size">
      <div class="form-group">
        <el-row :gutter="schema.uiConfig?.form?.layout?.gutter || 20">
          <template v-for="field in flattenedFields" :key="field.path">
            <el-col :span="24" v-if="field.path === 'name'">
              <schema-form-item :field-path="field.path" :display-path="field.displayPath" :schema="schema"
                :form-data="formData" @update:value="handleFieldUpdate" />
            </el-col>
            <el-col :lg="24 / (schema.uiConfig?.form?.layout?.columns || 2)"
              v-else-if="!field.path.includes('networks')">
              <schema-form-item :field-path="field.path" :display-path="field.displayPath" :schema="schema"
                :form-data="formData" @update:value="handleFieldUpdate" />
            </el-col>
          </template>
        </el-row>
        <el-row :gutter="schema.uiConfig?.form?.layout?.gutter || 20">
          <el-col :span="24">
            <h3 class="group-title">网络配置</h3>
          </el-col>
          <template v-for="field in networksFields" :key="field.path">
            <el-col :lg="24">
              <div class="network-field-group">
                <schema-form-item :field-path="field.path" :display-path="field.displayPath" :schema="schema"
                  :form-data="formData" @update:value="handleFieldUpdate" />
                <el-button v-if="field.isLastFieldOfGroup && networksCount > 1" type="danger" size="small"
                  @click="removeNetworkGroup(field.groupIndex)" class="mb-4">
                  删除此网络配置
                </el-button>
              </div>
            </el-col>
          </template>
          <el-col :span="24">
            <el-button type="primary" @click="addNetworkGroup" :disabled="networksCount >= 2" class="add-network-btn">
              添加网络配置 ({{ networksCount }}/2)
            </el-button>
          </el-col>
        </el-row>
      </div>
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
  flattenContainers?: string[] // 需要展平的容器名称
}

const props = withDefaults(defineProps<Props>(), {
  labelWidth: '120px',
  size: 'default',
  flattenContainers: () => ['float16'] // 展平 float16 层级而不是 matrix 容器
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
        // 处理嵌套对象 - 包括被展平的容器
        initFromProperties(property.properties, fullKey)
      } else if (property.type === 'array') {
        // 处理数组 - 特殊处理 networks
        if (key === 'networks' && property.items?.type === 'object' && property.items?.properties) {
          // networks 数组默认初始化为1项
          const defaultItems: any[] = []
          defaultItems.push(createDefaultObject(property.items))
          setNestedValue(data, fullKey, defaultItems)
        } else {
          // 其他数组的处理逻辑
          const minItems = property.minItems || 0
          const maxItems = property.maxItems || 0
          const isRequired = isFieldRequiredInSchema(props.schema, key)

          // 为对象数组预初始化项
          if (property.items?.type === 'object' && property.items?.properties) {
            const itemsToCreate = Math.max(minItems, maxItems > 0 ? Math.min(maxItems, 1) : 1)
            const defaultItems: any[] = []

            for (let i = 0; i < itemsToCreate; i++) {
              defaultItems.push(createDefaultObject(property.items))
            }
            setNestedValue(data, fullKey, defaultItems)
          } else if (isRequired && minItems > 0) {
            // 为基本类型数组创建最小数量的默认项
            const defaultItems: any[] = []
            for (let i = 0; i < minItems; i++) {
              defaultItems.push(getDefaultValueByType(property.items?.type || 'string'))
            }
            setNestedValue(data, fullKey, defaultItems)
          } else {
            setNestedValue(data, fullKey, [])
          }
        }
      } else {
        // 处理基本类型和 anyOf 类型
        let defaultValue

        if (property.anyOf && Array.isArray(property.anyOf)) {
          // 处理 anyOf 类型（如可选的 calibration_coefficient 字段）
          defaultValue = property.default !== undefined ? property.default : null
        } else {
          defaultValue = property.default ?? getDefaultValueByType(property.type)
        }

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

// 创建默认对象
const createDefaultObject = (schema: any): any => {
  if (!schema || !schema.properties) return {}

  const obj: any = {}
  Object.keys(schema.properties).forEach(key => {
    const property = schema.properties[key]
    if (property.default !== undefined) {
      obj[key] = property.default
    } else if (property.anyOf && Array.isArray(property.anyOf)) {
      // 处理 anyOf 类型字段
      obj[key] = property.default !== undefined ? property.default : null
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

  // 检查根级别是否必填
  if (props.schema.required?.includes(pathParts[0])) {
    // 如果根级别字段必填，需要进一步检查是否是嵌套对象的必填字段
    if (pathParts.length === 1) {
      return true
    }
  }

  // 遍历路径检查嵌套对象的必填字段
  for (let i = 0; i < pathParts.length - 1; i++) {
    const part = pathParts[i]

    if (currentSchema.properties?.[part]) {
      currentSchema = currentSchema.properties[part]

      // 检查当前对象的required字段
      if (currentSchema.type === 'object' && currentSchema.required) {
        const nextPart = pathParts[i + 1]
        if (nextPart && currentSchema.required.includes(nextPart)) {
          return true
        }
      }
    }
  }

  return false
}

// 检查字段在schema中是否为必填
const isFieldRequiredInSchema = (schema: any, fieldKey: string): boolean => {
  return schema.required?.includes(fieldKey) || false
}

// 生成表单验证规则
const formRules = computed(() => {
  const rules: any = {}

  const generateRules = (properties: any, prefix = '') => {
    Object.keys(properties).forEach(key => {
      const fullKey = prefix ? `${prefix}.${key}` : key
      const property = properties[key]

      if (property.$ref) {
        // 处理引用
        const refPath = property.$ref.replace('#/$defs/', '')
        const refSchema = props.schema.$defs?.[refPath]
        if (refSchema && refSchema.properties) {
          generateRules(refSchema.properties, fullKey)
        }
      } else if (property.type === 'object' && property.properties) {
        generateRules(property.properties, fullKey)
      } else {
        const fieldRules: any[] = []

        // 处理 anyOf 类型字段
        let actualProperty = property
        if (property.anyOf && Array.isArray(property.anyOf)) {
          // 从 anyOf 中找到非 null 的类型定义
          const nonNullType = property.anyOf.find((item: any) => item.type !== null && item.type !== 'null')
          if (nonNullType) {
            actualProperty = { ...property, ...nonNullType }
          }
        }

        const fieldTitle = actualProperty.title || actualProperty.label || key

        // 必填验证
        if (isFieldRequired(fullKey)) {
          fieldRules.push({
            required: true,
            message: `请输入${fieldTitle}`,
            trigger: ['string', 'textarea'].includes(actualProperty.type) ? 'blur' : 'change'
          })
        }

        // 类型验证
        if (actualProperty.type === 'number' || actualProperty.type === 'integer') {
          // 数字类型验证
          if (actualProperty.type === 'integer') {
            fieldRules.push({
              validator: (rule: any, value: any, callback: any) => {
                if (value !== null && value !== undefined && value !== '' && !Number.isInteger(Number(value))) {
                  callback(new Error(`${fieldTitle}必须是整数`))
                } else {
                  callback()
                }
              },
              trigger: 'change'
            })
          } else {
            fieldRules.push({
              validator: (rule: any, value: any, callback: any) => {
                if (value !== null && value !== undefined && value !== '' && isNaN(Number(value))) {
                  callback(new Error(`${fieldTitle}必须是数字`))
                } else {
                  callback()
                }
              },
              trigger: 'change'
            })
          }

          // 最小值验证
          if (actualProperty.exclusiveMinimum !== undefined) {
            fieldRules.push({
              validator: (rule: any, value: any, callback: any) => {
                if (value !== null && value !== undefined && value !== '' && Number(value) <= actualProperty.exclusiveMinimum) {
                  callback(new Error(`${fieldTitle}必须大于${actualProperty.exclusiveMinimum}`))
                } else {
                  callback()
                }
              },
              trigger: 'change'
            })
          }

          if (actualProperty.minimum !== undefined) {
            fieldRules.push({
              validator: (rule: any, value: any, callback: any) => {
                if (value !== null && value !== undefined && value !== '' && Number(value) < actualProperty.minimum) {
                  callback(new Error(`${fieldTitle}必须大于等于${actualProperty.minimum}`))
                } else {
                  callback()
                }
              },
              trigger: 'change'
            })
          }

          // 最大值验证
          if (actualProperty.exclusiveMaximum !== undefined) {
            fieldRules.push({
              validator: (rule: any, value: any, callback: any) => {
                if (value !== null && value !== undefined && value !== '' && Number(value) >= actualProperty.exclusiveMaximum) {
                  callback(new Error(`${fieldTitle}必须小于${actualProperty.exclusiveMaximum}`))
                } else {
                  callback()
                }
              },
              trigger: 'change'
            })
          }

          if (actualProperty.maximum !== undefined) {
            fieldRules.push({
              validator: (rule: any, value: any, callback: any) => {
                if (value !== null && value !== undefined && value !== '' && Number(value) > actualProperty.maximum) {
                  callback(new Error(`${fieldTitle}必须小于等于${actualProperty.maximum}`))
                } else {
                  callback()
                }
              },
              trigger: 'change'
            })
          }
        }

        // 字符串长度验证
        if (actualProperty.type === 'string') {
          if (actualProperty.maxLength !== undefined) {
            fieldRules.push({
              max: actualProperty.maxLength,
              message: `${fieldTitle}长度不能超过${actualProperty.maxLength}个字符`,
              trigger: 'blur'
            })
          }

          if (actualProperty.minLength !== undefined) {
            fieldRules.push({
              min: actualProperty.minLength,
              message: `${fieldTitle}长度不能少于${actualProperty.minLength}个字符`,
              trigger: 'blur'
            })
          }

          // 正则表达式验证
          if (actualProperty.pattern) {
            fieldRules.push({
              pattern: new RegExp(actualProperty.pattern),
              message: `${fieldTitle}格式不正确`,
              trigger: 'blur'
            })
          }
        }

        // 数组验证
        if (actualProperty.type === 'array') {
          if (actualProperty.minItems !== undefined) {
            fieldRules.push({
              validator: (rule: any, value: any, callback: any) => {
                if (Array.isArray(value) && value.length < actualProperty.minItems) {
                  callback(new Error(`${fieldTitle}至少需要${actualProperty.minItems}项`))
                } else {
                  callback()
                }
              },
              trigger: 'change'
            })
          }

          if (actualProperty.maxItems !== undefined) {
            fieldRules.push({
              validator: (rule: any, value: any, callback: any) => {
                if (Array.isArray(value) && value.length > actualProperty.maxItems) {
                  callback(new Error(`${fieldTitle}最多只能有${actualProperty.maxItems}项`))
                } else {
                  callback()
                }
              },
              trigger: 'change'
            })
          }
        }

        // 枚举值验证
        if (actualProperty.enum && Array.isArray(actualProperty.enum)) {
          fieldRules.push({
            validator: (rule: any, value: any, callback: any) => {
              if (value !== null && value !== undefined && value !== '' && !actualProperty.enum.includes(value)) {
                callback(new Error(`${fieldTitle}的值必须是${actualProperty.enum.join('、')}中的一个`))
              } else {
                callback()
              }
            },
            trigger: 'change'
          })
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

// 展平字段列表
const flattenedFields = computed(() => {
  const fields: Array<{ path: string; displayPath: string }> = []

  const flattenProperties = (properties: any, prefix = '', displayPrefix = '') => {
    Object.keys(properties).forEach(key => {
      const fullPath = prefix ? `${prefix}.${key}` : key
      const property = properties[key]

      // 如果当前key在需要展平的容器列表中，则展平其子属性
      if (props.flattenContainers.includes(key) && property.type === 'object' && property.properties) {
        // 展平容器：fullPath 包含容器名，但 displayPrefix 保持不变（跳过容器名）
        flattenProperties(property.properties, fullPath, displayPrefix)
      } else if (property.type === 'array' && property.items?.type === 'object' && property.items?.properties) {
        // 特殊处理 networks 数组：不在展平时生成，由单独的 networksFields 处理
        if (key === 'networks') {
          // networks 字段由 networksFields 单独处理，这里跳过
          return
        } else {
          // 处理其他对象数组：为数组的每个预期项生成字段
          const maxItems = property.maxItems || (property.minItems ? Math.max(property.minItems, 1) : 1)
          for (let i = 0; i < maxItems; i++) {
            const arrayItemPath = `${fullPath}.${i}`
            const arrayItemDisplayPrefix = displayPrefix ? `${displayPrefix}.${key}.${i}` : `${key}.${i}`
            flattenProperties(property.items.properties, arrayItemPath, arrayItemDisplayPrefix)
          }
        }
      } else if (property.type === 'object' && property.properties) {
        // 对于其他对象类型，保持嵌套结构但生成字段路径
        const newDisplayPrefix = displayPrefix ? `${displayPrefix}.${key}` : key
        flattenProperties(property.properties, fullPath, newDisplayPrefix)
      } else {
        // 生成字段条目
        const displayPath = displayPrefix ? `${displayPrefix}.${key}` : key
        fields.push({
          path: fullPath,
          displayPath: displayPath
        })
      }
    })
  }

  if (props.schema.properties) {
    flattenProperties(props.schema.properties)
  }

  return fields
})

// 获取网络配置数量
const networksCount = computed(() => {
  const networksData = formData.value?.networks
  return Array.isArray(networksData) ? networksData.length : 0
})

// 获取网络配置字段
const networksFields = computed(() => {
  const fields: Array<{
    path: string;
    displayPath: string;
    groupIndex: number;
    isLastFieldOfGroup: boolean
  }> = []

  const networksData = formData.value?.networks
  if (!Array.isArray(networksData)) return fields

  const networksProperty = props.schema.properties?.networks
  if (!networksProperty?.items?.properties) return fields

  networksData.forEach((item, index) => {
    const subProperties = Object.keys(networksProperty.items.properties)
    subProperties.forEach((subKey, subIndex) => {
      // const fieldPath = `networks.${index}.${subKey}`
      const fieldPath = `networks.${index}.${subKey}`
      const displayPath = index ? `节点间带宽: ${subKey}` : `节点内带宽: ${subKey}`
      fields.push({
        path: fieldPath,
        displayPath: displayPath,
        groupIndex: index,
        isLastFieldOfGroup: subIndex === subProperties.length - 1
      })
    })
  })

  return fields
})

// 添加网络配置
const addNetworkGroup = () => {
  if (networksCount.value >= 2) return
  const networksProperty = props.schema.properties?.networks
  if (!networksProperty?.items) return
  const currentNetworks = formData.value?.networks || []
  const newNetworkItem = createDefaultObject(networksProperty.items)
  setNestedValue(formData.value, 'networks', [...currentNetworks, newNetworkItem])
  emit('update:modelValue', formData.value)
}

// 移除网络配置
const removeNetworkGroup = (index: number) => {
  if (networksCount.value <= 1) return
  const currentNetworks = formData.value?.networks || []
  const newNetworks = currentNetworks.filter((_: any, i: number) => i !== index)
  setNestedValue(formData.value, 'networks', newNetworks)
  emit('update:modelValue', formData.value)
}
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

  .network-field-group {
    position: relative;

    .remove-network-btn {
      position: absolute;
      top: 0;
      right: 0;
      z-index: 10;
    }
  }

  .add-network-btn {
    width: 100%;
    margin-top: 16px;
  }
}
</style>