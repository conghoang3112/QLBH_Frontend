import type { AppRouteRecordRaw, Menu } from '@/router/types'

import { defineStore } from 'pinia'
import { store } from '@/store'
import { useI18n } from '@/hooks/web/useI18n'
import { useUserStore } from './user'
import { useAppStoreWithOut } from './app'
import { toRaw } from 'vue'
import { transformObjToRoute, flatMultiLevelRoutes } from '@/router/helper/routeHelper'
import { transformRouteToMenu } from '@/router/helper/menuHelper'

import projectSetting from '@/settings/projectSetting'

import { PermissionModeEnum } from '@/enums/appEnum'

import { asyncRoutes } from '@/router/routes'
import { ERROR_LOG_ROUTE, PAGE_NOT_FOUND_ROUTE } from '@/router/routes/basic'

import { filter } from '@/utils/helper/treeHelper'

import { getMenuList } from '@/api/sys/menu'
import { getPermCode } from '@/api/sys/user'

import { useMessage } from '@/hooks/web/useMessage'
import { PageEnum } from '@/enums/pageEnum'

interface PermissionState {
  // Permission code list
  permCodeList: string[] | number[]
  // Whether the route has been dynamically added
  isDynamicAddedRoute: boolean
  // To trigger a menu update
  lastBuildMenuTime: number
  // Backstage menu list
  backMenuList: Menu[]
  // Menu list
  frontMenuList: Menu[]
}

export const usePermissionStore = defineStore({
  id: 'app-permission',
  state: (): PermissionState => ({
    // Permission code list
    permCodeList: [],
    // Whether the route has been dynamically added
    isDynamicAddedRoute: false,
    // To trigger a menu update
    lastBuildMenuTime: 0,
    // Backstage menu list
    backMenuList: [],
    // Menu List
    frontMenuList: [],
  }),
  getters: {
    getPermCodeList(state): string[] | number[] {
      return state.permCodeList
    },
    getBackMenuList(state): Menu[] {
      return state.backMenuList
    },
    getFrontMenuList(state): Menu[] {
      return state.frontMenuList
    },
    getLastBuildMenuTime(state): number {
      return state.lastBuildMenuTime
    },
    getIsDynamicAddedRoute(state): boolean {
      return state.isDynamicAddedRoute
    },
  },
  actions: {
    setPermCodeList(codeList: string[]) {
      this.permCodeList = codeList
    },

    setBackMenuList(list: Menu[]) {
      this.backMenuList = list
      list?.length > 0 && this.setLastBuildMenuTime()
    },

    setFrontMenuList(list: Menu[]) {
      this.frontMenuList = list
    },

    setLastBuildMenuTime() {
      this.lastBuildMenuTime = new Date().getTime()
    },

    setDynamicAddedRoute(added: boolean) {
      this.isDynamicAddedRoute = added
    },
    resetState(): void {
      this.isDynamicAddedRoute = false
      this.permCodeList = []
      this.backMenuList = []
      this.lastBuildMenuTime = 0
    },
    async changePermissionCode() {
      const codeList = await getPermCode()
      this.setPermCodeList(codeList)
    },

    // Build route
    async buildRoutesAction(): Promise<AppRouteRecordRaw[]> {
      const { t } = useI18n()
      const userStore = useUserStore()
      const appStore = useAppStoreWithOut()

      let routes: AppRouteRecordRaw[] = []
      const roleList = toRaw(userStore.getRoleList) || []
      const { permissionMode = projectSetting.permissionMode } = appStore.getProjectConfig

      // Routing filter is passed in function filter as a callback for traversal use
      const routeFilter = (route: AppRouteRecordRaw) => {
        const { meta } = route
        // Draw out the character
        const { roles } = meta || {}
        if (!roles) return true
        // Determine role permissions
        return roleList.some((role) => roles.includes(role))
      }

      const routeRemoveIgnoreFilter = (route: AppRouteRecordRaw) => {
        const { meta } = route
        // If ignoreRoute is true, the route is only used for menu generation and will not appear in the actual routing table.
        const { ignoreRoute } = meta || {}
        // arr.filter returns true indicating that the element passes the test
        return !ignoreRoute
      }

      /**
       * @description According to the set homepage path, correct the affix tag in routes (fixed homepage)
       * */
      const patchHomeAffix = (routes: AppRouteRecordRaw[]) => {
        if (!routes || routes.length === 0) return
        let homePath: string = userStore.getUserInfo.homePath || PageEnum.BASE_HOME

        function patcher(routes: AppRouteRecordRaw[], parentPath = '') {
          if (parentPath) parentPath = parentPath + '/'
          routes.forEach((route: AppRouteRecordRaw) => {
            const { path, children, redirect } = route
            const currentPath = path.startsWith('/') ? path : parentPath + path
            if (currentPath === homePath) {
              if (redirect) {
                homePath = route.redirect! as string
              } else {
                route.meta = Object.assign({}, route.meta, { affix: true })
                throw new Error('end')
              }
            }
            children && children.length > 0 && patcher(children, currentPath)
          })
        }

        try {
          patcher(routes)
        } catch (e) {
          // Processed and exited the loop
        }
        return
      }

      switch (permissionMode) {
        // Role Permissions
        case PermissionModeEnum.ROLE:
          // Filter non-first-level routes
          routes = filter(asyncRoutes, routeFilter)
          // Filter first-level routes based on role permissions
          routes = routes.filter(routeFilter)
          // Convert multi-level routing to level 2 routing
          routes = flatMultiLevelRoutes(routes)
          break

        // Route mapping, enter this case by default
        case PermissionModeEnum.ROUTE_MAPPING:
          // Filter non-first-level routes
          routes = filter(asyncRoutes, routeFilter)
          // Filter first-level routes again based on role permissions
          routes = routes.filter(routeFilter)
          // Convert routes into menus
          const menuList = transformRouteToMenu(routes, true)
          // Remove routes with ignoreRoute: true as non-first-level routes
          routes = filter(routes, routeRemoveIgnoreFilter)
          // Remove the first-level route with ignoreRoute: true;
          routes = routes.filter(routeRemoveIgnoreFilter)
          // Sort menu
          menuList.sort((a, b) => {
            return (a.meta?.orderNo || 0) - (b.meta?.orderNo || 0)
          })

          // Settings menu list
          this.setFrontMenuList(menuList)

          // Convert multi-level routing to level 2 routing
          routes = flatMultiLevelRoutes(routes)
          break

        //  If you are sure that you do not need to do background dynamic permissions, please comment the entire judgment below
        case PermissionModeEnum.BACK:
          const { createMessage } = useMessage()

          createMessage.loading({
            content: t('sys.app.menuLoading'),
            duration: 1,
          })

          // !Simulate to obtain permission codes from the background,
          // This function may only need to be executed once, and the actual project can be put at the right time by itself
          let routeList: AppRouteRecordRaw[] = []
          try {
            await this.changePermissionCode()
            routeList = (await getMenuList()) as AppRouteRecordRaw[]
          } catch (error) {
            console.error(error)
          }

          // Dynamically introduce components
          routeList = transformObjToRoute(routeList)

          // Background routing to menu structure
          const backMenuList = transformRouteToMenu(routeList)
          this.setBackMenuList(backMenuList)

          // remove meta.ignoreRoute item
          routeList = filter(routeList, routeRemoveIgnoreFilter)
          routeList = routeList.filter(routeRemoveIgnoreFilter)

          routeList = flatMultiLevelRoutes(routeList)
          routes = [PAGE_NOT_FOUND_ROUTE, ...routeList]
          break
      }

      routes.push(ERROR_LOG_ROUTE)
      patchHomeAffix(routes)
      return routes
    },
  },
})

// Need to be used outside the setup
export function usePermissionStoreWithOut() {
  return usePermissionStore(store)
}
