import { mount } from '@vue/test-utils'
export function useSetup<V>(setup: () => V) {
  // 构建一个组件实例
  const comp = {
    setup,
    render() {},
  }
  // 挂载组件
  const wrapper = mount(comp)
  return {
    wrapper,
    router: wrapper.router,
  }
}
