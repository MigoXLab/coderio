import type { JudgerDiagnosis } from '../judger-agent/types';
import type { MisalignedComponent } from '../../types/validation-types';

/**
 * Format refiner instruction with diagnosis and fix instructions
 */
export function formatRefinerInstruction(
    component: MisalignedComponent,
    diagnosis: JudgerDiagnosis,
    componentPaths?: Record<string, string>
): string {
    // Use resolved absolute path from componentPaths, which should always be provided
    const resolvedPath = componentPaths?.[component.componentId];
    if (!resolvedPath) {
        throw new Error(`Component ${component.componentId} not found in componentPaths mapping`);
    }

    const refineInstructionsList = (diagnosis.refineInstructions || []).map((instr, i) => `${i + 1}. ${instr}`).join('\n');

    return `Component ID: ${component.componentId}
Element IDs: ${JSON.stringify(component.elementIds)}
File: ${resolvedPath}

Diagnosis from judger:
${JSON.stringify(diagnosis, null, 2)}

TASK:
Apply each refineInstruction:
${refineInstructionsList}

For each instruction:
1. Parse the old_code and new_code
2. Use FileEditor.findAndReplace to apply the change
3. Report success or failure

IMPORTANT:
- The file path is an absolute filesystem path (e.g., /workspace/src/components/button/index.tsx)
- Use this exact path with FileEditor tools
`;
}
