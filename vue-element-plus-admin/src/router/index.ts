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
    redirect: '/level/menu1/menu1-2',
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
    path: '/personal',
    component: Layout,
    redirect: '/personal/personal-center',
    name: 'Personal',
    meta: {
      title: t('router.personal'),
      hidden: true,
      canTo: true
    },
    children: [
      {
        path: 'personal-center',
        component: () => import('@/views/Personal/PersonalCenter/PersonalCenter.vue'),
        name: 'PersonalCenter',
        meta: {
          title: t('router.personalCenter'),
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
    path: '/',
    component: Layout,
    redirect: '/level1/menu1/menu1-2',
    name: 'Root',
    meta: {
      hidden: true
    }
  },
  {
    path: '/level',
    component: Layout,
    redirect: '/level/menu1/menu1-2', // 修改重定向路径指向 menu1-2
    name: 'Level',
    meta: {
      title: t('router.level'),
      icon: 'vi-carbon:skill-level-advanced'
    },
    children: [
      {
        path: 'menu1',
        name: 'Menu1',
        component: getParentLayout(),
        redirect: '/level/menu1/menu1-2', // 修改重定向路径指向 menu1-2
        meta: {
          title: t('router.menu1'),
          alwaysShow: true
        },
        children: [
          {
            path: 'menu1-2',
            name: 'Menu12',
            component: () => import('@/views/Level/Menu12.vue'),
            meta: {
              title: t('router.menu12')
            }
          }
        ]
      },
      {
        path: 'menu2',
        name: 'Menu2',
        component: getParentLayout(),
        redirect: '/level/menu2/menu2-1', // 修改重定向路径指向 menu1-2
        meta: {
          title: t('router.analysis'),
          alwaysShow: true
        },
        children: [
          {
            path: 'menu2-1',
            name: 'Menu21',
            component: () => import('@/views/Level/Menu2.vue'),
            meta: {
              title: t('router.menu12')
            }
          }
        ]
      }
    ]
  },
  {
    path: '/level1',
    component: Layout,
    redirect: '/level1/menu11/menu11-2', // 修改重定向路径指向 menu1-2
    name: 'Level1',
    meta: {
      title: t('router.level'),
      icon: 'vi-carbon:skill-level-advanced'
    },
    children: [
      {
        path: 'menu11',
        name: 'Menu11',
        component: getParentLayout(),
        redirect: '/level1/menu11/menu11-2', // 修改重定向路径指向 menu1-2
        meta: {
          title: t('router.menu1'),
          alwaysShow: true
        },
        children: [
          {
            path: 'menu11-2',
            name: 'Menu112',
            component: () => import('@/views/Level/Menu12.vue'),
            meta: {
              title: t('router.menu12')
            }
          }
        ]
      }
      // {
      //   path: 'menu22',
      //   name: 'Menu22',
      //   component: getParentLayout(),
      //   redirect: '/level1/menu22/menu22-1', // 修改重定向路径指向 menu1-2
      //   meta: {
      //     title: t('router.analysis'),
      //     alwaysShow: true
      //   },
      //   children: [
      //     {
      //       path: 'menu22-1',
      //       name: 'Menu221',
      //       component: () => import('@/views/Level/Menu12.vue'),
      //       meta: {
      //         title: t('router.menu12')
      //       }
      //     }
      //   ]
      // }
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
