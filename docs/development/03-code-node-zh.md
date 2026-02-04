# Code 节点

## 用途

使用 LLM agent 从协议生成 React + TypeScript 组件。

## 位置

`src/nodes/code/index.ts`

## 工作流

```
遍历并扁平化树（后序 DFS）
    ↓
节点分类
    ├─ 叶子组件（无子节点）
    └─ 容器组件（有子节点）
    ↓
生成代码（并行处理）
    ├─ 叶子 → generateComponent()
    │   ├─ 输入：协议 + 缩略图
    │   └─ 输出：独立组件
    │
    └─ 容器 → generateFrame()
        ├─ 输入：协议 + 缩略图 + 子组件导入
        └─ 输出：组合子组件的容器
    ↓
写入组件文件
    ↓
标记已生成（缓存）
    ↓
注入根组件到 App.tsx
    ↓
完成
```

## 接口

**输入**:

```typescript
{
    protocol: Protocol,
    workspace: { app: string, process: string }
}
```

**输出**: `{}`（文件写入磁盘）

## 工作流步骤

1. **扁平化树** → 后序 DFS 遍历（先子节点，再父节点）
2. **节点分类** → 区分叶子组件与容器组件
3. **生成代码** → 针对不同类型使用不同策略
4. **写入文件** → 保存到 `src/components/`
5. **缓存** → 标记已生成以避免重复生成
6. **注入** → 用根组件更新 `App.tsx`

### 节点分类（步骤 2）

```typescript
const isLeaf = !currentNode.children?.length;

if (isLeaf) {
    // 叶子组件：无子节点，独立组件
    await generateComponent(currentNode, state, assetFilesList, progressInfo);
} else {
    // 容器组件：有子节点，组合它们
    await generateFrame(currentNode, state, assetFilesList, progressInfo);
}
```

**叶子组件：**

- 无子组件
- 独立的 UI 元素
- 示例：Button、Icon、Text block、Image
- 生成完整实现

**容器组件（Frame）：**

- 包含子组件
- 作为布局容器
- 示例：Header（包含 Logo + Nav）、ProductGrid（包含 ProductCards）
- 生成时导入并组合子组件

### 代码生成（步骤 3 详解）

**传入 LLM 的输入：**

- **协议数据**：组件结构、属性、元素、布局
- **设计稿缩略图**：Figma 设计截图（视觉参考）
- **资源文件**：`src/assets/` 中的可用图片
- **样式配置**：Tailwind CSS 配置

```typescript
// 对于 Frame（包含子组件的容器）
await callModel({
    question: generateFramePrompt({
        frameDetails: JSON.stringify(node.data),
        childrenImports: JSON.stringify(childrenImports),
        styling: JSON.stringify(DEFAULT_STYLING),
        assetFiles: assetFilesList,
    }),
    imageUrls: state.figmaInfo.thumbnail, // 🎨 视觉参考
});

// 对于 Component（叶子节点或可复用组件）
await callModel({
    question: generateComponentPrompt({
        componentName,
        componentDetails: JSON.stringify(node.data),
        styling: JSON.stringify(DEFAULT_STYLING),
        assetFiles: assetFilesList,
    }),
    imageUrls: state.figmaInfo.thumbnail, // 🎨 视觉参考
});
```

**为什么缩略图很重要：**

- AI 能看到实际设计，而不仅仅是数据
- 提高视觉准确性（颜色、间距、对齐）
- 帮助理解 UI 的语义用途

## 组件结构

```typescript
// 生成: src/components/Button/index.tsx
import React from 'react';

interface ButtonProps {
    children?: React.ReactNode;
    onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({ children, onClick }) => (
    <button onClick={onClick} className="flex items-center px-4 py-2">
        {children}
    </button>
);
```

## 代码缓存

缓存在 `workspace.checkpoint/checkpoint.json`:

```typescript
{
  "generatedComponents": [
    "Header",
    "Footer"
   ],
  "appInjected": true
}
```

协议更改时缓存失效。

## 实现

```typescript
export async function generateCode(state: GraphState) {
    const cache = loadCodeCache(state.workspace);

    // 生成组件（DFS）
    const totalComponents = await processNode(state, cache);

    // 注入根组件
    await injectRootComponentToApp(state, cache);

    logger.printSuccessLog(`生成 ${totalComponents} 个组件`);
}
```

## LLM 配置

```typescript
const modelConfig = {
    contextWindowTokens: CODE_CONTEXT_WINDOW,
    maxOutputTokens: CODE_MAX_OUTPUT,
    temperature: 0.2, // 低温度保持一致性
};
```

## 错误处理

- 缺少协议 → 抛出异常
- 组件生成失败 → 记录警告，继续
- 部分成功 → 报告总生成数

## 输出

- 严格类型的 TypeScript
- Tailwind CSS 样式
- 命名导出
- 每个目录一个组件

## 自定义

修改 `src/nodes/code/prompt.ts` 中的提示
