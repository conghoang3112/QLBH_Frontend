import { getToken } from '@/utils/auth'
import { defHttp } from '@/utils/http/axios'
import { LoginParams, LoginResultModel, GetUserInfoModel } from './model/userModel'
import { getApiCoreToken, getDefaultAxiosOption } from './helper/core'
import { TokenTypes } from './enums/coreEnum'

import { ErrorMessageMode } from '#/axios'
import { AxiosRequestConfig } from 'axios'

enum Api {
  Login = '/auth/login',
  Logout = '/auth/logout',
  ChangePassword = '/auth/change-password',
  GetUserInfo = '/auth/profile',
  ForgotPassword = '/auth/forgot-password',
  ResetPassword = '/auth/reset-password',
  GetPermCode = '/getPermCode',
  TestRetry = '/testRetry',
}

/**
 * @description: user login api
 */
export async function loginApi(params: LoginParams, mode: ErrorMessageMode = 'modal') {
  const loginToken = await getApiCoreToken(TokenTypes.LOGIN_TOKEN)
  console.log('loginToken', loginToken)
  const { message } = loginToken
  const config: AxiosRequestConfig<any> = {
    headers: getDefaultAxiosOption(`${message?.token_type} ${message?.access_token}`),
    url: Api.Login,
    params: params,
  }
  return defHttp.post<LoginResultModel>(config, {
    errorMessageMode: mode,
  })
}

/**
 * @description: getUserInfo
 */
export function getUserInfo() {
  const token: any = getToken()
  const config: AxiosRequestConfig<any> = {
    headers: getDefaultAxiosOption(token),
    url: Api.GetUserInfo,
  }
  return defHttp.get<any>(config, { errorMessageMode: 'none' })
}

/**
 * @description: user forgot-password api
 */
export async function forgotPasswordApi(params: any, mode: ErrorMessageMode = 'modal') {
  const token = await getApiCoreToken(TokenTypes.LOGIN_TOKEN)
  const { message } = token
  const config: AxiosRequestConfig<any> = {
    headers: getDefaultAxiosOption(`${message?.token_type} ${message?.access_token}`),
    url: Api.ForgotPassword,
    params: params,
  }
  return defHttp.post<LoginResultModel>(config, {
    errorMessageMode: mode,
  })
}

/**
 * @description: user reset-password api
 */
export async function resetPasswordApi(params: any, mode: ErrorMessageMode = 'modal') {
  const token = await getApiCoreToken(TokenTypes.LOGIN_TOKEN)
  const { message } = token
  const config: AxiosRequestConfig<any> = {
    headers: getDefaultAxiosOption(`${message?.token_type} ${message?.access_token}`),
    url: Api.ResetPassword,
    params: params,
  }
  return defHttp.post<LoginResultModel>(config, {
    errorMessageMode: mode,
  })
}

export function getPermCode() {
  return defHttp.get<string[]>({ url: Api.GetPermCode })
}

export function doLogout() {
  const token: any = getToken()
  const config: AxiosRequestConfig<any> = {
    headers: getDefaultAxiosOption(token),
    url: Api.Logout,
  }
  return defHttp.get(config)
}

export function testRetry() {
  return defHttp.get(
    { url: Api.TestRetry },
    {
      retryRequest: {
        isOpenRetry: true,
        count: 5,
        waitTime: 1000,
      },
    },
  )
}
