<template>
  <div>
    <!-- CardDetails -->
    <el-card class="!min-h-[calc(100vh-var(--top-tool-height)-var(--tags-view-height)-var(--app-footer-height))]">
      <el-card class="mb-2">
        <div class="flex items-baseline gap-3">
          <h2>{{ name }}</h2>
          <Icon class="markov-icon-hover" :icon="'vi-ant-design:fund-outlined'" color="green" />
          <Icon class="markov-icon-hover" :icon="'vi-tdesign:chart'" color="green" />
        </div>
      </el-card>
      <el-card class="mb-2">
        <div class="flex flex-col items-baseline gap-3">
          <h2>{{ name }}</h2>
          <section class="flex w-full">
            <el-select />
            <el-select />
          </section>
        </div>
      </el-card>
      <el-card class="performance-card-container mb-2">
        <div class="flex justify-between">
          <el-card>
            <h3>Basic Information:</h3>
            <div class="flex items-baseline gap-3 mt-4">
              <el-card>
                <div class="flex items-baseline gap-3">
                  <h2>Model:</h2>
                  <Icon class="markov-icon-hover" :icon="'vi-ant-design:fund-outlined'" color="green" />
                  <Icon class="markov-icon-hover" :icon="'vi-tdesign:chart'" color="green" />
                </div>
              </el-card>
              <el-card>
                <div class="flex items-baseline gap-3">
                  <h2>{{ name }}</h2>
                  <Icon class="markov-icon-hover" :icon="'vi-ant-design:fund-outlined'" color="green" />
                  <Icon class="markov-icon-hover" :icon="'vi-tdesign:chart'" color="green" />
                </div>
              </el-card>
              <el-card>
                <div class="flex items-baseline gap-3">
                  <h2>{{ name }}</h2>
                  <Icon class="markov-icon-hover" :icon="'vi-ant-design:fund-outlined'" color="green" />
                  <Icon class="markov-icon-hover" :icon="'vi-tdesign:chart'" color="green" />
                </div>
              </el-card>
            </div>
          </el-card>
          <el-card>
            <h3>Deployment Policy:</h3>
            <div class="flex items-baseline gap-3 mt-4">
              <el-card>
                <div class="flex items-baseline gap-3">
                  <h2>{{ name }}</h2>
                  <Icon class="markov-icon-hover" :icon="'vi-ant-design:fund-outlined'" color="green" />
                  <Icon class="markov-icon-hover" :icon="'vi-tdesign:chart'" color="green" />
                </div>
              </el-card>
              <el-card>
                <div class="flex items-baseline gap-3">
                  <h2>{{ name }}</h2>
                  <Icon class="markov-icon-hover" :icon="'vi-ant-design:fund-outlined'" color="green" />
                  <Icon class="markov-icon-hover" :icon="'vi-tdesign:chart'" color="green" />
                </div>
              </el-card>
              <el-card>
                <div class="flex items-baseline gap-3">
                  <h2>{{ name }}</h2>
                  <Icon class="markov-icon-hover" :icon="'vi-ant-design:fund-outlined'" color="green" />
                  <Icon class="markov-icon-hover" :icon="'vi-tdesign:chart'" color="green" />
                </div>
              </el-card>
            </div>
          </el-card>
        </div>
      </el-card>
      <el-card class="mb-2">
        <div class="flex flex-col items-baseline gap-3">
          <h2>Performance Modeling:</h2>
          <main class="flex justify-between w-full">
            <section>
              <header class="mb-4">Performance Indicators:</header>
              <div class="flex flex-col gap-4">
                <section class="flex items-center gap-4">
                  <Icon :icon="'vi-ant-design:fund-outlined'" color="green" :size="50" />
                  <div>
                    <p>Throughput</p>
                    <p>12.67Ks</p>
                  </div>
                </section>
                <section class="flex items-center gap-4">
                  <Icon :icon="'vi-tdesign:chart'" color="green" :size="50" />
                  <div>
                    <p>Requests / s</p>
                    <p>24.74</p>
                  </div>
                </section>
              </div>
            </section>
            <section>
              <header class="mb-4">Performance Indicators:</header>
              <div class="flex flex-col gap-4">
                <section class="flex items-center gap-4">
                  <Icon :icon="'vi-ant-design:fund-outlined'" color="green" :size="50" />
                  <div>
                    <p>Throughput</p>
                    <p>12.67Ks</p>
                  </div>
                </section>
                <section class="flex items-center gap-4">
                  <Icon :icon="'vi-tdesign:chart'" color="green" :size="50" />
                  <div>
                    <p>Requests / s</p>
                    <p>24.74</p>
                  </div>
                </section>
              </div>
            </section>
            <section>
              <header class="mb-4">Performance Indicators:</header>
              <div class="flex flex-col gap-4">
                <section class="flex items-center gap-4">
                  <Icon :icon="'vi-ant-design:fund-outlined'" color="green" :size="50" />
                  <div>
                    <p>Throughput</p>
                    <p>12.67Ks</p>
                  </div>
                </section>
                <section class="flex items-center gap-4">
                  <Icon :icon="'vi-tdesign:chart'" color="green" :size="50" />
                  <div>
                    <p>Requests / s</p>
                    <p>24.74</p>
                  </div>
                </section>
              </div>
            </section>
            <section>
              <header class="mb-4">Performance Indicators:</header>
              <div class="flex flex-col gap-4">
                <section class="flex items-center gap-4">
                  <Icon :icon="'vi-ant-design:fund-outlined'" color="green" :size="50" />
                  <div>
                    <p>Throughput</p>
                    <p>12.67Ks</p>
                  </div>
                </section>
                <section class="flex items-center gap-4">
                  <Icon :icon="'vi-tdesign:chart'" color="green" :size="50" />
                  <div>
                    <p>Requests / s</p>
                    <p>24.74</p>
                  </div>
                </section>
              </div>
            </section>
          </main>
        </div>
      </el-card>
      <el-card class="mb-2">
        <div class="flex flex-col items-baseline gap-3 overflow-auto">
          <h2>Resource utilization:</h2>
          <section class="flex items-center justify-center" v-for="item in 2" :key="item">
            <div class="w-30 items-center">
              <Icon :icon="'vi-ep:info-filled'" color="green" />
              <span class="text-green-700 ml-2">Prefill</span>
            </div>
            <div class="flex-1 flex">
              <div class="flex flex-col" v-for="item in 4" :key="item">
                <p>Computing Power Utilization</p>
                <div>
                  <div :id='"main" + item'></div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </el-card>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElCard, ElSelect } from 'element-plus'
import { useRoute } from 'vue-router'
import * as echarts from 'echarts'

const { t } = useI18n()
const route = useRoute()

let cardData = route?.query?.cardData || ''
const { name } = JSON.parse(cardData as string)
console.log(name);

const initChart = () => {
  const chartDom1 = document.getElementById('main1')
  const chartDom2 = document.getElementById('main2')
  const chartDom3 = document.getElementById('main3')
  const chartDom4 = document.getElementById('main4')
  const myChart1 = echarts.init(chartDom1)
  const myChart2 = echarts.init(chartDom2)
  const myChart3 = echarts.init(chartDom3)
  const myChart4 = echarts.init(chartDom4)

  const option = {
    series: [{
      type: 'gauge',
      progress: {
        show: true,
        width: 18
      },
      axisLine: {
        lineStyle: {
          width: 18
        }
      },
      axisTick: {
        show: false
      },
      splitLine: {
        length: 15,
        lineStyle: {
          width: 2,
          color: '#999'
        }
      },
      axisLabel: {
        distance: 25,
        color: '#999',
        fontSize: 14
      },
      anchor: {
        show: true,
        showAbove: true,
        size: 25,
        itemStyle: {
          borderWidth: 10
        }
      },
      title: {
        show: false
      },
      detail: {
        valueAnimation: true,
        fontSize: 30,
        offsetCenter: [0, '70%']
      },
      data: [{
        value: 70
      }]
    }]
  }

  option && myChart1.setOption(option)
  option && myChart2.setOption(option)
  option && myChart3.setOption(option)
  option && myChart4.setOption(option)
}
onMounted(() => {
  initChart()
})
</script>

<style lang="less" scoped>
.markov-icon-hover {
  cursor: pointer;

  &:hover {
    color: skyblue;
  }
}

#main1 {
  width: 300px;
  height: 300px;
}

#main2 {
  width: 300px;
  height: 300px;
}

#main3 {
  width: 300px;
  height: 300px;
}

#main4 {
  width: 300px;
  height: 300px;
}
</style>
