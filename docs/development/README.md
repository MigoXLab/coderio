# Node Development Guide

## Overview

CodeRio transforms Figma designs into React code through a four-node pipeline. Each node handles a specific transformation phase.

## Pipeline

```
Figma Design → [Initial] → [Process] → [Code] → [Validation] → Production Code
```

## Nodes

### [Initial Node](./01-initial-node.md)
Scaffolds React + Vite + TypeScript project structure.

**I/O**: `workspace` → Empty project with config files

### [Process Node](./02-process-node.md)
Generates protocol from Figma via API, downloads assets, converts styles.

**I/O**: `figmaUrl` → `protocol.json`, images, metadata

### [Code Node](./03-code-node.md)
Generates React components from protocol using LLM agents.

**I/O**: `protocol` → TypeScript components with Tailwind CSS

### [Validation Node](./04-validation-node.md)
Validates UI accuracy through visual comparison and position metrics.

**I/O**: `protocol`, `figmaThumb` → Validation report with MAE metrics

---

## GraphState Interface

```typescript
interface GraphState {
    urlInfo: { fileId: string; nodeId: string; name: string; };
    workspace: { root: string; process: string; app: string; };
    protocol?: Protocol;
    figmaInfo?: { thumbnail: string; };
    config?: { validationMode?: 'codeOnly' | 'reportOnly' | 'full'; };
}
```

## Node Template

```typescript
import { GraphState } from '../../state';
import { logger } from '../../utils/logger';

export const myNode = async (state: GraphState) => {
    logger.printInfoLog('Starting node...');
    
    // Validate inputs
    if (!state.requiredField) {
        throw new Error('Missing required field');
    }
    
    // Process
    const result = await process(state);
    
    // Return state updates
    return { myResult: result };
};
```

## Development

```bash
# Install
pnpm install

# Build
pnpm build

# Test node
tsx src/nodes/<node>/index.ts

# Run tests
pnpm test
```

## Adding a Node

1. Create `src/nodes/my-node/index.ts`
2. Implement node function
3. Add to `src/graph.ts`
4. Write tests in `tests/nodes/`
5. Document in `docs/development/`

## Resources

- [Testing Guide](../../tests/README.md)
- [Architecture](../architecture.md)
- [Contributing](../../CONTRIBUTING.md)
