# SKILL Quick Diagnosis and Fix Guide

When encountering issues while executing the figma-to-code SKILL in Cursor/Claude Code, use this guide for quick diagnosis and fixes.

---

## 🚨 Common Error Quick Reference

### Error 1: "Props validation failed - props array is empty"

**Cause**: AI generated props without attaching the thumbnail image as visual reference

**Fix Steps**:
```bash
# 1. Confirm thumbnail exists
ls -lh process/thumbnail.png

# 2. If not exists, check if you skipped Phase 2.1.5
# 3. Re-execute Props extraction (Phase 2.3.2 - 2.3.4)
# 4. This time make sure to attach process/thumbnail.png in AI task
```

**In Cursor**:
1. Open Cursor AI panel
2. Click 📎 icon (attach file)
3. Select `process/thumbnail.png`
4. Then paste props prompt and execute

**In Claude Code**:
1. Reference file in chat: `@process/thumbnail.png`
2. Ensure image loads before executing props prompt

---

### Error 2: Generated protocol has no props field

**Diagnosis**:
```bash
# Check protocol.json
cat process/protocol.json | grep -A 5 '"props"'

# If no output, props are indeed missing
```

**Causes**:
- Phase 2.3 (Props extraction) was not executed
- Or execution skipped some components
- Or AI returned empty results without thumbnail attachment

**Fix Steps**:
```bash
# 1. Check progress file
cat scripts/phase2-progress.json

# 2. Find tasks with status "pending" or "failed"
# 3. Return to Phase 2.3.2, process these components
# 4. Ensure to attach process/thumbnail.png every time
```

---

### Error 3: Path import errors (e.g., "Cannot find module '@/components/...'")

**Cause**: Component path naming not standardized or filename case mismatch

**Diagnosis**:
```bash
# Check actual generated component directories
ls -R src/components/

# Check paths in protocol.json
cat process/protocol.json | grep '"path"'

# Check tsconfig.json path mapping
cat tsconfig.json | grep -A 3 '"paths"'
```

**Common Issues**:
- Folders use PascalCase (e.g., `TaskCard/`) instead of kebab-case (e.g., `task-card/`)
- Paths in protocol.json don't match actual file system
- tsconfig.json missing `@/*` mapping

**Fix Steps**:
```bash
# 1. Ensure all component directories use kebab-case
mv src/components/TaskCard src/components/task-card

# 2. Or use coderio utility functions
node -e "const {toKebabCase} = require('coderio'); console.log(toKebabCase('TaskCard'))"

# 3. Verify tsconfig.json
cat tsconfig.json | grep '"@/\*"'
# Should see: "@/*": ["./src/*"]
```

---

### Error 4: Image asset import errors (e.g., "Module not found: @/assets/...")

**Cause**: Asset filename used by AI doesn't match actual file

**Diagnosis**:
```bash
# Check available asset files
ls src/assets/

# Check imports in generated code
grep -r "@/assets" src/components/

# Compare if they match
```

**Common Issues**:
- Layer name in Figma is "Star 2", but actual file is `star-2-1-2861.svg`
- AI guessed the filename instead of using exact filename from available assets list

**Fix Steps**:
```bash
# 1. Find actual filename
ls src/assets/ | grep -i "star"

# 2. Use exact filename in code
# Wrong: import StarIcon from '@/assets/star-2.svg';
# Correct: import StarIcon from '@/assets/star-2-1-2861.svg';

# 3. For batch errors, regenerate the component
# Ensure available_assets list in prompt includes all files
ls src/assets/ | tr '\n' ', '
```

---

### Error 5: Code styling doesn't match design (spacing, colors, layout wrong)

**Cause**: AI generated code without attaching thumbnail as visual reference

**Fix Steps**:
```bash
# 1. Confirm thumbnail exists
ls -lh process/thumbnail.png

# 2. Find the incorrectly generated component
# 3. Return to Phase 3.2.1, regenerate that component
# 4. This time make sure to attach process/thumbnail.png and emphasize "pixel-perfect"
```

**Add to AI prompt**:
```
CRITICAL: Match the attached thumbnail design EXACTLY:
- Spacing: Verify all gaps, padding, margins
- Colors: Use exact color values from Figma data
- Typography: Match font sizes, weights, line heights
- Layout: Implement exact structure shown in thumbnail
```

---

## ✅ Success Checklist

Before proceeding to next phase, confirm these checkpoints:

### Before Completing Phase 2

- [ ] `process/thumbnail.png` exists and can be opened
- [ ] `scripts/phase2-progress.json` shows all tasks `status: "completed"`
- [ ] `process/protocol.json` exists and contains `props` fields
- [ ] Randomly check a component, verify it has props and states

```bash
# Validation commands
ls -lh process/thumbnail.png
cat scripts/phase2-progress.json | grep '"status"'
cat process/protocol.json | grep -c '"props"'
```

### Before Completing Phase 3

- [ ] `scripts/phase3-progress.json` shows all tasks `status: "completed"`
- [ ] All component directories under `src/components/` (kebab-case naming)
- [ ] Every component has `index.tsx` file
- [ ] All `@/assets` imports can be resolved

```bash
# Validation commands
ls -lh scripts/phase3-progress.json
ls -R src/components/
find src/components -name "index.tsx" | wc -l
```

---

## 🔍 Debugging Tips

### 1. Verify Thumbnail is Used by AI

**Method**: Before executing AI task, explicitly ask AI:

```
Before we start, please confirm:
1. Can you see the process/thumbnail.png image I attached?
2. What kind of design is shown in the image?
3. What are the main visual elements?

Please answer these questions first, then we'll proceed.
```

If AI cannot answer, the image wasn't successfully attached.

---

### 2. Incrementally Verify Protocol Completeness

```bash
# Check structure integrity
cat process/protocol.json | jq '.data.name'

# Check how many components
cat process/protocol.json | jq '.. | .componentName? // empty' | sort -u

# Check if each component has props
cat process/protocol.json | jq '.. | select(.props != null) | {name: .name, propsCount: (.props | length)}'

# Check states count
cat process/protocol.json | jq '.. | select(.states != null) | {name: .name, statesCount: (.states | length)}'
```

---

### 3. Compare CLI and SKILL Generated Protocols

If possible, run the same Figma design with both CLI and SKILL:

```bash
# CLI generated protocol
coderio d2c <figma-url> --report-only
cat .coderio/workspace/*/protocol.json > cli-protocol.json

# SKILL generated protocol
# ... follow SKILL steps ...
cp process/protocol.json skill-protocol.json

# Compare differences
diff <(jq -S . cli-protocol.json) <(jq -S . skill-protocol.json)
```

**Key comparison points**:
- Are component counts consistent
- Do props fields all exist
- Are states array lengths consistent

---

### 4. Review Generated Prompt Files

```bash
# Phase 2 prompts
ls -lh scripts/*-prompt.md

# View structure generation prompt
cat scripts/structure-prompt.md

# View a component's props prompt
cat scripts/TaskCard-props-prompt.md

# Phase 3 prompts
cat scripts/TaskCard-code-prompt.md
```

**Check items**:
- Is prompt complete (not truncated)
- Does Figma data have actual content (not empty `[]`)
- Does available assets list include actual files

---

## 🛠️ Quick Fix Scripts

### Batch Check Component Props

```bash
#!/bin/bash
# check-props.sh

protocol="process/protocol.json"

echo "Checking props in protocol..."
jq -r '
  .. |
  select(.componentName != null) |
  {
    component: .componentName,
    hasProps: (.props != null),
    propsCount: (if .props then (.props | length) else 0 end)
  }
' "$protocol" | jq -s 'unique_by(.component)'
```

### Verify All Image Assets

```bash
#!/bin/bash
# check-assets.sh

assets_dir="src/assets"
components_dir="src/components"

echo "Available assets:"
ls "$assets_dir"

echo -e "\nAssets referenced in code:"
grep -rh "@/assets" "$components_dir" | \
  grep -o "@/assets/[^\"']*" | \
  sort -u

echo -e "\nMissing assets:"
grep -rh "@/assets" "$components_dir" | \
  grep -o "@/assets/[^\"']*" | \
  sed 's|@/assets/||' | \
  while read asset; do
    if [ ! -f "$assets_dir/$asset" ]; then
      echo "  ❌ $asset"
    fi
  done
```

---

## 📞 When to Seek Help

If issues persist after the above checks and fixes, please collect the following information:

1. **Error logs**: Complete error stack trace
2. **Intermediate files**:
   - `process/protocol.json`
   - `scripts/phase2-progress.json`
   - `scripts/phase3-progress.json`
3. **Validation results**:
   ```bash
   ls -lh process/thumbnail.png
   cat scripts/phase2-progress.json | grep '"status"'
   ```
4. **Environment info**:
   - IDE type and version (Cursor / Claude Code)
   - Node.js version
   - coderio version

---

**Last Updated**: 2026-02-03
**Applies To**: coderio SKILL v1.0+
