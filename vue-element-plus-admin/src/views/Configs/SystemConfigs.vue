<template>
  <el-card class="!min-h-[calc(100vh-var(--top-tool-height)-var(--tags-view-height)-var(--app-footer-height))]">
    <!-- Schema驱动的数据表格 -->
    <schema-table :schema="configSchema" :data="configs" :loading="loading" :height="tableHeight"
      :current-page="pagination.currentPage" :page-size="pagination.pageSize" :total="pagination.total"
      :page-sizes="pagination.pageSizes" create-button-text="创建新配置" search-placeholder="搜索配置名称..."
      @create="handleCreate" @edit="handleEdit" @clone="handleClone" @delete="handleDelete"
      @batch-delete="handleBatchDeleteFromTable" @search="handleSearch" @filter-change="handleFilterChange"
      @page-change="handleCurrentChange" @size-change="handleSizeChange" @selection-change="handleSelectionChange" />

    <!-- Schema驱动的表单对话框 -->
    <Dialog v-model="dialogVisible" :title="dialogTitle" width="60%" align-center @close="handleDialogClose">
      <schema-form ref="schemaFormRef" :schema="configSchema" v-model="formData" @validate="handleFormValidate" />
      <template #footer>
        <el-button @click="handleDialogClose">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          {{ isEditMode ? '更新' : '创建' }}
        </el-button>
      </template>
    </Dialog>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useSystemConfigStore } from '@/store/modules/systemConfigs'
import { Dialog } from '@/components/Dialog'
import SchemaTable from '@/components/SchemaTable/index.vue'
import SchemaForm from '@/components/SchemaForm/index.vue'
import type { SystemConfig } from '@/types/system_config'
import { ElMessage, ElMessageBox } from 'element-plus'

// Table表格的高度
const TABLE_HEIGHT = window.innerHeight - 260

// Store
const systemConfigStore = useSystemConfigStore()

// 响应式数据
const loading = computed(() => systemConfigStore.loading)
const configs = computed(() => systemConfigStore.configs)
const pagination = computed(() => systemConfigStore.pagination)
const configSchema = computed(() => systemConfigStore.schemeConfigs)

// 页面状态
const dialogVisible = ref(false)
const submitLoading = ref(false)
const selectedConfigs = ref<SystemConfig[]>([])
const schemaFormRef = ref()

// 表单相关
const isEditMode = ref(false)
const isCloneMode = ref(false)
const currentEditId = ref<string | null>(null)
const formData = ref<any>({})
const formValid = ref(false)

const dialogTitle = computed(() => {
  if (isCloneMode.value) return '克隆配置'
  return isEditMode.value ? '编辑配置' : '创建配置'
})

// 搜索功能
const handleSearch = (keyword: string) => {
  systemConfigStore.setFilter('name', keyword.trim() || null)
}

// 分页处理
const handleSizeChange = (size: number) => {
  systemConfigStore.setPagination({ pageSize: size, currentPage: 1 })
}

const handleCurrentChange = (page: number) => {
  systemConfigStore.setPagination({ currentPage: page })
}

// 选择处理
const handleSelectionChange = (selection: SystemConfig[]) => {
  selectedConfigs.value = selection
  systemConfigStore.setSelectedConfigs(selection.map((item) => item.id!))
}

// 筛选处理
const handleFilterChange = (filters: Record<string, any>) => {
  Object.keys(filters).forEach((key) => {
    systemConfigStore.setFilter(key, filters[key])
  })
}

// CRUD操作
const handleCreate = () => {
  resetForm()
  isEditMode.value = false
  isCloneMode.value = false
  dialogVisible.value = true
}

const handleEdit = async (row: SystemConfig) => {
  try {
    const detail = await systemConfigStore.getConfigDetail(row.id!)
    formData.value = { ...detail }
    currentEditId.value = row.id!
    isEditMode.value = true
    isCloneMode.value = false
    dialogVisible.value = true
  } catch (error) {
    console.error('获取配置详情失败:', error)
  }
}

const handleClone = async (row: SystemConfig) => {
  try {
    const detail = await systemConfigStore.getConfigDetail(row.id!)
    formData.value = {
      ...detail,
      name: `${detail.name}_副本_${Date.now()}`
    }
    // 清除不需要的字段
    delete formData.value.id
    delete formData.value.created_at
    delete formData.value.updated_at

    isEditMode.value = false
    isCloneMode.value = true
    dialogVisible.value = true
  } catch (error) {
    console.error('获取配置详情失败:', error)
  }
}

const handleDelete = async (row: SystemConfig) => {
  try {
    await systemConfigStore.deleteConfigs([row.id!])
  } catch (error) {
    console.error('删除失败:', error)
  }
}

const handleBatchDeleteFromTable = async (rows: SystemConfig[]) => {
  await handleBatchDelete(rows)
}

const handleBatchDelete = async (rows: SystemConfig[]) => {
  if (rows.length === 0) {
    ElMessage.warning('请选择要删除的配置')
    return
  }

  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${rows.length} 个配置吗？`, '批量删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const ids = rows.map((config) => config.id!)
    await systemConfigStore.deleteConfigs(ids)
    selectedConfigs.value = []
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
    }
  }
}

const handleSubmit = async () => {
  if (!schemaFormRef.value) return

  try {
    const valid = await schemaFormRef.value.validate()
    if (!valid) return

    submitLoading.value = true

    // 构建提交数据
    const submitData = { ...formData.value }

    if (isEditMode.value && currentEditId.value) {
      await systemConfigStore.updateConfig(currentEditId.value, submitData)
    } else {
      await systemConfigStore.createConfig(submitData)
    }

    dialogVisible.value = false
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    submitLoading.value = false
  }
}

const resetForm = () => {
  formData.value = {}
  currentEditId.value = null
  formValid.value = false
}

const handleDialogClose = () => {
  dialogVisible.value = false
  resetForm()
}

const handleFormValidate = (valid: boolean) => {
  formValid.value = valid
}

// 封装动态监听表格高度的方法
const tableHeight = ref(TABLE_HEIGHT)
const handleResize = () => {
  tableHeight.value = window.innerHeight - 260
}

// 生命周期
onMounted(async () => {
  window.addEventListener('resize', handleResize)
  // 先获取Schema配置，再获取数据
  await systemConfigStore.fetchSchemaConfigs()
  await systemConfigStore.fetchConfigs()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="less" scoped>
// Schema组件自带样式，这里可以保持简洁</style>
