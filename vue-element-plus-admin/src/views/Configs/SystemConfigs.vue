<template>
  <el-card
    class="!min-h-[calc(100vh-var(--top-tool-height)-var(--tags-view-height)-var(--app-footer-height))]"
  >
    <el-card class="mb-4">
      <div class="flex justify-between w-full">
        <el-select
          v-model="value"
          clearable
          placeholder="Select"
          style="width: 240px"
          @change="changeOptionsData(value)"
        >
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-button type="primary" @click="isShowModal = !isShowModal">Create New File</el-button>
      </div>
    </el-card>
    <el-card
      class="h-full !min-h-[calc(100vh-var(--top-tool-height)-var(--tags-view-height)-var(--app-footer-height))] overflow-auto"
    >
      <div class="h-5 relative">
        <div class="flex justify-end" @click.stop="toggleTableHeader">
          <Icon :icon="'vi-ep:grid'" />
        </div>
      </div>
      <el-drawer v-model="drawer2" :direction="direction">
        <template #header>
          <h4>请选择要展示的列：</h4>
        </template>
        <template #default>
          <div class="grid grid-flow-rows gap-2 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            <el-check-tag
              class="w-full text-center"
              v-for="(item, k) in showUncheckedTableHeaderlist"
              @change="onChange(item)"
              :key="k"
              >{{ item.label }}</el-check-tag
            >
          </div>
        </template>
      </el-drawer>
      <el-table :data="filterTableData" stripe style="width: 100%">
        <template v-for="(col, k) in columnList" :key="k">
          <el-table-column v-bind="col" v-if="col.isShow" align="center">
            <template #header>
              <div class="flex items-center justify-center gap-1">
                <span>{{ col.label }}</span>
                <el-popover
                  placement="bottom"
                  :width="200"
                  trigger="click"
                  popper-class="filter-popover"
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
                        @change="handleCheckAllChange($event, col.prop)"
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
              </div>
            </template>
            <template #default v-if="col.prop === 'operations'">
              <el-button type="primary" size="small">克隆</el-button>
              <el-tooltip placement="top" content="xxx">
                <el-button type="primary" size="small">编辑</el-button>
              </el-tooltip>
              <el-tooltip placement="top" content="xxx">
                <el-button type="primary" size="small">删除</el-button>
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
    </el-card>
  </el-card>
  <el-dialog v-model="isShowModal" title="Warning" width="500" align-center>
    <span>Open the dialog from the center from the screen</span>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="isShowModal = false">Cancel</el-button>
        <el-button type="primary" @click="isShowModal = false"> Confirm </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const value = ref('default')
const options = [
  {
    value: 'Option1',
    label: 'Option1'
  },
  {
    value: 'Option2',
    label: 'Option2'
  },
  {
    value: 'Option3',
    label: 'Option3'
  },
  {
    value: 'Option4',
    label: 'Option4'
  },
  {
    value: 'Option5',
    label: 'Option5'
  }
]
import type { DrawerProps } from 'element-plus'
// Table
interface User {
  // date: string
  name: string
  address: string
}

const search = ref('')

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

const isShowModal = ref<boolean>(false)

const columnList = ref<
  {
    label: string
    prop: string
    fixed?: string
    minWidth?: string
    isShow?: boolean
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

// 添加处理筛选确认的方法
const handleFilterConfirm = () => {
  // 关闭筛选弹出框
  const popoverRefs = document.querySelectorAll('.el-popover__reference')
  popoverRefs.forEach((ref: any) => {
    ref._popover?.hide()
  })
}

const changeOptionsData = (value: string) => {}
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
</style>
