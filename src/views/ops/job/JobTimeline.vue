<template>
  <div class="job-timeline-page" :class="{ 'landscape-mode': isLandscape }">
    <!-- 顶部导航栏 -->
    <div class="header fixed top-0 left-0 right-0 bg-gradient-to-r from-primary to-info z-50">
      <div class="flex items-center px-4 h-11">
        <div class="back-btn w-7 h-7 flex items-center justify-center cursor-pointer" @click="goBack">
          <span class="text-white text-lg">‹</span>
        </div>
        <h1 class="text-white text-base font-semibold mx-2">调度时序图</h1>
        <div class="ml-auto flex items-center gap-3">
          <span class="text-white/70 text-xs">{{ weekRangeText }}</span>
          <div class="rotate-btn w-7 h-7 flex items-center justify-center cursor-pointer" @click="toggleLandscape" :title="isLandscape ? '竖屏' : '横屏'">
            <span class="text-white text-base">{{ isLandscape ? '📱' : '🖥️' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表容器 -->
    <div class="chart-wrapper">
      <!-- 加载中 -->
      <div v-if="loading" class="flex flex-col items-center justify-center h-full">
        <div class="w-10 h-10 border-3 border-gray-300 border-t-primary rounded-full animate-spin"></div>
        <p class="text-gray-400 text-sm mt-4">解析调度数据中...</p>
      </div>

      <!-- 空状态 -->
      <div v-else-if="timelinePoints.length === 0" class="flex flex-col items-center justify-center h-full">
        <div class="text-5xl mb-3">📊</div>
        <p class="text-gray-400 text-sm">下周暂无调度任务</p>
        <p class="text-gray-300 text-xs mt-1">请确认是否有运行中的定时任务</p>
      </div>

      <!-- ECharts 图表 -->
      <div v-else ref="chartRef" class="chart-container"></div>

      <!-- 任务描述 overlay：竖线经过的每个点位置显示任务描述 -->
      <div class="label-overlay">
        <div
          v-for="(label, idx) in pointLabels"
          :key="idx"
          class="point-label"
          :style="{ left: label.x + 'px', top: label.y + 'px', color: label.color }"
        >{{ label.text }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts/core'
import { ScatterChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, DataZoomComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { getJobList, type JobInfo } from '@/api/job'
import { buildTimelineData, getNextWeekRange, type TimelinePoint } from '@/utils/cron'
import type { SeriesOption } from 'echarts'


// 按需注册 ECharts 组件
echarts.use([ScatterChart, GridComponent, TooltipComponent, DataZoomComponent, LegendComponent, CanvasRenderer])

const router = useRouter()

const loading = ref(true)
const isLandscape = ref(false)
const chartRef = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null

const timelinePoints = ref<TimelinePoint[]>([])
const weekRangeText = ref('')

// 竖线经过的点的任务描述（HTML overlay）
const pointLabels = ref<Array<{ x: number; y: number; text: string; color: string }>>([])

// 预定义颜色池，用于区分不同任务系列
const COLOR_POOL = [
  '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
  '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#5d7092',
  '#c0504d', '#4f81bd', '#9bbb59', '#8064a2', '#4bacc6'
]

/**
 * 返回上一页
 */
const goBack = () => {
  router.back()
}

/**
 * 切换横屏/竖屏
 */
const toggleLandscape = () => {
  isLandscape.value = !isLandscape.value
  // 切换后需要重新调整图表尺寸
  nextTick(() => {
    resizeChart()
  })
}

/**
 * 调整图表尺寸
 */
const resizeChart = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

/**
 * 格式化日期为"周X"
 */
const formatWeekday = (date: Date): string => {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return weekdays[date.getDay()]
}

/**
 * 加载任务数据并解析调度时间点
 */
const loadData = async () => {
  loading.value = true
  try {
    // 请求所有运行中的任务（length 设置足够大以获取全部）
    const result = await getJobList({
      start: 0,
      length: 1000,
      triggerStatus: 1
    })
    const jobs: JobInfo[] = result.data || []
    timelinePoints.value = buildTimelineData(jobs)

    // 计算周范围文本
    const [start, end] = getNextWeekRange()
    const pad = (n: number) => String(n).padStart(2, '0')
    weekRangeText.value = `${start.getMonth() + 1}/${pad(start.getDate())} - ${end.getMonth() + 1}/${pad(end.getDate())}`
  } catch (err) {
    console.error('加载调度数据失败:', err)
  } finally {
    loading.value = false
    // loading 设为 false 后，chart-container 才会渲染到 DOM
    // 必须等待 DOM 更新完成后再初始化 ECharts，否则 chartRef 为 null
    if (timelinePoints.value.length > 0) {
      await nextTick()
      renderChart()
    }
  }
}

/**
 * 渲染 ECharts 时序图
 */
const renderChart = () => {
  if (!chartRef.value) return

  // 销毁旧实例
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }

  chartInstance = echarts.init(chartRef.value)

  const [weekStart, weekEnd] = getNextWeekRange()

  // 按任务分组，构建系列数据
  // 纵坐标无意义：按任务索引分行展示，避免点重叠
  const jobMap = new Map<number, { name: string; index: number }>()
  for (const point of timelinePoints.value) {
    if (!jobMap.has(point.jobId)) {
      jobMap.set(point.jobId, {
        name: point.jobDesc,
        index: jobMap.size
      })
    }
  }

  // 构建每个任务的散点系列
  const series: SeriesOption[] = []
  // const series: echarts.SeriesOption[] = []
  const jobEntries = Array.from(jobMap.entries())
  for (const [jobId, info] of jobEntries) {
    const data = timelinePoints.value
      .filter(p => p.jobId === jobId)
      .map(p => [p.time, info.index, p.jobDesc])
    series.push({
      name: info.name,
      type: 'scatter',
      symbolSize: 8,
      // 从颜色池取色，循环使用
      itemStyle: {
        color: COLOR_POOL[info.index % COLOR_POOL.length]
      },
      // 默认不显示标签，避免大量点重叠看不清
      label: {
        show: false,
        formatter: (params: any) => params.value[2],
        position: 'top',
        fontSize: 9,
        color: '#666'
      },
      data: data,
      emphasis: {
        // emphasize 只改变视觉样式，不显示 label
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0,0,0,0.3)',
          borderColor: '#333',
          borderWidth: 1
        }
      }
    })
  }

  // Y 轴类目（任务名），但不显示刻度标签（纵坐标无意义）
  const yAxisCategories = jobEntries.map(([, info]) => info.name)

  const option: echarts.EChartsCoreOption = {
    tooltip: {
      trigger: 'item',
      // 触摸时显示详细信息（任务名 + 具体时间节点）
      formatter: (params: any) => {
        // 兼容 axisPointer 触发时 params 可能为空或结构异常的情况
        if (!params || !params.value) return ''
        // value 可能是数组 [time, yIndex, desc] 或单个值
        const timeVal = Array.isArray(params.value) ? params.value[0] : params.value
        if (timeVal == null) return ''
        const date = new Date(timeVal)
        if (isNaN(date.getTime())) return ''
        const pad = (n: number) => String(n).padStart(2, '0')
        const weekday = formatWeekday(date)
        const time = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
        const name = params.seriesName || params.name || '未知任务'
        return `${name}<br/>${weekday} ${time}`
      }
    },
    // 可移动的坐标轴指示线：用户滑动时显示竖线
    axisPointer: {
      show: true,
      type: 'line',
      snap: true,
      triggerOn: 'mousemove|click',
      lineStyle: {
        color: '#999',
        width: 1,
        type: 'dashed'
      },
      label: {
        show: true,
        formatter: (params: any) => {
          if (params.value == null) return ''
          const date = new Date(params.value)
          if (isNaN(date.getTime())) return ''
          const pad = (n: number) => String(n).padStart(2, '0')
          return `${formatWeekday(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}`
        }
      }
    },
    grid: {
      left: 10,
      right: 15,
      top: 15,
      bottom: 50
    },
    xAxis: {
      type: 'time',
      min: weekStart.getTime(),
      max: weekEnd.getTime(),
      axisLabel: {
        // 按时间级别设置格式：默认显示日/时，放大后自动切换到分
        formatter: {
          year: '{yyyy}',
          month: '{M}月',
          day: '{d}日',
          hour: '{HH}时',
          minute: '{HH}:{mm}',
          second: '{HH}:{mm}:{ss}'
        },
        color: '#666',
        hideOverlap: true
      },
      splitLine: {
        show: true,
        lineStyle: { color: '#f0f0f0' }
      }
    },
    yAxis: {
      type: 'category',
      data: yAxisCategories,
      // 纵坐标无意义，隐藏刻度标签
      axisLabel: { show: false },
      axisTick: { show: false },
      axisLine: { show: false },
      splitLine: { show: false }
    },
    dataZoom: [
      // 内置缩放（支持触摸捏合）
      {
        type: 'inside',
        xAxisIndex: 0,
        start: 0,
        end: 100,
        zoomOnMouseWheel: true,
        moveOnMouseMove: true
      },
      // 滑块缩放条
      {
        type: 'slider',
        xAxisIndex: 0,
        start: 0,
        end: 100,
        bottom: 10,
        height: 20,
        handleSize: '100%',
        textStyle: { fontSize: 10 }
      }
    ],
    series
  }

  chartInstance.setOption(option)

  // 距离阈值（毫秒）：竖线距数据点超过5分钟不显示描述
  const MAX_LABEL_DIST_MS = 5 * 60 * 1000

  // 监听 axisPointer 移动，在竖线经过的所有点位置显示任务描述
  chartInstance.on('updateAxisPointer', function(event: any) {
    if (!event.axesInfo || event.axesInfo.length === 0) {
      pointLabels.value = []
      return
    }

    const xValue = event.axesInfo[0].value
    if (xValue == null) {
      pointLabels.value = []
      return
    }

    // 收集竖线经过的所有点（每个系列中距离竖线最近的点，5分钟内才算经过）
    const labels: Array<{ x: number; y: number; text: string; color: string }> = []
    for (let s = 0; s < series.length; s++) {
      const seriesData = (series[s] as any).data || []
      let bestDist = Infinity
      let bestDataIndex = -1

      for (let d = 0; d < seriesData.length; d++) {
        const pointTime = seriesData[d][0]
        const dist = Math.abs(pointTime - xValue)
        if (dist < bestDist) {
          bestDist = dist
          bestDataIndex = d
        }
      }

      // 在5分钟阈值内的点，转为像素坐标，标签放在点正上方避免遮挡
      if (bestDataIndex >= 0 && bestDist <= MAX_LABEL_DIST_MS) {
        const point = seriesData[bestDataIndex]
        const chart = chartInstance
        if (chart) {
          const pixel = chart.convertToPixel({ xAxisIndex: 0, yAxisIndex: 0 }, [point[0], point[1]])
          if (pixel) {
            labels.push({
              x: pixel[0],
              y: pixel[1] - 18,
              text: point[2],
              color: COLOR_POOL[s % COLOR_POOL.length]
            })
          }
        }
      }

    }

    pointLabels.value = labels
  })

  // 鼠标离开图表时清空标签
  chartInstance.on('globalout', function() {
    pointLabels.value = []
  })

  if (chartRef.value) {
    chartRef.value.addEventListener('mouseleave', () => {
      pointLabels.value = []
    })
  }
}

onMounted(() => {
  loadData()
  // 监听窗口尺寸变化
  window.addEventListener('resize', resizeChart)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart)
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>

<style scoped>
.job-timeline-page {
  min-height: 100vh;
  background: #f5f5f5;
}

/* 图表区域：避开顶部 fixed header (44px) 和底部 BottomTab (约60px) */
.chart-wrapper {
  padding-top: 44px;
  height: 100vh;
  box-sizing: border-box;
}

/* 加载中、空状态容器撑满可用空间 */
.chart-wrapper > div {
  height: calc(100vh - 44px - 60px);
}

.chart-container {
  width: 100%;
  height: calc(100vh - 44px - 60px);
}

/* 横屏模式：旋转整个页面 */
.landscape-mode {
  transform: rotate(90deg);
  transform-origin: top left;
  /* 旋转后宽=视口高，高=视口宽，并定位到左上角 */
  width: 100vh;
  height: 100vw;
  position: fixed;
  top: 0;
  left: 0;
}

.landscape-mode .header {
  width: 100vh;
}

/* 横屏时图表高度调整（不需要避开 BottomTab，因为页面已旋转） */
.landscape-mode .chart-wrapper {
  height: 100vw;
}

.landscape-mode .chart-wrapper > div,
.landscape-mode .chart-container {
  height: calc(100vw - 44px);
}

/* 任务描述 overlay：覆盖在图表上，不拦截鼠标事件 */
.label-overlay {
  position: absolute;
  top: 44px;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 10;
}

/* 单个任务描述标签：水平居中在点正上方 */
.point-label {
  position: absolute;
  transform: translateX(-50%);
  font-size: 10px;
  font-weight: bold;
  white-space: nowrap;
  text-shadow: 0 0 3px #fff, 0 0 3px #fff, 0 0 3px #fff;
  pointer-events: none;
}
</style>
