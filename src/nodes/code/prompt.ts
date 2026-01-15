export const generateFramePrompt = ({
    childrenImports,
    layoutData,
    figmaData,
    cssContext,
    assetFiles,
    styling,
}: {
    childrenImports: string;
    layoutData: string;
    figmaData: string;
    cssContext?: string;
    assetFiles?: string;
    styling: string;
}) => {
    return `
<system_instructions>
  <role>
    You are a React Architect.
    Your task is to assemble a "Frame" component that composes multiple child components based on Figma layout data.
  </role>

  <input_context>
    <layout_data>${layoutData}</layout_data>
    <figma_data>${figmaData}</figma_data>
    <children>${childrenImports}</children>
    <styling>${styling}</styling>
    <css_context>${cssContext}</css_context>
    ${assetFiles ? `<available_assets>Available asset files: ${assetFiles}</available_assets>` : ''}
  </input_context>

  <requirements>
    <req_1>
      **Children Components & Props (CRITICAL)**:
      - The \`<children>\` field describes child components with their import paths and prop types.
      
      - **Explicit Data Driven List**:
        - Check if \`<figma_data>\` contains a \`state\` property (array).
        - If yes, use this \`state\` array as the source of truth for rendering the children (usually a list of identical components).
        
        - **State Data → Component Props Mapping (EXTREMELY IMPORTANT)**:
          - **STEP 1**: Inspect the child component's import path and infer its prop interface.
          - **STEP 2**: Compare state data keys with expected prop names.
          - **STEP 3**: If there's a mismatch, map the keys explicitly when spreading props.
          - **Example**:
            \`\`\`tsx
            // State has: { icon: Icon1, title: "..." }
            // But Component expects: { iconSrc: string, title: string }
            // Solution:
            state.map((item) => (
              <Component 
                key={...}
                iconSrc={item.icon}  // Map icon -> iconSrc
                title={item.title}    // Direct match
              />
            ))
            \`\`\`
          - **DO NOT** blindly use \`{...item}\` if prop names don't match!
        
        - **Asset Imports in State**:
          - If the Figma data contains a "url" field, this field represents the image path. You MUST use the EXACT value from the "url" field as the value for "imageSrc", "iconSrc", or "avatarSrc" without any modifications.
      
      - **Single Instances**:
        - If no \`state\` array, render children individually based on the \`children\` array.
        - If a child object has \`properties\`, render as \`<ComponentName {...properties} />\`.
        
      - **Component Imports (CRITICAL)**:
        - You MUST use the exact import path provided in the \`<children>\` list for each component.
        - **DO NOT** invent paths or assume components are at the top level.
        - **Example**:
          - Provided: \`{"name": "TaskGrid", "path": "@/components/tasks-section/task-grid"}\`
          - CORRECT: \`import TaskGrid from "@/components/tasks-section/task-grid";\`
          - WRONG: \`import TaskGrid from "@/components/task-grid";\` (Do NOT do this!)
    </req_1>
    <req_2>
      **Layout & Styling**:
      - Use \`layout_data\` for dimensions, spacing, and flow (flex/grid).
      - **Style Consistency**: Implement styles using the technical stack and libraries listed in <styling>.
      - **Strict Restriction**: Absolutely ONLY use the technical stack and libraries listed in <styling>. Do NOT use any other styling methods, libraries, or frameworks (e.g., if clsx is not listed, do not use clsx).
      - **Default Styling**: If <styling> is empty or does not contain specific libraries, DEFAULT to standard vanilla CSS.
      - **CSS Modules**: If the tech stack specifies CSS Modules (e.g., with Less, SCSS, or plain CSS), you MUST:
        1. Create a corresponding style file (e.g., \`index.module.less\`, \`index.module.scss\`, or \`index.module.css\`) alongside the component, using the extension appropriate for the stack.
        2. Import it as \`import styles from './index.module.[ext]';\` in the TSX.
        3. Define all styles in the style file and use \`styles.className\` in JSX.
      - Use responsive utilities provided by the chosen libraries to ensure the component is adaptive.
      - Use \`css_context\` for exact background styles, gradients, and shadows.
      - Use \`relative\` positioning for the container.
      - Use \`spacing\` field in <figma_data> to set the spacing between elements
    </req_2>
    <req_3>
      **Images & Assets**:
      - **CRITICAL**: For any image URL starting with \`@/assets\`, you MUST import it at the top of the file.
      - **Asset Name Matching**: 
        - Check the \`<available_assets>\` list for actual filenames in the project.
        - Asset filenames follow the pattern: \`kebab-case-name-id1-id2.ext\` (e.g., "Star 2.svg" → "star-2-1-2861.svg")
        - Match the base name (ignoring spaces, case, and ID suffix): "@/assets/arXiv.svg" → look for "arxiv-*.svg" in the list
        - Use the EXACT filename from the available assets list in your import.
      - Example: If available_assets contains "arxiv-1-2956.svg", use:
        \`import ArXivIcon from '@/assets/arxiv-1-2956.svg';\`
      - **Usage**: \`<img src={ArXivIcon} />\`, do not use backgroundImage property.
      - **NEVER** use the string path directly in JSX or styles.
    </req_3>
    <req_4>
      **DOM IDs**:
      - Assign \`id\` attributes to the main container and any internal elements, matching \`figma_data\`.
    </req_4>
    <req_5>
      **React Import**:
      - Do **NOT** include \`import React from 'react';\` at the top of the file.
    </req_5>
    <req_6>
      **File Naming**:
      - ALWAYS name the main frame component file \`index.tsx\`.
      - ALWAYS name the style file (if applicable) \`index.module.[css|less|scss]\`.
      - NEVER use PascalCase or other names for filenames (e.g., DO NOT use \`MainFrame.tsx\`).
    </req_6>
  </requirements>

  <output_format>
    If only one file (TSX) is needed:
    \`\`\`tsx
    // code...
    \`\`\`

    If multiple files are needed (e.g., TSX + Styles):
    ## index.tsx
    \`\`\`tsx
    // code...
    \`\`\`

    ## index.module.[css|less|scss]
    \`\`\`[css|less|scss]
    // styles...
    \`\`\`
  </output_format>
</system_instructions>
`.trim();
};

export const generateComponentPrompt = ({
    componentName,
    figmaData,
    cssContext,
    styling,
}: {
    componentName: string;
    figmaData: string;
    styling: string;
    cssContext?: string;
}) => {
    return `
<system_instructions>
  <role>
    You are a Pixel-Perfect React Frontend Engineer.
    Your goal is to implement a specific UI component from Figma design data with 100% visual fidelity while ensuring header scroll to sections on click.
  </role>

  <input_context>
    <figma_data>${figmaData}</figma_data>
    <css_context>
      Contains extracted CSS styles and Asset URLs for elements in this component.
      Use this for precise background gradients, font styles, and image sources.
      ${cssContext}
    </css_context>
    <styling>${styling}</styling>
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
    <reusability_context>
      - The \`figma_data\` may include an optional field \`componentName\`, which identifies this node as an instance of a reusable component (e.g. "TaskCard", "FeatureCard").
      - The code generation pipeline will:
        1) Generate the **reusable base component** for a given \`componentName\` exactly once using this prompt.
        2) Generate **per-instance props objects** for each node that shares the same \`componentName\`, and pass them from Frame components.
      - This prompt is responsible ONLY for defining the reusable base component API (props and JSX), not for generating instance-specific props objects.
    </reusability_context>
  </input_context>

  <requirements>
    <req_1>
      **High Fidelity & Responsive**:
      - **Style Consistency**: Implement styles using the technical stack and libraries listed in <styling>.
      - **Strict Restriction**: Absolutely ONLY use the technical stack and libraries listed in <styling>. Do NOT use any other styling methods, libraries, or frameworks (e.g., if clsx is not listed, do not use clsx).
      - **Default Styling**: If <styling> is empty or does not contain specific libraries, DEFAULT to standard vanilla CSS.
      - **CRITICAL**: Check <css_context> for exact design values (colors, spacing, font sizes, transitions, etc.).
      - Use responsive utilities provided by the chosen libraries to ensure the component is adaptive.
      - **Complex Styles**: For gradients or specific shadows not easily mapped to standard utility classes, use the values from \`css_context\` directly in the most appropriate way for the chosen stack (e.g. JIT classes, or CSS-in-JS/Modules).
      - **CSS Modules**: If the tech stack specifies CSS Modules (e.g., with Less, SCSS, or plain CSS), you MUST:
        1. Create a corresponding style file (e.g., \`index.module.less\`, \`index.module.scss\`, or \`index.module.css\`) alongside the component, using the extension appropriate for the stack.
        2. Import it as \`import styles from './index.module.[ext]';\` in the TSX.
        3. Define all styles in the style file and use \`styles.className\` in JSX.
      - **Gradient Rounded Borders**: If you see a gradient round border in the design, CHECK \`global_styles\` for a mixin (e.g. \`.gradientBorder\`) and apply it if available.
    </req_1>

    <req_2>
      **DOM Identification**:
      - EVERY DOM element corresponding to a Figma node MUST have an \`id\` attribute.
      - The \`id\` value must match the \`id\` in the Figma Data exactly.
      - This is crucial for automated position validation.
    </req_2>

    <req_3>
      **Assets Handling**:
       - **CRITICAL**: For any image URL starting with \`@/assets\`, you MUST import it at the top of the file.
       - Example:
         \`import BgImage from '@/assets/bg.png';\`
         \`<img src={BgImage} />\` , do not use backgroundImage property.
       - **NEVER** use the string path directly in JSX or styles (e.g. DO NOT do \`src="@/assets/..."\`).
       - Match the file path in \`css_context\` exactly.
       - Do not import asset names that does not exist in the assets folder.
    </req_3>

    <req_4>
      **Semantic HTML**:
      - Use semantic tags: \`<header>\`, \`<footer>\`, \`<nav>\`, \`<article>\`, \`<section>\`, \`<button>\`.
    </req_4>

    <req_5>
      **Layout Strategy**:
      - PREFER relative/flex/grid layout.
      - Use \`spacing\` field in <figma_data> to set the spacing between elements.
      - Use absolute positioning ONLY for decoration/overlays or if Figma structure explicitly implies overlay.
    </req_5>

    <req_6>
      **Naming Conventions**:
      - Component Name: **${componentName}** (PascalCase).
      - Export default.
    </req_6>

    <req_7>
      **Reusable Component API (CRITICAL)**:
      - Treat **${componentName}** as a reusable, generic component that can be instantiated multiple times in different Frames.
      - Extract **all variable content** (titles, descriptions, labels, numbers, avatars, statuses, etc.) into **typed props**, instead of hardcoding the values inside the component.
      - Define an explicit props type, e.g. \`type ${componentName}Props = { ... }\` or \`interface ${componentName}Props { ... }\`, and use it on the component signature.
      
      - **Props Naming Convention (EXTREMELY IMPORTANT)**:
        - For image/icon props, ALWAYS use descriptive suffixes: \`iconSrc\`, \`imageSrc\`, \`avatarSrc\` (NOT just \`icon\`, \`image\`, \`avatar\`)
        - This prevents confusion between imported asset variables and string paths.
        - Example:
          \`\`\`tsx
          interface CardProps {
            title: string;
            iconSrc: string;    // CORRECT - clearly a source path
            imageSrc: string;   // CORRECT
            // NOT: icon: string   WRONG - ambiguous
          }
          \`\`\`
      
      - Use props values directly in JSX; do not perform data fetching or global state access inside this component.
      - Assume that parent Frames will later pass concrete values via a \`properties\` object that maps 1:1 to \`${componentName}Props\`.
      - If the design looks like a "Card" / "ListItem" that appears many times (e.g. FeatureCard1...FeatureCard12), design the component as **one generic card** driven entirely by props (e.g. \`title\`, \`description\`, \`iconSrc\`, \`tag\`), not as a grid of multiple cards.
      - Do **NOT** repeat the same JSX structure multiple times inside this component to simulate a grid; the grid/list should be handled by the parent Frame using \`array.map\` and different props.
      - When \`componentName\` is present in \`figma_data\`, treat this as defining the canonical reusable component for that name; any differences between instances (text, numbers, icons, etc.) MUST be modeled as props, not separate components.
    </req_7>

    <req_8>
      **Child Components - DO NOT IMPORT (CRITICAL)**:
      - **NEVER** import child components from other paths (e.g., \`import TimelineItem from '@/components/...'\`).
      - Even if \`figma_data\` contains a \`children\` field with child component information, DO NOT generate import statements for them.
      - This component should be **self-contained** and render all its UI using native HTML/React elements (div, span, img, etc.) and props.
      - Child component composition is handled at a higher level (Frame components), NOT within individual reusable components.
      - Example of what NOT to do:
        ❌ WRONG:
        \`\`\`tsx
        import TimelineItem from '@/components/timeline-section/timeline-item';
        
        const TimelineList = () => {
          return <div><TimelineItem /></div>;
        };
        \`\`\`
      - Example of what to do:
        ✅ CORRECT:
        \`\`\`tsx
        interface TimelineListProps {
          items: Array<{ date: string; title: string }>;
        }
        
        const TimelineList = ({ items }: TimelineListProps) => {
          return (
            <div>
              {items.map((item, i) => (
                <div key={i}>
                  <span>{item.date}</span>
                  <span>{item.title}</span>
                </div>
              ))}
            </div>
          );
        };
        \`\`\`
    </req_8>
    <req_9>
      **React Import**:
      - Do **NOT** include \`import React from 'react';\` at the top of the file.
    </req_9>
    <req_10>
      **File Naming**:
      - ALWAYS name the main component file \`index.tsx\`.
      - ALWAYS name the style file (if applicable) \`index.module.[css|less|scss]\`.
      - NEVER use PascalCase or other names for filenames (e.g., DO NOT use \`Button.tsx\`).
    </req_10>
  </requirements>

  <reuse_strategy>
    - **Dynamic Collections**: If the design suggests repeated items (e.g., "Card", "ListItem"), use array data + \`array.map\` to render them **inside the parent Frame**, while keeping this component focused on a single item with props.
  </reuse_strategy>

  <output_format>
    If only one file (TSX) is needed:
    \`\`\`tsx
    // code...
    \`\`\`

    If multiple files are needed (e.g., TSX + Styles):
    ## index.tsx
    \`\`\`tsx
    // code...
    \`\`\`

    ## index.module.[css|less|scss]
    \`\`\`[css|less|scss]
    // styles...
    \`\`\`
  </output_format>
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
      - Do **NOT** include \`import React from 'react';\` at the top of the file unless it already exists.
    </req_5>
  </requirements>

  <output_format>
    Return ONLY the complete updated App.tsx code without markdown code blocks or explanation.
    The output should be valid TypeScript/React code that can be directly written to the file.
  </output_format>
</system_instructions>
`.trim();
};
