<template>
  <el-card
    class="!min-h-[calc(100vh-var(--top-tool-height)-var(--tags-view-height)-var(--app-footer-height))]"
  >
    <section class="p-6">
      <header class="h-10 relative mb-4">
        <el-button type="primary" @click="isShowModal = !isShowModal">Create New File</el-button>
        <div class="absolute right-1 top-2 w-5" @click.stop="toggleTableHeader">
          <Icon :icon="'vi-ep:grid'" :size="20" />
        </div>
      </header>
      <main>
        <el-table :data="filterTableData" stripe style="width: 100%" border>
          <template v-for="(col, k) in columnList" :key="k">
            <el-table-column v-bind="col" v-if="col.isShow" align="center">
              <template #header>
                <section
                  v-if="col.prop !== 'operations'"
                  class="flex items-center justify-center gap-1"
                >
                  <span>{{ col.label }}</span>
                  <el-popover
                    placement="bottom"
                    :width="200"
                    trigger="click"
                    popper-class="filter-popover"
                    ref="popoverRef"
                  >
                    <template #reference>
                      <Icon
                        :icon="'vi-ant-design:filter-outlined'"
                        class="cursor-pointer"
                        @click.stop
                      />
                    </template>
                    <div class="filter-content">
                      <!-- <el-input
                      v-model="filterValues[col.prop]"
                      placeholder="请输入筛选条件"
                      clearable
                      @input="handleFilter(col.prop)"
                    /> -->
                      <header class="custom-checkbox">
                        <el-checkbox
                          v-model="filterCheckedAll[col.prop]"
                          @change="(val: boolean) => handleCheckAllChange(val, col.prop)"
                        >
                          全选
                        </el-checkbox>
                      </header>
                      <div class="custom-checkbox-group">
                        <el-checkbox-group
                          v-model="filterChecked[col.prop]"
                          @change="handleCheckedChange($event, col.prop)"
                          v-for="item in getColumnValues(col.prop)"
                          :key="item"
                          class="mt-1"
                        >
                          <el-checkbox :label="item">{{ item }}</el-checkbox>
                        </el-checkbox-group>
                      </div>
                      <footer class="flex justify-end mt-2">
                        <el-button type="primary" size="small" @click="handleFilterConfirm"
                          >确认</el-button
                        >
                      </footer>
                    </div>
                  </el-popover>
                </section>
                <section v-else>
                  <el-select
                    v-model="value1"
                    clearable
                    style="width: 300px"
                    @change="changeOptionsData(value1)"
                  >
                    <el-option
                      v-for="item in options"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </section>
              </template>
              <template #default v-if="col.prop === 'operations'">
                <el-button type="primary" size="small" @click="isShowModal = !isShowModal"
                  >克隆</el-button
                >
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
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[5, 10, 20, 30, 40]"
            :small="true"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </main>
    </section>
  </el-card>
  <section>
    <el-drawer v-model="drawer2" :direction="direction" size="45%">
      <template #header>
        <el-divider content-position="left">
          <div class="flex items-center text-red-400">
            <span class="mr-2">添加表格显示字段</span>
            <Icon :icon="'vi-ant-design:star-filled'" />
          </div>
        </el-divider>
      </template>
      <template #default>
        <div class="transfer-container">
          <!-- 统计信息 -->
          <div class="transfer-stats mb-4 p-3 bg-gray-50 rounded">
            <div class="flex justify-between text-sm text-gray-600">
              <span>可管理列数: {{ transferData.length }}</span>
              <span
                >已显示: {{ transferRightValue.length }} | 已隐藏:
                {{ transferData.length - transferRightValue.length }}</span
              >
            </div>
          </div>

          <el-transfer
            v-model="transferRightValue"
            style="text-align: left; display: inline-block"
            filterable
            :titles="['隐藏的列', '显示的列']"
            :format="{
              noChecked: '${total}',
              hasChecked: '${checked}/${total}'
            }"
            :data="transferData"
            @change="handleTransferChange"
            :props="{
              key: 'key',
              label: 'label',
              disabled: 'disabled'
            }"
            class="custom-transfer"
          >
            <template #default="{ option }">
              <span class="transfer-item">{{ option.label }}</span>
            </template>
            <template #left-empty>
              <el-empty :image-size="60" description="所有列都已显示">
                <el-button type="primary" size="small" @click="hideAllColumns">
                  隐藏一些列
                </el-button>
              </el-empty>
            </template>
            <template #right-empty>
              <el-empty :image-size="60" description="暂无显示列">
                <el-button type="primary" size="small" @click="showAllColumns">
                  显示一些列
                </el-button>
              </el-empty>
            </template>
          </el-transfer>

          <!-- 快捷操作按钮 -->
          <div class="transfer-actions mt-4 flex gap-2 justify-center">
            <el-button size="small" type="success" @click="showAllColumns">显示所有</el-button>
            <el-button size="small" type="warning" @click="hideAllColumns">隐藏所有</el-button>
            <el-button size="small" type="info" @click="resetColumns">重置默认</el-button>
          </div>
        </div>
      </template>
    </el-drawer>
  </section>
  <section>
    <Dialog
      v-model="isShowModal"
      title="Configuration Editor"
      align-center
      style="overflow: auto"
      :maxHeight="screenHeight"
      @close="showEditDialog = false"
    >
      <section>
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
                <el-form-item
                  :key="field.field"
                  :prop="field.field"
                  :rules="getFieldRules(field)"
                  :label-position="'left'"
                  v-for="(field, index) in section.fields"
                >
                  <template #label>
                    <div class="flex items-center">
                      <el-tooltip effect="dark" :content="field.label" placement="top">
                        <Icon
                          :icon="'vi-ant-design:question-circle-filled'"
                          style="margin-right: 8px; flex-shrink: 0"
                        />
                      </el-tooltip>
                      <span class="label-text">{{ field.label }}</span>
                    </div>
                  </template>
                  <FormFieldRenderer
                    :field="field"
                    :value="formData[0][field.field]"
                    @update="(value) => handleFieldUpdate(field.field, value)"
                  />
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
                  <el-form-item
                    :key="field.field"
                    :prop="field.field"
                    :rules="getFieldRules(field)"
                    :label-position="'left'"
                  >
                    <template #label>
                      <div class="flex items-center">
                        <el-tooltip effect="dark" :content="field.label" placement="top">
                          <Icon
                            :icon="'vi-ant-design:question-circle-filled'"
                            style="margin-right: 8px; flex-shrink: 0"
                          />
                        </el-tooltip>
                        <span class="label-text">{{ field.label }}</span>
                      </div>
                    </template>
                    <FormFieldRenderer
                      :field="field"
                      :value="formData[0][field.field]"
                      @update="(value) => handleFieldUpdate(field.field, value)"
                      style="width: 300px"
                    />
                  </el-form-item>
                </section>
              </el-col>
              <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="12">
                <section v-for="(field, index) in section.fields.filter((_, i) => i % 2 === 1)">
                  <el-form-item
                    :key="field.field"
                    :prop="field.field"
                    :rules="getFieldRules(field)"
                    :label-position="'left'"
                  >
                    <template #label>
                      <div class="flex items-center">
                        <el-tooltip effect="dark" :content="field.label" placement="top">
                          <Icon
                            :icon="'vi-ant-design:question-circle-filled'"
                            style="margin-right: 8px; flex-shrink: 0"
                          />
                        </el-tooltip>
                        <span class="label-text">{{ field.label }}</span>
                      </div>
                    </template>
                    <FormFieldRenderer
                      :field="field"
                      :value="formData[0][field.field]"
                      @update="(value) => handleFieldUpdate(field.field, value)"
                      style="width: 300px"
                    />
                  </el-form-item>
                </section>
              </el-col>
            </el-row>
          </div>
        </el-form>
      </section>
      <template #footer>
        <el-button
          type="primary"
          @click="
            () => {
              console.log('submit')
            }
          "
          >Save</el-button
        >
      </template>
    </Dialog>
  </section>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  unref,
  reactive,
  defineComponent,
  h,
  watch,
  onMounted,
  onBeforeUnmount
} from 'vue'
import { useI18n } from 'vue-i18n'
import { ElTransfer, ElEmpty } from 'element-plus'
import type { DrawerProps } from 'element-plus'
import {
  ElSelect,
  ElInputNumber,
  ElSwitch,
  ElOption,
  ElInput,
  ElRadio,
  ElRadioGroup
} from 'element-plus'
import type { TransferKey } from 'element-plus'
import { Dialog } from '@/components/Dialog'

const { t } = useI18n()
const showEditDialog = ref(false)

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

const options = [...new Set(tableData.map((item) => item['date']))].map((item) => ({
  value: item,
  label: item
}))
const changeOptionsData = (value: string) => {
  if (!value) {
    filterChecked.value = {
      date: [...new Set(tableData.map((item) => item['date']))]
    }
  } else {
    let arrValue = [value]
    filterChecked.value = {
      date: arrValue
    }
  }
}

const isShowModal = ref<boolean>(false)

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
  columnList.value
    .filter((item) => !item.isShow)
    .forEach((filed, idx) => {
      data.push({
        key: filed.label,
        label: filed.label,
        disabled: filed.isShow
      })
    })

  return data
}

// Transfer相关数据和方法
const transferData = computed(() => {
  return columnList.value
    .filter((col) => col.prop !== 'operations')
    .map((col) => ({
      key: col.prop,
      label: col.label,
      disabled: false
    }))
})

const transferRightValue = ref<string[]>(
  columnList.value.filter((col) => col.isShow && col.prop !== 'operations').map((col) => col.prop)
)

const handleTransferChange = (targetKeys: string[]) => {
  transferRightValue.value = targetKeys

  // 更新列的显示状态
  columnList.value.forEach((col) => {
    if (col.prop !== 'operations') {
      col.isShow = targetKeys.includes(col.prop)
    }
  })
}

// 快捷操作方法
const showAllColumns = () => {
  const allProps = columnList.value
    .filter((col) => col.prop !== 'operations')
    .map((col) => col.prop)
  handleTransferChange(allProps)
}

const hideAllColumns = () => {
  handleTransferChange([])
}

const resetColumns = () => {
  // 重置到初始状态
  const defaultVisibleColumns = ['date', 'name', 'address']
  handleTransferChange(defaultVisibleColumns)
}

// 监听列配置变化，同步更新transferRightValue
watch(
  columnList,
  (newColumns) => {
    transferRightValue.value = newColumns
      .filter((col) => col.isShow && col.prop !== 'operations')
      .map((col) => col.prop)
  },
  { deep: true }
)

// 初始化transfer右侧值
const initTransferRightValue = () => {
  transferRightValue.value = columnList.value
    .filter((col) => col.isShow && col.prop !== 'operations')
    .map((col) => col.prop)
}

// 组件挂载时初始化
initTransferRightValue()

// 保持原有的数据和方法以兼容现有逻辑
const data = ref(generateData())
const rightValue = ref([])
const handleChange = (
  value: TransferKey[]
  // direction: TransferDirection,
  // movedKeys: TransferKey[]
) => {
  columnList.value.filter((item) => {
    if (value.includes(item.label)) {
      item.isShow = !item.isShow
    }
  })
}

const handleRightChange = (value: TransferKey[]) => {
  columnList.value.filter((item) => {
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
// 字段更新处理
const handleFieldUpdate = (field: string, value: any) => {
  const oldValue = formData[0][field]

  // 更新表单数据
  formData[0][field] = value

  // 创建新的 modelValue
  const newModelValue = { ...formData }

  console.log(newModelValue, 'newModelValue')
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

/* Transfer组件优化样式 */
.transfer-container {
  padding: 20px;
}

.transfer-stats {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
}

.custom-transfer {
  :deep(.el-transfer-panel) {
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }

  :deep(.el-transfer-panel__header) {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 8px 8px 0 0;
    font-weight: 500;
  }

  :deep(.el-transfer-panel__filter .el-input__wrapper) {
    border-radius: 6px;
  }

  :deep(.el-transfer-panel__list.is-filterable) {
    border-radius: 0 0 8px 8px;
  }

  :deep(.el-checkbox__label) {
    font-size: 14px;
  }
}

.transfer-item {
  display: flex;
  align-items: center;
  padding: 2px 0;
  font-size: 14px;
}

.transfer-actions {
  border-top: 1px solid #e9ecef;
  padding-top: 16px;

  .el-button {
    border-radius: 20px;
    font-weight: 500;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }
  }
}
</style>
