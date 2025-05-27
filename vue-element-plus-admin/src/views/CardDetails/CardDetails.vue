<template>
  <el-card
    class="!min-h-[calc(100vh-var(--top-tool-height)-var(--tags-view-height)-var(--footer-card-height))] overflow-auto">
    <div class="flex flex-col gap-1">
      <section>
        <el-card>
          <div class="flex items-baseline gap-3">
            <h2>{{ t('cardDetails.title') }}</h2>
            <Icon class="markov-icon-hover" :icon="'vi-ant-design:fund-outlined'" color="green" />
            <Icon class="markov-icon-hover" :icon="'vi-tdesign:chart'" color="green" />
          </div>
        </el-card>
      </section>
      <section v-if="isShowConfigurationSearch">
        <el-card>
          <el-divider content-position="left">
            <div class="w-full flex justify-center items-center gap-2 text-red-500">
              <Icon :icon="'vi-ep:help-filled'" :size="20" />
              <span class="text-xl">Configuration Selector</span>
            </div>
          </el-divider>
          <el-row :gutter="5">
            <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="4">
              <el-card>
                <el-select v-model="value" clearable placeholder="Select">
                  <el-option v-for="item in options" :key="item.value" :value="item.value" />
                </el-select>
              </el-card>
            </el-col>
            <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="4">
              <el-card>
                <el-select v-model="value1" clearable placeholder="Select">
                  <el-option v-for="item in options1" :key="item.value" :value="item.value" />
                </el-select>
              </el-card>
            </el-col>
          </el-row>
        </el-card>
      </section>
      <section class="flex gap-1">
        <el-card class="flex-1">
          <h1 class="mb-2">Basic Information</h1>
          <el-row :gutter="20">
            <el-col :xs="24" :sm="24" :md="24" :lg="8" :xl="8">
              <el-card>
                <p>Model参数</p>
                <p>name: llama_3_8b</p>
              </el-card>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="8" :xl="8">
              <el-card>
                <p>Model参数</p>
                <p>name: llama_3_8b</p>
              </el-card>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="8" :xl="8">
              <el-card>
                <p>Model参数</p>
                <p>name: llama_3_8b</p>
              </el-card>
            </el-col>
          </el-row>
        </el-card>
        <el-card class="flex-1">
          <h1 class="mb-2">Deployment Policy</h1>
          <el-row :gutter="20">
            <el-col :xs="24" :sm="24" :md="24" :lg="8" :xl="8">
              <el-card>
                <p>Model参数</p>
                <p>name: llama_3_8b</p>
              </el-card>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="8" :xl="8">
              <el-card>
                <p>Model参数</p>
                <p>name: llama_3_8b</p>
              </el-card>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="8" :xl="8">
              <el-card>
                <p>Model参数</p>
                <p>name: llama_3_8b</p>
              </el-card>
            </el-col>
          </el-row>
        </el-card>
      </section>
      <section class="flex gap-1">
        <el-card class="flex-1">
          <h1 class="mb-2">绝对值</h1>
          <section>
            <el-divider content-position="left">
              <div class="w-full flex justify-center items-center gap-2 text-red-500">
                <Icon :icon="'vi-ep:help-filled'" :size="20" />
                <span class="text-xl">Prefill</span>
              </div>
            </el-divider>
            <el-row :gutter="5">
              <el-col :xs="24" :sm="24" :md="8" :lg="4" :xl="4">
                <el-card>
                  <div class="flex flex-col items-center gap-2">
                    <Icon :icon="'vi-ep:help-filled'" :size="60" />
                    <p>首Token时间</p>
                    <p>0.68 s</p>
                  </div>
                </el-card>
              </el-col>
              <el-col :xs="24" :sm="24" :md="8" :lg="4" :xl="4">
                <el-card>
                  <div class="flex flex-col items-center gap-2">
                    <Icon :icon="'vi-ep:help-filled'" :size="60" />
                    <p>首Token时间</p>
                    <p>0.68 s</p>
                  </div>
                </el-card>
              </el-col>
              <el-col :xs="24" :sm="24" :md="8" :lg="4" :xl="4">
                <el-card>
                  <div class="flex flex-col items-center gap-2">
                    <Icon :icon="'vi-ep:help-filled'" :size="60" />
                    <p>首Token时间</p>
                    <p>0.68 s</p>
                  </div>
                </el-card>
              </el-col>
              <el-col :xs="24" :sm="24" :md="8" :lg="4" :xl="4">
                <el-card>
                  <div class="flex flex-col items-center gap-2">
                    <Icon :icon="'vi-ep:help-filled'" :size="60" />
                    <p>首Token时间</p>
                    <p>0.68 s</p>
                  </div>
                </el-card>
              </el-col>
              <el-col :xs="24" :sm="24" :md="8" :lg="4" :xl="4">
                <el-card>
                  <div class="flex flex-col items-center gap-2">
                    <Icon :icon="'vi-ep:help-filled'" :size="60" />
                    <p>首Token时间</p>
                    <p>0.68 s</p>
                  </div>
                </el-card>
              </el-col>
              <el-col :xs="24" :sm="24" :md="8" :lg="4" :xl="4">
                <el-card>
                  <div class="flex flex-col items-center gap-2">
                    <Icon :icon="'vi-ep:help-filled'" :size="60" />
                    <p>首Token时间</p>
                    <p>0.68 s</p>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </section>
          <section>
            <el-divider content-position="left">
              <div class="w-full flex justify-center items-center gap-2 text-red-500">
                <Icon :icon="'vi-ep:help-filled'" :size="20" />
                <span class="text-xl">Decode</span>
              </div>
            </el-divider>
            <el-row :gutter="5">
              <el-col :xs="24" :sm="24" :md="8" :lg="4" :xl="4">
                <el-card>
                  <div class="flex flex-col items-center gap-2">
                    <Icon :icon="'vi-ep:help-filled'" :size="60" />
                    <p>首Token时间</p>
                    <p>0.68 s</p>
                  </div>
                </el-card>
              </el-col>
              <el-col :xs="24" :sm="24" :md="8" :lg="4" :xl="4">
                <el-card>
                  <div class="flex flex-col items-center gap-2">
                    <Icon :icon="'vi-ep:help-filled'" :size="60" />
                    <p>首Token时间</p>
                    <p>0.68 s</p>
                  </div>
                </el-card>
              </el-col>
              <el-col :xs="24" :sm="24" :md="8" :lg="4" :xl="4">
                <el-card>
                  <div class="flex flex-col items-center gap-2">
                    <Icon :icon="'vi-ep:help-filled'" :size="60" />
                    <p>首Token时间</p>
                    <p>0.68 s</p>
                  </div>
                </el-card>
              </el-col>
              <el-col :xs="24" :sm="24" :md="8" :lg="4" :xl="4">
                <el-card>
                  <div class="flex flex-col items-center gap-2">
                    <Icon :icon="'vi-ep:help-filled'" :size="60" />
                    <p>首Token时间</p>
                    <p>0.68 s</p>
                  </div>
                </el-card>
              </el-col>
              <el-col :xs="24" :sm="24" :md="8" :lg="4" :xl="4">
                <el-card>
                  <div class="flex flex-col items-center gap-2">
                    <Icon :icon="'vi-ep:help-filled'" :size="60" />
                    <p>首Token时间</p>
                    <p>0.68 s</p>
                  </div>
                </el-card>
              </el-col>
              <el-col :xs="24" :sm="24" :md="8" :lg="4" :xl="4">
                <el-card>
                  <div class="flex flex-col items-center gap-2">
                    <Icon :icon="'vi-ep:help-filled'" :size="60" />
                    <p>首Token时间</p>
                    <p>0.68 s</p>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </section>
        </el-card>
      </section>
      <section class="flex gap-1">
        <el-card class="flex-1">
          <el-row :gutter="5">
            <div class="w-35 flex justify-start items-center gap-2 text-sky-500">
              <Icon :icon="'vi-ep:help-filled'" :size="20" />
              <span class="text-xl">Prefill</span>
            </div>
            <el-col :xs="24" :sm="24" :md="8" :lg="4" :xl="4">
              <el-card class="!min-h-[262px] !max-h-[300px]">
                <p>时间分布</p>
                <el-skelecton :loading="loadingChart" animated>
                  <Echart :options="pieOptionsData" :height="200" />
                </el-skelecton>
              </el-card>
            </el-col>
            <el-col :xs="24" :sm="24" :md="8" :lg="4" :xl="4">
              <el-card class="!min-h-[262px] !max-h-[300px]">
                <p>计算时间分布</p>
                <el-skelecton :loading="loadingChart" animated>
                  <Echart :options="gaugeOptionsData" :height="200" />
                </el-skelecton>
              </el-card>
            </el-col>
            <el-col :xs="24" :sm="24" :md="8" :lg="4" :xl="4">
              <el-card class="!min-h-[262px] !max-h-[300px]">
                <p>通信时间分布</p>
              </el-card>
            </el-col>
            <el-col :xs="24" :sm="24" :md="8" :lg="4" :xl="4">
              <el-card class="!min-h-[262px] !max-h-[300px]">
                <p>显存</p>
              </el-card>
            </el-col>
            <el-col :xs="24" :sm="24" :md="8" :lg="4" :xl="4">
              <el-card class="!min-h-[262px] !max-h-[300px]">
                <p>通信量</p>
              </el-card>
            </el-col>
          </el-row>
          <el-divider>
            <Icon :icon="'vi-ant-design:star-filled'" :color="'red'" />
          </el-divider>
          <el-row :gutter="5">
            <div class="w-35 flex justify-start items-center gap-2 text-sky-500">
              <Icon :icon="'vi-ep:help-filled'" :size="20" />
              <span class="text-xl">Decode</span>
            </div>
            <el-col :xs="24" :sm="24" :md="8" :lg="4" :xl="4">
              <el-card class="!min-h-[262px] !max-h-[300px]">
                <p>时间分布</p>
                <el-skelecton :loading="loadingChart" animated>
                  <Echart :options="pieOptionsData" :height="200" />
                </el-skelecton>
              </el-card>
            </el-col>
            <el-col :xs="24" :sm="24" :md="8" :lg="4" :xl="4">
              <el-card class="!min-h-[262px] !max-h-[300px]">
                <p>计算时间分布</p>
                <el-skelecton :loading="loadingChart" animated>
                  <Echart :options="gaugeOptionsData" :height="200" />
                </el-skelecton>
              </el-card>
            </el-col>
            <el-col :xs="24" :sm="24" :md="8" :lg="4" :xl="4">
              <el-card class="!min-h-[262px] !max-h-[300px]">
                <p>通信时间分布</p>
              </el-card>
            </el-col>
            <el-col :xs="24" :sm="24" :md="8" :lg="4" :xl="4">
              <el-card class="!min-h-[262px] !max-h-[300px]">
                <p>显存</p>
              </el-card>
            </el-col>
            <el-col :xs="24" :sm="24" :md="8" :lg="4" :xl="4">
              <el-card class="!min-h-[262px] !max-h-[300px]">
                <p>通信量</p>
              </el-card>
            </el-col>
          </el-row>
        </el-card>
      </section>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCardDetailsStore } from '@/store/modules/cardDetails'
import { pieOptions, gaugeOptions } from './echarts-data'
import { set } from 'lodash-es'
import type { EChartsOption } from 'echarts'
import { Echart } from '@/components/Echart'

let pieOptionsData = reactive<EChartsOption>(pieOptions) as EChartsOption
let gaugeOptionsData = reactive<EChartsOption>(gaugeOptions) as EChartsOption
const { t } = useI18n()
const store = useCardDetailsStore()
// const selectedModel = ref('')
// const handleModelChange = async (value: string) => {
//   await store.fetchModelInfo(value)
//   await store.fetchPerformanceData(value)
//   await store.fetchResourceData(value)
// }
const loadingChart = ref(true)
const isShowConfigurationSearch = ref(false)
onMounted(() => {
  // if (selectedModel.value) {
  //   handleModelChange(selectedModel.value)
  // }
  setTimeout(() => {
    loadingChart.value = false
    isShowConfigurationSearch.value = true
  }, 1000)
})

const value = ref('模型选择')
const options = [
  {
    value: 'pd-only',
  },
  {
    value: 'pd-fusion',
  },
  {
    value: 'pd-split',
  },
]
const value1 = ref('等级选择')
const options1 = [
  {
    value: 'top1',
  },
  {
    value: 'top2',
  },
  {
    value: 'top3',
  },
]
</script>

<style lang="less" scoped>
.markov-icon-hover {
  cursor: pointer;

  &:hover {
    color: skyblue;
  }
}
</style>
