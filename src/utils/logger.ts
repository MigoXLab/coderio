import chalkModule from 'chalk';

// Chalk v5 is ESM-only. When bundled to CJS, the default import can become a module namespace object.
// This normalizes to the actual Chalk instance in both ESM and CJS outputs.
const chalk = (chalkModule as unknown as { default?: typeof chalkModule }).default ?? chalkModule;

/**
 * Get current timestamp in YYYY-MM-DD HH:mm:ss format
 */
function getTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Logger utility for consistent console output with colors
 */
export const logger = {
    /**
     * Print standard log (alias for info logs).
     *
     * Many subsystems (e.g. validation) use `printLog()` as the default logging method.
     */
    printLog(message: string): void {
        console.log(message);
    },

    /**
     * Print info log in blue
     */
    printInfoLog(message: string): void {
        console.log(chalk.blue(`[${getTimestamp()}] [INFO] ${message}`));
    },

    /**
     * Print warning log in yellow
     */
    printWarnLog(message: string): void {
        console.warn(chalk.yellow(`[${getTimestamp()}] [WARNING] ${message}`));
    },

    /**
     * Print error log in red
     */
    printErrorLog(message: string): void {
        console.error(chalk.red(`[${getTimestamp()}] [ERROR] ✖ ${message}`));
    },

    /**
     * Print test/debug log in gray
     * Only logs in development/test environments
     */
    printTestLog(message: string): void {
        if (process.env.NODE_ENV === 'development') {
            console.log(chalk.gray(`[${getTimestamp()}] [DEBUG] ${message}`));
        }
    },

    /**
     * Print success log in green
     */
    printSuccessLog(message: string): void {
        console.log(chalk.green(`[${getTimestamp()}] [SUCCESS] ✔ ${message}`));
    },
};
