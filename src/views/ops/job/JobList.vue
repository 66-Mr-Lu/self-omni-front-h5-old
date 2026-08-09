<template>
  <div class="job-list-page min-h-screen bg-gray-100">
    <!-- 顶部导航栏 -->
    <div class="header fixed top-0 left-0 right-0 bg-gradient-to-r from-primary to-info z-50">
      <!-- 搜索状态 -->
      <div v-if="showSearchBar" class="flex items-center px-3 h-11">
        <div class="back-btn w-7 h-7 flex items-center justify-center cursor-pointer flex-shrink-0" @click="goBack">
          <span class="text-white text-lg">‹</span>
        </div>
        <div class="flex-1 relative mx-2">
          <input
            v-model="keyword"
            type="text"
            placeholder="搜索任务描述..."
            class="w-full h-7 pl-9 pr-3 rounded-full bg-white/20 text-white text-xs placeholder-white/60 outline-none focus:bg-white/30 transition-colors"
            @keyup.enter="handleSearch"
          />
          <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/60 text-xs">🔍</span>
        </div>
        <div class="close-search-btn w-7 h-7 flex items-center justify-center cursor-pointer flex-shrink-0" @click="closeSearch">
          <span class="text-white text-base">✕</span>
        </div>
      </div>
      <!-- 正常状态 -->
      <div v-else class="flex items-center px-4 h-11">
        <div class="back-btn w-7 h-7 flex items-center justify-center cursor-pointer" @click="goBack">
          <span class="text-white text-lg">‹</span>
        </div>
        <h1 class="text-white text-base font-semibold mx-2">定时任务管理</h1>
        <div class="ml-auto flex items-center gap-2">
          <span class="text-white/70 text-xs">{{ total }} 个任务</span>
          <div class="timeline-btn w-7 h-7 flex items-center justify-center cursor-pointer" title="调度时序图" @click="goTimeline">
            <span class="text-white text-base">📊</span>
          </div>
          <div class="search-btn w-7 h-7 flex items-center justify-center cursor-pointer" @click="openSearch">
            <span class="text-white text-base">🔍</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content pt-1 pb-20">
      <!-- 加载状态 -->
      <div v-if="loading && jobs.length === 0 && !error" class="flex justify-center items-center py-12">
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
      <div v-else-if="jobs.length === 0 && !loading" class="px-4 py-4">
        <div class="bg-white rounded-xl shadow-sm p-8 text-center">
          <div class="text-6xl mb-4">📭</div>
          <div class="text-gray-500 text-base">暂无定时任务</div>
        </div>
      </div>

      <!-- 任务列表 -->
      <div v-else-if="jobs.length > 0" class="px-3 py-3 space-y-2">
        <div
          v-for="job in jobs"
          :key="job.id"
          class="job-item bg-white rounded-lg shadow-sm p-3 transition-all active:scale-[0.98]"
        >
          <!-- 顶部：状态 + 标题 + 菜单 -->
          <div class="flex items-start justify-between mb-1.5">
            <div class="flex items-center flex-1 min-w-0">
              <span
                class="status-tag mr-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0"
                :class="job.triggerStatus === 1 ? 'status-running' : 'status-stopped'"
              >
                {{ job.triggerStatus === 1 ? '运行中' : '已停止' }}
              </span>
              <h3 class="text-gray-800 font-medium text-sm truncate">{{ job.jobDesc || '未命名任务' }}</h3>
            </div>
            <van-popover
              v-model:show="popoverVisible[job.id]"
              placement="bottom-end"
              :actions="getJobActions(job)"
              @select="(action) => handleAction(job, action)"
              @click-outside="closePopover"
            >
              <template #reference>
                <button class="more-btn w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0" @click.stop="togglePopover(job.id)">
                  <span class="text-base font-medium">⋮</span>
                </button>
              </template>
            </van-popover>
          </div>

          <!-- 中间：任务详情 -->
          <div class="text-gray-600 text-xs mb-1">
            <span class="text-gray-400">Handler：</span>
            <span>{{ job.executorHandler || '-' }}</span>
          </div>
          <div class="text-gray-600 text-xs mb-1">
            <span class="text-gray-400">调度：</span>
            <span>{{ formatSchedule(job) }}</span>
          </div>
          <div class="text-gray-600 text-xs mb-1.5">
            <span>负责人：{{ job.author || '-' }}</span>
            <span class="mx-1.5"> | </span>
            <span>参数：{{ job.executorParam || '-' }}</span>
          </div>

          <!-- 底部：调度时间 + 操作按钮 -->
          <div class="flex items-center justify-between">
            <div class="text-[10px] text-gray-400 truncate flex-1 mr-2">
              <span v-if="job.triggerNextTime">下次：{{ formatTime(job.triggerNextTime) }}</span>
              <span v-else>无下次调度</span>
            </div>
            <button
              class="job-btn px-3 py-1.5 rounded-md text-xs font-medium transition-all active:opacity-80 shadow-md flex items-center gap-1 flex-shrink-0"
              :class="job.triggerStatus === 1
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                : 'bg-gradient-to-r from-green-500 to-green-600 text-white'"
              :disabled="togglingJobId === job.id"
              @click.stop="handleToggleStatus(job)"
            >
              <span v-if="togglingJobId === job.id" class="waking-icon"></span>
              <span v-else>{{ job.triggerStatus === 1 ? '⏸' : '▶' }}</span>
              <span>{{ togglingJobId === job.id ? '处理中' : (job.triggerStatus === 1 ? '停止' : '启动') }}</span>
            </button>
          </div>
        </div>

        <!-- 加载更多 -->
        <div v-if="hasMore" class="flex justify-center py-4">
          <button
            class="px-6 py-2 bg-white text-gray-600 rounded-lg text-sm shadow-sm transition-all active:opacity-80"
            :disabled="loadingMore"
            @click="loadMore"
          >
            {{ loadingMore ? '加载中...' : '加载更多' }}
          </button>
        </div>
        <div v-else-if="jobs.length > 0" class="text-center text-gray-400 text-xs py-3">
          没有更多了
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showDialog } from 'vant'
import {
  getJobList,
  triggerJob,
  startJob,
  stopJob,
  type JobInfo,
  type JobListRequest
} from '@/api/job'

const router = useRouter()

// 任务列表
const jobs = ref<JobInfo[]>([])
const loading = ref(false)
const loadingMore = ref(false)
const error = ref(false)
const errorMessage = ref('网络请求失败，请稍后重试')

// 分页参数
const PAGE_SIZE = 10
const start = ref(0)
const total = ref(0)

// 弹窗与操作状态
const popoverVisible = reactive<Record<number, boolean>>({})
const togglingJobId = ref<number | null>(null)
const triggeringJobId = ref<number | null>(null)

// 搜索状态
const showSearchBar = ref(false)
const keyword = ref('')
// 当前列表实际使用的搜索关键字（用于判断取消时是否需要重新加载）
const appliedKeyword = ref('')

// 是否还有更多数据
const hasMore = computed(() => jobs.value.length < total.value)

/**
 * 加载任务列表（首页）
 */
const loadJobs = async () => {
  if (loading.value) return
  loading.value = true
  error.value = false
  errorMessage.value = ''
  start.value = 0

  try {
    const params: JobListRequest = {
      start: start.value,
      length: PAGE_SIZE,
      triggerStatus: -1,
      jobDesc: keyword.value || undefined
    }
    const result = await getJobList(params)
    jobs.value = result.data || []
    total.value = result.recordsTotal || 0
    // 记录本次实际使用的搜索关键字
    appliedKeyword.value = keyword.value
  } catch (err) {
    console.error('加载任务列表失败:', err)
    const errMsg = err instanceof Error ? err.message : '网络请求失败，请稍后重试'
    jobs.value = []
    error.value = true
    errorMessage.value = errMsg
  } finally {
    loading.value = false
  }
}

/**
 * 返回上一页
 */
const goBack = () => {
  router.back()
}

/**
 * 跳转到调度时序图页面
 */
const goTimeline = () => {
  router.push('/ops/job-timeline')
}

/**
 * 打开搜索栏
 */
const openSearch = () => {
  showSearchBar.value = true
}

/**
 * 关闭搜索栏并清空关键字
 * 仅当之前列表使用了搜索关键字时，才重新加载完整列表，避免无意义的请求
 */
const closeSearch = () => {
  showSearchBar.value = false
  keyword.value = ''
  // 之前没有使用过搜索关键字，列表已是完整数据，无需重新请求
  if (!appliedKeyword.value) return
  loadJobs()
}

/**
 * 触发搜索（回车确认）
 */
const handleSearch = () => {
  loadJobs()
}

/**
 * 重试加载
 */
const retryLoad = () => {
  jobs.value = []
  loadJobs()
}

/**
 * 加载更多
 */
const loadMore = async () => {
  if (loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  start.value += PAGE_SIZE

  try {
    const params: JobListRequest = {
      start: start.value,
      length: PAGE_SIZE,
      triggerStatus: -1,
      jobDesc: keyword.value || undefined
    }
    const result = await getJobList(params)
    jobs.value.push(...(result.data || []))
    total.value = result.recordsTotal || 0
  } catch (err) {
    console.error('加载更多失败:', err)
    // 加载失败回退 start
    start.value -= PAGE_SIZE
    showToast({ message: '加载失败，请重试', position: 'top' })
  } finally {
    loadingMore.value = false
  }
}

/**
 * 切换弹窗显示
 */
const togglePopover = (id: number) => {
  popoverVisible[id] = !popoverVisible[id]
}

/**
 * 关闭所有弹窗
 */
const closePopover = () => {
  Object.keys(popoverVisible).forEach(key => {
    popoverVisible[Number(key)] = false
  })
}

/**
 * 获取操作菜单项
 */
const getJobActions = (job: JobInfo) => {
  console.log(job.triggerNextTime)
  return [
    { text: '执行一次', value: 'trigger' }
  ]
}

/**
 * 处理菜单操作
 */
const handleAction = async (job: JobInfo, action: { value: string }) => {
  closePopover()
  if (action.value === 'trigger') {
    await handleTrigger(job)
  }
}

/**
 * 执行一次任务
 */
const handleTrigger = async (job: JobInfo) => {
  if (triggeringJobId.value === job.id) return
  triggeringJobId.value = job.id

  try {
    await triggerJob({
      id: job.id,
      executorParam: job.executorParam
    })
    showToast({ message: '执行指令已发送', position: 'top' })
  } catch (err) {
    console.error('执行任务失败:', err)
    showToast({ message: err instanceof Error ? err.message : '执行失败', position: 'top' })
  } finally {
    triggeringJobId.value = null
  }
}

/**
 * 启动/停止任务
 */
const handleToggleStatus = async (job: JobInfo) => {
  if (togglingJobId.value === job.id) return
  const isRunning = job.triggerStatus === 1
  const actionText = isRunning ? '停止' : '启动'

  showDialog({
    title: '确认操作',
    message: `确定要${actionText}任务「${job.jobDesc}」吗？`,
    showCancelButton: true,
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(async () => {
    togglingJobId.value = job.id
    try {
      if (isRunning) {
        await stopJob(job.id)
      } else {
        await startJob(job.id)
      }
      // 更新本地状态
      job.triggerStatus = isRunning ? 0 : 1
      showToast({ message: `${actionText}成功`, position: 'top' })
    } catch (err) {
      console.error(`${actionText}任务失败:`, err)
      showToast({ message: err instanceof Error ? err.message : `${actionText}失败`, position: 'top' })
    } finally {
      togglingJobId.value = null
    }
  }).catch(() => {
    // 用户取消
  })
}

/**
 * 格式化调度配置
 */
const formatSchedule = (job: JobInfo): string => {
  if (!job.scheduleType || job.scheduleType === 'NONE') return '未配置'
  const typeText = job.scheduleType === 'CRON' ? 'Cron' : '固定速率'
  return `${typeText}：${job.scheduleConf || '-'}`
}

/**
 * 格式化时间戳
 */
const formatTime = (timestamp: number): string => {
  if (!timestamp || timestamp <= 0) return '-'
  const date = new Date(timestamp)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

onMounted(() => {
  loadJobs()
})
</script>

<style scoped>
.job-item {
  position: relative;
  overflow: hidden;
}

.job-item::before {
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

.job-item:active::before {
  opacity: 1;
}

.more-btn {
  flex-shrink: 0;
}

.job-btn {
  flex-shrink: 0;
}

.job-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 状态标签 */
.status-tag {
  line-height: 1.4;
}

.status-running {
  background-color: rgba(76, 175, 80, 0.1);
  color: #4CAF50;
}

.status-stopped {
  background-color: rgba(156, 163, 175, 0.15);
  color: #6b7280;
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
</style>
