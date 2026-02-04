// ============= All Types Export =============
// Export all types for internal use and advanced users
export * from './types/index';

// ============= SKILL API Exports =============
// Export all skill-api utilities for IDE integration (Cursor, Claude Code, etc.)
// This includes:
// - Type exports: Protocol, FrameData, FigmaFrameInfo, FigmaUrlInfo, WorkspaceStructure
// - Initial agent: INITIAL_AGENT_SYSTEM_PROMPT, initialAgentInstruction
// - Figma processing: executeFigmaAndImagesActions, figmaTool
// - Protocol utilities: extractNodePositionsHierarchical, postProcessStructure, etc.
// - Prompt generation: generateStructurePrompt, extractDataListPrompt
// - Helper functions: extractComponentGroups, prepareComponentDataForAI, etc.
// - JSON parser: extractJSON
// - Naming utilities: toKebabCase
export * from './skill-api';
