// 简单的 Flexible 适配方案
// 根据屏幕宽度和 dpr 动态设置根字体大小

interface FlexibleConfig {
  designWidth: number // 设计稿宽度
  minFontSize: number // 最小字体大小
  maxFontSize: number // 最大字体大小
}

const defaultConfig: FlexibleConfig = {
  designWidth: 375, // 移动端设计稿宽度
  minFontSize: 12,
  maxFontSize: 16
}

function setRootFontSize(config?: FlexibleConfig | Event) {
  // 如果是事件对象，使用默认配置
  const finalConfig = (config instanceof Event) ? defaultConfig : (config || defaultConfig)
  const { designWidth, minFontSize, maxFontSize } = finalConfig

  // 获取屏幕宽度
  const screenWidth = window.innerWidth

  // 计算根字体大小
  let fontSize = (screenWidth / designWidth) * 16

  // 限制字体大小范围
  fontSize = Math.max(minFontSize, Math.min(maxFontSize, fontSize))

  // 设置到根元素
  document.documentElement.style.fontSize = `${fontSize}px`
}

// 初始化
setRootFontSize()

// 监听窗口大小变化
window.addEventListener('resize', setRootFontSize)

// 监听屏幕方向变化
window.addEventListener('orientationchange', () => {
  setTimeout(setRootFontSize, 100)
})

export default {
  setRootFontSize,
  config: defaultConfig
}