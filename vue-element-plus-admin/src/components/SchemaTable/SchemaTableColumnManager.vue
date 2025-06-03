<template>
  <div class="schema-table-column-manager">
    <!-- 统计信息 -->
    <div class="stats mb-4 p-3 bg-gray-50 rounded">
      <div class="flex justify-between text-sm text-gray-600">
        <span>可管理列数: {{ transferData.length }}</span>
        <span>
          已显示: {{ transferRightValue.length }} |
          已隐藏: {{ transferData.length - transferRightValue.length }}
        </span>
      </div>
    </div>

    <!-- 列管理器 -->
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
    <div class="actions mt-4 flex gap-2 justify-center">
      <el-button size="small" type="success" @click="showAllColumns">
        显示所有
      </el-button>
      <el-button size="small" type="warning" @click="hideAllColumns">
        隐藏所有
      </el-button>
      <el-button size="small" type="info" @click="resetToDefault">
        重置默认
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSystemConfigStore } from '@/store/modules/systemConfigs'
import { defaultVisible } from '@/store/config'

// interface Column {
//   prop: string
//   label: string
//   defaultHidden?: boolean
//   [key: string]: any
// }
// interface Props {
//   columns: Column[]
//   visibleColumns: Column[]
// }
// const props = defineProps<Props>()
// const emit = defineEmits<{
//   'column-change': [visibleProps: string[]]
// }>()

const systemConfigStore = useSystemConfigStore()
const transferRightValue = computed({
  get: () => systemConfigStore.getRightValue(),
  set: (value) => systemConfigStore.handleTransferChange(value)
})

// Transfer数据
const transferData = computed(() => systemConfigStore.getTransferData())
// 处理变化
const handleTransferChange = (targetKeys: string[]) => {
  systemConfigStore.handleTransferChange(targetKeys)
}
// 默认展示的列
const defaultVisibleColumns = ref<any>()
defaultVisibleColumns.value = defaultVisible

// 显示所有列
const showAllColumns = () => {
  const allKeys = transferData.value.map(item => item.key)
  handleTransferChange(allKeys)
}

// 隐藏所有列
const hideAllColumns = () => {
  handleTransferChange([])
}

// 重置为默认
const resetToDefault = () => {
  // const defaultVisible = systemConfigStore.schemeConfigs.uiConfig?.table?.columns
  //   .filter(col => !col.defaultHidden && col.prop !== 'operations')
  //   .map(col => col.prop)
  handleTransferChange(defaultVisibleColumns.value)
}

</script>

<style lang="less" scoped>
.schema-table-column-manager {
  padding: 20px;

  .stats {
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

  .actions {
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
}
</style>