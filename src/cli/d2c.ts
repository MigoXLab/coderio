import { Command } from 'commander';
import { logger } from '../utils/logger';
import { design2code } from '../graph';

// d2c command: Design to Code
export const registerD2CCommand = (program: Command) => {
    program
        .command('design2code')
        .alias('d2c')
        .description('Generate frontend code from design')
        .option('-s, --source <url>', 'Figma Link')
        .option('-r, --reportonly', 'Run a single validation pass and generate report (no code edits)')
        .option('-c, --codeonly', 'Generate component code only without validation')
        .action(async (opts: { source: string; reportonly?: boolean; codeonly?: boolean }) => {
            try {
                const { source, reportonly, codeonly } = opts;
                await design2code(source, reportonly, codeonly);

                logger.printSuccessLog('Successfully completed code generation from design! Happy coding!');
            } catch (error) {
                logger.printErrorLog(`Error during d2c execution: ${error instanceof Error ? error.message : String(error)}`);
                process.exit(1);
            }
        });
};
