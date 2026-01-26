export const LAUNCH_AGENT_PROMPT = `
    <task_type>Project Launch and Quality Assurance</task_type>
    <task_goal>
        Install dependencies, compile the project, fix any compilation errors, start the development server, 
        and fix any runtime errors. The goal is to have a fully working, error-free project.
    </task_goal>

    <input_context>
        -appPath: absolute path of target project
    </input_context>

    <workflow>
        Follow these steps IN ORDER. Do NOT skip any step.

        Step 1: Install Dependencies
            - Use 'CommandLineTool.execute' to execute "pnpm i" in appPath
            - Parameters: npm run dev(appPath=appPath, command="pnpm i", timeoutMs=180000)
            - Verify the command completes successfully (exitCode === 0)
            - If installation fails, analyze the error output and fix issues before proceeding

        Step 2: Build Project (Compile-time Check)
            - Use 'CommandLineTool.execute' to execute the build command
            - Build command: npm run build
            - Parameters: npm run build(appPath=appPath, command=npm run build, timeoutMs=180000)
            - The tool will capture ALL output including compilation errors
            
        Step 3: Fix Compilation Errors (If Any)
            - If exitCode is not 0, there are compilation errors in the output
            - Carefully analyze the error messages in the 'error' and 'output' fields
            - Use 'FileEditor.read' to examine problematic files mentioned in errors
            - Use 'FileEditor.write' to fix ONLY the specific lines causing the error
            - CRITICAL: Do NOT delete or rewrite entire files. Do NOT simplify complex CSS or logic.
            - After fixing, go back to Step 2 and rebuild
            - Repeat Step 2 and 3 until build succeeds (exitCode is 0)

        Step 4: Run Project (Runtime-time Check)
            - Use 'CommandLineTool.execute' to execute the run command
            - Run command: npm run dev
            - Parameters: npm run dev(appPath=appPath, command=npm run build, timeoutMs=180000)
            - The tool will capture ALL output including runtime errors
            
        Step 5: Fix Runtime Errors (If Any)
            - If exitCode is not 0, there are runtime errors in the output
            - Carefully analyze the error messages in the 'error' and 'output' fields
            - Use 'FileEditor.read' to examine problematic files mentioned in errors
            - Use 'FileEditor.write' to fix ONLY the specific lines causing the runtime error
            - CRITICAL: Do NOT delete or rewrite entire files. Do NOT simplify complex CSS or logic.
            - After fixing, go back to Step 4 and rerun
            - Repeat Step 4 and 5 until runtime succeeds (exitCode is 0)
    </workflow>

    <rules>
        1. STRICT ORDER: Follow the workflow steps in order. Do NOT skip steps.
        2. STRICT CONTENT PRESERVATION (MANDATORY):
            - NEVER modify CSS/Style content (colors, layouts, animations, etc.). If a CSS error exists, only fix the import/path or a specific syntax typo.
            - NEVER modify or delete Image assets or their references.
            - NEVER modify the DOM structure or JSX layout (adding/removing tags, changing classNames).
            - NEVER replace file content with "template" or "placeholder" code.
        3. ALLOWED CHANGES ONLY:
            - Fixing 'module not found' by installing missing packages or correcting import paths.
            - Fixing TypeScript/JavaScript syntax errors that prevent execution.
            - Fixing configuration issues (e.g., tailwind.config.js, tsconfig.json).
        4. ERROR FIXING ONLY: Only fix what is explicitly broken in the error logs. Do NOT refactor, optimize, or "clean up" existing code.
        5. BUILD BEFORE SERVER: NEVER start the dev server until the build succeeds.
        6. COMPLETION: The task is only complete after successfully opening the browser.
    </rules>

    <available_tools>
        - FileEditor.read: Read file contents for error analysis
        - FileEditor.write: Write file contents to fix errors
        - CommandLineTool.execute: Execute commands in the terminal
        - ThinkTool.execute: Think through complex problems
    </available_tools>
`;
