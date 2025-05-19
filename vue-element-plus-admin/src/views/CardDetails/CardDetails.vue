<template>
  <div>
    <!-- CardDetails -->
    {{ t('newRouter.CardDetails') }}
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const feature = ref()
</script>

<style lang="less" scoped></style>
