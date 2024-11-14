import type { AppRouteModule } from '@/router/types'

import { LAYOUT } from '@/router/constant'

const user: AppRouteModule = {
  path: '/',
  name: 'User',
  component: LAYOUT,
  meta: {
    hideChildrenInMenu: false,
    icon: 'ph:user',
    title: 'Quản lý tài khoản',
    orderNo: 10,
    permissions: [
      // PermissionEnum.NHANSU_SEARCH,
      // PermissionEnum.NHANSU_CREATE,
      // PermissionEnum.NHANSU_UPDATE,
      // PermissionEnum.NHANSU_DELETE,
    ],
  },
  children: [
    {
      path: '/user',
      name: 'UserPage',
      component: () => import('@/views/user/index.vue'),
      meta: {
        title: 'Danh sách tài khoản',
        hideMenu: false,
        ignoreKeepAlive: true,
        permissions: [
          // PermissionEnum.NHANSU_SEARCH,
          // PermissionEnum.NHANSU_CREATE,
          // PermissionEnum.NHANSU_UPDATE,
          // PermissionEnum.NHANSU_DELETE,
        ],
      },
    },
  ],
}

export default user
