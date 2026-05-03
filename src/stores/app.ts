import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 应用名称
  const appName = ref('Omni工具箱')

  // 欢迎语
  const greeting = ref('')

  // 更新时间问候语
  const updateGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 6) {
      greeting.value = '凌晨好'
    } else if (hour < 9) {
      greeting.value = '早上好'
    } else if (hour < 12) {
      greeting.value = '上午好'
    } else if (hour < 14) {
      greeting.value = '中午好'
    } else if (hour < 18) {
      greeting.value = '下午好'
    } else if (hour < 22) {
      greeting.value = '晚上好'
    } else {
      greeting.value = '夜深了'
    }
  }

  // 初始化
  updateGreeting()

  return {
    appName,
    greeting,
    updateGreeting
  }
})