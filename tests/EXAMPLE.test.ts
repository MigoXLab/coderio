/**
 * Test Example File - Demonstrates various testing patterns
 *
 * Test Structure:
 * 1. Import necessary test utilities and modules
 * 2. Organize test suites with describe blocks
 * 3. Write specific test cases with it blocks
 * 4. Use expect for assertions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ============================================================================
// Example 1: Simple Function Tests
// ============================================================================

// Function under test
function add(a: number, b: number): number {
    return a + b;
}

describe('Example 1: Simple Function Tests', () => {
    it('should add two positive numbers', () => {
        const result = add(2, 3);
        expect(result).toBe(5);
    });

    it('should add negative numbers', () => {
        expect(add(-1, -2)).toBe(-3);
    });

    it('should handle zero', () => {
        expect(add(0, 5)).toBe(5);
        expect(add(5, 0)).toBe(5);
    });
});

// ============================================================================
// Example 2: Object and Array Tests
// ============================================================================

function createUser(name: string, age: number) {
    return { name, age, createdAt: new Date() };
}

describe('Example 2: Object Tests', () => {
    it('should create user object with correct properties', () => {
        const user = createUser('Alice', 25);

        expect(user).toHaveProperty('name', 'Alice');
        expect(user).toHaveProperty('age', 25);
        expect(user).toHaveProperty('createdAt');
        expect(user.createdAt).toBeInstanceOf(Date);
    });

    it('should create different user objects', () => {
        const user1 = createUser('Bob', 30);
        const user2 = createUser('Charlie', 35);

        expect(user1).not.toEqual(user2);
    });
});

// ============================================================================
// Example 3: Async Function Tests
// ============================================================================

async function fetchData(id: number): Promise<{ id: number; data: string }> {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 10));
    return { id, data: `Data for ${id}` };
}

describe('Example 3: Async Function Tests', () => {
    it('should fetch data asynchronously', async () => {
        const result = await fetchData(1);

        expect(result).toEqual({
            id: 1,
            data: 'Data for 1',
        });
    });

    it('should handle multiple async calls', async () => {
        const results = await Promise.all([fetchData(1), fetchData(2), fetchData(3)]);

        expect(results).toHaveLength(3);
        expect(results[0]?.id).toBe(1);
        expect(results[2]?.id).toBe(3);
    });
});

// ============================================================================
// Example 4: Error Handling Tests
// ============================================================================

function divide(a: number, b: number): number {
    if (b === 0) {
        throw new Error('Division by zero');
    }
    return a / b;
}

describe('Example 4: Error Handling Tests', () => {
    it('should divide numbers correctly', () => {
        expect(divide(10, 2)).toBe(5);
    });

    it('should throw error when dividing by zero', () => {
        expect(() => divide(10, 0)).toThrow('Division by zero');
    });

    it('should throw error of specific type', () => {
        expect(() => divide(10, 0)).toThrow(Error);
    });
});

// ============================================================================
// Example 5: Mock Function Tests
// ============================================================================

interface Logger {
    log: (message: string) => void;
}

function processWithLogging(value: number, logger: Logger): number {
    logger.log(`Processing value: ${value}`);
    const result = value * 2;
    logger.log(`Result: ${result}`);
    return result;
}

describe('Example 5: Mock Function Tests', () => {
    it('should call logger with correct messages', () => {
        const mockLogger = {
            log: vi.fn(),
        };

        const result = processWithLogging(5, mockLogger);

        expect(result).toBe(10);
        expect(mockLogger.log).toHaveBeenCalledTimes(2);
        expect(mockLogger.log).toHaveBeenCalledWith('Processing value: 5');
        expect(mockLogger.log).toHaveBeenCalledWith('Result: 10');
    });
});

// ============================================================================
// Example 6: Lifecycle Hooks
// ============================================================================

class Counter {
    private count = 0;

    increment(): void {
        this.count++;
    }

    getCount(): number {
        return this.count;
    }

    reset(): void {
        this.count = 0;
    }
}

describe('Example 6: Lifecycle Hooks', () => {
    let counter: Counter;

    // Run before each test
    beforeEach(() => {
        counter = new Counter();
    });

    // Run after each test
    afterEach(() => {
        counter.reset();
    });

    it('should start with count 0', () => {
        expect(counter.getCount()).toBe(0);
    });

    it('should increment count', () => {
        counter.increment();
        expect(counter.getCount()).toBe(1);
    });

    it('should increment multiple times', () => {
        counter.increment();
        counter.increment();
        counter.increment();
        expect(counter.getCount()).toBe(3);
    });
});

// ============================================================================
// Example 7: Parameterized Tests
// ============================================================================

function validateAge(age: number): string {
    if (age < 0) return 'invalid';
    if (age < 18) return 'minor';
    if (age < 65) return 'adult';
    return 'senior';
}

describe('Example 7: Parameterized Tests', () => {
    it.each([
        [-1, 'invalid'],
        [0, 'minor'],
        [10, 'minor'],
        [17, 'minor'],
        [18, 'adult'],
        [30, 'adult'],
        [64, 'adult'],
        [65, 'senior'],
        [100, 'senior'],
    ])('should return %s for age %i', (age, expected) => {
        expect(validateAge(age)).toBe(expected);
    });
});

// ============================================================================
// Example 8: Array and String Matchers
// ============================================================================

describe('Example 8: Advanced Matchers', () => {
    it('should test array contents', () => {
        const fruits = ['apple', 'banana', 'orange'];

        expect(fruits).toContain('banana');
        expect(fruits).toHaveLength(3);
        expect(fruits).toEqual(expect.arrayContaining(['apple', 'orange']));
    });

    it('should test string patterns', () => {
        const email = 'test@example.com';

        expect(email).toMatch(/@/);
        expect(email).toMatch(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/);
    });

    it('should test object subset', () => {
        const user = {
            id: 1,
            name: 'Alice',
            email: 'alice@example.com',
            role: 'admin',
        };

        expect(user).toMatchObject({
            name: 'Alice',
            role: 'admin',
        });
    });
});

// ============================================================================
// Test Naming Best Practices
// ============================================================================

/**
 * Good test naming:
 * ✅ should add two numbers correctly
 * ✅ should throw error when input is invalid
 * ✅ should return empty array when no items found
 *
 * Bad test naming:
 * ❌ test1
 * ❌ it works
 * ❌ check function
 */

// ============================================================================
// Common Assertions Reference
// ============================================================================

/**
 * Common assertions:
 * - expect(value).toBe(expected)           // Strict equality (===)
 * - expect(value).toEqual(expected)        // Deep equality
 * - expect(value).toBeTruthy()             // Truthy value
 * - expect(value).toBeFalsy()              // Falsy value
 * - expect(value).toBeNull()               // null
 * - expect(value).toBeUndefined()          // undefined
 * - expect(value).toBeDefined()            // Defined
 * - expect(array).toContain(item)          // Array contains
 * - expect(array).toHaveLength(n)          // Array length
 * - expect(obj).toHaveProperty(key, value) // Object property
 * - expect(fn).toThrow(error)              // Throws error
 * - expect(string).toMatch(pattern)        // String match
 * - expect(number).toBeGreaterThan(n)      // Greater than
 * - expect(number).toBeLessThan(n)         // Less than
 * - expect(value).toBeCloseTo(n, digits)   // Approximate equality
 */
