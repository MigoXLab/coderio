import { Command } from 'commander';
import { logger } from '../utils/logger';
import { design2code } from '../graph';
import { ValidationMode } from '../types/graph-types';

/**
 * Validate and map CLI mode parameter to internal validationMode.
 * @param mode - The mode string from CLI
 * @returns The mapped ValidationMode, or null if invalid
 */
function getValidationMode(mode: string): ValidationMode | null {
    const validModes = ['code', 'with-report', 'full'] as const;
    type ValidMode = (typeof validModes)[number];
    const isValidMode = (m: string): m is ValidMode => {
        return validModes.includes(m as ValidMode);
    };

    if (!isValidMode(mode)) {
        return null;
    }

    // Map CLI mode to internal validationMode
    const modeMap: Record<ValidMode, ValidationMode> = {
        code: ValidationMode.CodeOnly,
        'with-report': ValidationMode.ReportOnly,
        full: ValidationMode.Full,
    };

    return modeMap[mode];
}

// d2c command: Design to Code
export const registerD2CCommand = (program: Command) => {
    program
        .command('design2code')
        .alias('d2c')
        .description('Generate frontend code from design')
        .option('-s, --source <url>', 'Figma Link')
        .option(
            '-m, --mode [type]',
            'Execution mode: code (generate component code only), with-report (single validation and generate report), full (iterative validation)',
            'code'
        )
        .action(async (opts: { source: string; mode?: string }) => {
            try {
                const { source, mode = 'code' } = opts;

                const validationMode = getValidationMode(mode);
                if (!validationMode) {
                    logger.printErrorLog(`Invalid mode: ${mode}. Must be one of: code, with-report, full`);
                    process.exit(1);
                }

                await design2code(source, validationMode);

                logger.printSuccessLog('Successfully completed code generation from design! Happy coding!');
            } catch (error) {
                logger.printErrorLog(`Error during d2c execution: ${error instanceof Error ? error.message : String(error)}`);
                process.exit(1);
            }
        });
};
