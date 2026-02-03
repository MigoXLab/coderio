# Tests

Unit tests for the coderio project using Vitest.

## Running Tests

```bash
# Run all tests
pnpm test

# Watch mode (auto-rerun on file changes)
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

## Test Structure

```
tests/
├── utils/                    # Utility function tests
│   ├── parser.test.ts       # Response parsing utilities
│   ├── naming.test.ts       # Name conversion utilities
│   ├── url-parser.test.ts   # Figma URL parser
│   └── promise-pool.test.ts # Concurrent task pool
├── tools/                    # Tool module tests
│   ├── color-converter.test.ts  # Color conversion
│   └── position-metrics.test.ts # Position validation metrics
├── nodes/                    # Node module tests
│   └── tree-traversal.test.ts   # Tree traversal utilities
└── EXAMPLE.test.ts          # Test examples and patterns
```

## Coverage

**Current Status:** 7 out of 138 source files have tests

Coverage report shows **only tested modules** (not entire codebase):

| Module | Coverage | Tests |
|--------|----------|-------|
| naming.ts | 100% | 24 |
| parser.ts | 100% | 18 |
| url-parser.ts | 100% | 15 |
| tree-traversal.ts | 100% | 21 |
| position-metrics.ts | 100% (90% branch) | 8 |
| promise-pool.ts | 90.32% | 14 |
| color.ts | 81.4% | 27 |

**Total: 153 tests, 100% pass rate**

**Overall coverage of tested modules: 89.27%** ✅

> Note: Coverage only includes files with tests. To add more files to coverage report, add tests for them and update `vitest.config.ts`

## Writing Tests

### Basic Test Template

```typescript
import { describe, it, expect } from 'vitest';
import { functionToTest } from '../../src/path/to/module';

describe('functionToTest', () => {
    it('should handle normal case', () => {
        const result = functionToTest('input');
        expect(result).toBe('expected');
    });

    it('should handle edge case', () => {
        expect(functionToTest('')).toBe('');
    });

    it('should throw error for invalid input', () => {
        expect(() => functionToTest(null)).toThrow();
    });
});
```

### Async Tests

```typescript
it('should resolve correctly', async () => {
    const result = await asyncFunction();
    expect(result).toBe('expected');
});
```

### Common Assertions

```typescript
expect(value).toBe(expected);           // Strict equality (===)
expect(value).toEqual(expected);        // Deep equality
expect(value).toBeTruthy();             // Truthy value
expect(value).toBeNull();               // null
expect(value).toBeUndefined();          // undefined
expect(array).toContain(item);          // Array contains
expect(array).toHaveLength(n);          // Array length
expect(obj).toHaveProperty(key);        // Object property
expect(fn).toThrow(error);              // Throws error
expect(string).toMatch(pattern);        // String match
expect(num).toBeGreaterThan(n);         // Greater than
expect(num).toBeCloseTo(n, digits);     // Approximate equality
```

## Best Practices

1. **One assertion per test** - Keep tests focused
2. **Clear test names** - Use descriptive `should` statements
3. **Test edge cases** - Empty values, boundaries, errors
4. **Independent tests** - No dependencies between tests
5. **AAA pattern** - Arrange, Act, Assert

## Examples

See [EXAMPLE.test.ts](./EXAMPLE.test.ts) for comprehensive testing patterns including:
- Basic function tests
- Async/Promise tests
- Error handling
- Mock functions
- Lifecycle hooks
- Parameterized tests

## CI Integration

Tests run automatically in CI/CD pipelines:

```yaml
- name: Run tests
  run: pnpm test
  
- name: Coverage report
  run: pnpm test:coverage
```

## Contributing

When adding new features:
- Write tests first (TDD recommended)
- Ensure all tests pass before committing
- Maintain 80%+ coverage for new modules
- Add the file path to `vitest.config.ts` coverage.include
- Update tests when refactoring

### Adding Tests for New Modules

1. Create test file: `tests/<path>/<module>.test.ts`
2. Write tests
3. Add to coverage tracking in `vitest.config.ts`:
   ```typescript
   coverage: {
       include: [
           // ... existing files
           'src/<path>/<module>.ts',  // Add your file here
       ],
   }
   ```

### Modules That Need Tests

High priority (core functionality):
- `src/utils/file.ts` - File operations
- `src/utils/workspace.ts` - Workspace management
- `src/utils/config.ts` - Configuration loading
- `src/tools/figma-tool/figma.ts` - Figma API interactions

For detailed examples and advanced patterns, refer to [EXAMPLE.test.ts](./EXAMPLE.test.ts).
