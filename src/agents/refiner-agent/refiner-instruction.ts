import type { JudgerDiagnosis, MisalignedComponent } from '../../nodes/validation/types';

/**
 * Format refiner instruction with diagnosis and fix instructions
 */
export function formatRefinerInstruction(component: MisalignedComponent, diagnosis: JudgerDiagnosis): string {
    const refineInstructionsList = (diagnosis.refineInstructions || [])
        .map((instr, i) => `${i + 1}. ${instr}`)
        .join('\n');

    return `Component ID: ${component.componentId}
Element IDs: ${JSON.stringify(component.elementIds)}
File: ${component.path}

Diagnosis from judger:
${JSON.stringify(diagnosis, null, 2)}

TASK:
Apply each refineInstruction:
${refineInstructionsList}

For each instruction:
1. Parse the old_code and new_code
2. Use FileEditor.findAndReplace to apply the change
3. Report success or failure
`;
}

