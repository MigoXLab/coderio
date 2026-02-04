# SKILL Troubleshooting Guide

This guide helps diagnose issues when running the `figma-to-code` SKILL using the `coderio-skill.mjs` helper.

## Common Errors

### 1. `Error: Usage: fetch-figma <url> <token>`
- **Cause**: Missing arguments when calling `fetch-figma`.
- **Fix**: Ensure you provide both the Figma URL and the Personal Access Token in quotes.
  ```bash
  node scripts/coderio-skill.mjs fetch-figma "https://..." "figd_..."
  ```

### 2. `Error: Validation Failed: Props array is empty`
- **Context**: Occurs during `node scripts/coderio-skill.mjs save-props`.
- **Cause**: The AI generated a JSON response with an empty `props` array, or failed to extract meaningful data.
- **Fix**:
  1. **Check Thumbnail**: Did you attach `process/thumbnail.png` to the AI context?
  2. **Retry AI Task**: Re-run the prompt generation and AI generation step. Explicitly ask the AI to "Look at the text in the image and the Figma data to find the props."
  3. **Check Figma Data**: Ensure the component in Figma actually has content (text layers, images).

### 3. `Error: Component ... not found`
- **Context**: Occurs during `props-prompt`.
- **Cause**: The component name you provided doesn't match any component found in `process/protocol.json`.
- **Fix**:
  - Run `node scripts/coderio-skill.mjs list-components` to see the exact names.
  - Copy the name exactly as it appears in the list.

### 4. `Error: Cannot find module 'coderio'`
- **Cause**: `coderio` package is not installed or linked.
- **Fix**:
  - Run `pnpm add coderio` (or `npm install coderio`) in your project root.
  - If developing locally, ensure `pnpm link coderio` was successful.

### 5. Low Visual Fidelity (Wrong spacing, colors, etc.)
- **Cause**: The AI didn't strictly follow the design visual.
- **Fix**:
  - **Mandatory Thumbnail**: Ensure `process/thumbnail.png` is attached to the chat context.
  - **Prompt Reinforcement**: Add "CRITICAL: Match the spacing and colors from the attached image exactly" to your instruction.
  - **Asset Check**: Verify that `src/assets` contains the correct images. The helper script should have downloaded them in Phase 1.1.

### 6. Import Errors in Generated Code
- **Cause**: Components generated out of order or naming mismatch.
- **Fix**:
  - **Order Matters**: Always generate code in the order provided by `list-gen-tasks` (0, 1, 2...). Children are listed before parents.
  - **Re-generate**: If a child component changed name, re-generate the parent so it picks up the new import path.

## Debugging Files

The helper script produces several intermediate files in `scripts/` and `process/` that you can inspect:

- `process/processed.json`: Raw processed Figma data.
- `process/protocol.json`: The semantic structure of your app.
- `scripts/structure-output.json`: The raw JSON output from the Structure AI task.
- `scripts/gen-tasks.json`: The list of code generation tasks.
- `process/thumbnail.png`: The visual reference image.

## Resetting

To start over:
```bash
rm -rf process scripts src/assets src/components
```
Then run the setup command to recreate `scripts/coderio-skill.mjs`.
