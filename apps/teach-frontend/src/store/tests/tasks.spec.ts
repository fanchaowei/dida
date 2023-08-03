import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { TaskStatus, completeSmartProject, useTasksSelectorStore, useTasksStore } from '@/store'
import { fetchAllTasks, fetchCompleteTask, fetchCreateTask, fetchMoveTaskToProject, fetchRemoveTask, fetchRestoreTask } from '@/api'
import { liveListProject } from '@/tests/fixture'

vi.mock('@/api')
vi.mocked(fetchCreateTask).mockImplementation(async (title) => {
  return createTaskResponse(title)
})
vi.mocked(fetchAllTasks).mockImplementation(async ({ status }) => {
  return [createTaskResponse('吃饭', status)]
})
// 创建 task 接口返回数据
function createTaskResponse(title: string, status = TaskStatus.ACTIVE) {
  return {
    title,
    content: '',
    status,
    projectId: '',
    position: 1,
    _id: '1',
    createdAt: new Date().toString(),
    updatedAt: new Date().toString(),
  }
}
// 创建一个测试任务的工厂函数
async function useAddTaskFactory(title = '运动') {
  // 处理一下不测试的边缘数据
  const tasksSelectorStore = useTasksSelectorStore()
  tasksSelectorStore.currentSelector = liveListProject

  const tasksStore = useTasksStore()
  const task = await tasksStore.addTask(title)
  return task
}

describe('tasksStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })
  afterEach(() => {
    vi.clearAllMocks()
    const tasksStore = useTasksStore()
    tasksStore.currentActiveTask = undefined
  })
  describe('addTask', () => {
    it('happy path, 添加一个任务', async () => {
    // 处理一下不测试的边缘数据
      const tasksSelectorStore = useTasksSelectorStore()
      tasksSelectorStore.currentSelector = liveListProject

      const tasksStore = useTasksStore()
      // 先添加一个任务，为了测试新添加的任务会在头部
      await tasksStore.addTask('运动')
      const task = await tasksStore.addTask('吃饭')

      expect(task?.title).toBe('吃饭')
      expect(tasksStore.tasks[0]).toEqual(task)
      expect(tasksStore.currentActiveTask).toEqual(task)
      expect(fetchCreateTask).toBeCalledWith(task?.title, liveListProject.id)
    })
    it('当 currentSelector 为 undefined 时，不添加任务', async () => {
      const tasksStore = useTasksStore()
      const task = await tasksStore.addTask('吃饭')

      expect(task?.title).toBeUndefined()
      expect(tasksStore.tasks.length).toBe(0)
      expect(fetchCreateTask).toBeCalledTimes(0)
    })
    it('当 currentSelector 为 smartProject 时，不添加任务', async () => {
    // 处理一下不测试的边缘数据
      const tasksSelectorStore = useTasksSelectorStore()
      tasksSelectorStore.currentSelector = completeSmartProject

      const tasksStore = useTasksStore()
      const task = await tasksStore.addTask('吃饭')

      expect(task?.title).toBeUndefined()
      expect(tasksStore.tasks.length).toBe(0)
      expect(fetchCreateTask).toBeCalledTimes(0)
    })
  })

  describe('removeTask', async () => {
    it('happy path, 删除一个任务', async () => {
      const tasksStore = useTasksStore()
      const task = await useAddTaskFactory()

      expect(tasksStore.tasks.length).toBe(1)
      await tasksStore.removeTask(task!)

      expect(tasksStore.tasks.length).toBe(0)
      expect(fetchRemoveTask).toBeCalledWith(task!.id)
      expect(tasksStore.currentActiveTask).toBeUndefined()
    })
  })

  describe('completeTask', () => {
    it('happy path, 完成一个任务', async () => {
      const tasksStore = useTasksStore()
      const task = await useAddTaskFactory()

      expect(tasksStore.tasks.length).toBe(1)
      await tasksStore.completeTask(task!)

      expect(tasksStore.tasks.length).toBe(0)
      expect(fetchCompleteTask).toBeCalledWith(task!.id)
      expect(tasksStore.currentActiveTask).toBeUndefined()
    })
  })

  describe('restoreTask', () => {
    it('happy path, 恢复一个任务', async () => {
      const tasksStore = useTasksStore()
      const task = await useAddTaskFactory()

      expect(tasksStore.tasks.length).toBe(1)
      await tasksStore.restoreTask(task!)

      expect(tasksStore.tasks.length).toBe(0)
      expect(fetchRestoreTask).toBeCalledWith(task!.id)
      expect(tasksStore.currentActiveTask).toBeUndefined()
    })
  })

  describe('moveTaskToProject', () => {
    it('happy path, 移动一个任务到另一个项目', async () => {
      const tasksStore = useTasksStore()
      const task = await useAddTaskFactory()

      expect(tasksStore.tasks.length).toBe(1)
      const projectId = '2'
      await tasksStore.moveTaskToProject(task!, projectId)

      expect(tasksStore.tasks.length).toBe(0)
      expect(fetchMoveTaskToProject).toBeCalledWith(task!.id, projectId)
      expect(tasksStore.currentActiveTask).toBeUndefined()
    })
  })

  describe('updateTasks', () => {
    it('happy path, 更新所有任务', async () => {
      const tasksStore = useTasksStore()
      tasksStore.updateTasks([createTaskResponse('吃饭')])
      expect(tasksStore.tasks.length).toBe(1)
    })
  })

  describe('changeActiveTask', async () => {
    it('happy path, 传入一个 task, 切换当前活跃任务', async () => {
      const tasksStore = useTasksStore()
      const task = await useAddTaskFactory('吃饭')

      tasksStore.currentActiveTask = undefined

      tasksStore.changeActiveTask(task)
      expect(tasksStore.currentActiveTask).toEqual(task)
    })
    it('happy path, 传入一个 task 的 id, 切换当前活跃任务', async () => {
      const tasksStore = useTasksStore()
      const task = await useAddTaskFactory('吃饭')
      tasksStore.currentActiveTask = undefined

      tasksStore.changeActiveTask(task!.id)
      expect(tasksStore.currentActiveTask).toEqual(task)
    })
  })

  describe('findAllTasksNotRemoved', () => {
    it('happy path, 获取所有未删除的任务', async () => {
      const tasksStore = useTasksStore()

      const allTasks = await tasksStore.findAllTasksNotRemoved()
      expect(fetchAllTasks).toBeCalledWith({ status: TaskStatus.ACTIVE })
      expect(fetchAllTasks).toBeCalledWith({ status: TaskStatus.COMPLETED })
      expect(allTasks.length).toBe(2)
    })
  })
})
