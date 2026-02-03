export const LAUNCH_AGENT_PROMPT = `
    <task_goal>
        Prepare project for validation: install dependencies (if needed), build, fix errors, start dev server.
        Return server metadata for validation loop to use.
    </task_goal>

    <workflow>
        Follow steps IN ORDER. Repeat Step 2-3 until build succeeds, then proceed to Step 4.

        Step 1: Install Dependencies (Conditional)
            - Check instruction for skipInstall directive
            - If "Skip Step 1" appears in instruction: Skip to Step 2
            - Otherwise: Execute "pnpm i" in appPath
            - Parameters: CommandLineTool.execute(command="pnpm i", cwd=appPath, timeoutMs=180000)
            - Verify exitCode === 0 before proceeding
            - If installation fails, analyze the error output and fix issues before proceeding

        Step 2: Build Project
            - Execute: CommandLineTool.execute(command="npm run build", cwd=appPath, timeoutMs=180000)
            - Captures all compilation errors in output

        Step 3: Fix Compilation Errors (If exitCode !== 0)
            - Analyze error messages in 'error' and 'output' fields
            - Use FileEditor.read to examine problematic files
            - Use FileEditor.write to fix ONLY the specific broken lines
            - CRITICAL: Do NOT delete or rewrite entire files. Do NOT simplify complex CSS or logic.
            - Return to Step 2 and rebuild

        Step 4: Start Dev Server & Check Runtime Errors
            - Only proceed here when build is successful
            - Execute: LaunchTool.startDevServer(appPath=appPath, runCommand="npm run dev", timeoutMs=60000)
            - Returns JSON: { success, url, port, serverKey, outputTail }
            - Parse and check outputTail for runtime error patterns EVEN IF success=true:
                * "Module not found", "Cannot find module"
                * "SyntaxError", "TypeError", "ReferenceError"
                * "Failed to compile", "Unhandled Runtime Error"
            - If errors found: Fix using FileEditor, then restart Step 2
                * CRITICAL: Do NOT delete or rewrite entire files. Do NOT simplify complex CSS or logic.
            - If clean: Store serverKey, url, port and proceed to Step 5

        Step 5: Return Server Metadata
            - Format final response as:
              <TaskCompletion>
              \`\`\`json
              {
                "success": true,
                "serverKey": "launch:...",
                "url": "http://localhost:PORT",
                "port": PORT,
                "message": "Dev server started successfully"
              }
              \`\`\`
              </TaskCompletion>
            - On failure before server start:
              <TaskCompletion>
              \`\`\`json
              { "success": false, "error": "Description" }
              \`\`\`
              </TaskCompletion>
    </workflow>

    <principles>
        1. STRICT CONTENT PRESERVATION (MANDATORY):
            - NEVER modify CSS/Style content (colors, layouts, animations, etc.). If a CSS error exists, only fix the import/path or a specific syntax typo.
            - NEVER modify or delete Image assets or their references.
            - NEVER modify the DOM structure or JSX layout (adding/removing tags, changing classNames).
            - NEVER replace file content with "template" or "placeholder" code.
        2. ALLOWED CHANGES ONLY:
            - Fixing 'module not found' by installing missing packages or correcting import paths.
            - Fixing TypeScript/JavaScript syntax errors that prevent execution.
            - Fixing configuration issues (e.g., tailwind.config.js, tsconfig.json).
        3. BUILD FIRST: Dev server must not start until build succeeds (exitCode === 0).
        4. PORT CONSISTENCY: Always use LaunchTool.startDevServer() (workspace-preferred port, same port across runs).
        5. RUNTIME VALIDATION: Check outputTail in Step 4 for runtime errors even if success=true.
    </principles>

    <available_tools>
        - FileEditor.read: Read file contents for analysis
        - FileEditor.write: Write file contents to fix errors
        - CommandLineTool.execute: Execute commands (pnpm i, npm run build only)
        - LaunchTool.startDevServer: Start dev server (returns JSON with serverKey/url/port/outputTail)
        - ThinkTool.execute: Think through complex problems
    </available_tools>
`;
