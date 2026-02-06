<div align="center">

# 🎨 CodeRio

AI-Powered Design-to-Code Tool with High-Fidelity UI Restoration

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE) [![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0%20%3C23.0.0-brightgreen)](https://nodejs.org/) [![npm version](https://img.shields.io/npm/v/coderio.svg)](https://www.npmjs.com/package/coderio) [![Contributors](https://img.shields.io/github/contributors/MigoXLab/coderio)](https://github.com/MigoXLab/coderio/graphs/contributors)

💬 Contact: <a href="https://aicarrier.feishu.cn/docx/KTZCddG2VoarFExTqBEcS55QnRd" target="_blank">WeChat Group</a> | <a href="mailto:coderio&#64;pjlab&#46;org&#46;cn">Email</a>

[English](README.md) | [简体中文](README_zh-CN.md)

</div>

---

## 📑 Table of Contents

- [What is CodeRio?](#what-is-coderio)
- [Examples](#-examples)
- [Quick Start](#-quick-start)
- [All Commands](#-all-commands)
- [Key Features](#-key-features)
- [How It Works](#-how-it-works)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## What is CodeRio?

CodeRio is an intelligent **Figma-to-Code** automation tool that transforms designs into production-ready React code. Unlike traditional converters, CodeRio employs a multi-agent system that validates visual accuracy and iteratively refines misalignments, pursuing high-fidelity UI restoration and **production-ready code structure tailored for developers**.

https://github.com/user-attachments/assets/a0bc1b1c-6aaa-4fbb-a2d8-18aeba70759b

**Perfect for:**

- 🎯 Frontend developers who want accurate design implementation
- 🚀 Teams looking to accelerate development workflows
- 💎 Designers who want their vision precisely realized in code

## ✨ Examples

### Case: CLI with --mode full

After installing CodeRio, you can execute commands directly in the CLI. CodeRio excels at restoring complex landing page styles, handling intricate layouts, identifying and downloading diverse image resources, and encapsulating component structures. By selecting "FULL" mode, a visual fidelity evaluation report is generated upon completion. This report displays deviations between the design and the webpage using both annotation and overlay modes, providing effective guidance for further development by engineers. This example demonstrates a landing page converted from Figma ([Design Link](https://www.figma.com/design/c0UBII8lURfxZIY8W6tSDR/Top-16-Websites-of-2024---Awwwards--Community-?node-id=1-1482&t=FB3Hohq2nsH7ZFts-4)).

https://github.com/user-attachments/assets/bd0c3f18-e98a-4050-bf22-46b198fadac2

<a href="https://static.openxlab.org.cn/coderio/report.html" target="_blank">📊 View Interactive Validation Report</a>

### Case: Development with Cursor Skill

CodeRio can be seamlessly integrated into Cursor as a Skill. Simply input a prompt like **"Create a React project and restore this design with high fidelity,"** along with your output directory, Figma URL([Design Link](https://www.figma.com/design/c0UBII8lURfxZIY8W6tSDR/Top-16-Websites-of-2024---Awwwards--Community-?node-id=30-8264&t=FB3Hohq2nsH7ZFts-4)), and Token. The Agent will guide you step-by-step through the page generation process. For Landing Pages, it achieves **high-fidelity restoration**, accurately reproducing images and styles. It also automatically encapsulates reusable components (such as cards) and strictly adheres to **frontend development best practices**.

https://github.com/user-attachments/assets/43817e97-ffd2-40e3-9d33-78ee55b2ec2d

## 🚀 Quick Start

### Option 1: CLI (Recommended 👍🏻)

Best for one-click generation.

#### 1. Prerequisites

- Node.js >= 18.0.0 (< 25.0.0)
- [Figma Personal Access Token](https://www.figma.com/developers/api#access-tokens)
- **Figma Link**: Select a Frame or Component in Figma, right-click, and choose **Copy link to selection** ([Reference](docs/figma-link.jpg)).
- LLM API Key ([Anthropic](https://console.anthropic.com/) | [OpenAI](https://platform.openai.com/) | [Google](https://aistudio.google.com/))

#### 2. Installation

```bash
# Install globally (recommended)
npm install -g coderio

# Or using pnpm
pnpm add -g coderio
```

> **Note for pnpm v9+ users**: If you see a warning about "Ignored build scripts", run: `pnpm approve-builds` to allow native dependencies (better-sqlite3) to compile properly.
>
> **Note**: Validation features (e.g., `d2c --mode full`) require optional dependencies `playwright` and `sharp`. They are not bundled with coderio by default to keep installation lightweight. Please install them globally beforehand for smoother execution:
>
> ```bash
> npm install -g playwright sharp
> npx playwright install chromium
> ```

#### 3. Configuration

> **Important**: Requires a **multimodal (vision)** model (Recommended: `gemini-3-pro-preview`).

Create config file at `~/.coderio/config.yaml` (Windows: `%USERPROFILE%\.coderio\config.yaml`):

```yaml
model:
    provider: openai # anthropic | openai | google
    model: gemini-3-pro-preview
    baseUrl: https://api.anthropic.com
    apiKey: your-api-key-here

figma:
    token: your-figma-token-here

debug:
    enabled: false # set 'true', if you want to save model and request information
```

#### 4. Usage

```bash
# Convert Figma design to code (default mode: code only)
coderio d2c -s 'https://www.figma.com/design/your-file-id/...'

# Full mode: Generate code + visual validation + auto-refinement
coderio d2c -s 'https://www.figma.com/design/your-file-id/...' -m full
```

#### 5. Run Your Project

```bash
# Navigate to generated project
cd coderio/<design-name_node-id>/my-app

# Install dependencies
pnpm install

# Start dev server
pnpm dev

# 🎉 Open http://localhost:5173
```

#### 6. View Validation Report

report path: coderio/<design-name_node-id>/process/validation/index.html

#### 📖 All Commands

| Command           | Alias | Description                                         |
| ----------------- | ----- | --------------------------------------------------- |
| `design2code`     | `d2c` | Full pipeline: Figma → Protocol → Code → Validation |
| `design2protocol` | `d2p` | Extract design protocol only                        |
| `protocol2code`   | `p2c` | Generate code from existing protocol                |
| `validate`        | `val` | Run validation on generated code                    |
| `images`          | -     | Download and process Figma assets                   |

### Option 2: Docker

Best for portable environments without Node.js installation.

#### 1. Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Figma Personal Access Token](https://www.figma.com/developers/api#access-tokens)
- LLM API Key ([Anthropic](https://console.anthropic.com/) | [OpenAI](https://platform.openai.com/) | [Google](https://aistudio.google.com/))

> **For Windows Users:** The commands below use bash syntax (heredoc, `${PWD}`, `--network=host`, etc.) which are not compatible with CMD or PowerShell. Please use **WSL2** to run them:
>
> 1. Install [WSL2](https://learn.microsoft.com/en-us/windows/wsl/install) and a Linux distribution (e.g. Ubuntu)
> 2. Install [Docker Desktop](https://docs.docker.com/desktop/install/windows-install/) and enable **WSL2 integration** in Settings → Resources → WSL Integration
> 3. Open a WSL2 terminal (run `wsl` in CMD/PowerShell, or open Ubuntu from the Start menu)
> 4. Run all the following commands inside the WSL2 terminal

#### 2. Installation

```bash
docker pull crpi-p4hwwrt00km3axuk.cn-shanghai.personal.cr.aliyuncs.com/coderio/coderio
```

#### 3. Configuration

Create a working directory and `config.yaml`:

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

#### 4. Usage

```bash
docker run -ti --rm \
  --network=host \
  -v ${PWD}:/app \
  -v ./config.yaml:/root/.coderio/config.yaml \
  crpi-p4hwwrt00km3axuk.cn-shanghai.personal.cr.aliyuncs.com/coderio/coderio bash
```

Once inside the container, use CodeRio commands:

```bash
# Convert Figma design to code (default mode: code only)
coderio d2c -s 'https://www.figma.com/design/your-file-id/...'

# Full mode: Generate code + visual validation + auto-refinement
coderio d2c -s 'https://www.figma.com/design/your-file-id/...' -m full
```

#### 5. Run Your Project

```bash
# Navigate to generated project
cd coderio/<design-name_node-id>/my-app

# Install dependencies
pnpm install

# Start dev server
pnpm dev

# 🎉 Open http://localhost:5173
```

#### 6. View Validation Report

Generated files are mounted to your host machine. Open the validation report in your browser:

```
./coderio/<design-name_node-id>/process/validation/index.html
```

### Option 3: Skill (Portable Embedded Workflow)

Best for control and precision using AI Agents.

**Prerequisites**:
Copy the Skill file to your Cursor configuration directory:

Copy `skills\design-to-code` folder to `~\.cursor\skills` (Windows: `%USERPROFILE%\.cursor\skills`)

**Using in Cursor**:

1. Open Cursor Chat.
2. Type: **"Use design-to-code skill to convert this design: [Your Figma URL]"**
3. The Agent will guide you step-by-step through protocol extraction and code generation.

**Using in Claude Code**:

1. Start Claude Code.
2. Type: **"Read docs/skills/SKILL.md and perform design conversion: [Your Figma URL]"**

## 💎 Key Features

### 1. Intelligent Design Protocol Generation

Generates comprehensive frontend protocols combining page component structure, CSS code, and static assets:

- **Component Hierarchy**: Automatically identifies component structure and data states, forming a component hierarchy skeleton that aligns with frontend development practices
- **Style Extraction**: Translates Figma JSON into CSS properties, including colors, spacing, shadows, animations, etc.
- **Asset Optimization**: Automatically identifies and processes image nodes

```typescript
interface Protocol {
    id: string; // Component identifier (e.g., "Header", "Hero")
    data: {
        name: string; // Component name
        purpose: string; // Semantic description
        elements: FigmaFrameInfo[]; // Original Figma node data
        layout?: LayoutInfo; // Position, size, spacing, direction
        componentName?: string; // Reusable component identifier
        props?: PropDefinition[]; // Component props schema
        states?: StateData[]; // Component state variations
    };
    children?: Protocol[]; // Nested child components
}
```

### 2. Visual Validation & Calibration

Ensures pixel-perfect accuracy with automated visual testing:

- **Position Calibration**: Measures exact element positioning using computer vision
- **Visual Diff Reports**: Interactive HTML reports with heatmaps and side-by-side comparisons
- **Automated Refinement**: Iteratively fixes misalignments until accuracy threshold is met
- **Quantifiable Metrics**: MAE, visual image assistance

**Visual Report Features:**

- Annotated screenshots highlighting misalignments
- Heatmap overlays showing pixel differences
- Component-level accuracy breakdown

### 3. Checkpoint & Resume

Built-in interruption recovery system:

- **Auto-Checkpointing**: Saves state after each major operation
- **Resume from Anywhere**: Pick up exactly where you left off
- **Crash Recovery**: Handles network failures, API timeouts, process interruptions

### 4. Production-Ready Code Structure

Beyond visual fidelity, the generated code is built for long-term maintenance:

- **Component-Based Architecture**: Automatically decomposes semantic components (Header, Footer, Hero, etc.), avoiding spaghetti code.
- **Scientific Styling**: Prefers Flexbox/Grid layouts over rigid absolute positioning, ensuring responsiveness across different screen sizes.
- **Modern Tech Stack**: Defaults to React + TypeScript + Tailwind CSS for type safety and scalability.
- **Clean File Structure**: Automatically organizes `components/`, `assets/`, `utils/` directories following industry best practices.

## 🗺️ Roadmap

- [ ] Support for incremental development
- [ ] Style and content validation
- [ ] Component library integration
- [ ] Vue.js and Svelte support
- [ ] Custom design system integration

### 🤝 Contributors

Welcome to contribute. Thanks to all our contributors! 🎉

## 📄 License

Apache-2.0 © CodeRio Contributors
