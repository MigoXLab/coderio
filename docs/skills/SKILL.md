---
name: figma-to-code
description: Pixel-perfect Figma to React conversion with production-grade code quality. Generates semantic, type-safe components following frontend best practices (TypeScript, Vite, TailwindCSS V4). Use when converting Figma to code or user mentions Figma URL. Works with coderio npm packages and IDE's native AI model.
---

# Figma to Code

High-fidelity UI restoration from Figma designs to production-ready React + TypeScript components with semantic structure, maintainable architecture, and adherence to modern frontend development standards.

## Design Philosophy

This SKILL is designed to work seamlessly with **IDE's native AI models** (Cursor, Claude Code, etc.):

- **No external LLM API configuration** - uses your IDE's built-in model
- **Task-driven workflow** - explicit task lists with progress tracking
- **Checkpoint mechanism** - supports interruption recovery
- **Verification loops** - ensures completeness at each phase
- **Type-safe utilities** - leverages coderio's exported functions

### Critical Success Factors

**1. Visual Reference (Thumbnail Image)**
- **WHY**: AI needs to see the design to generate accurate structure, props, and styling
- **HOW**: Downloaded in Phase 2 and attached to every AI task
- **IMPACT**: Without thumbnail, props may be missing and code quality significantly degrades

**2. Strict Prompt Adherence**
- **WHY**: Prompts contain critical rules (2-level max, naming conventions, asset matching)
- **HOW**: AI must read and follow prompts exactly - no improvisation
- **IMPACT**: Deviating from prompts causes path errors, missing components, wrong structure

**3. Validation at Every Step**
- **WHY**: Catches issues early (missing props, incomplete protocol, wrong paths)
- **HOW**: Mandatory verification checkpoints after each phase
- **IMPACT**: Prevents cascading failures in later phases

## Prerequisites

Before starting, ensure:

1. **Figma API Token**: Required for accessing Figma designs
    - Get from: Figma → Settings → Personal Access Tokens
2. **Node.js**: Version 18+ installed
3. **pnpm**: Package manager (can use npm/yarn as alternative)
4. **coderio package**: Available in your project or globally linked

## Workflow Overview

The Figma to Code process has three main phases:

```
Phase 1: INITIAL  → Scaffold React project
Phase 2: PROTOCOL → Generate design protocol (with task tracking)
Phase 3: CODE     → Generate components (with task tracking)
```

## Directory Structure

```
{appPath}/
├── src/
│   ├── assets/          # Downloaded images from Figma
│   ├── components/      # Generated React components
│   ├── App.tsx
│   └── ...
├── process/             # Figma processing artifacts
│   ├── figma.json       # Raw Figma document
│   ├── images.json      # Image metadata
│   ├── processed.json   # Processed with CSS styles
│   └── protocol.json    # Final semantic structure
└── scripts/             # SKILL execution scripts & progress
    ├── phase2-progress.json
    ├── phase3-progress.json
    └── *.md             # Generated prompts for debugging
```

---

# Installation

Before using this SKILL, you need to install the `coderio` package.

```bash
# Using pnpm
# pnpm add coderio

# Or link locally during development
pnpm link coderio
```

## Verification

```bash
# Check if coderio is installed
pnpm list coderio

# Test import
node -e "const c = require('coderio'); console.log('OK:', Object.keys(c).length, 'exports')"
```

---

# Phase 1: Initialize Project

## Goal

Create a complete React + TypeScript + Vite + TailwindCSS V4 project structure.

## Execution Steps

### Step 1.1: Collect Parameters

Collect the following information from the user:

| Parameter    | Description                               | Example                                         |
| ------------ | ----------------------------------------- | ----------------------------------------------- |
| `appPath`    | Absolute path where to create the project | `/Users/me/projects/my-app`                     |
| `appName`    | Name of the application                   | `MyApp`                                         |
| `figmaUrl`   | Figma design file URL                     | `https://figma.com/file/ABC123/...?node-id=1:2` |
| `figmaToken` | Figma personal access token               | `figd_...`                                      |

### Step 1.2: Generate Scaffolding Instructions

```typescript
import { INITIAL_AGENT_SYSTEM_PROMPT, initialAgentInstruction } from 'coderio';

const appPath = '/absolute/path/to/project';
const appName = 'MyApp';

// Get the instruction for AI agent
const instruction = initialAgentInstruction({ appPath, appName });

console.log('=== SYSTEM PROMPT ===');
console.log(INITIAL_AGENT_SYSTEM_PROMPT);
console.log('=== USER INSTRUCTION ===');
console.log(instruction);
```

### Step 1.3: Execute Scaffolding

**As the AI agent, you should now:**

1. Read the `INITIAL_AGENT_SYSTEM_PROMPT` as your system context
2. Follow the `instruction` to create the project structure
3. Create all required files at the specified `appPath`:
    - `.gitignore`
    - `package.json` (with React, Vite, Tailwind V4, TypeScript, Less)
    - `vite.config.ts` (with @ alias and Tailwind plugin)
    - `tsconfig.json` (with path mapping)
    - `index.html`
    - `src/main.tsx`
    - `src/App.tsx`
    - `src/App.less`
    - `src/globals.css` (with `@import "tailwindcss";`)
    - `src/vite-env.d.ts`

### Step 1.4: Create Working Directories

```typescript
import fs from 'fs';
import path from 'path';

// Create working directories
const processDir = path.join(appPath, 'process');
const scriptsDir = path.join(appPath, 'scripts');
const assetsDir = path.join(appPath, 'src/assets');

fs.mkdirSync(processDir, { recursive: true });
fs.mkdirSync(scriptsDir, { recursive: true });
fs.mkdirSync(assetsDir, { recursive: true });

console.log('Created directories:', { processDir, scriptsDir, assetsDir });
```

### Step 1.5: Verify Installation

```bash
cd /absolute/path/to/project
pnpm install
pnpm dev  # Should start on http://localhost:5173
```

**Verification checklist:**

- [ ] All files exist in appPath
- [ ] package.json includes tailwindcss v4 and @tailwindcss/vite
- [ ] vite.config.ts has @ alias and Tailwind plugin
- [ ] tsconfig.json has path mapping for @/\*
- [ ] dev server starts successfully
- [ ] `process/`, `scripts/`, `src/assets/` directories exist

---

# Phase 2: Generate Design Protocol

## Goal

Extract design data from Figma and generate a semantic component structure protocol with props definitions and state data.

## Overview

This phase:

1. Fetches Figma document and downloads assets
2. Processes Figma styles to CSS
3. Uses AI to generate semantic component structure
4. Extracts props and state for all reusable components (with task tracking)

---

## Step 2.1: Setup and Fetch Figma Data

### 2.1.1: Import Utilities

```typescript
import {
    parseFigmaUrl,
    executeFigmaAndImagesActions,
    figmaTool,
    extractNodePositionsHierarchical,
    postProcessStructure,
    extractComponentGroups,
    simplifyFigmaNodeForContent,
    extractDataListPrompt,
    extractJSON,
    applyPropsAndStateToProtocol,
    toKebabCase,
    toPascalCase,
    type Protocol,
    type FigmaFrameInfo,
    type ParsedDataListResponse,
} from 'coderio';
import fs from 'fs';
import path from 'path';
```

**Important**: The `toKebabCase` and `toPascalCase` functions ensure path/name consistency:
- `toKebabCase`: Converts component names to file paths (e.g., "TaskCard" → "task-card")
- `toPascalCase`: Converts file paths to component names (e.g., "task-card" → "TaskCard")

### 2.1.2: Parse Figma URL

```typescript
const figmaUrl = 'YOUR_FIGMA_URL';
const figmaToken = 'YOUR_FIGMA_TOKEN';
const appPath = '/absolute/path/to/project';

const urlInfo = parseFigmaUrl(figmaUrl);
const processDir = path.join(appPath, 'process');
const scriptsDir = path.join(appPath, 'scripts');
const assetsDir = path.join(appPath, 'src/assets');

console.log('Figma URL Info:', urlInfo);
```

### 2.1.3: Fetch Figma Document and Download Assets

```typescript
// This step may take a while depending on design complexity
const { document, imageNodesMap } = await executeFigmaAndImagesActions(urlInfo, assetsDir, processDir);

// Files created:
// - process/figma.json - Raw Figma document
// - process/images.json - Downloaded images metadata
// - src/assets/*.png/svg - All downloaded image files

console.log('Figma document fetched, images downloaded:', Object.keys(imageNodesMap).length);
```

### 2.1.4: Process Figma Document

```typescript
// Simplify image nodes (replace image data with @/assets/... paths)
const simplifiedDoc = figmaTool.simplifyImageNodes(document, imageNodesMap);

// Convert Figma styles to CSS (colors, effects, etc.)
const processedDoc = figmaTool.processedStyle(simplifiedDoc);

// Save for reference
fs.writeFileSync(path.join(processDir, 'processed.json'), JSON.stringify(processedDoc, null, 2));

console.log('Figma styles processed to CSS');
```

### 2.1.5: Download Thumbnail Image (CRITICAL)

**IMPORTANT**: The thumbnail image is essential for accurate AI generation. Download it locally so your IDE can attach it to AI requests.

```typescript
import { downloadImage } from 'coderio';

const thumbnailUrl = processedDoc.thumbnailUrl || '';
let localThumbnailPath = '';

if (thumbnailUrl) {
    try {
        // Download as base64 for easy attachment
        const base64Image = await downloadImage(thumbnailUrl, undefined, undefined, true);

        // Also save to file for debugging
        const thumbnailPath = path.join(processDir, 'thumbnail.png');
        fs.writeFileSync(thumbnailPath, Buffer.from(base64Image, 'base64'));

        localThumbnailPath = thumbnailPath;

        console.log('Thumbnail downloaded to:', thumbnailPath);
        console.log('Thumbnail ready for AI context');
    } catch (error) {
        console.error('Failed to download thumbnail:', error);
        console.warn('Continuing without thumbnail - accuracy may be reduced');
    }
} else {
    console.warn('No thumbnail URL found - accuracy may be reduced');
}
```

**Verification**: Check that `process/thumbnail.png` exists and can be opened.

---

## Step 2.2: Generate Semantic Structure (AI Task)

### 2.2.1: Prepare Structure Prompt

```typescript
import { generateStructurePrompt } from 'coderio';

const frames = processedDoc.frames || processedDoc.children;
const imageWidth = processedDoc.absoluteBoundingBox?.width || 1440;

// Extract hierarchical position data
const positions = extractNodePositionsHierarchical(frames);

// Generate AI prompt
const structurePrompt = generateStructurePrompt({
    positions: JSON.stringify(positions, null, 2),
    width: String(imageWidth),
});

// Save prompt for debugging
fs.writeFileSync(path.join(scriptsDir, 'structure-prompt.md'), structurePrompt);

console.log('Structure prompt saved to scripts/structure-prompt.md');
console.log('Thumbnail image path:', localThumbnailPath);
console.log('IMPORTANT: You MUST attach the thumbnail image in the next AI task');
```

### 2.2.2: Generate Structure (AI TASK)

**CRITICAL - Before You Start**:
1. **Locate the thumbnail**: `process/thumbnail.png` (downloaded in step 2.1.5)
2. **Attach it to your context**: In Cursor/Claude Code, use the "Attach Image" feature or directly reference the file path
3. **Verify attachment**: Make sure you can see the design visually before generating JSON

**As the AI agent, you MUST now:**

1. **MANDATORY: Attach the thumbnail image** (`process/thumbnail.png`) to your context
   - In Cursor: Click the paperclip icon and select `process/thumbnail.png`
   - In Claude Code: Reference the file path `process/thumbnail.png` and ensure it's loaded
   - **DO NOT PROCEED** without the visual reference - it's critical for accuracy

2. **Read the prompt** from `scripts/structure-prompt.md`

3. **Generate a JSON structure** following the exact schema in the prompt:
    - Semantic grouping (e.g., "PricingCard", "UserProfile")
    - Grid/List detection (merge repeated items into containers)
    - Component granularity (max 2 levels deep, min 5 elements per component)
    - Layout direction detection (HORIZONTAL vs VERTICAL)

4. **Return ONLY the JSON object** - no markdown, no explanations

**Important**:
- Use the visual design from the thumbnail to guide semantic grouping
- Don't rely solely on the positions data - the visual layout takes priority
- Ensure component names reflect actual UI purpose (not generic names like "Container1")

### 2.2.3: Parse and Post-process Structure

```typescript
// After AI generates the structure JSON:
const structureResult = `<PASTE AI's JSON RESPONSE HERE>`;

// Extract clean JSON (removes markdown code blocks if any)
const jsonContent = extractJSON(structureResult);
const parsedStructure = JSON.parse(jsonContent) as Protocol | Protocol[];

// Post-process structure: normalize names, populate elements, annotate paths
postProcessStructure(parsedStructure, frames);

const protocol = (Array.isArray(parsedStructure) ? parsedStructure[0] : parsedStructure) as Protocol;

// Save intermediate result
fs.writeFileSync(path.join(processDir, 'pre-protocol.json'), JSON.stringify(protocol, null, 2));

console.log('Structure post-processed and saved to process/pre-protocol.json');
```

---

## Step 2.3: Extract Props and State (Task-Driven)

**CRITICAL**: This step processes multiple components. Use the task tracking system to ensure all components are processed.

### 2.3.1: Initialize Task List

```typescript
// Find all component groups
const componentGroups = extractComponentGroups(protocol);
const taskList = Array.from(componentGroups.keys());

// Initialize progress tracking
const progressPath = path.join(scriptsDir, 'phase2-progress.json');
const progress = {
    phase: 'props-extraction',
    totalTasks: taskList.length,
    tasks: taskList.map(name => ({
        componentName: name,
        status: 'pending', // 'pending' | 'in_progress' | 'completed' | 'failed'
        instanceCount: componentGroups.get(name)?.length || 0,
    })),
    completedAt: null,
};

fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2));

console.log('='.repeat(60));
console.log('PHASE 2.3: Props Extraction Task List');
console.log('='.repeat(60));
console.log(`Total components to process: ${taskList.length}`);
taskList.forEach((name, i) => {
    const count = componentGroups.get(name)?.length || 0;
    console.log(`  ${i + 1}. ${name} (${count} instance${count > 1 ? 's' : ''})`);
});
console.log('='.repeat(60));
console.log('Progress file:', progressPath);
```

### 2.3.2: Process Each Component (LOOP)

**IMPORTANT**: Execute this block for EACH component in the task list. Do NOT skip any component.

```typescript
// Read current progress
const currentProgress = JSON.parse(fs.readFileSync(progressPath, 'utf-8'));

// Find next pending task
const nextTask = currentProgress.tasks.find(t => t.status === 'pending');

if (!nextTask) {
    console.log('All tasks completed! Proceed to Step 2.3.4');
} else {
    const componentName = nextTask.componentName;
    console.log(`\nProcessing: ${componentName}`);

    // Mark as in_progress
    nextTask.status = 'in_progress';
    fs.writeFileSync(progressPath, JSON.stringify(currentProgress, null, 2));

    // Get component data
    const instances = componentGroups.get(componentName) || [];
    const containerName = protocol.data.name || 'Container';

    // Prepare simplified Figma data
    const allElements = instances.flatMap(g => g.data.elements || []);
    const simplifiedNodes = allElements
        .filter((n): n is FigmaFrameInfo => typeof n === 'object' && n !== null)
        .map(n => simplifyFigmaNodeForContent(n));

    // Generate prompt
    const propsPrompt = extractDataListPrompt({
        containerName,
        childComponentName: componentName,
        figmaData: JSON.stringify(simplifiedNodes, null, 2),
    });

    // Save prompt for debugging
    const promptPath = path.join(scriptsDir, `${componentName}-props-prompt.md`);
    fs.writeFileSync(promptPath, propsPrompt);

    console.log(`Prompt saved to: scripts/${componentName}-props-prompt.md`);
    console.log('--- AI TASK: Generate props and state JSON ---');
}
```

### 2.3.3: AI Task - Generate Props/State

**CRITICAL - Before You Start**:
1. **Locate the thumbnail**: `process/thumbnail.png`
2. **Attach it to your context**: This visual reference is MANDATORY for accurate props extraction
3. **Verify you can see the design**: Props extraction requires visual understanding

**As the AI agent, for the current component:**

1. **MANDATORY: Attach the thumbnail image** (`process/thumbnail.png`)
   - In Cursor: Click paperclip icon and select `process/thumbnail.png`
   - In Claude Code: Reference the file path and ensure it's loaded
   - **This is NOT optional** - visual context dramatically improves props accuracy

2. **Read the prompt** from `scripts/{componentName}-props-prompt.md`

3. **Analyze the Figma data** and extract:
    - **Props schema**: Type definitions (e.g., `{ key: "title", type: "string", description: "..." }`)
    - **State array**: Actual data instances (e.g., `[{ title: "...", iconSrc: "@/assets/..." }, ...]`)

4. **Return a JSON object** with format:

```json
{
    "props": [
        { "key": "title", "type": "string", "description": "Card title" },
        { "key": "iconSrc", "type": "string", "description": "Icon image path" }
    ],
    "state": [
        { "title": "Actual Title 1", "iconSrc": "@/assets/actual-file-1.svg" },
        { "title": "Actual Title 2", "iconSrc": "@/assets/actual-file-2.svg" }
    ]
}
```

**CRITICAL Rules**:
- **USE EXACT values from Figma** - no placeholders, no invented data
- **Image paths MUST be exact**: Use the actual `url` field from Figma nodes (starts with `@/assets/`)
- **Props MUST NOT be empty**: Every component with repeated instances needs at least 1-3 props
- **Deep search for text**: Text nodes can be nested deeply - look recursively
- **Use visual reference**: The thumbnail helps identify what text/images are important vs decorative

### 2.3.4: Apply Result and Update Progress

```typescript
// After AI generates props/state JSON:
const propsResult = `<PASTE AI's JSON RESPONSE HERE>`;

// Parse result
const jsonContent = extractJSON(propsResult);
const parsedData: ParsedDataListResponse = JSON.parse(jsonContent);

// CRITICAL: Validate props before applying
if (!parsedData.props || parsedData.props.length === 0) {
    console.error(`ERROR: No props generated for component!`);
    console.error(`This will cause issues in code generation.`);
    console.error(`Please retry Step 2.3.3 with the thumbnail image attached.`);
    throw new Error('Props validation failed - props array is empty');
}

if (!parsedData.state || parsedData.state.length === 0) {
    console.warn(`WARNING: No state data generated for component`);
    console.warn(`Component will not have data to render`);
}

// Log validation success
console.log(`✓ Validation passed: ${parsedData.props.length} props, ${parsedData.state.length} state entries`);

// Read current progress to get component name
const currentProgress = JSON.parse(fs.readFileSync(progressPath, 'utf-8'));
const currentTask = currentProgress.tasks.find(t => t.status === 'in_progress');

if (currentTask) {
    const componentName = currentTask.componentName;
    const instances = componentGroups.get(componentName) || [];
    const isList = instances.length > 1;

    // Apply props and state to protocol
    applyPropsAndStateToProtocol(parsedData, protocol, componentName, instances, isList);

    // Mark task as completed
    currentTask.status = 'completed';
    fs.writeFileSync(progressPath, JSON.stringify(currentProgress, null, 2));

    // Save intermediate protocol
    fs.writeFileSync(path.join(processDir, `protocol-after-${componentName}.json`), JSON.stringify(protocol, null, 2));

    console.log(`Completed: ${componentName}`);
    console.log(`  Props: ${parsedData.props.map(p => p.key).join(', ')}`);

    // Check remaining tasks
    const remaining = currentProgress.tasks.filter(t => t.status === 'pending');
    if (remaining.length > 0) {
        console.log(`\nRemaining tasks: ${remaining.length}`);
        console.log('>>> GO BACK TO Step 2.3.2 to process next component <<<');
    } else {
        console.log('\nAll components processed! Proceed to Step 2.3.5');
    }
}
```

### 2.3.5: Verification (MANDATORY)

**CRITICAL: Do NOT proceed to Phase 3 until this verification passes.**

```typescript
// Read final progress
const finalProgress = JSON.parse(fs.readFileSync(progressPath, 'utf-8'));

// Check for incomplete tasks
const pendingTasks = finalProgress.tasks.filter(t => t.status === 'pending');
const failedTasks = finalProgress.tasks.filter(t => t.status === 'failed');
const completedTasks = finalProgress.tasks.filter(t => t.status === 'completed');

console.log('='.repeat(60));
console.log('PHASE 2.3 VERIFICATION');
console.log('='.repeat(60));
console.log(`Completed: ${completedTasks.length}/${finalProgress.totalTasks}`);
console.log(`Pending:   ${pendingTasks.length}`);
console.log(`Failed:    ${failedTasks.length}`);

if (pendingTasks.length > 0) {
    console.log('\n INCOMPLETE - Pending components:');
    pendingTasks.forEach(t => console.log(`  - ${t.componentName}`));
    console.log('\n>>> GO BACK TO Step 2.3.2 to process remaining components <<<');
} else if (failedTasks.length > 0) {
    console.log('\n FAILURES - Failed components:');
    failedTasks.forEach(t => console.log(`  - ${t.componentName}`));
    console.log('\nRetry failed components or continue with partial protocol.');
} else {
    console.log('\n ALL COMPLETE!');

    // Update progress
    finalProgress.completedAt = new Date().toISOString();
    fs.writeFileSync(progressPath, JSON.stringify(finalProgress, null, 2));

    // Save final protocol
    fs.writeFileSync(path.join(processDir, 'protocol.json'), JSON.stringify(protocol, null, 2));

    console.log('Protocol saved to: process/protocol.json');
    console.log('>>> Ready for Phase 3 <<<');
}
console.log('='.repeat(60));
```

---

# Phase 3: Generate React Components

## Goal

Generate production-ready React + TypeScript components from the protocol.

## Overview

This phase recursively processes the protocol tree and generates:

- Frame components (containers that compose children)
- Leaf components (self-contained UI elements with props)
- TypeScript interfaces
- TailwindCSS + Less styling
- Asset imports

---

## Step 3.1: Initialize Code Generation

### 3.1.1: Import Utilities

```typescript
import {
    type Protocol,
    flattenPostOrder,
    detectRenderingModes,
    generateFramePrompt,
    generateComponentPrompt,
    DEFAULT_STYLING,
    saveGeneratedCode,
    workspaceManager,
} from 'coderio';
import fs from 'fs';
import path from 'path';
```

### 3.1.2: Load Data and Initialize Task List

```typescript
const appPath = '/absolute/path/to/project';
const processDir = path.join(appPath, 'process');
const scriptsDir = path.join(appPath, 'scripts');

// Load protocol
const protocol: Protocol = JSON.parse(fs.readFileSync(path.join(processDir, 'protocol.json'), 'utf-8'));

// Verify thumbnail exists (from Phase 2)
const thumbnailPath = path.join(processDir, 'thumbnail.png');
if (!fs.existsSync(thumbnailPath)) {
    console.warn('WARNING: Thumbnail not found at process/thumbnail.png');
    console.warn('Code generation accuracy may be reduced without visual reference');
} else {
    console.log('Thumbnail found:', thumbnailPath);
}

// Get available assets
const assetsDir = path.join(appPath, 'src/assets');
const assetFiles = fs.readdirSync(assetsDir);
const assetFilesList = assetFiles.join(', ');

// Flatten tree (post-order: children first, then parents)
const flatNodes = flattenPostOrder(protocol);

// Initialize progress tracking
const progressPath = path.join(scriptsDir, 'phase3-progress.json');
const progress = {
    phase: 'code-generation',
    totalTasks: flatNodes.length,
    tasks: flatNodes.map((node, index) => ({
        index,
        nodeId: node.id,
        componentName: node.data.name || node.data.componentName || 'Unknown',
        componentPath: node.data.path || node.data.componentPath || '',
        isLeaf: !node.children?.length,
        status: 'pending',
    })),
    completedAt: null,
};

fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2));

console.log('='.repeat(60));
console.log('PHASE 3: Code Generation Task List');
console.log('='.repeat(60));
console.log(`Total components to generate: ${flatNodes.length}`);
console.log(`Available assets: ${assetFiles.length} files`);
console.log('');
progress.tasks.forEach((task, i) => {
    const type = task.isLeaf ? 'LEAF' : 'FRAME';
    console.log(`  ${i + 1}. [${type}] ${task.componentName}`);
    console.log(`      Path: ${task.componentPath}`);
});
console.log('='.repeat(60));
```

---

## Step 3.2: Generate Components (LOOP)

**IMPORTANT**: Execute this block for EACH component. Process in order (children before parents).

### 3.2.1: Get Next Task

```typescript
// Read current progress
const currentProgress = JSON.parse(fs.readFileSync(progressPath, 'utf-8'));

// Find next pending task
const nextTask = currentProgress.tasks.find(t => t.status === 'pending');

if (!nextTask) {
    console.log('All components generated! Proceed to Step 3.3');
} else {
    const taskIndex = nextTask.index;
    const currentNode = flatNodes[taskIndex];
    const componentName = nextTask.componentName;
    const isLeaf = nextTask.isLeaf;

    console.log(`\n[${taskIndex + 1}/${currentProgress.totalTasks}] Generating: ${componentName}`);
    console.log(`Type: ${isLeaf ? 'Leaf Component' : 'Frame Component'}`);

    // Mark as in_progress
    nextTask.status = 'in_progress';
    fs.writeFileSync(progressPath, JSON.stringify(currentProgress, null, 2));

    // Generate prompt based on component type
    let prompt: string;

    if (isLeaf) {
        // Leaf component (no children)
        prompt = generateComponentPrompt({
            componentName,
            componentDetails: JSON.stringify(currentNode.data, null, 2),
            styling: JSON.stringify(DEFAULT_STYLING),
            assetFiles: assetFilesList,
        });
    } else {
        // Frame component (has children)
        const childrenImports = (currentNode.children || []).map(child => ({
            name: child.data.name || '',
            path: child.data.path,
        }));

        const renderingModes = detectRenderingModes(currentNode);

        prompt = generateFramePrompt({
            frameDetails: JSON.stringify(currentNode.data, null, 2),
            childrenImports: JSON.stringify(childrenImports, null, 2),
            styling: JSON.stringify(DEFAULT_STYLING),
            assetFiles: assetFilesList,
            renderingModes,
        });
    }

    // Save prompt for debugging
    const promptPath = path.join(scriptsDir, `${componentName}-code-prompt.md`);
    fs.writeFileSync(promptPath, prompt);

    console.log(`Prompt saved to: scripts/${componentName}-code-prompt.md`);
    console.log('--- AI TASK: Generate component code ---');
}
```

### 3.2.2: AI Task - Generate Component Code

**CRITICAL - Before You Start**:
1. **Locate the thumbnail**: `process/thumbnail.png` (from Phase 2)
2. **Attach it to your context**: This ensures pixel-perfect styling and layout
3. **Verify the design is visible**: Visual reference is key for high-fidelity code

**As the AI agent, for the current component:**

1. **MANDATORY: Attach the thumbnail image** (`process/thumbnail.png`)
   - In Cursor: Click paperclip and select `process/thumbnail.png`
   - In Claude Code: Reference the file path and ensure it loads
   - **This is essential** for accurate styling, spacing, and visual fidelity

2. **Read the prompt** from `scripts/{componentName}-code-prompt.md`

3. **Generate the component code** following the prompt instructions:
   - Match the design pixel-perfectly (spacing, colors, typography)
   - Use exact asset filenames from the available assets list
   - Implement props correctly (for reusable components)
   - Follow the styling guidelines (Tailwind + Less modules)

4. **Output format:**

For single file (TSX only):

```tsx
// code...
```

For multiple files (TSX + Styles):

````
## index.tsx
```tsx
import ChildComponent from '@/components/child-component';
// ...
````

## index.module.less

```less
.customStyle {
    ...;
}
```

````

**Important Visual Matching Rules**:
- **Spacing**: Use the thumbnail to verify exact spacing (gaps, padding, margins)
- **Colors**: Extract colors from the Figma data, but verify visually against thumbnail
- **Typography**: Font sizes, weights, and line heights must match the design
- **Asset placement**: Images/icons must be positioned correctly as shown in thumbnail
- **Layout**: Flex/grid layouts should match the visual structure exactly

**Common Pitfalls to Avoid**:
- ❌ Using wrong asset filenames (check the available assets list carefully)
- ❌ Guessing spacing values (use the provided layout data + visual verification)
- ❌ Missing imports (every @/assets path needs an import statement)
- ❌ Using @apply in Less files (use vanilla CSS/Less syntax)
- ❌ Adding React import (not needed in modern React)

### 3.2.3: Save Code and Update Progress

```typescript
// After AI generates the code:
const generatedCode = `<PASTE AI's CODE RESPONSE HERE>`;

// Read current progress
const currentProgress = JSON.parse(fs.readFileSync(progressPath, 'utf-8'));
const currentTask = currentProgress.tasks.find(t => t.status === 'in_progress');

if (currentTask) {
    const componentPath = currentTask.componentPath;

    // Resolve output directory
    const componentDir = path.join(
        appPath,
        'src',
        workspaceManager.resolveComponentPath(componentPath)
    );

    // Save generated files
    saveGeneratedCode(generatedCode, componentDir);

    // Mark task as completed
    currentTask.status = 'completed';
    fs.writeFileSync(progressPath, JSON.stringify(currentProgress, null, 2));

    console.log(`Saved to: ${componentDir}`);
    console.log(`Completed: ${currentTask.componentName}`);

    // Check remaining tasks
    const remaining = currentProgress.tasks.filter(t => t.status === 'pending');
    const completed = currentProgress.tasks.filter(t => t.status === 'completed');

    console.log(`Progress: ${completed.length}/${currentProgress.totalTasks}`);

    if (remaining.length > 0) {
        console.log(`\nRemaining: ${remaining.length} component(s)`);
        console.log('>>> GO BACK TO Step 3.2.1 to generate next component <<<');
    } else {
        console.log('\nAll components generated! Proceed to Step 3.3');
    }
}
````

---

## Step 3.3: Inject Root Component and Verify

### 3.3.1: Inject Root Component into App.tsx

```typescript
// Get root component info
const rootComponentName = protocol.data.name;
const rootComponentPath = protocol.data.path;

// Generate App.tsx content
const appTsxPath = path.join(appPath, 'src/App.tsx');
const appTsxContent = `import ${rootComponentName} from '${rootComponentPath}';
import './App.less';

export default function App() {
    return <${rootComponentName} />;
}
`;

fs.writeFileSync(appTsxPath, appTsxContent);
console.log('Root component injected into App.tsx');
```

### 3.3.2: Final Verification (MANDATORY)

```typescript
// Read final progress
const finalProgress = JSON.parse(fs.readFileSync(progressPath, 'utf-8'));

// Check for incomplete tasks
const pendingTasks = finalProgress.tasks.filter(t => t.status === 'pending');
const failedTasks = finalProgress.tasks.filter(t => t.status === 'failed');
const completedTasks = finalProgress.tasks.filter(t => t.status === 'completed');

console.log('='.repeat(60));
console.log('PHASE 3 VERIFICATION');
console.log('='.repeat(60));
console.log(`Completed: ${completedTasks.length}/${finalProgress.totalTasks}`);
console.log(`Pending:   ${pendingTasks.length}`);
console.log(`Failed:    ${failedTasks.length}`);

if (pendingTasks.length > 0) {
    console.log('\n INCOMPLETE - Pending components:');
    pendingTasks.forEach(t => console.log(`  - ${t.componentName}`));
    console.log('\n>>> GO BACK TO Step 3.2.1 to generate remaining components <<<');
} else {
    console.log('\n ALL COMPLETE!');

    // Update progress
    finalProgress.completedAt = new Date().toISOString();
    fs.writeFileSync(progressPath, JSON.stringify(finalProgress, null, 2));

    console.log('');
    console.log('Generated components:');
    completedTasks.forEach(t => {
        console.log(`  - ${t.componentName} → ${t.componentPath}`);
    });
}
console.log('='.repeat(60));
```

### 3.3.3: Run Development Server

```bash
cd /absolute/path/to/project
pnpm dev
# Open http://localhost:5173 and verify the UI matches Figma design
```

---

# Recovery Guide

## Resuming from Interruption

If the process was interrupted, you can resume from the last checkpoint:

### Check Progress Files

```typescript
const scriptsDir = path.join(appPath, 'scripts');

// Check Phase 2 progress
const phase2ProgressPath = path.join(scriptsDir, 'phase2-progress.json');
if (fs.existsSync(phase2ProgressPath)) {
    const progress = JSON.parse(fs.readFileSync(phase2ProgressPath, 'utf-8'));
    const pending = progress.tasks.filter(t => t.status === 'pending');
    console.log(`Phase 2: ${progress.tasks.length - pending.length}/${progress.tasks.length} completed`);

    if (pending.length > 0) {
        console.log('Resume from: Step 2.3.2');
    }
}

// Check Phase 3 progress
const phase3ProgressPath = path.join(scriptsDir, 'phase3-progress.json');
if (fs.existsSync(phase3ProgressPath)) {
    const progress = JSON.parse(fs.readFileSync(phase3ProgressPath, 'utf-8'));
    const pending = progress.tasks.filter(t => t.status === 'pending');
    console.log(`Phase 3: ${progress.tasks.length - pending.length}/${progress.tasks.length} completed`);

    if (pending.length > 0) {
        console.log('Resume from: Step 3.2.1');
    }
}
```

### Reset Progress (Start Fresh)

```typescript
// Delete progress files to start fresh
fs.rmSync(path.join(scriptsDir, 'phase2-progress.json'), { force: true });
fs.rmSync(path.join(scriptsDir, 'phase3-progress.json'), { force: true });
console.log('Progress files deleted. Starting fresh.');
```

---

# Troubleshooting

## Phase 1 Issues

**Missing files after scaffolding:**

- Verify AI agent executed the full instruction
- Check file system permissions for appPath
- Try with a clean directory

## Phase 2 Issues

**Figma API errors:**

- Verify token is valid: https://www.figma.com/developers/api#authentication
- Check Figma URL format: must contain `fileId` and `node-id`
- Ensure you have access to the file

**Thumbnail download fails:**

- Check if `processedDoc.thumbnailUrl` exists in `process/processed.json`
- Verify network connectivity to Figma CDN
- If download fails, try manually downloading from the URL and saving as `process/thumbnail.png`
- **DO NOT SKIP THIS** - continue without thumbnail only as last resort

**Structure generation fails:**

- **Most common cause**: Thumbnail not attached to AI context
- Verify `process/thumbnail.png` exists and is a valid image file
- Make sure AI can see the image before generating (check your IDE's image attachment feature)
- Check that positions JSON is valid
- Ensure AI agent received the full prompt

**Props extraction incomplete:**

- **Root cause**: Thumbnail not attached when calling AI for props
- Check `phase2-progress.json` for pending/failed tasks
- Re-run Step 2.3.2 for incomplete components
- Verify Figma data contains actual content (text, images)
- **CRITICAL**: Always attach `process/thumbnail.png` before generating props
- If props array is empty after generation:
  1. Verify thumbnail is attached
  2. Check that `simplifiedNodes` in the prompt contains actual data (not empty array)
  3. Retry the AI task with explicit instruction to extract ALL text and image content

**Props validation errors:**

If you see "Props validation failed - props array is empty":
1. Go back to Step 2.3.3 (AI Task)
2. **Verify thumbnail is attached** to your AI context
3. Re-read the props prompt carefully
4. Regenerate the props/state JSON
5. Ensure you're extracting actual data from the Figma nodes (not generating placeholders)

## Phase 3 Issues

**Import errors:**

- Verify asset filenames match available files in `src/assets/`
- Check component paths are correct (use `toKebabCase` for consistency)
- Ensure all children components were generated first (post-order)
- **Path format**: Should be `@/components/parent/child` or `@/components/component-name`
- Verify imports use kebab-case paths: `import TaskCard from '@/components/task-card'`

**Asset path errors:**

- **Most common**: AI using wrong asset filename from available assets list
- Asset files follow pattern: `kebab-case-name-id1-id2.ext`
- Example: "Star 2.svg" in Figma → `star-2-1-2861.svg` in assets folder
- In code generation prompt, available assets list shows exact filenames
- AI must match assets by base name, then use EXACT filename from list

**Path resolution errors:**

- If you see import errors like `Cannot find module '@/components/...'`:
  1. Check `protocol.json` - verify all nodes have correct `path` and `componentPath`
  2. Verify `postProcessStructure` was called (adds paths automatically)
  3. Check component directory names use kebab-case (not PascalCase)
  4. Verify tsconfig.json has correct path mapping for `@/*`

**Styling issues:**

- Verify Tailwind is working: check `globals.css` has `@import "tailwindcss";`
- Check vite.config.ts includes Tailwind plugin
- Ensure Less files use correct syntax (no `@apply`)
- **Common mistake**: Using `@apply` in Less files - this is a Tailwind directive that doesn't work in Less
- Solution: Use Tailwind utilities directly in JSX className, use Less only for complex styles

**Missing props in generated code:**

- **Root cause**: Protocol missing props (from Phase 2)
- Check `protocol.json` - search for the component, verify it has `props` array
- If missing, go back to Phase 2, Step 2.3.2 and regenerate props for that component
- Verify thumbnail was attached during props extraction

**Runtime errors:**

- Check TypeScript interfaces match props
- Verify all required props are passed
- Check asset imports resolve correctly

---

# Summary

This SKILL provides a complete Figma-to-Code workflow with:

- **Task-driven execution** - explicit task lists prevent skipping
- **Progress tracking** - checkpoint files enable recovery
- **Verification loops** - mandatory checks ensure completeness
- **IDE-native AI** - no external model configuration needed
- **Production-ready output** - React + TypeScript + TailwindCSS

For detailed implementation reference, see:

- coderio source code: https://github.com/anthropics/coderio
- Type definitions: `node_modules/coderio/dist/index.d.ts`
