/**
 * XXL-JOB 定时任务管理 API
 * 接口由后端封装，入参与 XXL-JOB 原生接口一致
 */
import request from '@/utils/axios'

/**
 * 调度状态枚举
 */
export enum TriggerStatus {
  /** 全部 */
  ALL = -1,
  /** 停止 */
  STOPPED = 0,
  /** 运行中 */
  RUNNING = 1
}

/**
 * 调度类型枚举
 */
export enum ScheduleType {
  /** 无 */
  NONE = 'NONE',
  /** Cron */
  CRON = 'CRON',
  /** 固定速率 */
  FIX_RATE = 'FIX_RATE'
}

/**
 * 定时任务信息（与 XXL-JOB 返回字段一致）
 */
export interface JobInfo {
  /** 任务ID */
  id: number
  /** 执行器主键ID */
  jobGroup: number
  /** 任务描述 */
  jobDesc: string
  /** 添加时间 */
  addTime?: string
  /** 更新时间 */
  updateTime?: string
  /** 负责人 */
  author?: string
  /** 报警邮件 */
  alarmEmail?: string
  /** 调度类型：NONE、CRON、FIX_RATE */
  scheduleType?: string
  /** 调度配置：cron表达式或固定速率 */
  scheduleConf?: string
  /** 调度过期策略 */
  misfireStrategy?: string
  /** 执行器路由策略 */
  executorRouteStrategy?: string
  /** 执行器Handler */
  executorHandler?: string
  /** 执行器参数 */
  executorParam?: string
  /** 阻塞处理策略 */
  executorBlockStrategy?: string
  /** 任务超时时间（秒） */
  executorTimeout?: number
  /** 失败重试次数 */
  executorFailRetryCount?: number
  /** GLUE类型 */
  glueType?: string
  /** 子任务ID */
  childJobId?: string
  /** 调度状态：0-停止，1-运行 */
  triggerStatus: number
  /** 上次调度时间（时间戳） */
  triggerLastTime?: number
  /** 下次调度时间（时间戳） */
  triggerNextTime?: number
}

/**
 * 任务列表查询参数（与 XXL-JOB pageList 入参一致）
 */
export interface JobListRequest {
  /** 分页起始位置 */
  start: number
  /** 每页长度 */
  length: number
  /** 执行器主键ID */
  jobGroup?: number
  /** 调度状态：-1全部，0停止，1运行 */
  triggerStatus?: number
  /** 任务描述（模糊匹配） */
  jobDesc?: string
  /** 执行器Handler */
  executorHandler?: string
  /** 负责人 */
  author?: string
}

/**
 * 任务列表返回结果（XXL-JOB 原始 pageList 返回，后端封装在 data 中）
 */
export interface JobListResult {
  /** 总记录数 */
  recordsTotal: number
  /** 过滤后记录数 */
  recordsFiltered: number
  /** 任务数据列表 */
  data: JobInfo[]
}

/**
 * 执行一次任务参数（与 XXL-JOB trigger 入参一致）
 */
export interface JobTriggerRequest {
  /** 任务ID */
  id: number
  /** 任务参数 */
  executorParam?: string
  /** 执行器地址列表（逗号分隔） */
  addressList?: string
}

/**
 * 查询定时任务列表
 * 后端将 XXL-JOB 返回结果封装到了 data 中
 * @param params 查询参数
 * @returns 任务列表结果
 */
export const getJobList = async (params: JobListRequest): Promise<JobListResult> => {
  const response = await request.post<JobListResult>('/sys/job/list', params)
  return response.data as JobListResult
}

/**
 * 执行一次定时任务
 * @param params 执行参数
 */
export const triggerJob = async (params: JobTriggerRequest): Promise<void> => {
  await request.post('/sys/job/trigger', params)
}

/**
 * 启动定时任务
 * @param id 任务ID
 */
export const startJob = async (id: number): Promise<void> => {
  await request.post('/sys/job/start', { id })
}

/**
 * 停止定时任务
 * @param id 任务ID
 */
export const stopJob = async (id: number): Promise<void> => {
  await request.post('/sys/job/stop', { id })
}
