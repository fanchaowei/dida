import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { computed } from 'vue'
import { showCommandModal, useCommandModal } from '../commandModal'
import * as misc from '@/composables/misc'
import { fireEvent, useSetup } from '@/tests/helper'

describe('commandModal', () => {
  beforeEach(() => {
    showCommandModal.value = false
  })
  afterAll(() => {
    showCommandModal.value = false
  })

  it('打开搜索', () => {
    const { openCommandModal } = useCommandModal()
    openCommandModal()
    expect(showCommandModal.value).toBe(true)
  })

  it('关闭搜索', () => {
    const { closeCommandModal } = useCommandModal()
    closeCommandModal()
    expect(showCommandModal.value).toBe(false)
  })

  it('在 Mac 上通过快捷键 cmd + k 打开搜索', () => {
    const { registerKeyboardShortcut } = useCommandModal()
    // 因为 registerKeyboardShortcut 方法需要调用 useIsMac 方法来判断是否是 Mac ，所以需要 mock 掉 useIsMac 方法
    // 这种方式是最佳的 mock 方式，即不影响同文件内的其他方法，也不影响其他文件
    vi.spyOn(misc, 'useIsMac').mockReturnValue(computed(() => true))
    const { wrapper } = useSetup(() => {
      registerKeyboardShortcut()
    })

    // 模拟按下 cmd + k
    fireEvent.keydown({ key: 'k', metaKey: true })
    expect(showCommandModal.value).toBe(true)

    // 调用生命周期 unmounted，来销毁组件重置测试
    wrapper.unmount()
  })

  it('在 win 上通过快捷键 ctrl + k 打开搜索', () => {
    const { registerKeyboardShortcut } = useCommandModal()
    vi.spyOn(misc, 'useIsMac').mockReturnValue(computed(() => false))
    const { wrapper } = useSetup(() => {
      registerKeyboardShortcut()
    })
    fireEvent.keydown({ key: 'k', ctrlKey: true })
    expect(showCommandModal.value).toBe(true)
    wrapper.unmount()
  })
})
