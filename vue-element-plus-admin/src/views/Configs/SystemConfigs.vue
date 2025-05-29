<template>
  <el-card class="!min-h-[calc(100vh-var(--top-tool-height)-var(--tags-view-height)-var(--app-footer-height))]">
    <header class="flex justify-between items-center mb-4">
      <section class="flex gap-2">
        <el-button type="primary" @click="handleCreate">
          <template #icon>
            <Icon :icon="'vi-ep:plus'" />
          </template>
          创建新配置
        </el-button>
        <el-button type="danger" :disabled="selectedConfigs.length === 0" @click="handleBatchDelete">
          <template #icon>
            <Icon :icon="'vi-ep:delete'" />
          </template>
          批量删除 ({{ selectedConfigs.length }})
        </el-button>
      </section>
      <section class="flex gap-2 items-center">
        <el-input v-model="searchKeyword" placeholder="搜索配置名称..." style="width: 200px" clearable @input="handleSearch">
          <template #prefix>
            <Icon :icon="'vi-ep:search'" />
          </template>
        </el-input>
        <el-button @click="toggleColumnManager">
          <template #icon>
            <Icon :icon="'vi-ep:grid'" />
          </template>
          列管理
        </el-button>
      </section>
    </header>
    <main>
      <el-table v-loading="loading" :data="paginatedConfigs" stripe border style="width: 100%"
        @selection-change="handleSelectionChange" :height="tableHeight">
        <el-table-column type="selection" width="55" />
        <!-- 动态列 -->
        <template v-for="col in visibleColumns" :key="col.prop">
          <el-table-column v-if="col.isShow && col.prop !== 'operations'" :prop="col.prop" :label="col.label"
            :width="col.width" :min-width="col.minWidth" :fixed="col.fixed" align="center" show-overflow-tooltip>
            <template #header>
              <div class="flex items-center justify-center gap-1">
                <span>{{ col.label }}</span>
                <el-popover placement="bottom" :width="250" trigger="click" popper-class="filter-popover">
                  <template #reference>
                    <Icon :icon="'vi-ant-design:filter-outlined'"
                      class="cursor-pointer text-blue-500 hover:text-blue-700" @click.stop />
                  </template>
                  <div class="filter-content">
                    <header class="mb-2">
                      <el-checkbox :model-value="isAllSelected(col.prop)" :indeterminate="isIndeterminate(col.prop)"
                        @change="(val: boolean) => handleSelectAll(col.prop, val)">
                        全选
                      </el-checkbox>
                    </header>
                    <div class="max-h-48 overflow-y-auto">
                      <el-checkbox-group :model-value="getSelectedFilters(col.prop)"
                        @change="(values: string[]) => handleFilterChange(col.prop, values)">
                        <div v-for="item in getColumnValues(col.prop)" :key="item" class="mb-1">
                          <el-checkbox :label="item" :value="item">
                            {{ item }}
                          </el-checkbox>
                        </div>
                      </el-checkbox-group>
                    </div>
                    <footer class="flex justify-end mt-3 pt-2 border-t">
                      <el-button size="small" @click="clearFilter(col.prop)">
                        清除
                      </el-button>
                      <el-button type="primary" size="small" @click="applyFilter">
                        确认
                      </el-button>
                    </footer>
                  </div>
                </el-popover>
              </div>
            </template>

            <!-- 自定义单元格内容 -->
            <template #default="{ row }">
              <span v-if="col.prop.includes('.')">
                {{ getNestedValue(row, col.prop) }}
              </span>
              <span v-else>
                {{ row[col.prop] }}
              </span>
            </template>
          </el-table-column>
        </template>
        <!-- 操作列 -->
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="{ row }">
            <div class="flex gap-1">
              <el-button type="primary" size="small" @click="handleClone(row)">
                克隆
              </el-button>
              <el-button type="warning" size="small" @click="handleEdit(row)">
                编辑
              </el-button>
              <el-popconfirm title="确定要删除这个配置吗？" @confirm="handleDelete(row.id)">
                <template #reference>
                  <el-button type="danger" size="small">
                    删除
                  </el-button>
                </template>
              </el-popconfirm>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </main>
    <footer>
      <div class="flex justify-end mt-4">
        <el-pagination v-model:current-page="pagination.currentPage" v-model:page-size="pagination.pageSize"
          :page-sizes="pagination.pageSizes" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </footer>
  </el-card>
  <!-- 列管理抽屉 -->
  <el-drawer v-model="columnDrawerVisible" title="列管理" direction="rtl" size="45%">
    <div class="transfer-container">
      <!-- 统计信息 -->
      <div class="transfer-stats mb-4 p-3 bg-gray-50 rounded">
        <div class="flex justify-between text-sm text-gray-600">
          <span>可管理列数: {{ transferData.length }}</span>
          <span>
            已显示: {{ transferRightValue.length }} |
            已隐藏: {{ transferData.length - transferRightValue.length }}
          </span>
        </div>
      </div>
      <el-transfer v-model="transferRightValue" filterable :titles="['隐藏的列', '显示的列']" :data="transferData"
        @change="handleTransferChange" :props="{
          key: 'key',
          label: 'label',
          disabled: 'disabled'
        }" class="custom-transfer">
        <template #default="{ option }">
          <span class="transfer-item">
            {{ option.label }}
          </span>
        </template>
        <template #left-empty>
          <el-empty :image-size="60" description="所有列都已显示"></el-empty>
        </template>
        <template #right-empty>
          <el-empty :image-size="60" description="暂无显示列"></el-empty>
        </template>
      </el-transfer>

      <!-- 快捷操作按钮 -->
      <div class="transfer-actions mt-4 flex gap-2 justify-center">
        <el-button size="small" type="success" @click="showAllColumns">
          显示所有
        </el-button>
        <el-button size="small" type="warning" @click="hideAllColumns">
          隐藏所有
        </el-button>
        <el-button size="small" type="info" @click="resetColumns">
          重置默认
        </el-button>
      </div>
    </div>
  </el-drawer>

  <Dialog v-model="dialogVisible" :title="dialogTitle" width="60%" align-center @close="handleDialogClose">
    {{ formData }}
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="硬件名称" prop="name" required>
            <el-input v-model="formData.name" placeholder="请输入硬件名称" :disabled="isCloneMode" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="硬件类型" prop="type">
            <el-radio-group v-model="formData.type">
              <el-radio :value="type" v-for="type in Object.values(Type)">{{ type }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Cube算力" prop="matrix.float16.tflops">
            <el-input-number v-model="formData.matrix.float16.tflops" controls-position="right" :controls="false"
              style="width: 100%;" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Vector算力" prop="vector.float16.tflops">
            <el-input-number v-model="formData.vector.float16.tflops" controls-position="right" :controls="false"
              style="width: 100%;" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="显存容量" prop="men1.GiB">
            <el-input-number v-model="formData.men1.GiB" controls-position="right" :controls="false"
              style="width: 100%;" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="显存带宽" prop="men1.GiBps">
            <el-input-number v-model="formData.men1.GiBps" controls-position="right" :controls="false"
              style="width: 100%;" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Cube算力利用率" prop="men1.cube_calibration_coefficient">
            <el-input-number v-model="formData.men1.cube_calibration_coefficient" controls-position="right"
              :controls="false" style="width: 100%;" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Vector算力利用率" prop="men1.vector_calibration_coefficient">
            <el-input-number v-model="formData.men1.vector_calibration_coefficient" controls-position="right"
              :controls="false" style="width: 100%;" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="GPU内存容量" prop="men2.GiB">
            <el-input-number v-model="formData.men2.GiB" controls-position="right" :controls="false"
              style="width: 100%;" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="GPU内存带宽" prop="men2.GiBps">
            <el-input-number v-model="formData.men2.GiBps" controls-position="right" :controls="false"
              style="width: 100%;" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="性能模式" prop="processing_mode">
            <el-radio-group v-model="formData.processing_mode">
              <el-radio :value="mode" v-for="mode in Object.values(ProcessingMode)">{{ mode }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="handleDialogClose">取消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
        {{ isEditMode ? '更新' : '创建' }}
      </el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick, onBeforeMount } from 'vue'
import { useSystemConfigStore } from '@/store/modules/systemConfigs'
import { Dialog } from '@/components/Dialog'
import type { SystemConfig } from '@/store/types'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Type, ProcessingMode } from '@/store/types/index.d'

// Table表格的高度
const TABLE_HEIGHT = window.innerHeight - 260
// Store
const systemConfigStore = useSystemConfigStore()

// 响应式数据
const loading = computed(() => systemConfigStore.loading)
const paginatedConfigs = computed(() => systemConfigStore.paginatedConfigs)
const pagination = computed(() => systemConfigStore.pagination)
const visibleColumns = computed(() => systemConfigStore.visibleColumns)
const transferData = computed(() => systemConfigStore.getTransferData())
const transferRightValue = computed({
  get: () => systemConfigStore.getRightValue(),
  set: (value) => systemConfigStore.handleTransferChange(value)
})
// 页面状态
const columnDrawerVisible = ref(false)
const dialogVisible = ref(false)
const submitLoading = ref(false)
const searchKeyword = ref('')
const selectedConfigs = ref<SystemConfig[]>([])

// 表单相关
const formRef = ref()
const isEditMode = ref(false)
const isCloneMode = ref(false)

const formData = ref<Partial<SystemConfig>>({
  name: '',
  type: Type.gpu,
  matrix: {
    float16: {
      tflops: 100,
      calibration_coefficient: 0.5
    }
  },
  vector: {
    float16: {
      tflops: 50,
      calibration_coefficient: 0.5
    }
  },
  men1: {
    GiB: 16,
    GiBps: 500,
    cube_calibration_coefficient: 0.5,
    vector_calibration_coefficient: 0.5
  },
  men2: {
    GiB: 32,
    GiBps: 300
  },
  processing_mode: ProcessingMode.roofline
})

const formRules = {
  name: [
    { required: true, message: '请输入硬件名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择硬件类型', trigger: 'change' }
  ],
  processing_mode: [
    { required: true, message: '请选择硬件类型', trigger: 'change' }
  ]
}

const dialogTitle = computed(() => {
  if (isCloneMode.value) return '克隆配置'
  return isEditMode.value ? '编辑配置' : '创建配置'
})

// 搜索功能
const handleSearch = (value: string) => {
  if (value.trim()) {
    systemConfigStore.setFilter('name', value.trim())
  } else {
    systemConfigStore.clearFilter('name')
  }
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
  systemConfigStore.setSelectedConfigs(selection.map(item => item.id))
}

// 列管理
const toggleColumnManager = () => {
  console.log('Transfer data:', transferData.value)
  console.log('Right value:', transferRightValue.value)
  columnDrawerVisible.value = true
}

const handleTransferChange = (targetKeys: string[]) => {
  console.log('Transfer change:', targetKeys)
  systemConfigStore.handleTransferChange(targetKeys)
}

const showAllColumns = () => {
  const allKeys = systemConfigStore.columns
    .filter(col => col.prop !== 'operations')
    .map(col => col.prop)
  handleTransferChange(allKeys)
}

const hideAllColumns = () => {
  handleTransferChange([])
}

const resetColumns = () => {
  const defaultVisible = ['name', 'type', 'created_at', 'updated_at', 'matrix.float16.tflops']
  handleTransferChange(defaultVisible)
}

// 过滤相关 - 支持嵌套字段
const getColumnValues = (prop: string) => {
  const values = new Set()
  systemConfigStore.configs.forEach(config => {
    let value = config
    const props = prop.split('.')
    for (const p of props) {
      value = value?.[p]
    }
    if (value !== undefined && value !== null) {
      values.add(String(value))
    }
  })
  return Array.from(values) as string[]
}

const getSelectedFilters = (prop: string) => {
  const filterValue = systemConfigStore.filters[prop]
  return Array.isArray(filterValue) ? filterValue : []
}

const isAllSelected = (prop: string) => {
  const selected = getSelectedFilters(prop)
  const all = getColumnValues(prop)
  return selected.length === all.length && all.length > 0
}

const isIndeterminate = (prop: string) => {
  const selected = getSelectedFilters(prop)
  const all = getColumnValues(prop)
  return selected.length > 0 && selected.length < all.length
}

const handleSelectAll = (prop: string, checked: boolean) => {
  if (checked) {
    systemConfigStore.setFilter(prop, getColumnValues(prop))
  } else {
    systemConfigStore.clearFilter(prop)
  }
}

const handleFilterChange = (prop: string, values: string[]) => {
  if (values.length > 0) {
    systemConfigStore.setFilter(prop, values)
  } else {
    systemConfigStore.clearFilter(prop)
  }
}

const clearFilter = (prop: string) => {
  systemConfigStore.clearFilter(prop)
}

const applyFilter = () => {
  // 过滤会自动应用，这里可以关闭popover或显示消息
  ElMessage.success('过滤条件已应用')
}

// 获取嵌套对象的值
const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

// CRUD操作
const handleCreate = () => {
  // resetForm()
  isEditMode.value = false
  isCloneMode.value = false
  dialogVisible.value = true
}

const handleEdit = async (row: SystemConfig) => {
  console.log("handleEdit");
  try {
    const detail = await systemConfigStore.getConfigDetail(row.id)
    formData.value = {
      name: detail.name,
      type: detail.type,
      matrix: detail.matrix,
      vector: detail.vector,
      men1: detail.men1,
      men2: detail.men2,
      processing_mode: detail.processing_mode,
      netWorks: detail.netWorks || []
    }
    isEditMode.value = true
    isCloneMode.value = false
    dialogVisible.value = true
  } catch (error) {
    ElMessage.error('获取配置详情失败')
  }
}

const handleClone = async (row: SystemConfig) => {
  console.log("handleClone");
  try {
    const detail = await systemConfigStore.getConfigDetail(row.id)
    formData.value = {
      name: `${detail.name}_副本_${Date.now()}`,
      type: detail.type,
      matrix: detail.matrix,
      vector: detail.vector,
      men1: detail.men1,
      men2: detail.men2,
      processing_mode: detail.processing_mode,
      netWorks: detail.netWorks || []
    }
    isEditMode.value = false
    isCloneMode.value = true
    dialogVisible.value = true
  } catch (error) {
    ElMessage.error('获取配置详情失败')
  }
}

const handleDelete = async (id: string) => {
  try {
    await systemConfigStore.deleteConfig(id)
    ElMessage.success('删除成功')
    await systemConfigStore.fetchConfigs()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const handleBatchDelete = async () => {
  if (selectedConfigs.value.length === 0) {
    ElMessage.warning('请选择要删除的配置')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedConfigs.value.length} 个配置吗？`,
      '批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const deletePromises = selectedConfigs.value.map(config =>
      systemConfigStore.deleteConfig(config.id)
    )

    await Promise.all(deletePromises)
    ElMessage.success('批量删除成功')
    selectedConfigs.value = []
    await systemConfigStore.fetchConfigs()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

const handleSubmit = async () => {
  console.log("handleSubmit");

  if (!formRef.value) return
  try {
    await formRef.value.validate()
    submitLoading.value = true
    // 构建完整的SystemConfig对象
    const now = new Date().toISOString()
    const submitData: SystemConfig = {
      name: formData.value.name || '',
      type: formData.value.type || Type.gpu,
      created_at: isEditMode.value ? (formData.value.created_at || now) : now,
      updated_at: now,
      matrix: formData.value.matrix || {
        float16: { tflops: 100, calibration_coefficient: 0.5 }
      },
      vector: formData.value.vector || {
        float16: { tflops: 50, calibration_coefficient: 0.5 }
      },
      men1: formData.value.men1 || {
        GiB: 16,
        GiBps: 500,
        cube_calibration_coefficient: 0.5,
        vector_calibration_coefficient: 0.5
      },
      men2: formData.value.men2 || {
        GiB: 32,
        GiBps: 300
      },
      processing_mode: formData.value.processing_mode || 'fp32',
      netWorks: formData.value.netWorks || []
    }

    if (isEditMode.value) {
      // await systemConfigStore.updateConfig(currentEditId, submitData)
      ElMessage.success('更新成功')
    } else {
      console.log(submitData, "| submitData");
      await systemConfigStore.createConfig(submitData)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    await systemConfigStore.fetchConfigs()
  } catch (error) {
    console.error('Submit error:', error)
    ElMessage.error(isEditMode.value ? '更新失败' : '创建失败')
  } finally {
    submitLoading.value = false
  }
}

const resetForm = () => {
  console.log("resetForm");
  formData.value = {
    name: '',
    type: Type.gpu,
    created_at: '',
    updated_at: '',
    matrix: {
      float16: {
        tflops: 100,
        calibration_coefficient: 0.5
      }
    },
    vector: {
      float16: {
        tflops: 50,
        calibration_coefficient: 0.5
      }
    },
    men1: {
      GiB: 16,
      GiBps: 500,
      cube_calibration_coefficient: 0.5,
      vector_calibration_coefficient: 0.5
    },
    men2: {
      GiB: 32,
      GiBps: 300
    },
    processing_mode: 'fp32',
    netWorks: []
  }
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

const handleDialogClose = () => {
  dialogVisible.value = false
  resetForm()
}
// 封装动态监听表格高度的方法
const tableHeight = ref(TABLE_HEIGHT)
const handleResize = () => {
  tableHeight.value = TABLE_HEIGHT
}

// 生命周期
onMounted(async () => {
  window.addEventListener('resize', handleResize)
  await systemConfigStore.fetchConfigs()
})

onBeforeMount(() => {
  window.removeEventListener('resize', handleResize)
})

// 监听搜索关键词
watch(searchKeyword, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    handleSearch(newValue)
  }
})
</script>

<style lang="less" scoped>
.filter-content {
  .el-checkbox-group {
    .el-checkbox {
      display: block;
      margin-right: 0;
      margin-bottom: 8px;
    }
  }
}

:deep(.filter-popover) {
  padding: 16px;
}

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