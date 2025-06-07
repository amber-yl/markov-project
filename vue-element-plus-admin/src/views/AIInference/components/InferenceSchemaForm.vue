<template>
  <!-- MLA提示配置 -->
  <!-- <div class="custom-section">
    <el-alert v-if="formData.base_options?.attn_type === 'MLA'" title="MLA Extended Options are now visible!"
      type="success" :closable="false" show-icon />
    <el-alert v-if="formData.base_options?.structure_type === 'moe'" title="MOE Extended Options are now visible!"
      type="success" :closable="false" show-icon />
  </div> -->
  <header>
    <el-switch :model-value="showAdvancedConfig" @update:model-value="handleAdvancedConfigToggle"
      :active-text="t('高级设置')" />
  </header>
  <div class="mt-2">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="auto" :size="size">
      <!-- 渲染表单区块 -->
      <div v-for="(section, key) in visibleSections" :key="key" class="form-section">
        <section v-if="section.fields[0].field === 'name'">
          <el-divider content-position="left" class="section-title">
            <span>{{ section.title }}</span>
            <span v-if="section.required" class="required">
              <Icon :icon="'vi-ant-design:star-filled'" />
            </span>
          </el-divider>
          <el-row :gutter="20">
            <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
              <el-form-item v-for="(field, index) in section.fields.filter((_, i) => i % 2 === 0)" :key="field.field"
                :prop="field.field" :label-position="'left'">
                <template #label>
                  <div class="flex items-center">
                    <el-tooltip effect="dark" :content="field.description" placement="top">
                      <Icon :icon="'vi-ant-design:question-circle-filled'" style="margin-right: 8px; flex-shrink: 0" />
                    </el-tooltip>
                    <span class="label-text">{{ field.label }}</span>
                  </div>
                </template>
                <el-input v-model="formData.name" :placeholder="section.fields[0].description" clearable
                  @input="(value) => { handleFieldUpdate('name', value); handleSearch(value); }">
                  <template #prefix>
                    <Icon icon="vi-ep:search" />
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </section>
        <section v-else>
          <el-divider content-position="left" class="section-title">
            <span>{{ section.title }}</span>
            <span v-if="section.required" class="required">
              <Icon :icon="'vi-ant-design:star-filled'" />
            </span>
          </el-divider>
          <el-row :gutter="20">
            <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
              <el-form-item v-for="(field, index) in section.fields.filter((_, i) => i % 2 === 0)" :key="field.field"
                :prop="field.field" :label-position="'left'">
                <template #label>
                  <div class="flex items-center">
                    <el-tooltip effect="dark" :content="field.description" placement="top">
                      <Icon :icon="'vi-ant-design:question-circle-filled'" style="margin-right: 8px; flex-shrink: 0" />
                    </el-tooltip>
                    <span class="label-text">{{ field.label }}</span>
                  </div>
                </template>
                <FormFieldRenderer :field="{
                  ...field,
                  componentProps: {
                    placeholder: field.description,
                    disabled: formData.base_options?.structure_type !== 'moe'
                  }
                }" :value="getFieldValue(field.field)" @update="(value) => handleFieldUpdate(field.field, value)"
                  style="width: 300px" v-if="field.field === 'advance_options.hybrid_moe_blocks_num'" />
                <FormFieldRenderer :field="{
                  ...field,
                  componentProps: {
                    placeholder: field.description,
                    disabled: formData.base_options?.attn_type !== 'GQA'
                  }
                }" :value="getFieldValue(field.field)" @update="(value) => handleFieldUpdate(field.field, value)"
                  style="width: 300px" v-else-if="field.field === 'base_options.num_query_groups'" />
                <FormFieldRenderer :field="{ ...field, componentProps: { placeholder: field.description } }"
                  :value="getFieldValue(field.field)" @update="(value) => handleFieldUpdate(field.field, value)"
                  style="width: 300px" v-else />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
              <el-form-item v-for="(field, index) in section.fields.filter((_, i) => i % 2 === 1)" :key="field.field"
                :prop="field.field" :label-position="'left'">
                <template #label>
                  <div class="flex items-center">
                    <el-tooltip effect="dark" :content="field.description" placement="top">
                      <Icon :icon="'vi-ant-design:question-circle-filled'" style="margin-right: 8px; flex-shrink: 0" />
                    </el-tooltip>
                    <span class="label-text">{{ field.label }}</span>
                  </div>
                </template>
                <FormFieldRenderer :field="{
                  ...field,
                  componentProps: {
                    placeholder: field.description,
                    disabled: formData.base_options?.structure_type !== 'moe'
                  }
                }" :value="getFieldValue(field.field)" @update="(value) => handleFieldUpdate(field.field, value)"
                  style="width: 300px" v-if="field.field === 'advance_options.hybrid_moe_blocks_num'" />
                <FormFieldRenderer :field="{
                  ...field,
                  componentProps: {
                    placeholder: field.description,
                    disabled: formData.base_options?.attn_type !== 'GQA'
                  }
                }" :value="getFieldValue(field.field)" @update="(value) => handleFieldUpdate(field.field, value)"
                  style="width: 300px" v-else-if="field.field === 'base_options.num_query_groups'" />
                <FormFieldRenderer :field="{ ...field, componentProps: { placeholder: field.description } }"
                  :value="getFieldValue(field.field)" @update="(value) => handleFieldUpdate(field.field, value)"
                  style="width: 300px" v-else />
              </el-form-item>
            </el-col>
          </el-row>
        </section>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ElForm } from 'element-plus'
import FormFieldRenderer from './FormFieldRenderer.vue'

const { t } = useI18n()
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
  validate: [valid: boolean, fields?: any]
  search: [keyword: string]
}>()

const formData = ref<any>({})
const formRef = ref<InstanceType<typeof ElForm>>()
const showAdvancedConfig = ref(false)

// 根据类型获取默认值
const getDefaultValueByType = (type: string, property: any = {}) => {
  if (property.default !== undefined) {
    return property.default
  }

  // 处理 anyOf 类型
  if (property.anyOf && Array.isArray(property.anyOf)) {
    const nonNullType = property.anyOf.find((item: any) => item.type !== 'null')
    if (nonNullType) {
      return getDefaultValueByType(nonNullType.type, nonNullType)
    }
    return null
  }

  switch (type) {
    case 'string':
      return ''
    case 'number':
      return
    case 'integer':
      return
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

// 初始化表单数据
const initFormData = () => {
  const data: any = {}

  if (props.schema && props.schema.properties) {
    Object.keys(props.schema.properties).forEach((key) => {
      const property = props.schema.properties[key]
      data[key] = getDefaultValueByType(property.type, property)

      // 处理嵌套对象
      if (property.type === 'object' && property.properties) {
        data[key] = {}
        Object.keys(property.properties).forEach((subKey) => {
          const subProperty = property.properties[subKey]
          data[key][subKey] = getDefaultValueByType(subProperty.type, subProperty)
        })
      }

      // 处理 anyOf 中的对象类型
      if (property.anyOf) {
        const objectType = property.anyOf.find((item: any) => item.type === 'object')
        if (objectType && objectType.properties) {
          data[key] = {}
          Object.keys(objectType.properties).forEach((subKey) => {
            const subProperty = objectType.properties[subKey]
            data[key][subKey] = getDefaultValueByType(subProperty.type, subProperty)
          })
        }
      }
    })
  }

  return data
}

// 获取字段值
const getFieldValue = (fieldPath: string) => {
  const keys = fieldPath.split('.')
  let value = formData.value

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key]
    } else {
      return undefined
    }
  }

  return value
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

// 生成表单验证规则
const formRules = computed(() => {
  const rules: any = {}

  // 传统基于properties的schema验证规则生成
  const generateRules = (properties: any, prefix = '') => {
    if (!properties) return

    Object.keys(properties).forEach((key) => {
      const fullKey = prefix ? `${prefix}.${key}` : key
      const property = properties[key]

      if (property.type === 'object' && property.properties) {
        generateRules(property.properties, fullKey)
      } else if (property.anyOf) {
        // 处理anyOf中的对象类型
        const objectType = property.anyOf.find((item: any) => item.type === 'object')
        if (objectType && objectType.properties) {
          generateRules(objectType.properties, fullKey)
        }
      } else {
        const fieldRules: any[] = []

        // 处理 anyOf 类型字段
        let actualProperty = property
        if (property.anyOf && Array.isArray(property.anyOf)) {
          // 从 anyOf 中找到非 null 的类型定义
          const nonNullType = property.anyOf.find(
            (item: any) => item.type !== null && item.type !== 'null'
          )
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
                if (
                  value !== null &&
                  value !== undefined &&
                  value !== '' &&
                  !Number.isInteger(Number(value))
                ) {
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
                if (
                  value !== null &&
                  value !== undefined &&
                  value !== '' &&
                  Number(value) <= actualProperty.exclusiveMinimum
                ) {
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
                if (
                  value !== null &&
                  value !== undefined &&
                  value !== '' &&
                  Number(value) < actualProperty.minimum
                ) {
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
                if (
                  value !== null &&
                  value !== undefined &&
                  value !== '' &&
                  Number(value) >= actualProperty.exclusiveMaximum
                ) {
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
                if (
                  value !== null &&
                  value !== undefined &&
                  value !== '' &&
                  Number(value) > actualProperty.maximum
                ) {
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
              if (
                value !== null &&
                value !== undefined &&
                value !== '' &&
                !actualProperty.enum.includes(value)
              ) {
                callback(
                  new Error(`${fieldTitle}的值必须是${actualProperty.enum.join('、')}中的一个`)
                )
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

  if (props.schema?.properties) {
    generateRules(props.schema.properties)
  }
  return rules
})

// 检查字段是否必填
const isFieldRequired = (fieldPath: string): boolean => {
  const pathParts = fieldPath.split('.')
  let currentSchema = props.schema

  if (!currentSchema) return false

  // 检查根级别是否必填
  if (currentSchema.required?.includes(pathParts[0])) {
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

// 字段类型定义
interface FormField {
  field: string
  label: string
  component: 'Select' | 'InputNumber' | 'Switch' | 'Input'
  componentProps?: Record<string, any>
  options?: Array<{ label: string; value: string | number }>
  required?: boolean
  validator?: (value: any) => boolean | string
  description?: string
  min?: number
  max?: number
  default?: any
  dataType?: string // 原始数据类型，用于区分integer和number
}

// 将schema属性转换为表单字段
const convertPropertyToField = (key: string, property: any, prefix = ''): FormField => {
  const fullKey = prefix ? `${prefix}.${key}` : key

  // 处理 anyOf 类型
  let actualProperty = property
  let dataType = property.type

  if (property.anyOf && Array.isArray(property.anyOf)) {
    const nonNullType = property.anyOf.find((item: any) => item.type !== 'null')
    if (nonNullType) {
      actualProperty = { ...property, ...nonNullType }
      dataType = nonNullType.type // 使用非null类型作为dataType
    }
  }

  const field: FormField = {
    field: fullKey,
    label: actualProperty.title || key,
    component: 'Input',
    description: actualProperty.description || actualProperty.title || key,
    required: isFieldRequired(fullKey),
    dataType: dataType
  }

  // 根据类型和枚举值确定组件
  if (actualProperty.enum && Array.isArray(actualProperty.enum)) {
    field.component = 'Select'
    field.options = actualProperty.enum.map((value: any) => ({
      label: value,
      value: value
    }))
  } else if (actualProperty.type === 'boolean') {
    field.component = 'Switch'
  } else if (actualProperty.type === 'number' || actualProperty.type === 'integer') {
    field.component = 'InputNumber'
    if (actualProperty.exclusiveMinimum !== undefined)
      field.min = actualProperty.exclusiveMinimum + 1
    if (actualProperty.exclusiveMaximum !== undefined)
      field.max = actualProperty.exclusiveMaximum - 1
    if (actualProperty.minimum !== undefined) field.min = actualProperty.minimum
    if (actualProperty.maximum !== undefined) field.max = actualProperty.maximum
  } else {
    field.component = 'Input'
  }

  return field
}

// 根据schema生成表单区块
const visibleSections = computed(() => {
  const sections: Array<{
    title: string
    required: boolean
    fields: FormField[]
  }> = []

  let currentSchema = props.schema

  if (!currentSchema || !currentSchema.properties) return sections

  // 基础信息区块
  if (currentSchema.properties.name) {
    sections.push({
      title: '基础信息',
      required: true,
      fields: [convertPropertyToField('name', currentSchema.properties.name)]
    })
  }

  // 基础配置区块
  if (currentSchema.properties.base_options) {
    const baseOptions = currentSchema.properties.base_options
    const fields: FormField[] = []

    if (baseOptions.properties) {
      Object.keys(baseOptions.properties).forEach((key) => {
        fields.push(convertPropertyToField(key, baseOptions.properties[key], 'base_options'))
      })
    }

    sections.push({
      title: '基础配置',
      required: currentSchema.required?.includes('base_options') || false,
      fields
    })
  }

  // MLA扩展配置区块（当注意力类型为MLA时显示）
  if (
    currentSchema.properties.mla_extend_options &&
    formData.value.base_options?.attn_type === 'MLA'
  ) {
    const mlaOptions = currentSchema.properties.mla_extend_options
    const objectType = mlaOptions.anyOf?.find((item: any) => item.type === 'object')

    if (objectType && objectType.properties) {
      const fields: FormField[] = []
      Object.keys(objectType.properties).forEach((key) => {
        fields.push(convertPropertyToField(key, objectType.properties[key], 'mla_extend_options'))
      })

      sections.push({
        title: 'MLA扩展配置',
        required: false,
        fields
      })
    }
  }

  // MOE基础配置区块（当结构类型为moe时显示）
  if (
    currentSchema.properties.moe_base_options &&
    formData.value.base_options?.structure_type === 'moe'
  ) {
    const moeOptions = currentSchema.properties.moe_base_options
    const objectType = moeOptions.anyOf?.find((item: any) => item.type === 'object')

    if (objectType && objectType.properties) {
      const fields: FormField[] = []
      Object.keys(objectType.properties).forEach((key) => {
        fields.push(convertPropertyToField(key, objectType.properties[key], 'moe_base_options'))
      })

      sections.push({
        title: 'MOE基础配置',
        required: false,
        fields
      })
    }
  }

  // 高级配置区块
  if (currentSchema.properties.advance_options && showAdvancedConfig.value) {
    const advanceOptions = currentSchema.properties.advance_options
    const objectType = advanceOptions.anyOf?.find((item: any) => item.type === 'object')
    if (objectType && objectType.properties) {
      const fields: FormField[] = []
      Object.keys(objectType.properties).forEach((key) => {
        fields.push(convertPropertyToField(key, objectType.properties[key], 'advance_options'))
      })
      sections.push({
        title: '高级配置',
        required: false,
        fields
      })
    }
  }

  return sections
})

// 字段更新处理
const handleFieldUpdate = (field: string, value: any) => {
  // 更新表单数据
  setNestedValue(formData.value, field, value)

  // 触发外部更新
  emit('update:modelValue', formData.value)

  // 特殊字段变化处理
  if (field === 'base_options.attn_type') {
    onAttentionTypeChange(value)
  }

  if (field === 'base_options.structure_type') {
    onStructureTypeChange(value)
  }

  // 触发验证
  nextTick(() => {
    formRef.value?.validateField(field, () => { })
  })
}

// 注意力类型变化处理
const onAttentionTypeChange = (attnType: string) => {
  console.log('Attention type changed:', attnType)

  // 处理 num_query_groups 字段
  if (attnType !== 'GQA') {
    // 当注意力类型不是GQA时，清空num_query_groups
    if (formData.value.base_options?.num_query_groups !== null) {
      formData.value.base_options.num_query_groups = null
    }
  }

  // 当注意力类型改变时，重置相关配置
  if (attnType !== 'MLA') {
    // 清空MLA配置数据
    if (formData.value.mla_extend_options) {
      formData.value.mla_extend_options = null
    }
  } else {
    // 当选择MLA时，初始化MLA配置对象
    if (!formData.value.mla_extend_options) {
      const mlaOptions = props.schema?.properties?.mla_extend_options
      const objectType = mlaOptions?.anyOf?.find((item: any) => item.type === 'object')
      if (objectType && objectType.properties) {
        formData.value.mla_extend_options = {}
        Object.keys(objectType.properties).forEach((key) => {
          const property = objectType.properties[key]
          formData.value.mla_extend_options[key] = getDefaultValueByType(property.type, property)
        })
      }
    }
  }
}

// 结构类型变化处理
const onStructureTypeChange = (structureType: string) => {
  console.log('Structure type changed:', structureType)
  // 当结构类型改变时，重置相关配置
  if (structureType !== 'moe') {
    // 清空MOE配置数据
    if (formData.value.moe_base_options) {
      formData.value.moe_base_options = null
    }
  } else {
    // 当选择moe时，初始化MOE配置对象
    if (!formData.value.moe_base_options) {
      const moeOptions = props.schema?.properties?.moe_base_options
      const objectType = moeOptions?.anyOf?.find((item: any) => item.type === 'object')
      if (objectType && objectType.properties) {
        formData.value.moe_base_options = {}
        Object.keys(objectType.properties).forEach((key) => {
          const property = objectType.properties[key]
          formData.value.moe_base_options[key] = getDefaultValueByType(property.type, property)
        })
      }
    }
  }
}

// 高级配置切换
const handleAdvancedConfigToggle = (value: boolean) => {
  showAdvancedConfig.value = value
}

// 表单验证方法
const validate = async (): Promise<boolean> => {
  if (!formRef.value) return false
  try {
    await formRef.value.validate()
    emit('validate', true)
    return true
  } catch (error) {
    emit('validate', false, error)
    return false
  }
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
  formData.value = initFormData()
  emit('update:modelValue', formData.value)
}
const handleSearch = (keyword: string) => {
  emit('search', keyword)
}
// 暴露方法给父组件
defineExpose({
  validate,
  resetForm,
  formRef,
  handleAdvancedConfigToggle
})
</script>

<style lang="less" scoped>
.form-section {
  margin-bottom: 30px;

  :deep(.el-divider) {
    :deep(.el-divider__text .is-left) {
      left: 20px !important;
      transform: translateY(0) !important;
    }
  }

  /* 水平居中 */
  .section-title {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 20px;
    color: var(--el-text-color-primary);

    .required {
      color: var(--el-color-danger);
      margin-left: 4px;
    }
  }
}

.custom-section {
  margin: 20px 0;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;

  .el-alert {
    margin-bottom: 10px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .mla-values-display {
    margin-top: 15px;
    padding: 10px;
    background: #fff;
    border-radius: 6px;
    border: 1px solid #d1ecf1;

    :deep(.el-descriptions__title) {
      font-size: 14px;
      font-weight: 500;
      color: #155724;
      margin-bottom: 10px;
    }

    :deep(.el-descriptions__body) {
      .el-descriptions__table {
        .el-descriptions__cell {
          padding: 8px 12px;
        }
      }
    }
  }
}

.label-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 120px;
}
</style>
