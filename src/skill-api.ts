/**
 * Skill API Module
 *
 * This module exports all utilities needed for SKILL execution in IDEs like Cursor or Claude Code.
 * It intentionally does NOT include model calling logic - the IDE's AI agent handles that.
 *
 * Design Philosophy:
 * - Export data processing utilities (Figma, Protocol, etc.)
 * - Export prompt generation functions (same as CLI for consistency)
 * - Let the IDE's AI agent execute the prompts using its own model
 * - Provide helper functions for protocol manipulation
 */

// ============= Type Exports =============
export type { Protocol, FigmaFrameInfo, ParsedDataListResponse } from './types';

// ============= Initial Agent Exports =============
export { INITIAL_AGENT_SYSTEM_PROMPT } from './agents/initial-agent/prompt';
export { initialAgentInstruction } from './agents/initial-agent/instruction';

// ============= Protocol Agent Exports =============
export { parseFigmaUrl } from './utils/url-parser';
export { executeFigmaAndImagesActions } from './nodes/process';
export { figmaTool } from './tools/figma-tool';
export {
    extractNodePositionsHierarchical,
    postProcessStructure,
    extractComponentGroups,
    simplifyFigmaNodeForContent,
    extractHierarchicalNodesByIds,
    applyPropsAndStateToProtocol,
} from './nodes/process/structure/utils';
export { generateStructurePrompt, extractDataListPrompt } from './nodes/process/structure/prompt';
export { extractJSON } from './utils/parser';

// ============= Code Generation Constants (Same as CLI) =============
export { flattenPostOrder, detectRenderingModes, saveGeneratedCode } from './nodes/code/utils';
export { DEFAULT_STYLING } from './nodes/code/constants';
export { generateFramePrompt, generateComponentPrompt } from './nodes/code/prompt';
export { workspaceManager } from './utils/workspace';

// ============= Image Utilities (reuse existing figma-tool) =============
export { downloadImage } from './tools/figma-tool/images';

// ============= Naming Utilities (ensure path consistency) =============
export { toKebabCase, toPascalCase } from './utils/naming';
