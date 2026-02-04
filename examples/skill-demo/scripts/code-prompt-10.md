[dotenv@17.2.3] injecting env (0) from .env -- tip: ⚙️  enable debug logging with { debug: true }
<system_instructions>
  <role>
    You are a Pixel-Perfect React Frontend Engineer.
    Your goal is to implement a specific UI component from Figma design data with 100% visual fidelity while ensuring header scroll to sections on click.
  </role>

  <input_context>
    <component_details>{
  "name": "Footer",
  "purpose": "Site footer with links and copyright",
  "layout": {
    "boundingBox": {
      "top": 24091,
      "left": 23100,
      "width": 1440,
      "height": 776
    },
    "relativeBoundingBox": {
      "top": 5326,
      "left": 0,
      "width": 1440,
      "height": 776
    },
    "spacing": {
      "next": 0
    },
    "layoutDirection": "VERTICAL"
  },
  "elements": [
    {
      "id": "728:17979",
      "name": "footer",
      "type": "FRAME",
      "scrollBehavior": "SCROLLS",
      "children": [
        {
          "id": "728:17980",
          "name": "div",
          "type": "FRAME",
          "scrollBehavior": "SCROLLS",
          "children": [
            {
              "id": "728:17981",
              "name": "div",
              "type": "FRAME",
              "scrollBehavior": "SCROLLS",
              "children": [
                {
                  "id": "728:17982",
                  "name": "Scan. Detect. Remove.",
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
                    "x": 23292,
                    "y": 24186.484375,
                    "width": 254,
                    "height": 30
                  },
                  "absoluteRenderBounds": {
                    "x": 23292.783203125,
                    "y": 24192.529296875,
                    "width": 251.068359375,
                    "height": 17.19921875
                  },
                  "constraints": {
                    "vertical": "TOP",
                    "horizontal": "LEFT"
                  },
                  "characters": "Scan. Detect. Remove.",
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
                    "fontSize": 23,
                    "textAlignHorizontal": "LEFT",
                    "textAlignVertical": "CENTER",
                    "letterSpacing": 0,
                    "lineHeightPx": 30,
                    "lineHeightPercent": 107.77710723876953,
                    "lineHeightPercentFontSize": 130.43478393554688,
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
                  "id": "728:17983",
                  "name": "ul",
                  "type": "IMAGE",
                  "url": "@/assets/ul-728-17983.svg",
                  "absoluteBoundingBox": {
                    "x": 23292,
                    "y": 24265.484375,
                    "width": 348,
                    "height": 72
                  },
                  "absoluteRenderBounds": {
                    "x": 23292,
                    "y": 24265.484375,
                    "width": 348,
                    "height": 72
                  },
                  "inlineStyles": {}
                },
                {
                  "id": "728:17993",
                  "name": "ul#menu-secondary-menu-1",
                  "type": "FRAME",
                  "scrollBehavior": "SCROLLS",
                  "children": [
                    {
                      "id": "728:17994",
                      "name": "Privacy Policy",
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
                        "x": 23292,
                        "y": 24353.484375,
                        "width": 73,
                        "height": 15
                      },
                      "absoluteRenderBounds": {
                        "x": 23292,
                        "y": 24357.234375,
                        "width": 72.15625,
                        "height": 11.1875
                      },
                      "constraints": {
                        "vertical": "TOP",
                        "horizontal": "LEFT"
                      },
                      "layoutAlign": "INHERIT",
                      "layoutGrow": 0,
                      "layoutSizingHorizontal": "HUG",
                      "layoutSizingVertical": "HUG",
                      "characters": "Privacy Policy",
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
                        "fontStyle": "Regular",
                        "fontWeight": 400,
                        "textAutoResize": "WIDTH_AND_HEIGHT",
                        "textDecoration": "UNDERLINE",
                        "fontSize": 11,
                        "textAlignHorizontal": "LEFT",
                        "textAlignVertical": "CENTER",
                        "letterSpacing": 0,
                        "lineHeightPx": 15,
                        "lineHeightPercent": 112.67606353759766,
                        "lineHeightPercentFontSize": 136.36363220214844,
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
                      "id": "728:17995",
                      "name": "Terms of Service",
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
                        "x": 23390.5625,
                        "y": 24353.484375,
                        "width": 88,
                        "height": 15
                      },
                      "absoluteRenderBounds": {
                        "x": 23390.5625,
                        "y": 24357.109375,
                        "width": 87.681640625,
                        "height": 11.3125
                      },
                      "constraints": {
                        "vertical": "TOP",
                        "horizontal": "LEFT"
                      },
                      "layoutAlign": "INHERIT",
                      "layoutGrow": 0,
                      "layoutSizingHorizontal": "HUG",
                      "layoutSizingVertical": "HUG",
                      "characters": "Terms of Service",
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
                        "fontStyle": "Regular",
                        "fontWeight": 400,
                        "textAutoResize": "WIDTH_AND_HEIGHT",
                        "textDecoration": "UNDERLINE",
                        "fontSize": 11,
                        "textAlignHorizontal": "LEFT",
                        "textAlignVertical": "CENTER",
                        "letterSpacing": 0,
                        "lineHeightPx": 15,
                        "lineHeightPercent": 112.67606353759766,
                        "lineHeightPercentFontSize": 136.36363220214844,
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
                  "clipsContent": false,
                  "strokeWeight": 1,
                  "layoutMode": "HORIZONTAL",
                  "paddingRight": 149.4375,
                  "paddingTop": 4,
                  "paddingBottom": 13,
                  "itemSpacing": 25.5625,
                  "layoutWrap": "NO_WRAP",
                  "absoluteBoundingBox": {
                    "x": 23292,
                    "y": 24349.484375,
                    "width": 336,
                    "height": 32
                  },
                  "absoluteRenderBounds": {
                    "x": 23292,
                    "y": 24349.484375,
                    "width": 336,
                    "height": 32
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
                "x": 23292,
                "y": 24187.484375,
                "width": 312,
                "height": 182
              },
              "absoluteRenderBounds": {
                "x": 23292,
                "y": 24187.484375,
                "width": 348,
                "height": 194
              },
              "constraints": {
                "vertical": "TOP",
                "horizontal": "LEFT"
              },
              "interactions": [],
              "complexStrokeProperties": {
                "strokeType": "BASIC"
              },
              "inlineStyles": {}
            },
            {
              "id": "728:17996",
              "name": "div",
              "type": "FRAME",
              "scrollBehavior": "SCROLLS",
              "children": [
                {
                  "id": "728:17997",
                  "name": "Copyright © 2022 Certo Software Limited | Registered in England & Wales No. 10072356",
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
                    "x": 23292,
                    "y": 24417.484375,
                    "width": 306.05938720703125,
                    "height": 30
                  },
                  "absoluteRenderBounds": {
                    "x": 23292.65625,
                    "y": 24418.90625,
                    "width": 294.30078125,
                    "height": 27.953125
                  },
                  "constraints": {
                    "vertical": "TOP",
                    "horizontal": "LEFT"
                  },
                  "layoutAlign": "INHERIT",
                  "layoutGrow": 0,
                  "layoutSizingHorizontal": "FIXED",
                  "layoutSizingVertical": "HUG",
                  "characters": "Copyright © 2022 Certo Software Limited | Registered in England & Wales No. 10072356",
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
                    "fontStyle": "Regular",
                    "fontWeight": 400,
                    "textAutoResize": "HEIGHT",
                    "fontSize": 11,
                    "textAlignHorizontal": "LEFT",
                    "textAlignVertical": "CENTER",
                    "letterSpacing": 0,
                    "lineHeightPx": 15,
                    "lineHeightPercent": 112.67606353759766,
                    "lineHeightPercentFontSize": 136.36363220214844,
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
                  "id": "728:17998",
                  "name": "Designed & developed by Bigger Picture",
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
                    "x": 23292,
                    "y": 24465.484375,
                    "width": 209,
                    "height": 15
                  },
                  "absoluteRenderBounds": {
                    "x": 23292.96875,
                    "y": 24469.234375,
                    "width": 207.896484375,
                    "height": 11.1875
                  },
                  "constraints": {
                    "vertical": "TOP",
                    "horizontal": "LEFT"
                  },
                  "layoutAlign": "INHERIT",
                  "layoutGrow": 0,
                  "layoutSizingHorizontal": "HUG",
                  "layoutSizingVertical": "HUG",
                  "characters": "Designed & developed by Bigger Picture",
                  "characterStyleOverrides": [
                    3,
                    3,
                    3,
                    3,
                    3,
                    3,
                    3,
                    3,
                    3,
                    3,
                    3,
                    3,
                    3,
                    3,
                    3,
                    3,
                    3,
                    3,
                    3,
                    3,
                    3,
                    3,
                    3,
                    3,
                    2,
                    2,
                    2,
                    2,
                    2,
                    2,
                    2,
                    2,
                    2,
                    2,
                    2,
                    2,
                    2,
                    2
                  ],
                  "styleOverrideTable": {
                    "2": {
                      "textDecoration": "UNDERLINE",
                      "fontSize": 11
                    },
                    "3": {
                      "fontSize": 11
                    }
                  },
                  "lineTypes": [
                    "NONE"
                  ],
                  "lineIndentations": [
                    0
                  ],
                  "style": {
                    "fontFamily": "Inter",
                    "fontPostScriptName": null,
                    "fontStyle": "Regular",
                    "fontWeight": 400,
                    "textAutoResize": "WIDTH_AND_HEIGHT",
                    "fontSize": 11,
                    "textAlignHorizontal": "LEFT",
                    "textAlignVertical": "CENTER",
                    "letterSpacing": 0,
                    "lineHeightPx": 15,
                    "lineHeightPercent": 112.67606353759766,
                    "lineHeightPercentFontSize": 136.36363220214844,
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
              "clipsContent": false,
              "strokeWeight": 1,
              "layoutMode": "VERTICAL",
              "paddingRight": 5.94061279296875,
              "itemSpacing": 18,
              "layoutWrap": "NO_WRAP",
              "absoluteBoundingBox": {
                "x": 23292,
                "y": 24417.484375,
                "width": 312,
                "height": 63
              },
              "absoluteRenderBounds": {
                "x": 23292,
                "y": 24417.484375,
                "width": 312,
                "height": 63
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
            },
            {
              "id": "728:17999",
              "name": "div",
              "type": "FRAME",
              "scrollBehavior": "SCROLLS",
              "children": [
                {
                  "id": "728:18000",
                  "name": "p",
                  "type": "FRAME",
                  "scrollBehavior": "SCROLLS",
                  "children": [
                    {
                      "id": "728:18001",
                      "name": "Certo",
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
                        "x": 23664,
                        "y": 24187.484375,
                        "width": 99,
                        "height": 45
                      },
                      "absoluteRenderBounds": {
                        "x": 23665.65234375,
                        "y": 24196.681640625,
                        "width": 95.837890625,
                        "height": 26.17578125
                      },
                      "constraints": {
                        "vertical": "TOP",
                        "horizontal": "LEFT"
                      },
                      "layoutAlign": "INHERIT",
                      "layoutGrow": 0,
                      "layoutSizingHorizontal": "HUG",
                      "layoutSizingVertical": "HUG",
                      "characters": "Certo",
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
                        "fontSize": 35,
                        "textAlignHorizontal": "LEFT",
                        "textAlignVertical": "CENTER",
                        "letterSpacing": 0,
                        "lineHeightPx": 45,
                        "lineHeightPercent": 106.23743438720703,
                        "lineHeightPercentFontSize": 128.57142639160156,
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
                  "clipsContent": false,
                  "strokeWeight": 1,
                  "individualStrokeWeights": {
                    "top": 0,
                    "right": 0,
                    "bottom": 1,
                    "left": 0
                  },
                  "layoutMode": "HORIZONTAL",
                  "paddingRight": 89,
                  "paddingBottom": 25,
                  "layoutWrap": "NO_WRAP",
                  "absoluteBoundingBox": {
                    "x": 23664,
                    "y": 24187.484375,
                    "width": 188,
                    "height": 70
                  },
                  "absoluteRenderBounds": {
                    "x": 23664,
                    "y": 24187.484375,
                    "width": 188,
                    "height": 70
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
                    "border": "1px solid #FFF"
                  }
                },
                {
                  "id": "728:18002",
                  "name": "ul#menu-footer-menu",
                  "type": "FRAME",
                  "scrollBehavior": "SCROLLS",
                  "children": [
                    {
                      "id": "728:18003",
                      "name": "a",
                      "type": "FRAME",
                      "scrollBehavior": "SCROLLS",
                      "children": [
                        {
                          "id": "728:18004",
                          "name": "span",
                          "type": "IMAGE",
                          "url": "@/assets/span-728-18004.svg",
                          "absoluteBoundingBox": {
                            "x": 23664,
                            "y": 24319.984375,
                            "width": 20,
                            "height": 20
                          },
                          "absoluteRenderBounds": {
                            "x": 23664,
                            "y": 24319.984375,
                            "width": 25,
                            "height": 22.9296875
                          },
                          "inlineStyles": {}
                        },
                        {
                          "id": "728:18007",
                          "name": "iPhone",
                          "type": "TEXT",
                          "scrollBehavior": "SCROLLS",
                          "blendMode": "PASS_THROUGH",
                          "fills": [
                            {
                              "blendMode": "NORMAL",
                              "type": "SOLID",
                              "color": {
                                "r": 1,
                                "g": 0.7607843279838562,
                                "b": 0.27843138575553894,
                                "a": 1
                              }
                            }
                          ],
                          "strokes": [],
                          "strokeWeight": 1,
                          "strokeAlign": "OUTSIDE",
                          "absoluteBoundingBox": {
                            "x": 23708,
                            "y": 24317.484375,
                            "width": 64,
                            "height": 25
                          },
                          "absoluteRenderBounds": {
                            "x": 23709.005859375,
                            "y": 24321.76171875,
                            "width": 61.482421875,
                            "height": 14.91796875
                          },
                          "constraints": {
                            "vertical": "CENTER",
                            "horizontal": "LEFT"
                          },
                          "layoutAlign": "INHERIT",
                          "layoutGrow": 0,
                          "layoutSizingHorizontal": "HUG",
                          "layoutSizingVertical": "HUG",
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
                            "letterSpacing": -0.4000000059604645,
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
                        }
                      ],
                      "blendMode": "PASS_THROUGH",
                      "clipsContent": false,
                      "strokeWeight": 1,
                      "layoutMode": "HORIZONTAL",
                      "counterAxisAlignItems": "CENTER",
                      "paddingRight": 80,
                      "itemSpacing": 24,
                      "layoutWrap": "NO_WRAP",
                      "absoluteBoundingBox": {
                        "x": 23664,
                        "y": 24317.484375,
                        "width": 188,
                        "height": 25
                      },
                      "absoluteRenderBounds": {
                        "x": 23664,
                        "y": 24317.484375,
                        "width": 188,
                        "height": 25.4296875
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
                    },
                    {
                      "id": "728:18008",
                      "name": "a",
                      "type": "FRAME",
                      "scrollBehavior": "SCROLLS",
                      "children": [
                        {
                          "id": "728:18009",
                          "name": "span",
                          "type": "IMAGE",
                          "url": "@/assets/span-728-18009.svg",
                          "absoluteBoundingBox": {
                            "x": 23664,
                            "y": 24368.984375,
                            "width": 20,
                            "height": 20
                          },
                          "absoluteRenderBounds": {
                            "x": 23664,
                            "y": 24368.984375,
                            "width": 25,
                            "height": 22.9296875
                          },
                          "inlineStyles": {}
                        },
                        {
                          "id": "728:18012",
                          "name": "Android",
                          "type": "TEXT",
                          "scrollBehavior": "SCROLLS",
                          "blendMode": "PASS_THROUGH",
                          "fills": [
                            {
                              "blendMode": "NORMAL",
                              "type": "SOLID",
                              "color": {
                                "r": 1,
                                "g": 0.7607843279838562,
                                "b": 0.27843138575553894,
                                "a": 1
                              }
                            }
                          ],
                          "strokes": [],
                          "strokeWeight": 1,
                          "strokeAlign": "OUTSIDE",
                          "absoluteBoundingBox": {
                            "x": 23708,
                            "y": 24366.484375,
                            "width": 74,
                            "height": 25
                          },
                          "absoluteRenderBounds": {
                            "x": 23708.4453125,
                            "y": 24370.76171875,
                            "width": 71.7421875,
                            "height": 14.91796875
                          },
                          "constraints": {
                            "vertical": "CENTER",
                            "horizontal": "LEFT"
                          },
                          "layoutAlign": "INHERIT",
                          "layoutGrow": 0,
                          "layoutSizingHorizontal": "HUG",
                          "layoutSizingVertical": "HUG",
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
                            "letterSpacing": -0.4000000059604645,
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
                        }
                      ],
                      "blendMode": "PASS_THROUGH",
                      "clipsContent": false,
                      "strokeWeight": 1,
                      "layoutMode": "HORIZONTAL",
                      "counterAxisAlignItems": "CENTER",
                      "paddingRight": 70,
                      "itemSpacing": 24,
                      "layoutWrap": "NO_WRAP",
                      "absoluteBoundingBox": {
                        "x": 23664,
                        "y": 24366.484375,
                        "width": 188,
                        "height": 25
                      },
                      "absoluteRenderBounds": {
                        "x": 23664,
                        "y": 24366.484375,
                        "width": 188,
                        "height": 25.4296875
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
                    },
                    {
                      "id": "728:18013",
                      "name": "a",
                      "type": "FRAME",
                      "scrollBehavior": "SCROLLS",
                      "children": [
                        {
                          "id": "728:18014",
                          "name": "span",
                          "type": "IMAGE",
                          "url": "@/assets/span-728-18014.svg",
                          "absoluteBoundingBox": {
                            "x": 23664,
                            "y": 24417.984375,
                            "width": 20,
                            "height": 20
                          },
                          "absoluteRenderBounds": {
                            "x": 23664,
                            "y": 24417.984375,
                            "width": 25,
                            "height": 22.9296875
                          },
                          "inlineStyles": {}
                        },
                        {
                          "id": "728:18017",
                          "name": "Help",
                          "type": "TEXT",
                          "scrollBehavior": "SCROLLS",
                          "blendMode": "PASS_THROUGH",
                          "fills": [
                            {
                              "blendMode": "NORMAL",
                              "type": "SOLID",
                              "color": {
                                "r": 1,
                                "g": 0.7607843279838562,
                                "b": 0.27843138575553894,
                                "a": 1
                              }
                            }
                          ],
                          "strokes": [],
                          "strokeWeight": 1,
                          "strokeAlign": "OUTSIDE",
                          "absoluteBoundingBox": {
                            "x": 23708,
                            "y": 24415.484375,
                            "width": 43,
                            "height": 25
                          },
                          "absoluteRenderBounds": {
                            "x": 23709.044921875,
                            "y": 24420.666015625,
                            "width": 40.28515625,
                            "height": 17.705078125
                          },
                          "constraints": {
                            "vertical": "CENTER",
                            "horizontal": "LEFT"
                          },
                          "layoutAlign": "INHERIT",
                          "layoutGrow": 0,
                          "layoutSizingHorizontal": "HUG",
                          "layoutSizingVertical": "HUG",
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
                            "letterSpacing": -0.4000000059604645,
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
                        }
                      ],
                      "blendMode": "PASS_THROUGH",
                      "clipsContent": false,
                      "strokeWeight": 1,
                      "layoutMode": "HORIZONTAL",
                      "counterAxisAlignItems": "CENTER",
                      "paddingRight": 101,
                      "itemSpacing": 24,
                      "layoutWrap": "NO_WRAP",
                      "absoluteBoundingBox": {
                        "x": 23664,
                        "y": 24415.484375,
                        "width": 188,
                        "height": 25
                      },
                      "absoluteRenderBounds": {
                        "x": 23664,
                        "y": 24415.484375,
                        "width": 188,
                        "height": 25.4296875
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
                    },
                    {
                      "id": "728:18018",
                      "name": "a",
                      "type": "FRAME",
                      "scrollBehavior": "SCROLLS",
                      "children": [
                        {
                          "id": "728:18019",
                          "name": "span",
                          "type": "IMAGE",
                          "url": "@/assets/span-728-18019.svg",
                          "absoluteBoundingBox": {
                            "x": 23664,
                            "y": 24466.984375,
                            "width": 20,
                            "height": 20
                          },
                          "absoluteRenderBounds": {
                            "x": 23664,
                            "y": 24466.984375,
                            "width": 25,
                            "height": 22.9296875
                          },
                          "inlineStyles": {}
                        },
                        {
                          "id": "728:18022",
                          "name": "About",
                          "type": "TEXT",
                          "scrollBehavior": "SCROLLS",
                          "blendMode": "PASS_THROUGH",
                          "fills": [
                            {
                              "blendMode": "NORMAL",
                              "type": "SOLID",
                              "color": {
                                "r": 1,
                                "g": 0.7607843279838562,
                                "b": 0.27843138575553894,
                                "a": 1
                              }
                            }
                          ],
                          "strokes": [],
                          "strokeWeight": 1,
                          "strokeAlign": "OUTSIDE",
                          "absoluteBoundingBox": {
                            "x": 23708,
                            "y": 24464.484375,
                            "width": 57,
                            "height": 25
                          },
                          "absoluteRenderBounds": {
                            "x": 23708.4453125,
                            "y": 24469.666015625,
                            "width": 55.693359375,
                            "height": 14.021484375
                          },
                          "constraints": {
                            "vertical": "CENTER",
                            "horizontal": "LEFT"
                          },
                          "layoutAlign": "INHERIT",
                          "layoutGrow": 0,
                          "layoutSizingHorizontal": "HUG",
                          "layoutSizingVertical": "HUG",
                          "characters": "About",
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
                            "letterSpacing": -0.4000000059604645,
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
                        }
                      ],
                      "blendMode": "PASS_THROUGH",
                      "clipsContent": false,
                      "strokeWeight": 1,
                      "layoutMode": "HORIZONTAL",
                      "counterAxisAlignItems": "CENTER",
                      "paddingRight": 87,
                      "itemSpacing": 24,
                      "layoutWrap": "NO_WRAP",
                      "absoluteBoundingBox": {
                        "x": 23664,
                        "y": 24464.484375,
                        "width": 188,
                        "height": 25
                      },
                      "absoluteRenderBounds": {
                        "x": 23664,
                        "y": 24464.484375,
                        "width": 188,
                        "height": 25.4296875
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
                    },
                    {
                      "id": "728:18023",
                      "name": "a",
                      "type": "FRAME",
                      "scrollBehavior": "SCROLLS",
                      "children": [
                        {
                          "id": "728:18024",
                          "name": "span",
                          "type": "IMAGE",
                          "url": "@/assets/span-728-18024.svg",
                          "absoluteBoundingBox": {
                            "x": 23664,
                            "y": 24515.984375,
                            "width": 20,
                            "height": 20
                          },
                          "absoluteRenderBounds": {
                            "x": 23664,
                            "y": 24515.984375,
                            "width": 25,
                            "height": 22.9296875
                          },
                          "inlineStyles": {}
                        },
                        {
                          "id": "728:18027",
                          "name": "Insights",
                          "type": "TEXT",
                          "scrollBehavior": "SCROLLS",
                          "blendMode": "PASS_THROUGH",
                          "fills": [
                            {
                              "blendMode": "NORMAL",
                              "type": "SOLID",
                              "color": {
                                "r": 1,
                                "g": 0.7607843279838562,
                                "b": 0.27843138575553894,
                                "a": 1
                              }
                            }
                          ],
                          "strokes": [],
                          "strokeWeight": 1,
                          "strokeAlign": "OUTSIDE",
                          "absoluteBoundingBox": {
                            "x": 23708,
                            "y": 24513.484375,
                            "width": 70,
                            "height": 25
                          },
                          "absoluteRenderBounds": {
                            "x": 23708.990234375,
                            "y": 24518.537109375,
                            "width": 68.048828125,
                            "height": 17.833984375
                          },
                          "constraints": {
                            "vertical": "CENTER",
                            "horizontal": "LEFT"
                          },
                          "layoutAlign": "INHERIT",
                          "layoutGrow": 0,
                          "layoutSizingHorizontal": "HUG",
                          "layoutSizingVertical": "HUG",
                          "characters": "Insights",
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
                            "fontSize": 18,
                            "textAlignHorizontal": "LEFT",
                            "textAlignVertical": "CENTER",
                            "letterSpacing": -0.4000000059604645,
                            "lineHeightPx": 25,
                            "lineHeightPercent": 114.76264953613281,
                            "lineHeightPercentFontSize": 138.88888549804688,
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
                      "clipsContent": false,
                      "strokeWeight": 1,
                      "layoutMode": "HORIZONTAL",
                      "counterAxisAlignItems": "CENTER",
                      "paddingRight": 74,
                      "itemSpacing": 24,
                      "layoutWrap": "NO_WRAP",
                      "absoluteBoundingBox": {
                        "x": 23664,
                        "y": 24513.484375,
                        "width": 188,
                        "height": 25
                      },
                      "absoluteRenderBounds": {
                        "x": 23664,
                        "y": 24513.484375,
                        "width": 188,
                        "height": 25.4296875
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
                  "layoutMode": "VERTICAL",
                  "itemSpacing": 24,
                  "layoutWrap": "NO_WRAP",
                  "absoluteBoundingBox": {
                    "x": 23664,
                    "y": 24317.484375,
                    "width": 188,
                    "height": 221
                  },
                  "absoluteRenderBounds": {
                    "x": 23664,
                    "y": 24317.484375,
                    "width": 188,
                    "height": 221.4296875
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
              "layoutMode": "VERTICAL",
              "itemSpacing": 60,
              "layoutWrap": "NO_WRAP",
              "absoluteBoundingBox": {
                "x": 23664,
                "y": 24187.484375,
                "width": 188,
                "height": 351
              },
              "absoluteRenderBounds": {
                "x": 23664,
                "y": 24187.484375,
                "width": 188,
                "height": 351.4296875
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
            },
            {
              "id": "728:18028",
              "name": "div",
              "type": "FRAME",
              "scrollBehavior": "SCROLLS",
              "children": [
                {
                  "id": "728:18029",
                  "name": "form#newsletter-signup-footer-form",
                  "type": "FRAME",
                  "scrollBehavior": "SCROLLS",
                  "children": [
                    {
                      "id": "728:18030",
                      "name": "form#newsletter-signup-footer-form:before",
                      "type": "IMAGE",
                      "url": "@/assets/form-newsletter-signup-footer-form-before-728-18030.svg",
                      "absoluteBoundingBox": {
                        "x": 23912,
                        "y": 24187.484375,
                        "width": 436,
                        "height": 232.390625
                      },
                      "absoluteRenderBounds": {
                        "x": 23912,
                        "y": 24187.484375,
                        "width": 436,
                        "height": 232.390625
                      },
                      "inlineStyles": {}
                    },
                    {
                      "id": "728:18033",
                      "name": "div",
                      "type": "FRAME",
                      "scrollBehavior": "SCROLLS",
                      "children": [
                        {
                          "id": "728:18034",
                          "name": "div",
                          "type": "FRAME",
                          "scrollBehavior": "SCROLLS",
                          "children": [
                            {
                              "id": "728:18035",
                              "name": "Sign up to our newsletter",
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
                                "x": 23948,
                                "y": 24222.484375,
                                "width": 274,
                                "height": 30
                              },
                              "absoluteRenderBounds": {
                                "x": 23948.783203125,
                                "y": 24227.662109375,
                                "width": 272.65625,
                                "height": 22.7890625
                              },
                              "constraints": {
                                "vertical": "TOP",
                                "horizontal": "LEFT"
                              },
                              "layoutAlign": "INHERIT",
                              "layoutGrow": 0,
                              "layoutSizingHorizontal": "HUG",
                              "layoutSizingVertical": "HUG",
                              "characters": "Sign up to our newsletter",
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
                                "fontSize": 23,
                                "textAlignHorizontal": "LEFT",
                                "textAlignVertical": "CENTER",
                                "letterSpacing": -0.47999998927116394,
                                "lineHeightPx": 30,
                                "lineHeightPercent": 107.77710723876953,
                                "lineHeightPercentFontSize": 130.43478393554688,
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
                              "id": "728:18036",
                              "name": "Receive the latest mobile security news, exclusive discounts & offers straight to your inbox!",
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
                                "x": 23948,
                                "y": 24273.484375,
                                "width": 358.15313720703125,
                                "height": 40
                              },
                              "absoluteRenderBounds": {
                                "x": 23948.767578125,
                                "y": 24277.234375,
                                "width": 352.68359375,
                                "height": 34.48828125
                              },
                              "constraints": {
                                "vertical": "TOP",
                                "horizontal": "LEFT"
                              },
                              "layoutAlign": "INHERIT",
                              "layoutGrow": 0,
                              "layoutSizingHorizontal": "FIXED",
                              "layoutSizingVertical": "HUG",
                              "characters": "Receive the latest mobile security news, exclusive discounts & offers straight to your inbox!",
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
                                "fontStyle": "Regular",
                                "fontWeight": 400,
                                "textAutoResize": "HEIGHT",
                                "fontSize": 15,
                                "textAlignHorizontal": "LEFT",
                                "textAlignVertical": "CENTER",
                                "letterSpacing": 0,
                                "lineHeightPx": 20,
                                "lineHeightPercent": 110.17214965820312,
                                "lineHeightPercentFontSize": 133.3333282470703,
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
                          "clipsContent": false,
                          "strokeWeight": 1,
                          "layoutMode": "VERTICAL",
                          "paddingRight": 5.84686279296875,
                          "itemSpacing": 21,
                          "layoutWrap": "NO_WRAP",
                          "absoluteBoundingBox": {
                            "x": 23948,
                            "y": 24222.484375,
                            "width": 364,
                            "height": 91
                          },
                          "absoluteRenderBounds": {
                            "x": 23948,
                            "y": 24222.484375,
                            "width": 364,
                            "height": 91
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
                        },
                        {
                          "id": "728:18037",
                          "name": "div",
                          "type": "FRAME",
                          "scrollBehavior": "SCROLLS",
                          "children": [
                            {
                              "id": "728:18038",
                              "name": "input#newsletter-email",
                              "type": "FRAME",
                              "scrollBehavior": "SCROLLS",
                              "children": [
                                {
                                  "id": "728:18039",
                                  "name": "div#placeholder",
                                  "type": "FRAME",
                                  "scrollBehavior": "SCROLLS",
                                  "children": [
                                    {
                                      "id": "728:18040",
                                      "name": "Email address",
                                      "type": "TEXT",
                                      "scrollBehavior": "SCROLLS",
                                      "blendMode": "PASS_THROUGH",
                                      "fills": [
                                        {
                                          "opacity": 0.5,
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
                                        "x": 23964,
                                        "y": 24357.484375,
                                        "width": 99,
                                        "height": 18
                                      },
                                      "absoluteRenderBounds": {
                                        "x": 23965.3203125,
                                        "y": 24360.234375,
                                        "width": 96.55078125,
                                        "height": 11.44140625
                                      },
                                      "constraints": {
                                        "vertical": "TOP",
                                        "horizontal": "LEFT"
                                      },
                                      "layoutAlign": "INHERIT",
                                      "layoutGrow": 0,
                                      "layoutSizingHorizontal": "HUG",
                                      "layoutSizingVertical": "HUG",
                                      "characters": "Email address",
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
                                        "fontStyle": "Regular",
                                        "fontWeight": 400,
                                        "textAutoResize": "WIDTH_AND_HEIGHT",
                                        "fontSize": 15,
                                        "textAlignHorizontal": "LEFT",
                                        "textAlignVertical": "CENTER",
                                        "letterSpacing": 0,
                                        "lineHeightPx": 18.15340805053711,
                                        "lineHeightPercent": 100,
                                        "lineHeightUnit": "INTRINSIC_%"
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
                                  "paddingRight": 123.796875,
                                  "layoutWrap": "NO_WRAP",
                                  "absoluteBoundingBox": {
                                    "x": 23964,
                                    "y": 24357.484375,
                                    "width": 222.796875,
                                    "height": 18
                                  },
                                  "absoluteRenderBounds": {
                                    "x": 23964,
                                    "y": 24357.484375,
                                    "width": 222.796875,
                                    "height": 18
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
                                }
                              ],
                              "blendMode": "PASS_THROUGH",
                              "clipsContent": false,
                              "cornerSmoothing": 0,
                              "strokeWeight": 1,
                              "absoluteBoundingBox": {
                                "x": 23948,
                                "y": 24349.484375,
                                "width": 254.796875,
                                "height": 34.390625
                              },
                              "absoluteRenderBounds": {
                                "x": 23948,
                                "y": 24349.484375,
                                "width": 254.796875,
                                "height": 34.390625
                              },
                              "constraints": {
                                "vertical": "TOP",
                                "horizontal": "LEFT_RIGHT"
                              },
                              "interactions": [],
                              "complexStrokeProperties": {
                                "strokeType": "BASIC"
                              },
                              "inlineStyles": {
                                "borderRadius": "21px 0px 0px 21px",
                                "background": "#FFF"
                              }
                            },
                            {
                              "id": "728:18041",
                              "name": "button",
                              "type": "FRAME",
                              "scrollBehavior": "SCROLLS",
                              "children": [
                                {
                                  "id": "728:18042",
                                  "name": "Submit",
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
                                    "x": 24230.03125,
                                    "y": 24357.484375,
                                    "width": 54.91875076293945,
                                    "height": 18
                                  },
                                  "absoluteRenderBounds": {
                                    "x": 24231.4375,
                                    "y": 24359.861328125,
                                    "width": 52.263671875,
                                    "height": 11.783203125
                                  },
                                  "constraints": {
                                    "vertical": "TOP",
                                    "horizontal": "CENTER"
                                  },
                                  "characters": "Submit",
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
                                    "fontSize": 15,
                                    "textAlignHorizontal": "CENTER",
                                    "textAlignVertical": "CENTER",
                                    "letterSpacing": 0,
                                    "lineHeightPx": 18.399999618530273,
                                    "lineHeightPercent": 101.3583755493164,
                                    "lineHeightPercentFontSize": 122.66666412353516,
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
                              "clipsContent": false,
                              "cornerSmoothing": 0,
                              "strokeWeight": 1,
                              "absoluteBoundingBox": {
                                "x": 24202.796875,
                                "y": 24349.484375,
                                "width": 109.1875,
                                "height": 34.390625
                              },
                              "absoluteRenderBounds": {
                                "x": 24202.796875,
                                "y": 24349.484375,
                                "width": 109.1875,
                                "height": 34.390625
                              },
                              "constraints": {
                                "vertical": "TOP",
                                "horizontal": "LEFT_RIGHT"
                              },
                              "interactions": [],
                              "complexStrokeProperties": {
                                "strokeType": "BASIC"
                              },
                              "inlineStyles": {
                                "borderRadius": "0px 21px 21px 0px",
                                "background": "#02033B"
                              }
                            }
                          ],
                          "blendMode": "PASS_THROUGH",
                          "clipsContent": false,
                          "strokeWeight": 1,
                          "absoluteBoundingBox": {
                            "x": 23948,
                            "y": 24349.484375,
                            "width": 364,
                            "height": 34.390625
                          },
                          "absoluteRenderBounds": {
                            "x": 23948,
                            "y": 24349.484375,
                            "width": 364,
                            "height": 34.390625
                          },
                          "constraints": {
                            "vertical": "TOP",
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
                      "layoutMode": "VERTICAL",
                      "itemSpacing": 36,
                      "layoutWrap": "NO_WRAP",
                      "absoluteBoundingBox": {
                        "x": 23948,
                        "y": 24222.484375,
                        "width": 364,
                        "height": 161.390625
                      },
                      "absoluteRenderBounds": {
                        "x": 23948,
                        "y": 24222.484375,
                        "width": 364,
                        "height": 161.390625
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
                  "paddingLeft": 36,
                  "paddingRight": 36,
                  "paddingTop": 35,
                  "paddingBottom": 36,
                  "layoutWrap": "NO_WRAP",
                  "absoluteBoundingBox": {
                    "x": 23912,
                    "y": 24187.484375,
                    "width": 436,
                    "height": 232.390625
                  },
                  "absoluteRenderBounds": {
                    "x": 23912,
                    "y": 24187.484375,
                    "width": 436,
                    "height": 232.390625
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
                    "borderRadius": "42px",
                    "background": "#FFC247",
                    "overflow": "hidden"
                  }
                }
              ],
              "blendMode": "PASS_THROUGH",
              "clipsContent": true,
              "strokeWeight": 1,
              "absoluteBoundingBox": {
                "x": 23912,
                "y": 24187.484375,
                "width": 436,
                "height": 351
              },
              "absoluteRenderBounds": {
                "x": 23912,
                "y": 24187.484375,
                "width": 436,
                "height": 351
              },
              "constraints": {
                "vertical": "TOP",
                "horizontal": "LEFT_RIGHT"
              },
              "interactions": [],
              "complexStrokeProperties": {
                "strokeType": "BASIC"
              },
              "inlineStyles": {
                "overflow": "hidden"
              }
            },
            {
              "id": "728:18043",
              "name": "div",
              "type": "FRAME",
              "scrollBehavior": "SCROLLS",
              "children": [],
              "blendMode": "PASS_THROUGH",
              "clipsContent": false,
              "cornerSmoothing": 0,
              "strokeWeight": 1,
              "absoluteBoundingBox": {
                "x": 24032.03125,
                "y": 24574.484375,
                "width": 315.96875,
                "height": 104
              },
              "absoluteRenderBounds": {
                "x": 24032.03125,
                "y": 24574.484375,
                "width": 315.96875,
                "height": 104
              },
              "constraints": {
                "vertical": "TOP",
                "horizontal": "RIGHT"
              },
              "interactions": [],
              "complexStrokeProperties": {
                "strokeType": "BASIC"
              },
              "inlineStyles": {
                "borderRadius": "12px",
                "background": "#FFF"
              }
            },
            {
              "id": "728:18044",
              "name": "Apple, the Apple logo, and iPhone are trademarks of Apple Inc., registered in the U.S. and other countries. App Store is a service mark of Apple Inc. Android, Google Play and the Google Play logo are trademarks of Google LLC.",
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
                "x": 23292,
                "y": 24726.484375,
                "width": 549.8562622070312,
                "height": 45
              },
              "absoluteRenderBounds": {
                "x": 23292.306640625,
                "y": 24729.34765625,
                "width": 538.671875,
                "height": 41.728515625
              },
              "constraints": {
                "vertical": "TOP",
                "horizontal": "LEFT"
              },
              "characters": "Apple, the Apple logo, and iPhone are trademarks of Apple Inc., registered in the U.S. and other countries. App Store is a service mark of Apple Inc. Android, Google Play and the Google Play logo are trademarks of Google LLC.",
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
                "fontStyle": "Regular",
                "fontWeight": 400,
                "textAutoResize": "HEIGHT",
                "fontSize": 12,
                "textAlignHorizontal": "LEFT",
                "textAlignVertical": "CENTER",
                "letterSpacing": 0,
                "lineHeightPx": 15,
                "lineHeightPercent": 103.28638458251953,
                "lineHeightPercentFontSize": 125,
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
          "clipsContent": false,
          "strokeWeight": 1,
          "absoluteBoundingBox": {
            "x": 23292,
            "y": 24187.484375,
            "width": 1056,
            "height": 584
          },
          "absoluteRenderBounds": {
            "x": 23292,
            "y": 24187.484375,
            "width": 1056,
            "height": 584
          },
          "constraints": {
            "vertical": "TOP",
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
        }
      ],
      "blendMode": "PASS_THROUGH",
      "clipsContent": true,
      "strokeWeight": 1,
      "layoutMode": "HORIZONTAL",
      "paddingLeft": 192,
      "paddingRight": 192,
      "paddingTop": 96,
      "paddingBottom": 96,
      "layoutWrap": "NO_WRAP",
      "absoluteBoundingBox": {
        "x": 23100,
        "y": 24091.484375,
        "width": 1440,
        "height": 776
      },
      "absoluteRenderBounds": {
        "x": 23100,
        "y": 24091.484375,
        "width": 1440,
        "height": 776
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
        "background": "#02033B",
        "overflow": "hidden"
      }
    }
  ],
  "kebabName": "footer",
  "path": "@/components/footer"
}</component_details>
    <available_assets>Available asset files: a-728-17958.png, a-728-17965.png, a-728-17972.png, a-after-728-18065.svg, bg-circle-svg-728-17676.svg, div-728-17679.png, div-728-17706.svg, div-728-17780.svg, div-728-17799.svg, div-728-17818.svg, div-728-17837.svg, div-728-17860.png, div-728-17870.png, div-728-17875.png, div-728-17880.png, div-728-17885.png, div-728-17890.png, div-728-17895.png, figure-728-17698.png, form-newsletter-signup-footer-form-before-728-18030.svg, logo-svg-728-18047.svg, span-728-18004.svg, span-728-18009.svg, span-728-18014.svg, span-728-18019.svg, span-728-18024.svg, span-after-728-17693.svg, span-after-728-17855.svg, span-after-728-17903.svg, span-after-728-17919.svg, span-after-728-17940.svg, span-after-728-17953.svg, ul-728-17983.svg</available_assets>
    <styling>{"approach":"Tailwind V4 and Less","libraries":[{"name":"Tailwind V4","role":"utility_first"},{"name":"Less","role":"css_preprocessor"}]}</styling>

    <component_structure>
      The `component_details` parameter contains:
      - `elements`: Array of CSS styles and asset URLs for all elements in this component (colors, spacing, fonts, backgrounds, etc.)
      - `componentName` (optional): If present, indicates this is a **reusable component**; if absent, it's a **regular component**
      - `props` (optional): Props interface definition, only present when `componentName` exists
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
      - **CRITICAL**: Use exact design values from `component_details.elements` (colors, spacing, font sizes, gradients, shadows, etc.)
      - Use responsive utilities provided by the chosen libraries
      - For complex styles (gradients, shadows), use values from `elements` directly in CSS Modules or inline styles
      - For gradient rounded borders, CHECK `global_styles` for `.gradientBorder` mixin
    </req_1>

    <req_2>
      **DOM Identification**:
      - EVERY DOM element corresponding to a Figma node MUST have an `id` attribute.
      - The `id` value must match the `id` in the Figma Data exactly.
      - This is crucial for automated position validation.
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
      **Semantic HTML**:
      - Use semantic tags: `<header>`, `<footer>`, `<nav>`, `<article>`, `<section>`, `<button>`.
    </req_4>

    <req_5>
      **Layout Strategy**:
      - PREFER relative/flex/grid layout.
      - Use absolute positioning ONLY for decoration/overlays or if Figma structure explicitly implies overlay.
    </req_5>

    <req_6>
      **Naming Conventions**:
      - Component Name: **Footer** (PascalCase).
      - Export default.
    </req_6>

    <req_7>
      **Component Type & Props (CRITICAL)**:
      
      **IF `component_details.componentName` exists:**
      - This is a **reusable component**
      - Generate props interface from `component_details.props`: `interface FooterProps { ... }`
      - Reference props in JSX: `{title}`, `<img src={iconSrc} />` (NOT hardcoded values)
      
      **IF `component_details.componentName` does NOT exist:**
      - This is a **regular component**
      - Do NOT generate props interface
      - Directly hardcode content from `component_details.elements` into JSX
      
      **Both types**: Do NOT repeat JSX to simulate grids; parent components handle iteration.
    </req_7>

    <req_9>
      **React Import**:

      - Do **NOT** include `import React from 'react';` at the top of the file.
    </req_9>
    
    <req_10>
      **File Naming**:

      - ALWAYS name the main component file `index.tsx`.
      - ALWAYS name the style file (if applicable) `index.module.[css|less|scss]`.
      - NEVER use PascalCase or other names for filenames (e.g., DO NOT use `MainFrame.tsx` or `Button.tsx`).
    </req_10>
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
