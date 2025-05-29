import type { App } from 'vue'

// 需要全局引入一些组件，如ElScrollbar，不然一些下拉项样式有问题
import {
  ElLoading,
  ElScrollbar,
  ElCard,
  ElSelect,
  ElRow,
  ElCol,
  ElSkeleton,
  ElOption,
  ElDialog,
  ElButton,
  ElTable,
  ElTableColumn,
  ElPagination,
  ElDrawer,
  ElCheckTag,
  ElPopover,
  ElTooltip,
  ElCheckbox,
  ElCheckboxGroup,
  ElSteps,
  ElStep,
  ElTag,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElSwitch,
  ElAlert,
  ElDescriptions,
  ElDescriptionsItem,
  ElDivider,
  ElCollapse,
  ElCollapseItem,
  ElTransfer,
  ElPopconfirm,
  ElMessage,
  ElMessageBox
} from 'element-plus'

const plugins = [
  ElLoading,
  ElCard,
  ElSelect,
  ElRow,
  ElCol,
  ElSkeleton,
  ElOption,
  ElDialog,
  ElButton,
  ElTable,
  ElTableColumn,
  ElPagination,
  ElDrawer,
  ElCheckTag,
  ElPopover,
  ElTooltip,
  ElCheckbox,
  ElCheckboxGroup,
  ElSteps,
  ElStep,
  ElTag,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElSwitch,
  ElAlert,
  ElDescriptions,
  ElDescriptionsItem,
  ElDivider,
  ElCollapse,
  ElCollapseItem,
  ElTransfer,
  ElPopconfirm,
  ElMessage,
  ElMessageBox
]

const components = [ElScrollbar]

export const setupElementPlus = (app: App<Element>) => {
  plugins.forEach((plugin) => {
    app.use(plugin)
  })

  // 为了开发环境启动更快，一次性引入所有样式
  if (import.meta.env.VITE_USE_ALL_ELEMENT_PLUS_STYLE === 'true') {
    import('element-plus/dist/index.css')
    return
  }

  components.forEach((component) => {
    app.component(component.name!, component)
  })
}
