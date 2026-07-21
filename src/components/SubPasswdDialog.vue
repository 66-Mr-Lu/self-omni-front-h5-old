<template>
  <van-dialog
    v-model:show="visible"
    :title="dialogTitle"
    :show-cancel-button="showCancelButton"
    :confirm-button-text="confirmButtonText"
    :cancel-button-text="cancelButtonText"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  >
    <!-- 描述信息 -->
    <p v-if="description" class="description-text">{{ description }}</p>

    <!-- 设置模式：输入密码 + 确认密码 -->
    <template v-if="mode === 'set'">
      <div class="sub-passwd-form">
        <div class="form-item">
          <label class="form-label">二级密码</label>
          <input
            v-model="password"
            type="text"
            placeholder="请设置二级密码"
            class="form-input"
            maxlength="20"
            @input="validatePassword"
          />
          <p v-if="errors.password" class="error-text">{{ errors.password }}</p>
        </div>
        <div class="form-item">
          <label class="form-label">确认密码</label>
          <input
            v-model="confirmPassword"
            type="text"
            placeholder="请再次输入密码"
            class="form-input"
            maxlength="20"
            @input="validateConfirmPassword"
          />
          <p v-if="errors.confirmPassword" class="error-text">{{ errors.confirmPassword }}</p>
        </div>
        <p class="tips-text">二级密码仅存储在本地，用于保护敏感操作</p>
      </div>
    </template>

    <!-- 输入模式：仅输入密码 -->
    <template v-else-if="mode === 'input'">
      <div class="sub-passwd-form">
        <div class="form-item">
          <label class="form-label">二级密码</label>
          <input
            v-model="password"
            type="text"
            placeholder="请输入二级密码"
            class="form-input"
            maxlength="20"
          />
          <p v-if="errors.password" class="error-text">{{ errors.password }}</p>
        </div>
        <p v-if="showError" class="error-text text-center">{{ errorMessage }}</p>
      </div>
    </template>

    <!-- 显示模式：展示已设置的二级密码 -->
    <template v-else-if="mode === 'display'">
      <div class="display-password">
        <label class="display-label">您的二级密码</label>
        <div class="password-content">
          <span class="password-text">{{ displayPassword }}</span>
          <button @click="copyPassword" class="copy-btn">复制</button>
        </div>
        <p class="tips-text">二级密码仅存储在本地，请妥善保管</p>
      </div>
    </template>
  </van-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Dialog } from 'vant'
import {update, UpdateRequest} from "@/api/auth.ts";
import { generateSalt, deriveSigningKeyPair } from "@/utils/crypto.ts";

// 注册 Vant 组件
const [vanDialog] = [Dialog]

/**
 * 弹窗模式
 * set: 设置模式（首次设置，需要确认密码）
 * input: 输入模式（已有密码，仅需输入验证）
 */
type DialogMode = 'set' | 'input' | 'display'

/**
 * Props
 */
const props = withDefaults(defineProps<{
  show: boolean
  mode?: DialogMode
  errorMessage?: string
  description?: string
  displayPassword?: string
}>(), {
  mode: 'input',
  errorMessage: '密码错误，请重试',
  description: '',
  displayPassword: ''
})

/**
 * Emits
 */
const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'confirm', password: string): void
  (e: 'cancel'): void
}>()

/**
 * 弹窗是否可见
 */
const visible = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
})

/**
 * 密码输入
 */
const password = ref('')
const confirmPassword = ref('')

/**
 * 错误信息
 */
const errors = ref({
  password: '',
  confirmPassword: ''
})

/**
 * 是否显示错误提示
 */
const showError = ref(false)

/**
 * 监听 show 变化，重置表单
 */
watch(() => props.show, (newVal) => {
  if (newVal) {
    password.value = ''
    confirmPassword.value = ''
    errors.value = { password: '', confirmPassword: '' }
    showError.value = false
  }
})

/**
 * 弹窗标题
 */
const dialogTitle = computed(() => {
  switch (props.mode) {
    case 'set':
      return '设置二级密码'
    case 'input':
      return '输入二级密码'
    case 'display':
      return '二级密码'
    default:
      return '二级密码'
  }
})

/**
 * 确认按钮文本
 */
const confirmButtonText = computed(() => {
  switch (props.mode) {
    case 'set':
      return '保存'
    case 'input':
      return '保存'
    case 'display':
      return '关闭'
    default:
      return '确认'
  }
})

/**
 * 取消按钮文本
 */
const cancelButtonText = computed(() => {
  return '取消'
})

/**
 * 是否显示取消按钮
 */
const showCancelButton = computed(() => {
  return props.mode !== 'display'
})

/**
 * 验证密码（设置模式）
 */
const validatePassword = () => {
  const pwd = password.value
  if (!pwd) {
    errors.value.password = '请输入二级密码'
  } else if (pwd.length < 6) {
    errors.value.password = '密码至少需要6位'
  } else {
    errors.value.password = ''
  }
}

/**
 * 验证确认密码（设置模式）
 */
const validateConfirmPassword = () => {
  const confirmPwd = confirmPassword.value
  if (!confirmPwd) {
    errors.value.confirmPassword = '请输入确认密码'
  } else if (confirmPwd !== password.value) {
    errors.value.confirmPassword = '两次输入的密码不一致'
  } else {
    errors.value.confirmPassword = ''
  }
}

/**
 * 处理确认
 */
const handleConfirm = async () => {
  if (props.mode === 'set') {
    validatePassword()
    validateConfirmPassword()
    if (errors.value.password || errors.value.confirmPassword) {
      return
    }

    const salt = generateSalt();
    const { publicKey } = await deriveSigningKeyPair(password.value, salt);
    const publicKeyHex = toHex(publicKey);
    const updateParams: UpdateRequest = {
      isSetSubPasswd: 'Y',
      subPasswdPublicKey: publicKeyHex,
      subPasswdSalt: salt,
      subPasswd: password.value // 先存后台，后面就传空串
    }
    // 调用更新接口
    await update(updateParams)

    emit('confirm', password.value)
  } else if (props.mode === 'input') {
    if (!password.value) {
      errors.value.password = '请输入二级密码'
      return
    }
    showError.value = false
    emit('confirm', password.value)
  } else if (props.mode === 'display') {
    emit('cancel')
  }
}

// 工具函数：Uint8Array -> Hex
const toHex = (bytes: Uint8Array): string => {
  return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
};

/**
 * 复制密码到剪贴板
 */
const copyPassword = async () => {
  if (props.displayPassword) {
    try {
      await navigator.clipboard.writeText(props.displayPassword)
      const { showToast } = await import('vant')
      showToast({
        message: '复制成功',
        position: 'top'
      })
    } catch {
      const { showToast } = await import('vant')
      showToast({
        message: '复制失败',
        position: 'top'
      })
    }
  }
}

/**
 * 处理取消
 */
const handleCancel = () => {
  emit('cancel')
}

/**
 * 显示密码错误
 */
const showPasswordError = () => {
  showError.value = true
}

// 暴露方法供外部调用
defineExpose({
  showPasswordError
})
</script>

<style scoped>
.sub-passwd-form {
  width: 100%;
}

.form-item {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  height: 44px;
  padding: 0 12px;
  border: 1px solid #eee;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.3s;
}

.form-input:focus {
  border-color: #4F46E5;
}

.error-text {
  font-size: 12px;
  color: #ef4444;
  margin-top: 4px;
}

.tips-text {
  font-size: 12px;
  color: #999;
  text-align: center;
  margin-top: 8px;
}

.description-text {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 16px;
}

.display-password {
  padding: 8px 0;
}

.display-label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.password-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f5f5f5;
  padding: 12px 16px;
  border-radius: 8px;
}

.password-text {
  font-size: 16px;
  font-family: monospace;
  color: #333;
  word-break: break-all;
}

.copy-btn {
  padding: 6px 12px;
  background: #4F46E5;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.copy-btn:active {
  background: #4338CA;
}
</style>