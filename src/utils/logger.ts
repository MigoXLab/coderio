import chalk from 'chalk';

/**
 * Logger utility for consistent console output with colors
 */
export const logger = {
    /**
     * Print info log in blue
     */
    printInfoLog(message: string): void {
        console.log(chalk.blue(message));
    },

    /**
     * Print warning log in yellow
     */
    printWarnLog(message: string): void {
        console.warn(chalk.yellow(message));
    },

    /**
     * Print error log in red
     */
    printErrorLog(message: string): void {
        console.error(chalk.red(message));
    },

    /**
     * Print test/debug log in gray
     * Only logs in development/test environments
     */
    printTestLog(message: string): void {
        if (process.env.NODE_ENV === 'development') {
            console.log(chalk.gray(message));
        }
    },

    /**
     * Print success log in green
     */
    printSuccessLog(message: string): void {
        console.log(chalk.green(message));
    },
};
