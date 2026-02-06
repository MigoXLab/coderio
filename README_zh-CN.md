<div align="center">

# 🎨 CodeRio

高保真还原设计稿的前端工程生成智能体

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE) [![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0%20%3C23.0.0-brightgreen)](https://nodejs.org/) [![npm version](https://img.shields.io/npm/v/coderio.svg)](https://www.npmjs.com/package/coderio) [![Contributors](https://img.shields.io/github/contributors/MigoXLab/coderio)](https://github.com/MigoXLab/coderio/graphs/contributors)

💬 联系方式：<a href="https://aicarrier.feishu.cn/docx/KTZCddG2VoarFExTqBEcS55QnRd" target="_blank">微信群</a> ｜ <a href="mailto:coderio&#64;pjlab&#46;org&#46;cn">邮箱</a>

[English](README.md) | [简体中文](README_zh-CN.md)

</div>

---

## 📑 目录

- [CodeRio 是什么？](#coderio-是什么)
- [示例展示](#-示例展示)
- [快速开始](#-快速开始)
- [核心特性](#-核心特性)
- [工作原理](#️-工作原理)
- [路线图](#️-路线图)
- [贡献](#-贡献)
- [许可证](#-许可证)

---

## CodeRio 是什么？

CodeRio 是一款智能的**Figma 转代码**自动化工具，能够将设计稿转换为生产级 React 代码。与传统转换工具不同，CodeRio 采用多智能体系统，能够验证视觉准确度并迭代优化偏差，追求高保真的UI还原和贴合工程师开发规范的代码结构。

https://github.com/user-attachments/assets/a0bc1b1c-6aaa-4fbb-a2d8-18aeba70759b

**适用场景：**

- 🎯 追求精确还原设计的前端开发者
- 🚀 希望加速开发流程的团队
- 💎 期望设计精准实现的设计师

## ✨ 示例展示

### 案例：使用 CLI，--mode full

安装 CodeRio 后可以直接在 CLI 中执行命令使用。CodeRio 对复杂样式的落地页具有出色的还原能力，能够处理复杂的布局、识别并下载多样化的图片资源，以及自动封装组件结构。选择 “FULL” 模式，在生成结束后会自动生成还原度可视化评估报告，以标注和拓印两种模式展示设计稿与网页的偏差，为工程师的进一步开发提供有效指导。本示例展示了一个从 Figma ([设计稿链接](https://www.figma.com/design/c0UBII8lURfxZIY8W6tSDR/Top-16-Websites-of-2024---Awwwards--Community-?node-id=1-1482&t=FB3Hohq2nsH7ZFts-4)) 转换而来的落地页。

https://github.com/user-attachments/assets/bd0c3f18-e98a-4050-bf22-46b198fadac2

<a href="https://static.openxlab.org.cn/coderio/report.html" target="_blank">📊 View Interactive Validation Report</a>

### 案例：在 Cursor 中使用 Skill 开发

CodeRio 支持作为 Skill 集成到 Cursor 中使用。您只需在对话框中输入 **“请帮我创建一个 React 工程，高保真还原设计稿”**，并提供输出目录、设计稿链接([设计稿链接](https://www.figma.com/design/c0UBII8lURfxZIY8W6tSDR/Top-16-Websites-of-2024---Awwwards--Community-?node-id=30-8264&t=FB3Hohq2nsH7ZFts-4))及 Figma Token，Agent 即可引导您逐步完成网页生成。对于落地页（Landing Page）类页面，CodeRio 能达到 **高保真还原** 标准，精确还原图片与样式，并自动对卡片等组件进行 **复用封装**，生成的代码完全符合 **前端开发规范**。

https://github.com/user-attachments/assets/43817e97-ffd2-40e3-9d33-78ee55b2ec2d

## 🚀 快速开始

### 方式 1：命令行 CLI（推荐 👍🏻）

适用于一键快速生成。

#### 1. 前置要求

- Node.js >= 18.0.0 (< 25.0.0)
- [Figma 个人访问令牌](https://www.figma.com/developers/api#access-tokens)
- **Figma 链接**：在 Figma 中选中 Frame 或 Component，右键选择 **Copy link to selection** ([参考图片](docs/figma-link.jpg))。
- LLM API 密钥（[Anthropic](https://console.anthropic.com/) | [OpenAI](https://platform.openai.com/) | [Google](https://aistudio.google.com/)）

#### 2. 安装

```bash
# 全局安装（推荐）
npm install -g coderio

# 或使用 pnpm
pnpm add -g coderio
```

> **pnpm v9+ 用户注意**：如果看到 "Ignored build scripts" 警告，请运行：`pnpm approve-builds`，允许原生依赖（better-sqlite3）正确编译。
>
> **注意**：验证功能（如 `d2c --mode full`）依赖可选依赖 `playwright` 和 `sharp`。为了保持安装轻量，coderio 默认不内置它们。建议您提前全局安装，以确保运行更加顺畅：
>
> ```bash
> npm install -g playwright sharp
> npx playwright install chromium
> ```

#### 3. 配置

> **重要提示**：本工具需要模型具备 **多模态（视觉）能力**（推荐 `gemini-3-pro-preview`）。

创建配置文件 `~/.coderio/config.yaml`（Windows：`%USERPROFILE%\.coderio\config.yaml`）：

```yaml
model:
    provider: openai # anthropic | openai | google
    model: gemini-3-pro-preview
    baseUrl: https://api.anthropic.com
    apiKey: your-api-key-here

figma:
    token: your-figma-token-here

debug:
    enabled: false # 如果需要保留请求和模型回复，可以设置为 true
```

#### 4. 使用

```bash
# 将 Figma 设计转换为代码（默认模式：仅代码）
coderio d2c -s 'https://www.figma.com/design/your-file-id/...'

# 完整模式：生成代码 + 视觉验证 + 自动优化
coderio d2c -s 'https://www.figma.com/design/your-file-id/...' -m full
```

#### 5. 运行项目

```bash
# 进入生成的项目目录
cd coderio/<设计文件名-页面节点编号>/my-app

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 🎉 打开 http://localhost:5173
```

#### 6. 查看验证报告

验证报告目录：`coderio/<设计文件名-页面节点编号>/process/validation/index.html`

#### 📖 全部命令

| 命令              | 别名  | 描述                                 |
| ----------------- | ----- | ------------------------------------ |
| `design2code`     | `d2c` | 完整流程：Figma → 协议 → 代码 → 验证 |
| `design2protocol` | `d2p` | 仅提取设计协议                       |
| `protocol2code`   | `p2c` | 从现有协议生成代码                   |
| `validate`        | `val` | 对生成的代码运行验证                 |
| `images`          | -     | 下载和处理 Figma 资源                |

### 方式 2：Docker

基于 Docker 提供了完整运行时环境，适用于未安装 Node.js 的场景。

#### 1. 前置要求

- [Docker](https://docs.docker.com/get-docker/)
- [Figma 个人访问令牌](https://www.figma.com/developers/api#access-tokens)
- LLM API 密钥（[Anthropic](https://console.anthropic.com/) | [OpenAI](https://platform.openai.com/) | [Google](https://aistudio.google.com/)）

> **Windows 用户指南：** 以下命令使用了 bash 语法（heredoc、`${PWD}`、`--network=host` 等），无法在 CMD 或 PowerShell 中直接运行。请通过 **WSL2** 执行：
>
> 1. 安装 [WSL2](https://learn.microsoft.com/zh-cn/windows/wsl/install) 和 Linux 发行版（如 Ubuntu）
> 2. 安装 [Docker Desktop](https://docs.docker.com/desktop/install/windows-install/)，并在 Settings → Resources → WSL Integration 中开启 **WSL2 集成**
> 3. 打开 WSL2 终端（在 CMD/PowerShell 中运行 `wsl`，或从开始菜单打开 Ubuntu）
> 4. 在 WSL2 终端中执行以下所有命令

#### 2. 安装

```bash
docker pull crpi-p4hwwrt00km3axuk.cn-shanghai.personal.cr.aliyuncs.com/coderio/coderio
```

#### 3. 配置

创建工作目录和 `config.yaml` 配置文件：

```bash
mkdir -p ./coderio-app && cd ./coderio-app
cat > config.yaml << 'EOF'
model:
  provider: openai          # anthropic | openai | google
  model: gemini-3-pro-preview
  baseUrl: https://api.anthropic.com
  apiKey: your-api-key-here

figma:
  token: your-figma-token-here

debug:
  enabled: false
EOF
```

#### 4. 使用

```bash
docker run -ti --rm \
  --network=host \
  -v ${PWD}:/app \
  -v ./config.yaml:/root/.coderio/config.yaml \
  crpi-p4hwwrt00km3axuk.cn-shanghai.personal.cr.aliyuncs.com/coderio/coderio bash
```

进入容器后，使用 CodeRio 命令：

```bash
# 将 Figma 设计转换为代码（默认模式：仅代码）
coderio d2c -s 'https://www.figma.com/design/your-file-id/...'

# 完整模式：生成代码 + 视觉验证 + 自动优化
coderio d2c -s 'https://www.figma.com/design/your-file-id/...' -m full
```

#### 5. 运行项目

```bash
# 进入生成的项目目录
cd coderio/<设计文件名-页面节点编号>/my-app

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 🎉 打开 http://localhost:5173
```

#### 6. 查看验证报告

生成的文件会挂载到宿主机。在浏览器中打开验证报告：

```
./coderio/<设计文件名-页面节点编号>/process/validation/index.html
```

### 方式 3：Skill（便携式嵌入工作流）

适用于需要 AI 辅助和更精准控制的场景。

**前置准备**：
将 `skills\design-to-code` 文件夹拷贝到 `~\.cursor\skills`(windows 为`%USERPROFILE%\.cursor\skills`) 目录下，

**Cursor 中使用**：

1. 打开 Cursor Chat
2. 输入：**"使用 design-to-code skill 帮我转换这个设计：[你的 Figma 链接]"**
3. 智能体将引导你分步完成协议提取和代码生成。

**Claude Code 中使用**：

1. 启动 Claude Code。
2. 输入：**"阅读 docs/skills/SKILL.md 并执行设计转换任务：[你的 Figma 链接]"**

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

### 4. 生成的代码结构贴合前端开发规范

不仅仅是视觉还原，生成的代码更是为了长期维护而生：

- **组件化开发**：自动拆分 Header、Footer、Hero 等语义化组件，拒绝面条式代码。
- **科学的样式定义**：优先使用 Flexbox/Grid 布局，避免过度依赖绝对定位，确保不同屏幕尺寸下的响应性。
- **现代技术栈**：默认使用 React + TypeScript + Tailwind CSS，类型安全且易于扩展。
- **清晰的文件结构**：自动组织 `components/`、`assets/`、`utils/` 等目录，符合行业最佳实践。

## 🗺️ 路线图

- [ ] 支持增量开发
- [ ] 样式与内容校验
- [ ] 组件库集成
- [ ] 支持 Vue.js 和 Svelte
- [ ] 自定义设计系统集成

## 🤝 贡献

我们欢迎贡献！感谢所有贡献者！🎉

## 📄 许可证

Apache-2.0 © CodeRio 贡献者
