<template>
  <div class="runtime-config-demo">
    <el-row :gutter="24">
      <!-- 左侧表单 -->
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <h3>推理运行时配置</h3>
              <div class="actions">
                <el-button @click="resetForm">重置</el-button>
                <el-button type="primary" @click="validateAndSubmit">验证并提交</el-button>
              </div>
            </div>
          </template>

          <RuntimeSchemaForm ref="formRef" v-model="formData" @validate="onValidate" @search="onSearch"
            size="default" />
        </el-card>
      </el-col>

      <!-- 右侧数据预览 -->
      <el-col :span="8">
        <el-card>
          <template #header>
            <h4>表单数据预览</h4>
          </template>

          <div class="data-preview">
            <!-- 验证状态 -->
            <div class="validation-status">
              <el-tag
                :type="validationStatus === 'success' ? 'success' : validationStatus === 'error' ? 'danger' : 'info'"
                size="small">
                {{ validationStatusText }}
              </el-tag>
            </div>

            <!-- 数据展示 -->
            <div class="data-content">
              <el-collapse v-model="activeCollapse">
                <el-collapse-item title="基础信息" name="basic">
                  <div class="info-item">
                    <span class="label">名称:</span>
                    <span class="value">{{ formData.name || '-' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">类型:</span>
                    <span class="value">{{ formData.type || '-' }}</span>
                  </div>
                </el-collapse-item>

                <el-collapse-item title="运行时参数" name="runtime">
                  <div v-if="formData.runtime_details" class="runtime-details">
                    <div v-for="(value, key) in formData.runtime_details" :key="key" class="runtime-item">
                      <div class="runtime-key">{{ key }}:</div>
                      <div class="runtime-value">
                        <template v-if="Array.isArray(value)">
                          <el-tag v-for="(item, index) in value.slice(0, 3)" :key="index" size="small"
                            class="array-tag">
                            {{ typeof item === 'object' ? JSON.stringify(item).slice(0, 20) + '...' : item }}
                          </el-tag>
                          <span v-if="value.length > 3" class="more-count">
                            +{{ value.length - 3 }} more
                          </span>
                        </template>
                        <template v-else>
                          {{ value }}
                        </template>
                      </div>
                    </div>
                  </div>
                  <div v-else class="empty-data">暂无数据</div>
                </el-collapse-item>

                <el-collapse-item title="完整JSON" name="json">
                  <pre class="json-data">{{ JSON.stringify(formData, null, 2) }}</pre>
                </el-collapse-item>
              </el-collapse>
            </div>
          </div>
        </el-card>

        <!-- 操作说明 -->
        <el-card class="mt-4">
          <template #header>
            <h4>操作说明</h4>
          </template>

          <el-timeline size="small">
            <el-timeline-item timestamp="1. 基础信息" type="primary">
              填写推理运行时名称和类型，名称字段支持搜索功能
            </el-timeline-item>
            <el-timeline-item timestamp="2. 运行时参数" type="primary">
              配置详细的运行时参数，支持数组类型字段的添加/删除
            </el-timeline-item>
            <el-timeline-item timestamp="3. 验证提交" type="success">
              点击验证按钮检查表单数据，通过后可提交配置
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import RuntimeSchemaForm from './components/RuntimeSchemaForm.vue'

// 表单数据和状态
const formData = ref<any>({})
const formRef = ref()
const validationStatus = ref<'success' | 'error' | 'pending'>('pending')
const validationStatusText = ref('待验证')
const activeCollapse = ref(['basic', 'runtime'])

// 验证回调
const onValidate = (valid: boolean, fields?: any) => {
  if (valid) {
    validationStatus.value = 'success'
    validationStatusText.value = '验证通过'
    ElMessage.success('表单验证通过')
  } else {
    validationStatus.value = 'error'
    validationStatusText.value = '验证失败'
    ElMessage.error('表单验证失败，请检查必填字段')
    if (fields) {
      console.error('验证失败字段:', fields)
    }
  }
}

// 搜索回调
const onSearch = (keyword: string) => {
  console.log('搜索关键词:', keyword)
  ElMessage.info(`搜索: ${keyword}`)
  // 这里可以实现搜索逻辑，比如从API获取配置选项
}

// 验证并提交
const validateAndSubmit = async () => {
  if (!formRef.value) return

  try {
    const valid = await formRef.value.validate()
    if (valid) {
      // 模拟API提交
      const loadingMsg = ElMessage({
        message: '正在提交配置...',
        type: 'info',
        duration: 0
      })

      setTimeout(() => {
        loadingMsg.close()
        ElMessage.success('配置提交成功!')
        console.log('提交的配置数据:', formData.value)
      }, 1500)
    }
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败，请检查表单数据')
  }
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetForm()
    validationStatus.value = 'pending'
    validationStatusText.value = '待验证'
    ElMessage.info('表单已重置')
  }
}

// 监听表单数据变化
watch(
  () => formData.value,
  () => {
    validationStatus.value = 'pending'
    validationStatusText.value = '待验证'
  },
  { deep: true }
)
</script>

<style lang="less" scoped>
.runtime-config-demo {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    color: #303133;
  }

  .actions {
    display: flex;
    gap: 8px;
  }
}

.data-preview {
  .validation-status {
    margin-bottom: 16px;
    text-align: right;
  }

  .data-content {
    max-height: 600px;
    overflow-y: auto;
  }
}

.info-item {
  display: flex;
  margin-bottom: 8px;

  .label {
    font-weight: 500;
    color: #606266;
    width: 60px;
    flex-shrink: 0;
  }

  .value {
    color: #303133;
    word-break: break-word;
  }
}

.runtime-details {
  .runtime-item {
    margin-bottom: 12px;
    padding: 8px;
    background: #f8f9fa;
    border-radius: 4px;

    .runtime-key {
      font-size: 12px;
      color: #909399;
      margin-bottom: 4px;
    }

    .runtime-value {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      align-items: center;

      .array-tag {
        max-width: 150px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .more-count {
        font-size: 12px;
        color: #909399;
      }
    }
  }
}

.empty-data {
  color: #c0c4cc;
  text-align: center;
  padding: 20px;
  font-style: italic;
}

.json-data {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.4;
  color: #606266;
  max-height: 300px;
  overflow: auto;
  margin: 0;
}

:deep(.el-collapse-item__header) {
  font-weight: 500;
  color: #303133;
}

:deep(.el-timeline-item__timestamp) {
  color: #606266;
  font-weight: 500;
}
</style>