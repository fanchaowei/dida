import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createTestingPinia } from '@pinia/testing' // 这个库可以将我们所有写的 pinia 都添加 stub
import { useSearchTasks } from '../searchTasks'
import { useTasksStore } from '@/store/tasks'
import { completeSmartProject, useListProjectsStore } from '@/store'
import { liveListProject, tasks } from '@/tests/fixture'

describe('searchTask', () => {
  beforeEach(() => {
    // mock pinia
    createTestingPinia({
      createSpy: vi.fn, // 给所有的 store 添加 spy
    })

    // 设置测试需要的 mock 数据
    const tasksStore = useTasksStore()
    vi.mocked(tasksStore.findAllTasksNotRemoved).mockResolvedValue(tasks)

    const projectsStore = useListProjectsStore()
    vi.mocked(projectsStore.findProject).mockReturnValue(liveListProject)
  })
  afterEach(() => {
    // 重置
    const { resetSearchTasks } = useSearchTasks()
    resetSearchTasks()
  })
  it('搜索任务的 title 时，返回对应的任务', async () => {
    const { searchTasks, filteredTasks } = useSearchTasks()
    const taskTitle = '吃饭'
    await searchTasks(taskTitle)

    expect(filteredTasks.value.length).toBe(1)
    const task = filteredTasks.value[0].item
    expect(task.title).toBe(taskTitle)
    expect(task).toHaveProperty('desc')
    expect(task).toHaveProperty('done')
    expect(task).toHaveProperty('from')
    expect(task).toHaveProperty('id')
  })
  it('搜索任务的 content 时，返回对应的任务', async () => {
    const { searchTasks, filteredTasks } = useSearchTasks()
    await searchTasks('吃什么')

    expect(filteredTasks.value.length).toBe(1)
  })
  it('搜索不存在的任务时，返回空数组', async () => {
    const { searchTasks, filteredTasks } = useSearchTasks()
    await searchTasks('写代码')

    expect(filteredTasks.value.length).toBe(0)
  })
  it('当搜索到的任务的 status 是 ACTIVE 时,from 属性应该是 listProject 获取', async () => {
    const { searchTasks, filteredTasks } = useSearchTasks()
    await searchTasks('吃饭')

    expect(filteredTasks.value[0].item.done).toBe(false)
    expect(filteredTasks.value[0].item.from?.name).toBe('生活')
  })
  it('当搜索到的任务的 status 是 COMPLETE 时,from 属性应该是已完成', async () => {
    const { searchTasks, filteredTasks } = useSearchTasks()
    await searchTasks('运动')

    expect(filteredTasks.value[0].item.done).toBe(true)
    expect(filteredTasks.value[0].item.from?.name).toBe(completeSmartProject.name)
  })
  it('当清空搜索时，重置', async () => {
    const { searchTasks, filteredTasks, resetSearchTasks } = useSearchTasks()
    await searchTasks('吃饭')
    resetSearchTasks()
    expect(filteredTasks.value.length).toBe(0)
  })
})
