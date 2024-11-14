import type { AppRouteModule } from '@/router/types'

import { LAYOUT } from '@/router/constant'

const confirmAction: AppRouteModule = {
  path: '/',
  name: 'confirmAction',
  component: LAYOUT,
  meta: {
    hideChildrenInMenu: false,
    icon: 'lucide:list-todo',
    title: 'Phê duyệt',
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
      path: '/confirm-action',
      name: 'confirmPage',
      component: () => import('@/views/confirm-action/index.vue'),
      meta: {
        title: 'Danh sách lệnh',
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

export default confirmAction
