# Validation Report Template

This directory contains the interactive React-based validation report viewer used by CodeRio to visualize design-to-code validation results.

## What It Is

The validation report template is a standalone web application that provides an interactive UI for comparing Figma designs with generated code implementations. It displays position validation metrics, annotated screenshots, and detailed component-level feedback.

## Why It's Here

During the validation workflow, CodeRio generates a comprehensive validation report that includes:
- Position validation metrics (MAE, SAE, misaligned element count)
- Side-by-side comparison of design vs. implementation
- Annotated screenshots highlighting misaligned elements
- Component-level deviation details

This template provides the UI layer for visualizing that data. The built template is inlined into a single HTML file with embedded data, allowing users to view validation results without any server or dependencies.

## What It Looks Like

The report viewer features two main visualization modes:

### 1. Annotation Mode (Default)
- Split-screen comparison of annotated design and implementation
- Color-coded bounding boxes around misaligned elements
- Element indices for cross-referencing with the feedback panel

### 2. Rubbing Mode (Experimental)
- Interactive slider to compare design and implementation
- Drag the slider to overlay and compare alignment
- Optional pixel-difference heatmap visualization

### Feedback Panel
- Overall validation metrics (MAE, SAE, misaligned count)
- Expandable component list showing:
  - Component ID and file path
  - Per-element position deviations (x/y in pixels)
  - Element indices matching the annotations

## How to Use

### For End Users
When CodeRio completes validation, it generates an `index.html` report file in your workspace:
```
coderio/<projectname>/validation/index.html
```

Open this file in any web browser to view the interactive report. No server or dependencies required.

### For Developers

#### Building the Template
The template is built during the main CodeRio build process:
```bash
pnpm build  # Builds both main coderio and report template
```

Or build the template independently:
```bash
cd src/tools/report-tool/template
pnpm install
pnpm build  # Outputs to dist/
```

#### Development Mode
To work on the template UI:
```bash
cd src/tools/report-tool/template
pnpm dev  # Starts Vite dev server
```

Note: In dev mode, you'll need to manually inject sample data into `window.__REPORT_DATA__` for testing.

#### How It's Integrated
The `ReportTool.generateHtml()` method (in `src/tools/report-tool/index.ts`) performs the following:

1. Reads the built template from `template/dist/index.html`
2. Injects validation data into `window.__REPORT_DATA__`
3. Inlines all JavaScript and CSS assets into the HTML
4. Escapes special characters to prevent script injection
5. Writes a standalone single-file HTML report

This ensures the report is fully self-contained and portable.

## Technical Details

### Stack
- **React 19** with TypeScript
- **Vite** for building and bundling
- **TailwindCSS** for styling (via CDN in production build)
- **lucide-react** for icons

### Key Components
- `App.tsx`: Main application shell with mode switching
- `ComparisonSlider.tsx`: Interactive slider for rubbing mode
- `AnnotationView.tsx`: Split-screen annotated comparison
- `FeedbackPanel.tsx`: Component-level validation details

### Data Contract
The template expects `window.__REPORT_DATA__` to be a `UserReport` object:
```typescript
interface UserReport {
    design: {
        snap: string;        // Figma thumbnail URL
        markedSnap: string;  // Annotated design (base64 data URI)
    };
    page: {
        url: string;         // Local dev server URL
        snap: string;        // Page screenshot (base64 data URI)
        markedSnap: string;  // Annotated page (base64 data URI)
    };
    report: {
        heatmap: string;     // Pixel-diff heatmap (base64 data URI)
        detail: {
            metrics: {
                mae: number;            // Mean Absolute Error
                sae: number;            // Sum of Absolute Errors
                misalignedCount: number; // Total misaligned components
            };
            components: Array<{
                componentId: string;
                componentPath: string;
                elements: Array<{
                    elementId: string;
                    elementIndex: number;
                    validationInfo: {
                        x: number;  // Horizontal deviation (px)
                        y: number;  // Vertical deviation (px)
                    };
                }>;
            }>;
        };
    };
}
```

### File Structure
```
template/
├── src/
│   ├── components/
│   │   ├── AnnotationView.tsx    # Split-screen annotated view
│   │   ├── ComparisonSlider.tsx  # Interactive rubbing slider
│   │   └── FeedbackPanel.tsx     # Validation details panel
│   ├── App.tsx                   # Main application component
│   ├── index.tsx                 # React entry point
│   └── types.ts                  # TypeScript interfaces
├── dist/                          # Built output (generated)
│   ├── index.html
│   └── assets/
├── package.json
├── tsconfig.json
└── README.md                      # This file
```

## Notes

- The template is version-controlled in source form only (`dist/` is gitignored)
- The build output is embedded directly into the main CodeRio bundle
- Base64-encoded images are used to ensure the report is fully self-contained
- The template supports responsive design but is optimized for desktop viewing
