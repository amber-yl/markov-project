<template>
  <div class="schema-table">
    <!-- 表格头部操作区 -->
    <div class="table-header" v-if="showHeader">
      <div class="header-left">
        <slot name="headerLeft" :selectedRows="selectedRows">
          <el-button v-if="enableCreate" type="primary" @click="handleCreate">
            <Icon icon="vi-ep:plus" />
            {{ createButtonText }}
          </el-button>
          <el-button v-if="enableBatchDelete" type="danger" :disabled="selectedRows.length === 0"
            @click="handleBatchDelete">
            <Icon icon="vi-ep:delete" />
            批量删除 ({{ selectedRows.length }})
          </el-button>
        </slot>
      </div>
      <div class="header-right">
        <slot name="headerRight">
          <el-input v-if="enableSearch" v-model="searchKeyword" :placeholder="searchPlaceholder" style="width: 200px"
            clearable @input="handleSearch">
            <template #prefix>
              <Icon icon="vi-ep:search" />
            </template>
          </el-input>
          <el-button v-if="enableColumnManager" @click="toggleColumnManager">
            <Icon icon="vi-ep:grid" />
            列管理
          </el-button>
        </slot>
      </div>
    </div>
    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="tableData" stripe border style="width: 100%" :height="height"
      @selection-change="handleSelectionChange">
      <!-- 选择列 -->
      <el-table-column v-if="enableSelection" type="selection" width="55" />

      <!-- 动态列 -->
      <template v-for="column in visibleColumns" :key="column.prop">
        <el-table-column :prop="column.prop" :label="column.label" :width="column.width" :min-width="column.minWidth"
          :fixed="column.fixed" :sortable="column.sortable" align="center" show-overflow-tooltip>
          <!-- 表头带筛选 -->
          <template #header v-if="column.filterable">
            <div class="flex items-center justify-center gap-1">
              <span>{{ column.label }}</span>
              <el-popover placement="bottom" :width="250" trigger="click"
                :ref="(el: any) => setPopoverRef(el, column.prop)" @show="initTempFilter(column.prop)">
                <template #reference>
                  <Icon icon="vi-ant-design:filter-outlined" class="cursor-pointer text-blue-500 hover:text-blue-700"
                    @click.stop />
                </template>
                <schema-table-filter :column="column" :data="tableData" :current-filter="getCurrentFilter(column.prop)"
                  @filter-change="handleFilterChange" @filter-confirm="handleFilterConfirm"
                  @filter-clear="handleFilterClear" />
              </el-popover>
            </div>
          </template>
          <!-- 单元格内容 -->
          <template #default="{ row }">
            <schema-table-cell :value="getNestedValue(row, column.prop)" :column="column" :row="row" />
          </template>
        </el-table-column>
      </template>

      <template v-for="column in visibleNetWorksColumns" :key="column.prop">
        <el-table-column :label="column.label" :fixed="column.fixed" :sortable="column.sortable" align="center"
          show-overflow-tooltip>
          <!-- 动态渲染网络子列 -->
          <template v-for="(subColumn, index) in networkSubColumns" :key="`${column.prop}-${index}`">
            <el-table-column :label="subColumn.label" :prop="column.prop"
              :width="getSubColumnWidth(column.width, networkSubColumns.length)"
              :min-width="getSubColumnWidth(column.minWidth, networkSubColumns.length)" :fixed="column.fixed"
              :sortable="column.sortable" align="center" show-overflow-tooltip>

              <!-- 表头带筛选 -->
              <template #header v-if="column.filterable">
                <table-filter-header :label="subColumn.label" :column="column" :prop="`${column.prop}-${index}`"
                  :table-data="tableData" :current-filter="getCurrentFilter(`${column.prop}-${index}`)"
                  @filter-change="handleFilterChange" @filter-confirm="handleFilterConfirm"
                  @filter-clear="handleFilterClear" @popover-ref="setPopoverRef" @init-temp-filter="initTempFilter" />
              </template>

              <!-- 单元格内容 -->
              <template #default="{ row }">
                <el-tag size="small" class="array-tag">
                  {{ getNetworkValue(row, column.prop, index) }}
                </el-tag>
              </template>
            </el-table-column>
          </template>
        </el-table-column>
      </template>

      <!-- 操作列 -->
      <el-table-column v-if="enableOperations" label="操作" :width="operationWidth" fixed="right" align="center">
        <template #default="{ row }">
          <slot name="operations" :row="row">
            <div class="flex gap-1">
              <el-button v-if="enableClone" type="primary" size="small" @click="handleClone(row)">
                克隆
              </el-button>
              <el-button v-if="enableEdit" type="warning" size="small" @click="handleEdit(row)">
                编辑
              </el-button>
              <el-popconfirm title="确定要删除这条记录吗？" @confirm="handleDelete(row)">
                <template #reference>
                  <el-button v-if="enableDelete" type="danger" size="small">
                    删除
                  </el-button>
                </template>
              </el-popconfirm>
            </div>
          </slot>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div v-if="enablePagination" class="pagination-wrapper">
      <el-pagination v-model:current-page="localCurrentPage" v-model:page-size="localPageSize" :page-sizes="pageSizes"
        :total="total" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
        @current-change="handleCurrentChange" />
    </div>

    <!-- 列管理抽屉 -->
    <el-drawer v-model="columnDrawerVisible" title="列管理" direction="rtl" size="45%">
      <schema-table-column-manager />
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Icon } from '@/components/Icon'
import SchemaTableCell from './SchemaTableCell.vue'
import SchemaTableFilter from './SchemaTableFilter.vue'
import SchemaTableColumnManager from './SchemaTableColumnManager.vue'
import TableFilterHeader from './TableFilterHeader.vue'

interface Column {
  prop: string
  label: string
  minWidth?: number
  width?: number
  fixed?: string
  sortable?: boolean
  filterable?: boolean
  filterType?: string
  formatter?: string
  defaultHidden?: boolean
}

interface Props {
  schema: any
  data: any[]
  loading?: boolean
  height?: string | number
  showHeader?: boolean
  enableSelection?: boolean
  enableCreate?: boolean
  enableEdit?: boolean
  enableClone?: boolean
  enableDelete?: boolean
  enableBatchDelete?: boolean
  enableSearch?: boolean
  enableColumnManager?: boolean
  enableOperations?: boolean
  enablePagination?: boolean
  createButtonText?: string
  searchPlaceholder?: string
  operationWidth?: number
  // 分页相关
  currentPage?: number
  pageSize?: number
  total?: number
  pageSizes?: number[]
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  showHeader: true,
  enableSelection: true,
  enableCreate: true,
  enableEdit: true,
  enableClone: true,
  enableDelete: true,
  enableBatchDelete: true,
  enableSearch: true,
  enableColumnManager: true,
  enableOperations: true,
  enablePagination: true,
  createButtonText: '创建',
  searchPlaceholder: '搜索...',
  operationWidth: 200,
  currentPage: 1,
  pageSize: 10,
  total: 0,
  pageSizes: () => [10, 20, 50, 100]
})

const emit = defineEmits<{
  'create': []
  'edit': [row: any]
  'clone': [row: any]
  'delete': [row: any]
  'batch-delete': [rows: any[]]
  'search': [keyword: string]
  'filter-change': [filters: Record<string, any>]
  'page-change': [page: number]
  'size-change': [size: number]
  'selection-change': [selection: any[]]
  'update:current-page': [page: number]
  'update:page-size': [size: number]
}>()

// 响应式数据
const searchKeyword = ref('')
const selectedRows = ref<any[]>([])
const columnDrawerVisible = ref(false)
const popoverRefs = ref<Map<string, any>>(new Map())
const tempFilters = ref<Record<string, any>>({})
const currentFilters = ref<Record<string, any>>({})

// 本地分页状态
const localCurrentPage = ref(props.currentPage)
const localPageSize = ref(props.pageSize)

// 筛选相关
const getCurrentFilter = (prop: string) => {
  return currentFilters.value[prop] || []
}

const initTempFilter = (prop: string) => {
  if (!tempFilters.value[prop]) {
    tempFilters.value[prop] = [...(currentFilters.value[prop] || [])]
  }
}

const handleFilterChange = (prop: string, values: any[]) => {
  tempFilters.value[prop] = values
}

const handleFilterConfirm = (prop: string) => {
  currentFilters.value[prop] = [...(tempFilters.value[prop] || [])]
  emit('filter-change', currentFilters.value)

  // 隐藏popover
  const popover = popoverRefs.value.get(prop)
  if (popover) {
    popover.hide()
  }
}

const handleFilterClear = (prop: string) => {
  delete currentFilters.value[prop]
  delete tempFilters.value[prop]
  emit('filter-change', currentFilters.value)
}

// 从Schema获取列配置
const allColumns = computed<Column[]>(() => {
  const columns = props.schema.uiConfig?.table?.columns || []
  return columns
})

// 可见列除了NetWorks
const visibleColumns = computed(() => {
  return allColumns.value.filter(col => !col.defaultHidden && col.prop !== 'networks')
})
// 可见列仅显示NetWorks
const visibleNetWorksColumns = computed(() => {
  return allColumns.value.filter(col => !col.defaultHidden && col.prop === 'networks')
})

// 表格数据
const tableData = computed(() => props.data)

// 工具函数
const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

const setPopoverRef = (el: any, prop: string) => {
  if (el) {
    popoverRefs.value.set(prop, el)
  }
}

// 监听props变化，更新本地状态
watch(() => props.currentPage, (newVal) => {
  localCurrentPage.value = newVal
}, { immediate: true })

watch(() => props.pageSize, (newVal) => {
  localPageSize.value = newVal
}, { immediate: true })

// 事件处理
const handleCreate = () => {
  emit('create')
}

const handleEdit = (row: any) => {
  emit('edit', row)
}

const handleClone = (row: any) => {
  emit('clone', row)
}

const handleDelete = (row: any) => {
  emit('delete', row)
}

const handleBatchDelete = () => {
  emit('batch-delete', selectedRows.value)
}

const handleSearch = (keyword: string) => {
  emit('search', keyword)
}

const handleSelectionChange = (selection: any[]) => {
  selectedRows.value = selection
  emit('selection-change', selection)
}

const handleSizeChange = (size: number) => {
  localPageSize.value = size
  emit('size-change', size)
  emit('update:page-size', size)
}

const handleCurrentChange = (page: number) => {
  localCurrentPage.value = page
  emit('page-change', page)
  emit('update:current-page', page)
}

// 列管理
const toggleColumnManager = () => {
  columnDrawerVisible.value = true
}

// 网络子列相关
const networkSubColumns = computed(() => {
  // 如果schema中没有配置网络子列，使用默认配置
  return props.schema.uiConfig?.table?.networkSubColumns || [
    { label: '节点内带宽', key: 'internal' },
    { label: '节点间带宽', key: 'external' }
  ]
})

const getSubColumnWidth = (width?: number, count: number = 1) => {
  if (width && count > 1) {
    return Math.floor(width / count)
  }
  return width
}

const getNetworkValue = (row: any, prop: string, index: number) => {
  const value = row[prop]
  if (Array.isArray(value) && value.length > index) {
    return value[index]
  }
  return '-'
}
</script>

<style lang="less" scoped>
.schema-table {
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .header-left,
    .header-right {
      display: flex;
      gap: 8px;
      align-items: center;
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }

  .array-tag {
    margin: 2px;
    padding: 4px 8px;
    font-size: 12px;
    border-radius: 4px;
    background-color: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
    border: 1px solid var(--el-color-primary-light-8);

    &:hover {
      background-color: var(--el-color-primary-light-8);
    }
  }

  :deep(.el-table) {
    .el-table__header-wrapper {
      .el-table__header {
        th {
          background-color: var(--el-color-primary-light-9);
          color: var(--el-text-color-primary);
          font-weight: 600;
        }
      }
    }

    .el-table__body-wrapper {
      .el-table__row {
        &:hover {
          background-color: var(--el-color-primary-light-9);
        }
      }
    }
  }

  .flex {
    display: flex;

    &.items-center {
      align-items: center;
    }

    &.justify-center {
      justify-content: center;
    }

    &.gap-1 {
      gap: 4px;
    }
  }

  .cursor-pointer {
    cursor: pointer;
  }

  .text-blue-500 {
    color: var(--el-color-primary);

    &:hover {
      color: var(--el-color-primary-dark-2);
    }
  }
}
</style>