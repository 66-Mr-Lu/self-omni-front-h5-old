<template>
  <div class="cron-expression-page min-h-screen bg-gray-100">
    <!-- 顶部导航栏 -->
    <div class="header fixed top-0 left-0 right-0 bg-gradient-to-r from-primary to-info z-50">
      <div class="flex items-center px-5 h-12">
        <div class="back-btn w-8 h-8 flex items-center justify-center cursor-pointer" @click="goBack">
          <span class="text-white text-2xl">‹</span>
        </div>
        <h1 class="text-white text-lg font-semibold mx-3">Cron表达式生成器</h1>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content pt-16 px-4 pb-4">
      <!-- Cron表达式显示区域 -->
      <div class="bg-white rounded-xl shadow-sm p-4 mb-4">
        <label class="text-gray-700 font-medium text-sm block mb-2">Cron表达式</label>
        <div class="flex gap-2">
          <input
            v-model="cronExpression"
            type="text"
            class="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono"
            placeholder="* * * * * *"
            @input="parseCronExpression"
          />
          <button 
            class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium transition-all active:opacity-80"
            @click="copyCron"
          >
            {{ copied ? '已复制' : '复制' }}
          </button>
        </div>
        <p v-if="cronDescription" class="mt-2 text-sm text-blue-600">{{ cronDescription }}</p>
      </div>

      <!-- 快捷选择区域 -->
      <div class="bg-white rounded-xl shadow-sm p-4 mb-4">
        <h3 class="text-gray-800 font-semibold text-base mb-3">快捷选择</h3>
        
        <!-- 秒 -->
        <div class="field-section mb-4">
          <div class="section-title">秒</div>
          <van-radio-group v-model="secondType" direction="horizontal" class="mb-2">
            <van-radio name="every">每秒</van-radio>
            <van-radio name="interval">周期</van-radio>
            <van-radio name="from">间隔</van-radio>
            <van-radio name="specific">指定</van-radio>
          </van-radio-group>
          
          <div v-if="secondType === 'interval'" class="input-row">
            <span class="label">每隔</span>
            <van-stepper v-model="secondInterval" min="1" max="59" />
            <span class="label">秒</span>
          </div>
          
          <div v-if="secondType === 'from'" class="input-row">
            <span class="label">从第</span>
            <van-stepper v-model="secondFrom" min="0" max="59" />
            <span class="label">秒开始，每隔</span>
            <van-stepper v-model="secondInterval2" min="1" max="59" />
            <span class="label">秒</span>
          </div>
          
          <div v-if="secondType === 'specific'" class="grid-input">
            <van-checkbox-group v-model="secondSpecific" direction="horizontal">
              <van-checkbox v-for="i in 60" :key="i-1" :name="i-1" shape="square">
                {{ i-1 }}
              </van-checkbox>
            </van-checkbox-group>
          </div>
        </div>
        
        <!-- 分钟 -->
        <div class="field-section mb-4">
          <div class="section-title">分钟</div>
          <van-radio-group v-model="minuteType" direction="horizontal" class="mb-2">
            <van-radio name="every">每分钟</van-radio>
            <van-radio name="interval">周期</van-radio>
            <van-radio name="from">间隔</van-radio>
            <van-radio name="specific">指定</van-radio>
          </van-radio-group>
          
          <div v-if="minuteType === 'interval'" class="input-row">
            <span class="label">每隔</span>
            <van-stepper v-model="minuteInterval" min="1" max="59" />
            <span class="label">分钟</span>
          </div>
          
          <div v-if="minuteType === 'from'" class="input-row">
            <span class="label">从第</span>
            <van-stepper v-model="minuteFrom" min="0" max="59" />
            <span class="label">分钟开始，每隔</span>
            <van-stepper v-model="minuteInterval2" min="1" max="59" />
            <span class="label">分钟</span>
          </div>
          
          <div v-if="minuteType === 'specific'" class="grid-input">
            <van-checkbox-group v-model="minuteSpecific" direction="horizontal">
              <van-checkbox v-for="i in 60" :key="i-1" :name="i-1" shape="square">
                {{ i-1 }}
              </van-checkbox>
            </van-checkbox-group>
          </div>
        </div>

        <!-- 小时 -->
        <div class="field-section mb-4">
          <div class="section-title">小时</div>
          <van-radio-group v-model="hourType" direction="horizontal" class="mb-2">
            <van-radio name="every">每小时</van-radio>
            <van-radio name="interval">周期</van-radio>
            <van-radio name="from">间隔</van-radio>
            <van-radio name="specific">指定</van-radio>
          </van-radio-group>
          
          <div v-if="hourType === 'interval'" class="input-row">
            <span class="label">每隔</span>
            <van-stepper v-model="hourInterval" min="1" max="23" />
            <span class="label">小时</span>
          </div>
          
          <div v-if="hourType === 'from'" class="input-row">
            <span class="label">从第</span>
            <van-stepper v-model="hourFrom" min="0" max="23" />
            <span class="label">小时开始，每隔</span>
            <van-stepper v-model="hourInterval2" min="1" max="23" />
            <span class="label">小时</span>
          </div>
          
          <div v-if="hourType === 'specific'" class="grid-input">
            <van-checkbox-group v-model="hourSpecific" direction="horizontal">
              <van-checkbox v-for="i in 24" :key="i-1" :name="i-1" shape="square">
                {{ i-1 }}
              </van-checkbox>
            </van-checkbox-group>
          </div>
        </div>

        <!-- 日 -->
        <div class="field-section mb-4">
          <div class="section-title">日</div>
          <van-radio-group v-model="dayType" direction="horizontal" class="mb-2">
            <van-radio name="every">每日</van-radio>
            <van-radio name="interval">周期</van-radio>
            <van-radio name="from">间隔</van-radio>
            <van-radio name="specific">指定</van-radio>
            <van-radio name="last">最后一日</van-radio>
            <van-radio name="workday">工作日</van-radio>
          </van-radio-group>
          
          <div v-if="dayType === 'interval'" class="input-row">
            <span class="label">每隔</span>
            <van-stepper v-model="dayInterval" min="1" max="31" />
            <span class="label">天</span>
          </div>
          
          <div v-if="dayType === 'from'" class="input-row">
            <span class="label">从第</span>
            <van-stepper v-model="dayFrom" min="1" max="31" />
            <span class="label">天开始，每隔</span>
            <van-stepper v-model="dayInterval2" min="1" max="31" />
            <span class="label">天</span>
          </div>
          
          <div v-if="dayType === 'specific'" class="grid-input">
            <van-checkbox-group v-model="daySpecific" direction="horizontal">
              <van-checkbox v-for="i in 31" :key="i" :name="i" shape="square">
                {{ i }}
              </van-checkbox>
            </van-checkbox-group>
          </div>
        </div>

        <!-- 月 -->
        <div class="field-section mb-4">
          <div class="section-title">月</div>
          <van-radio-group v-model="monthType" direction="horizontal" class="mb-2">
            <van-radio name="every">每月</van-radio>
            <van-radio name="interval">周期</van-radio>
            <van-radio name="from">间隔</van-radio>
            <van-radio name="specific">指定</van-radio>
          </van-radio-group>
          
          <div v-if="monthType === 'interval'" class="input-row">
            <span class="label">每隔</span>
            <van-stepper v-model="monthInterval" min="1" max="12" />
            <span class="label">月</span>
          </div>
          
          <div v-if="monthType === 'from'" class="input-row">
            <span class="label">从第</span>
            <van-stepper v-model="monthFrom" min="1" max="12" />
            <span class="label">月开始，每隔</span>
            <van-stepper v-model="monthInterval2" min="1" max="12" />
            <span class="label">月</span>
          </div>
          
          <div v-if="monthType === 'specific'" class="grid-input">
            <van-checkbox-group v-model="monthSpecific" direction="horizontal">
              <van-checkbox v-for="i in 12" :key="i" :name="i" shape="square">
                {{ i }}
              </van-checkbox>
            </van-checkbox-group>
          </div>
        </div>

        <!-- 周 -->
        <div class="field-section mb-4">
          <div class="section-title">周</div>
          <van-radio-group v-model="weekType" direction="horizontal" class="mb-2">
            <van-radio name="every">每周</van-radio>
            <van-radio name="interval">周期</van-radio>
            <van-radio name="from">间隔</van-radio>
            <van-radio name="specific">指定</van-radio>
            <van-radio name="last-week">本月最后一周</van-radio>
          </van-radio-group>
          
          <div v-if="weekType === 'interval'" class="input-row">
            <span class="label">每隔</span>
            <van-stepper v-model="weekInterval" min="1" max="7" />
            <span class="label">天</span>
          </div>
          
          <div v-if="weekType === 'from'" class="input-row">
            <span class="label">从星期</span>
            <van-stepper v-model="weekFrom" min="0" max="6" />
            <span class="label">开始，每隔</span>
            <van-stepper v-model="weekInterval2" min="1" max="7" />
            <span class="label">天</span>
          </div>
          
          <div v-if="weekType === 'specific'" class="grid-input">
            <van-checkbox-group v-model="weekSpecific" direction="horizontal">
              <van-checkbox :name="0" shape="square">周日</van-checkbox>
              <van-checkbox :name="1" shape="square">周一</van-checkbox>
              <van-checkbox :name="2" shape="square">周二</van-checkbox>
              <van-checkbox :name="3" shape="square">周三</van-checkbox>
              <van-checkbox :name="4" shape="square">周四</van-checkbox>
              <van-checkbox :name="5" shape="square">周五</van-checkbox>
              <van-checkbox :name="6" shape="square">周六</van-checkbox>
            </van-checkbox-group>
          </div>
        </div>
      </div>

      <!-- 最近运行时间 -->
      <div class="bg-white rounded-xl shadow-sm p-4  mb-4">
        <h3 class="text-gray-800 font-semibold text-base mb-3">最近运行时间</h3>
        <div v-if="recentRunTimes.length > 0" class="space-y-2">
          <div
            v-for="(time, index) in recentRunTimes"
            :key="index"
            class="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
          >
            <span class="text-xs text-gray-500">第{{ index + 1 }}次</span>
            <span class="text-sm text-gray-700 font-mono">{{ time }}</span>
          </div>
        </div>
        <div v-else class="text-center py-4 text-gray-400 text-sm">
          暂无运行时间
        </div>
      </div>

      <!-- 常用模板 -->
      <div class="bg-white rounded-xl shadow-sm p-4">
        <h3 class="text-gray-800 font-semibold text-base mb-3">常用模板</h3>
        <div class="grid grid-cols-2 gap-2">
          <button
              v-for="template in templates"
              :key="template.cron"
              class="p-3 bg-gray-50 rounded-lg text-left transition-all hover:bg-gray-100 active:bg-gray-200"
              @click="applyTemplate(template.cron)"
          >
            <div class="font-mono text-sm text-gray-800 mb-1">{{ template.cron }}</div>
            <div class="text-xs text-gray-500">{{ template.desc }}</div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

// 路由
const router = useRouter()

// Cron表达式
const cronExpression = ref('* * * * * *')

// Cron表达式描述
const cronDescription = ref('每秒执行')

// 是否已复制
const copied = ref(false)

// 最近运行时间
const recentRunTimes = ref<string[]>([])

// 秒配置
const secondType = ref<'every' | 'interval' | 'from' | 'specific'>('every')
const secondInterval = ref(1)
const secondFrom = ref(0)
const secondInterval2 = ref(1)
const secondSpecific = ref<number[]>([])

// 分钟配置
const minuteType = ref<'every' | 'interval' | 'from' | 'specific'>('every')
const minuteInterval = ref(1)
const minuteFrom = ref(0)
const minuteInterval2 = ref(1)
const minuteSpecific = ref<number[]>([])

// 小时配置
const hourType = ref<'every' | 'interval' | 'from' | 'specific'>('every')
const hourInterval = ref(1)
const hourFrom = ref(0)
const hourInterval2 = ref(1)
const hourSpecific = ref<number[]>([])

// 日配置
const dayType = ref<'every' | 'interval' | 'from' | 'specific' | 'last' | 'workday'>('every')
const dayInterval = ref(1)
const dayFrom = ref(1)
const dayInterval2 = ref(1)
const daySpecific = ref<number[]>([])

// 月配置
const monthType = ref<'every' | 'interval' | 'from' | 'specific'>('every')
const monthInterval = ref(1)
const monthFrom = ref(1)
const monthInterval2 = ref(1)
const monthSpecific = ref<number[]>([])

// 周配置
const weekType = ref<'every' | 'interval' | 'from' | 'specific' | 'last-week'>('every')
const weekInterval = ref(1)
const weekFrom = ref(0)
const weekInterval2 = ref(1)
const weekSpecific = ref<number[]>([])

// 常用模板
const templates = [
  { cron: '* * * * * *', desc: '每秒' },
  { cron: '*/5 * * * * *', desc: '每5秒' },
  { cron: '0 * * * * *', desc: '每分钟' },
  { cron: '0 */5 * * * *', desc: '每5分钟' },
  { cron: '0 0 * * * *', desc: '每小时' },
  { cron: '0 0 */2 * * *', desc: '每2小时' },
  { cron: '0 0 0 * * *', desc: '每天零点' },
  { cron: '0 0 0 */2 * *', desc: '每2天' },
  { cron: '0 0 0 * * 0', desc: '每周日' },
  { cron: '0 0 0 1 * *', desc: '每月1号' },
  { cron: '0 0 9 * * 1-5', desc: '工作日9点' },
  { cron: '0 0 0 * * 1', desc: '每周一' },
  { cron: '0 30 8 * * *', desc: '每天8:30' },
  { cron: '0 0 0 1 1 *', desc: '每年1月1日' }
]

// 返回上一页
const goBack = () => {
  router.back()
}

// 根据类型生成字段值
const generateFieldValue = (
  type: string,
  interval: number,
  from: number,
  interval2: number,
  specific: number[],
  max: number,
  specialValue?: string
): string => {
  switch (type) {
    case 'every':
      return '*'
    case 'interval':
      return `*/${interval}`
    case 'from':
      return `${from}-${max}/${interval2}`
    case 'specific':
      return specific.length > 0 ? specific.sort((a, b) => a - b).join(',') : '*'
    case 'last':
      return specialValue || 'L'
    case 'workday':
      return specialValue || 'W'
    default:
      return '*'
  }
}

// 更新Cron表达式
const updateCronExpression = () => {
  const second = generateFieldValue(secondType.value, secondInterval.value, secondFrom.value, secondInterval2.value, secondSpecific.value, 59)
  const minute = generateFieldValue(minuteType.value, minuteInterval.value, minuteFrom.value, minuteInterval2.value, minuteSpecific.value, 59)
  const hour = generateFieldValue(hourType.value, hourInterval.value, hourFrom.value, hourInterval2.value, hourSpecific.value, 23)
  
  let day = '*'
  if (dayType.value === 'last') {
    day = 'L'
  } else if (dayType.value === 'workday') {
    day = 'W'
  } else {
    day = generateFieldValue(dayType.value, dayInterval.value, dayFrom.value, dayInterval2.value, daySpecific.value, 31)
  }
  
  const month = generateFieldValue(monthType.value, monthInterval.value, monthFrom.value, monthInterval2.value, monthSpecific.value, 12)
  
  let week = '*'
  if (weekType.value === 'last-week') {
    week = 'L'
  } else {
    week = generateFieldValue(weekType.value, weekInterval.value, weekFrom.value, weekInterval2.value, weekSpecific.value, 6)
  }
  
  cronExpression.value = `${second} ${minute} ${hour} ${day} ${month} ${week}`
  updateDescription()
  calculateRecentRunTimes()
}

// 更新描述
const updateDescription = () => {
  const parts = cronExpression.value.split(' ')
  if (parts.length !== 6) return
  
  const [second, minute, hour, day, month, week] = parts
  const descriptions: string[] = []
  
  // 解析秒
  if (second === '*') {
    descriptions.push('每秒')
  } else if (second.startsWith('*/')) {
    descriptions.push(`每${second.substring(2)}秒`)
  } else if (second.includes('-') && second.includes('/')) {
    const [range, interval] = second.split('/')
    descriptions.push(`从第${range.split('-')[0]}秒开始，每${interval}秒`)
  } else if (second.includes(',')) {
    descriptions.push(`在第${second}秒`)
  } else {
    descriptions.push(`在第${second}秒`)
  }
  
  // 解析分钟
  if (minute === '*') {
    descriptions.push('的每分钟')
  } else if (minute.startsWith('*/')) {
    descriptions.push(`，每${minute.substring(2)}分钟`)
  } else if (minute.includes('-') && minute.includes('/')) {
    const [range, interval] = minute.split('/')
    descriptions.push(`，从第${range.split('-')[0]}分钟开始，每${interval}分钟`)
  } else if (minute.includes(',')) {
    descriptions.push(`，在第${minute}分钟`)
  } else {
    descriptions.push(`，在第${minute}分钟`)
  }
  
  // 解析小时
  if (hour === '*') {
    descriptions.push('的每小时')
  } else if (hour.startsWith('*/')) {
    descriptions.push(`，每${hour.substring(2)}小时`)
  } else if (hour.includes('-') && hour.includes('/')) {
    const [range, interval] = hour.split('/')
    descriptions.push(`，从第${range.split('-')[0]}小时开始，每${interval}小时`)
  } else if (hour.includes(',')) {
    descriptions.push(`，在第${hour}点`)
  } else {
    descriptions.push(`，在第${hour}点`)
  }
  
  // 解析日期
  if (day === '*') {
    descriptions.push('的每日')
  } else if (day === 'L') {
    descriptions.push('的每月最后一日')
  } else if (day === 'W') {
    descriptions.push('的工作日')
  } else if (day.startsWith('*/')) {
    descriptions.push(`，每${day.substring(2)}天`)
  } else if (day.includes('-') && day.includes('/')) {
    const [range, interval] = day.split('/')
    descriptions.push(`，从第${range.split('-')[0]}天开始，每${interval}天`)
  } else if (day.includes(',')) {
    descriptions.push(`，在第${day}日`)
  } else {
    descriptions.push(`，在第${day}日`)
  }
  
  // 解析月份
  if (month === '*') {
    descriptions.push('的每月')
  } else if (month.startsWith('*/')) {
    descriptions.push(`，每${month.substring(2)}个月`)
  } else if (month.includes('-') && month.includes('/')) {
    const [range, interval] = month.split('/')
    descriptions.push(`，从第${range.split('-')[0]}月开始，每${interval}个月`)
  } else if (month.includes(',')) {
    descriptions.push(`，在第${month}月`)
  } else {
    descriptions.push(`，在第${month}月`)
  }
  
  // 解析星期
  if (week === '*') {
    descriptions.push('')
  } else if (week === 'L') {
    descriptions.push('的每月最后一周')
  } else if (week.startsWith('*/')) {
    descriptions.push(`，每${week.substring(2)}天`)
  } else if (week.includes('-') && week.includes('/')) {
    const [range, interval] = week.split('/')
    descriptions.push(`，从星期${range.split('-')[0]}开始，每${interval}天`)
  } else if (week.includes(',')) {
    const weekNames = ['日', '一', '二', '三', '四', '五', '六']
    const weeks = week.split(',').map(w => weekNames[parseInt(w)] || w).join('、')
    descriptions.push(`，在星期${weeks}`)
  } else {
    const weekNames = ['日', '一', '二', '三', '四', '五', '六']
    descriptions.push(`，在星期${weekNames[parseInt(week)] || week}`)
  }
  
  cronDescription.value = descriptions.join('') + '执行'
}

// 解析Cron表达式（反向解析）
const parseCronExpression = () => {
  const parts = cronExpression.value.trim().split(/\s+/)
  if (parts.length !== 6) return
  
  const [second, minute, hour, day, month, week] = parts
  
  // 解析秒
  parseField(second, 59, (type, interval, from, interval2, specific) => {
    secondType.value = type as any
    secondInterval.value = interval
    secondFrom.value = from
    secondInterval2.value = interval2
    secondSpecific.value = specific
  })
  
  // 解析分钟
  parseField(minute, 59, (type, interval, from, interval2, specific) => {
    minuteType.value = type as any
    minuteInterval.value = interval
    minuteFrom.value = from
    minuteInterval2.value = interval2
    minuteSpecific.value = specific
  })
  
  // 解析小时
  parseField(hour, 23, (type, interval, from, interval2, specific) => {
    hourType.value = type as any
    hourInterval.value = interval
    hourFrom.value = from
    hourInterval2.value = interval2
    hourSpecific.value = specific
  })
  
  // 解析日
  if (day === 'L') {
    dayType.value = 'last'
  } else if (day === 'W') {
    dayType.value = 'workday'
  } else {
    parseField(day, 31, (type, interval, from, interval2, specific) => {
      dayType.value = type as any
      dayInterval.value = interval
      dayFrom.value = from
      dayInterval2.value = interval2
      daySpecific.value = specific
    })
  }
  
  // 解析月
  parseField(month, 12, (type, interval, from, interval2, specific) => {
    monthType.value = type as any
    monthInterval.value = interval
    monthFrom.value = from
    monthInterval2.value = interval2
    monthSpecific.value = specific
  })
  
  // 解析周
  if (week === 'L') {
    weekType.value = 'last-week'
  } else {
    parseField(week, 6, (type, interval, from, interval2, specific) => {
      weekType.value = type as any
      weekInterval.value = interval
      weekFrom.value = from
      weekInterval2.value = interval2
      weekSpecific.value = specific
    })
  }
  
  updateDescription()
  calculateRecentRunTimes()
}

// 解析单个字段
const parseField = (
  value: string,
  max: number,
  callback: (type: string, interval: number, from: number, interval2: number, specific: number[]) => void
) => {
  if (value === '*') {
    callback('every', 1, 0, 1, [])
  } else if (value.startsWith('*/')) {
    const interval = parseInt(value.substring(2))
    callback('interval', interval || 1, 0, 1, [])
  } else if (value.includes('-') && value.includes('/')) {
    const [range, interval] = value.split('/')
    const [from] = range.split('-')
    callback('from', 1, parseInt(from) || 0, parseInt(interval) || 1, [])
  } else if (value.includes(',')) {
    const specific = value.split(',').map(v => parseInt(v)).filter(v => !isNaN(v))
    callback('specific', 1, 0, 1, specific)
  } else {
    const num = parseInt(value)
    if (!isNaN(num)) {
      callback('specific', 1, 0, 1, [num])
    } else {
      callback('every', 1, 0, 1, [])
    }
  }
}

// 应用模板
const applyTemplate = (cron: string) => {
  cronExpression.value = cron
  parseCronExpression()
  showToast('已应用模板')
}

// 复制Cron表达式
const copyCron = async () => {
  if (!cronExpression.value) {
    showToast('没有可复制的内容')
    return
  }

  try {
    await navigator.clipboard.writeText(cronExpression.value)
    copied.value = true
    showToast('复制成功')
    
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (e) {
    // 降级方案
    const textArea = document.createElement('textarea')
    textArea.value = cronExpression.value
    textArea.style.position = 'fixed'
    textArea.style.left = '-9999px'
    document.body.appendChild(textArea)
    textArea.select()
    
    try {
      document.execCommand('copy')
      copied.value = true
      showToast('复制成功')
      
      setTimeout(() => {
        copied.value = false
      }, 2000)
    } catch (err) {
      showToast('复制失败')
    } finally {
      document.body.removeChild(textArea)
    }
  }
}

// 计算最近运行时间
const calculateRecentRunTimes = () => {
  const times: string[] = []
  const now = new Date()
  
  // 简化计算：接下来5次运行时间
  for (let i = 1; i <= 5; i++) {
    const nextTime = new Date(now.getTime() + i * 5 * 60 * 1000) // 每次加5分钟
    times.push(formatDateTime(nextTime))
  }
  
  recentRunTimes.value = times
}

// 格式化日期时间
const formatDateTime = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 监听所有配置变化
watch([
  secondType, secondInterval, secondFrom, secondInterval2, secondSpecific,
  minuteType, minuteInterval, minuteFrom, minuteInterval2, minuteSpecific,
  hourType, hourInterval, hourFrom, hourInterval2, hourSpecific,
  dayType, dayInterval, dayFrom, dayInterval2, daySpecific,
  monthType, monthInterval, monthFrom, monthInterval2, monthSpecific,
  weekType, weekInterval, weekFrom, weekInterval2, weekSpecific
], () => {
  updateCronExpression()
}, { deep: true })

// 初始化
updateCronExpression()
</script>

<style scoped>
.back-btn {
  font-size: 24px;
}

.back-btn:active {
  opacity: 0.7;
}

.font-mono {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.field-section {
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.field-section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 12px;
}

.input-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.label {
  font-size: 13px;
  color: #646566;
}

.grid-input {
  margin-top: 8px;
}

.grid-input :deep(.van-checkbox-group) {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
  gap: 8px;
}

.grid-input :deep(.van-checkbox) {
  margin: 0;
}

.grid-input :deep(.van-checkbox__label) {
  font-size: 12px;
}

:deep(.van-radio-group--horizontal) {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

:deep(.van-radio) {
  margin: 0;
}

:deep(.van-stepper) {
  width: auto;
}

:deep(.van-stepper__input) {
  width: 50px;
}
</style>
