import { beforeEach, describe, expect, it, vi } from 'vitest'
import { VueRouterMock, createRouterMock, injectRouterMock } from 'vue-router-mock'
import { config, mount } from '@vue/test-utils'
import { useGoto } from '@/composables/goto'
import { RouteNames } from '@/router/const'

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

describe('TheHeader', () => {
  beforeEach(() => {
    // 重置 router mock
    router.reset()
    // 将 router 挂载到全局
    injectRouterMock(router)
  })
  it('点击后应该返回主页', () => {
    // 构建一个组件实例
    const Comp = {
      render() {},
      setup() {
        const { gotoHome } = useGoto()
        gotoHome()
      },
    }
    // 挂载组件
    const wrapper = mount(Comp)
    // 我们主要验证调用方法后是否走了 router.push
    // 通过 wrapper 获取到 router.push
    expect(wrapper.router.push).toHaveBeenLastCalledWith({ name: RouteNames.HOME })
  })
})
