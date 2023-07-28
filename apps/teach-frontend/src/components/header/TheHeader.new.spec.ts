import { describe, expect, it } from 'vitest'
import { useGoto } from '@/composables/goto'
import { RouteNames } from '@/router/const'
import { useSetup } from '@/tests/helper'

describe('TheHeader', () => {
  it('点击后应该返回主页', () => {
    const { router } = useSetup(() => {
      const { gotoHome } = useGoto()
      gotoHome()
    },
    )
    // 我们主要验证调用方法后是否走了 router.push
    // 通过 wrapper 获取到 router.push
    expect(router.push).toHaveBeenLastCalledWith({ name: RouteNames.HOME })
  })

  it('点击后应进入设置页面', () => {
    const { router } = useSetup(() => {
      const { gotoSettings } = useGoto()
      gotoSettings()
    })

    expect(router.push).toHaveBeenCalledWith({ name: RouteNames.SETTINGS })
  })
})
