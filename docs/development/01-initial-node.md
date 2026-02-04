# Initial Node

## Purpose

Scaffolds empty React + Vite + TypeScript project structure.

## Location

`src/nodes/initial/index.ts`

## Workflow

```
Initial Node
    ↓
Create Agent
    ↓
Generate Scaffold
    ↓
Validate Structure
    ↓
Return Success
```

## Interface

**Input**:
```typescript
{
    workspace: { app: string },
    urlInfo: { name: string }
}
```

**Output**: `{}` (throws on error)

## Files Created

- `package.json`, `vite.config.ts`, `tsconfig.json`
- `index.html`
- `src/main.tsx`, `src/App.tsx`

## Implementation

```typescript
export const initialProject = async (state: GraphState) => {
    const agent = createInitialAgent(modelConfig);
    await agent.run(initialAgentInstruction({ 
        appPath: state.workspace.app,
        appName: state.urlInfo.name 
    }));
    
    // Validate essential files exist
    validateFiles(state.workspace.app, ESSENTIAL_FILES);
};
```

## Configuration

Agent uses LLM with:
- Context: `AGENT_CONTEXT_WINDOW_TOKENS`
- Max output: `MAX_OUTPUT_TOKENS`

## Error Handling

Throws if:
- Workspace path undefined
- Essential files missing post-scaffold
- Agent execution fails

## Customization

Modify agent instructions in:
- `src/agents/initial-agent/instruction.ts`
- `src/agents/initial-agent/prompt.ts`
