<script lang="tsx">
import { defineComponent, h } from 'vue'
import { ElSelect, ElInputNumber, ElSwitch, ElOption, ElInput } from 'element-plus'

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

export default defineComponent({
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
          return h(
            ElSelect,
            {
              modelValue: value || '',
              'onUpdate:modelValue': handleUpdate,
              clearable: true,
              ...field.componentProps
            },
            {
              default: () =>
                field.options?.map((option) =>
                  h(ElOption, {
                    key: option.value,
                    label: option.label,
                    value: option.value
                  })
                )
            }
          )

        case 'InputNumber':
          const isInteger = field.dataType === 'integer'
          return h(ElInputNumber, {
            modelValue:
              typeof value === 'number'
                ? value
                : value === '' || value === undefined || value === null
                  ? undefined
                  : Number(value) || undefined,
            'onUpdate:modelValue': (newValue: number) => {
              // 如果是整数类型，确保值为整数
              if (isInteger && newValue !== null && newValue !== undefined) {
                newValue = Math.round(newValue)
              }
              handleUpdate(newValue)
            },
            style: { width: '100%' },
            min: field.min,
            max: field.max,
            controls: false,
            step: isInteger ? 1 : 0.1,
            precision: isInteger ? 0 : undefined,
            ...field.componentProps
          })

        case 'Switch':
          return h(ElSwitch, {
            modelValue: value === true || value === 'true',
            'onUpdate:modelValue': handleUpdate,
            ...field.componentProps
          })

        case 'Input':
        default:
          return h(ElInput, {
            modelValue: value !== null && value !== undefined ? String(value) : '',
            'onUpdate:modelValue': handleUpdate,
            ...field.componentProps
          })
      }
    }
  }
})
</script>