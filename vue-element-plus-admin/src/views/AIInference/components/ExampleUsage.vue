<template>
  <div class="example-usage">
    <el-card>
      <template #header>
        <h3>推理运行时配置表单示例</h3>
      </template>

      <RuntimeSchemaForm ref="formRef" v-model="formData" @validate="onValidate" @search="onSearch" size="default" />

      <div class="actions" style="margin-top: 20px">
        <el-button type="primary" @click="validateForm">验证表单</el-button>
        <el-button @click="resetForm">重置表单</el-button>
        <el-button type="success" @click="submitForm">提交表单</el-button>
      </div>

      <div class="form-data" style="margin-top: 20px">
        <el-divider>当前表单数据</el-divider>
        <pre>{{ JSON.stringify(formData, null, 2) }}</pre>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import RuntimeSchemaForm from './RuntimeSchemaForm.vue'

const formData = ref<any>({})
const formRef = ref()

const onValidate = (valid: boolean, fields?: any) => {
  if (valid) {
    ElMessage.success('表单验证通过')
  } else {
    ElMessage.error('表单验证失败')
    console.error('验证失败字段:', fields)
  }
}

const onSearch = (keyword: string) => {
  console.log('搜索关键词:', keyword)
  // 这里可以实现搜索逻辑，比如过滤配置选项
}

const validateForm = async () => {
  if (formRef.value) {
    const valid = await formRef.value.validate()
    if (valid) {
      ElMessage.success('表单验证通过')
    }
  }
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetForm()
    ElMessage.info('表单已重置')
  }
}

const submitForm = async () => {
  if (formRef.value) {
    const valid = await formRef.value.validate()
    if (valid) {
      try {
        // 这里可以调用API提交数据
        console.log('提交的数据:', formData.value)
        ElMessage.success('提交成功')
      } catch (error) {
        ElMessage.error('提交失败')
        console.error(error)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.example-usage {
  padding: 20px;
}

.actions {
  display: flex;
  gap: 12px;
}

.form-data {
  pre {
    background: #f5f7fa;
    padding: 16px;
    border-radius: 4px;
    font-size: 12px;
    max-height: 300px;
    overflow: auto;
  }
}
</style>