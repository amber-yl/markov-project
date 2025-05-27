<template>
  <el-form ref="formRef" :model="formData" label-width="140px" label-position="left">
    <!-- 渲染表单区块 -->
    <div v-for="section in visibleSections" :key="section.key" class="form-section">
      <h3 class="section-title">
        {{ section.title }}
        <span v-if="section.required" class="required">*</span>
      </h3>

      <!-- 单列布局 -->
      <template v-if="section.fields">
        <el-form-item v-for="field in section.fields" :key="field.field" :label="field.label" :prop="field.field"
          :rules="getFieldRules(field)">
          <FormFieldRenderer :field="field" :value="formData[field.field]"
            @update="(value) => handleFieldUpdate(field.field, value)" />
        </el-form-item>
      </template>

      <!-- 双列布局 -->
      <template v-else>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item v-for="field in section.leftFields" :key="field.field" :label="field.label"
              :prop="field.field" :rules="getFieldRules(field)">
              <FormFieldRenderer :field="field" :value="formData[field.field]"
                @update="(value) => handleFieldUpdate(field.field, value)" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-for="field in section.rightFields" :key="field.field" :label="field.label"
              :prop="field.field" :rules="getFieldRules(field)">
              <FormFieldRenderer :field="field" :value="formData[field.field]"
                @update="(value) => handleFieldUpdate(field.field, value)" />
            </el-form-item>
          </el-col>
        </el-row>
      </template>
    </div>

    <!-- 高级配置切换 -->
    <div v-if="showToggle" class="toggle-section">
      <el-switch :model-value="showAdvancedConfig" @update:model-value="handleAdvancedConfigToggle"
        active-text="Advanced Config" />
    </div>
  </el-form>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

// 字段类型定义
interface FormField {
  field: string
  label: string
  component: 'Select' | 'InputNumber' | 'Switch'
  componentProps?: Record<string, any>
  options?: Array<{ label: string; value: string | number }>
  required?: boolean
  validator?: (value: any) => boolean | string
}

// 区块类型定义
interface FormSection {
  key: string
  title: string
  required?: boolean
  visible?: () => boolean
  fields?: FormField[]
  leftFields?: FormField[]
  rightFields?: FormField[]
}

// Props 定义
interface Props {
  modelValue: Record<string, any>
  sections: FormSection[]
  showAdvancedConfig?: boolean
  showToggle?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showAdvancedConfig: false,
  showToggle: true
})

// 事件定义
const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>]
  'update:showAdvancedConfig': [value: boolean]
  'field-change': [field: string, value: any, oldValue: any]
  'section-toggle': [sectionKey: string, visible: boolean]
  'validation-change': [field: string, isValid: boolean, message?: string]
}>()

// 响应式数据
const formRef = ref<FormInstance>()
const formData = reactive<Record<string, any>>({})

// 初始化表单数据
const initializeFormData = () => {
  // 清空现有数据
  Object.keys(formData).forEach(key => delete formData[key])

  // 从 props.modelValue 复制数据
  Object.assign(formData, props.modelValue)

  // 确保所有字段都有默认值
  getAllFields().forEach(field => {
    if (!(field.field in formData)) {
      formData[field.field] = getDefaultValue(field)
    }
  })
}

// 获取所有字段
const getAllFields = (): FormField[] => {
  const allFields: FormField[] = []

  props.sections.forEach(section => {
    if (section.fields) {
      allFields.push(...section.fields)
    }
    if (section.leftFields) {
      allFields.push(...section.leftFields)
    }
    if (section.rightFields) {
      allFields.push(...section.rightFields)
    }
  })

  return allFields
}

// 获取字段默认值
const getDefaultValue = (field: FormField) => {
  switch (field.component) {
    case 'Switch':
      return false
    case 'InputNumber':
      return 0
    case 'Select':
    default:
      return ''
  }
}

// 可见区块
const visibleSections = computed(() => {
  return props.sections.filter(section => {
    return section.visible ? section.visible() : true
  })
})

// 字段验证规则
const getFieldRules = (field: FormField): FormRules[string] => {
  const rules: any[] = []

  if (field.required) {
    rules.push({
      required: true,
      message: `${field.label} is required`,
      trigger: ['blur', 'change']
    })
  }

  if (field.validator) {
    rules.push({
      validator: (rule: any, value: any, callback: any) => {
        const result = field.validator!(value)
        if (result === true) {
          callback()
        } else {
          callback(new Error(typeof result === 'string' ? result : 'Validation failed'))
        }
      },
      trigger: ['blur', 'change']
    })
  }

  if (field.component === 'InputNumber') {
    rules.push({
      type: 'number',
      message: `${field.label} must be a number`,
      trigger: ['blur', 'change']
    })
  }

  return rules
}

// 字段更新处理
const handleFieldUpdate = (field: string, value: any) => {
  const oldValue = formData[field]

  // 更新表单数据
  formData[field] = value

  // 创建新的 modelValue
  const newModelValue = { ...formData }

  // 发送事件
  emit('update:modelValue', newModelValue)
  emit('field-change', field, value, oldValue)

  // 验证字段
  nextTick(() => {
    validateField(field)
  })
}

// 高级配置切换
const handleAdvancedConfigToggle = (value: boolean) => {
  emit('update:showAdvancedConfig', value)
  emit('section-toggle', 'advanced', value)
}

// 字段验证
const validateField = async (field: string) => {
  if (!formRef.value) return

  try {
    await formRef.value.validateField(field)
    emit('validation-change', field, true)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Validation failed'
    emit('validation-change', field, false, message)
  }
}

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  () => {
    initializeFormData()
  },
  { immediate: true, deep: true }
)

// 监听 sections 变化
watch(
  () => props.sections,
  (newSections) => {
    initializeFormData()

    newSections.forEach(section => {
      const isVisible = section.visible ? section.visible() : true
      emit('section-toggle', section.key, isVisible)
    })
  },
  { deep: true }
)

// 暴露方法
defineExpose({
  validate: () => formRef.value?.validate(),
  validateField: (field: string) => formRef.value?.validateField(field),
  clearValidation: () => formRef.value?.clearValidate(),
  resetFields: () => formRef.value?.resetFields(),
  scrollToField: (field: string) => formRef.value?.scrollToField(field)
})
</script>

<!-- 字段渲染器组件 -->
<script lang="ts">
import { defineComponent, h } from 'vue'
import { ElSelect, ElInputNumber, ElSwitch, ElOption } from 'element-plus'

// 字段类型定义（重复定义以避免类型错误）
interface FormField {
  field: string
  label: string
  component: 'Select' | 'InputNumber' | 'Switch'
  componentProps?: Record<string, any>
  options?: Array<{ label: string; value: string | number }>
  required?: boolean
  validator?: (value: any) => boolean | string
}

const FormFieldRenderer = defineComponent({
  name: 'FormFieldRenderer',
  props: {
    field: {
      type: Object as () => FormField,
      required: true
    },
    value: {
      type: [String, Number, Boolean],
      default: ''
    }
  },
  emits: ['update'],
  setup(props, { emit }) {
    const handleUpdate = (value: any) => {
      emit('update', value)
    }

    return () => {
      const { field, value } = props

      switch (field.component) {
        case 'Select':
          return h(ElSelect, {
            modelValue: value || '',
            'onUpdate:modelValue': handleUpdate,
            clearable: true,
            ...field.componentProps
          }, {
            default: () => field.options?.map(option =>
              h(ElOption, {
                key: option.value,
                label: option.label,
                value: option.value
              })
            )
          })

        case 'InputNumber':
          return h(ElInputNumber, {
            modelValue: typeof value === 'number' ? value : 0,
            'onUpdate:modelValue': handleUpdate,
            style: { width: '100%' },
            ...field.componentProps
          })

        case 'Switch':
          return h(ElSwitch, {
            modelValue: value || false,
            'onUpdate:modelValue': handleUpdate,
            ...field.componentProps
          })

        default:
          return null
      }
    }
  }
})

export { FormFieldRenderer }
</script>

<style lang="less" scoped>
.form-section {
  margin-bottom: 30px;

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

.toggle-section {
  margin: 20px 0;
  padding: 15px;
  background: var(--el-bg-color-page);
  border-radius: 6px;
  border: 1px solid var(--el-border-color-light);
}

:deep(.el-form-item__label) {
  font-weight: normal;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-form-item__error) {
  font-size: 12px;
}
</style>