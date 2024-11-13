import { defHttp } from '@/utils/http/axios'
import { AxiosRequestConfig, AxiosRequestHeaders } from 'axios'
import { TokenTypes } from '../enums/coreEnum'
import { ContentTypeEnum } from '@/enums/httpEnum'
import { localeSetting } from '@/settings/localeSetting'
import { getAppEnvConfig } from '@/utils/env'

/**
 * @description: enum api handshake
 */
enum Api {
  Handshake = '/auth/handshake',
}

const { VITE_APP_SECRET: appSecret, VITE_APP_IDENTIFIER: appIdentifier } = getAppEnvConfig()
const language = localeSetting.locale

export async function getHandshakeToken(): Promise<string> {
  return `HSK $2y$10$tF/laRuexMCE.Z2YMOq0xOgy7NFadlgnIEiiR1OLPpMq9kEaaPrcC`
}

export function getDefaultAxiosOption(token: string | undefined = undefined) {
  const headers: AxiosRequestHeaders | any = {}
  headers.Accept = 'application/vnd.api+json'
  headers['Content-Type'] = 'application/vnd.api+json'
  headers['X-LANG'] = language
  headers['X-IDENTIFIER'] = appSecret ?? 'demo'
  if (token !== undefined) {
    headers.Authorization = token
  }
  return headers
}

export function getDefaultAxiosOptionUpload(token: string | undefined = undefined) {
  const headers: AxiosRequestHeaders | any = {}
  headers.Accept = 'application/vnd.api+json'
  headers['Content-Type'] = ContentTypeEnum.FORM_DATA
  headers['X-LANG'] = language
  headers['X-IDENTIFIER'] = appSecret ?? 'demo'
  // @ts-ignore
  headers.ignoreCancelToken = true
  if (token !== undefined) {
    headers.Authorization = token
  }
  return headers
}

export async function getApiCoreToken(tkType: TokenTypes): Promise<any | undefined> {
  // let retToken: string | undefined = '';
  let hsk: string | undefined = ''
  switch (tkType) {
    case TokenTypes.HANDSHAKE_TOKEN:
      return getHandshakeToken()
    case TokenTypes.LOGIN_TOKEN:
      hsk = await getHandshakeToken()
      const config: AxiosRequestConfig<any> = {
        headers: getDefaultAxiosOption(hsk),
        url: Api.Handshake,
      }
      return defHttp.get<any>(config, { errorMessageMode: 'none' })
    default:
      return undefined
  }
}
