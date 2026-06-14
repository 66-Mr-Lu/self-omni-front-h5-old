<template>
  <div class="edit-profile-page min-h-screen bg-gray-100">
    <!-- 顶部导航栏 -->
    <div class="header fixed top-0 left-0 right-0 bg-white z-50 border-b border-gray-100">
      <div class="flex items-center justify-between px-4 h-12">
        <button @click="handleBack" class="text-gray-600 text-lg">‹ 返回</button>
        <h1 class="text-gray-800 font-semibold">编辑资料</h1>
        <button @click="handleSave" class="text-primary font-medium">保存</button>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="content pt-14 px-4 pb-6">
      <!-- 头像区域 -->
      <div class="avatar-section bg-white rounded-xl p-4 mb-4">
        <div class="flex items-center justify-between">
          <span class="text-gray-700">头像</span>
          <div class="flex items-center cursor-pointer" @click="handleAvatarClick">
            <div class="avatar-wrapper w-12 h-12 rounded-full bg-gradient-to-br from-primary to-info flex items-center justify-center mr-2">
              <span class="text-white text-xl">👤</span>
            </div>
            <span class="text-gray-400">›</span>
          </div>
        </div>
      </div>

      <!-- 基本信息表单 -->
      <div class="form-section bg-white rounded-xl overflow-hidden mb-4">
        <!-- 昵称 -->
        <div class="form-item flex items-center justify-between px-4 py-3 border-b border-gray-50">
          <label class="text-gray-700 w-20">昵称</label>
          <input
            v-model="formData.nickname"
            type="text"
            placeholder="请输入昵称"
            class="flex-1 text-right text-gray-800 outline-none placeholder-gray-300"
            maxlength="20"
          />
        </div>

        <!-- 用户名（只读） -->
        <div class="form-item flex items-center justify-between px-4 py-3 border-b border-gray-50">
          <label class="text-gray-700 w-20">用户名</label>
          <span class="text-gray-400">{{ formData.username }}</span>
        </div>

        <!-- 性别 -->
        <div class="form-item flex items-center justify-between px-4 py-3 border-b border-gray-50 cursor-pointer" @click="showGenderPicker = true">
          <label class="text-gray-700 w-20">性别</label>
          <div class="flex items-center">
            <span class="text-gray-800">{{ genderText }}</span>
            <span class="text-gray-400 ml-2">›</span>
          </div>
        </div>

        <!-- 生日 -->
        <div class="form-item flex items-center justify-between px-4 py-3 border-b border-gray-50 cursor-pointer" @click="showBirthdayPicker = true">
          <label class="text-gray-700 w-20">生日</label>
          <div class="flex items-center">
            <span class="text-gray-800">{{ formData.birthday || '未设置' }}</span>
            <span class="text-gray-400 ml-2">›</span>
          </div>
        </div>

        <!-- 个性签名 -->
        <div class="form-item flex items-start justify-between px-4 py-3">
          <label class="text-gray-700 w-20 pt-0.5">签名</label>
          <textarea
            v-model="formData.signature"
            placeholder="写点什么介绍一下自己吧~"
            class="flex-1 text-right text-gray-800 outline-none placeholder-gray-300 resize-none"
            rows="2"
            maxlength="100"
          ></textarea>
        </div>
      </div>

      <!-- 联系方式 -->
      <div class="form-section bg-white rounded-xl overflow-hidden mb-4">
        <!-- 邮箱 -->
        <div class="form-item flex items-center justify-between px-4 py-3 border-b border-gray-50">
          <label class="text-gray-700 w-20">邮箱</label>
          <input
            v-model="formData.email"
            type="email"
            placeholder="请输入邮箱"
            class="flex-1 text-right text-gray-800 outline-none placeholder-gray-300"
          />
        </div>

        <!-- 手机号 -->
        <div class="form-item flex items-center justify-between px-4 py-3">
          <label class="text-gray-700 w-20">手机号</label>
          <input
            v-model="formData.phone"
            type="tel"
            placeholder="请输入手机号"
            class="flex-1 text-right text-gray-800 outline-none placeholder-gray-300"
            maxlength="11"
          />
        </div>
      </div>

      <!-- 提示信息 -->
      <p class="text-gray-400 text-xs text-center mt-4">
        修改资料后请点击右上角保存按钮
      </p>
    </div>

    <!-- 性别选择器 -->
    <van-action-sheet
      v-model:show="showGenderPicker"
      :actions="genderActions"
      cancel-text="取消"
      close-on-click-action
      @select="onGenderSelect"
    />

    <!-- 生日选择器 -->
    <van-popup v-model:show="showBirthdayPicker" position="bottom" round>
      <van-date-picker
        v-model="birthdayValue"
        title="选择生日"
        :min-date="minDate"
        :max-date="maxDate"
        @confirm="onBirthdayConfirm"
        @cancel="showBirthdayPicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { showToast, showSuccessToast, ActionSheet, DatePicker, Popup } from 'vant'

// 注册 Vant 组件
const [vanActionSheet, vanDatePicker, vanPopup] = [ActionSheet, DatePicker, Popup]

// 路由
const router = useRouter()

// 状态管理
const appStore = useAppStore()

// 表单数据
const formData = ref({
  nickname: '',
  username: '',
  gender: 0,
  birthday: '',
  signature: '',
  email: '',
  phone: ''
})

// 性别选择器
const showGenderPicker = ref(false)
const genderActions = [
  { name: '男', value: 1 },
  { name: '女', value: 2 },
  { name: '保密', value: 0 }
]

// 生日选择器
const showBirthdayPicker = ref(false)
const minDate = new Date(1950, 0, 1)
const maxDate = new Date()
const birthdayValue = ref(['2020', '01', '01'])

// 性别文本
const genderText = computed(() => {
  const gender = genderActions.find(g => g.value === formData.value.gender)
  return gender?.name || '保密'
})

/**
 * 初始化表单数据
 */
const initFormData = () => {
  const user = appStore.getUser()
  if (user) {
    formData.value.nickname = user.nickname || ''
    formData.value.username = user.username || ''
  }
}

/**
 * 处理返回
 */
const handleBack = () => {
  router.back()
}

/**
 * 处理头像点击
 */
const handleAvatarClick = () => {
  showToast({
    message: '头像上传功能开发中',
    position: 'top'
  })
}

/**
 * 性别选择
 */
const onGenderSelect = (action: { name: string; value: number }) => {
  formData.value.gender = action.value
}

/**
 * 生日选择确认
 */
const onBirthdayConfirm = ({ selectedValues }: { selectedValues: string[] }) => {
  formData.value.birthday = selectedValues.join('-')
  showBirthdayPicker.value = false
}

/**
 * 处理保存
 */
const handleSave = async () => {
  // 验证昵称
  if (!formData.value.nickname.trim()) {
    showToast({
      message: '请输入昵称',
      position: 'top'
    })
    return
  }

  // 验证邮箱格式
  if (formData.value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
    showToast({
      message: '请输入正确的邮箱格式',
      position: 'top'
    })
    return
  }

  // 验证手机号格式
  if (formData.value.phone && !/^1[3-9]\d{9}$/.test(formData.value.phone)) {
    showToast({
      message: '请输入正确的手机号',
      position: 'top'
    })
    return
  }

  try {
    // TODO: 调用后端接口保存数据
    // 模拟保存
    await new Promise(resolve => setTimeout(resolve, 500))

    // 更新本地用户信息
    const user = appStore.getUser()
    if (user) {
      appStore.setUser({
        ...user,
        nickname: formData.value.nickname
      })
    }

    showSuccessToast('保存成功')
    router.back()
  } catch (error) {
    showToast({
      message: '保存失败，请重试',
      position: 'top'
    })
  }
}

// 初始化
onMounted(() => {
  initFormData()
})
</script>

<style scoped>
.avatar-wrapper {
  background: linear-gradient(135deg, #4F46E5 0%, #0EA5E9 100%);
}

.form-item:active {
  background-color: #f9fafb;
}

textarea {
  line-height: 1.5;
}
</style>