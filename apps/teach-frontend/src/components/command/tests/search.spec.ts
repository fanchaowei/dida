import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useSearch } from '../search'

const searchTasks = vi.fn()
const resetSearchTasks = vi.fn()
const searchCommands = vi.fn()
const resetSearchCommands = vi.fn()
vi.mock('../searchTasks.ts', () => {
  return {
    useSearchTasks() {
      return {
        searchTasks,
        resetSearchTasks,
      }
    },
  }
})

vi.mock('../searchCommands.ts', () => {
  return {
    useSearchCommands() {
      return {
        searchCommands,
        resetSearchCommands,
      }
    },
  }
})

describe('search', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(async () => {
    // 重置搜索
    const { resetSearch } = useSearch()
    resetSearch()

    // 由于 resetSearch 会触发 watch，所以等待一下
    await vi.runAllTimersAsync()
    // 重置 mock
    vi.clearAllMocks()
    // 重置 fake timers
    vi.useRealTimers()
  })
  it('当搜索时，图标需替换为加载中', async () => {
    const { search, loading } = useSearch()
    search.value = 'test'
    await vi.advanceTimersToNextTimerAsync()
    expect(loading.value).toBe(true)
  })
  it('当搜索完成时，加载图标消失', async () => {
    const { search, loading } = useSearch()
    search.value = 'test'
    await vi.runAllTimersAsync()
    expect(loading.value).toBe(false)
  })
  it('当搜索的是任务的时候，触发 searchTask', async () => {
    const { search } = useSearch()
    const searchText = 'test'
    search.value = searchText
    await vi.runAllTimersAsync()
    expect(searchTasks).toBeCalledWith(searchText)
  })
  it('当搜索的是命令的时候，触发 searchCommands', async () => {
    const { search } = useSearch()
    const searchText = '>test'
    search.value = searchText
    await vi.runAllTimersAsync()
    expect(searchCommands).toBeCalledWith('test')
  })
  it('当搜索的是命令的时候, 命令中带有空格，触发 searchCommands, 并消除命令中的空格', async () => {
    const { search } = useSearch()
    const searchText = '>test '
    search.value = searchText
    await vi.runAllTimersAsync()
    expect(searchCommands).toBeCalledWith('test')
  })
  it('当清空搜索的时候，重置', async () => {
    const { search, loading, searching } = useSearch()
    const searchText = '>test'
    search.value = searchText
    await vi.runAllTimersAsync()
    search.value = ''
    await vi.runAllTimersAsync()
    expect(loading.value).toBe(false)
    expect(searching.value).toBe(false)
    expect(resetSearchCommands).toBeCalled()
    expect(resetSearchTasks).toBeCalled()
  })
})
