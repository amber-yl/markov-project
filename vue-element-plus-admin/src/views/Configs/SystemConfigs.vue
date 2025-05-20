<template>
  <el-card class="!min-h-[calc(100vh-var(--top-tool-height)-var(--tags-view-height)-var(--app-footer-height))]">
    <el-card class="mb-4">
      <div class="flex justify-between w-full">
        <el-select v-model="value" clearable placeholder="Select" style="width: 240px">
          <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-button type="primary" @click="isShowModal = !isShowModal">Create New File</el-button>
      </div>
    </el-card>
    <el-card
      class="h-full !min-h-[calc(100vh-var(--top-tool-height)-var(--tags-view-height)-var(--app-footer-height))] overflow-auto">
      <div class="flex justify-end" @click="toggleTableHeader">
        <Icon :icon="'vi-ep:grid'" />
      </div>
      <el-drawer v-model="drawer2" :direction="direction">
        <template #header>
          <h4>请选择要展示的列：</h4>
        </template>
        <template #default>
          <div class="grid grid-flow-rows gap-2 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            <el-check-tag class="w-full text-center" v-for="(item, k) in showUncheckedTableHeaderlist"
              @change="onChange(item)" :key="k">{{ item.label
              }}</el-check-tag>
          </div>
        </template>
      </el-drawer>
      <el-table :data="tableData" stripe style="width: 100%">
        <template v-for="(col, k) in columnList" :key="k">
          <el-table-column v-bind="col" v-if="col.isShow" align="center">
            <template #header>
              <div class="flex items-center justify-center gap-1">
                <span>{{ col.label }}</span>
                <Icon :icon="'vi-ep:grid'" />
              </div>
            </template>
            <template #default v-if="col.prop === 'operations'">
              <el-button link type="primary" size="small">
                Detail
              </el-button>
              <el-button link type="primary" size="small">Edit</el-button>
            </template>
          </el-table-column>
        </template>
      </el-table>
      <div class="flex justify-end mt-10">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 30, 40]"
          :small="true" :total="total" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </el-card>
  </el-card>
  <el-dialog v-model="isShowModal" title="Warning" width="500" align-center>
    <span>Open the dialog from the center from the screen</span>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="isShowModal = false">Cancel</el-button>
        <el-button type="primary" @click="isShowModal = false">
          Confirm
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  ElCard,
  ElSelect,
  ElOption,
  ElDialog,
  ElButton,
  ElTable,
  ElTableColumn,
  ElPagination,
  ElDrawer,
  ElCheckTag,
} from 'element-plus'
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
    tag: 'Home',
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
    tag: 'Office',
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
    tag: 'Home',
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
    tag: 'Office',
  },
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

// 修改 filterTableData 的计算属性
const filterTableData = computed(() => {
  const filtered = tableData.filter(
    (data) => !search.value || data.name.toLowerCase().includes(search.value.toLowerCase())
  )
  total.value = filtered.length
  const startIndex = (currentPage.value - 1) * pageSize.value
  return filtered.slice(startIndex, startIndex + pageSize.value)
})

const isShowModal = ref<boolean>(false)

const columnList = ref<{
  label: string,
  prop: string,
  fixed?: string,
  minWidth?: string,
  isShow?: boolean,
}[]>([
  { label: 'Date', prop: 'date', isShow: true, fixed: 'left', minWidth: '50' },
  { label: 'Name', prop: 'name', isShow: true, minWidth: '50' },
  { label: 'Address', prop: 'address', isShow: true, minWidth: '100' },
  { label: 'Zip', prop: 'zip', isShow: false, minWidth: '50' },
  { label: 'Tag', prop: 'tag', isShow: false, minWidth: '50' },
  { label: 'Operations', prop: 'operations', fixed: 'right', minWidth: '100', isShow: true },
])

const drawer2 = ref(false)
const direction = ref<DrawerProps['direction']>('rtl')
function toggleTableHeader() {
  drawer2.value = true
}


const onChange = (uncheckeditem: {
  label: string,
  prop: string,
  fixed?: string,
  minWidth?: string,
  isShow?: boolean,
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
</script>

<style lang="less" scoped>
.box-border {
  :deep(.el-card) {
    height: 100%;
  }

  :deep(.el-card__body) {
    height: 100%;
    padding: 20px;
  }
}
</style>
