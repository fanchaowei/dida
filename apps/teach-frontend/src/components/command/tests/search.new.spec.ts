import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { createTestingPinia } from '@pinia/testing' // 这个库可以将我们所有写的 pinia 都添加 stub
import { useSearch } from '../search'
import { useSearchTasks } from '../searchTasks'
import { useSearchCommands } from '../searchCommands'
import { completeSmartProject, useListProjectsStore, useTasksStore } from '@/store'
import { liveListProject, tasks } from '@/tests/fixture'
import { useCommand } from '@/composables/command'

describe('群居测试 search', () => {
  beforeAll(() => {
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
    vi.useFakeTimers()

    createTestingPinia({
      createSpy: vi.fn, // 给所有的 store 添加 spy
    })

    const tasksStore = useTasksStore()
    vi.mocked(tasksStore.findAllTasksNotRemoved).mockResolvedValue(tasks)
    const projectsStore = useListProjectsStore()
    vi.mocked(projectsStore.findProject).mockReturnValue(liveListProject)
  })
  afterEach(async () => {
    // 重置搜索
    const { resetSearch } = useSearch()
    resetSearch()
    // 重置数据
    const { resetSearchCommands } = useSearchCommands()
    resetSearchCommands()
    await vi.runAllTimersAsync()
    vi.useRealTimers()
  })
  afterAll(() => {
    // 清空数据
    const { resetCommand } = useCommand()
    resetCommand()
  })

  describe('ui 交互相关', () => {
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
    it('当搜索完成时，searching 应该是 true', async () => {
      const { search, searching } = useSearch()
      search.value = '吃饭'
      await vi.runAllTimersAsync()
      expect(searching.value).toBe(true)
    })
  })

  describe('搜索任务 tasks', () => {
    it('当搜索特定任务 title 时，返回对应任务', async () => {
      const { search } = useSearch()
      const { filteredTasks } = useSearchTasks()
      search.value = '吃饭'
      await vi.runAllTimersAsync()
      expect(filteredTasks.value.length).toBe(1)
      const task = filteredTasks.value[0].item
      expect(task.title).toBe('吃饭')
      expect(task).toHaveProperty('desc')
      expect(task).toHaveProperty('done')
      expect(task).toHaveProperty('from')
      expect(task).toHaveProperty('id')
    })
    it('搜索任务的 Content 时，返回相关任务', async () => {
      const { search } = useSearch()
      const { filteredTasks } = useSearchTasks()
      search.value = '吃什么'
      await vi.runAllTimersAsync()
      expect(filteredTasks.value.length).toBe(1)
    })
    it('当搜索到的任务的 status 是 ACTIVE 时,from 属性应该是 listProject 获取', async () => {
      const { search } = useSearch()
      const { filteredTasks } = useSearchTasks()
      search.value = '吃饭'
      await vi.runAllTimersAsync()
      expect(filteredTasks.value[0].item.done).toBe(false)
      expect(filteredTasks.value[0].item.from?.name).toBe('生活')
    })
    it('当搜索到的任务的 status 是 COMPLETE 时,from 属性应该是已完成', async () => {
      const { search } = useSearch()
      const { filteredTasks } = useSearchTasks()
      search.value = '运动'
      await vi.runAllTimersAsync()

      expect(filteredTasks.value[0].item.done).toBe(true)
      expect(filteredTasks.value[0].item.from?.name).toBe(completeSmartProject.name)
    })
    it('当清空搜索时，重置', async () => {
      const { search } = useSearch()
      const { filteredTasks } = useSearchTasks()
      search.value = '吃饭'
      await vi.runAllTimersAsync()
      search.value = ''
      await vi.runAllTimersAsync()
      expect(filteredTasks.value.length).toBe(0)
    })
  })

  describe('搜索指令 command', () => {
    it('当只输入一个特定指令时，显示对应的指令', async () => {
      const { search } = useSearch()
      const { filteredCommands } = useSearchCommands()
      search.value = '>主页'
      await vi.runAllTimersAsync()
      expect(filteredCommands.value.length).toBe(1)
      expect(filteredCommands.value[0].name).toBe('前往主页')
    })

    it('当清空搜索时，显示全部指令', async () => {
      const { search } = useSearch()
      const { filteredCommands } = useSearchCommands()
      search.value = '>主页'
      await vi.runAllTimersAsync()
      search.value = ''
      await vi.runAllTimersAsync()
      expect(filteredCommands.value.length).toBe(2)
    })
  })
})
