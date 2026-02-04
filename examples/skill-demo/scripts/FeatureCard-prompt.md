[dotenv@17.2.3] injecting env (0) from .env -- tip: 📡 add observability to secrets: https://dotenvx.com/ops
You are an expert Frontend Developer.
You are analyzing a container component "CertoLandingPage" which contains a list of "FeatureCard" components.

Your task is to:
1. Generate a **props schema** (formal parameter definitions) based on the first component instance
2. Extract the **data array** (actual parameter values) for all component instances from the provided Figma structure data

Context:
- Container: CertoLandingPage
- Child Component: FeatureCard
- Figma Data:
[
  {
    "id": "728:17869",
    "name": "div",
    "type": "FRAME",
    "absoluteBoundingBox": {
      "x": 23472,
      "y": 21359.984375,
      "width": 200,
      "height": 265
    },
    "children": [
      {
        "id": "728:17870",
        "name": "div",
        "type": "IMAGE",
        "url": "@/assets/div-728-17870.png",
        "absoluteBoundingBox": {
          "x": 23533.5,
          "y": 21359.984375,
          "width": 77,
          "height": 72
        },
        "inlineStyles": {}
      },
      {
        "id": "728:17872",
        "name": "Spyware detection",
        "type": "TEXT",
        "characters": "Spyware detection",
        "absoluteBoundingBox": {
          "x": 23486.71875,
          "y": 21455.984375,
          "width": 171,
          "height": 25
        },
        "inlineStyles": {},
        "style": {
          "fontFamily": "Inter",
          "fontPostScriptName": null,
          "fontStyle": "Extra Bold",
          "fontWeight": 800,
          "textAutoResize": "WIDTH_AND_HEIGHT",
          "fontSize": 19,
          "textAlignHorizontal": "CENTER",
          "textAlignVertical": "CENTER",
          "letterSpacing": -0.4000000059604645,
          "lineHeightPx": 25,
          "lineHeightPercent": 108.7225112915039,
          "lineHeightPercentFontSize": 131.57894897460938,
          "lineHeightUnit": "PIXELS"
        }
      },
      {
        "id": "728:17873",
        "name": "Our advanced spyware detection engine can identify if a device contains spyware or bugging software.",
        "type": "TEXT",
        "characters": "Our advanced spyware detection engine can identify if a device contains spyware or bugging software.",
        "absoluteBoundingBox": {
          "x": 23473.859375,
          "y": 21504.984375,
          "width": 196.4812469482422,
          "height": 120
        },
        "inlineStyles": {},
        "style": {
          "fontFamily": "Inter",
          "fontPostScriptName": null,
          "fontStyle": "Regular",
          "fontWeight": 400,
          "textAutoResize": "HEIGHT",
          "fontSize": 16,
          "textAlignHorizontal": "CENTER",
          "textAlignVertical": "CENTER",
          "letterSpacing": 0,
          "lineHeightPx": 24,
          "lineHeightPercent": 123.94366455078125,
          "lineHeightPercentFontSize": 150,
          "lineHeightUnit": "PIXELS"
        }
      }
    ],
    "inlineStyles": {}
  },
  {
    "id": "728:17874",
    "name": "div",
    "type": "FRAME",
    "absoluteBoundingBox": {
      "x": 23720,
      "y": 21359.984375,
      "width": 200,
      "height": 265
    },
    "children": [
      {
        "id": "728:17875",
        "name": "div",
        "type": "IMAGE",
        "url": "@/assets/div-728-17875.png",
        "absoluteBoundingBox": {
          "x": 23781.5,
          "y": 21359.984375,
          "width": 77,
          "height": 72
        },
        "inlineStyles": {}
      },
      {
        "id": "728:17877",
        "name": "Keylogger detection",
        "type": "TEXT",
        "characters": "Keylogger detection",
        "absoluteBoundingBox": {
          "x": 23727.921875,
          "y": 21455.984375,
          "width": 184,
          "height": 25
        },
        "inlineStyles": {},
        "style": {
          "fontFamily": "Inter",
          "fontPostScriptName": null,
          "fontStyle": "Extra Bold",
          "fontWeight": 800,
          "textAutoResize": "WIDTH_AND_HEIGHT",
          "fontSize": 19,
          "textAlignHorizontal": "CENTER",
          "textAlignVertical": "CENTER",
          "letterSpacing": -0.4000000059604645,
          "lineHeightPx": 25,
          "lineHeightPercent": 108.7225112915039,
          "lineHeightPercentFontSize": 131.57894897460938,
          "lineHeightUnit": "PIXELS"
        }
      },
      {
        "id": "728:17878",
        "name": "Find malicious keyboards installed on your device that could allow someone to record things you type (e.g. passwords).",
        "type": "TEXT",
        "characters": "Find malicious keyboards installed on your device that could allow someone to record things you type (e.g. passwords).",
        "absoluteBoundingBox": {
          "x": 23727.828125,
          "y": 21504.984375,
          "width": 184.5437469482422,
          "height": 120
        },
        "inlineStyles": {},
        "style": {
          "fontFamily": "Inter",
          "fontPostScriptName": null,
          "fontStyle": "Regular",
          "fontWeight": 400,
          "textAutoResize": "HEIGHT",
          "fontSize": 15,
          "textAlignHorizontal": "CENTER",
          "textAlignVertical": "CENTER",
          "letterSpacing": 0,
          "lineHeightPx": 24,
          "lineHeightPercent": 132.2065887451172,
          "lineHeightPercentFontSize": 160,
          "lineHeightUnit": "PIXELS"
        }
      }
    ],
    "inlineStyles": {}
  },
  {
    "id": "728:17879",
    "name": "div",
    "type": "FRAME",
    "absoluteBoundingBox": {
      "x": 23968,
      "y": 21359.984375,
      "width": 200,
      "height": 265
    },
    "children": [
      {
        "id": "728:17880",
        "name": "div",
        "type": "IMAGE",
        "url": "@/assets/div-728-17880.png",
        "absoluteBoundingBox": {
          "x": 24029.5,
          "y": 21359.984375,
          "width": 77,
          "height": 72
        },
        "inlineStyles": {}
      },
      {
        "id": "728:17882",
        "name": "Find tracking apps",
        "type": "TEXT",
        "characters": "Find tracking apps",
        "absoluteBoundingBox": {
          "x": 23985.03125,
          "y": 21455.984375,
          "width": 167,
          "height": 25
        },
        "inlineStyles": {},
        "style": {
          "fontFamily": "Inter",
          "fontPostScriptName": null,
          "fontStyle": "Extra Bold",
          "fontWeight": 800,
          "textAutoResize": "WIDTH_AND_HEIGHT",
          "fontSize": 19,
          "textAlignHorizontal": "CENTER",
          "textAlignVertical": "CENTER",
          "letterSpacing": -0.4000000059604645,
          "lineHeightPx": 25,
          "lineHeightPercent": 108.7225112915039,
          "lineHeightPercentFontSize": 131.57894897460938,
          "lineHeightUnit": "PIXELS"
        }
      },
      {
        "id": "728:17883",
        "name": "Check which apps can access your location, microphone or camera. Get alerted if a known tracking app is installed.",
        "type": "TEXT",
        "characters": "Check which apps can access your location, microphone or camera. Get alerted if a known tracking app is installed.",
        "absoluteBoundingBox": {
          "x": 23969.28125,
          "y": 21504.984375,
          "width": 197.6218719482422,
          "height": 120
        },
        "inlineStyles": {},
        "style": {
          "fontFamily": "Inter",
          "fontPostScriptName": null,
          "fontStyle": "Regular",
          "fontWeight": 400,
          "textAutoResize": "HEIGHT",
          "fontSize": 16,
          "textAlignHorizontal": "CENTER",
          "textAlignVertical": "CENTER",
          "letterSpacing": 0,
          "lineHeightPx": 24,
          "lineHeightPercent": 123.94366455078125,
          "lineHeightPercentFontSize": 150,
          "lineHeightUnit": "PIXELS"
        }
      }
    ],
    "inlineStyles": {}
  },
  {
    "id": "728:17884",
    "name": "div",
    "type": "FRAME",
    "absoluteBoundingBox": {
      "x": 23472,
      "y": 21696.984375,
      "width": 200,
      "height": 265
    },
    "children": [
      {
        "id": "728:17885",
        "name": "div",
        "type": "IMAGE",
        "url": "@/assets/div-728-17885.png",
        "absoluteBoundingBox": {
          "x": 23533.5,
          "y": 21696.984375,
          "width": 77,
          "height": 72
        },
        "inlineStyles": {}
      },
      {
        "id": "728:17887",
        "name": "OS integrity check",
        "type": "TEXT",
        "characters": "OS integrity check",
        "absoluteBoundingBox": {
          "x": 23487.40625,
          "y": 21792.984375,
          "width": 168,
          "height": 25
        },
        "inlineStyles": {},
        "style": {
          "fontFamily": "Inter",
          "fontPostScriptName": null,
          "fontStyle": "Extra Bold",
          "fontWeight": 800,
          "textAutoResize": "WIDTH_AND_HEIGHT",
          "fontSize": 19,
          "textAlignHorizontal": "CENTER",
          "textAlignVertical": "CENTER",
          "letterSpacing": -0.4000000059604645,
          "lineHeightPx": 25,
          "lineHeightPercent": 108.7225112915039,
          "lineHeightPercentFontSize": 131.57894897460938,
          "lineHeightUnit": "PIXELS"
        }
      },
      {
        "id": "728:17888",
        "name": "Analyze your operating system for signs of tampering that could compromise security, such as Jailbreaking.",
        "type": "TEXT",
        "characters": "Analyze your operating system for signs of tampering that could compromise security, such as Jailbreaking.",
        "absoluteBoundingBox": {
          "x": 23475.515625,
          "y": 21841.984375,
          "width": 193.1531219482422,
          "height": 120
        },
        "inlineStyles": {},
        "style": {
          "fontFamily": "Inter",
          "fontPostScriptName": null,
          "fontStyle": "Regular",
          "fontWeight": 400,
          "textAutoResize": "HEIGHT",
          "fontSize": 16,
          "textAlignHorizontal": "CENTER",
          "textAlignVertical": "CENTER",
          "letterSpacing": 0,
          "lineHeightPx": 24,
          "lineHeightPercent": 123.94366455078125,
          "lineHeightPercentFontSize": 150,
          "lineHeightUnit": "PIXELS"
        }
      }
    ],
    "inlineStyles": {}
  },
  {
    "id": "728:17889",
    "name": "div",
    "type": "FRAME",
    "absoluteBoundingBox": {
      "x": 23720,
      "y": 21696.984375,
      "width": 200,
      "height": 265
    },
    "children": [
      {
        "id": "728:17890",
        "name": "div",
        "type": "IMAGE",
        "url": "@/assets/div-728-17890.png",
        "absoluteBoundingBox": {
          "x": 23781.5,
          "y": 21696.984375,
          "width": 77,
          "height": 72
        },
        "inlineStyles": {}
      },
      {
        "id": "728:17892",
        "name": "Threat removal",
        "type": "TEXT",
        "characters": "Threat removal",
        "absoluteBoundingBox": {
          "x": 23751.46875,
          "y": 21792.984375,
          "width": 137,
          "height": 25
        },
        "inlineStyles": {},
        "style": {
          "fontFamily": "Inter",
          "fontPostScriptName": null,
          "fontStyle": "Extra Bold",
          "fontWeight": 800,
          "textAutoResize": "WIDTH_AND_HEIGHT",
          "fontSize": 19,
          "textAlignHorizontal": "CENTER",
          "textAlignVertical": "CENTER",
          "letterSpacing": -0.4000000059604645,
          "lineHeightPx": 25,
          "lineHeightPercent": 108.7225112915039,
          "lineHeightPercentFontSize": 131.57894897460938,
          "lineHeightUnit": "PIXELS"
        }
      },
      {
        "id": "728:17893",
        "name": "Our intelligent scan will either safely remove threats for you or provide easy-to-follow instructions.",
        "type": "TEXT",
        "characters": "Our intelligent scan will either safely remove threats for you or provide easy-to-follow instructions.",
        "absoluteBoundingBox": {
          "x": 23720.859375,
          "y": 21841.984375,
          "width": 198.4812469482422,
          "height": 96
        },
        "inlineStyles": {},
        "style": {
          "fontFamily": "Inter",
          "fontPostScriptName": null,
          "fontStyle": "Regular",
          "fontWeight": 400,
          "textAutoResize": "HEIGHT",
          "fontSize": 15,
          "textAlignHorizontal": "CENTER",
          "textAlignVertical": "CENTER",
          "letterSpacing": 0,
          "lineHeightPx": 24,
          "lineHeightPercent": 132.2065887451172,
          "lineHeightPercentFontSize": 160,
          "lineHeightUnit": "PIXELS"
        }
      }
    ],
    "inlineStyles": {}
  },
  {
    "id": "728:17894",
    "name": "div",
    "type": "FRAME",
    "absoluteBoundingBox": {
      "x": 23968,
      "y": 21696.984375,
      "width": 200,
      "height": 265
    },
    "children": [
      {
        "id": "728:17895",
        "name": "div",
        "type": "IMAGE",
        "url": "@/assets/div-728-17895.png",
        "absoluteBoundingBox": {
          "x": 24029.5,
          "y": 21696.984375,
          "width": 77,
          "height": 72
        },
        "inlineStyles": {}
      },
      {
        "id": "728:17897",
        "name": "Easy to use",
        "type": "TEXT",
        "characters": "Easy to use",
        "absoluteBoundingBox": {
          "x": 24018.921875,
          "y": 21792.984375,
          "width": 98,
          "height": 25
        },
        "inlineStyles": {},
        "style": {
          "fontFamily": "Inter",
          "fontPostScriptName": null,
          "fontStyle": "Extra Bold",
          "fontWeight": 800,
          "textAutoResize": "WIDTH_AND_HEIGHT",
          "fontSize": 18,
          "textAlignHorizontal": "CENTER",
          "textAlignVertical": "CENTER",
          "letterSpacing": -0.4000000059604645,
          "lineHeightPx": 25,
          "lineHeightPercent": 114.76264953613281,
          "lineHeightPercentFontSize": 138.88888549804688,
          "lineHeightUnit": "PIXELS"
        }
      },
      {
        "id": "728:17898",
        "name": "We create easy to use apps that can check your device for vulnerabilities in a matter of minutes.",
        "type": "TEXT",
        "characters": "We create easy to use apps that can check your device for vulnerabilities in a matter of minutes.",
        "absoluteBoundingBox": {
          "x": 23968.984375,
          "y": 21841.984375,
          "width": 198.2156219482422,
          "height": 96
        },
        "inlineStyles": {},
        "style": {
          "fontFamily": "Inter",
          "fontPostScriptName": null,
          "fontStyle": "Regular",
          "fontWeight": 400,
          "textAutoResize": "HEIGHT",
          "fontSize": 16,
          "textAlignHorizontal": "CENTER",
          "textAlignVertical": "CENTER",
          "letterSpacing": 0,
          "lineHeightPx": 24,
          "lineHeightPercent": 123.94366455078125,
          "lineHeightPercentFontSize": 150,
          "lineHeightUnit": "PIXELS"
        }
      }
    ],
    "inlineStyles": {}
  }
]

Instructions:
1. Analyze the "children" in the Figma Data. Identify those that are instances of "FeatureCard".
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
