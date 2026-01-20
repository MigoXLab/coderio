import { Command } from 'commander';
import { initWorkspace } from '../utils/workspace';
import { logger } from '../utils/logger';
import { readFile } from 'fs/promises';
import { generateCode } from '../nodes/code';
import { FrameStructNode } from '../types/figma-types';
import { GraphState } from '../state';
import { initialProject } from '../nodes/initial';

// p2c command: Protocol to Code
export const registerP2CCommand = (program: Command) => {
    program
        .command('protocol2code')
        .alias('p2c')
        .description('Generate code from protocol')
        .option('-p, --protocol <path>', 'Protocol path')
        .action(async (opts: { protocol: string }) => {
            try {
                const protocolContent = await readFile(opts.protocol, 'utf-8');
                const protocolData = JSON.parse(protocolContent) as FrameStructNode;
                const workspace = initWorkspace(protocolData.id);
                const state: GraphState = {
                    protocol: protocolData,
                    workspace,
                    figmaInfo: { thumbnail: '' },
                    urlInfo: {
                        fileId: '',
                        name: '',
                        nodeId: '',
                        projectName: '',
                    },
                    validationSatisfied: undefined,
                    validationReportDir: undefined,
                    validationReportHtmlPath: undefined,
                    messages: [],
                };
                await initialProject(state);
                await generateCode(state);
            } catch (error) {
                logger.printErrorLog(`Error during p2c execution: ${error instanceof Error ? error.message : String(error)}`);
                process.exit(1);
            }
        });
};
