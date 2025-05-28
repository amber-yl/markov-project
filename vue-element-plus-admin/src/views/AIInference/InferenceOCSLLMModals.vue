<template>
  <div>
    {{ t('newMenu.InferenceOCSLLMModals') }}
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
// import { request_get_api } from '@/api/request'
import { useSystemConfigStore } from '@/store/modules/systemConfigs'

const { t } = useI18n()
const systemConfigStore = useSystemConfigStore()
onMounted(async () => {
  await systemConfigStore.fetchConfigs()
})
</script>

<style lang="less" scoped></style>
