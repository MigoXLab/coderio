// ============================================
// Common Prompt Sections
// ============================================

const STYLING_GUIDELINES = `
      - **Style Consistency**: Implement styles using the technical stack and libraries listed in <styling>.
      - **Strict Restriction**: Absolutely ONLY use the technical stack and libraries listed in <styling>. Do NOT use any other styling methods, libraries, or frameworks (e.g., if clsx is not listed, do not use clsx).
      - **Default Styling**: If <styling> is empty or does not contain specific libraries, DEFAULT to standard vanilla CSS.
      
      - **Tailwind CSS + CSS Modules (CRITICAL)**:
        - If the stack includes BOTH Tailwind and CSS Modules (Less/SCSS), use them correctly:
          1. **Tailwind utilities**: Use DIRECTLY in JSX className (e.g., \`className="flex items-center gap-4"\`)
          2. **CSS Modules**: Use ONLY for complex styles that can't be expressed with Tailwind utilities (e.g., gradients, animations, pseudo-elements)
          3. **NEVER use \`@apply\` in CSS Module files** - it's a Tailwind-specific directive that doesn't work in Less/SCSS
          4. Example correct usage:
             TSX: \`<div className={\`flex \${styles.customGradient}\`}>\`
             Less: \`.customGradient { background: linear-gradient(...); }\`
      
      - **CSS Modules Only**: If the tech stack specifies CSS Modules without Tailwind:
        1. Create a corresponding style file (e.g., \`index.module.less\`, \`index.module.scss\`, or \`index.module.css\`)
        2. Import it as \`import styles from './index.module.[ext]';\` in the TSX
        3. Define all styles in the style file using standard CSS/Less/SCSS syntax
        4. Use \`styles.className\` in JSX`;

const ASSETS_HANDLING = `
      - **CRITICAL**: For any image URL starting with \`@/assets\`, you MUST import it at the top of the file.
      - **Asset Name Matching**: 
        - Check the \`<available_assets>\` list for actual filenames in the project.
        - Asset filenames follow the pattern: \`kebab-case-name-id1-id2.ext\` (e.g., "Star 2.svg" → "star-2-1-2861.svg")
        - Match the base name (ignoring spaces, case, and ID suffix): "@/assets/arXiv.svg" → look for "arxiv-*.svg" in the list
        - Use the EXACT filename from the available assets list in your import.
      - Example: If available_assets contains "arxiv-1-2956.svg", use:
        \`import ArXivIcon from '@/assets/arxiv-1-2956.svg';\`
      - **Usage**: \`<img src={ArXivIcon} />\`, do not use backgroundImage property.
      - **NEVER** use the string path directly in JSX or styles.`;

const DOM_IDS_REQUIREMENT = `
      - Assign \`id\` attributes to the main container and any internal elements, matching \`frame_details\`.`;

const REACT_IMPORT_RULE = `
      - Do **NOT** include \`import React from 'react';\` at the top of the file.`;

const FILE_NAMING_CONVENTION = `
      - ALWAYS name the main component file \`index.tsx\`.
      - ALWAYS name the style file (if applicable) \`index.module.[css|less|scss]\`.
      - NEVER use PascalCase or other names for filenames (e.g., DO NOT use \`MainFrame.tsx\` or \`Button.tsx\`).`;

const OUTPUT_FORMAT = `
  <output_format>
    **CRITICAL - Output Format Requirements:**
    
    **CASE 1: Single File (TSX only)**
    - Return code wrapped in triple backticks with language identifier
    - NO file name header needed
    - Example:
    \`\`\`tsx
    export default function Component() {
      return <div>...</div>;
    }
    \`\`\`

    **CASE 2: Multiple Files (TSX + Styles)**
    - **REQUIRED**: Each file MUST start with EXACTLY \`## \` (two hash symbols + one space) followed by filename
    - **REQUIRED**: Filename must be complete with extension (e.g., \`index.tsx\`, \`index.module.css\`)
    - **FORBIDDEN**: Do NOT use single \`#\`, do NOT omit filename, do NOT use other markers
    - Follow this exact structure:
    
    ## index.tsx
    \`\`\`tsx
    export default function Component() {
      return <div>...</div>;
    }
    \`\`\`

    ## index.module.[css|less|scss]
    \`\`\`[css|less|scss]
    .container {
      /* styles */
    }
    \`\`\`
    
    **VALIDATION CHECKLIST (for multiple files):**
    ✓ Each file section starts with \`## \` (two hashes + space)
    ✓ Filename includes full extension
    ✓ Code wrapped in triple backticks with language
    ✗ DO NOT use \`# filename\` (single hash)
    ✗ DO NOT omit file headers
    ✗ DO NOT use other separators
  </output_format>`;

// ============================================
// Prompt Functions
// ============================================

/**
 * Generate children rendering instructions based on detected modes
 */
function generateChildrenPropsInstructions(modes: { hasStates: boolean; hasIndependentChildren: boolean }): string {
    const instructions: string[] = [];

    if (modes.hasStates) {
        instructions.push(`
      - **List Rendering (States-based)**:
        - Check if \`<frame_details>\` contains a \`states\` property (array).
        - Each state entry has: \`state\` (data array), \`componentName\`, \`componentPath\`.
        - Implementation:
          \`\`\`tsx
          import ComponentName from 'path';
          
          {states[0].state.map((item, index) => (
            <ComponentName key={index} {...item} />
          ))}
          \`\`\`
        - **CRITICAL - Only Use State Data**:
          - **ONLY** pass props that exist in the state data objects.
          - **DO NOT** add extra props like \`content\`, \`className\`, or any other fields not present in state.
          - **DO NOT** create or invent additional data - use exactly what's in the state array.
          - Example: If state has \`{iconSrc, title, description}\`, only pass those three props.
        - **Asset Imports**: If state data contains image paths (e.g., \`imageSrc\`, \`iconSrc\`), 
          import them at the top and pass as values.`);
    }

    if (modes.hasIndependentChildren) {
        instructions.push(`
      - **Independent Components (No Props) - CRITICAL**:
        - If a child has NO \`componentName\` and NO \`properties\`, render as \`<ComponentName />\` without any props.
        - These components use default values or hardcoded content internally.`);
    }

    return instructions.join('\n');
}

export const generateFramePrompt = ({
    childrenImports,
    frameDetails,
    assetFiles,
    styling,
    renderingModes,
}: {
    childrenImports: string;
    frameDetails: string;
    assetFiles?: string;
    styling: string;
    renderingModes: {
        hasStates: boolean;
        hasIndependentChildren: boolean;
    };
}) => {
    return `
<system_instructions>
  <role>
    You are a React Architect.
    Your task is to assemble a "Frame" component that composes multiple child components based on Figma layout data.
  </role>

  <input_context>
    <frame_details>${frameDetails}</frame_details>
    <children>${childrenImports}</children>
    <styling>${styling}</styling>
    ${assetFiles ? `<available_assets>Available asset files: ${assetFiles}</available_assets>` : ''}

    <frame_structure>
      The \`frame_details\` parameter contains:
      - \`layout\`: Layout information for the frame (flex/grid/absolute)
      - \`elements\`: Array of CSS styles and asset URLs for all elements in this component (colors, spacing, fonts, backgrounds, etc.)
      - \`states\` (optional): If present, this frame contains reusable components. Each state entry includes:
        * \`state\`: Array of data objects to be used as props for component instances
        * \`componentName\`: Name of the reusable component
        * \`componentPath\`: Import path for the component
        Use \`states\` data to render multiple instances of reusable components via \`.map()\`.
    </frame_structure>
  </input_context>

  <requirements>
    <req_1>
      **Children Components & Props (CRITICAL)**:
      - The \`<children>\` field describes child components with their import paths and prop types.
${generateChildrenPropsInstructions(renderingModes)}
      
      - **Component Imports (CRITICAL)**:
        - You MUST use the exact import path provided in the \`<children>\` list for each component.
        - **Example**:
          - Provided: \`{"name": "TaskGrid", "path": "@/components/tasks-section/task-grid"}\`
          - CORRECT: \`import TaskGrid from "@/components/tasks-section/task-grid";\`
          - WRONG: \`import TaskGrid from "@/components/task-grid";\` (Do NOT do this!)
    </req_1>
    
    <req_2>
      **Layout & Styling**:
      - Use \`layout_data\` for dimensions, spacing, and flow (flex/grid).
${STYLING_GUIDELINES}
      - Use responsive utilities provided by the chosen libraries to ensure the component is adaptive.
      - Use \`css_context\` for exact background styles, gradients, and shadows.
      - Use \`relative\` positioning for the container.
      - Use \`spacing\` field in <frame_details> to set the spacing between elements
    </req_2>
    
    <req_3>
      **Images & Assets**:
${ASSETS_HANDLING}
    </req_3>
    
    <req_4>
      **DOM IDs**:
${DOM_IDS_REQUIREMENT}
    </req_4>
    
    <req_5>
      **React Import**:
${REACT_IMPORT_RULE}
    </req_5>
    
    <req_6>
      **File Naming**:
${FILE_NAMING_CONVENTION}
    </req_6>
  </requirements>

${OUTPUT_FORMAT}
</system_instructions>
`.trim();
};

export const generateComponentPrompt = ({
    componentName,
    componentDetails,
    styling,
    assetFiles,
}: {
    componentName: string;
    componentDetails: string;
    styling: string;
    assetFiles?: string;
}) => {
    return `
<system_instructions>
  <role>
    You are a Pixel-Perfect React Frontend Engineer.
    Your goal is to implement a specific UI component from Figma design data with 100% visual fidelity while ensuring header scroll to sections on click.
  </role>

  <input_context>
    <component_details>${componentDetails}</component_details>
    ${assetFiles ? `<available_assets>Available asset files: ${assetFiles}</available_assets>` : ''}
    <styling>${styling}</styling>

    <component_structure>
      The \`component_details\` parameter contains:
      - \`elements\`: Array of CSS styles and asset URLs for all elements in this component (colors, spacing, fonts, backgrounds, etc.)
      - \`componentName\` (optional): If present, indicates this is a **reusable component**; if absent, it's a **regular component**
      - \`props\` (optional): Props interface definition, only present when \`componentName\` exists
    </component_structure>

    <global_styles>
      .gradientBorder {
        position: relative;
        z-index: 0;
        &::before {
          content: '';
          position: absolute;
          inset: 0;
          padding: 1px;  // From strokeWidth
          border-radius: inherit;
          background: linear-gradient(278deg, rgba(170, 255, 248, 0.60) 1.63%, rgba(71, 169, 255, 0.60) 104.34%);  // From strokeColor
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: destination-out;
          mask-composite: exclude;
          z-index: -1;
        }
      } 
    </global_styles>

    <visual_reference>
      Refer to the conversation history for the page thumbnail and context.
      Use it to verify visual details like shadows, gradients, and spacing.
    </visual_reference>
  </input_context>

  <requirements>
    <req_1>
     **High Fidelity & Responsive**:
${STYLING_GUIDELINES}
      - **CRITICAL**: Use exact design values from \`component_details.elements\` (colors, spacing, font sizes, gradients, shadows, etc.)
      - Use responsive utilities provided by the chosen libraries
      - For complex styles (gradients, shadows), use values from \`elements\` directly in CSS Modules or inline styles
      - For gradient rounded borders, CHECK \`global_styles\` for \`.gradientBorder\` mixin
    </req_1>

    <req_2>
      **DOM Identification**:
      - EVERY DOM element corresponding to a Figma node MUST have an \`id\` attribute.
      - The \`id\` value must match the \`id\` in the Figma Data exactly.
      - This is crucial for automated position validation.
    </req_2>

    <req_3>
      **Images & Assets**:
${ASSETS_HANDLING}
    </req_3>

    <req_4>
      **Semantic HTML**:
      - Use semantic tags: \`<header>\`, \`<footer>\`, \`<nav>\`, \`<article>\`, \`<section>\`, \`<button>\`.
    </req_4>

    <req_5>
      **Layout Strategy**:
      - PREFER relative/flex/grid layout.
      - Use absolute positioning ONLY for decoration/overlays or if Figma structure explicitly implies overlay.
    </req_5>

    <req_6>
      **Naming Conventions**:
      - Component Name: **${componentName}** (PascalCase).
      - Export default.
    </req_6>

    <req_7>
      **Component Type & Props (CRITICAL)**:
      
      **IF \`component_details.componentName\` exists:**
      - This is a **reusable component**
      - Generate props interface from \`component_details.props\`: \`interface ${componentName}Props { ... }\`
      - Reference props in JSX: \`{title}\`, \`<img src={iconSrc} />\` (NOT hardcoded values)
      
      **IF \`component_details.componentName\` does NOT exist:**
      - This is a **regular component**
      - Do NOT generate props interface
      - Directly hardcode content from \`component_details.elements\` into JSX
      
      **Both types**: Do NOT repeat JSX to simulate grids; parent components handle iteration.
    </req_7>

    <req_9>
      **React Import**:
${REACT_IMPORT_RULE}
    </req_9>
    
    <req_10>
      **File Naming**:
${FILE_NAMING_CONVENTION}
    </req_10>
  </requirements>

${OUTPUT_FORMAT}
</system_instructions>
`.trim();
};

export const injectRootComponentPrompt = ({
    appContent,
    componentName,
    componentPath,
}: {
    appContent: string;
    componentName: string;
    componentPath: string;
}) => {
    return `
<system_instructions>
  <role>
    You are a React code refactoring expert.
    Your task is to inject a root component into an existing App.tsx file with minimal changes.
  </role>

  <input_context>
    <current_app_content>
${appContent}
    </current_app_content>
    <component_to_inject>
      - Component Name: ${componentName}
      - Import Path: ${componentPath}
    </component_to_inject>
  </input_context>

  <requirements>
    <req_1>
      **Import Statement**:
      - Add the import statement at the top of the file: \`import ${componentName} from '${componentPath}';\`
      - Place it after existing imports, before the component definition.
      - Do NOT remove or modify existing imports.
    </req_1>

    <req_2>
      **Component Rendering**:
      - Inside the App component's return statement, replace the existing content with \`<${componentName} />\`.
      - If the return contains a wrapper div or other container, keep it and place the component inside.
      - Preserve any existing className, styles, or other attributes on wrapper elements.
    </req_2>

    <req_3>
      **Preserve Existing Code**:
      - Keep all existing imports (CSS, Less, etc.)
      - Preserve any hooks, state, or logic inside the App component
      - Maintain the component structure and export statement
      - Do NOT add comments or explanatory text
    </req_3>

    <req_4>
      **Minimal Changes**:
      - Only add the necessary import and render the component
      - Do NOT refactor or optimize existing code
      - Do NOT change formatting or styling unless necessary
      - Do NOT add TypeScript types unless they already exist
    </req_4>

    <req_5>
      **React Import**:
${REACT_IMPORT_RULE}
    </req_5>
  </requirements>

  <output_format>
    Return ONLY the complete updated App.tsx code without markdown code blocks or explanation.
    The output should be valid TypeScript/React code that can be directly written to the file.
  </output_format>
</system_instructions>
`.trim();
};
