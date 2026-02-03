# Validation Node

## Purpose

Validates generated UI against Figma design through visual comparison and position metrics.

## Location

`src/nodes/validation/index.ts`

## Workflow

```
Validation Loop (Max 3 Iterations)
│
├─ Iteration Start
│   ├─ Launch Dev Server
│   │   ├─ Install dependencies (first time only)
│   │   ├─ Build project
│   │   └─ Fix compilation/runtime errors
│   │
│   ├─ Validate Positions
│   │   ├─ Capture screenshots (Figma + Rendered)
│   │   ├─ Extract element positions
│   │   ├─ Compare positions
│   │   └─ Calculate MAE metrics
│   │
│   ├─ Check Result
│   │   ├─ MAE <= 5px? → PASS → Exit loop
│   │   └─ MAE > 5px? → Continue to refinement
│   │
│   ├─ Diagnose & Fix (per misaligned component)
│   │   ├─ Judger Agent: Analyze error cause
│   │   ├─ Refiner Agent: Generate code fixes
│   │   └─ Apply fixes to component files
│   │
│   └─ Re-launch
│       ├─ Stop old server
│       ├─ Build with fixes
│       ├─ Fix new errors (if any)
│       └─ Start new server
│
└─ Generate Final Report
    ├─ Annotated screenshots (marked positions)
    ├─ Pixel difference heatmap
    ├─ Interactive HTML report
    └─ Metrics summary (MAE, SAE, misaligned count)
```

## Interface

**Input**:
```typescript
{
    protocol: Protocol,
    figmaInfo: { thumbnail: string },
    workspace: { app: string, process: string },
    config?: { validationMode?: 'full' | 'quick' }
}
```

**Output**: Throws on failure, writes report to disk

## Workflow Steps

The validation runs in an **iterative loop** (max 3 iterations):

### Per Iteration:

**1. Launch Dev Server**
```typescript
// First iteration: full setup
await launch(workspace.app, {
    skipDependencyInstall: false,  // Install deps
});
// Builds project, fixes errors, starts server
```

**2. Validate Positions**
- Screenshot rendered UI and Figma design
- Extract element positions from both
- Calculate position errors (MAE, SAE)

**3. Check Pass/Fail**
```typescript
if (currentMae <= config.targetMae) {
    // PASS: Exit loop
    logger.printSuccessLog('Validation passed!');
    break;
}
```

**4. Diagnose Errors** (per misaligned component)
```typescript
// Judger Agent analyzes WHY position is wrong
const diagnosis = await judger.run(judgerInstruction, [screenshot]);
// Returns: errorType, refineInstructions

// Examples of errorType:
// - "missing flexbox gap"
// - "incorrect padding"
// - "wrong position absolute values"
```

**5. Apply Fixes** (per misaligned component)
```typescript
// Refiner Agent generates code fixes
const refinerResult = await refiner.run(refinerInstruction);
// Applies edits to component files
```

**6. Re-launch**
```typescript
// Stop old server
await launchTool.stopDevServer(serverKey);

// Re-launch with fixes
await launch(workspace.app, {
    skipDependencyInstall: true,  // Skip deps (already installed)
});
// Builds, fixes new errors, restarts server
```

**7. Loop** → Go to step 2 for next iteration

### After Loop Completes:

**8. Generate Report**
- Annotated screenshots showing misaligned elements
- Pixel difference heatmap
- Interactive HTML report with metrics
- Helps users understand validation results

## Validation Modes

- **Full** (default): Includes refinement loop, complete report
- **Quick**: Position check only, minimal report

## Metrics

**MAE (Mean Absolute Error)**: Primary metric
```typescript
MAE = Σ|rendered_pos - figma_pos| / n
```

- **Pass**: MAE < 5px
- **Fail**: MAE ≥ 5px

Additional metrics: MSE, RMSE, accuracy rate, max distance

## Implementation

```typescript
export const runValidation = async (state: GraphState) => {
    const result = await validationLoop({
        protocol: state.protocol,
        figmaThumbnailUrl: state.figmaInfo.thumbnail,
        outputDir: path.join(state.workspace.process, 'validation'),
        workspace: state.workspace,
        config: { mode: state.config?.validationMode ?? 'full' }
    });
    
    if (!result.validationPassed) {
        throw new Error(`MAE ${result.finalMae}px exceeds threshold`);
    }
};
```

## Report Output

```
validation/
├── index.html       # Interactive report
├── figma.png        # Figma design
├── rendered.png     # Generated UI
├── diff.png         # Pixel diff
├── heatmap.png      # Error heatmap
└── metadata.json    # Metrics
```

View: `open validation/index.html`

## Refinement Loop

Max 3 iterations:
1. Identify misaligned elements
2. LLM generates fixes
3. Apply code changes
4. Revalidate

Stops on pass or max iterations.

## Agents

- **Judge**: Analyzes metrics, decides pass/fail
- **Refiner**: Generates code fixes for misalignments

## Error Handling

- Missing protocol/thumbnail → throws
- Dev server failure → throws
- Screenshot timeout → throws
- Validation failure → throws with MAE

## Performance

- Screenshots: Adjustable quality
- Position extraction: Parallelizable
- Figma thumbnail: Cacheable
