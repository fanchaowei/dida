import { useRouter } from 'vue-router'
import { RouteNames } from '@/router/const'

export function useGoto() {
  const router = useRouter()

  function gotoHome() {
    router.push({
      name: RouteNames.HOME,
    })
  }

  function gotoSettings() {
    router.push({
      name: RouteNames.SETTINGS,
    })
  }

  return {
    gotoHome,
    gotoSettings,
  }
}

export const GITHUB_URL = 'https://github.com/cuixueshe/dida'
export function openGithub() {
  window.open(GITHUB_URL)
}
