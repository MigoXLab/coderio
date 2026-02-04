[dotenv@17.2.3] injecting env (0) from .env -- tip: 🔑 add access controls to secrets: https://dotenvx.com/ops
<system_instructions>
  <role>
    You are a React Architect.
    Your task is to assemble a "Frame" component that composes multiple child components based on Figma layout data.
  </role>

  <input_context>
    <frame_details>{
  "name": "LatestInsights",
  "purpose": "Recent blog posts and articles",
  "layout": {
    "boundingBox": {
      "top": 23116,
      "left": 23100,
      "width": 1440,
      "height": 976
    },
    "relativeBoundingBox": {
      "top": 4351,
      "left": 0,
      "width": 1440,
      "height": 976
    },
    "spacing": {
      "next": 0
    },
    "layoutDirection": "HORIZONTAL"
  },
  "elements": [
    {
      "id": "728:17945",
      "name": "aside",
      "type": "FRAME",
      "scrollBehavior": "SCROLLS",
      "children": [
        {
          "id": "728:17946",
          "name": "div",
          "type": "FRAME",
          "scrollBehavior": "SCROLLS",
          "children": [
            {
              "id": "728:17947",
              "name": "h2",
              "type": "FRAME",
              "scrollBehavior": "SCROLLS",
              "children": [
                {
                  "id": "728:17948",
                  "name": "Latest insights",
                  "type": "TEXT",
                  "scrollBehavior": "SCROLLS",
                  "blendMode": "PASS_THROUGH",
                  "fills": [
                    {
                      "blendMode": "NORMAL",
                      "type": "SOLID",
                      "color": {
                        "r": 0.007843137718737125,
                        "g": 0.0117647061124444,
                        "b": 0.23137255012989044,
                        "a": 1
                      }
                    }
                  ],
                  "strokes": [],
                  "strokeWeight": 1,
                  "strokeAlign": "OUTSIDE",
                  "absoluteBoundingBox": {
                    "x": 23622.078125,
                    "y": 23199.984375,
                    "width": 396,
                    "height": 75
                  },
                  "absoluteRenderBounds": {
                    "x": 23625.634765625,
                    "y": 23214.591796875,
                    "width": 390.263671875,
                    "height": 55.484375
                  },
                  "constraints": {
                    "vertical": "TOP",
                    "horizontal": "CENTER"
                  },
                  "layoutAlign": "INHERIT",
                  "layoutGrow": 0,
                  "layoutSizingHorizontal": "HUG",
                  "layoutSizingVertical": "HUG",
                  "characters": "Latest insights",
                  "characterStyleOverrides": [],
                  "styleOverrideTable": {},
                  "lineTypes": [
                    "NONE"
                  ],
                  "lineIndentations": [
                    0
                  ],
                  "style": {
                    "fontFamily": "Inter",
                    "fontPostScriptName": null,
                    "fontStyle": "Extra Bold",
                    "fontWeight": 800,
                    "textAutoResize": "WIDTH_AND_HEIGHT",
                    "fontSize": 56,
                    "textAlignHorizontal": "CENTER",
                    "textAlignVertical": "CENTER",
                    "letterSpacing": -1.2000000476837158,
                    "lineHeightPx": 75,
                    "lineHeightPercent": 110.66398620605469,
                    "lineHeightPercentFontSize": 133.92857360839844,
                    "lineHeightUnit": "PIXELS"
                  },
                  "layoutVersion": 3,
                  "effects": [],
                  "interactions": [],
                  "complexStrokeProperties": {
                    "strokeType": "BASIC"
                  },
                  "inlineStyles": {}
                }
              ],
              "blendMode": "PASS_THROUGH",
              "clipsContent": true,
              "strokeWeight": 1,
              "layoutMode": "HORIZONTAL",
              "paddingLeft": 330.078125,
              "paddingRight": 329.921875,
              "layoutWrap": "NO_WRAP",
              "absoluteBoundingBox": {
                "x": 23292,
                "y": 23199.984375,
                "width": 1056,
                "height": 75
              },
              "absoluteRenderBounds": {
                "x": 23292,
                "y": 23199.984375,
                "width": 1056,
                "height": 75
              },
              "constraints": {
                "vertical": "TOP",
                "horizontal": "LEFT"
              },
              "layoutSizingHorizontal": "HUG",
              "layoutSizingVertical": "HUG",
              "interactions": [],
              "complexStrokeProperties": {
                "strokeType": "BASIC"
              },
              "inlineStyles": {
                "overflow": "hidden"
              }
            },
            {
              "id": "728:17949",
              "name": "div",
              "type": "FRAME",
              "scrollBehavior": "SCROLLS",
              "children": [
                {
                  "id": "728:17950",
                  "name": "a",
                  "type": "FRAME",
                  "scrollBehavior": "SCROLLS",
                  "children": [
                    {
                      "id": "728:17951",
                      "name": "span",
                      "type": "FRAME",
                      "scrollBehavior": "SCROLLS",
                      "children": [
                        {
                          "id": "728:17952",
                          "name": "View all insights",
                          "type": "TEXT",
                          "scrollBehavior": "SCROLLS",
                          "blendMode": "PASS_THROUGH",
                          "fills": [
                            {
                              "blendMode": "NORMAL",
                              "type": "SOLID",
                              "color": {
                                "r": 0.007843137718737125,
                                "g": 0.0117647061124444,
                                "b": 0.23137255012989044,
                                "a": 1
                              }
                            }
                          ],
                          "strokes": [],
                          "strokeWeight": 1,
                          "strokeAlign": "OUTSIDE",
                          "absoluteBoundingBox": {
                            "x": 23714.96875,
                            "y": 23968.984375,
                            "width": 155,
                            "height": 23
                          },
                          "absoluteRenderBounds": {
                            "x": 23715.791015625,
                            "y": 23972.26171875,
                            "width": 153.22265625,
                            "height": 18.82421875
                          },
                          "constraints": {
                            "vertical": "TOP",
                            "horizontal": "CENTER"
                          },
                          "layoutAlign": "INHERIT",
                          "layoutGrow": 0,
                          "layoutSizingHorizontal": "HUG",
                          "layoutSizingVertical": "HUG",
                          "characters": "View all insights",
                          "characterStyleOverrides": [],
                          "styleOverrideTable": {},
                          "lineTypes": [
                            "NONE"
                          ],
                          "lineIndentations": [
                            0
                          ],
                          "style": {
                            "fontFamily": "Inter",
                            "fontPostScriptName": null,
                            "fontStyle": "Extra Bold",
                            "fontWeight": 800,
                            "textAutoResize": "WIDTH_AND_HEIGHT",
                            "fontSize": 19,
                            "textAlignHorizontal": "CENTER",
                            "textAlignVertical": "CENTER",
                            "letterSpacing": 0,
                            "lineHeightPx": 22.5,
                            "lineHeightPercent": 97.85026550292969,
                            "lineHeightPercentFontSize": 118.42105102539062,
                            "lineHeightUnit": "PIXELS"
                          },
                          "layoutVersion": 3,
                          "effects": [],
                          "interactions": [],
                          "complexStrokeProperties": {
                            "strokeType": "BASIC"
                          },
                          "inlineStyles": {}
                        },
                        {
                          "id": "728:17953",
                          "name": "span:after",
                          "type": "IMAGE",
                          "url": "@/assets/span-after-728-17953.svg",
                          "absoluteBoundingBox": {
                            "x": 23881.03125,
                            "y": 23973.234375,
                            "width": 20,
                            "height": 14
                          },
                          "absoluteRenderBounds": {
                            "x": 23881.03125,
                            "y": 23973.234375,
                            "width": 20,
                            "height": 14
                          },
                          "inlineStyles": {}
                        }
                      ],
                      "blendMode": "PASS_THROUGH",
                      "clipsContent": false,
                      "strokeWeight": 1,
                      "layoutMode": "HORIZONTAL",
                      "layoutWrap": "NO_WRAP",
                      "absoluteBoundingBox": {
                        "x": 23714.96875,
                        "y": 23968.984375,
                        "width": 155,
                        "height": 23
                      },
                      "absoluteRenderBounds": {
                        "x": 23714.96875,
                        "y": 23968.984375,
                        "width": 186.0625,
                        "height": 23
                      },
                      "constraints": {
                        "vertical": "TOP",
                        "horizontal": "LEFT"
                      },
                      "layoutAlign": "INHERIT",
                      "layoutGrow": 0,
                      "layoutSizingHorizontal": "HUG",
                      "layoutSizingVertical": "HUG",
                      "interactions": [],
                      "complexStrokeProperties": {
                        "strokeType": "BASIC"
                      },
                      "inlineStyles": {}
                    }
                  ],
                  "blendMode": "PASS_THROUGH",
                  "clipsContent": true,
                  "cornerSmoothing": 0,
                  "strokeWeight": 1,
                  "layoutMode": "HORIZONTAL",
                  "paddingLeft": 20,
                  "paddingRight": 51.0625,
                  "paddingTop": 16,
                  "paddingBottom": 15.5,
                  "layoutWrap": "NO_WRAP",
                  "absoluteBoundingBox": {
                    "x": 23694.96875,
                    "y": 23952.984375,
                    "width": 226.0625,
                    "height": 54.5
                  },
                  "absoluteRenderBounds": {
                    "x": 23694.96875,
                    "y": 23952.984375,
                    "width": 226.0625,
                    "height": 54.5
                  },
                  "constraints": {
                    "vertical": "TOP",
                    "horizontal": "CENTER"
                  },
                  "layoutAlign": "INHERIT",
                  "layoutGrow": 0,
                  "layoutSizingHorizontal": "HUG",
                  "layoutSizingVertical": "HUG",
                  "interactions": [],
                  "complexStrokeProperties": {
                    "strokeType": "BASIC"
                  },
                  "inlineStyles": {
                    "borderRadius": "42px",
                    "background": "#FFC247",
                    "overflow": "hidden"
                  }
                }
              ],
              "blendMode": "PASS_THROUGH",
              "clipsContent": true,
              "strokeWeight": 1,
              "layoutMode": "HORIZONTAL",
              "paddingLeft": 417.96875,
              "paddingRight": 441.96875,
              "layoutWrap": "NO_WRAP",
              "absoluteBoundingBox": {
                "x": 23277,
                "y": 23952.984375,
                "width": 1086,
                "height": 54.5
              },
              "absoluteRenderBounds": {
                "x": 23277,
                "y": 23952.984375,
                "width": 1086,
                "height": 54.5
              },
              "constraints": {
                "vertical": "TOP",
                "horizontal": "LEFT"
              },
              "layoutSizingHorizontal": "HUG",
              "layoutSizingVertical": "HUG",
              "interactions": [],
              "complexStrokeProperties": {
                "strokeType": "BASIC"
              },
              "inlineStyles": {
                "overflow": "hidden"
              }
            },
            {
              "id": "728:17956",
              "name": "div",
              "type": "FRAME",
              "scrollBehavior": "SCROLLS",
              "children": [
                {
                  "id": "728:17957",
                  "name": "div",
                  "type": "FRAME",
                  "scrollBehavior": "SCROLLS",
                  "children": [
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
                      "absoluteRenderBounds": {
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
                      "absoluteRenderBounds": {
                        "x": 24028,
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
                      "absoluteRenderBounds": {
                        "x": 23660,
                        "y": 23346.984375,
                        "width": 320,
                        "height": 534
                      },
                      "inlineStyles": {
                        "borderRadius": "48px"
                      }
                    }
                  ],
                  "blendMode": "PASS_THROUGH",
                  "clipsContent": false,
                  "strokeWeight": 1,
                  "absoluteBoundingBox": {
                    "x": 23292,
                    "y": 23346.984375,
                    "width": 1056,
                    "height": 534
                  },
                  "absoluteRenderBounds": {
                    "x": 23292,
                    "y": 23346.984375,
                    "width": 1056,
                    "height": 534
                  },
                  "constraints": {
                    "vertical": "TOP_BOTTOM",
                    "horizontal": "LEFT_RIGHT"
                  },
                  "layoutAlign": "INHERIT",
                  "layoutGrow": 0,
                  "layoutSizingHorizontal": "FIXED",
                  "layoutSizingVertical": "FIXED",
                  "interactions": [],
                  "complexStrokeProperties": {
                    "strokeType": "BASIC"
                  },
                  "inlineStyles": {}
                }
              ],
              "blendMode": "PASS_THROUGH",
              "clipsContent": false,
              "strokeWeight": 1,
              "layoutMode": "HORIZONTAL",
              "layoutWrap": "NO_WRAP",
              "absoluteBoundingBox": {
                "x": 23292,
                "y": 23346.984375,
                "width": 1056,
                "height": 534
              },
              "absoluteRenderBounds": {
                "x": 23292,
                "y": 23346.984375,
                "width": 1056,
                "height": 534
              },
              "constraints": {
                "vertical": "TOP",
                "horizontal": "CENTER"
              },
              "layoutSizingHorizontal": "HUG",
              "layoutSizingVertical": "HUG",
              "interactions": [],
              "complexStrokeProperties": {
                "strokeType": "BASIC"
              },
              "inlineStyles": {}
            }
          ],
          "blendMode": "PASS_THROUGH",
          "clipsContent": false,
          "strokeWeight": 1,
          "absoluteBoundingBox": {
            "x": 23292,
            "y": 23199.984375,
            "width": 1056,
            "height": 807.5
          },
          "absoluteRenderBounds": {
            "x": 23277,
            "y": 23199.984375,
            "width": 1086,
            "height": 807.5
          },
          "constraints": {
            "vertical": "TOP",
            "horizontal": "CENTER"
          },
          "layoutAlign": "INHERIT",
          "layoutGrow": 0,
          "layoutSizingHorizontal": "FIXED",
          "layoutSizingVertical": "FIXED",
          "interactions": [],
          "complexStrokeProperties": {
            "strokeType": "BASIC"
          },
          "inlineStyles": {}
        }
      ],
      "blendMode": "PASS_THROUGH",
      "clipsContent": true,
      "strokeWeight": 1,
      "layoutMode": "HORIZONTAL",
      "paddingLeft": 192,
      "paddingRight": 192,
      "paddingTop": 84,
      "paddingBottom": 84,
      "layoutWrap": "NO_WRAP",
      "absoluteBoundingBox": {
        "x": 23100,
        "y": 23115.984375,
        "width": 1440,
        "height": 975.5
      },
      "absoluteRenderBounds": {
        "x": 23100,
        "y": 23115.984375,
        "width": 1440,
        "height": 975.5
      },
      "constraints": {
        "vertical": "TOP",
        "horizontal": "LEFT"
      },
      "layoutAlign": "INHERIT",
      "layoutGrow": 0,
      "layoutSizingHorizontal": "HUG",
      "layoutSizingVertical": "HUG",
      "interactions": [],
      "complexStrokeProperties": {
        "strokeType": "BASIC"
      },
      "inlineStyles": {
        "background": "#F3F8FF",
        "overflow": "hidden"
      }
    }
  ],
  "kebabName": "latest-insights",
  "path": "@/components/latest-insights",
  "states": [
    {
      "state": [
        {
          "imageSrc": "@/assets/InsightCard-image-1.png",
          "tag": "Guides",
          "title": "The 6 Best Apps to Track Your Children (And Why)",
          "date": "August 20, 2024",
          "description": "These are the top apps for tracking your children. We also discuss why you should, or shouldn't track your kids."
        },
        {
          "imageSrc": "@/assets/InsightCard-image-2.png",
          "tag": "Expertise",
          "title": "How to Hack a Phone: It’s Easier Than You Think",
          "date": "August 20, 2024",
          "description": "Phone hacking is a real threat and it can happen to anyone. Here's how it works and how to protect yourself."
        },
        {
          "imageSrc": "@/assets/InsightCard-image-3.png",
          "tag": "Guides",
          "title": "5 Ways to Find Hidden Spy Apps on Your Phone",
          "date": "August 20, 2024",
          "description": "Think someone is spying on you? Here are 5 simple ways to find hidden spy apps on your iPhone or Android."
        }
      ],
      "componentName": "InsightCard",
      "componentPath": "@/components/insight-card"
    }
  ]
}</frame_details>
    <children>[
  {
    "name": "InsightCard",
    "path": "@/components/insight-card"
  }
]</children>
    <styling>{"approach":"Tailwind V4 and Less","libraries":[{"name":"Tailwind V4","role":"utility_first"},{"name":"Less","role":"css_preprocessor"}]}</styling>
    <available_assets>Available asset files: a-728-17958.png, a-728-17965.png, a-728-17972.png, a-after-728-18065.svg, bg-circle-svg-728-17676.svg, div-728-17679.png, div-728-17706.svg, div-728-17780.svg, div-728-17799.svg, div-728-17818.svg, div-728-17837.svg, div-728-17860.png, div-728-17870.png, div-728-17875.png, div-728-17880.png, div-728-17885.png, div-728-17890.png, div-728-17895.png, figure-728-17698.png, form-newsletter-signup-footer-form-before-728-18030.svg, logo-svg-728-18047.svg, span-728-18004.svg, span-728-18009.svg, span-728-18014.svg, span-728-18019.svg, span-728-18024.svg, span-after-728-17693.svg, span-after-728-17855.svg, span-after-728-17903.svg, span-after-728-17919.svg, span-after-728-17940.svg, span-after-728-17953.svg, ul-728-17983.svg</available_assets>

    <frame_structure>
      The `frame_details` parameter contains:
      - `layout`: Layout information for the frame (flex/grid/absolute)
      - `elements`: Array of CSS styles and asset URLs for all elements in this component (colors, spacing, fonts, backgrounds, etc.)
      - `states` (optional): If present, this frame contains reusable components. Each state entry includes:
        * `state`: Array of data objects to be used as props for component instances
        * `componentName`: Name of the reusable component
        * `componentPath`: Import path for the component
        Use `states` data to render multiple instances of reusable components via `.map()`.
    </frame_structure>
  </input_context>

  <requirements>
    <req_1>
      **Children Components & Props (CRITICAL)**:
      - The `<children>` field describes child components with their import paths and prop types.

      - **List Rendering (States-based)**:
        - Check if `<frame_details>` contains a `states` property (array).
        - Each state entry has: `state` (data array), `componentName`, `componentPath`.
        - Implementation:
          ```tsx
          import ComponentName from 'path';
          
          {states[0].state.map((item, index) => (
            <ComponentName key={index} {...item} />
          ))}
          ```
        - **CRITICAL - Only Use State Data**:
          - **ONLY** pass props that exist in the state data objects.
          - **DO NOT** add extra props like `content`, `className`, or any other fields not present in state.
          - **DO NOT** create or invent additional data - use exactly what's in the state array.
          - Example: If state has `{iconSrc, title, description}`, only pass those three props.
        - **Asset Imports**: If state data contains image paths (e.g., `imageSrc`, `iconSrc`), 
          import them at the top and pass as values.
      
      - **Component Imports (CRITICAL)**:
        - You MUST use the exact import path provided in the `<children>` list for each component.
        - **Example**:
          - Provided: `{"name": "TaskGrid", "path": "@/components/tasks-section/task-grid"}`
          - CORRECT: `import TaskGrid from "@/components/tasks-section/task-grid";`
          - WRONG: `import TaskGrid from "@/components/task-grid";` (Do NOT do this!)
    </req_1>
    
    <req_2>
      **Layout & Styling**:
      - Use `layout_data` for dimensions, spacing, and flow (flex/grid).

      - **Style Consistency**: Implement styles using the technical stack and libraries listed in <styling>.
      - **Strict Restriction**: Absolutely ONLY use the technical stack and libraries listed in <styling>. Do NOT use any other styling methods, libraries, or frameworks (e.g., if clsx is not listed, do not use clsx).
      - **Default Styling**: If <styling> is empty or does not contain specific libraries, DEFAULT to standard vanilla CSS.
      
      - **Tailwind CSS + CSS Modules (CRITICAL)**:
        - If the stack includes BOTH Tailwind and CSS Modules (Less/SCSS), use them correctly:
          1. **Tailwind utilities**: Use DIRECTLY in JSX className (e.g., `className="flex items-center gap-4"`)
          2. **CSS Modules**: Use ONLY for complex styles that can't be expressed with Tailwind utilities (e.g., gradients, animations, pseudo-elements)
          3. **NEVER use `@apply` in CSS Module files** - it's a Tailwind-specific directive that doesn't work in Less/SCSS
          4. Example correct usage:
             TSX: `<div className={`flex ${styles.customGradient}`}>`
             Less: `.customGradient { background: linear-gradient(...); }`
      
      - **CSS Modules Only**: If the tech stack specifies CSS Modules without Tailwind:
        1. Create a corresponding style file (e.g., `index.module.less`, `index.module.scss`, or `index.module.css`)
        2. Import it as `import styles from './index.module.[ext]';` in the TSX
        3. Define all styles in the style file using standard CSS/Less/SCSS syntax
        4. Use `styles.className` in JSX
      - Use responsive utilities provided by the chosen libraries to ensure the component is adaptive.
      - Use `css_context` for exact background styles, gradients, and shadows.
      - Use `relative` positioning for the container.
      - Use `spacing` field in <frame_details> to set the spacing between elements
    </req_2>
    
    <req_3>
      **Images & Assets**:

      - **CRITICAL**: For any image URL starting with `@/assets`, you MUST import it at the top of the file.
      - **Asset Name Matching**: 
        - Check the `<available_assets>` list for actual filenames in the project.
        - Asset filenames follow the pattern: `kebab-case-name-id1-id2.ext` (e.g., "Star 2.svg" → "star-2-1-2861.svg")
        - Match the base name (ignoring spaces, case, and ID suffix): "@/assets/arXiv.svg" → look for "arxiv-*.svg" in the list
        - Use the EXACT filename from the available assets list in your import.
      - Example: If available_assets contains "arxiv-1-2956.svg", use:
        `import ArXivIcon from '@/assets/arxiv-1-2956.svg';`
      - **Usage**: `<img src={ArXivIcon} />`, do not use backgroundImage property.
      - **NEVER** use the string path directly in JSX or styles.
    </req_3>
    
    <req_4>
      **DOM IDs**:

      - Assign `id` attributes to the main container and any internal elements, matching `frame_details`.
    </req_4>
    
    <req_5>
      **React Import**:

      - Do **NOT** include `import React from 'react';` at the top of the file.
    </req_5>
    
    <req_6>
      **File Naming**:

      - ALWAYS name the main component file `index.tsx`.
      - ALWAYS name the style file (if applicable) `index.module.[css|less|scss]`.
      - NEVER use PascalCase or other names for filenames (e.g., DO NOT use `MainFrame.tsx` or `Button.tsx`).
    </req_6>
  </requirements>


  <output_format>
    If only one file (TSX) is needed:
    ```tsx
    // code...
    ```

    If multiple files are needed (e.g., TSX + Styles):
    ## index.tsx
    ```tsx
    // code...
    ```

    ## index.module.[css|less|scss]
    ```[css|less|scss]
    // styles...
    ```
  </output_format>
</system_instructions>

<asset_imports_instruction>
The 'states' data contains references to assets (e.g. "@/assets/foo.png").
You MUST:
1. Import these assets at the top of the file: `import image_foo from '@/assets/foo.png';`
2. In the `states` array in your code, use the variable `image_foo` instead of the string.
   Example: `imageSrc: image_foo` (NOT `imageSrc: "@/assets/foo.png"`)
</asset_imports_instruction>
