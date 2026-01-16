import { Command } from 'commander';
import { parseFigmaUrl } from '../utils/url-parser';
import { createDefaultWorkspace } from '../utils/workspace';
import { logger } from '../utils/logger';
import { executeFigmaAndImagesActions } from '../nodes/process';

// images command: detect images from Figma document and download them
export const registerImagesCommand = (program: Command) => {
    program
        .command('get-images')
        .alias('images')
        .description('Detect images from Figma document and download them')
        .option('-s, --source <url>', 'Figma Link')
        .action(async (opts: { source: string }) => {
            try {
                const { source } = opts;
                const urlInfo = parseFigmaUrl(source);
                const workspace = createDefaultWorkspace(urlInfo.name);
                await executeFigmaAndImagesActions(urlInfo, workspace.paths.root, workspace.paths.root);

                logger.printSuccessLog('Successfully completed detection of images from Figma document!');
                logger.printInfoLog(`Please check the output in the workspace: ${workspace.paths.process}`);
            } catch (error) {
                logger.printErrorLog(`Error during images execution: ${error instanceof Error ? error.message : String(error)}`);
                process.exit(1);
            }
        });
};
