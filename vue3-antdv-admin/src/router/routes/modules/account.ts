import type { RouteRecordRaw } from 'vue-router';
import { t } from '@/hooks/useI18n';

const moduleName = 'account';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/account',
    name: moduleName,
    // redirect: '/login',
    meta: {
      title: t('routes.dashboard.dashboard'),
      icon: 'ant-design:dashboard-outlined',
    },
    component: () => import('@/views/login/index.vue'),
    children: [
      {
        path: '/account1',
        name: `${moduleName}-1`,
        // redirect: '/login',
        meta: {
          title: t('routes.dashboard.dashboard'),
          icon: 'ant-design:dashboard-outlined',
        },
        component: () => import('@/views/login/index.vue'),
        children: [],
      },
      {
        path: '/account2',
        name: `${moduleName}-2`,
        // redirect: '/login',
        meta: {
          title: t('routes.dashboard.dashboard'),
          icon: 'ant-design:dashboard-outlined',
        },
        component: () => import('@/views/login/index.vue'),
        children: [],
      },
    ],
  },
];

export default routes;
