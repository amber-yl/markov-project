<template>
  <div class="box">
    <img src="~@/assets/analysis.svg" />
    <Descriptions title="系统信息" bordered>
      <Descriptions.Item key="IP" label="IP">
        {{ '127.0.0.1' }}
      </Descriptions.Item>
    </Descriptions>
  </div>
</template>

<script lang="ts" setup>
  import { Descriptions } from 'ant-design-vue';
  defineOptions({
    name: 'DashboardWelcome',
  });
</script>

<style lang="less" scoped>
  @import '@/styles/theme.less';

  .themeBgColor(box);

  .box {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: calc(100vh - 280px);
    padding: 12px;

    img {
      flex: 1;
      min-height: 0;
    }

    .ant-form {
      flex: 2;
    }
  }
</style>
