import { describe, it, expect } from 'vitest';
import { extractJSON, extractCode, extractFiles } from '../../src/utils/parser';

describe('parser utilities', () => {
    describe('extractJSON', () => {
        it('should extract JSON from markdown code blocks with json language tag', () => {
            const input = '```json\n{"key": "value"}\n```';
            const result = extractJSON(input);
            expect(result).toBe('{"key": "value"}');
        });

        it('should extract JSON from generic markdown code blocks', () => {
            const input = '```\n{"key": "value"}\n```';
            const result = extractJSON(input);
            expect(result).toBe('{"key": "value"}');
        });

        it('should return trimmed content when no code blocks found', () => {
            const input = '  {"key": "value"}  ';
            const result = extractJSON(input);
            expect(result).toBe('{"key": "value"}');
        });

        it('should handle multiline JSON in code blocks', () => {
            const input = '```json\n{\n  "key": "value",\n  "nested": {\n    "data": 123\n  }\n}\n```';
            const result = extractJSON(input);
            expect(result).toBe('{\n  "key": "value",\n  "nested": {\n    "data": 123\n  }\n}');
        });

        it('should prefer json tagged blocks over generic blocks', () => {
            const input = '```json\n{"json": "content"}\n```\n```\n{"generic": "content"}\n```';
            const result = extractJSON(input);
            expect(result).toBe('{"json": "content"}');
        });
    });

    describe('extractCode', () => {
        it('should extract code from tsx code blocks', () => {
            const input = '```tsx\nconst App = () => <div>Hello</div>;\n```';
            const result = extractCode(input);
            expect(result).toBe('const App = () => <div>Hello</div>;');
        });

        it('should extract code from typescript code blocks', () => {
            const input = '```typescript\nconst x: number = 42;\n```';
            const result = extractCode(input);
            expect(result).toBe('const x: number = 42;');
        });

        it('should extract code from javascript code blocks', () => {
            const input = '```javascript\nconst x = 42;\n```';
            const result = extractCode(input);
            expect(result).toBe('const x = 42;');
        });

        it('should extract code from css code blocks', () => {
            const input = '```css\n.class { color: red; }\n```';
            const result = extractCode(input);
            expect(result).toBe('.class { color: red; }');
        });

        it('should extract code from generic code blocks', () => {
            const input = '```\nconst x = 42;\n```';
            const result = extractCode(input);
            expect(result).toBe('const x = 42;');
        });

        it('should clean up loose fence markers when no proper block found', () => {
            const input = '```tsx\nconst x = 42;';
            const result = extractCode(input);
            expect(result).toBe('const x = 42;');
        });

        it('should handle code without any markdown fences', () => {
            const input = 'const x = 42;';
            const result = extractCode(input);
            expect(result).toBe('const x = 42;');
        });

        it('should handle multiline code blocks', () => {
            const input = '```tsx\nconst App = () => {\n  return <div>Hello</div>;\n};\n```';
            const result = extractCode(input);
            expect(result).toBe('const App = () => {\n  return <div>Hello</div>;\n};');
        });
    });

    describe('extractFiles', () => {
        it('should extract multiple files from content with file headers', () => {
            const content = `
## App.tsx
\`\`\`tsx
const App = () => <div>Hello</div>;
\`\`\`

## styles.css
\`\`\`css
.app { color: red; }
\`\`\`
            `.trim();

            const result = extractFiles(content);
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                filename: 'App.tsx',
                content: 'const App = () => <div>Hello</div>;',
            });
            expect(result[1]).toEqual({
                filename: 'styles.css',
                content: '.app { color: red; }',
            });
        });

        it('should handle files without language tags in code blocks', () => {
            const content = `
## config.json
\`\`\`
{"key": "value"}
\`\`\`
            `.trim();

            const result = extractFiles(content);
            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                filename: 'config.json',
                content: '{"key": "value"}',
            });
        });

        it('should return empty array when no files found', () => {
            const content = 'Just some text without file markers';
            const result = extractFiles(content);
            expect(result).toHaveLength(0);
        });

        it('should handle whitespace variations', () => {
            const content = `
##   App.tsx  
\`\`\`tsx
const App = () => <div>Hello</div>;
\`\`\`
            `.trim();

            const result = extractFiles(content);
            expect(result).toHaveLength(1);
            expect(result[0]?.filename).toBe('App.tsx');
        });

        it('should handle multiline code content', () => {
            const content = `
## Component.tsx
\`\`\`tsx
const Component = () => {
  const [state, setState] = useState(0);
  return <div>{state}</div>;
};
\`\`\`
            `.trim();

            const result = extractFiles(content);
            expect(result).toHaveLength(1);
            expect(result[0]?.content).toContain('useState');
        });
    });
});
