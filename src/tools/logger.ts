import chalk from 'chalk';

export interface LoggerOptions {
    verbose?: boolean;
    debug?: boolean;
}

class Logger {
    private verbose: boolean;
    private debug: boolean;

    constructor(options: LoggerOptions = {}) {
        this.verbose = options.verbose ?? false;
        this.debug = options.debug ?? false;
    }

    setVerbose(verbose: boolean) {
        this.verbose = verbose;
    }

    setDebug(debug: boolean) {
        this.debug = debug;
    }

    info(message: string, ...args: unknown[]) {
        console.log(chalk.blue('ℹ'), message, ...args);
    }

    success(message: string, ...args: unknown[]) {
        console.log(chalk.green('✔'), message, ...args);
    }

    warn(message: string, ...args: unknown[]) {
        console.warn(chalk.yellow('⚠'), message, ...args);
    }

    error(message: string, ...args: unknown[]) {
        console.error(chalk.red('✖'), message, ...args);
    }

    log(message: string, ...args: unknown[]) {
        if (this.verbose) {
            console.log(chalk.gray('›'), message, ...args);
        }
    }

    debugLog(message: string, ...args: unknown[]) {
        if (this.debug) {
            console.log(chalk.magenta('⚙'), chalk.gray(message), ...args);
        }
    }

    nl() {
        console.log();
    }
}

export const logger = new Logger();

export default logger;
