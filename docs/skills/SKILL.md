---
name: design-to-code
description: Pixel-perfect Figma to React conversion using coderio. Generates production-ready code (TypeScript, Vite, TailwindCSS V4) with high visual fidelity. Features robust error handling, checkpoint recovery, and streamlined execution via helper script.
---

# Design to Code

High-fidelity UI restoration from Figma designs to production-ready React + TypeScript components.
This SKILL uses a **robust helper script** to minimize manual errors and ensure pixel-perfect results.

## Prerequisites

1.  **Figma API Token**: Get from Figma → Settings → Personal Access Tokens
2.  **Node.js**: Version 18+
3.  **coderio**: Installed in `scripts/` folder (handled by Setup phase)

## Workflow Overview

```
Phase 0: SETUP    → Create helper script and script environment
Phase 1: PROTOCOL → Generate design protocol (Structure & Props)
Phase 2: CODE     → Generate components and assets
```

---

# Phase 0: Setup

## Step 0.1: Initialize Helper Script

**User Action**: Run these commands to create the execution helper and isolate its dependencies.

```bash
mkdir -p scripts

# 1. Create package.json for scripts to avoid polluting main project
cat << 'EOF' > scripts/package.json
{
  "name": "coderio-scripts",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    // "coderio": "latest" // Uncomment for production release
  }
}
EOF

# 2. Install coderio (Local Debugging Mode)
# Compiles and links local coderio source. Change to 'pnpm install' for release.
CODERIO_LOCAL="/Users/gemma/Desktop/opensource/coderio"
(cd "$CODERIO_LOCAL" && pnpm build)
cd scripts && pnpm link "$CODERIO_LOCAL" && cd ..

# 2. Install coderio in scripts directory (adjust version if needed)
cd scripts && pnpm install && cd ..

# 3. Create the helper script
cat << 'EOF' > scripts/coderio-skill.mjs
import fs from 'fs';
import path from 'path';
import {
    parseFigmaUrl, executeFigmaAndImagesActions, figmaTool, downloadImage,
    extractNodePositionsHierarchical, generateStructurePrompt, extractJSON,
    postProcessStructure, extractComponentGroups, simplifyFigmaNodeForContent,
    extractDataListPrompt,
    flattenPostOrder, detectRenderingModes, generateFramePrompt, generateComponentPrompt,
    DEFAULT_STYLING, saveGeneratedCode, workspaceManager,
    toKebabCase, toPascalCase, INITIAL_AGENT_SYSTEM_PROMPT, initialAgentInstruction
} from 'coderio';

const [,, command, ...args] = process.argv;
const appPath = process.cwd();
const processDir = path.join(appPath, 'process');
const scriptsDir = path.join(appPath, 'scripts');
const assetsDir = path.join(appPath, 'src/assets');

// Ensure directories exist
[processDir, scriptsDir, assetsDir].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

function extractAllComponentGroups(node) {
    const groups = new Map();
    function traverse(currentNode) {
        const localGroups = extractComponentGroups(currentNode);
        for (const [name, list] of localGroups) {
            if (!groups.has(name)) groups.set(name, []);
            groups.get(name).push(...list);
        }
        if (currentNode.children) {
            currentNode.children.forEach(traverse);
        }
    }
    traverse(node);
    return groups;
}

function findParentOfGroup(root, componentName) {
    let result = null;
    function traverse(node) {
        if (result) return;
        if (node.children && node.children.some(c => c.data.componentName === componentName)) {
            result = node;
            return;
        }
        if (node.children) node.children.forEach(traverse);
    }
    traverse(root);
    return result;
}

function applyPropsAndStateToProtocol(parsed, node, compName, group, isList) {
    if (parsed && parsed.state && Array.isArray(parsed.state)) {
        if (isList) {
            if (!node.data.states) {
                node.data.states = [];
            }

            node.data.states = node.data.states.filter(s => s.componentName !== compName);

            node.data.states.push({
                state: parsed.state,
                componentName: compName,
                componentPath: group[0]?.data.componentPath || '',
            });

            const originalChildren = node.children || [];
            const newChildren = [];
            const processedComponentNames = new Set();

            for (const child of originalChildren) {
                const childName = child.data.componentName;
                if (childName === compName) {
                    if (!processedComponentNames.has(childName)) {
                        child.data.name = childName;
                        child.id = childName;
                        const cleanKebabName = toKebabCase(childName);
                        child.data.kebabName = cleanKebabName;
                        delete child.data.path;

                        if (parsed.props && Array.isArray(parsed.props)) {
                            child.data.props = parsed.props;
                        }

                        newChildren.push(child);
                        processedComponentNames.add(childName);
                    }
                } else {
                    newChildren.push(child);
                }
            }

            node.children = newChildren;
        }
    }
}

async function main() {
    try {
        switch (command) {
            case 'scaffold-prompt': {
                console.log(INITIAL_AGENT_SYSTEM_PROMPT);
                console.log('\n--- INSTRUCTION ---\n');
                console.log(initialAgentInstruction({ appPath, appName: args[0] || 'MyApp' }));
                break;
            }

            case 'fetch-figma': {
                const [figmaUrl, figmaToken] = args;
                if (!figmaUrl || !figmaToken) throw new Error('Usage: fetch-figma <url> <token>');

                const urlInfo = parseFigmaUrl(figmaUrl);
                console.log('Fetching Figma document...');
                const { document, imageNodesMap } = await executeFigmaAndImagesActions(urlInfo, assetsDir, processDir, figmaToken);

                const simplified = figmaTool.simplifyImageNodes(document, imageNodesMap);
                const processed = figmaTool.processedStyle(simplified);
                fs.writeFileSync(path.join(processDir, 'processed.json'), JSON.stringify(processed, null, 2));

                if (processed.thumbnailUrl) {
                    console.log('Downloading thumbnail...');
                    const base64 = await downloadImage(processed.thumbnailUrl, undefined, undefined, true);
                    fs.writeFileSync(path.join(processDir, 'thumbnail.png'), Buffer.from(base64, 'base64'));
                    console.log('Thumbnail saved to process/thumbnail.png');
                }
                console.log('Figma data processed.');
                break;
            }

            case 'structure-prompt': {
                const procDoc = JSON.parse(fs.readFileSync(path.join(processDir, 'processed.json'), 'utf-8'));
                const frames = procDoc.frames || procDoc.children;
                const positions = extractNodePositionsHierarchical(frames);
                const prompt = generateStructurePrompt({
                    positions: JSON.stringify(positions, null, 2),
                    width: String(procDoc.absoluteBoundingBox?.width || 1440)
                });
                console.log(prompt);
                break;
            }

            case 'save-structure': {
                const structureJson = fs.readFileSync(path.join(scriptsDir, 'structure-output.json'), 'utf-8');
                const pDoc = JSON.parse(fs.readFileSync(path.join(processDir, 'processed.json'), 'utf-8'));

                const parsed = JSON.parse(extractJSON(structureJson));
                const structFrames = pDoc.frames || pDoc.children;
                postProcessStructure(parsed, structFrames);

                const protocol = Array.isArray(parsed) ? parsed[0] : parsed;
                fs.writeFileSync(path.join(processDir, 'protocol.json'), JSON.stringify(protocol, null, 2));
                console.log('Structure saved to process/protocol.json');
                break;
            }

            case 'list-components': {
                const prot = JSON.parse(fs.readFileSync(path.join(processDir, 'protocol.json'), 'utf-8'));
                const groups = extractAllComponentGroups(prot);
                const list = Array.from(groups.keys()).map(name => {
                    return { name, count: groups.get(name).length };
                });
                fs.writeFileSync(path.join(scriptsDir, 'component-list.json'), JSON.stringify(list, null, 2));
                console.log(JSON.stringify(list, null, 2));
                break;
            }

            case 'props-prompt': {
                const compName = args[0];
                const prot2 = JSON.parse(fs.readFileSync(path.join(processDir, 'protocol.json'), 'utf-8'));
                const groups2 = extractAllComponentGroups(prot2);
                const group = groups2.get(compName);
                if (!group) throw new Error(`Component ${compName} not found`);

                const instances = group.flatMap(g => g.data.elements || []);
                const simpleNodes = instances
                    .filter(n => typeof n === 'object' && n !== null)
                    .map(n => simplifyFigmaNodeForContent(n));

                console.log(extractDataListPrompt({
                    containerName: prot2.data.name || 'Container',
                    childComponentName: compName,
                    figmaData: JSON.stringify(simpleNodes, null, 2)
                }));
                break;
            }

            case 'save-props': {
                const cName = args[0];
                const propsJsonPath = path.join(scriptsDir, `${cName}-props.json`);
                const propsJson = fs.readFileSync(propsJsonPath, 'utf-8');
                const parsedProps = JSON.parse(extractJSON(propsJson));

                if (!parsedProps.props || parsedProps.props.length === 0) {
                    throw new Error('Validation Failed: Props array is empty.');
                }

                const prot3 = JSON.parse(fs.readFileSync(path.join(processDir, 'protocol.json'), 'utf-8'));
                const groups3 = extractAllComponentGroups(prot3);
                const group3 = groups3.get(cName);

                const parentNode = findParentOfGroup(prot3, cName);
                if (parentNode) {
                    applyPropsAndStateToProtocol(parsedProps, parentNode, cName, group3, true);
                    fs.writeFileSync(path.join(processDir, 'protocol.json'), JSON.stringify(prot3, null, 2));
                    console.log(`Props applied to ${cName} (Parent: ${parentNode.data.name || parentNode.id})`);
                } else {
                    console.error(`Parent not found for ${cName}`);
                }
                break;
            }

            case 'list-gen-tasks': {
                const prot4 = JSON.parse(fs.readFileSync(path.join(processDir, 'protocol.json'), 'utf-8'));
                const flat = flattenPostOrder(prot4);
                const tasks = flat.map((node, i) => ({
                    index: i,
                    name: node.data.name || node.data.componentName,
                    path: node.data.path || node.data.componentPath,
                    isLeaf: !node.children?.length
                }));
                fs.writeFileSync(path.join(scriptsDir, 'gen-tasks.json'), JSON.stringify(tasks, null, 2));
                console.log(JSON.stringify(tasks, null, 2));
                break;
            }

            case 'code-prompt': {
                const idx = parseInt(args[0]);
                const prot5 = JSON.parse(fs.readFileSync(path.join(processDir, 'protocol.json'), 'utf-8'));
                const flat2 = flattenPostOrder(prot5);
                const node = flat2[idx];
                const assets = fs.readdirSync(assetsDir).join(', ');

                let prompt = '';
                if (!node.children?.length) {
                    prompt = generateComponentPrompt({
                        componentName: node.data.name || node.data.componentName,
                        componentDetails: JSON.stringify(node.data, null, 2),
                        styling: JSON.stringify(DEFAULT_STYLING),
                        assetFiles: assets
                    });
                } else {
                    const imports = node.children.map(c => ({
                        name: c.data.name,
                        path: c.data.path || c.data.componentPath
                    }));
                    const modes = detectRenderingModes(node);
                    prompt = generateFramePrompt({
                        frameDetails: JSON.stringify(node.data, null, 2),
                        childrenImports: JSON.stringify(imports, null, 2),
                        styling: JSON.stringify(DEFAULT_STYLING),
                        assetFiles: assets,
                        renderingModes: modes
                    });
                }

                // Add instruction for Asset Imports in State
                if (node.data.states && node.data.states.length > 0) {
                    prompt += `\n\n<asset_imports_instruction>
The 'states' data contains references to assets (e.g. "@/assets/foo.png").
You MUST:
1. Import these assets at the top of the file: \`import image_foo from '@/assets/foo.png';\`
2. In the \`states\` array in your code, use the variable \`image_foo\` instead of the string.
   Example: \`imageSrc: image_foo\` (NOT \`imageSrc: "@/assets/foo.png"\`)
</asset_imports_instruction>`;
                }

                console.log(prompt);
                break;
            }

            case 'save-code': {
                const idx2 = parseInt(args[0]);
                const codePath = path.join(scriptsDir, 'code-output.txt');
                const code = fs.readFileSync(codePath, 'utf-8');

                const prot6 = JSON.parse(fs.readFileSync(path.join(processDir, 'protocol.json'), 'utf-8'));
                const flat3 = flattenPostOrder(prot6);
                const node2 = flat3[idx2];

                const componentPath = node2.data.path || node2.data.componentPath;
                if (!componentPath) throw new Error(`Node ${node2.data.name} has no path`);

                const compDir = path.join(appPath, 'src', workspaceManager.resolveComponentPath(componentPath));
                saveGeneratedCode(code, compDir);
                console.log(`Code saved to ${compDir}`);
                break;
            }

            default:
                console.log('Unknown command');
        }
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

main();
EOF
```

## Step 0.2: Scaffold Project (Optional)

If starting a new project:

1.  Run: `node scripts/coderio-skill.mjs scaffold-prompt "MyApp"`
2.  **AI Task**: Follow the instructions output by the command to create files.

---

# Phase 1: Protocol Generation

## Step 1.1: Fetch Data

```bash
# Replace with your URL and Token
node scripts/coderio-skill.mjs fetch-figma "https://figma.com/file/..." "figd_..."
```

**Verify**: `process/thumbnail.png` should exist.

## Step 1.2: Generate Structure

1.  **Generate Prompt**:

    ```bash
    node scripts/coderio-skill.mjs structure-prompt > scripts/structure-prompt.md
    ```

2.  **AI Task (Structure)**:
    - **ATTACH**: `process/thumbnail.png` (MANDATORY)
    - **READ**: `scripts/structure-prompt.md`
    - **INSTRUCTION**: "Generate the component structure JSON based on the prompt and the attached thumbnail. Focus on visual grouping. **Use text content to name components accurately (e.g. 'SafeProducts', not 'FAQ').**"
    - **SAVE**: Paste the JSON result into `scripts/structure-output.json`.

3.  **Process Result**:
    ```bash
    node scripts/coderio-skill.mjs save-structure
    ```

## Step 1.3: Extract Props (Iterative)

1.  **List Components**:

    ```bash
    node scripts/coderio-skill.mjs list-components
    ```

2.  **For EACH component in the list**:

    a. **Generate Prompt**:

    ```bash
    node scripts/coderio-skill.mjs props-prompt "ComponentName" > scripts/current-props-prompt.md
    ```

    b. **AI Task (Props)**:
    - **ATTACH**: `process/thumbnail.png` (MANDATORY)
    - **READ**: `scripts/current-props-prompt.md`
    - **INSTRUCTION**: "Extract props and state data. Be pixel-perfect with text and image paths."
    - **SAVE**: Paste the JSON result into `scripts/ComponentName-props.json`.

    c. **Save & Validate**:

    ```bash
    node scripts/coderio-skill.mjs save-props "ComponentName"
    # If this fails, re-do step 'b' with better attention to the thumbnail
    ```

---

# Phase 2: Code Generation

## Step 2.1: Plan Tasks

```bash
node scripts/coderio-skill.mjs list-gen-tasks
```

This outputs a list of tasks with indices (0, 1, 2...).

## Step 2.2: Generate Components (Iterative)

**For EACH task index (starting from 0)**:

1.  **Generate Prompt**:

    ```bash
    node scripts/coderio-skill.mjs code-prompt 0 > scripts/code-prompt.md
    # Replace '0' with current task index
    ```

2.  **AI Task (Code)**:
    - **ATTACH**: `process/thumbnail.png` (MANDATORY)
    - **READ**: `scripts/code-prompt.md`
    - **INSTRUCTION**: "Generate the React component code. Match the thumbnail EXACTLY. **Use STRICT text content from input data, do not hallucinate.**"
    - **SAVE**: Paste the code block into `scripts/code-output.txt`.

3.  **Save Code**:
    ```bash
    node scripts/coderio-skill.mjs save-code 0
    # Replace '0' with current task index
    ```

## Step 2.3: Final Integration

Inject the root component into `App.tsx`. Use the path found in the last task of Phase 2.1.

---

# Troubleshooting

- **"Props validation failed"**: The AI generated empty props. Check if `process/thumbnail.png` was attached and visible to the AI. Retry the props generation step.
- **"Module not found"**: Ensure `node scripts/coderio-skill.mjs save-code` was run for the child component before the parent component. Phase 2 must be done in order (0, 1, 2...).
- **"Visuals don't match"**: Did you attach the thumbnail? The AI relies on it for spacing and layout nuances not present in the raw data.
