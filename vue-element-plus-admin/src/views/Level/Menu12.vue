<template>
  <el-button plain @click="centerDialogVisible = true"> Click to open the Dialog </el-button>

  <el-dialog
    v-model="centerDialogVisible"
    title="Warning"
    width="500"
    align-center
    class="menu12__custom-dialog h-full"
  >
    <div class="flex">
      <div class="flex flex-col mr-6">
        <button v-for="item in 10" :key="item">{{ item }}</button>
      </div>
      <div class="h-full">
        <ul>
          <li v-for="item in 20" :key="item">{{ item }}</li>
        </ul>
      </div>
    </div>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { ElButton, ElDialog } from 'element-plus'

const centerDialogVisible = ref(false)
</script>

<style scoped>
.menu12__custom-dialog {
  .el-dialog__body {
    height: 100%;
  }
}
</style>
