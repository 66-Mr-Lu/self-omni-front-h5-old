/**
 * Cron 调度时间解析工具
 * 根据 XXL-JOB 任务的调度配置（scheduleType + scheduleConf），
 * 解析出指定时间范围内所有的调度时间点
 */
import { CronExpressionParser } from 'cron-parser'
import type { JobInfo } from '@/api/job'

/** 单个任务最多解析的调度点数，避免高频任务导致内存溢出 */
const MAX_POINTS_PER_JOB = 2000

/**
 * 获取下周（周一 00:00:00 到 周日 23:59:59.999）的时间范围
 * @returns [周起始时间, 周结束时间]
 */
export const getNextWeekRange = (): [Date, Date] => {
  const now = new Date()
  // 当前星期几（0=周日, 1=周一 ... 6=周六）
  const dayOfWeek = now.getDay()
  // 计算距离下一个周一的天数
  // 周一 getDay()=1，要到达下周一，需要 (8 - dayOfWeek) 天（周日时为1天）
  const daysToNextMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek)

  const monday = new Date(now)
  monday.setDate(now.getDate() + daysToNextMonday)
  monday.setHours(0, 0, 0, 0)

  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)

  return [monday, sunday]
}

/**
 * 解析固定速率（FIX_RATE）类型任务在时间范围内的调度点
 * @param rateSeconds 速率（秒）
 * @param start 起始时间
 * @param end 结束时间
 * @returns 调度时间点数组
 */
const parseFixRate = (rateSeconds: number, start: Date, end: Date): Date[] => {
  const points: Date[] = []
  const rateMs = rateSeconds * 1000
  if (rateMs <= 0) return points

  let current = new Date(start)
  while (current.getTime() <= end.getTime() && points.length < MAX_POINTS_PER_JOB) {
    points.push(new Date(current))
    current = new Date(current.getTime() + rateMs)
  }
  return points
}

/**
 * 解析 CRON 类型任务在时间范围内的调度点
 * @param cronExp cron 表达式（5位或6位）
 * @param start 起始时间
 * @param end 结束时间
 * @returns 调度时间点数组
 */
const parseCron = (cronExp: string, start: Date, end: Date): Date[] => {
  const points: Date[] = []
  // XXL-JOB 的 CRON 可能是 5 位（分 时 日 月 周），cron-parser 默认支持 6 位（带秒）
  // 5 位时补秒位 "0 "，保证解析正常
  const expression = cronExp.trim().split(/\s+/).length === 5 ? `0 ${cronExp.trim()}` : cronExp.trim()

  try {
    const interval = CronExpressionParser.parse(expression, {
      currentDate: start,
      endDate: end
    })

    while (interval.hasNext() && points.length < MAX_POINTS_PER_JOB) {
      const next = interval.next()
      const date = next.toDate()
      if (date.getTime() > end.getTime()) break
      points.push(date)
    }
  } catch (err) {
    console.error('Cron 表达式解析失败:', cronExp, err)
  }
  return points
}

/**
 * 解析单个任务在指定时间范围内的所有调度时间点
 * @param job 任务信息
 * @param start 起始时间
 * @param end 结束时间
 * @returns 调度时间点数组，解析失败返回空数组
 */
export const parseJobSchedulePoints = (job: JobInfo, start: Date, end: Date): Date[] => {
  // 停止状态的任务不展示调度点
  if (job.triggerStatus !== 1) return []

  const { scheduleType, scheduleConf } = job
  if (!scheduleType || scheduleType === 'NONE' || !scheduleConf) return []

  if (scheduleType === 'FIX_RATE') {
    const rate = Number(scheduleConf)
    if (isNaN(rate) || rate <= 0) return []
    return parseFixRate(rate, start, end)
  }

  if (scheduleType === 'CRON') {
    return parseCron(scheduleConf, start, end)
  }

  return []
}

/**
 * 时序图数据点
 */
export interface TimelinePoint {
  /** 任务ID */
  jobId: number
  /** 任务描述 */
  jobDesc: string
  /** 调度时间 */
  time: Date
}

/**
 * 批量解析多个任务在下周的调度时间点，合并为时序图数据
 * @param jobs 任务列表
 * @returns 时序图数据点数组
 */
export const buildTimelineData = (jobs: JobInfo[]): TimelinePoint[] => {
  const [start, end] = getNextWeekRange()
  const points: TimelinePoint[] = []

  for (const job of jobs) {
    const times = parseJobSchedulePoints(job, start, end)
    for (const time of times) {
      points.push({
        jobId: job.id,
        jobDesc: job.jobDesc || `任务${job.id}`,
        time
      })
    }
  }

  // 按时间排序
  points.sort((a, b) => a.time.getTime() - b.time.getTime())
  return points
}
