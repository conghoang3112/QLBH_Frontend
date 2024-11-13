/**
 * @description: Login interface parameters
 */
export interface LoginParams {
  username: string
  password: string
}

export interface RoleInfo {
  roleName: string
  value: string
}

/**
 * @description: Login interface return value
 */
export interface LoginResultModel {
  userId: string | number
  token: string
  roles: RoleInfo[]
}

/**
 * @description: Get user information return value
 */
export interface GetUserInfoModel {
  id: string | number
  userName: string
  fullName?: string
  role?: string
}
