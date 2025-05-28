import { ref, computed, watch } from 'vue'
import type { TableColumn } from '@/store/types'

interface TransferData {
  key: string
  label: string
  disabled?: boolean
}

export function useTableColumns(initialColumns: TableColumn[]) {
  const columns = ref<TableColumn[]>([...initialColumns])

  // 生成Transfer组件需要的数据格式
  const transferData = computed<TransferData[]>(() => {
    return columns.value
      .filter(col => col.prop !== 'operations') // 排除操作列
      .map(col => ({
        key: col.prop,
        label: col.label,
        disabled: false
      }))
  })

  // 右侧已选中的列（已显示的列）
  const rightValue = ref<string[]>(
    columns.value
      .filter(col => col.isShow && col.prop !== 'operations')
      .map(col => col.prop)
  )

  // 获取可见的列
  const visibleColumns = computed(() =>
    columns.value.filter(col => col.isShow)
  )

  // 获取隐藏的列
  const hiddenColumns = computed(() =>
    columns.value.filter(col => !col.isShow && col.prop !== 'operations')
  )

  // 处理Transfer组件的变化
  const handleTransferChange = (targetKeys: string[]) => {
    rightValue.value = targetKeys

    // 更新列的显示状态
    columns.value.forEach(col => {
      if (col.prop !== 'operations') {
        col.isShow = targetKeys.includes(col.prop)
      }
    })
  }

  // 设置单个列的可见性
  const setColumnVisibility = (prop: string, visible: boolean) => {
    const column = columns.value.find(col => col.prop === prop)
    if (column && column.prop !== 'operations') {
      column.isShow = visible

      // 同步更新rightValue
      if (visible && !rightValue.value.includes(prop)) {
        rightValue.value.push(prop)
      } else if (!visible) {
        const index = rightValue.value.indexOf(prop)
        if (index > -1) {
          rightValue.value.splice(index, 1)
        }
      }
    }
  }

  // 批量设置列的可见性
  const setColumnsVisibility = (props: string[]) => {
    columns.value.forEach(col => {
      if (col.prop !== 'operations') {
        col.isShow = props.includes(col.prop)
      }
    })
    rightValue.value = props
  }

  // 重置到默认状态
  const resetColumns = () => {
    columns.value = [...initialColumns]
    rightValue.value = columns.value
      .filter(col => col.isShow && col.prop !== 'operations')
      .map(col => col.prop)
  }

  // 显示所有列
  const showAllColumns = () => {
    const allProps = columns.value
      .filter(col => col.prop !== 'operations')
      .map(col => col.prop)
    setColumnsVisibility(allProps)
  }

  // 隐藏所有列（保留操作列）
  const hideAllColumns = () => {
    setColumnsVisibility([])
  }

  // 监听rightValue变化，同步更新列状态
  watch(rightValue, (newValue) => {
    columns.value.forEach(col => {
      if (col.prop !== 'operations') {
        col.isShow = newValue.includes(col.prop)
      }
    })
  }, { deep: true })

  return {
    columns,
    visibleColumns,
    hiddenColumns,
    transferData,
    rightValue,
    handleTransferChange,
    setColumnVisibility,
    setColumnsVisibility,
    resetColumns,
    showAllColumns,
    hideAllColumns
  }
} 