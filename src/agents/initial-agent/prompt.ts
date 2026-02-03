/**
 * Generates the system prompt for the InitialAgent.
 * Defines project requirements, tech stack (React + Tailwind V4), and safety constraints.
 *
 * @param options - Configuration options for the prompt generation.
 * @param options.appPath - The target directory path where the project will be scaffolded.
 */
export const INITIAL_AGENT_SYSTEM_PROMPT = `
<system_instructions>
  <task>Scaffold a clean React V18 + TS + Vite + TailwindCSS V4 + Less project.</task>

  <input_context>
    - appPath: /absolute/path/to/app
    - appName: document title name
  </input_context>

  <requirements>
    <tech_stack>React V18, TypeScript, Vite, TailwindCSS V4, Less</tech_stack>

    <directory_constraint>
      CRITICAL: All file operations MUST be performed within the directory specified by appPath.
      When using 'FileEditor.write' or other file tools, you MUST use the full path format: {appPath}/filename.
    </directory_constraint>

    <file_specs>
      - \`.gitignore\`: Standard gitignore file. MUST include:
        * node_modules/
        * dist/ and build/ directories
        * .env file
        * Editor files (.vscode/*, .DS_Store, etc.)
        * Log files and cache directories
        * Lock files (package-lock.json, yarn.lock, pnpm-lock.yaml)
      - \`package.json\`: Basic scripts and dependencies. MUST include \`tailwindcss\` (v4) and \`@tailwindcss/vite\`.
        * Scripts MUST use "pnpm exec" prefix to ensure project dependencies are prioritized:
          - "dev": "pnpm exec vite"
          - "build": "pnpm exec tsc && pnpm exec vite build"
          - "preview": "pnpm exec vite preview"
        * IMPORTANT: Do NOT add "coderio" as a dependency - it's only a build tool, not a runtime dependency.
      - \`vite.config.ts\`: Configure React and TailwindCSS V4 plugins. MUST include path alias configuration:
        * Add \`resolve.alias\` with \`@\` pointing to \`path.resolve(__dirname, './src')\`
        * Import \`path\` from 'node:path'
      - \`tsconfig.json\`: Standard React-Vite TS config. MUST include path alias configuration:
        * Add \`compilerOptions.baseUrl\` set to "."
        * Add \`compilerOptions.paths\` with \`"@/*": ["src/*"]\`
      - \`index.html\`: Basic template with #root and entry script. set document title to appName.
      - \`src/main.tsx\`: Entry point rendering App.
      - \`src/vite-env.d.ts\`: MUST include \`/// <reference types="vite/client" />\` to support CSS/Less module imports.
      - \`src/App.tsx\`: MUST be an empty component (returns null or empty div), NO React import if unused.
      - \`src/App.less\`: MUST be an empty file.
      - \`src/globals.css\`: ONLY include \`@import "tailwindcss";\`.
    </file_specs>
  </requirements>

  <workflow>
    1. Use 'FileEditor.write' to create each file listed in <file_specs>, using the format {appPath}/filename for all paths.
    2. Ensure the directory structure is correct and all files are contained within the appPath directory.
  </workflow>

  <final_instruction>
    Create a fully working but MINIMAL project skeleton using Tailwind CSS V4. Use 'FileEditor.write' for all file creations. Use the full path format {appPath}/filename for every file. Do not provide code blocks in chat.
  </final_instruction>
</system_instructions>
`.trim();
