[dotenv@17.2.3] injecting env (0) from .env -- tip: ⚙️  load multiple .env files with { path: ['.env.local', '.env'] }
You are an expert Frontend Developer.
You are analyzing a container component "CertoLandingPage" which contains a list of "InsightCard" components.

Your task is to:
1. Generate a **props schema** (formal parameter definitions) based on the first component instance
2. Extract the **data array** (actual parameter values) for all component instances from the provided Figma structure data

Context:
- Container: CertoLandingPage
- Child Component: InsightCard
- Figma Data:
[
  {
    "id": "728:17958",
    "name": "a",
    "type": "IMAGE",
    "url": "@/assets/a-728-17958.png",
    "absoluteBoundingBox": {
      "x": 23292,
      "y": 23346.984375,
      "width": 320,
      "height": 534
    },
    "inlineStyles": {
      "borderRadius": "48px"
    }
  },
  {
    "id": "728:17972",
    "name": "a",
    "type": "IMAGE",
    "url": "@/assets/a-728-17972.png",
    "absoluteBoundingBox": {
      "x": 23660,
      "y": 23346.984375,
      "width": 320,
      "height": 534
    },
    "inlineStyles": {
      "borderRadius": "48px"
    }
  },
  {
    "id": "728:17965",
    "name": "a",
    "type": "IMAGE",
    "url": "@/assets/a-728-17965.png",
    "absoluteBoundingBox": {
      "x": 24028,
      "y": 23346.984375,
      "width": 320,
      "height": 534
    },
    "inlineStyles": {
      "borderRadius": "48px"
    }
  }
]

Instructions:
1. Analyze the "children" in the Figma Data. Identify those that are instances of "InsightCard".
2. For each instance, extract ALL differing content, including:
   - **Text**: Extract the **EXACT** text content found in the "characters" fields. Do NOT summarize or generate placeholders.
    - **Images/Icons**: Identify nodes where `type` is "IMAGE". These nodes will have a `url` field.
      - If a node has `isIcon: true` field, or the node name contains "icon", or the url ends with ".svg", use `iconSrc` as the key.
      - Otherwise, use `imageSrc` or `avatarSrc` based on context (e.g., avatar for profile pictures).
    - **Layout/Variants**: 
      - If the component has `layoutDirection: "HORIZONTAL"` in the layoutInfo, and contains both text and image content, determine the image position:
        - Check the `absoluteBoundingBox` positions: if image's x position is less than text's x position, image is on the **left**; otherwise on the **right**.
        - Extract as `imagePosition: "left"` or `imagePosition: "right"` prop.
      - Any other component properties or visual variants (e.g. "variant": "filled", "active": true).
3. **Normalize the data keys (CRITICAL)**:
   - For text content: use `title`, `description`, `label`, etc.
   - For images/icons: ALWAYS use `iconSrc`, `imageSrc`, `avatarSrc` (with "Src" suffix)
   - **DO NOT** use ambiguous keys like `icon`, `image`, `avatar` alone
   - This ensures compatibility with standard React component prop naming conventions.
   - Example:
     ```json
     {
       "title": "Example Title",
       "description": "Example description",
       "imageSrc": "@/assets/actual-filename-from-figma.png"
     }
     ```
4. **Generate Props Schema (CRITICAL)**:
   - Based on the first component instance, infer the prop definitions
   - For each extracted field (e.g., "title", "description", "imageSrc"), determine:
     * **key**: The property name (e.g., "title")
     * **type**: The TypeScript type - must be one of: "string", "number", "boolean", "string[]", "number[]"
     * **description**: A clear description of what this prop represents
   - Return as "props" array with objects containing { key, type, description }
   - Example:
     ```json
     {
       "key": "title",
       "type": "string",
       "description": "Card title text"
     }
     ```
5. **CRITICAL Rules**:
   - **USE ACTUAL DATA ONLY**: The example above uses placeholder names. You MUST use the actual "characters" and "url" values from the Figma Data provided.
   - **NO FIGMA IDs**: Do NOT include Figma node IDs (like "1:2859") in the output. Only extract actual content data.
   - **NO PLACEHOLDERS**: Do NOT generate fake text or copy paths from examples. If a node does not have a "url" field, do not include an "imageSrc" property.
   - **Deep Search**: Text nodes might be nested deeply inside Frames/Groups. Look recursively for "characters" fields.
   - **Layout Information**: The Figma Data includes `layoutInfo` array with `layoutDirection` and `absoluteBoundingBox` for each component instance. Use this to determine layout-related props like image position (left/right) in horizontal layouts.
   - **Asset Paths - CRITICAL**: 
      - Images are represented by nodes with `type: "IMAGE"`. These nodes MUST have a `url` field.
      - You MUST use the EXACT value from the `url` field as the value for "imageSrc", "iconSrc", or "avatarSrc" without any modifications.
      - The `url` field value MUST be a file path (e.g., "@/assets/icon-name.svg").
      - **DO NOT hallucinate or copy paths from the example above.** Every image MUST correspond to a node in the provided Figma Data.
      - CORRECT: If a node has `type: "IMAGE"` and `url: "@/assets/real-image-123.png"`, use exactly that.
      - WRONG: Using "@/assets/start-2.svg" if it's not in the input data.
      - If the `url` field does not exist or does not contain a valid path starting with "@/assets/", omit the iconSrc/imageSrc/avatarSrc field entirely.
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
