<template>
  <div class="subscription-convert-page">
    <!-- 顶部导航栏 -->
    <div class="header fixed top-0 left-0 right-0 bg-gradient-to-r from-primary to-info z-50">
      <div class="flex items-center px-5 h-12">
        <div class="back-btn w-8 h-8 flex items-center justify-center cursor-pointer" @click="goBack">
          <span class="text-white text-2xl">‹</span>
        </div>
        <h1 class="text-white text-lg font-semibold mx-3">订阅转换</h1>
      </div>
    </div>

    <!-- Tab 切换 -->
    <div class="tabs-container fixed top-12 left-0 right-0 bg-white z-40 border-b">
      <van-tabs v-model:active="activeTab" @change="handleTabChange">
        <van-tab title="订阅转换" name="link"></van-tab>
        <van-tab title="配置转换" name="config"></van-tab>
      </van-tabs>
    </div>

    <!-- 内容区域 -->
    <div class="content pt-10 pb-4 px-4">
      <!-- 链接转换 Tab -->
      <div v-show="activeTab === 'link'" class="link-panel">
        <!-- 输入区域 -->
        <div class="input-section">
          <div class="section-header">
            <span class="section-title">输入订阅链接</span>
            <div class="input-actions">
              <van-button size="small" @click="handleClearLink">清空</van-button>
              <van-button size="small" @click="handlePasteLink">粘贴</van-button>
            </div>
          </div>
          <van-field
            v-model="linkInput"
            type="textarea"
            placeholder="请粘贴订阅链接（支持 http:// 或 https:// 开头的订阅地址）"
            rows="6"
            maxlength="50000"
            class="input-field fixed-height"
          />
          <div class="input-tips">
            <span class="tips-icon">ℹ️</span>
            <span class="tips-text">支持 Clash、Surge、Quantumult 等订阅格式，系统将自动请求并转换</span>
          </div>
        </div>

        <!-- 目标格式选择 -->
        <div class="format-section">
          <div class="section-title">目标客户端格式</div>
          <van-radio-group v-model="linkTargetFormat" direction="horizontal" class="format-group">
            <van-radio
              v-for="format in configFormatOptions"
              :key="format.value"
              :name="format.value"
            >
              <span class="format-label">{{ format.label }}</span>
            </van-radio>
          </van-radio-group>
        </div>

        <!-- 操作按钮 -->
        <div class="action-section">
          <van-button type="primary" size="large" @click="handleConvertLink" :loading="linkConverting">
            <span class="action-icon">🔄</span> 获取并转换
          </van-button>
        </div>

        <!-- 解析结果 -->
        <div v-if="linkParsedNodes.length > 0" class="stats-section">
          <div class="section-header">
            <span class="section-title">解析结果</span>
            <span class="stats-count">共 {{ linkParsedNodes.length }} 个节点</span>
          </div>
          <div class="nodes-list">
            <div
              v-for="node in linkParsedNodes"
              :key="node.id"
              class="node-item"
            >
              <div class="node-name">{{ node.name }}</div>
              <div class="node-info">{{ node.type.toUpperCase() }} | {{ node.server }}:{{ node.port }}</div>
            </div>
          </div>
        </div>

        <!-- 输出区域 -->
        <div class="output-section">
          <div class="section-header">
            <span class="section-title">转换结果</span>
            <div class="output-actions">
              <van-button size="small" @click="handleCopyLink">复制</van-button>
              <van-button size="small" type="warning" @click="handleDownloadLink">下载</van-button>
            </div>
          </div>
          <van-field
            v-model="linkOutput"
            type="textarea"
            placeholder="转换后的配置将显示在这里..."
            rows="8"
            readonly
            class="output-field fixed-height"
          />
        </div>

        <!-- 使用说明 -->
        <div class="tips-section">
          <div class="section-title">使用说明</div>
          <div class="tips-desc">
            • 输入 HTTP/HTTPS 订阅链接，系统会自动请求后端获取订阅内容<br>
            • 支持 Clash、Surge、Quantumult 等常见订阅格式<br>
            • 可选择转换为目标客户端的配置格式（Clash/Surge/Quantumult X/V2Ray等）<br>
            • 相同链接切换格式时无需重复请求，提升转换速度<br>
            • 所有操作在本地完成，不会上传您的订阅信息
          </div>
        </div>
      </div>

      <!-- 配置转换 Tab -->
      <div v-show="activeTab === 'config'" class="config-panel">
        <!-- 输入区域 -->
        <div class="input-section">
          <div class="section-header">
            <span class="section-title">输入配置文件内容</span>
            <div class="input-actions">
              <van-button size="small" @click="handleClearConfig">清空</van-button>
              <van-button size="small" @click="handlePasteConfig">粘贴</van-button>
            </div>
          </div>
          <van-field
            v-model="configInput"
            type="textarea"
            placeholder="请粘贴代理软件配置文件内容（支持 Clash、Surge、Quantumult 等格式）"
            rows="8"
            maxlength="100000"
            class="input-field fixed-height"
          />
          <div class="input-tips">
            <span class="tips-icon">ℹ️</span>
            <span class="tips-text">直接粘贴配置文件内容，系统将自动识别格式并转换</span>
          </div>
        </div>

        <!-- 源格式选择（可选，自动识别） -->
        <div class="format-section">
          <div class="section-header">
            <span class="section-title">源格式</span>
            <span class="auto-detect-badge">自动识别</span>
          </div>
          <div class="format-hint">
            <span class="hint-text">系统会自动检测输入的配置文件格式</span>
          </div>
        </div>

        <!-- 目标格式选择 -->
        <div class="format-section">
          <div class="section-title">目标格式</div>
          <van-radio-group v-model="configTargetFormat" direction="horizontal" class="format-group">
            <van-radio
              v-for="format in configFormatOptions"
              :key="format.value"
              :name="format.value"
            >
              <span class="format-label">{{ format.label }}</span>
            </van-radio>
          </van-radio-group>
        </div>

        <!-- 操作按钮 -->
        <div class="action-section">
          <van-button type="primary" size="large" @click="handleConvertConfig" :loading="configConverting">
            <span class="action-icon">🔄</span> 转换配置
          </van-button>
        </div>

        <!-- 解析结果 -->
        <div v-if="configParsedNodes.length > 0" class="stats-section">
          <div class="section-header">
            <span class="section-title">解析结果</span>
            <span class="stats-count">共 {{ configParsedNodes.length }} 个节点</span>
          </div>
          <div class="nodes-list">
            <div
              v-for="node in configParsedNodes"
              :key="node.id"
              class="node-item"
            >
              <div class="node-name">{{ node.name }}</div>
              <div class="node-info">{{ node.type.toUpperCase() }} | {{ node.server }}:{{ node.port }}</div>
            </div>
          </div>
        </div>

        <!-- 输出区域 -->
        <div class="output-section">
          <div class="section-header">
            <span class="section-title">转换结果</span>
            <div class="output-actions">
              <van-button size="small" @click="handleCopyConfig">复制</van-button>
              <van-button size="small" type="warning" @click="handleDownloadConfig">下载</van-button>
            </div>
          </div>
          <van-field
            v-model="configOutput"
            type="textarea"
            placeholder="转换后的配置将显示在这里..."
            rows="10"
            readonly
            class="output-field fixed-height"
          />
        </div>

        <!-- 使用说明 -->
        <div class="tips-section">
          <div class="section-title">支持格式</div>
          <div class="tips-grid">
            <div class="tip-item">
              <span class="tip-icon">📄</span>
              <span class="tip-text">Clash/ClashX</span>
            </div>
            <div class="tip-item">
              <span class="tip-icon">📄</span>
              <span class="tip-text">Surge</span>
            </div>
            <div class="tip-item">
              <span class="tip-icon">📄</span>
              <span class="tip-text">Quantumult/X</span>
            </div>
            <div class="tip-item">
              <span class="tip-icon">📄</span>
              <span class="tip-text">Shadowrocket</span>
            </div>
            <div class="tip-item">
              <span class="tip-icon">📄</span>
              <span class="tip-text">Sing-box</span>
            </div>
          </div>
          <div class="tips-desc">
            • 支持主流代理软件配置文件互转<br>
            • 自动识别输入配置格式，无需手动选择<br>
            • 保留节点信息和基本路由规则
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast, showFailToast, showLoadingToast, closeToast } from 'vant'
import { parseSubscriptionContent, type ProxyNode } from '@/utils/subscriptionConverter'
import { configFormatOptions, convertToConfigFormat, type ConfigFormat } from '@/utils/configConverter'
import { fetchSubscription, detectSubscriptionFormat, decodeBase64Subscription } from '@/api/subscription'
import { parseConfigContent as parseConfigFileContent } from '@/utils/configParser'

const router = useRouter()

// Tab 状态
const activeTab = ref('link')

// 链接转换相关
const linkInput = ref('')
const linkTargetFormat = ref<ConfigFormat>('clash')
const linkOutput = ref('')
const linkParsedNodes = ref<ProxyNode[]>([])
const linkConverting = ref(false)

// 缓存上次请求的链接和解析结果
const lastLinkUrl = ref('')
const lastLinkContent = ref('')

// 配置转换相关
const configInput = ref('')
const configTargetFormat = ref<ConfigFormat>('clash')
const configOutput = ref('')
const configParsedNodes = ref<ProxyNode[]>([])
const configConverting = ref(false)

// 防抖定时器
let linkParseTimer: number | null = null
let configParseTimer: number | null = null

const goBack = () => {
  router.back()
}

const handleTabChange = (name: string) => {
  // Tab 切换时清除定时器，避免不必要的解析
  if (linkParseTimer) {
    clearTimeout(linkParseTimer)
    linkParseTimer = null
  }
  if (configParseTimer) {
    clearTimeout(configParseTimer)
    configParseTimer = null
  }
  
  // 可以在这里添加切换时的其他逻辑
  console.log('切换到:', name)
}

// ===== 链接转换方法 =====
const handleClearLink = () => {
  linkInput.value = ''
  linkOutput.value = ''
  linkParsedNodes.value = []
  lastLinkUrl.value = ''
  lastLinkContent.value = ''
  showToast('已清空')
}

const handlePasteLink = async () => {
  try {
    const text = await navigator.clipboard.readText()
    linkInput.value = text
    showSuccessToast('已粘贴')
  } catch {
    showToast('粘贴失败，请手动粘贴')
  }
}

// const parseLinkContent = () => {
//   if (!linkInput.value.trim()) {
//     linkParsedNodes.value = []
//     return
//   }
//   try {
//     const nodes = parseSubscriptionContent(linkInput.value)
//     linkParsedNodes.value = nodes
//     if (nodes.length > 0) {
//       showSuccessToast(`解析成功，共 ${nodes.length} 个节点`)
//     }
//   } catch (error) {
//     console.error('解析链接失败:', error)
//     linkParsedNodes.value = []
//     showFailToast('解析失败，请检查输入格式')
//   }
// }

const handleConvertLink = async () => {
  if (!linkInput.value.trim()) {
    showToast('请输入订阅链接')
    return
  }

  // 验证是否为 HTTP/HTTPS 链接
  const url = linkInput.value.trim()
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    showFailToast('请输入有效的 HTTP 或 HTTPS 订阅链接')
    return
  }

  linkConverting.value = true
  
  // 检查是否需要重新请求后台接口
  const needFetch = url !== lastLinkUrl.value || !lastLinkContent.value
  
  let content = ''
  let format = ''
  
  if (needFetch) {
    showLoadingToast({
      message: '正在获取订阅...',
      forbidClick: true,
      duration: 0
    })
    
    try {
      // 1. 获取订阅内容
      const result = await fetchSubscription({ url })
      content = result.content
      format = result.format || detectSubscriptionFormat(content)
      console.log('检测到订阅格式:', format)
      
      // 2. 如果是 Base64 编码，先解码
      let processedContent = content
      if (format === 'base64-links') {
        processedContent = decodeBase64Subscription(content)
      }
      
      // 3. 解析节点
      const nodes = parseSubscriptionContent(processedContent)
      linkParsedNodes.value = nodes
      
      if (nodes.length === 0) {
        linkConverting.value = false
        closeToast()
        showFailToast('未能解析到有效节点，请检查订阅内容')
        return
      }
      
      // 缓存结果
      lastLinkUrl.value = url
      lastLinkContent.value = processedContent
    } catch (error) {
      console.error('转换失败:', error)
      linkConverting.value = false
      closeToast()
      const errorMsg = error instanceof Error ? error.message : '未知错误'
      showFailToast('获取失败: ' + errorMsg)
      return
    }
  } else {
    // 使用缓存的内容，只需重新解析
    showLoadingToast({
      message: '正在转换格式...',
      forbidClick: true,
      duration: 0
    })
    
    content = lastLinkContent.value
    const nodes = parseSubscriptionContent(content)
    linkParsedNodes.value = nodes
    
    if (nodes.length === 0) {
      linkConverting.value = false
      closeToast()
      showFailToast('解析失败，请重新输入链接')
      return
    }
  }

  // 4. 转换为目标格式（每次都需要执行）
  const configResult = convertToConfigFormat(linkParsedNodes.value, linkTargetFormat.value)
  if (!configResult || configResult.startsWith('# No')) {
    linkConverting.value = false
    closeToast()
    showFailToast('转换失败，请检查目标格式是否支持')
    return
  }
  
  linkOutput.value = configResult
  linkConverting.value = false
  closeToast()
  showSuccessToast(`转换完成，共 ${linkParsedNodes.value.length} 个节点`)
}

const handleCopyLink = async () => {
  if (!linkOutput.value) {
    showToast('没有可复制的内容')
    return
  }
  try {
    await navigator.clipboard.writeText(linkOutput.value)
    showSuccessToast('已复制到剪贴板')
  } catch {
    showToast('复制失败')
  }
}

const handleDownloadLink = () => {
  if (!linkOutput.value) {
    showToast('没有可下载的内容')
    return
  }
  try {
    let ext = 'txt'
    if (linkTargetFormat.value === 'singbox') {
      ext = 'json'
    } else if (['clash', 'quantumultX'].includes(linkTargetFormat.value)) {
      ext = 'yaml'
    } else if (['surge', 'quantumult'].includes(linkTargetFormat.value)) {
      ext = 'conf'
    } else if (linkTargetFormat.value === 'v2ray') {
      ext = 'txt'
    }
    const blob = new Blob([linkOutput.value], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `subscription_config_${Date.now()}.${ext}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showSuccessToast('下载成功')
  } catch {
    showToast('下载失败')
  }
}

// ===== 配置转换方法 =====
const handleClearConfig = () => {
  configInput.value = ''
  configOutput.value = ''
  configParsedNodes.value = []
  showToast('已清空')
}

const handlePasteConfig = async () => {
  try {
    const text = await navigator.clipboard.readText()
    configInput.value = text
    showSuccessToast('已粘贴')
  } catch {
    showToast('粘贴失败，请手动粘贴')
  }
}

const parseConfigContent = () => {
  if (!configInput.value.trim()) {
    configParsedNodes.value = []
    return
  }
  try {
    const content = configInput.value.trim()
    let nodes: ProxyNode[] = []
    
    // 首先尝试解析为配置文件格式
    nodes = parseConfigFileContent(content)
    
    // 如果解析失败，尝试解析为链接列表
    if (nodes.length === 0) {
      nodes = parseSubscriptionContent(content)
    }
    
    configParsedNodes.value = nodes
    if (nodes.length > 0) {
      showSuccessToast(`解析成功，共 ${nodes.length} 个节点`)
    }
  } catch (error) {
    console.error('解析配置失败:', error)
    configParsedNodes.value = []
    showFailToast('解析失败，请检查输入格式')
  }
}

const handleConvertConfig = () => {
  if (!configInput.value.trim()) {
    showToast('请输入订阅内容')
    return
  }

  configConverting.value = true

  // 先解析
  const nodes = parseSubscriptionContent(configInput.value)
  configParsedNodes.value = nodes

  if (nodes.length === 0) {
    configConverting.value = false
    showFailToast('未能解析到有效节点，请检查输入是否正确')
    return
  }

  try {
    const result = convertToConfigFormat(nodes, configTargetFormat.value)
    if (!result || result.startsWith('# No')) {
      configConverting.value = false
      showFailToast('生成失败，没有可转换的有效节点')
      return
    }
    configOutput.value = result
    configConverting.value = false
    showSuccessToast(`配置生成完成，共 ${nodes.length} 个节点`)
  } catch (error) {
    console.error('生成配置失败:', error)
    configConverting.value = false
    showFailToast('生成失败: ' + (error instanceof Error ? error.message : '未知错误'))
  }
}

const handleCopyConfig = async () => {
  if (!configOutput.value) {
    showToast('没有可复制的内容')
    return
  }
  try {
    await navigator.clipboard.writeText(configOutput.value)
    showSuccessToast('已复制到剪贴板')
  } catch {
    showToast('复制失败')
  }
}

const handleDownloadConfig = () => {
  if (!configOutput.value) {
    showToast('没有可下载的内容')
    return
  }
  try {
    const ext = configTargetFormat.value === 'singbox' ? 'json' : 'conf'
    const blob = new Blob([configOutput.value], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `config_${Date.now()}.${ext}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showSuccessToast('下载成功')
  } catch {
    showToast('下载失败')
  }
}

// 监听输入变化（防抖处理）- 仅配置转换需要
watch(configInput, () => {
  if (configParseTimer) clearTimeout(configParseTimer)
  configParseTimer = window.setTimeout(() => {
    parseConfigContent()
  }, 500)
})

// 监听链接输入变化，清空缓存
watch(linkInput, (newVal, oldVal) => {
  if (newVal !== oldVal && newVal.trim() !== lastLinkUrl.value) {
    // 链接改变时清空缓存
    lastLinkUrl.value = ''
    lastLinkContent.value = ''
  }
})
</script>

<style scoped>
.subscription-convert-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tabs-container {
  background-color: #fff;
}

.input-section,
.format-section,
.output-section,
.stats-section,
.tips-section {
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: #fff;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: #323233;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-header .section-title {
  margin-bottom: 0;
}

.auto-detect-badge {
  display: inline-block;
  padding: 2px 8px;
  background-color: #1989fa;
  color: #fff;
  font-size: 12px;
  border-radius: 4px;
}

.input-field,
.output-field {
  background-color: #f7f8fa;
  border-radius: 8px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
}

.fixed-height {
  height: auto !important;
  min-height: unset !important;
}

.fixed-height :deep(textarea) {
  height: auto !important;
  min-height: unset !important;
}

.input-tips {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 8px;
  background-color: #f7f8fa;
  border-radius: 6px;
}

.tips-icon {
  font-size: 14px;
  flex-shrink: 0;
}

.tips-text {
  font-size: 12px;
  color: #969799;
  line-height: 1.5;
}

.format-hint {
  margin-top: 8px;
  padding: 8px;
  background-color: #f7f8fa;
  border-radius: 6px;
}

.hint-text {
  font-size: 12px;
  color: #969799;
}

.input-actions,
.output-actions {
  display: flex;
  gap: 8px;
}

.format-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.format-label {
  font-size: 12px;
}

.action-section {
  display: flex;
  gap: 12px;
}

.action-section .van-button {
  flex: 1;
}

.action-icon {
  margin-right: 4px;
}

.stats-count {
  font-size: 12px;
  color: #969799;
}

.nodes-list {
  max-height: 150px;
  overflow-y: auto;
}

.node-item {
  padding: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.node-item:last-child {
  border-bottom: none;
}

.node-name {
  font-size: 14px;
  font-weight: 500;
  color: #323233;
}

.node-info {
  font-size: 12px;
  color: #969799;
  margin-top: 4px;
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-top: 12px;
}

.tip-item {
  display: flex;
  align-items: center;
  padding: 8px;
  background-color: #f7f8fa;
  border-radius: 6px;
}

.tip-icon {
  margin-right: 8px;
  font-size: 16px;
}

.tip-text {
  font-size: 13px;
  color: #646566;
}

.tips-desc {
  margin-top: 12px;
  font-size: 12px;
  color: #969799;
  line-height: 1.6;
}
</style>