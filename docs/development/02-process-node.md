# Process Node

## Purpose

Generates protocol from Figma design via API, downloads assets, converts styles to CSS.

## Location

`src/nodes/process/index.ts`

## Workflow

```
Fetch Figma Data
    ↓
Download Images
    ↓
Simplify Image Nodes
    ↓
Process Styles (Figma → CSS)
    ↓
Generate Protocol Structure
    ├─ Extract Positions (Hierarchical)
    ├─ Generate Structure (AI)
    ├─ Post Process Structure
    │  ├─ Normalize Names
    │  ├─ Populate Elements
    │  └─ Annotate Paths
    └─ Populate Component Props (Reusable Components Only)
       ├─ Group Repeated Instances
       ├─ Extract Data Variations (AI)
       └─ Generate Props Schema
    ↓
Write Output Files
```

## Interface

**Input**:
```typescript
{
    urlInfo: { fileId: string, nodeId: string, name: string },
    workspace: { process: string, app: string }
}
```

**Output**:
```typescript
{
    protocol: Protocol,
    figmaInfo: { thumbnail: string }
}
```

## Workflow Steps

1. **Fetch** → Get Figma document via API → `figma.json`
2. **Download** → Extract and download images → `assets/`, `images.json`
3. **Simplify** → Replace image properties with URLs
4. **Process** → Convert Figma styles to CSS
5. **Generate Structure** → Create component hierarchy (detailed below)
6. **Write** → Output `protocol.json`

### Structure Generation (Step 5 Detail)

This is the core AI-powered transformation phase:

```typescript
// 1. Extract hierarchical positions
const positions = extractNodePositionsHierarchical(frames);
// → { "node-id": { x, y, w, h, children: {...} } }

// 2. Generate structure with AI
const structure = await callModel({
    prompt: generateStructurePrompt({ positions, width }),
    imageUrls: thumbnailUrl,  // Visual context
    responseFormat: 'json_object'
});
// → Component tree with semantic naming

// 3. Post-process structure
postProcessStructure(structure, frames);
// → Normalize names, populate elements, annotate paths

// 4. Populate props for reusable components only
await populateComponentProps(structure, frames, thumbnailUrl);
// → Groups repeated instances, extracts data variations, generates props
```

**Sub-steps:**

**5.1 Extract Positions**
- Traverses Figma tree recursively
- Extracts `{x, y, width, height}` for each node
- Preserves parent-child hierarchy

**5.2 AI Structure Generation**
- Input: Position data + thumbnail image
- Output: Semantic component tree with:
  - Component names (e.g., "Header", "ProductCard")
  - Element IDs to include in each component
  - Component relationships (parent-child)

**5.3 Post-Processing**
- **Normalize Names**: Convert to kebab-case for file paths
- **Populate Elements**: Replace element IDs with actual Figma nodes
- **Annotate Paths**: Generate file paths (`@/components/header`)

**5.4 Props Extraction** (Reusable Components Only)

This step **only processes components marked as reusable** (repeated instances):

**What qualifies as reusable:**
- Components with same `componentName`
- Multiple instances in the design (e.g., 3+ product cards)
- Detected by AI during structure generation

**Process:**
1. Groups instances by `componentName`
2. Checks if `group.length > 1` (multiple instances)
3. AI extracts data variations across instances:
   ```json
   {
     "props": [
       { "key": "title", "type": "string" },
       { "key": "imageUrl", "type": "string" }
     ],
     "state": [
       { "title": "Product A", "imageUrl": "..." },
       { "title": "Product B", "imageUrl": "..." }
     ]
   }
   ```
4. Collapses duplicates into:
   - Single component template
   - Data array for `.map()` iteration

**Non-reusable components** (unique/single instances) skip this step entirely.

## Protocol Structure

The protocol is a **recursive tree structure** representing the component hierarchy:

```typescript
interface Protocol {
    id: string;              // Component ID (e.g., "Header")
    data: FrameData;         // Component data
    children?: Protocol[];   // Nested child components
}

interface FrameData {
    name: string;            // Component name
    purpose: string;         // Semantic description
    kebabName?: string;      // File-friendly name (e.g., "task-card")
    path?: string;           // File path (e.g., "components/task-card")
    elements: FigmaNode[];   // Original Figma nodes
    layout?: LayoutInfo;     // Position, size, spacing
    
    // For reusable components only:
    componentName?: string;  // Template name
    componentPath?: string;  // Template path
    props?: PropSchema[];    // Props definition
    states?: StateData[];    // Data variations for .map()
}
```

**Key points:**
- Tree structure mirrors component hierarchy
- Each node contains rendering data + metadata
- Reusable components have `props` and `states`
- Non-reusable components only have basic data

## Implementation

```typescript
export const generateProtocol = async (state: GraphState) => {
    // Fetch and process
    const { document, imageNodesMap } = await executeFigmaAndImagesActions(
        state.urlInfo, assetsDir, processDir
    );
    
    // Transform
    const simplified = figmaTool.simplifyImageNodes(document, imageNodesMap);
    const styled = figmaTool.processedStyle(simplified);
    const protocol = await generateStructure(styled);
    
    // Write output
    writeFile(state.workspace.process, 'protocol.json', protocol);
    
    return { protocol, figmaInfo: { thumbnail: styled.thumbnailUrl } };
};
```

## CLI Usage

```bash
coderio f2p <figma-url>      # Full protocol
coderio images <figma-url>   # Images only
```

## Configuration

Requires Figma API token in config:
```typescript
const token = getFigmaConfig().token;
```

## Error Handling

- Invalid URL → throws
- Missing token → throws
- Image download failure → logs warning, continues
- Structure generation failure → throws

## Performance

- Images downloaded in parallel (configurable concurrency)
- Figma responses cacheable
- Style processing CPU-intensive for large designs
