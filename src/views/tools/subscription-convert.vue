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
      <van-tabs v-model="activeTab" @change="handleTabChange">
        <van-tab title="链接转换" name="link">
          <!-- 链接转换内容 -->
        </van-tab>
        <van-tab title="配置转换" name="config">
          <!-- 配置转换内容 -->
        </van-tab>
      </van-tabs>
    </div>

    <!-- 内容区域 -->
    <div class="content pt-24 pb-4 px-4">
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
            placeholder="请粘贴订阅链接（支持 ss://, ssr://, vmess://, trojan://）"
            rows="4"
            autosize
            show-word-limit
            maxlength="50000"
            class="input-field"
          />
        </div>

        <!-- 目标格式选择 -->
        <div class="format-section">
          <div class="section-title">目标格式</div>
          <van-radio-group v-model="linkTargetFormat" direction="horizontal" class="format-group">
            <van-radio
              v-for="format in linkFormatOptions"
              :key="format.value"
              :name="format.value"
            >
              <span class="format-label">{{ format.label }}</span>
            </van-radio>
          </van-radio-group>
        </div>

        <!-- 操作按钮 -->
        <div class="action-section">
          <van-button type="primary" size="large" @click="handleConvertLink">
            <span class="action-icon">🔄</span> 转换链接
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
            placeholder="转换结果将显示在这里..."
            rows="4"
            autosize
            readonly
            class="output-field"
          />
        </div>

        <!-- 使用说明 -->
        <div class="tips-section">
          <div class="section-title">支持格式</div>
          <div class="tips-grid">
            <div class="tip-item">
              <span class="tip-icon">🔗</span>
              <span class="tip-text">Shadowsocks (ss://)</span>
            </div>
            <div class="tip-item">
              <span class="tip-icon">🔗</span>
              <span class="tip-text">ShadowsocksR (ssr://)</span>
            </div>
            <div class="tip-item">
              <span class="tip-icon">🔗</span>
              <span class="tip-text">V2Ray VMess (vmess://)</span>
            </div>
            <div class="tip-item">
              <span class="tip-icon">🔗</span>
              <span class="tip-text">Trojan (trojan://)</span>
            </div>
          </div>
          <div class="tips-desc">
            • 支持批量转换多个链接，每个链接占一行<br>
            • 自动识别输入链接的格式类型
          </div>
        </div>
      </div>

      <!-- 配置转换 Tab -->
      <div v-show="activeTab === 'config'" class="config-panel">
        <!-- 输入区域 -->
        <div class="input-section">
          <div class="section-header">
            <span class="section-title">输入订阅链接或内容</span>
            <div class="input-actions">
              <van-button size="small" @click="handleClearConfig">清空</van-button>
              <van-button size="small" @click="handlePasteConfig">粘贴</van-button>
            </div>
          </div>
          <van-field
            v-model="configInput"
            type="textarea"
            placeholder="请粘贴订阅链接或订阅内容..."
            rows="4"
            autosize
            show-word-limit
            maxlength="50000"
            class="input-field"
          />
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
          <van-button type="primary" size="large" @click="handleConvertConfig">
            <span class="action-icon">🔄</span> 生成配置
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
            <span class="section-title">配置文件</span>
            <div class="output-actions">
              <van-button size="small" @click="handleCopyConfig">复制</van-button>
              <van-button size="small" type="warning" @click="handleDownloadConfig">下载</van-button>
            </div>
          </div>
          <van-field
            v-model="configOutput"
            type="textarea"
            placeholder="配置内容将显示在这里..."
            rows="6"
            autosize
            readonly
            class="output-field"
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
            • 自动生成完整的配置文件，包含代理节点和路由规则<br>
            • 支持批量导入多个订阅链接
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast, showFailToast } from 'vant'
import {
  linkFormatOptions,
  parseSubscriptionContent,
  convertLinks,
  type LinkType,
  type ProxyNode
} from '@/utils/subscriptionConverter'
import { configFormatOptions, convertToConfigFormat, type ConfigFormat } from '@/utils/configConverter'

const router = useRouter()

// Tab 状态
const activeTab = ref('link')

// 链接转换相关
const linkInput = ref('')
const linkTargetFormat = ref<LinkType>('ss')
const linkOutput = ref('')
const linkParsedNodes = ref<ProxyNode[]>([])

// 配置转换相关
const configInput = ref('')
const configTargetFormat = ref<ConfigFormat>('clash')
const configOutput = ref('')
const configParsedNodes = ref<ProxyNode[]>([])

const goBack = () => {
  router.back()
}

const handleTabChange = () => {
  // Tab 切换时无需额外操作
}

// ===== 链接转换方法 =====
const handleClearLink = () => {
  linkInput.value = ''
  linkOutput.value = ''
  linkParsedNodes.value = []
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

const parseLinkContent = () => {
  if (!linkInput.value.trim()) {
    linkParsedNodes.value = []
    return
  }
  try {
    linkParsedNodes.value = parseSubscriptionContent(linkInput.value)
  } catch {
    linkParsedNodes.value = []
  }
}

const handleConvertLink = () => {
  if (!linkInput.value.trim()) {
    showToast('请输入订阅链接')
    return
  }

  parseLinkContent()

  if (linkParsedNodes.value.length === 0) {
    showToast('未能解析到有效链接')
    return
  }

  try {
    linkOutput.value = convertLinks(linkInput.value, linkTargetFormat.value)
    showSuccessToast(`转换完成，共 ${linkParsedNodes.value.length} 个链接`)
  } catch {
    showFailToast('转换失败')
  }
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
    const blob = new Blob([linkOutput.value], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `subscription_links_${Date.now()}.txt`
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
    configParsedNodes.value = parseSubscriptionContent(configInput.value)
  } catch {
    configParsedNodes.value = []
  }
}

const handleConvertConfig = () => {
  if (!configInput.value.trim()) {
    showToast('请输入订阅内容')
    return
  }

  parseConfigContent()

  if (configParsedNodes.value.length === 0) {
    showToast('未能解析到有效节点')
    return
  }

  try {
    configOutput.value = convertToConfigFormat(configParsedNodes.value, configTargetFormat.value)
    showSuccessToast(`配置生成完成，共 ${configParsedNodes.value.length} 个节点`)
  } catch {
    showFailToast('生成失败')
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

// 监听输入变化
watch(linkInput, () => {
  parseLinkContent()
})

watch(configInput, () => {
  parseConfigContent()
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

.input-field,
.output-field {
  background-color: #f7f8fa;
  border-radius: 8px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
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