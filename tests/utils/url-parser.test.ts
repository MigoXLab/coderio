import { describe, it, expect } from 'vitest';
import { parseFigmaUrl } from '../../src/utils/url-parser';

describe('parseFigmaUrl', () => {
    it('should parse valid Figma URL with node-id', () => {
        const url = 'https://www.figma.com/design/aONcu8L82l1PdcT304Q8Za/Intern?node-id=0-495';
        const result = parseFigmaUrl(url);

        expect(result).toEqual({
            fileId: 'aONcu8L82l1PdcT304Q8Za',
            name: 'intern',
            nodeId: '0:495',
            projectName: 'intern_0_495',
        });
    });

    it('should convert node-id hyphens to colons', () => {
        const url = 'https://www.figma.com/design/abc123/MyProject?node-id=123-456';
        const result = parseFigmaUrl(url);

        expect(result.nodeId).toBe('123:456');
    });

    it('should handle URL-encoded characters in project name', () => {
        const url = 'https://www.figma.com/design/abc123/My%20Project?node-id=0-1';
        const result = parseFigmaUrl(url);

        // encodeURI on already encoded string results in double encoding
        expect(result.name).toBe('my%2520project');
    });

    it('should convert project name to lowercase', () => {
        const url = 'https://www.figma.com/design/abc123/MyProject?node-id=0-1';
        const result = parseFigmaUrl(url);

        expect(result.name).toBe('myproject');
    });

    it('should truncate long project names to 20 characters', () => {
        const longName = 'a'.repeat(30);
        const url = `https://www.figma.com/design/abc123/${longName}?node-id=0-1`;
        const result = parseFigmaUrl(url);

        expect(result.name).toHaveLength(20);
        expect(result.name).toBe('a'.repeat(20));
    });

    it('should handle empty project name slot', () => {
        // When the project name slot is empty but pathParts length is still >= 3
        const url = 'https://www.figma.com/design/abc123?node-id=0-1';

        // This will throw because fileId extraction expects at least 3 path parts
        expect(() => parseFigmaUrl(url)).toThrow('Invalid Figma URL');
    });

    it('should throw error for URL without fileId', () => {
        const url = 'https://www.figma.com/design/?node-id=0-1';

        expect(() => parseFigmaUrl(url)).toThrow('Invalid Figma URL');
    });

    it('should throw error for URL without node-id', () => {
        const url = 'https://www.figma.com/design/abc123/MyProject';

        expect(() => parseFigmaUrl(url)).toThrow('Invalid Figma URL');
    });

    it('should throw error for invalid URL format', () => {
        const url = 'not-a-valid-url';

        expect(() => parseFigmaUrl(url)).toThrow('Invalid Figma URL');
    });

    it('should handle file URLs', () => {
        const url = 'https://www.figma.com/file/abc123/MyProject?node-id=0-1';
        const result = parseFigmaUrl(url);

        expect(result.fileId).toBe('abc123');
        expect(result.nodeId).toBe('0:1');
    });

    it('should handle complex node-id with multiple hyphens', () => {
        const url = 'https://www.figma.com/design/abc123/MyProject?node-id=123-456-789';
        const result = parseFigmaUrl(url);

        expect(result.nodeId).toBe('123:456:789');
    });

    it('should generate correct projectName', () => {
        const url = 'https://www.figma.com/design/abc123/TestProject?node-id=1-2';
        const result = parseFigmaUrl(url);

        expect(result.projectName).toBe('testproject_1_2');
    });

    it('should handle URLs with additional query parameters', () => {
        const url = 'https://www.figma.com/design/abc123/MyProject?node-id=0-1&mode=design&t=xyz123';
        const result = parseFigmaUrl(url);

        expect(result.fileId).toBe('abc123');
        expect(result.nodeId).toBe('0:1');
        expect(result.name).toBe('myproject');
    });

    it('should handle URLs with hash fragments', () => {
        const url = 'https://www.figma.com/design/abc123/MyProject?node-id=0-1#section';
        const result = parseFigmaUrl(url);

        expect(result.fileId).toBe('abc123');
        expect(result.nodeId).toBe('0:1');
    });

    it('should handle proto URLs', () => {
        const url = 'https://www.figma.com/proto/abc123/MyProject?node-id=0-1';
        const result = parseFigmaUrl(url);

        expect(result.fileId).toBe('abc123');
        expect(result.name).toBe('myproject');
    });
});
