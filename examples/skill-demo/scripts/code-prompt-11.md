[dotenv@17.2.3] injecting env (0) from .env -- tip: ⚙️  specify custom .env file path with { path: '/custom/path/.env' }
<system_instructions>
  <role>
    You are a React Architect.
    Your task is to assemble a "Frame" component that composes multiple child components based on Figma layout data.
  </role>

  <input_context>
    <frame_details>{
  "name": "CertoLandingPage",
  "purpose": "Main landing page wrapper",
  "layout": {
    "boundingBox": {
      "top": 18765,
      "left": 23100,
      "width": 1440,
      "height": 6102
    },
    "relativeBoundingBox": {
      "top": 0,
      "left": 0,
      "width": 1440,
      "height": 6102
    },
    "spacing": {
      "next": 0
    },
    "layoutDirection": "VERTICAL"
  },
  "elements": [
    {
      "id": "728:17674",
      "name": "nav:after",
      "type": "RECTANGLE",
      "scrollBehavior": "SCROLLS",
      "blendMode": "PASS_THROUGH",
      "strokeWeight": 1,
      "absoluteBoundingBox": {
        "x": 23100,
        "y": 18765,
        "width": 1440,
        "height": 102
      },
      "absoluteRenderBounds": {
        "x": 23100,
        "y": 18765,
        "width": 1440,
        "height": 102
      },
      "constraints": {
        "vertical": "TOP",
        "horizontal": "LEFT"
      },
      "interactions": [],
      "complexStrokeProperties": {
        "strokeType": "BASIC"
      },
      "inlineStyles": {
        "background": "#F3F8FF"
      }
    },
    {
      "id": "728:18045",
      "name": "div",
      "type": "FRAME",
      "scrollBehavior": "SCROLLS",
      "children": [
        {
          "id": "728:18046",
          "name": "div:before",
          "type": "RECTANGLE",
          "scrollBehavior": "SCROLLS",
          "blendMode": "PASS_THROUGH",
          "strokeWeight": 1,
          "absoluteBoundingBox": {
            "x": 23100,
            "y": 18816,
            "width": 1440,
            "height": 51
          },
          "absoluteRenderBounds": {
            "x": 23100,
            "y": 18816,
            "width": 1440,
            "height": 51
          },
          "constraints": {
            "vertical": "TOP",
            "horizontal": "LEFT"
          },
          "layoutAlign": "INHERIT",
          "layoutGrow": 0,
          "layoutPositioning": "ABSOLUTE",
          "layoutSizingHorizontal": "FIXED",
          "layoutSizingVertical": "FIXED",
          "interactions": [],
          "complexStrokeProperties": {
            "strokeType": "BASIC"
          },
          "inlineStyles": {
            "background": "linear-gradient(0deg, #E7EFFA 0%, rgba(255, 255, 255, 0.00) 100%)"
          }
        },
        {
          "id": "728:18047",
          "name": "logo.svg",
          "type": "IMAGE",
          "url": "@/assets/logo-svg-728-18047.svg",
          "absoluteBoundingBox": {
            "x": 23220,
            "y": 18789,
            "width": 157,
            "height": 54
          },
          "absoluteRenderBounds": {
            "x": 23220,
            "y": 18789,
            "width": 157,
            "height": 54
          },
          "inlineStyles": {}
        },
        {
          "id": "728:18057",
          "name": "div",
          "type": "FRAME",
          "scrollBehavior": "SCROLLS",
          "children": [
            {
              "id": "728:18058",
              "name": "ul#menu-main",
              "type": "FRAME",
              "scrollBehavior": "SCROLLS",
              "children": [
                {
                  "id": "728:18059",
                  "name": "iPhone",
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
                    "x": 23787.8125,
                    "y": 18803.5,
                    "width": 66,
                    "height": 25
                  },
                  "absoluteRenderBounds": {
                    "x": 23788.818359375,
                    "y": 18807.77734375,
                    "width": 63.482421875,
                    "height": 14.91796875
                  },
                  "constraints": {
                    "vertical": "CENTER",
                    "horizontal": "LEFT"
                  },
                  "characters": "iPhone",
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
                    "textAlignHorizontal": "LEFT",
                    "textAlignVertical": "CENTER",
                    "letterSpacing": 0,
                    "lineHeightPx": 25,
                    "lineHeightPercent": 108.7225112915039,
                    "lineHeightPercentFontSize": 131.57894897460938,
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
                  "id": "728:18060",
                  "name": "Android",
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
                    "x": 23902.125,
                    "y": 18803.5,
                    "width": 76,
                    "height": 25
                  },
                  "absoluteRenderBounds": {
                    "x": 23902.5703125,
                    "y": 18807.77734375,
                    "width": 74.142578125,
                    "height": 14.91796875
                  },
                  "constraints": {
                    "vertical": "CENTER",
                    "horizontal": "LEFT"
                  },
                  "characters": "Android",
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
                    "textAlignHorizontal": "LEFT",
                    "textAlignVertical": "CENTER",
                    "letterSpacing": 0,
                    "lineHeightPx": 25,
                    "lineHeightPercent": 108.7225112915039,
                    "lineHeightPercentFontSize": 131.57894897460938,
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
                  "id": "728:18061",
                  "name": "Help",
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
                    "x": 24027.375,
                    "y": 18803.5,
                    "width": 44,
                    "height": 25
                  },
                  "absoluteRenderBounds": {
                    "x": 24028.419921875,
                    "y": 18808.681640625,
                    "width": 41.486328125,
                    "height": 17.705078125
                  },
                  "constraints": {
                    "vertical": "CENTER",
                    "horizontal": "LEFT"
                  },
                  "characters": "Help",
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
                    "textAlignHorizontal": "LEFT",
                    "textAlignVertical": "CENTER",
                    "letterSpacing": 0,
                    "lineHeightPx": 25,
                    "lineHeightPercent": 108.7225112915039,
                    "lineHeightPercentFontSize": 131.57894897460938,
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
                  "id": "728:18062",
                  "name": "li#menu-item-212908",
                  "type": "FRAME",
                  "scrollBehavior": "SCROLLS",
                  "children": [
                    {
                      "id": "728:18063",
                      "name": "a",
                      "type": "FRAME",
                      "scrollBehavior": "SCROLLS",
                      "children": [
                        {
                          "id": "728:18064",
                          "name": "Company",
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
                            "x": 24119.9375,
                            "y": 18803.5,
                            "width": 91,
                            "height": 25
                          },
                          "absoluteRenderBounds": {
                            "x": 24120.833984375,
                            "y": 18808.4921875,
                            "width": 88.966796875,
                            "height": 17.89453125
                          },
                          "constraints": {
                            "vertical": "CENTER",
                            "horizontal": "LEFT"
                          },
                          "layoutAlign": "INHERIT",
                          "layoutGrow": 0,
                          "layoutSizingHorizontal": "HUG",
                          "layoutSizingVertical": "HUG",
                          "characters": "Company",
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
                            "textAlignHorizontal": "LEFT",
                            "textAlignVertical": "CENTER",
                            "letterSpacing": 0,
                            "lineHeightPx": 25,
                            "lineHeightPercent": 108.7225112915039,
                            "lineHeightPercentFontSize": 131.57894897460938,
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
                          "id": "728:18065",
                          "name": "a:after",
                          "type": "IMAGE",
                          "url": "@/assets/a-after-728-18065.svg",
                          "absoluteBoundingBox": {
                            "x": 24220.046875,
                            "y": 18812.5,
                            "width": 12,
                            "height": 7
                          },
                          "absoluteRenderBounds": {
                            "x": 24220.046875,
                            "y": 18812.5,
                            "width": 12,
                            "height": 7
                          },
                          "inlineStyles": {}
                        }
                      ],
                      "blendMode": "PASS_THROUGH",
                      "clipsContent": false,
                      "strokeWeight": 1,
                      "layoutMode": "HORIZONTAL",
                      "counterAxisAlignItems": "CENTER",
                      "itemSpacing": 9.109375,
                      "layoutWrap": "NO_WRAP",
                      "absoluteBoundingBox": {
                        "x": 24119.9375,
                        "y": 18803.5,
                        "width": 112.109375,
                        "height": 25
                      },
                      "absoluteRenderBounds": {
                        "x": 24119.9375,
                        "y": 18803.5,
                        "width": 112.109375,
                        "height": 25
                      },
                      "constraints": {
                        "vertical": "CENTER",
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
                  "clipsContent": false,
                  "strokeWeight": 1,
                  "layoutMode": "HORIZONTAL",
                  "paddingTop": 14.5,
                  "paddingBottom": 14.5,
                  "layoutWrap": "NO_WRAP",
                  "absoluteBoundingBox": {
                    "x": 24119.9375,
                    "y": 18789,
                    "width": 112.109375,
                    "height": 54
                  },
                  "absoluteRenderBounds": {
                    "x": 24119.9375,
                    "y": 18789,
                    "width": 112.109375,
                    "height": 54
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
                  "inlineStyles": {}
                }
              ],
              "blendMode": "PASS_THROUGH",
              "clipsContent": false,
              "strokeWeight": 1,
              "absoluteBoundingBox": {
                "x": 23787.8125,
                "y": 18789,
                "width": 492.234375,
                "height": 54
              },
              "absoluteRenderBounds": {
                "x": 23787.8125,
                "y": 18789,
                "width": 492.234375,
                "height": 54
              },
              "constraints": {
                "vertical": "TOP_BOTTOM",
                "horizontal": "LEFT"
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
            },
            {
              "id": "728:18068",
              "name": "a",
              "type": "FRAME",
              "scrollBehavior": "SCROLLS",
              "children": [
                {
                  "id": "728:18069",
                  "name": "Sign in",
                  "type": "TEXT",
                  "scrollBehavior": "SCROLLS",
                  "blendMode": "PASS_THROUGH",
                  "fills": [
                    {
                      "blendMode": "NORMAL",
                      "type": "SOLID",
                      "color": {
                        "r": 1,
                        "g": 1,
                        "b": 1,
                        "a": 1
                      }
                    }
                  ],
                  "strokes": [],
                  "strokeWeight": 1,
                  "strokeAlign": "OUTSIDE",
                  "absoluteBoundingBox": {
                    "x": 24348.046875,
                    "y": 18807,
                    "width": 51,
                    "height": 18
                  },
                  "absoluteRenderBounds": {
                    "x": 24348.55859375,
                    "y": 18809.376953125,
                    "width": 48.994140625,
                    "height": 14.861328125
                  },
                  "constraints": {
                    "vertical": "TOP",
                    "horizontal": "LEFT"
                  },
                  "layoutAlign": "INHERIT",
                  "layoutGrow": 0,
                  "layoutSizingHorizontal": "HUG",
                  "layoutSizingVertical": "HUG",
                  "characters": "Sign in",
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
                    "fontSize": 15,
                    "textAlignHorizontal": "LEFT",
                    "textAlignVertical": "CENTER",
                    "letterSpacing": 0,
                    "lineHeightPx": 18,
                    "lineHeightPercent": 99.15493774414062,
                    "lineHeightPercentFontSize": 120,
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
              "cornerSmoothing": 0,
              "strokeWeight": 1,
              "layoutMode": "HORIZONTAL",
              "paddingLeft": 20,
              "paddingRight": 20.953125,
              "paddingTop": 16,
              "paddingBottom": 16,
              "layoutWrap": "NO_WRAP",
              "absoluteBoundingBox": {
                "x": 24328.046875,
                "y": 18791,
                "width": 91.953125,
                "height": 50
              },
              "absoluteRenderBounds": {
                "x": 24328.046875,
                "y": 18791,
                "width": 91.953125,
                "height": 50
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
                "borderRadius": "42px",
                "background": "#4335DE",
                "overflow": "hidden"
              }
            }
          ],
          "blendMode": "PASS_THROUGH",
          "clipsContent": false,
          "strokeWeight": 1,
          "layoutMode": "HORIZONTAL",
          "counterAxisAlignItems": "CENTER",
          "itemSpacing": 48,
          "layoutWrap": "NO_WRAP",
          "absoluteBoundingBox": {
            "x": 23787.8125,
            "y": 18789,
            "width": 632.1875,
            "height": 54
          },
          "absoluteRenderBounds": {
            "x": 23787.8125,
            "y": 18789,
            "width": 632.1875,
            "height": 54
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
      "clipsContent": false,
      "strokeWeight": 1,
      "layoutMode": "HORIZONTAL",
      "paddingLeft": 120,
      "paddingRight": 120,
      "paddingTop": 24,
      "paddingBottom": 24,
      "itemSpacing": 410.8125,
      "layoutWrap": "NO_WRAP",
      "absoluteBoundingBox": {
        "x": 23100,
        "y": 18765,
        "width": 1440,
        "height": 102
      },
      "absoluteRenderBounds": {
        "x": 23100,
        "y": 18765,
        "width": 1440,
        "height": 102
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
        "background": "#F3F8FF"
      }
    }
  ],
  "kebabName": "certo-landing-page",
  "path": "@/components"
}</frame_details>
    <children>[
  {
    "name": "Header",
    "path": "@/components/header"
  },
  {
    "name": "HeroSection",
    "path": "@/components/hero-section"
  },
  {
    "name": "TrustSection",
    "path": "@/components/trust-section"
  },
  {
    "name": "PhilosophySection",
    "path": "@/components/philosophy-section"
  },
  {
    "name": "FeaturesGrid",
    "path": "@/components/features-grid"
  },
  {
    "name": "ResourcesSection",
    "path": "@/components/resources-section"
  },
  {
    "name": "SpyingCTA",
    "path": "@/components/spying-cta"
  },
  {
    "name": "LatestInsights",
    "path": "@/components/latest-insights"
  },
  {
    "name": "Footer",
    "path": "@/components/footer"
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

      - **Independent Components (No Props) - CRITICAL**:
        - If a child has NO `componentName` and NO `properties`, render as `<ComponentName />` without any props.
        - These components use default values or hardcoded content internally.
      
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
