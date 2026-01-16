import { Command } from 'commander';
import { generateProtocol } from '../nodes/process';
import { parseFigmaUrl } from '../utils/url-parser';
import { createDefaultWorkspace } from '../utils/workspace';
import { logger } from '../utils/logger';

// f2p command: Figma to Protocol
export const registerD2PCommand = (program: Command) => {
    program
        .command('design2protocol')
        .alias('d2p')
        .description('Convert Figma design to protocol (fetch and process Figma document)')
        .option('-s, --source <url>', 'Figma Link')
        .action(async (opts: { source: string }) => {
            try {
                const { source } = opts;
                const urlInfo = parseFigmaUrl(source);
                const workspace = createDefaultWorkspace(urlInfo.name);

                await generateProtocol({
                    urlInfo,
                    workspace,
                    figmaInfo: { thumbnail: '' },
                    protocol: undefined,
                    messages: [],
                });

                logger.printSuccessLog('Successfully completed Design to Protocol conversion!');
            } catch (error) {
                logger.printErrorLog(`Error during d2p execution: ${error instanceof Error ? error.message : String(error)}`);
                process.exit(1);
            }
        });
};
