<template>
  <div class="device-editor-page min-h-screen bg-gray-100">
    <!-- 顶部固定工具栏 -->
    <div class="editor-toolbar fixed top-0 left-0 right-0 z-50">
      <div class="toolbar-container bg-white border-b border-gray-200">
        <div class="toolbar-content">
          <button 
            class="toolbar-btn" 
            :class="{ disabled: loading }"
            :disabled="loading"
            @click="handleGoBack"
            title="返回"
          >
            <span class="btn-icon">←</span>
          </button>
          
          <div class="flex-1 text-center">
            <span class="text-base font-medium text-gray-800">{{ isEdit ? '编辑设备' : '添加设备' }}</span>
          </div>
          
          <div class="w-10"></div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="content pt-14">
      <div class="flex justify-center items-center py-20">
        <div class="loading-indicator">
          <span class="loading-dots"></span>
          <span class="text-gray-400 text-sm">加载中...</span>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div v-else class="content pt-14 pb-24">
      <div class="bg-white mx-4 mt-4 rounded-xl shadow-sm p-4">
        <div class="form-item">
          <label class="form-label">设备名称</label>
          <input 
            v-model="formData.name" 
            class="form-input"
            placeholder="设备名称（可选）"
            :disabled="loading"
          />
        </div>
        
        <div class="form-item">
          <label class="form-label required">IP地址</label>
          <input 
            v-model="formData.ip" 
            class="form-input"
            placeholder="请输入设备IP地址"
            :disabled="loading"
          />
          <span v-if="!formData.ip && showValidation" class="error-text">IP地址不能为空</span>
        </div>
        
        <div class="form-item">
          <label class="form-label required">端口号</label>
          <input 
            v-model="formData.port" 
            class="form-input"
            placeholder="请输入端口号"
            :disabled="loading"
          />
          <span v-if="!formData.port && showValidation" class="error-text">端口号不能为空</span>
        </div>
        
        <div class="form-item">
          <label class="form-label required">MAC地址</label>
          <input 
            v-model="formData.mac" 
            class="form-input"
            placeholder="请输入MAC地址"
            :disabled="loading"
          />
          <span v-if="!formData.mac && showValidation" class="error-text">MAC地址不能为空</span>
        </div>
      </div>
    </div>

    <!-- 底部操作按钮 -->
    <div class="bottom-bar fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
      <div class="flex gap-3">
        <button 
          class="flex-1 save-btn px-6 py-3 bg-gradient-to-r from-primary to-info text-white rounded-xl text-base font-medium transition-all active:opacity-80 shadow-md flex items-center justify-center gap-2"
          :class="{ disabled: saving }"
          :disabled="saving"
          @click="saveDevice"
        >
          <span v-if="!saving">✓</span>
          <span v-else class="saving-icon">●</span>
          <span>{{ saving ? '保存中' : '保存' }}</span>
        </button>
        <button 
          class="flex-1 wake-btn px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl text-base font-medium transition-all active:opacity-80 shadow-md flex items-center justify-center gap-2"
          :class="{ disabled: waking }"
          :disabled="waking"
          @click="handleWake"
        >
          <span v-if="!waking">⚡</span>
          <span v-else class="waking-icon">●</span>
          <span>{{ waking ? '唤醒中' : '唤醒' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getDeviceById, createDevice, updateDevice, wakeDevice, type DeviceInfo, type CreateDeviceRequest, type UpdateDeviceRequest } from '@/api/remote-power'
import { showToast, showDialog } from 'vant'

const router = useRouter()
const route = useRoute()

const isEdit = ref(false)
const deviceId = ref('')
const loading = ref(false)
const saving = ref(false)
const waking = ref(false)
const showValidation = ref(false)

const formData = ref({
  name: '',
  ip: '',
  port: '',
  mac: ''
})

const originalData = ref({
  name: '',
  ip: '',
  port: '',
  mac: ''
})

const handleGoBack = () => {
  if (saving.value || waking.value) return
  
  const hasChanges = 
    formData.value.name !== originalData.value.name ||
    formData.value.ip !== originalData.value.ip ||
    formData.value.port !== originalData.value.port ||
    formData.value.mac !== originalData.value.mac
  
  if (hasChanges) {
    showDialog({
      title: '提示',
      message: '设备信息已修改，是否保存？',
      showCancelButton: true,
      confirmButtonText: '保存',
      cancelButtonText: '不保存'
    }).then(async () => {
      await saveDevice()
      router.back()
    }).catch(() => {
      router.back()
    })
  } else {
    router.back()
  }
}

const validateForm = (): boolean => {
  showValidation.value = true
  
  if (!formData.value.ip.trim()) {
    showToast({ message: '请输入IP地址', position: 'top' })
    return false
  }
  
  if (!formData.value.port.trim()) {
    showToast({ message: '请输入端口号', position: 'top' })
    return false
  }
  
  if (!formData.value.mac.trim()) {
    showToast({ message: '请输入MAC地址', position: 'top' })
    return false
  }
  
  return true
}

const saveDevice = async () => {
  if (!validateForm()) return
  
  saving.value = true
  
  try {
    if (isEdit.value) {
      const params: UpdateDeviceRequest = {
        id: deviceId.value,
        name: formData.value.name?.trim() || undefined,
        ip: formData.value.ip.trim(),
        port: formData.value.port?.toString().trim(),
        mac: formData.value.mac.trim()
      }
      await updateDevice(params)
      showToast({ message: '更新成功', position: 'top' })
    } else {
      const params: CreateDeviceRequest = {
        name: formData.value.name?.trim() || undefined,
        ip: formData.value.ip.trim(),
        port: formData.value.port?.toString().trim(),
        mac: formData.value.mac.trim()
      }
      const createResp = await createDevice(params)
      deviceId.value = createResp.id
      isEdit.value = true
      showToast({ message: '创建成功', position: 'top' })
    }
    
    // setTimeout(() => {
    //   router.push('/ops/remote-power')
    // }, 800)
  } catch (error) {
    console.error('保存设备失败:', error)
    showToast({ message: error instanceof Error ? error.message : '保存失败', position: 'top' })
  } finally {
    saving.value = false
  }
}

const handleWake = async () => {
  if (!validateForm()) return
  
  waking.value = true
  
  try {
    await wakeDevice(formData.value.ip.trim(), formData.value.port.trim(), formData.value.mac.trim())
    showToast({ message: '唤醒指令已发送', position: 'top' })
  } catch (error) {
    console.error('唤醒设备失败:', error)
    showToast({ message: error instanceof Error ? error.message : '唤醒失败', position: 'top' })
  } finally {
    waking.value = false
  }
}

const loadDeviceDetail = async () => {
  loading.value = true
  
  try {
    const device = await getDeviceById(deviceId.value)
    
    formData.value = {
      name: device.name,
      ip: device.ip,
      port: device.port,
      mac: device.mac
    }
    
    originalData.value = { ...formData.value }
  } catch (error) {
    console.error('加载设备详情失败:', error)
    showToast({ message: error instanceof Error ? error.message : '加载失败', position: 'top' })
    setTimeout(() => {
      router.back()
    }, 1500)
  } finally {
    loading.value = false
  }
}

const initNewDevice = () => {
  formData.value = {
    name: '',
    ip: '',
    port: '',
    mac: ''
  }
  
  originalData.value = { ...formData.value }
}

const loadDeviceFromRouteState = (): boolean => {
  const deviceData = (window.history.state as any)?.deviceData as DeviceInfo | undefined
  if (deviceData) {
    formData.value = {
      name: deviceData.name,
      ip: deviceData.ip,
      port: deviceData.port,
      mac: deviceData.mac
    }
    
    originalData.value = { ...formData.value }
    return true
  }
  
  return false
}

onMounted(() => {
  window.scrollTo(0, 0)
  
  const path = route.path
  if (path.includes('/edit/')) {
    isEdit.value = true
    deviceId.value = route.params.id as string
    
    const loadedFromState = loadDeviceFromRouteState()
    if (!loadedFromState) {
      loadDeviceDetail()
    }
  } else {
    isEdit.value = false
    initNewDevice()
  }
})
</script>

<style scoped>
.editor-toolbar {
  top: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.toolbar-container {
  padding: 8px 16px;
}

.toolbar-content {
  display: flex;
  align-items: center;
}

.toolbar-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toolbar-btn:active {
  background-color: #f5f5f5;
}

.toolbar-btn.disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 22px;
  line-height: 1;
  color: #333;
}

.form-item {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.form-label.required::after {
  content: '*';
  color: #ff4d4f;
  margin-left: 4px;
}

.form-input {
  width: 100%;
  height: 44px;
  padding: 0 12px;
  font-size: 14px;
  color: #333;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  outline: none;
  transition: all 0.2s ease;
}

.form-input:focus {
  border-color: #4CAF50;
  background-color: #fff;
}

.form-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-text {
  display: block;
  font-size: 12px;
  color: #ff4d4f;
  margin-top: 4px;
}

.bottom-bar {
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
  bottom: calc(56px + env(safe-area-inset-bottom));
}

.save-btn.disabled,
.wake-btn.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.loading-dots {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #ddd;
  border-radius: 50%;
  border-top-color: #4CAF50;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.saving-icon {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: #fff;
  animation: pulse 1s ease-in-out infinite;
}

.waking-icon {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: #fff;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.7;
  }
}
</style>