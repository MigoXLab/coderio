# SKILL Improvements Documentation

## Problem Diagnosis

By comparing CLI tool and SKILL implementations, the following core issues were identified:

### 1. Thumbnail Image Not Integrated ❌

**Problem**:
- CLI tool explicitly passes `imageUrls: thumbnailUrl` parameter when calling AI
- SKILL only says "attach thumbnail" without concrete implementation
- Cursor/Claude Code may not be able to access remote Figma CDN URLs

**Impact**:
- AI lacks visual reference, resulting in:
  - Inaccurate structure generation (wrong component grouping)
  - Incomplete props extraction (missing key attributes)
  - Low code quality (layout and styling don't match design)

### 2. Props Validation Missing ❌

**Problem**:
- SKILL doesn't validate if generated props are empty
- Users may skip AI tasks or AI returns empty props
- Results in missing component interfaces in subsequent code generation

**Impact**:
- Generated components lack props definitions
- Code fails at runtime or cannot render data

### 3. Path Naming Not Standardized ❌

**Problem**:
- SKILL doesn't export `toKebabCase` and `toPascalCase` utility functions
- Users may use incorrect naming conventions when manually entering paths

**Impact**:
- Component imports fail (path mismatch)
- Inconsistent file system structure

---

## Solutions

### ✅ 1. Integrate Thumbnail Download and Usage

**Code Changes**:

#### `src/skill-api.ts`
```typescript
// Already exported downloadImage function
export { downloadImage } from './tools/figma-tool/images';

// Newly exported naming utility functions
export { toKebabCase, toPascalCase } from './utils/naming';
```

#### `docs/SKILL.md` - Phase 2.1.5 (New Step)
```typescript
// Download thumbnail to local storage
const thumbnailUrl = processedDoc.thumbnailUrl || '';
let localThumbnailPath = '';

if (thumbnailUrl) {
    const base64Image = await downloadImage(thumbnailUrl, undefined, undefined, true);
    const thumbnailPath = path.join(processDir, 'thumbnail.png');
    fs.writeFileSync(thumbnailPath, Buffer.from(base64Image, 'base64'));
    localThumbnailPath = thumbnailPath;
}
```

**Key Points**:
- Download as base64 format (easy to pass around)
- Also save as `process/thumbnail.png` file (convenient for debugging)
- Provide local path instead of remote URL

---

### ✅ 2. Mandatory Thumbnail Attachment in All AI Tasks

**Phase 2.2.2 - Structure Generation AI Task**:
```markdown
**CRITICAL - Before You Start**:
1. **Locate the thumbnail**: `process/thumbnail.png`
2. **Attach it to your context**: In Cursor, click paperclip; in Claude Code, reference the path
3. **DO NOT PROCEED** without the visual reference
```

**Phase 2.3.3 - Props Extraction AI Task**:
```markdown
**MANDATORY: Attach the thumbnail image** (`process/thumbnail.png`)
- This visual reference is MANDATORY for accurate props extraction
- Props extraction requires visual understanding
```

**Phase 3.2.2 - Code Generation AI Task**:
```markdown
**MANDATORY: Attach the thumbnail image** (`process/thumbnail.png`)
- This ensures pixel-perfect styling and layout
- Visual reference is key for high-fidelity code
```

---

### ✅ 3. Add Props Validation Mechanism

**Phase 2.3.4 - Validate After Applying Props**:
```typescript
// CRITICAL: Validate props before applying
if (!parsedData.props || parsedData.props.length === 0) {
    console.error(`ERROR: No props generated for component!`);
    console.error(`Please retry Step 2.3.3 with the thumbnail image attached.`);
    throw new Error('Props validation failed - props array is empty');
}

console.log(`✓ Validation passed: ${parsedData.props.length} props, ${parsedData.state.length} state entries`);
```

**Validation Logic**:
- Check if `props` array exists and is non-empty
- Check if `state` array has data
- Print validation results (props count, state count)
- If validation fails, throw error and prompt to re-execute

---

### ✅ 4. Export Naming Convention Utility Functions

**`src/skill-api.ts`**:
```typescript
export { toKebabCase, toPascalCase } from './utils/naming';
```

**Usage**:
- `toKebabCase("TaskCard")` → `"task-card"` (for file paths)
- `toPascalCase("task-card")` → `"TaskCard"` (for component names)

**Documentation in SKILL**:
```typescript
import { toKebabCase, toPascalCase } from 'coderio';

// Ensure path/name consistency
const filePath = toKebabCase("TaskCard"); // "task-card"
const componentName = toPascalCase("task-card"); // "TaskCard"
```

---

### ✅ 5. Enhanced Troubleshooting Guide

**New Sections**:

#### Thumbnail Related Issues
- Solutions for download failures
- How to manually download and place
- Verify image validity

#### Props Extraction Issues
- Root cause: thumbnail not attached
- Retry steps after validation failure
- How to ensure AI extracts actual data

#### Path Error Issues
- Path format specifications
- Naming conventions (kebab-case vs PascalCase)
- Import error diagnosis steps

#### Asset Path Issues
- Asset file naming rules
- How to match correct asset filenames
- Common asset import errors

---

## Usage Guide

### Phase 2 (Protocol Generation) Key Steps

1. **Download Thumbnail** (Step 2.1.5)
   ```bash
   # Verify file exists
   ls -lh process/thumbnail.png
   ```

2. **Attach Image Before Structure Generation** (Step 2.2.2)
   - In Cursor: Click 📎 icon → Select `process/thumbnail.png`
   - In Claude Code: Reference path directly

3. **Attach Image Before Props Extraction** (Step 2.3.3)
   - Must attach image for every component's props extraction
   - Don't skip this step!

4. **Validate Props** (Step 2.3.4)
   - Check console output
   - If validation fails, return to previous step and regenerate

### Phase 3 (Code Generation) Key Steps

1. **Verify Thumbnail Exists** (Step 3.1.2)
   ```bash
   # Should see thumbnail
   ls -lh process/thumbnail.png
   ```

2. **Attach Image Before Code Generation** (Step 3.2.2)
   - Must attach image for every component generation
   - Ensures pixel-perfect design restoration

---

## Comparison: CLI vs SKILL

| Aspect | CLI Tool | SKILL (Before) | SKILL (After) |
|--------|----------|----------------|---------------|
| **Thumbnail** | ✅ Auto-passed to AI | ❌ Only says "attach" | ✅ Download locally + mandatory attach |
| **Props Validation** | ✅ Built-in validation | ❌ No validation | ✅ Mandatory validation + error prompts |
| **Naming Convention** | ✅ Auto-handled | ❌ Manual handling | ✅ Export utility functions |
| **Error Recovery** | ✅ Auto-retry | ⚠️ Manual retry | ✅ Clear retry guidance |
| **Visual Quality** | ✅ High-fidelity | ❌ Unstable quality | ✅ High-fidelity (mandatory image) |

---

## Summary

### Core Improvements

1. **Thumbnail Integration** - Download locally + mandatory attachment in all AI tasks
2. **Props Validation** - Prevent empty props from entering subsequent workflows
3. **Naming Convention** - Export utility functions to ensure path consistency
4. **Troubleshooting** - Detailed solutions for common issues

### Expected Results

- **Props Completeness**: From easily missing → mandatory validation, ensuring every component has props
- **Code Quality**: From unstable → high-fidelity, consistent with CLI tool
- **Path Correctness**: From manual handling → tool-assisted, reducing errors
- **Debuggability**: From black box → transparent, with validation and logs at every step

### Usage Recommendations

1. **Follow steps strictly** - Don't skip any validation steps
2. **Always attach thumbnail** - This is key to success
3. **Read error messages carefully** - Troubleshooting guide provides solutions
4. **Save intermediate results** - `protocol-after-*.json` files help with debugging

---

## Technical Details

### downloadImage Function Signature

```typescript
async function downloadImage(
    url: string,
    filename?: string,
    imageDir?: string,
    base64?: boolean
): Promise<string>
```

- `base64 = true`: Returns base64 string (easy to pass around)
- `base64 = false`: Saves to file and returns path

### callModel in CLI

```typescript
// Implementation in CLI tool
const result = await callModel({
    question: prompt,
    imageUrls: thumbnailUrl,  // Key: passing image URL
    responseFormat: { type: 'json_object' },
});
```

### Equivalent in SKILL

```markdown
**MANDATORY: Attach the thumbnail image** (`process/thumbnail.png`)
- In Cursor: Click paperclip icon
- In Claude Code: Reference the file path
```

---

## Feedback and Improvements

If you encounter issues during usage, please:

1. Check if `process/thumbnail.png` exists and is valid
2. Verify every AI task truly attached the image
3. Review `scripts/*-prompt.md` files to confirm prompt content
4. Check status in `phase2-progress.json` and `phase3-progress.json`
5. If issues persist, provide detailed error logs and intermediate files

---

**Improvement Completed**: 2026-02-03
**Main Contributions**: Thumbnail integration + Props validation + Naming convention + Troubleshooting guide
