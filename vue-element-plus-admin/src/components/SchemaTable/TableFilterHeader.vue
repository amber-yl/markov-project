<template>
  <div class="flex items-center justify-center gap-1">
    <span>{{ label }}</span>
    <el-popover placement="bottom" :width="250" trigger="click" :ref="(el: any) => handlePopoverRef(el)"
      @show="handleInitFilter">
      <template #reference>
        <Icon icon="vi-ant-design:filter-outlined" class="cursor-pointer text-blue-500 hover:text-blue-700"
          @click.stop />
      </template>
      <schema-table-filter :column="column" :data="tableData" :current-filter="currentFilter"
        @filter-change="handleFilterChange" @filter-confirm="handleFilterConfirm" @filter-clear="handleFilterClear" />
    </el-popover>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@/components/Icon'
import SchemaTableFilter from './SchemaTableFilter.vue'

interface Props {
  label: string
  column: any
  prop: string
  tableData: any[]
  currentFilter: any[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'filter-change': [prop: string, values: any[]]
  'filter-confirm': [prop: string]
  'filter-clear': [prop: string]
  'popover-ref': [el: any, prop: string]
  'init-temp-filter': [prop: string]
}>()

const handlePopoverRef = (el: any) => {
  emit('popover-ref', el, props.prop)
}

const handleInitFilter = () => {
  emit('init-temp-filter', props.prop)
}

const handleFilterChange = (propKey: string, values: any[]) => {
  emit('filter-change', props.prop, values)
}

const handleFilterConfirm = (propKey: string) => {
  emit('filter-confirm', props.prop)
}

const handleFilterClear = (propKey: string) => {
  emit('filter-clear', props.prop)
}
</script>