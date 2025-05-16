import './polyfill';
import { createApp } from 'vue';
import App from './App.vue';
import { setupRouter } from './router';
import { setupIcons } from './components/basic/icon';
import { setupStore } from '@/store';
import { setupI18n } from '@/locales';
import { setupAntd, setupAssets, setupGlobalMethods } from '@/plugins';

const app = createApp(App);

function setupPlugins() {
  // 安装图标
  setupIcons();
  // 注册全局常用的ant-design-vue组件
  setupAntd(app);
  // 引入静态资源
  setupAssets();
  // 注册全局方法，如：app.config.globalProperties.$message = message
  setupGlobalMethods(app);
}

async function setupApp() {
  // if (import.meta.env.VITE_MOCK_IN_PROD === 'true') {
  //   const { setupMock } = await import('../mocks/');
  //   await setupMock();
  // }
  setupStore(app);
  await setupI18n(app);
  await setupRouter(app);
  app.mount('#app');
}
setupPlugins();
setupApp();
