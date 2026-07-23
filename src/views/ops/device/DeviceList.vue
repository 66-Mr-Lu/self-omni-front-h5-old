<template>
  <div class="device-list-page min-h-screen bg-gray-100">
    <!-- 内容区域 -->
    <div class="content pt-1 pb-20">
      <!-- 加载状态 -->
      <div v-if="loading && devices.length === 0 && !error" class="flex justify-center items-center py-12">
        <div class="loading-indicator">
          <span class="loading-dots"></span>
          <span class="text-gray-400 text-sm">加载中...</span>
        </div>
      </div>
      
      <!-- 错误状态 -->
      <div v-if="error" class="px-4 py-4">
        <div class="bg-white rounded-xl shadow-sm p-8 text-center">
          <div class="text-6xl mb-4">⚠️</div>
          <div class="text-gray-500 text-base mb-2">加载失败</div>
          <div class="text-gray-400 text-sm mb-6">{{ errorMessage }}</div>
          <button 
            class="px-6 py-2.5 bg-gradient-to-r from-primary to-info text-white rounded-xl text-sm font-medium transition-all active:opacity-80 shadow-md"
            @click="retryLoad"
          >
            重新加载
          </button>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-else-if="devices.length === 0 && !loading" class="px-4 py-4">
        <div class="bg-white rounded-xl shadow-sm p-8 text-center">
          <div class="text-6xl mb-4">🖥️</div>
          <div class="text-gray-500 text-base mb-6">暂无设备</div>
          <button 
            class="px-6 py-2.5 bg-gradient-to-r from-primary to-info text-white rounded-xl text-sm font-medium transition-all active:opacity-80 shadow-md"
            @click="createNewDevice"
          >
            添加设备
          </button>
        </div>
      </div>
      
      <!-- 设备列表 -->
      <div v-else-if="devices.length > 0" class="px-3 py-3 space-y-2">
        <div 
          v-for="device in devices" 
          :key="device.id" 
          class="device-item bg-white rounded-lg shadow-sm p-3 transition-all active:scale-[0.98]"
          :class="{ 'border-l-3 border-l-yellow-400': device.isPinned === 'Y' }"
          @click="editDevice(device)"
        >
          <div class="flex items-start justify-between mb-1.5">
            <div class="flex items-center">
              <span v-if="device.isPinned === 'Y'" class="mr-1.5 text-yellow-500" title="已置顶">📌</span>
              <h3 class="text-gray-800 font-medium text-sm">{{ device.name || '未命名设备' }}</h3>
            </div>
            <van-popover 
              v-model:show="popoverVisible[device.id]" 
              placement="bottom-end" 
              :actions="getDeviceActions(device)"
              @select="(action) => handleAction(device, action)"
              @click-outside="closePopover"
            >
              <template #reference>
                <button class="more-btn w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors" @click.stop="togglePopover(device.id)">
                  <span class="text-base font-medium">⋮</span>
                </button>
              </template>
            </van-popover>
          </div>
          <div class="text-gray-600 text-xs mb-1">IP: {{ device.ip }}</div>
          <div class="text-gray-600 text-xs mb-1.5">
            <span>MAC: {{ device.mac }}</span>
            <span class="mx-1.5"> | </span>
            <span>端口: {{ device.port }}</span>
          </div>
          <div class="flex items-center justify-between">
            <div class="text-[10px] text-gray-400">{{ formatTime(device.createAt) }}</div>
            <button
              class="wake-btn px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-md text-xs font-medium transition-all active:opacity-80 shadow-md flex items-center gap-1"
              @click.stop="handleWake(device)"
              :disabled="wakingDeviceId === device.id"
            >
              <span v-if="wakingDeviceId !== device.id">⚡</span>
              <span v-else class="waking-icon">●</span>
              <span>{{ wakingDeviceId === device.id ? '唤醒中' : '唤醒' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 悬浮新建按钮 -->
    <button class="fab-button" @click="createNewDevice" title="添加设备">
      <span class="fab-icon">+</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAllDevices, deleteDevice, pinDevice, unpinDevice, wakeDevice, type DeviceInfo } from '@/api/remote-power'
import { showToast, showDialog } from 'vant'

const router = useRouter()

const devices = ref<DeviceInfo[]>([])
const loading = ref(false)
const error = ref(false)
const errorMessage = ref('网络请求失败，请稍后重试')

const popoverVisible = reactive<Record<string, boolean>>({})
const wakingDeviceId = ref<string | null>(null)

const loadDevices = async () => {
  if (loading.value) return
  loading.value = true
  error.value = false
  errorMessage.value = ''
  
  try {
    devices.value = await getAllDevices()
  } catch (err) {
    console.error('加载设备列表失败:', err)
    const errMsg = err instanceof Error ? err.message : '网络请求失败，请稍后重试'
    devices.value = []
    error.value = true
    errorMessage.value = errMsg
  } finally {
    loading.value = false
  }
}

const retryLoad = () => {
  devices.value = []
  loadDevices()
}

const createNewDevice = () => {
  router.push('/ops/remote-power/create')
}

const editDevice = (device: DeviceInfo) => {
  router.push({
    path: `/ops/remote-power/edit/${device.id}`,
    state: { deviceData: JSON.parse(JSON.stringify(device)) }
  })
}

const confirmDelete = async (id: string) => {
  showDialog({
    title: '确认删除',
    message: '删除后无法恢复,确定要删除吗?',
    showCancelButton: true,
    confirmButtonText: '删除',
    cancelButtonText: '取消'
  }).then(async () => {
    try {
      await deleteDevice([Number(id)])
      showToast({ message: '删除成功', position: 'top' })
      const index = devices.value.findIndex(device => device.id === id)
      if (index !== -1) {
        devices.value.splice(index, 1)
      }
    } catch (error) {
      console.error('删除设备失败:', error)
      showToast({ message: '删除失败', position: 'top' })
    }
  }).catch(() => {
  })
}

const togglePopover = (id: string) => {
  popoverVisible[id] = !popoverVisible[id]
}

const closePopover = () => {
  Object.keys(popoverVisible).forEach(key => {
    popoverVisible[key] = false
  })
}

const handleWake = async (device: DeviceInfo) => {
  if (wakingDeviceId.value === device.id) return
  
  wakingDeviceId.value = device.id
  
  try {
    await wakeDevice(device.ip, device.port, device.mac)
    showToast({ message: '唤醒指令已发送', position: 'top' })
  } catch (error) {
    console.error('唤醒设备失败:', error)
    showToast({ message: error instanceof Error ? error.message : '唤醒失败', position: 'top' })
  } finally {
    wakingDeviceId.value = null
  }
}

const getDeviceActions = (device: DeviceInfo) => {
  return [
    { text: device.isPinned === 'Y' ? '取消置顶' : '置顶', value: 'togglePin' },
    { text: '删除', value: 'delete', danger: true }
  ]
}

const handleAction = async (device: DeviceInfo, action: { value: string }) => {
  closePopover()
  if (action.value === 'togglePin') {
    await togglePin(device)
  } else if (action.value === 'delete') {
    confirmDelete(device.id)
  }
}

const togglePin = async (device: DeviceInfo) => {
  try {
    if (device.isPinned === 'Y') {
      await unpinDevice([Number(device.id)])
      showToast({ message: '已取消置顶', position: 'top' })
      device.isPinned = 'N'
    } else {
      await pinDevice([Number(device.id)])
      showToast({ message: '已置顶', position: 'top' })
      device.isPinned = 'Y'
    }
  } catch (error) {
    console.error('置顶操作失败:', error)
    showToast({ message: '操作失败', position: 'top' })
  }
}

const formatTime = (timeStr: string): string => {
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) {
    return '刚刚'
  }
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`
  }
  if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`
  }
  if (date.getFullYear() === now.getFullYear()) {
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

onMounted(() => {
  loadDevices()
})
</script>

<style scoped>
.device-item {
  position: relative;
  overflow: hidden;
}

.device-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(to bottom, #4CAF50, #45a049);
  opacity: 0;
  transition: opacity 0.2s;
}

.device-item:active::before {
  opacity: 1;
}

.more-btn {
  flex-shrink: 0;
}

.wake-btn {
  flex-shrink: 0;
}

.wake-btn:disabled {
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

.waking-icon {
  display: inline-block;
  width: 12px;
  height: 12px;
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

.fab-button {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: #fff;
  border: none;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 1000;
}

.fab-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(76, 175, 80, 0.5);
}

.fab-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.4);
}

.fab-icon {
  font-size: 32px;
  font-weight: 300;
  line-height: 1;
}
</style>