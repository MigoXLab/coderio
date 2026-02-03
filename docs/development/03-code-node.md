# Code Node

## Purpose

Generates React + TypeScript components from protocol using LLM agents.

## Location

`src/nodes/code/index.ts`

## Workflow

```
Traverse & Flatten Tree (Post-order DFS)
    ↓
Classify Nodes
    ├─ Leaf Components (no children)
    └─ Frame Components (with children)
    ↓
Generate Code (Parallel Processing)
    ├─ Leaf → generateComponent()
    │   ├─ Input: Protocol + Thumbnail
    │   └─ Output: Self-contained component
    │
    └─ Frame → generateFrame()
        ├─ Input: Protocol + Thumbnail + Child imports
        └─ Output: Container composing children
    ↓
Write Component Files
    ↓
Mark as Generated (Cache)
    ↓
Inject Root to App.tsx
    ↓
Complete
```

## Interface

**Input**:
```typescript
{
    protocol: Protocol,
    workspace: { app: string, process: string }
}
```

**Output**: `{}` (files written to disk)

## Workflow Steps

1. **Flatten Tree** → Post-order DFS traversal (children first, then parent)
2. **Classify Nodes** → Separate into leaf components vs. frame containers
3. **Generate Code** → Different strategies for each type
4. **Write Files** → Save to `src/components/`
5. **Cache** → Mark as generated to avoid regeneration
6. **Inject** → Update `App.tsx` with root component

### Node Classification (Step 2)

```typescript
const isLeaf = !currentNode.children?.length;

if (isLeaf) {
    // Leaf Component: No children, self-contained
    await generateComponent(currentNode, state, assetFilesList, progressInfo);
} else {
    // Frame Component: Has children, composes them
    await generateFrame(currentNode, state, assetFilesList, progressInfo);
}
```

**Leaf Components:**
- No child components
- Self-contained UI elements
- Examples: Button, Icon, Text block, Image
- Generated with full implementation

**Frame Components:**
- Contains child components
- Acts as layout container
- Examples: Header (contains Logo + Nav), ProductGrid (contains ProductCards)
- Generated with child component imports and composition

### Code Generation (Step 3 Detail)

**Inputs to LLM:**
- **Protocol data**: Component structure, props, elements, layout
- **Design thumbnail**: Figma design screenshot (visual reference)
- **Asset files**: Available images in `src/assets/`
- **Styling config**: Tailwind CSS configuration

```typescript
// For frames (containers with children)
await callModel({
    question: generateFramePrompt({
        frameDetails: JSON.stringify(node.data),
        childrenImports: JSON.stringify(childrenImports),
        styling: JSON.stringify(DEFAULT_STYLING),
        assetFiles: assetFilesList
    }),
    imageUrls: state.figmaInfo.thumbnail  // 🎨 Visual reference
});

// For components (leaf nodes or reusable)
await callModel({
    question: generateComponentPrompt({
        componentName,
        componentDetails: JSON.stringify(node.data),
        styling: JSON.stringify(DEFAULT_STYLING),
        assetFiles: assetFilesList
    }),
    imageUrls: state.figmaInfo.thumbnail  // 🎨 Visual reference
});
```

**Why thumbnail matters:**
- AI sees the actual design, not just data
- Improves visual accuracy (colors, spacing, alignment)
- Helps with semantic understanding of UI purpose

## Component Structure

```typescript
// Generated: src/components/Button/index.tsx
import React from 'react';

interface ButtonProps {
    children?: React.ReactNode;
    onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({ children, onClick }) => (
    <button onClick={onClick} className="flex items-center px-4 py-2">
        {children}
    </button>
);
```

## Code Cache

Cached in `workspace.process/code-cache.json`:
```typescript
{
    "Button": {
        "code": "...",
        "dependencies": ["Icon"],
        "timestamp": 1234567890
    }
}
```

Cache invalidated on protocol changes.

## Implementation

```typescript
export async function generateCode(state: GraphState) {
    const cache = loadCodeCache(state.workspace);
    
    // Generate components (DFS)
    const totalComponents = await processNode(state, cache);
    
    // Inject root
    await injectRootComponentToApp(state, cache);
    
    logger.printSuccessLog(`Generated ${totalComponents} components`);
}
```

## LLM Configuration

```typescript
const modelConfig = {
    contextWindowTokens: CODE_CONTEXT_WINDOW,
    maxOutputTokens: CODE_MAX_OUTPUT,
    temperature: 0.2  // Low for consistency
};
```

## Error Handling

- Missing protocol → throws
- Component generation failure → logs warning, continues
- Partial success → reports total generated

## Output

- TypeScript with strict types
- Tailwind CSS for styling
- Named exports
- One component per directory

## Customization

Modify prompts in `src/nodes/code/prompt.ts`
