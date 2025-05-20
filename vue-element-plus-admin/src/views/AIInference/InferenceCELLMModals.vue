<template>
  <div>
    <el-card class="!min-h-[calc(100vh-var(--top-tool-height)-var(--tags-view-height)-var(--app-footer-height))]">
      <el-card class="mb-4">
        <div class="flex justify-between w-full">
          <div class="flex flex-col">
            <h4 class="mb-4">{{ t('newMenu.InferenceCELLMModals') }}</h4>
            <el-button type="primary" @click="createNewSimulation">Create New Simulation</el-button>
          </div>
          <div>
            <div class="flex mb-4">
              <div class="markov-g-btn flex relative mr-2">
                <el-button :class="{ 'is-active': viewMode === 'grid' }" @click="viewMode = 'grid'">
                  <template #icon>
                    <Icon :icon="'vi-ep:grid'" />
                  </template>
                  栅格
                </el-button>
                <el-button :class="{ 'is-active': viewMode === 'table' }" @click="viewMode = 'table'">
                  <template #icon>
                    <Icon :icon="'vi-ep:list'" />
                  </template>
                  表格
                </el-button>
              </div>
              <el-input />
            </div>
            <div class="markov-g-btn flex relative gap-1">
              <el-button class="flex-1" :class="{ 'is-active': viewRole === 'person' }" @click="viewRole = 'person'">
                <template #icon>
                  <Icon :icon="'vi-ep:question-filled'" />
                </template>
                个人Tasks
              </el-button>
              <el-button class="flex-1" :class="{ 'is-active': viewRole === 'all' }" @click="viewRole = 'all'">
                <template #icon>
                  <Icon :icon="'vi-ep:question-filled'" />
                </template>
                所有Tasks
              </el-button>
            </div>
          </div>
        </div>
      </el-card>
      <section v-if="centerDialogVisible">
        <el-card
          class="h-full !min-h-[calc(100vh-var(--top-tool-height)-var(--tags-view-height)-var(--app-footer-height))] overflow-auto">
          <header class="w-full">
            <el-steps :active="active" finish-status="success" align-center>
              <el-step title="Model Selection" description="Description 1"></el-step>
              <el-step title="Hardware" description="Description 2"></el-step>
              <el-step title="Deployment" description="Description 3"></el-step>
              <el-step title="Confirmation" description="Description 4"></el-step>
            </el-steps>
          </header>
          <el-divider content-position="left" />
          <main class="w-full">
            <div v-if="active === 0">
              <el-input :placeholder="'1'" />
            </div>
            <div v-if="active === 1">
              <el-input :placeholder="'2'" />
            </div>
            <div v-if="active === 2">
              <el-input :placeholder="'3'" />
            </div>
            <div v-if="active === 3">
              <el-button type="primary">Execute</el-button>
            </div>
          </main>
          <el-divider content-position="left" />
          <footer class="flex justify-center items-center">
            <el-button type="primary" @click="previous" v-if="active > 0">上一步</el-button>
            <el-button type="primary" @click="next" v-if="active < 3">下一步</el-button>
          </footer>
        </el-card>
      </section>
      <section v-else>
        <el-card
          class="h-full !min-h-[calc(100vh-var(--top-tool-height)-var(--tags-view-height)-var(--app-footer-height))] overflow-auto"
          v-if="viewMode === 'grid'">
          <div class="markov-cards-container grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
            <el-card class="select-card relative" style="max-width: 480px" v-for="(item) in currentList" :key="item.id"
              @mouseenter="handleMouseEnter(item.id)" @mouseleave="handleMouseLeave" @click="handleCard2Details(item)">
              <div v-if="isMultiSelect" class="checkbox-wrapper">
                <el-checkbox :model-value="selectedCards.includes(item.id)" @change="() => toggleCardSelection(item.id)"
                  @click.stop="" />
              </div>
              <template #header>
                <div class="card-header" :class="{ 'header-active': activeCardId === item.id }">
                  <span>aaaaaaaaaaaaa</span>
                </div>
              </template>
              <p v-for="o in 4" :key="o" class="text item">{{ 'List item ' + o }}</p>
              <template #footer>Footer content</template>
              <!-- 右下角图标 -->
              <div v-show="activeCardId === item.id" class="absolute bottom-2 right-2 flex gap-1">
                <Icon :icon="`vi-${type}`" v-for="(type, k) in icons" @click="IconPicker(k)" />
              </div>
            </el-card>
          </div>
          <footer class="flex justify-between">
            <div>
              <span v-if="selectedCards.length > 0">已选择 {{ selectedCards.length }} 个</span>
              <el-button :type="!isMultiSelect ? 'primary' : 'danger'" @click="toggleMultiSelect">
                <template #icon>
                  <Icon :icon="'vi-ep:question-filled'" v-show="isMultiSelect" />
                  <Icon :icon="'vi-ep:info-filled'" v-show="!isMultiSelect" />
                </template>
                {{ (isMultiSelect ? '取消' : '开启') + '多选' }}
              </el-button>
            </div>
            <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
              :page-sizes="[10, 20, 30, 40]" :small="true" :total="total"
              layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
              @current-change="handleCurrentChange" />
          </footer>
        </el-card>
        <el-card
          class="h-full !min-h-[calc(100vh-var(--top-tool-height)-var(--tags-view-height)-var(--app-footer-height))] overflow-auto"
          v-else>
          <el-table :data="currentList" style="width: 100%;" @selection-change="handleSelectionChange">
            <el-table-column type="selection" v-if="isMultiSelect" width="55"></el-table-column>
            <el-table-column prop="name" label="Name" width="180"></el-table-column>
          </el-table>
          <footer class="flex justify-between">
            <div>
              <span v-if="selectedCards.length > 0">已选择 {{ selectedCards }} 个</span>
              <el-button :type="!isMultiSelect ? 'primary' : 'danger'" @click="toggleMultiSelect">
                <template #icon>
                  <Icon :icon="'vi-ep:question-filled'" v-show="isMultiSelect" />
                  <Icon :icon="'vi-ep:info-filled'" v-show="!isMultiSelect" />
                </template>
                {{ (isMultiSelect ? '取消' : '开启') + '多选' }}
              </el-button>
            </div>
            <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
              :page-sizes="[10, 20, 30, 40]" :small="true" :total="total"
              layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
              @current-change="handleCurrentChange" />
          </footer>
        </el-card>
      </section>
    </el-card>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  ElCard,
  ElButton,
  ElPagination,
  ElInput,
  ElTable,
  ElCheckbox,
  ElSteps,
  ElStep,
  ElDivider
} from 'element-plus'
import { useRouter } from 'vue-router'

const { t } = useI18n()

interface User {
  date: string
  name: string
  address: string
}
const tableData: User[] = [
  {
    date: '2016-05-03',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-02',
    name: 'John',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-04',
    name: 'Morgan',
    address: 'No. 189, Grove St, Los Angeles'
  },
  {
    date: '2016-05-01',
    name: 'Jessy',
    address: 'No. 189, Grove St, Los Angeles'
  }
]
const search = ref('')
// 添加分页相关的变量和方法
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(tableData.length)

// 处理页码改变
const handleCurrentChange = (val: number) => {
  console.log(`当前页: ${val}`)
}

// 处理每页显示条数改变
const handleSizeChange = (val: number) => {
  console.log(`每页 ${val} 条`)
}
// 修改 filterTableData 的计算属性
const filterTableData = computed(() => {
  const filtered = tableData.filter(
    (data) => !search.value || data.name.toLowerCase().includes(search.value.toLowerCase())
  )
  total.value = filtered.length
  const startIndex = (currentPage.value - 1) * pageSize.value
  return filtered.slice(startIndex, startIndex + pageSize.value)
})

// Card卡片选择
const selectedCards = ref<number[]>([])
// 添加多选模式的状态
const isMultiSelect = ref(false)
const toggleMultiSelect = () => {
  isMultiSelect.value = !isMultiSelect.value
  // 切换时清空状态
  if (!isMultiSelect.value) {
    selectedCards.value = []
  }
}

// Card卡片和TableDataList
const cardList = [
  { id: 1, name: 'Card 1', description: 'Description 1', status: 'Active', items: ['Item 1-1', 'Item 1-2', 'Item 1-3', 'Item 1-4'] },
  { id: 2, name: 'Card 2', description: 'Description 2', status: 'Inactive', items: ['Item 2-1', 'Item 2-2', 'Item 2-3', 'Item 2-4'] },
  { id: 3, name: 'Card 3', description: 'Description 3', status: 'Active', items: ['Item 3-1', 'Item 3-2', 'Item 3-3', 'Item 3-4'] },
  { id: 4, name: 'Card 4', description: 'Description 4', status: 'Inactive', items: ['Item 4-1', 'Item 4-2', 'Item 4-3', 'Item 4-4'] },
  { id: 5, name: 'Card 5', description: 'Description 5', status: 'Active', items: ['Item 5-1', 'Item 5-2', 'Item 5-3', 'Item 5-4'] },
  { id: 6, name: 'Card 6', description: 'Description 6', status: 'Inactive', items: ['Item 6-1', 'Item 6-2', 'Item 6-3', 'Item 6-4'] },
]

const currentList = ref(cardList)

const viewMode = ref('grid')

const viewRole = ref('person')

const handleSelectionChange = (selection: any[]) => {
  selectedCards.value = selection.map((item) => item.id)
}

const activeCardId = ref<number>(-1)
const handleMouseEnter = (id: number) => {
  console.log('Mouse entered row:', id)
  activeCardId.value = id
}
const handleMouseLeave = () => {
  activeCardId.value = -1
}

const toggleCardSelection = (id: number) => {
  console.log(id, "| id");
  const position = selectedCards.value.indexOf(id)
  if (position === -1) {
    selectedCards.value.push(id)
  } else {
    selectedCards.value.splice(position, 1)
  }
}

const icons = ['ant-design:edit-outlined', 'ant-design:question-circle-outlined', 'ep:delete']
const IconPicker = (index: number) => {
  console.log('Selected icon:', icons[index])
}

const router = useRouter()
const handleCard2Details = (item: any) => {
  router.push({
    path: '/card/card-details',
    query: {
      cardData: JSON.stringify(item)
    }
  })
}

const centerDialogVisible = ref<boolean>(false)
const createNewSimulation = () => {
  centerDialogVisible.value = !centerDialogVisible.value
}

// 步骤条
const active = ref(0)
const next = () => {
  if (active.value++ > 2) active.value = 0
}
const previous = () => {
  if (active.value-- < 0) active.value = 2
}
</script>

<style lang="less" scoped>
.markov-g-btn {
  .el-button {
    border: 1px solid skyblue;
    border-radius: 0px;
    position: relative;
    color: #000;
    background-color: transparent;
    transition: color 0.3s ease, background-color 0.3s ease;

    &.is-active {
      background-color: skyblue;
      color: #fff;
    }
  }

  .el-button+.el-button {
    margin-left: 0px;
  }
}

.select-card {
  .checkbox-wrapper {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 2;
    background-color: white;
    padding: 4px;
    border-radius: 50%;
  }
}

.header-active {
  color: red;
  transition: color 0.3s ease
}
</style>
