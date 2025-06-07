<template>
  <div class="markov-cards-container grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
    <el-card v-for="item in props.displayViewModeList" :key="item.id"
      v-memo="[item.id, item.status, selectedItems[item.id], hoveredId]"
      class="select-card relative transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
      style="max-width: 480px" @mouseenter="handleMouseEnter(item.id)" @mouseleave="handleMouseLeave"
      @click="emit('detail', item)">
      <div v-if="props.isSelectionMode" class="checkbox-wrapper absolute top-2 right-2 z-10">
        <el-checkbox v-model="selectedItems[item.id]" class="!w-4 !h-4 border-2 border-blue-500 rounded" @click.stop
          @change="() => handleSelect(item, selectedItems[item.id])" />
      </div>
      <template #header>
        <div class="flex items-center justify-between">
          <span :class="{
            'text-blue-500 font-medium': hoveredId === item.id,
            'text-gray-700': hoveredId !== item.id
          }" class="transition-colors duration-200 truncate">
            {{ item.model }}
          </span>
          <el-tag :type="getStatusType(item.status)" size="small" effect="light" class="flex-shrink-0 ml-2">
            {{ item.status }}
          </el-tag>
        </div>
      </template>
      <div class="text item space-y-2">
        <div class="flex items-center gap-2">
          <Icon :icon="'vi-ant-design:project-outlined'" class="text-gray-400 flex-shrink-0" />
          <p class="text-sm text-gray-600 truncate m-0">{{ item.name }}</p>
        </div>
        <div class="flex items-center gap-2">
          <Icon :icon="'vi-ant-design:calendar-outlined'" class="text-gray-400 flex-shrink-0" />
          <p class="text-xs text-gray-500 m-0">{{ formatDate(item.createTime) }}</p>
        </div>
      </div>
      <template #footer>
        <section class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Icon :icon="'vi-ant-design:check-circle-filled'" :color="item.status === 'running' ? '#10b981' : '#6b7280'"
              class="transition-colors duration-200" />
            <span :style="{ color: item.status === 'running' ? '#10b981' : '#6b7280' }"
              class="text-sm font-medium transition-colors duration-200">
              {{ getStatusText(item.status) }}
            </span>
          </div>
          <div class="flex items-center gap-1 text-xs text-gray-400">
            <Icon :icon="'vi-ant-design:user-outlined'" />
            <span>{{ item.creator || 'Unknown' }}</span>
          </div>
        </section>
      </template>
      <footer class="absolute bottom-2 right-2 flex gap-2 transition-all duration-300 text-blue-500" :class="{
        'opacity-0 transform translate-y-2': hoveredId !== item.id,
        'opacity-100 transform translate-y-0': hoveredId === item.id
      }">
        <el-tooltip content="编辑任务" placement="top" :show-after="500">
          <Icon :icon="'vi-ant-design:edit-outlined'" @click.stop="handleEditTask(item, $event)"
            class="hover:text-blue-600 cursor-pointer transition-colors duration-200" />
        </el-tooltip>
        <el-popover effect="light" placement="top" width="220" :show-after="300">
          <template #default>
            <div class="space-y-2">
              <div v-for="key in ['model', 'hardware', 'deployment']" :key="key" class="info-item">
                <span class="font-medium text-gray-700">{{ key }}:</span>
                <span class="text-gray-600 ml-2">{{ item[key] || 'N/A' }}</span>
              </div>
            </div>
          </template>
          <template #reference>
            <Icon :icon="'vi-ant-design:question-circle-outlined'" @click.stop
              class="hover:text-blue-600 cursor-pointer transition-colors duration-200" />
          </template>
        </el-popover>
        <el-tooltip content="删除任务" placement="top" :show-after="500">
          <Icon :icon="'vi-ant-design:delete-outlined'" @click.stop="handleDeleteTask(item, $event)"
            class="hover:text-red-500 cursor-pointer transition-colors duration-200" />
        </el-tooltip>
      </footer>
    </el-card>
  </div>

  <section>
    <Dialog v-model="showEditDialog" title="Configuration Editor" align-center style="overflow: auto"
      :maxHeight="screenHeight" @close="showEditDialog = false">
      <el-form ref="formRef" :model="formData[0]" label-width="150px" label-position="left">
        <div v-for="section in visibleSingleSections" :key="section.key" class="form-section">
          <el-divider content-position="left" class="section-title" :color="'red'">
            <div class="flex items-center text-red-400 gap-2">
              <span>{{ section.title }}</span>
              <Icon v-if="section.required" :icon="'vi-ant-design:star-filled'" />
            </div>
          </el-divider>
          <el-row :gutter="20">
            <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
              <el-form-item :key="field.field" :prop="field.field" :rules="getFieldRules(field)"
                :label-position="'left'" v-for="(field, index) in section.fields">
                <template #label>
                  <div class="flex items-center">
                    <el-tooltip effect="dark" :content="field.label" placement="top">
                      <Icon :icon="'vi-ant-design:question-circle-filled'" style="margin-right: 8px; flex-shrink: 0" />
                    </el-tooltip>
                    <span class="label-text">{{ field.label }}</span>
                  </div>
                </template>
                <FormFieldRenderer :field="field" :value="formData[0][field.field]"
                  @update="(value) => handleFieldUpdate(field.field, value)" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <div v-for="section in visibleMultiSections" :key="section.key" class="form-section">
          <el-divider content-position="left" class="section-title" :color="'red'">
            <div class="flex items-center text-red-400 gap-2">
              <span>{{ section.title }}</span>
              <Icon v-if="section.required" :icon="'vi-ant-design:star-filled'" />
            </div>
          </el-divider>
          <el-row :gutter="20">
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <section v-for="(field, index) in section.fields.filter((_, i) => i % 2 === 0)">
                <el-form-item :key="field.field" :prop="field.field" :rules="getFieldRules(field)"
                  :label-position="'left'">
                  <template #label>
                    <div class="flex items-center">
                      <el-tooltip effect="dark" :content="field.label" placement="top">
                        <Icon :icon="'vi-ant-design:question-circle-filled'"
                          style="margin-right: 8px; flex-shrink: 0" />
                      </el-tooltip>
                      <span class="label-text">{{ field.label }}</span>
                    </div>
                  </template>
                  <FormFieldRenderer :field="field" :value="formData[0][field.field]"
                    @update="(value) => handleFieldUpdate(field.field, value)" style="width: 300px" />
                </el-form-item>
              </section>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
              <section v-for="(field, index) in section.fields.filter((_, i) => i % 2 === 1)">
                <el-form-item :key="field.field" :prop="field.field" :rules="getFieldRules(field)"
                  :label-position="'left'">
                  <template #label>
                    <div class="flex items-center">
                      <el-tooltip effect="dark" :content="field.label" placement="top">
                        <Icon :icon="'vi-ant-design:question-circle-filled'"
                          style="margin-right: 8px; flex-shrink: 0" />
                      </el-tooltip>
                      <span class="label-text">{{ field.label }}</span>
                    </div>
                  </template>
                  <FormFieldRenderer :field="field" :value="formData[0][field.field]"
                    @update="(value) => handleFieldUpdate(field.field, value)" style="width: 300px" />
                </el-form-item>
              </section>
            </el-col>
          </el-row>
        </div>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="
          () => {
            console.log('submit')
          }
        ">Save</el-button>
      </template>
    </Dialog>
  </section>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, reactive, computed, defineComponent, h } from 'vue'
import { useCardSelection } from '@/composables/useCardSelection'
import { useInferenceModelConfigStore } from '@/store/modules/inferenceModelConfigs'
import { Dialog } from '@/components/Dialog'
import {
  ElSelect,
  ElInputNumber,
  ElSwitch,
  ElOption,
  ElInput,
  ElRadio,
  ElRadioGroup
} from 'element-plus'

// Define Task type locally if not available from store
interface Task {
  id: number
  name: string
  model: string
  status: string
  createTime: string
  updateTime?: string
  creator?: string
  hardware?: string
  deployment?: string
}

const props = defineProps<{
  displayViewModeList: Task[]
  loading?: boolean
  isSelectionMode?: boolean
}>()
const emit = defineEmits<{
  (e: 'select', task: Task, checked: boolean): void
  (e: 'detail', task: Task): void
}>()

const currentList = ref<Task[]>(props.displayViewModeList)

const selectedItems = ref<Record<string, boolean>>({})
const handleSelect = (item: Task, checked: boolean) => {
  emit('select', item, checked)
}
watch(
  () => props.isSelectionMode,
  (newValue) => {
    if (!newValue) {
      // 当退出选择模式时，清空所有选中状态
      selectedItems.value = {}
    }
  }
)
const hoveredId = ref<number | null>(null)
const showEditDialog = ref(false)
const currentTask = ref<Task | null>(null)
const inferenceStore = useInferenceModelConfigStore()

const { selectedCards, isMultiSelect, ...cardSelection } = useCardSelection()

const handleMouseEnter = (id: number) => {
  hoveredId.value = id
}

const handleMouseLeave = () => {
  hoveredId.value = null
}

const handleDeleteTask = (task: Task, event: Event) => {
  event.stopPropagation() // 阻止事件冒泡，避免触发卡片点击
  const index = currentList.value.findIndex((item) => item.id === task.id)
  if (index !== -1) {
    currentList.value.splice(index, 1)
  }
}
const handleEditTask = (task: Task, event: Event) => {
  event.stopPropagation() // 阻止事件冒泡，避免触发卡片点击
  currentTask.value = { ...task } // 创建任务对象的副本
  showEditDialog.value = true
}

const handleSave = async () => {
  if (currentTask.value) {
    // 更新 store 中的任务数据
    const index = currentList.value.findIndex((task) => task.id === currentTask.value?.id)
    if (index !== -1) {
      currentList.value[index] = { ...currentTask.value }
    }
    showEditDialog.value = false
    currentTask.value = null
  }
}

// 初始化屏幕高度
const screenHeight = ref(window.innerHeight - 200)

// 处理窗口大小变化的函数
const handleResize = () => {
  screenHeight.value = window.innerHeight - 200
}

// 组件挂载后添加事件监听
onMounted(() => {
  window.addEventListener('resize', handleResize)
})

// 组件卸载前移除事件监听，防止内存泄漏
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})

const formData = reactive([
  {
    modelSelection: '',
    structureType: '',
    feedforward: 0,
    attnHeads: 0,
    attnSize: 0,
    hidden: '',
    attnType: '',
    numBlocks: 0,
    numQueryGroups: 0,
    qLoraRank: 0,
    qkRopeHeadDim: 0,
    qHeadDim: 0,
    kvLoraRank: 0,
    qkRopeHeadDim2: 0,
    vHeadDim: 0,
    norm: '',
    hybridModelEnable: false,
    hybridDenseBlocksNum: 0,
    embeddingOutputShare: false,
    embeddingSize: 0,
    hybridMoeBlocksNum: 0,
    mtpModuleNum: 0
  }
])
const visibleSingleSections = computed(() => {
  return currentStepSections.value
    .filter((item) => item.isSingleCol)
    .filter((section) => {
      return section.visible ? section.visible() : true
    })
})
const visibleMultiSections = computed(() => {
  return currentStepSections.value
    .filter((item) => !item.isSingleCol)
    .filter((section) => {
      return section.visible ? section.visible() : true
    })
})
const allFormSections: any[] = [
  {
    key: 'baseOptions',
    title: 'Base Options',
    required: true,
    isSingleCol: true,
    fields: [
      {
        field: 'newName',
        label: 'New Name',
        component: 'Input',
        componentProps: { placeholder: 'Select' }
      },
      {
        field: 'useType',
        label: 'Use Type',
        component: 'Select',
        componentProps: { placeholder: 'Select' },
        options: [
          { label: 'llama_3_70b', value: 'llama_3_70b' },
          { label: 'llama_3_8b', value: 'llama_3_8b' },
          { label: 'gpt_4', value: 'gpt_4' }
        ]
      },
      {
        field: 'modelType',
        label: 'Model Type',
        component: 'Select',
        componentProps: { placeholder: 'Select' },
        options: [{ label: 'gpt_1', value: 'gpt_1' }]
      }
    ]
  },
  {
    key: 'defaultConfigurations',
    title: 'Default Configurations',
    required: true,
    isSingleCol: true,
    fields: [
      {
        field: 'defaultConfigurations',
        label: 'Default Configurations',
        component: 'Select',
        componentProps: { placeholder: 'Select' },
        options: [
          { label: 'llm-08', value: 'llm-08' },
          { label: 'llm-16', value: 'llm-16' },
          { label: 'llm-32', value: 'llm-32' }
        ]
      }
    ]
  },
  {
    key: 'hardwareDetails',
    title: 'Hardware Details',
    required: true,
    fields: [
      {
        field: 'type',
        label: 'Type',
        component: 'Radio',
        componentProps: {},
        options: [
          { label: 'GPU', value: '0' },
          { label: 'NPU', value: '1' }
        ]
      },
      {
        field: 'processingMode',
        label: 'Processing Mode',
        component: 'Select',
        componentProps: { placeholder: '请选择' },
        options: [
          { label: 'MLA', value: 'mla' },
          { label: 'MOE', value: 'moe' }
        ]
      },
      {
        field: 'Matrix16',
        label: 'Matrix(float16 TFLOPS)',
        component: 'InputNumber',
        componentProps: { controls: false, placeholder: '0' }
      },
      {
        field: 'Vector16',
        label: 'Vector(float16 TFLOPS)',
        component: 'InputNumber',
        componentProps: { controls: false, placeholder: '0' }
      }
    ]
  },
  {
    key: 'memoryDetails',
    title: 'Memory Details',
    required: true,
    fields: [
      {
        field: 'memory1GIB',
        label: 'Memory1(GIB)',
        component: 'InputNumber',
        componentProps: { controls: false, placeholder: '0' }
      },
      {
        field: 'memory1GBps',
        label: 'Memory1(GBps)',
        component: 'InputNumber',
        componentProps: { controls: false, placeholder: '0' }
      },
      {
        field: 'memory2GIB',
        label: 'Memory2(GIB)',
        component: 'InputNumber',
        componentProps: { controls: false, placeholder: '0' }
      },
      {
        field: 'memory2GBps',
        label: 'Memory2(GBps)',
        component: 'InputNumber',
        componentProps: { controls: false, placeholder: '0' }
      }
    ]
  },
  {
    key: 'netWorkDetails',
    title: 'NetWork Details',
    required: true,
    fields: [
      {
        field: 'bandWidth1',
        label: 'BandWidth1(GB/S)',
        component: 'InputNumber',
        componentProps: { controls: false, placeholder: '0' }
      },
      {
        field: 'bandWidth2',
        label: 'BandWidth2(GB/S)',
        component: 'InputNumber',
        componentProps: { controls: false, placeholder: '0' }
      },
      {
        field: 'size1(GB)',
        label: 'Size1(GB)',
        component: 'InputNumber',
        componentProps: { controls: false, placeholder: '0' }
      },
      {
        field: 'size2(GB)',
        label: 'Size2(GB)',
        component: 'InputNumber',
        componentProps: { controls: false, placeholder: '0' }
      },
      {
        field: 'latency1',
        label: 'Latency1(ns)',
        component: 'InputNumber',
        componentProps: { controls: false, placeholder: '0' }
      },
      {
        field: 'latency2',
        label: 'Latency2(ns)',
        component: 'InputNumber',
        componentProps: { controls: false, placeholder: '0' }
      }
    ]
  }
]
const currentStepSections = computed(() => {
  return allFormSections
})
// 字段验证规则
const getFieldRules = (field: any): any[string] => {
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
  const oldValue = formData[0][field]

  // 更新表单数据
  formData[0][field] = value

  // 创建新的 modelValue
  const newModelValue = { ...formData }

  console.log(newModelValue, 'newModelValue')
}
const FormFieldRenderer = defineComponent({
  name: 'FormFieldRenderer',
  props: {
    field: {
      type: Object as () => any,
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
          return h(ElInputNumber, {
            modelValue: typeof value === 'number' ? value : 0,
            'onUpdate:modelValue': handleUpdate,
            ...field.componentProps
          })

        case 'Switch':
          return h(ElSwitch, {
            modelValue: value || false,
            'onUpdate:modelValue': handleUpdate,
            ...field.componentProps
          })

        case 'Input':
          return h(ElInput, {
            modelValue: value || '',
            'onUpdate:modelValue': handleUpdate,
            ...field.componentProps
          })

        case 'Radio':
          return h(
            ElRadioGroup,
            {
              modelValue: value || '',
              'onUpdate:modelValue': handleUpdate,
              clearable: true,
              ...field.componentProps
            },
            {
              default: () =>
                field.options?.map((option) =>
                  h(ElRadio, {
                    key: option.value,
                    label: option.label,
                    value: option.value
                  })
                )
            }
          )
        default:
          return null
      }
    }
  }
})

// Utility functions
const getStatusType = (status: string): 'success' | 'warning' | 'info' | 'primary' | 'danger' => {
  const statusMap: Record<string, 'success' | 'warning' | 'info' | 'primary' | 'danger'> = {
    running: 'success',
    pending: 'warning',
    completed: 'info',
    failed: 'danger',
    stopped: 'info'
  }
  return statusMap[status] || 'primary'
}

const getStatusText = (status: string): string => {
  const textMap: Record<string, string> = {
    running: '运行中',
    pending: '等待中',
    completed: '已完成',
    failed: '失败',
    stopped: '已停止'
  }
  return textMap[status] || status
}

const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateString
  }
}
</script>

<style lang="less" scoped>
.select-card {
  .checkbox-wrapper {
    :deep(.el-checkbox) {
      .el-checkbox__inner {
        border-color: #409eff;

        &.hover {
          border-color: #79bbff;
        }
      }
    }

    &.is-checked {
      .el-checkbox__inner {
        background-color: #409eff;
        border-color: #409eff;
      }
    }
  }
}

.horizontal-line {
  position: relative;

  &::after {
    content: '';
    display: block;
    width: 100%;
    /* 横线宽度，可调整 */
    height: 1px;
    /* 横线高度 */
    background-color: #ccc;
    /* 横线颜色 */
    margin: 8px 0;
    /* 上下间距，可调整 */
  }
}

.custom-hidden-scroller {
  &::-webkit-scrollbar {
    display: none;
  }
}
</style>
