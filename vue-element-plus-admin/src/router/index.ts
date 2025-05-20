import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import type { App } from 'vue'
import { Layout, getParentLayout } from '@/utils/routerHelper'
import { useI18n } from '@/hooks/web/useI18n'
import { NO_RESET_WHITE_LIST } from '@/constants'

const { t } = useI18n()

// 静态路由
export const constantRouterMap: AppRouteRecordRaw[] = [
  {
    path: '/',
    component: Layout,
    redirect: '/ai-inference/configuration-evaluation/llm-modals',
    name: 'Root',
    meta: {
      hidden: true
    }
  },
  {
    path: '/redirect',
    component: Layout,
    name: 'RedirectWrap',
    children: [
      {
        path: '/redirect/:path(.*)',
        name: 'Redirect',
        component: () => import('@/views/Redirect/Redirect.vue'),
        meta: {}
      }
    ],
    meta: {
      hidden: true,
      noTagsView: true
    }
  },
  {
    path: '/login',
    component: () => import('@/views/Login/Login.vue'),
    name: 'Login',
    meta: {
      hidden: true,
      title: t('router.login'),
      noTagsView: true
    }
  },
  {
    path: '/card',
    component: Layout,
    redirect: '/card/card-details',
    name: 'Card',
    meta: {
      title: t('newRouter.Card'),
      hidden: true,
      canTo: true
    },
    children: [
      {
        path: 'card-details',
        component: () => import('@/views/CardDetails/CardDetails.vue'),
        name: 'CardDetails',
        meta: {
          title: t('newRouter.CardDetails'),
          hidden: true,
          canTo: true
        }
      }
    ]
  },
  {
    path: '/404',
    component: () => import('@/views/Error/404.vue'),
    name: 'NoFind',
    meta: {
      hidden: true,
      title: '404',
      noTagsView: true
    }
  }
]

// 动态路由
export const asyncRouterMap: AppRouteRecordRaw[] = [
  {
    path: '/ai-inference',
    component: Layout,
    redirect: '/ai-inference/configuration-evaluation/llm-modals', // 修改重定向路径指向 menu1-2
    name: 'AIInference',
    meta: {
      title: t('newMenu.AIInference'),
      icon: 'vi-carbon:skill-level-advanced'
    },
    children: [
      {
        path: 'configuration-evaluation',
        name: 'InferenceConfigurationEvaluation',
        component: getParentLayout(),
        redirect: '/ai-inference/configuration-evaluation/llm-modals', // 修改重定向路径指向 menu1-2
        meta: {
          title: t('newMenu.InferenceConfigurationEvaluation'),
          alwaysShow: true
        },
        children: [
          {
            path: 'llm-modals',
            name: 'InferenceCELLMModals',
            component: () => import('@/views/AIInference/InferenceCELLMModals.vue'),
            meta: {
              title: t('newMenu.InferenceCELLMModals')
            }
          }
        ]
      },
      {
        path: 'optimal-configuration-search',
        name: 'InferenceOptimalConfigurationSearch',
        component: getParentLayout(),
        redirect: '/ai-inference/optimal-configuration-search/llm-modals', // 修改重定向路径指向 menu1-2
        meta: {
          title: t('newMenu.InferenceOptimalConfigurationSearch'),
          alwaysShow: true
        },
        children: [
          {
            path: 'llm-modals',
            name: 'InferenceOCSLLMModals',
            component: () => import('@/views/AIInference/InferenceOCSLLMModals.vue'),
            meta: {
              title: t('newMenu.InferenceOCSLLMModals')
            }
          }
        ]
      }
    ]
  },
  {
    path: '/ai-training',
    component: Layout,
    redirect: '/ai-training/configuration-evaluation/llm-modals', // 修改重定向路径指向 menu1-2
    name: 'AITraining',
    meta: {
      title: t('newMenu.AITraining'),
      icon: 'vi-carbon:skill-level-advanced'
    },
    children: [
      {
        path: 'configuration-evaluation',
        name: 'TrainingConfigurationEvaluation',
        component: getParentLayout(),
        redirect: '/ai-training/configuration-evaluation/llm-modals', // 修改重定向路径指向 menu1-2
        meta: {
          title: t('newMenu.TrainingConfigurationEvaluation'),
          alwaysShow: true
        },
        children: [
          {
            path: 'llm-modals',
            name: 'TrainingCELLMModals',
            component: () => import('@/views/AITraining/TrainingCELLMModals.vue'),
            meta: {
              title: t('newMenu.TrainingCELLMModals')
            }
          },
          {
            path: 'm-modals',
            name: 'TrainingCEMultiModal',
            component: () => import('@/views/AITraining/TrainingCEMultiModal.vue'),
            meta: {
              title: t('newMenu.TrainingCEMultiModal')
            }
          }
        ]
      },
      {
        path: 'optimal-configuration-search',
        name: 'TrainingOptimalConfigurationSearch',
        component: getParentLayout(),
        redirect: '/ai-training/optimal-configuration-search/llm-modals', // 修改重定向路径指向 menu1-2
        meta: {
          title: t('newMenu.TrainingOptimalConfigurationSearch'),
          alwaysShow: true
        },
        children: [
          {
            path: 'llm-modals',
            name: 'TrainingOCSLLMModals',
            component: () => import('@/views/AITraining/TrainingOCSLLMModals.vue'),
            meta: {
              title: t('newMenu.TrainingOCSLLMModals')
            }
          },
          {
            path: 'm-modals',
            name: 'TrainingOCSMultiModal',
            component: () => import('@/views/AITraining/TrainingOCSMultiModal.vue'),
            meta: {
              title: t('newMenu.TrainingOCSMultiModal')
            }
          }
        ]
      }
    ]
  },
  {
    path: '/configs',
    component: Layout,
    redirect: '/configs/inference-configs', // 修改重定向路径指向 menu1-2
    name: 'Configs',
    meta: {
      title: t('newMenu.Configs'),
      icon: 'vi-carbon:skill-level-advanced'
    },
    children: [
      {
        path: 'system-configs',
        name: 'SystemConfigs',
        component: () => import('@/views/Configs/SystemConfigs.vue'),
        meta: {
          title: t('newMenu.SystemConfigs')
        }
      },
      {
        path: 'model-configs',
        name: 'ModelConfigs',
        component: () => import('@/views/Configs/ModelConfigs.vue'),
        meta: {
          title: t('newMenu.ModelConfigs')
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  strict: true,
  routes: constantRouterMap as RouteRecordRaw[],
  scrollBehavior: () => ({ left: 0, top: 0 })
})

export const resetRouter = (): void => {
  router.getRoutes().forEach((route) => {
    const { name } = route
    if (name && !NO_RESET_WHITE_LIST.includes(name as string)) {
      router.hasRoute(name) && router.removeRoute(name)
    }
  })
}

export const setupRouter = (app: App<Element>) => {
  app.use(router)
}

export default router
