<template>
  <el-table
    :data="displayViewModeList"
    style="width: 100%"
    @select="handleSelect"
    @select-all="handleSelect"
    @row-click="handleRowClick"
    @selection-change="handleSelectionChange"
    ref="tableRef"
  >
    <el-table-column v-if="props.isSelectionMode" type="selection" width="55" />
    <el-table-column fixed prop="name" label="Name" />
    <el-table-column prop="model" label="Model" />
    <el-table-column label="Status" prop="status">
      <template #default="scope">
        <section class="flex items-center gap-2">
          <Icon
            :icon="'vi-ant-design:check-circle-filled'"
            :color="scope.row.status === 'running' ? 'blue' : ''"
          />
          <span :style="{ color: scope.row.status === 'running' ? 'blue' : '' }">{{
            scope.row.status
          }}</span>
        </section>
      </template>
    </el-table-column>
    <el-table-column prop="hardware" label="Hardware" />
    <el-table-column prop="deployment" label="Deployment" />
    <el-table-column prop="createTime" label="CreateTime" />
    <el-table-column prop="updateTime" label="UpdateTime" />
    <el-table-column prop="creator" label="Creator" />
  </el-table>
</template>

<script setup lang="ts">
import type { Task } from '@/store/types'
import { ref, watch } from 'vue'
import type { ElTable } from 'element-plus'
const props = defineProps<{
  displayViewModeList?: Task[]
  loading?: boolean
  isSelectionMode?: boolean
}>()
const emit = defineEmits<{
  (e: 'select', task: Task[], checked?: boolean): void
  (e: 'detail', task: Task): void
}>()

const handleSelect = (task: Task[]) => {
  emit('select', task)
}

const handleRowClick = (row: Task) => {
  emit('detail', row)
}
const handleSelectionChange = (val: Task[]) => {
  console.log(val, '| val')

  // emit('select', val)
}
const tableRef: any = ref<InstanceType<typeof ElTable>>()
watch(
  () => props.isSelectionMode,
  (newValue) => {
    if (!newValue) {
      // 当退出选择模式时，清空所有选中状态
      tableRef?.value.clearSelection()
    }
  }
)
</script>

<style lang="less" scoped></style>
