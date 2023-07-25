import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useRouter } from 'vue-router'
import { useGoto } from './theHeader'
import { RouteNames } from '@/router/const'

// 因为 vue-router 是 Vue 实例的一个插件，需要在 setup 环境里才能使用，所以需要 mock
vi.mock('vue-router')
const mockFn = vi.fn()

vi.mocked(useRouter as () => { push: Function }).mockImplementation(() => {
  return {
    push: mockFn,
  }
})

describe('TheHeader', () => {
  beforeEach(() => {
    // 重置 mock
    mockFn.mockClear()
  })

  it('点击后应该返回主页', () => {
    const { goToHome } = useGoto()
    goToHome()
    // 我们主要验证调用方法后是否走了 router.push
    expect(mockFn).toHaveBeenCalledWith({ name: RouteNames.HOME })
  })

  it('点击后应进入设置页面', () => {
    const { goToSettings } = useGoto()
    goToSettings()
    expect(mockFn).toHaveBeenCalledWith({ name: RouteNames.SETTINGS })
  })
})
