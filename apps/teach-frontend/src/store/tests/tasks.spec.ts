import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { TaskStatus, completeSmartProject, useTasksSelectorStore, useTasksStore } from '@/store'
import { fetchAllTasks, fetchCompleteTask, fetchCreateTask, fetchMoveTaskToProject, fetchRemoveTask, fetchRestoreTask, fetchUpdateTaskContent, fetchUpdateTaskPosition, fetchUpdateTaskProperties, fetchUpdateTaskTitle } from '@/api'
import { liveListProject } from '@/tests/fixture'

vi.mock('@/api')
vi.mocked(fetchCreateTask).mockImplementation(async (title) => {
  return createTaskResponse({ title })
})
vi.mocked(fetchAllTasks).mockImplementation(async ({ status }) => {
  return [createTaskResponse({
    title: '吃饭',
    status: status!,
  })]
})

let testPosition = 0
let testId = 0
// 创建 task 接口返回数据
function createTaskResponse({ title = '', status, content }: { title: string; status?: TaskStatus; content?: string }) {
  return {
    title,
    content: content ?? '',
    status: status ?? TaskStatus.ACTIVE,
    projectId: '',
    position: testPosition++,
    _id: `${testId++}`,
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
function resetTestData() {
  testId = 0
  testPosition = 0
}

describe('tasksStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })
  afterEach(() => {
    vi.clearAllMocks()
    const tasksStore = useTasksStore()
    tasksStore.currentActiveTask = undefined

    resetTestData()
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
      tasksStore.updateTasks([createTaskResponse({ title: '吃饭' })])
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

  describe('cancelCompleteTask', () => {
    it('撤销恢复中间的任务', async () => {
      const tasksStore = useTasksStore()

      await useAddTaskFactory('吃饭')
      const task = await useAddTaskFactory('睡觉')
      await useAddTaskFactory('写代码')

      await tasksStore.completeTask(task!)

      await tasksStore.cancelCompleteTask(task!)
      expect(tasksStore.tasks[1]).toEqual(task)
      expect(tasksStore.tasks[1].status).toBe(TaskStatus.ACTIVE)
      expect(fetchRestoreTask).toBeCalledWith(task!.id)
    })
    it('撤销恢复最后一个任务', async () => {
      const tasksStore = useTasksStore()

      const task = await useAddTaskFactory('吃饭')
      await useAddTaskFactory('睡觉')
      await useAddTaskFactory('写代码')

      await tasksStore.completeTask(task!)

      await tasksStore.cancelCompleteTask(task!)
      expect(tasksStore.tasks[2]).toEqual(task)
      expect(tasksStore.tasks[2].status).toBe(TaskStatus.ACTIVE)
      expect(fetchRestoreTask).toBeCalledWith(task!.id)
    })
    it('撤销恢复第一个任务', async () => {
      const tasksStore = useTasksStore()

      await useAddTaskFactory('吃饭')
      await useAddTaskFactory('睡觉')
      const task = await useAddTaskFactory('写代码')

      await tasksStore.completeTask(task!)

      await tasksStore.cancelCompleteTask(task!)
      expect(tasksStore.tasks[0]).toEqual(task)
      expect(tasksStore.tasks[0].status).toBe(TaskStatus.ACTIVE)
      expect(fetchRestoreTask).toBeCalledWith(task!.id)
    })
  })

  describe('updateTaskTitle', () => {
    it('更新任务的 title', async () => {
      const tasksStore = useTasksStore()
      const task = (await useAddTaskFactory('写代码'))!

      const newTitle = '睡觉'
      await tasksStore.updateTaskTitle(task, newTitle)
      expect(fetchUpdateTaskTitle).toBeCalledWith(task.id, newTitle)
      expect(tasksStore.tasks[0].title).toBe(newTitle)
    })
    it('输入重复的 title, 不更新', async () => {
      const title = '写代码'
      const tasksStore = useTasksStore()
      const task = (await useAddTaskFactory(title))!

      await tasksStore.updateTaskTitle(task, title)

      expect(fetchUpdateTaskTitle).not.toBeCalled()
      expect(tasksStore.tasks[0].title).toBe(title)
    })
  })

  describe('updateTaskContent', () => {
    it('更新任务的 content', async () => {
      const tasksStore = useTasksStore()
      const task = (await useAddTaskFactory('写代码'))!

      const newContent = '今天写代码了'
      await tasksStore.updateTaskContent(task, newContent)
      expect(fetchUpdateTaskContent).toBeCalledWith(task.id, newContent)
      expect(tasksStore.tasks[0].content).toBe(newContent)
    })

    it('输入重复的 content, 不更新', async () => {
      const tasksStore = useTasksStore()
      const task = (await useAddTaskFactory('写代码'))!

      const newContent = ''
      await tasksStore.updateTaskContent(task, newContent)
      expect(fetchUpdateTaskContent).not.toBeCalled()
      expect(tasksStore.tasks[0].content).toBe(newContent)
    })
  })

  describe('updateTaskPosition', () => {
    it('更新任务的 Position', async () => {
      const tasksStore = useTasksStore()
      const task = (await useAddTaskFactory('写代码'))!

      const newPosition = 100
      await tasksStore.updateTaskPosition(task, newPosition)
      expect(fetchUpdateTaskPosition).toBeCalledWith(task.id, newPosition)
      expect(tasksStore.tasks[0].position).toBe(newPosition)
    })
    it('输入重复的 position, 不更新', async () => {
      const tasksStore = useTasksStore()
      const task = (await useAddTaskFactory('写代码'))!

      const newPosition = task.position
      await tasksStore.updateTaskPosition(task, newPosition)
      expect(fetchUpdateTaskPosition).not.toBeCalled()
    })
  })

  describe('用 tdd 的方式实现任务的更新功能', () => {
    it('更新任务的各个元素', async () => {
      const tasksStore = useTasksStore()
      const task = (await useAddTaskFactory('写代码'))!

      await tasksStore.updateTaskProperties(task, { title: '睡觉' })

      expect(fetchUpdateTaskProperties).toBeCalledWith(task.id, { title: '睡觉' })
      expect(tasksStore.tasks[0].title).toBe('睡觉')
    })
  })
})
