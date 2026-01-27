<div align="center">

# 🎨 CodeRio

高保真还原设计稿的前端工程生成智能体

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE) [![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0%20%3C23.0.0-brightgreen)](https://nodejs.org/) [![npm version](https://img.shields.io/npm/v/coderio.svg)](https://www.npmjs.com/package/coderio) [![Contributors](https://img.shields.io/github/contributors/MigoXLab/coderio)](https://github.com/MigoXLab/coderio/graphs/contributors)

[English](README.md) | [简体中文](README_zh-CN.md)

</div>

---

## 📑 目录

- [CodeRio 是什么？](#coderio-是什么)
- [示例展示](#-示例展示)
- [快速开始](#-快速开始)
- [全部命令](#-全部命令)
- [核心特性](#-核心特性)
- [工作原理](#️-工作原理)
- [路线图](#️-路线图)
- [贡献](#-贡献)
- [许可证](#-许可证)

---

## CodeRio 是什么？

CodeRio 是一款智能的**Figma 转代码**自动化工具，能够将设计稿转换为生产级 React 代码。与传统转换工具不同，CodeRio 采用多智能体系统，能够验证视觉准确度并迭代优化偏差，追求高保真的UI还原。

**适用场景：**

- 🎯 追求精确还原设计的前端开发者
- 🚀 希望加速开发流程的团队
- 💎 期望设计精准实现的设计师

## ✨ 示例展示

## 🚀 快速开始

### 1. 前置要求

- Node.js >= 18.0.0 (< 23.0.0)
- [Figma 个人访问令牌](https://www.figma.com/developers/api#access-tokens)
- LLM API 密钥（[Anthropic](https://console.anthropic.com/) | [OpenAI](https://platform.openai.com/) | [Google](https://aistudio.google.com/)）

### 2. 安装

```bash
# 全局安装
npm install -g coderio

# 或使用 pnpm（推荐）
pnpm add -g coderio
```

### 3. 配置

创建 `~/.coderio/config.yaml`：

```bash
mkdir -p ~/.coderio
cat > ~/.coderio/config.yaml << 'EOF'
model:
  provider: anthropic          # anthropic | openai | google
  model: claude-3-5-sonnet-20241022
  baseUrl: https://api.anthropic.com
  apiKey: your-api-key-here

figma:
  token: your-figma-token-here
EOF
```

### 4. 使用

```bash
# 将 Figma 设计转换为验证过的代码
coderio d2c -s 'https://www.figma.com/design/your-file-id/...'
```

CodeRio 将会：

1. ✅ 获取 Figma 设计并生成协议
2. ✅ 创建 React + TypeScript + Tailwind CSS 代码
3. ✅ 启动开发服务器并捕获截图
4. ✅ 验证视觉准确度并优化偏差
5. ✅ 生成交互式验证报告

### 5. 运行项目

```bash
# 进入生成的项目目录
cd coderio/<设计文件名-页面节点编号>/my-app

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 🎉 打开 http://localhost:5173
```

### 6. 查看验证报告

```bash
# 在浏览器中打开验证报告
open coderio/<设计文件名-页面节点编号>/validation/index.html
```

## 📖 全部命令

| 命令              | 别名  | 描述                                 |
| ----------------- | ----- | ------------------------------------ |
| `design2code`     | `d2c` | 完整流程：Figma → 协议 → 代码 → 验证 |
| `design2protocol` | `d2p` | 仅提取设计协议                       |
| `protocol2code`   | `p2c` | 从现有协议生成代码                   |
| `validate`        | `val` | 对生成的代码运行验证                 |
| `images`          | -     | 下载和处理 Figma 资源                |

### 分步骤工作流

如需更多控制，可单独运行每个步骤：

```bash
# 步骤 1：提取设计协议
coderio d2p -s 'https://www.figma.com/design/.../...'

# 步骤 2：从协议生成代码
coderio p2c -p './coderio/<设计文件名-页面节点编号>/process/protocol.json'

# 步骤 3：运行验证（即将推出）
# coderio val -p './coderio/<设计文件名-页面节点编号>/my-app'
```

## 💎 核心特性

### 1. 智能设计协议生成

生成结合页面组件结构、CSS代码、静态资源的综合前端协议：

- **组件层级识别**：自动识别组件结构和数据状态，形成贴合前端开发习惯的组件层次骨架
- **样式提取**：将 Figma JSON 解译为CSS 属性，包括颜色、间距、阴影、动画等
- **资源优化**：自动识别并处理图片节点

```typescript
interface Protocol {
    id: string; // 组件标识符（如 "Header", "Hero"）
    data: {
        name: string; // 组件名称
        purpose: string; // 语义描述
        elements: FigmaFrameInfo[]; // 原始 Figma 节点数据
        layout?: LayoutInfo; // 位置、尺寸、间距、方向
        componentName?: string; // 可复用组件标识符
        props?: PropDefinition[]; // 组件 props 定义
        states?: StateData[]; // 组件状态变体
    };
    children?: Protocol[]; // 嵌套子组件
}
```

### 2. 视觉验证与校准

通过自动化视觉测试确保像素级精度：

- **位置校准**：使用计算机视觉测量元素的精确定位
- **视觉差异报告**：交互式 HTML 报告，包含热力图和并排对比
- **自动优化**：迭代修复偏差直至达到准确度阈值
- **量化指标**：MAE、视觉图片辅助

**视觉报告功能：**

- 标注偏差的截图
- 显示像素差异的热力图叠加层
- 组件级准确度分析

### 3. 断点续传

内置的中断恢复系统：

- **自动检查点**：每个主要操作后自动保存状态
- **任意位置恢复**：精确恢复到中断位置
- **崩溃恢复**：处理网络故障、API 超时、进程中断

## 🛠️ 工作原理

CodeRio 使用复杂的多智能体流水线：

```
Figma 设计 → 协议 → 代码 → 启动 → 验证 → 优化 → 报告
     ↓       ↓      ↓      ↓      ↓      ↓      ↓
  获取API  结构   初始   启动   判断   优化   可视化
          样式   智能体  智能体  智能体  智能体
          层级
```

1. **协议生成**：从 Figma 提取结构、样式和资源
2. **代码生成**：创建带 Tailwind CSS 的 React 组件
3. **启动**：安装依赖并启动开发服务器
4. **验证**：捕获截图并与设计对比
5. **优化**：自动修复偏差
6. **报告**：生成交互式视觉报告

## 🗺️ 路线图

- [ ] 支持增量开发
- [ ] 样式与内容校验
- [ ] 组件库集成
- [ ] 支持 Vue.js 和 Svelte
- [ ] 自定义设计系统集成

## 🤝 贡献

我们欢迎贡献！

```bash
git clone https://github.com/MigoXLab/coderio.git
cd coderio
pnpm install
pnpm build
```

### 贡献者

感谢所有贡献者！🎉

<a href="https://github.com/MigoXLab/coderio/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=MigoXLab/coderio" />
</a>

## 📄 许可证

Apache-2.0 © CodeRio 贡献者
