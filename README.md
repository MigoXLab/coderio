<div align="center">

# 🎨 CodeRio

AI-Powered Design-to-Code Tool with High-Fidelity UI Restoration

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE) [![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0%20%3C23.0.0-brightgreen)](https://nodejs.org/) [![npm version](https://img.shields.io/npm/v/coderio.svg)](https://www.npmjs.com/package/coderio) [![Contributors](https://img.shields.io/github/contributors/MigoXLab/coderio)](https://github.com/MigoXLab/coderio/graphs/contributors)

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

CodeRio is an intelligent **Figma-to-Code** automation tool that transforms designs into production-ready React code. Unlike traditional converters, CodeRio employs a multi-agent system that validates visual accuracy and iteratively refines misalignments, pursuing high-fidelity UI restoration.

**Perfect for:**

- 🎯 Frontend developers who want accurate design implementation
- 🚀 Teams looking to accelerate development workflows
- 💎 Designers who want their vision precisely realized in code

## ✨ Examples

## 🚀 Quick Start

### 1. Prerequisites

- Node.js >= 18.0.0 (< 23.0.0)
- [Figma Personal Access Token](https://www.figma.com/developers/api#access-tokens)
- LLM API Key ([Anthropic](https://console.anthropic.com/) | [OpenAI](https://platform.openai.com/) | [Google](https://aistudio.google.com/))

### 2. Installation

```bash
# Install globally (recommended)
npm install -g coderio

# Or using pnpm
pnpm add -g coderio
```

> **Note for pnpm v9+ users**: If you see a warning about "Ignored build scripts", run:
>
> ```bash
> pnpm approve-builds
> ```
>
> This allows native dependencies (better-sqlite3, sharp) to compile properly.

### 3. Configuration

Create `~/.coderio/config.yaml`:

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

debug:
  enabled: false
EOF
```

### 4. Usage

```bash
# Convert Figma design to validated code
coderio d2c -s 'https://www.figma.com/design/your-file-id/...'
```

CodeRio will:

1. ✅ Fetch Figma design and generate protocol
2. ✅ Create React + TypeScript + Tailwind CSS code
3. ✅ Launch dev server and capture screenshots
4. ✅ Validate visual accuracy and refine misalignments
5. ✅ Generate interactive validation report

### 5. Run Your Project

```bash
# Navigate to generated project
cd coderio/<design-name_node-id>/my-app

# Install dependencies
pnpm install

# Start dev server
pnpm dev

# 🎉 Open http://localhost:5173
```

### 6. View Validation Report

```bash
# Open validation report in browser
open coderio/<design-name_node-id>/validation/index.html
```

## 📖 All Commands

| Command           | Alias | Description                                         |
| ----------------- | ----- | --------------------------------------------------- |
| `design2code`     | `d2c` | Full pipeline: Figma → Protocol → Code → Validation |
| `design2protocol` | `d2p` | Extract design protocol only                        |
| `protocol2code`   | `p2c` | Generate code from existing protocol                |
| `validate`        | `val` | Run validation on generated code                    |
| `images`          | -     | Download and process Figma assets                   |

### Step-by-Step Workflow

For more control, run each step individually:

```bash
# Step 1: Extract design protocol
coderio d2p -s 'https://www.figma.com/design/.../...'

# Step 2: Generate code from protocol
coderio p2c -p './coderio/<design-name_node-id>/process/protocol.json'

# Step 3: Run validation (coming soon)
# coderio val -p './coderio/<design-name_node-id>/my-app'
```

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

## 🛠️ How It Works

CodeRio uses a sophisticated multi-agent pipeline:

```
Figma Design → Protocol → Code → Launch → Validate → Refine → Report
     ↓           ↓         ↓       ↓        ↓          ↓        ↓
  Fetch API  Structure  Initial  Launch   Judge    Refiner  Visualize
             Style      Agent    Agent    Agent    Agent
             Hierarchy
```

1. **Protocol Generation**: Extracts structure, styles, and assets from Figma
2. **Code Generation**: Creates React components with Tailwind CSS
3. **Launch**: Installs dependencies and starts dev server
4. **Validation**: Captures screenshots and compares with design
5. **Refinement**: Automatically fixes misalignments
6. **Reporting**: Generates interactive visual report

## 🗺️ Roadmap

- [ ] Support for incremental development
- [ ] Style and content validation
- [ ] Component library integration
- [ ] Vue.js and Svelte support
- [ ] Custom design system integration

## 🤝 Contributing

we welcome contributions!

```bash
git clone https://github.com/MigoXLab/coderio.git
cd coderio
pnpm install
pnpm build
```

### Development & Testing

```bash
# Run tests
pnpm test

# Watch mode for development
pnpm test:watch

# Generate coverage report
pnpm test:coverage

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

For testing guidelines, see [tests/README.md](tests/README.md)

### Contributors

Thanks to all our contributors! 🎉

<a href="https://github.com/MigoXLab/coderio/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=MigoXLab/coderio" />
</a>

## 📄 License

Apache-2.0 © CodeRio Contributors
