import type { App } from 'vue'
// 引入 @opentiny/vue 组件
import TinyVue from '@opentiny/vue'

export const setupOpenTiny = (app: App<Element>) => {
  app.use(TinyVue)
}
