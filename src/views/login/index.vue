<template>
  <div class="login-page min-h-screen bg-gradient-to-br from-primary to-info flex items-center justify-center p-4">
    <!-- 登录卡片 -->
    <div class="login-card w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
      <!-- 顶部 Logo 和标题 -->
      <div class="text-center mb-6">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-info flex items-center justify-center">
          <span class="text-white text-2xl">🔐</span>
        </div>
        <h1 class="text-xl font-bold text-gray-800">{{ appStore.appName }}</h1>
        <p class="text-gray-500 text-sm mt-1">欢迎回来，请登录</p>
      </div>

      <!-- 登录表单 -->
      <form @submit.prevent="handleLogin" class="space-y-4">
        <!-- 用户名输入 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">用户名</label>
          <div class="relative">
            <input
              v-model="form.username"
              type="text"
              placeholder="请输入用户名"
              class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              :class="{ 'border-red-400': errors.username }"
            />
          </div>
          <p v-if="errors.username" class="text-red-500 text-xs mt-1">{{ errors.username }}</p>
        </div>

        <!-- 密码输入 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">密码</label>
          <div class="relative">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入密码"
              class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all pr-10"
              :class="{ 'border-red-400': errors.password }"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <span>{{ showPassword ? '🙈' : '👁️' }}</span>
            </button>
          </div>
          <p v-if="errors.password" class="text-red-500 text-xs mt-1">{{ errors.password }}</p>
        </div>

        <!-- 记住我和忘记密码 -->
        <div class="flex items-center justify-between text-sm">
          <label class="flex items-center cursor-pointer">
            <input v-model="form.rememberMe" type="checkbox" class="w-4 h-4 text-primary rounded focus:ring-primary" />
            <span class="ml-2 text-gray-600">记住我</span>
          </label>
          <a href="#" class="text-primary hover:text-primary-dark">忘记密码？</a>
        </div>

        <!-- 登录按钮 -->
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full py-3 bg-gradient-to-r from-primary to-info text-white font-medium rounded-lg hover:from-primary-dark hover:to-info-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <span v-if="isLoading" class="animate-spin mr-2">⏳</span>
          <span>{{ isLoading ? '登录中...' : '登录' }}</span>
        </button>
      </form>

      <!-- 注册入口 -->
      <div class="mt-6 text-center">
        <span class="text-gray-500 text-sm">还没有账号？</span>
        <a href="#" class="text-primary ml-1 hover:text-primary-dark">立即注册</a>
      </div>

      <!-- 第三方登录 -->
      <div class="mt-6 pt-6 border-t border-gray-100">
        <p class="text-center text-gray-500 text-sm mb-4">其他登录方式</p>
        <div class="flex justify-center space-x-6">
          <button class="w-12 h-12 rounded-full bg-green-50 text-green-500 flex items-center justify-center hover:bg-green-100 transition-colors">
            <span class="text-xl">📱</span>
          </button>
          <button class="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-100 transition-colors">
            <span class="text-xl">💬</span>
          </button>
          <button class="w-12 h-12 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center hover:bg-orange-100 transition-colors">
            <span class="text-xl">📧</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAppStore } from '@/stores/app'
import { showToast } from 'vant'

// 状态管理
const appStore = useAppStore()

/**
 * 登录成功后设置用户状态
 */
const setLoginUser = (username: string) => {
  appStore.setUser({
    id: '1',
    username: username
  })
}

// 表单数据
const form = reactive({
  username: '',
  password: '',
  rememberMe: false
})

// 是否显示密码
const showPassword = ref(false)

// 是否加载中
const isLoading = ref(false)

// 错误信息
const errors = reactive({
  username: '',
  password: ''
})

/**
 * 表单验证
 */
const validateForm = (): boolean => {
  // 重置错误
  errors.username = ''
  errors.password = ''

  let isValid = true

  // 验证用户名
  if (!form.username.trim()) {
    errors.username = '请输入用户名'
    isValid = false
  }

  // 验证密码
  if (!form.password) {
    errors.password = '请输入密码'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = '密码长度至少6位'
    isValid = false
  }

  return isValid
}

/**
 * 处理登录
 */
const handleLogin = async () => {
  // 表单验证
  if (!validateForm()) {
    return
  }

  // 设置加载状态
  isLoading.value = true

  try {
    // 模拟登录请求
    await new Promise(resolve => setTimeout(resolve, 1500))

    // 模拟登录成功
    if (form.username === 'admin' && form.password === '123456') {
      // 保存登录状态
      if (form.rememberMe) {
        localStorage.setItem('omni_user', JSON.stringify({ username: form.username }))
      } else {
        sessionStorage.setItem('omni_user', JSON.stringify({ username: form.username }))
      }

      // 设置用户状态到 store
      setLoginUser(form.username)

      showToast({
        message: '登录成功',
        position: 'top'
      })

      // 跳转到首页（使用相对路径）
      setTimeout(() => {
        const basePath = import.meta.env.VITE_APP_BASE_PATH || '/omni/'
        window.location.href = basePath
      }, 1000)
    } else {
      showToast({
        message: '用户名或密码错误',
        position: 'top'
      })
    }
  } catch (error) {
    showToast({
      message: '登录失败，请稍后重试',
      position: 'top'
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  min-height: 100dvh;
}

.login-card {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>