import { describe, it, expect } from 'vitest';
import { toPascalCase, toKebabCase } from '../../src/utils/naming';

describe('naming utilities', () => {
    describe('toPascalCase', () => {
        it('should convert kebab-case to PascalCase', () => {
            expect(toPascalCase('my-component')).toBe('MyComponent');
            expect(toPascalCase('user-profile-card')).toBe('UserProfileCard');
        });

        it('should convert snake_case to PascalCase', () => {
            expect(toPascalCase('my_component')).toBe('MyComponent');
            expect(toPascalCase('user_profile_card')).toBe('UserProfileCard');
        });

        it('should handle mixed separators', () => {
            expect(toPascalCase('my-component_name')).toBe('MyComponentName');
            expect(toPascalCase('user.profile-card')).toBe('UserProfileCard');
        });

        it('should handle spaces', () => {
            expect(toPascalCase('my component')).toBe('MyComponent');
            expect(toPascalCase('user profile card')).toBe('UserProfileCard');
        });

        it('should handle already PascalCase strings', () => {
            expect(toPascalCase('MyComponent')).toBe('Mycomponent');
        });

        it('should handle single words', () => {
            expect(toPascalCase('component')).toBe('Component');
            expect(toPascalCase('button')).toBe('Button');
        });

        it('should handle numbers', () => {
            expect(toPascalCase('component-2')).toBe('Component2');
            expect(toPascalCase('user-profile-v2')).toBe('UserProfileV2');
        });

        it('should handle empty string', () => {
            expect(toPascalCase('')).toBe('');
        });

        it('should trim whitespace', () => {
            expect(toPascalCase('  my-component  ')).toBe('MyComponent');
        });

        it('should handle multiple consecutive separators', () => {
            expect(toPascalCase('my--component')).toBe('MyComponent');
            expect(toPascalCase('my___component')).toBe('MyComponent');
        });
    });

    describe('toKebabCase', () => {
        it('should convert PascalCase to kebab-case', () => {
            expect(toKebabCase('MyComponent')).toBe('my-component');
            expect(toKebabCase('UserProfileCard')).toBe('user-profile-card');
        });

        it('should convert camelCase to kebab-case', () => {
            expect(toKebabCase('myComponent')).toBe('my-component');
            expect(toKebabCase('userProfileCard')).toBe('user-profile-card');
        });

        it('should handle snake_case', () => {
            expect(toKebabCase('my_component')).toBe('my-component');
            expect(toKebabCase('user_profile_card')).toBe('user-profile-card');
        });

        it('should handle spaces', () => {
            expect(toKebabCase('my component')).toBe('my-component');
            expect(toKebabCase('User Profile Card')).toBe('user-profile-card');
        });

        it('should handle already kebab-case strings', () => {
            expect(toKebabCase('my-component')).toBe('my-component');
        });

        it('should handle single words', () => {
            expect(toKebabCase('component')).toBe('component');
            expect(toKebabCase('Button')).toBe('button');
        });

        it('should handle numbers', () => {
            expect(toKebabCase('Component2')).toBe('component2');
            expect(toKebabCase('UserProfileV2')).toBe('user-profile-v2');
        });

        it('should handle empty string', () => {
            expect(toKebabCase('')).toBe('');
        });

        it('should handle special characters', () => {
            expect(toKebabCase('my@component#name')).toBe('my-component-name');
            expect(toKebabCase('user.profile.card')).toBe('user-profile-card');
        });

        it('should trim leading and trailing hyphens', () => {
            expect(toKebabCase('-my-component-')).toBe('my-component');
            expect(toKebabCase('--user-profile--')).toBe('user-profile');
        });

        it('should handle consecutive capital letters', () => {
            expect(toKebabCase('XMLHttpRequest')).toBe('xmlhttp-request');
            expect(toKebabCase('HTTPSConnection')).toBe('httpsconnection');
        });

        it('should handle mixed cases', () => {
            expect(toKebabCase('MyComponent_Name')).toBe('my-component-name');
            expect(toKebabCase('User Profile-Card')).toBe('user-profile-card');
        });
    });

    describe('round-trip conversion', () => {
        it('should maintain consistency in round-trip conversions', () => {
            const original = 'user-profile-card';
            const pascal = toPascalCase(original);
            const backToKebab = toKebabCase(pascal);
            expect(backToKebab).toBe(original);
        });

        it('should handle complex conversions', () => {
            const testCases = ['my-component', 'user-profile-card', 'button-primary', 'nav-bar-item'];

            testCases.forEach(testCase => {
                const pascal = toPascalCase(testCase);
                const kebab = toKebabCase(pascal);
                expect(kebab).toBe(testCase);
            });
        });
    });
});
