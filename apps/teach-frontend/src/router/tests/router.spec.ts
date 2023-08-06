import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { RouterMock } from 'vue-router-mock'
import { createRouterMock } from 'vue-router-mock'
import { routes, setupRouterGuard } from '..'
import { RouteNames } from '../const'
import { cleanToken, setToken } from '@/utils/token'

function setupRouterMock() {
  const router = createRouterMock({
    spy: {
      create: fn => vi.fn(fn),
      reset: spy => spy.mockClear(),
    },
    routes,
    useRealNavigation: true,
  })
  setupRouterGuard(router)

  return router
}

describe('router', () => {
  let router: RouterMock
  beforeEach(() => {
    router = setupRouterMock()
  })
  afterEach(() => {
    vi.clearAllMocks()
    cleanToken()
    router.reset()
    vi.useRealTimers()
  })
  it('当有 token 时，访问需要登录的页面时应跳转到对应页面', async () => {
    setToken('token')
    await router.push({ name: RouteNames.TASK })
    expect(router.currentRoute.value.name).toBe(RouteNames.TASK)
  })
  it('当没有 token 时，访问需要登录的页面时应跳转到登录页', async () => {
    vi.useFakeTimers()
    router.push({ name: RouteNames.TASK })
    await vi.runAllTimersAsync()
    expect(router.currentRoute.value.name).toBe(RouteNames.LOGIN)
  })
  it('没有 token 时，跳转到不需要登录验证的页面时应正常跳转', async () => {
    await router.push({ name: RouteNames.LOGIN })
    expect(router.currentRoute.value.name).toBe(RouteNames.LOGIN)
  })
})
