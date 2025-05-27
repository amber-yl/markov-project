<template>
  <el-card>
    <div class="flex justify-between items-center">
      <section class="custom-header-left flex flex-col gap-4">
        <h2>{{ props.modeName }}</h2>
        <el-button type="primary" @click="$emit('create')">
          {{ t('cardDetails.createNew') }}
        </el-button>
      </section>
      <section class="custom-header-right">
        <div class="custom-mode flex mb-4">
          <el-button @click="emit('change', item.model, $event)" v-for="item in props.models" class="flex-1">
            <template #icon>
              <Icon :icon="'vi-ep:grid'" v-if="item.model === 'Grid'" />
              <Icon :icon="'vi-ep:list'" v-else />
            </template>
            {{ item.model }}
          </el-button>
        </div>
        <div class="custom-mode flex">
          <el-button v-for="item in ['个人', '全部']" class="flex-1">
            <template #icon>
              <Icon :icon="'vi-ep:question-filled'" v-if="item === '个人'" />
              <Icon :icon="'vi-ep:question-filled'" v-else />
            </template>
            {{ item }}
          </el-button>
        </div>
      </section>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const viewMode = ref('Grid')

const { t } = useI18n()

const props = defineProps({
  modelValue: {
    type: String,
    required: true
  },
  models: {
    type: Array<{ model: string }>,
    required: true
  },
  modeName: {
    type: String,
    required: true
  }
})
const emit = defineEmits(['update:modelValue', 'create', 'change'])
</script>


<style lang="less" scoped>
.custom-mode {
  width: 100%;

  .el-button {
    border: 1px solid skyblue;
    border-radius: 0%;
    position: relative;
    color: #000;
    background-color: transparent;
    transition:
      color 0.3s ease,
      background-color 0.3s ease;

    &.is-active {
      background-color: skyblue;
      color: #fff
    }
  }

  .el-button+.el-button {
    margin-left: 0px;
  }
}
</style>