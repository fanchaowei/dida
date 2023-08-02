import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { useSearchCommands } from '../searchCommands'
import { useCommand } from '@/composables/command'

describe('searchCommands', () => {
  beforeAll(() => {
    // 添加测试数据
    const { addCommand } = useCommand()
    addCommand({
      name: '前往主页',
      execute() {},
    })
    addCommand({
      name: '',
      execute() {},
    })
  })
  beforeEach(() => {
    // 重置数据
    const { resetSearchCommands } = useSearchCommands()
    resetSearchCommands()
  })
  afterAll(() => {
    // 清空数据
    const { resetCommand } = useCommand()
    resetCommand()
  })
  it('当只输入一个特定指令时，显示对应的指令', async () => {
    const { searchCommands, filteredCommands } = useSearchCommands()
    const searchText = '主页'
    searchCommands(searchText)
    expect(filteredCommands.value.length).toBe(1)
    expect(filteredCommands.value[0].name).toBe('前往主页')
  })

  it('当清空搜索时，显示全部指令', async () => {
    const { searchCommands, filteredCommands } = useSearchCommands()
    const searchText = ''
    searchCommands(searchText)
    expect(filteredCommands.value.length).toBe(2)
  })
})
