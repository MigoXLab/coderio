/**
 * Prompt template for structure generation.
 * Matches the style used in agents/initial-agent/prompt.ts.
 */
export const generateStructurePrompt = (options: { positions: string; width?: string }) => {
    const { positions, width } = options;
    const imageWidth = width ?? '1440';
    return `
<system_instructions>
  <task>Generate a semantic React component structure from Figma design data.</task>

  <input_context>
    <positions_json>${positions}</positions_json>
    <image_width>${imageWidth}px</image_width>
    <visual_reference>Refer to the attached image for hierarchy and grouping.</visual_reference>
  </input_context>

  <rules>
    <rule name="Hierarchy Strategy">
      1. Compare 'positions_json' nesting with visual grouping.
      2. If data contradicts visual layout, IGNORE data nesting and restructure based on VISUAL proximity.
    </rule>

    <rule name="Pattern Recognition (CRITICAL)">
      1. **Semantic Grouping**: Group by function (e.g., "PricingCard", "UserProfile").
      2. **Grid/List Detection**:
         - Detect repeating identical siblings (e.g., 6 Cards).
         - Create a SINGLE container (e.g., "CardGrid") instead of "Card1", "Card2".
         - **MERGE IDs**: The container's \`elementIds\` MUST include ALL children IDs of all items in the grid to ensure complete style extraction.
         - **Reusable Instances with \`data.componentName\`**:
           - For each visually repeated item, keep a unique \`id\` / \`data.name\` (e.g., "TaskCard1", "TaskCard2", ...).
           - Set the SAME \`data.componentName\` for all these items (e.g., "TaskCard") to mark them as instances of one reusable component.
           - Example: 12 task cards → each child has different \`id\` / \`data.name\` ("TaskCard1"... "TaskCard12"), but the SAME \`data.componentName\`: "TaskCard".
      3. **Fragmentation**: Avoid creating components for single atoms (Text/Icon) unless reusable (Button/Chip).
      4. **Monoliths**: Split sections >1000px height.
    </rule>

    <rule name="Component Granularity (CRITICAL - Prevent Over-Fragmentation)">
      1. **Maximum Depth = 2**:
         - Component tree should NOT exceed 2 levels deep (root -> children -> grandchildren is the MAX).
         - If you find yourself creating a 3rd level, STOP and merge it into the parent instead.

      2. **Minimum Element Threshold**:
         - Each component MUST contain at least 5+ elements in its \`elementIds\`.
         - If a potential component has fewer than 5 elements, MERGE it into its parent or sibling.
         - This prevents creating tiny components like "LegalLinks" (3 links) or "CommunityLinks" (2 links).

      3. **Component Count Limit**:
         - For a single section, create at most 2-3 child components.
         - Example: Footer → FooterTop, FooterBottom (2 children, NOT 4-5 like "Logos", "Links", "QRCode", etc.)

      4. **DO NOT Create Separate Components For**:
         - A group of links (merge into parent section's elementIds)
         - A group of logos or icons (merge into parent section's elementIds)
         - Single text, image, icon, divider, link
         - Any group with < 5 elements
         These should ALL be included in parent's \`elementIds\`.

      5. **Merge by Visual Region, NOT by Function**:
         - Divide by visual position (Top/Bottom, Left/Right), NOT by element type (Links/Logos/QRCode).
         - Example: FooterTop contains logos + links + icons together (all elements in that visual area).
    </rule>

    <rule name="Naming & ID">
      - \`id\` MUST match \`data.name\` (PascalCase, Unique).
      - **Containers**: \`elementIds\` = container background/frame IDs only.
      - **Leaves**: \`elementIds\` = component's direct IDs + ALL nested children IDs.
      - **Integrity**: Every input ID must be assigned to exactly one component.
    </rule>

    <rule name="Layout Data">
      For EACH node, calculate:
      - \`boundingBox\`: {top, left, width, height} (Absolute)
      - \`relativeBoundingBox\`: {top, left, width, height} (Relative to parent)
      - \`spacing\`: {next: number} (Distance to next sibling)
      - \`layoutDirection\`: "VERTICAL" | "HORIZONTAL" | "NONE"
        **HOW TO DETERMINE layoutDirection (ESPECIALLY FOR ROOT NODE)**:
        1. Look at ALL direct children's \`boundingBox.left\` values
        2. **If children have 2+ DIFFERENT \`left\` values** (difference > 50px):
           → Set \`layoutDirection = "HORIZONTAL"\`
           → Example: Sidebar at left=0, Content at left=240 → HORIZONTAL
        3. **If ALL children have SAME \`left\` value** (within ±50px tolerance):
           → Set \`layoutDirection = "VERTICAL"\`
           → Example: Header at left=0, Content at left=0, Footer at left=0 → VERTICAL
        4. Common patterns:
           - **Sidebar Layout**: Sidebar (left=0) + Main Content (left=240+) → ROOT is HORIZONTAL
           - **Stacked Layout**: All sections at same left position → ROOT is VERTICAL
    </rule>
  </rules>

  <output_format>
    Return ONLY a single valid JSON object (no markdown code blocks).
    Follow this schema exactly:
    {
      "id": "ComponentName",
      "data": {
        "name": "ComponentName",
        "componentName": "OptionalReusableComponentName",
        "purpose": "string",
        "elementIds": ["id1", "..."],
        "layout": {
          "boundingBox": { "top": 0, "left": 0, "width": 0, "height": 0 },
          "relativeBoundingBox": { "top": 0, "left": 0, "width": 0, "height": 0 },
          "spacing": { "next": 0 },
          "layoutDirection": "VERTICAL"  // or "HORIZONTAL"
        }
        // Note: layoutGroups will be automatically added by post-processing if layoutDirection is HORIZONTAL
      },
      "children": []
    }
    
    **Layout Groups**:
    - Do NOT generate \`layoutGroups\` field in your output
    - This field will be automatically added by post-processing if needed

    **CRITICAL: 2-Level Maximum Structure**

    Your output MUST follow a maximum 2-level structure. Level 2 nodes should have \`children: []\`.
    All primitive elements (single text, links, logos, icons, dividers) go into \`elementIds\`, NOT as child components.

    Example for ANY section:
    {
      "id": "SectionName",
      "data": {
        "name": "SectionName",
        "purpose": "Main section description",
        "elementIds": ["container-id"],
        "layout": {...}
      },
      "children": [
        {
          "id": "SubSectionA",
          "data": {
            "name": "SubSectionA",
            "purpose": "Visual area with links, logos, text",
            "elementIds": ["all", "element", "ids", "including", "links", "logos", "text"],
            "layout": {...}
          },
          "children": []  // MUST be empty - all elements via elementIds
        },
        {
          "id": "SubSectionB",
          "data": {
            "name": "SubSectionB",
            "purpose": "Another visual area",
            "elementIds": ["all", "element", "ids", "in", "this", "area"],
            "layout": {...}
          },
          "children": []  // MUST be empty
        }
      ]
    }

    For reusable component instances that share the same \`data.componentName\` but have different \`id\` and \`data.name\`, an additional expected example is:
    {
      "id": "TaskCardGrid",
      "data": {
        "name": "TaskCardGrid",
        "purpose": "Grid container for task cards",
        "elementIds": ["..."],
        "layout": {
          "boundingBox": { "top": 0, "left": 0, "width": 0, "height": 0 },
          "relativeBoundingBox": { "top": 0, "left": 0, "width": 0, "height": 0 },
          "spacing": { "next": 0 },
          "layoutDirection": "VERTICAL"
        }
      },
      "children": [
        {
          "id": "TaskCard1",
          "data": {
            "name": "TaskCard1",
            "componentName": "TaskCard",
            "purpose": "Single task card",
            "elementIds": ["id1", "..."],
            "layout": {
              "boundingBox": { "top": 0, "left": 0, "width": 0, "height": 0 },
              "relativeBoundingBox": { "top": 0, "left": 0, "width": 0, "height": 0 },
              "spacing": { "next": 0 },
              "layoutDirection": "VERTICAL"
            }
          },
          "children": []
        }
      ]
    }
  </output_format>
</system_instructions>
`.trim();
};

/**
 * Prompt template for extracting data list and props schema.
 */
export const extractDataListPrompt = (options: { containerName: string; childComponentName: string; figmaData: string }) => {
    const { containerName, childComponentName, figmaData } = options;
    return `
You are an expert Frontend Developer.
You are analyzing a container component "${containerName}" which contains a list of "${childComponentName}" components.

Your task is to:
1. Generate a **props schema** (formal parameter definitions) based on the first component instance
2. Extract the **data array** (actual parameter values) for all component instances from the provided Figma structure data

Context:
- Container: ${containerName}
- Child Component: ${childComponentName}
- Figma Data:
${figmaData}

Instructions:
1. Analyze the "children" in the Figma Data. Identify those that are instances of "${childComponentName}".
2. For each instance, extract ALL differing content, including:
   - **Text**: Extract the **EXACT** text content found in the "characters" fields. Do NOT summarize or generate placeholders.
    - **Images/Icons**: Identify nodes where \`type\` is "IMAGE". These nodes will have a \`url\` field.
      - If a node has \`isIcon: true\` field, or the node name contains "icon", or the url ends with ".svg", use \`iconSrc\` as the key.
      - Otherwise, use \`imageSrc\` or \`avatarSrc\` based on context (e.g., avatar for profile pictures).
    - **Layout/Variants**: 
      - If the component has \`layoutDirection: "HORIZONTAL"\` in the layoutInfo, and contains both text and image content, determine the image position:
        - Check the \`absoluteBoundingBox\` positions: if image's x position is less than text's x position, image is on the **left**; otherwise on the **right**.
        - Extract as \`imagePosition: "left"\` or \`imagePosition: "right"\` prop.
      - Any other component properties or visual variants (e.g. "variant": "filled", "active": true).
3. **Normalize the data keys (CRITICAL)**:
   - For text content: use \`title\`, \`description\`, \`label\`, etc.
   - For images/icons: ALWAYS use \`iconSrc\`, \`imageSrc\`, \`avatarSrc\` (with "Src" suffix)
   - **DO NOT** use ambiguous keys like \`icon\`, \`image\`, \`avatar\` alone
   - This ensures compatibility with standard React component prop naming conventions.
   - Example:
     \`\`\`json
     {
       "title": "Example Title",
       "description": "Example description",
       "imageSrc": "@/assets/actual-filename-from-figma.png"
     }
     \`\`\`
4. **Generate Props Schema (CRITICAL)**:
   - Based on the first component instance, infer the prop definitions
   - For each extracted field (e.g., "title", "description", "imageSrc"), determine:
     * **key**: The property name (e.g., "title")
     * **type**: The TypeScript type - must be one of: "string", "number", "boolean", "string[]", "number[]"
     * **description**: A clear description of what this prop represents
   - Return as "props" array with objects containing { key, type, description }
   - Example:
     \`\`\`json
     {
       "key": "title",
       "type": "string",
       "description": "Card title text"
     }
     \`\`\`
5. **CRITICAL Rules**:
   - **USE ACTUAL DATA ONLY**: The example above uses placeholder names. You MUST use the actual "characters" and "url" values from the Figma Data provided.
   - **NO FIGMA IDs**: Do NOT include Figma node IDs (like "1:2859") in the output. Only extract actual content data.
   - **NO PLACEHOLDERS**: Do NOT generate fake text or copy paths from examples. If a node does not have a "url" field, do not include an "imageSrc" property.
   - **Deep Search**: Text nodes might be nested deeply inside Frames/Groups. Look recursively for "characters" fields.
   - **Layout Information**: The Figma Data includes \`layoutInfo\` array with \`layoutDirection\` and \`absoluteBoundingBox\` for each component instance. Use this to determine layout-related props like image position (left/right) in horizontal layouts.
   - **Asset Paths - CRITICAL**: 
      - Images are represented by nodes with \`type: "IMAGE"\`. These nodes MUST have a \`url\` field.
      - You MUST use the EXACT value from the \`url\` field as the value for "imageSrc", "iconSrc", or "avatarSrc" without any modifications.
      - The \`url\` field value MUST be a file path (e.g., "@/assets/icon-name.svg").
      - **DO NOT hallucinate or copy paths from the example above.** Every image MUST correspond to a node in the provided Figma Data.
      - CORRECT: If a node has \`type: "IMAGE"\` and \`url: "@/assets/real-image-123.png"\`, use exactly that.
      - WRONG: Using "@/assets/start-2.svg" if it's not in the input data.
      - If the \`url\` field does not exist or does not contain a valid path starting with "@/assets/", omit the iconSrc/imageSrc/avatarSrc field entirely.
6. Return a JSON object with two keys:
   - "props": Array of prop definitions with { key, type, description }
   - "state": Array of data objects for each component instance
7. Return ONLY the JSON object. Do not explain.

Example Output JSON Structure (for reference only):
{
  "props": [
    {
      "key": "title",
      "type": "string",
      "description": "Card title text"
    },
    {
      "key": "description",
      "type": "string",
      "description": "Card description text"
    },
    {
      "key": "imageSrc",
      "type": "string",
      "description": "Path to card image"
    }
  ],
  "state": [
    {
      "title": "Actual Title 1",
      "description": "Actual Description 1",
      "imageSrc": "@/assets/actual-file-1.png"
    },
    {
      "title": "Actual Title 2",
      "description": "Actual Description 2",
      "imageSrc": "@/assets/actual-file-2.png"
    }
  ]
}
`.trim();
};
