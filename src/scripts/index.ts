import { design2code } from '../graph';
import { workspace } from '../utils/workspace';

async function main() {
    try {
        await design2code(workspace.paths);
        // TODO: replace via logger
        console.log('Successfully completed design2code execution.');
    } catch (error) {
        // TODO: replace via logger
        console.error('Error during design2code execution:', error);
        process.exit(1);
    }
}

main().catch(err => {
    // TODO: replace via logger
    console.error('Fatal error in script:', err);
    process.exit(1);
});
