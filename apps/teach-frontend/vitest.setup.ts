import { VueRouterMock, createRouterMock, injectRouterMock } from 'vue-router-mock'
import { config } from '@vue/test-utils'
import { beforeEach, vi } from 'vitest'

function setupRouterMock() {
// 创建一个 router mock
  const router = createRouterMock({
    spy: {
      create: fn => vi.fn(fn), // fn 传入的是 router 的方法，我们用 vi.fn 监听它的调用
      reset: spy => spy.mockClear(), // 重置 spy
    },
  })

  // 全局注入以确保 `useRoute ()`、`$route` 等工作
  // 这里就是构建一个 Vue 的环境，injectRouterMock 则是将我们模拟的这个 router 挂载到这个 Vue 环境上去
  config.plugins.VueWrapper.install(VueRouterMock)

  beforeEach(() => {
  // 重置 router mock
    router.reset()
    // 将 router 挂载到全局
    injectRouterMock(router)
  })
}

setupRouterMock()
