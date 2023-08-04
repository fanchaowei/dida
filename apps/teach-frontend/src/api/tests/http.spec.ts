import { afterEach, describe, expect, it, vi } from 'vitest'
import AxiosMockAdapter from 'axios-mock-adapter'
import { http } from '../http'
import { cleanToken, setToken } from '@/utils/token'
import { messageError, messageRedirectToSignIn } from '@/composables/message'
import { goToLogin } from '@/composables'

vi.mock('@/composables/message')

describe('http', () => {
  afterEach(() => {
    // 每个测试结束后重置 token
    cleanToken()
    vi.clearAllMocks()
  })
  it('当有 token 时，请求头中的 Authorization 应包含 token', async () => {
    const axiosMock = new AxiosMockAdapter(http)
    setToken('token')

    // 模拟请求对应 url 时的响应
    axiosMock.onGet('/task').reply(200, {
      code: 0,
      data: null, // 不关心返回值
      message: '',
    })

    // 发起请求
    await http.get('/task')

    // 通过 axiosMock 的 history 取到上一次请求的相关信息
    expect(axiosMock.history.get[0].headers?.Authorization).toBe('Bearer token')
  })
  it('当返回的 code 为 0 时，应返回 data', async () => {
    const axiosMock = new AxiosMockAdapter(http)
    // 模拟请求对应 url 时的响应
    const resData = '睡觉'
    axiosMock.onGet('/task').reply(200, {
      code: 0,
      data: resData, // 不关心返回值
      message: '',
    })

    // 发起请求
    const data = await http.get('/task')
    expect(data).toBe(resData)
  })
  it('当返回的 code 不为 0 时，应报错', async () => {
    const axiosMock = new AxiosMockAdapter(http)

    // 模拟请求对应 url 时的响应
    const resMsg = 'an error'
    axiosMock.onGet('/task').reply(200, {
      code: -1,
      data: null, // 不关心返回值
      message: resMsg,
    })
    await expect(() => http.get('/task')).rejects.toThrow(resMsg)
    expect(messageError).toBeCalledWith(resMsg)
  })
  it('当返回的 code 为 401 时，应跳转到登录页', async () => {
    const axiosMock = new AxiosMockAdapter(http)
    axiosMock.onGet('/task').reply(401)

    await expect(() => http.get('/task')).rejects.toThrow()
    expect(messageRedirectToSignIn).toBeCalledWith(goToLogin)
  })
})
