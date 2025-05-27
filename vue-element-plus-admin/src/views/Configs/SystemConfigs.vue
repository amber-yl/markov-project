<template>
  <el-card class="!min-h-[calc(100vh-var(--top-tool-height)-var(--tags-view-height)-var(--app-footer-height))]">
    <section class="p-6">
      <header class="h-10 relative mb-4">
        <el-button type="primary" @click="isShowModal = !isShowModal">Create New File</el-button>
        <div class="absolute right-1 top-2 w-5" @click.stop="toggleTableHeader">
          <Icon :icon="'vi-ep:grid'" :size="20" />
        </div>
      </header>
      <main>
        <el-table :data="filterTableData" stripe style="width: 100%">
          <template v-for="(col, k) in columnList" :key="k">
            <el-table-column v-bind="col" v-if="col.isShow" align="center">
              <template #header>
                <section v-if="col.prop !== 'operations'" class="flex items-center justify-center gap-1">
                  <span>{{ col.label }}</span>
                  <el-popover placement="bottom" :width="200" trigger="click" popper-class="filter-popover"
                    ref="popoverRef">
                    <template #reference>
                      <Icon :icon="'vi-ant-design:filter-outlined'" class="cursor-pointer" @click.stop />
                    </template>
                    <div class="filter-content">
                      <!-- <el-input
                      v-model="filterValues[col.prop]"
                      placeholder="请输入筛选条件"
                      clearable
                      @input="handleFilter(col.prop)"
                    /> -->
                      <header class="custom-checkbox">
                        <el-checkbox v-model="filterCheckedAll[col.prop]"
                          @change="handleCheckAllChange($event, col.prop)">
                          全选
                        </el-checkbox>
                      </header>
                      <div class="custom-checkbox-group">
                        <el-checkbox-group v-model="filterChecked[col.prop]"
                          @change="handleCheckedChange($event, col.prop)" v-for="item in getColumnValues(col.prop)"
                          :key="item" class="mt-1">
                          <el-checkbox :label="item">{{ item }}</el-checkbox>
                        </el-checkbox-group>
                      </div>
                      <footer class="flex justify-end mt-2">
                        <el-button type="primary" size="small" @click="handleFilterConfirm">确认</el-button>
                      </footer>
                    </div>
                  </el-popover>
                </section>
                <section v-else>
                  <el-select v-model="value1" clearable style="width: 300px" @change="changeOptionsData(value1)">
                    <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </section>
              </template>
              <template #default v-if="col.prop === 'operations'">
                <el-button type="primary" size="small">克隆</el-button>
                <el-tooltip placement="top" content="预设配置禁止编辑">
                  <el-button type="primary" size="small" disabled>编辑</el-button>
                </el-tooltip>
                <el-tooltip placement="top" content="预设配置禁止删除">
                  <el-button type="primary" size="small" disabled>删除</el-button>
                </el-tooltip>
              </template>
            </el-table-column>
          </template>
        </el-table>
        <div class="flex justify-end mt-10">
          <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
            :page-sizes="[5, 10, 20, 30, 40]" :small="true" :total="total"
            layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
            @current-change="handleCurrentChange" />
        </div>
      </main>
    </section>
  </el-card>
  <section>
    <el-drawer v-model="drawer2" :direction="direction" size="40%">
      <template #header>
        <el-divider content-position="left">
          <div class="flex items-center text-red-400">
            <span class="mr-2">添加表格显示字段</span>
            <Icon :icon="'vi-ant-design:star-filled'" />
          </div>
        </el-divider>
      </template>
      <template #default>
        <!-- <div class="grid grid-flow-rows gap-2 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          <el-check-tag class="w-full text-center" v-for="(item, k) in showUncheckedTableHeaderlist"
            @change="onChange(item)" :key="k">{{ item.label }}</el-check-tag>
        </div> -->
        <el-transfer v-model="rightValue" style="text-align: left; display: inline-block" filterable
          :titles="['Source', 'Target']" :format="{
            noChecked: '${total}',
            hasChecked: '${checked}/${total}',
          }" :data="data" @change="handleChange" @right-check-change="handleRightChange">
          <template #default="{ option }">
            <span>{{ option.key }} - {{ option.label }}</span>
          </template>
          <template #left-empty>
            <el-empty :image-size="60" description="No data" />
          </template>
          <template #right-empty>
            <el-empty :image-size="60" description="No data" />
          </template>
        </el-transfer>
      </template>
    </el-drawer>
  </section>
  <section>
    <el-dialog v-model="isShowModal" title="Configuration Editor" align-center style="overflow: auto;">
      <el-card>
        <div class="!h-[calc(100vh-var(--el-dialog-height))] overflow-auto custom-hidden-scroller">
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
                          <Icon :icon="'vi-ant-design:question-circle-filled'"
                            style="margin-right: 8px; flex-shrink: 0;" />
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
            <!-- 渲染表单区块 -->
            <div v-for="section in visibleMultiSections" :key="section.key" class="form-section">
              <el-divider content-position="left" class="section-title" :color="'red'">
                <div class="flex items-center text-red-400 gap-2">
                  <span>{{ section.title }}</span>
                  <Icon v-if="section.required" :icon="'vi-ant-design:star-filled'" />
                </div>
              </el-divider>
              <!-- 两列布局 -->
              <el-row :gutter="20">
                <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                  <section v-for="(field, index) in section.fields.filter((_, i) => i % 2 === 0)">
                    <el-form-item :key="field.field" :prop="field.field" :rules="getFieldRules(field)"
                      :label-position="'left'">
                      <template #label>
                        <div class="flex items-center">
                          <el-tooltip effect="dark" :content="field.label" placement="top">
                            <Icon :icon="'vi-ant-design:question-circle-filled'"
                              style="margin-right: 8px; flex-shrink: 0;" />
                          </el-tooltip>
                          <span class="label-text">{{ field.label }}</span>
                        </div>
                      </template>
                      <FormFieldRenderer :field="field" :value="formData[0][field.field]"
                        @update="(value) => handleFieldUpdate(field.field, value)" style="width: 300px;" />
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
                              style="margin-right: 8px; flex-shrink: 0;" />
                          </el-tooltip>
                          <span class="label-text">{{ field.label }}</span>
                        </div>
                      </template>
                      <FormFieldRenderer :field="field" :value="formData[0][field.field]"
                        @update="(value) => handleFieldUpdate(field.field, value)" style="width: 300px;" />
                    </el-form-item>
                  </section>
                </el-col>
              </el-row>
            </div>
          </el-form>
        </div>
        <footer class="h-10 flex justify-start mt-4">
          <el-button type="primary" @click="() => { console.log('submit') }">Save</el-button>
        </footer>
      </el-card>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, unref, reactive, defineComponent, h } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElTransfer, ElEmpty } from 'element-plus'
import type { DrawerProps } from 'element-plus'
import { ElSelect, ElInputNumber, ElSwitch, ElOption, ElInput, ElRadio, ElRadioGroup } from 'element-plus'
import type {
  TransferKey,
} from 'element-plus'

const { t } = useI18n()


const tableData = [
  {
    date: '2016-05-03',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
    tag: 'Home'
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
    tag: 'Office'
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
    tag: 'Home'
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
    tag: 'Office'
  }
]

// 添加分页相关的变量和方法
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(tableData.length)

// 处理页码改变
const handleCurrentChange = (val: number) => {
  console.log(`当前页: ${val}`)
}

// 处理每页显示条数改变
const handleSizeChange = (val: number) => {
  console.log(`每页 ${val} 条`)
}
// 筛选相关的响应式数据
const filterValues = ref({})
const filterChecked = ref({})
const filterCheckedAll = ref({})

// 获取列的所有唯一值
const getColumnValues = (prop: string) => {
  const values = new Set(tableData.map((item) => item[prop]))
  return Array.from(values)
}

// 处理全选
const handleCheckAllChange = (val: boolean, prop: string) => {
  filterChecked.value[prop] = val ? getColumnValues(prop) : []
}

// 处理选中变化
const handleCheckedChange = (value: string[], prop: string) => {
  const allValues = getColumnValues(prop)
  filterCheckedAll.value[prop] = value.length === allValues.length
}

// 处理筛选输入
const handleFilter = (prop: string) => {
  // 这里可以实现筛选逻辑
  if (!filterValues.value[prop]) {
    filterChecked.value[prop] = []
    filterCheckedAll.value[prop] = false
    return
  }

  // 获取该列所有可能的值
  const allValues = getColumnValues(prop)

  // 根据输入值过滤匹配的选项
  const matchedValues = allValues.filter((value) =>
    String(value).toLowerCase().includes(filterValues.value[prop].toLowerCase())
  )

  // 更新复选框选中状态
  filterChecked.value[prop] = matchedValues
  filterCheckedAll.value[prop] = matchedValues.length === allValues.length
}
// 修改 filterTableData 的计算属性
const filterTableData = computed(() => {
  let filtered = tableData.filter((data) => {
    // 实现筛选逻辑
    for (const prop in filterChecked.value) {
      if (filterChecked.value[prop]?.length > 0) {
        if (!filterChecked.value[prop].includes(data[prop])) {
          return false
        }
      }
      if (filterValues.value[prop]) {
        const value = String(data[prop]).toLowerCase()
        if (!value.includes(filterValues.value[prop].toLowerCase())) {
          return false
        }
      }
    }
    return true
  })

  total.value = filtered.length
  const startIndex = (currentPage.value - 1) * pageSize.value
  return filtered.slice(startIndex, startIndex + pageSize.value)
})

const options = [... new Set(tableData.map(item => item['date']))].map(item => ({ value: item, label: item }))
const changeOptionsData = (value: string) => {
  if (!value) {
    filterChecked.value = {
      'date': [... new Set(tableData.map(item => item['date']))]
    }
  } else {
    let arrValue = [value]
    filterChecked.value = {
      'date': arrValue
    }
  }
}

const isShowModal = ref<boolean>(true)

const columnList = ref<
  {
    label: string
    prop: string
    isShow: boolean
    fixed?: string
    minWidth?: string
  }[]
>([
  { label: 'Date', prop: 'date', isShow: true, fixed: 'left', minWidth: '50' },
  { label: 'Name', prop: 'name', isShow: true, minWidth: '50' },
  { label: 'Address', prop: 'address', isShow: true, minWidth: '100' },
  { label: 'Zip', prop: 'zip', isShow: false, minWidth: '50' },
  { label: 'Tag', prop: 'tag', isShow: false, minWidth: '50' },
  { label: 'Operations', prop: 'operations', fixed: 'right', minWidth: '100', isShow: true }
])

const drawer2 = ref(false)
const direction = ref<DrawerProps['direction']>('rtl')
function toggleTableHeader() {
  drawer2.value = true
}

const onChange = (uncheckeditem: {
  label: string
  prop: string
  fixed?: string
  minWidth?: string
  isShow?: boolean
}) => {
  columnList.value.forEach((item) => {
    if (item.label === uncheckeditem?.label) {
      item.isShow = !item.isShow
    }
  })
}

const showUncheckedTableHeaderlist = computed(() => {
  return columnList.value.filter((item) => !item.isShow)
})

const popoverRef = ref()
// 添加处理筛选确认的方法
const handleFilterConfirm = () => {
  // 关闭筛选弹出框
  unref(popoverRef).forEach((popover) => {
    popover?.hide()
  })
}
const value1 = ref('Select Date')


interface DataItem {
  key: string
  label: string
  disabled: boolean
}
const generateData = (): DataItem[] => {
  const data: DataItem[] = []
  columnList.value.filter(item => !item.isShow).forEach((filed, idx) => {
    data.push({
      key: filed.label,
      label: filed.label,
      disabled: filed.isShow,
    })
  })

  return data
}

const data = ref(generateData())
const rightValue = ref([])
const handleChange = (
  value: TransferKey[],
  // direction: TransferDirection,
  // movedKeys: TransferKey[]
) => {
  columnList.value.filter(item => {
    if (value.includes(item.label)) {
      item.isShow = !item.isShow
    }
  })
}

const handleRightChange = (value: TransferKey[]) => {
  columnList.value.filter(item => {
    if (value.includes(item.label)) {
      item.isShow = !item.isShow
    }
  })
}

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
    mtpModuleNum: 0,
  }
])
const visibleSingleSections = computed(() => {
  return currentStepSections.value.filter((item) => item.isSingleCol).filter(section => {
    return section.visible ? section.visible() : true
  })
})

const visibleMultiSections = computed(() => {
  return currentStepSections.value.filter((item) => !item.isSingleCol).filter(section => {
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
        componentProps: { placeholder: 'Select' },
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
        ],
      },
      {
        field: 'modelType',
        label: 'Model Type',
        component: 'Select',
        componentProps: { placeholder: 'Select' },
        options: [
          { label: 'gpt_1', value: 'gpt_1' }
        ],
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
      },
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
// 字段更新处理
const handleFieldUpdate = (field: string, value: any) => {
  const oldValue = formData[0][field]

  // 更新表单数据
  formData[0][field] = value

  // 创建新的 modelValue
  const newModelValue = { ...formData }

  console.log(newModelValue, 'newModelValue');
}

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

const showToggle = ref(true)
const showAdvancedConfig = ref(false)
const handleAdvancedConfigToggle = (value: boolean) => {
  showAdvancedConfig.value = value
  // emit('sectionToggle', { sectionKey: 'advanced', visible: value })
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
            ...field.componentProps,
          })

        case 'Radio':
          return h(ElRadioGroup, {
            modelValue: value || '',
            'onUpdate:modelValue': handleUpdate,
            clearable: true,
            ...field.componentProps
          }, {
            default: () => field.options?.map(option =>
              h(ElRadio, {
                key: option.value,
                label: option.label,
                value: option.value
              })
            )
          })
        default:
          return null
      }
    }
  }
})
</script>

<style lang="less" scoped>
.box-border {
  :deep(.el-card) {
    height: 100%;
  }

  // :deep(.el-card__body) {
  //   height: 100%;
  //   padding: 20px;
  // }
}

.filter-content {
  padding: 8px;

  .el-checkbox-group {
    max-height: 200px;
    overflow-y: auto;
  }
}

:deep(.filter-popover) {
  padding: 12px;
  min-width: 200px;
}

.custom-hidden-scroller {
  &::-webkit-scrollbar {
    display: none;
  }
}

.label-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 120px;
}
</style>
