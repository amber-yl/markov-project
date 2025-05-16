import type { RouteRecordRaw } from 'vue-router';
import { t } from '@/hooks/useI18n';

const moduleName = 'dashboard';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/dashboard',
    name: moduleName,
    redirect: '/dashboard/welcome',
    meta: {
      title: t('routes.dashboard.dashboard'),
      icon: 'ant-design:dashboard-outlined',
    },
    children: [
      {
        path: 'welcome',
        name: `${moduleName}-welcome`,
        meta: {
          title: t('routes.dashboard.workbench'),
          icon: 'ant-design:home-filled',
        },
        component: () => import('@/views/dashboard/welcome/index.vue'),
      },
      {
        path: 'welcome1',
        name: `${moduleName}-welcome1`,
        meta: {
          title: t('routes.dashboard.workbench'),
          icon: 'ant-design:home-filled',
        },
        component: () => import('@/views/error/comp-not-found.vue'),
      },
    ],
  },
];

export default routes;
