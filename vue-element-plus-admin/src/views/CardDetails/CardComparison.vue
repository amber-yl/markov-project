<template>
  <el-card
    class="!min-h-[calc(100vh-var(--top-tool-height)-var(--tags-view-height)-var(--footer-card-height))] overflow-auto">
    <div class="flex flex-col gap-2">
      <section>
        <el-row :gutter="30" justify="center">
          <el-col :xs="24" :sm="24" :md="24" :lg="4" :xl="4" v-for="(item) in modelComporationStore.collapseList">
            <el-card>
              <el-divider content-position="left">
                <div class="w-full flex justify-center items-center gap-2 text-red-500">
                  <Icon :icon="item.iconName" :size="20" />
                  <span class="text-xl">{{ item.collapseName }}</span>
                </div>
              </el-divider>
              <p>{{ item.headerName }}</p>
            </el-card>
          </el-col>
        </el-row>
      </section>
      <section class="flex gap-1">
        <el-card class="flex-1">
          <section>
            <el-divider content-position="left">
              <div class="w-full flex justify-center items-center gap-2 text-red-500">
                <Icon :icon="'vi-ep:help-filled'" :size="20" />
                <span class="text-xl">Modeling Assessment</span>
              </div>
            </el-divider>
            <el-collapse v-model="activeNames" @change="handleChange" accordion>
              <el-collapse-item v-for="(item, idx) in modelComporationStore.collapseList" :name="item.collapseName"
                :key="idx">
                <template #title>
                  <div :class="['title-wrapper', { 'is-active': isActive === idx + 1 }]">
                    <h3>{{ item.headerName }}</h3>
                    <Icon :icon="item.iconName" :color="isActive === idx + 1 ? 'var(--el-color-primary)' : 'black'" />
                  </div>
                </template>
                <section v-if="isShowCart">
                  <el-table :data="modelComporationStore.getComporationTasks" stripe border
                    :header-row-style="{ color: 'black' }">
                    <el-table-column prop="params" width="180"></el-table-column>
                    <el-table-column :label="item"
                      v-for="item in modelComporationStore.comporationTasks.map((item) => item.model_names)">
                      <template #default="scope">
                        <p>{{ scope.row[item] || 'Not Defined' }}</p>
                      </template>
                    </el-table-column>
                  </el-table>
                </section>
                <section v-else>
                  <el-row :gutter="20" justify="center">
                    <el-col :xs="24" :sm="24" :md="24" :lg="12" :xl="6">
                      <el-card>
                        <el-skeleton :loading="loading" animated>
                          <Echart :options="pieOptionsData" ref="getEchartInstance" :height="300" />
                        </el-skeleton>
                      </el-card>
                    </el-col>
                  </el-row>
                </section>
              </el-collapse-item>
            </el-collapse>
          </section>
        </el-card>
      </section>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive, watch } from 'vue'
import { useModelComporationStore } from '@/store/modules/modelComporation'
import { Echart } from '@/components/Echart'
import { pieOptions } from './echarts-data'
import type { EChartsOption } from 'echarts'
const activeNames = ref(1)
const modelComporationStore = useModelComporationStore()
onMounted(() => {
  modelComporationStore.fetchTasks()
  setTimeout(() => {
    loading.value = false
  }, 1000)
})
const isActive = ref<number>(1)
const handleChange = (idx: number) => {
  isActive.value = idx
}

const loading = ref(true)
const pieOptionsData = reactive<EChartsOption>(pieOptions) as EChartsOption

const isShowCart = computed(() => {
  return activeNames.value !== 5
})

const getEchartInstance = ref<any>(null)
watch(activeNames, (newVal) => {
  if (newVal === 5) {
    // getEchartInstance.value[0]?.resizeHandler()
    console.log(getEchartInstance.value, '| getEchartInstance');
  }
})
</script>

<style lang="less" scoped>
.title-wrapper {
  display: flex;
  align-items: center;
  gap: 4px
}

.title-wrapper.is-active {
  color: var(--el-color-primary);
}
</style>
