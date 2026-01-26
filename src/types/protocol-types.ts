import type { FigmaFrameInfo } from './figma-types';

/**
 * Protocol Structure
 *
 * The protocol is the intermediate representation (IR) between Figma design and generated code.
 * It contains component hierarchy, semantic information, layout data, and reusable component definitions.
 */
export interface IProtocol {
    /** Unique component identifier (e.g., "Header", "ProductCard") */
    id: string;
    /** Component data including name, metadata, structure, and rendering config */
    data: FrameData;
    /** Nested child components */
    children?: IProtocol[] | null;
}

/**
 * Component data container
 * Contains all information needed to generate a component:
 * - Semantic metadata (name, purpose)
 * - Original Figma node data (elements)
 * - Layout and positioning information
 * - Reusable component configuration (props, states)
 *
 * @example for a task list component
 * ```typescript
 * const frameData: FrameData = {
 *   name: "TaskList",
 *   kebabName: "task-list",
 *   path: "components/task-list",
 *   purpose: "Display a list of tasks",
 *   elements: [...],
 *   layout: {...},
 *   states: [
 *     {
 *       state: [
 *         { title: "Task 1", status: "In Progress" },
 *         { title: "Task 2", status: "Completed" }
 *       ],
 *       componentName: "TaskCard",
 *       componentPath: "components/task-card"
 *     }
 *   ]
 * };
 * ```
 *
 * @example for a task card component
 * ```typescript
 * const frameData: FrameData = {
 *   name: "TaskCard",
 *   kebabName: "task-card",
 *   path: "components/task-card",
 *   purpose: "Display a task item with status and assignee",
 *   componentName: "TaskCard",
 *   componentPath: "components/task-card",
 *   elements: [...],
 *   layout: {...},
 *   props: [
 *     { key: "title", type: "string", description: "Task title" },
 *     { key: "status", type: "string", description: "Task status" },
 *     { key: "assignee", type: "string", description: "Task assignee" },
 *   ],
 * };
 * ```
 */
export interface FrameData {
    /** Component name (e.g., "Header", "Hero Section") */
    name: string;
    /** Semantic description of component's purpose and functionality */
    purpose: string;
    /** Normalized identifier for filesystem-friendly names (e.g., "task-card") */
    kebabName?: string;
    /** Derived slug for file system paths (e.g., "components/task-card") */
    path?: string;
    /** Complete Figma node data with hierarchy (simplified for AI processing) */
    elements: FigmaFrameInfo[];
    /** Pre-computed layout information (position, size, spacing, direction) */
    layout?: EmbeddedLayoutInfo;
    /**
     * Optional reusable component identifier.
     * When present, this node is an instance of a reusable component (e.g. "TaskCard", "FeatureCard").
     */
    componentName?: string;
    /** Derived slug for component file system paths */
    componentPath?: string;
    /**
     * Props schema definition for reusable component template.
     * Defines the formal parameters (key, type, description) for the component.
     */
    props?: Array<{ key: string; type: string; description: string }>;
    /**
     * Array of component states with their data lists.
     * Each entry contains: state array (actual parameter values), componentName, and componentPath.
     */
    states?: Array<{
        state: Array<Record<string, unknown>>;
        componentName: string;
        componentPath: string;
    }>;
}

/**
 * Embedded layout information
 * Direct layout data attached to each node in structure tree
 * Eliminates need for separate LayoutMeasurementProvider lookups
 */
interface EmbeddedLayoutInfo {
    /** Position and size in CSS coordinates */
    boundingBox: CssBoundingBox;
    /** Position and size relative to parent component */
    relativeBoundingBox?: CssBoundingBox;
    /** Computed layout direction based on children positions */
    layoutDirection: string;
    /** Gap to previous and next siblings */
    spacing: {
        previous?: number;
        next?: number;
    };
    /** Pre-computed offset from parent's bounding box */
    parentRelativeOffset: {
        x: number;
        y: number;
    };
}

/**
 * Bounding box with position and size using CSS coordinate naming (top, left)
 */
interface CssBoundingBox {
    top: number;
    left: number;
    width: number;
    height: number;
}
