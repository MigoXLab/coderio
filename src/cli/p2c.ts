import { Command } from 'commander';
import { initWorkspace } from '../utils/workspace';
import { logger } from '../utils/logger';
import { readFile } from 'fs/promises';
import { generateCode } from '../nodes/code';
import { Protocol } from '../types/protocol-types';
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
                const protocolData = JSON.parse(protocolContent) as Protocol;
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
                    messages: [],
                    config: {},
                };
                await initialProject(state);
                await generateCode(state);
            } catch (error) {
                logger.printErrorLog(`Error during p2c execution: ${error instanceof Error ? error.message : String(error)}`);
                process.exit(1);
            }
        });
};
