# Process 节点

## 用途

通过 API 从 Figma 设计生成协议，下载资源，将样式转换为 CSS。

## 位置

`src/nodes/process/index.ts`

## 工作流

```
获取 Figma 数据
    ↓
下载图片
    ↓
简化图片节点
    ↓
处理样式 (Figma → CSS)
    ↓
生成协议结构
    ├─ 提取位置（层级）
    ├─ 生成结构（AI）
    ├─ 后处理结构
    │  ├─ 标准化名称
    │  ├─ 填充元素
    │  └─ 注释路径
    └─ 填充组件属性（仅可复用组件）
       ├─ 分组重复实例
       ├─ 提取数据变化（AI）
       └─ 生成属性模式
    ↓
写入输出文件
```

## 接口

**输入**:
```typescript
{
    urlInfo: { fileId: string, nodeId: string, name: string },
    workspace: { process: string, app: string }
}
```

**输出**:
```typescript
{
    protocol: Protocol,
    figmaInfo: { thumbnail: string }
}
```

## 工作流步骤

1. **获取** → 通过 API 获取 Figma 文档 → `figma.json`
2. **下载** → 提取并下载图片 → `assets/`、`images.json`
3. **简化** → 用 URL 替换图片属性
4. **处理** → 将 Figma 样式转换为 CSS
5. **生成结构** → 创建组件层级（详见下文）
6. **写入** → 输出 `protocol.json`

### 结构生成（步骤 5 详解）

这是核心的 AI 驱动转换阶段：

```typescript
// 1. 提取层级位置
const positions = extractNodePositionsHierarchical(frames);
// → { "node-id": { x, y, w, h, children: {...} } }

// 2. 使用 AI 生成结构
const structure = await callModel({
    prompt: generateStructurePrompt({ positions, width }),
    imageUrls: thumbnailUrl,  // 视觉上下文
    responseFormat: 'json_object'
});
// → 带语义命名的组件树

// 3. 后处理结构
postProcessStructure(structure, frames);
// → 标准化名称、填充元素、注释路径

// 4. 填充可复用组件的属性
await populateComponentProps(structure, frames, thumbnailUrl);
// → 分组重复实例，提取数据变化，生成属性
```

**子步骤：**

**5.1 提取位置**
- 递归遍历 Figma 树
- 提取每个节点的 `{x, y, width, height}`
- 保留父子层级关系

**5.2 AI 结构生成**
- 输入：位置数据 + 缩略图
- 输出：语义化组件树，包含：
  - 组件名称（如 "Header"、"ProductCard"）
  - 每个组件要包含的元素 ID
  - 组件关系（父子）

**5.3 后处理**
- **标准化名称**：转换为 kebab-case 用于文件路径
- **填充元素**：用实际 Figma 节点替换元素 ID
- **注释路径**：生成文件路径（`@/components/header`）

**5.4 属性提取**（仅可复用组件）

此步骤**仅处理标记为可复用的组件**（重复实例）：

**可复用组件的条件：**
- 具有相同的 `componentName`
- 设计中有多个实例（如 3+ 个产品卡片）
- 由 AI 在结构生成时检测

**处理流程：**
1. 按 `componentName` 分组实例
2. 检查 `group.length > 1`（多个实例）
3. AI 提取实例间的数据变化：
   ```json
   {
     "props": [
       { "key": "title", "type": "string" },
       { "key": "imageUrl", "type": "string" }
     ],
     "state": [
       { "title": "产品 A", "imageUrl": "..." },
       { "title": "产品 B", "imageUrl": "..." }
     ]
   }
   ```
4. 将重复项合并为：
   - 单个组件模板
   - 用于 `.map()` 迭代的数据数组

**非可复用组件**（唯一/单个实例）完全跳过此步骤。

## 协议结构

协议是表示组件层级的**递归树结构**：

```typescript
interface Protocol {
    id: string;              // 组件 ID（如 "Header"）
    data: FrameData;         // 组件数据
    children?: Protocol[];   // 嵌套子组件
}

interface FrameData {
    name: string;            // 组件名称
    purpose: string;         // 语义描述
    kebabName?: string;      // 文件友好名称（如 "task-card"）
    path?: string;           // 文件路径（如 "components/task-card"）
    elements: FigmaNode[];   // 原始 Figma 节点
    layout?: LayoutInfo;     // 位置、尺寸、间距
    
    // 仅可复用组件：
    componentName?: string;  // 模板名称
    componentPath?: string;  // 模板路径
    props?: PropSchema[];    // 属性定义
    states?: StateData[];    // 用于 .map() 的数据变化
}
```

**关键点：**
- 树结构映射组件层级
- 每个节点包含渲染数据 + 元数据
- 可复用组件具有 `props` 和 `states`
- 非可复用组件仅有基础数据

## 实现

```typescript
export const generateProtocol = async (state: GraphState) => {
    // 获取和处理
    const { document, imageNodesMap } = await executeFigmaAndImagesActions(
        state.urlInfo, assetsDir, processDir
    );
    
    // 转换
    const simplified = figmaTool.simplifyImageNodes(document, imageNodesMap);
    const styled = figmaTool.processedStyle(simplified);
    const protocol = await generateStructure(styled);
    
    // 写入输出
    writeFile(state.workspace.process, 'protocol.json', protocol);
    
    return { protocol, figmaInfo: { thumbnail: styled.thumbnailUrl } };
};
```

## CLI 使用

```bash
coderio f2p <figma-url>      # 完整协议
coderio images <figma-url>   # 仅图片
```

## 配置

需要配置中的 Figma API token:
```typescript
const token = getFigmaConfig().token;
```

## 错误处理

- 无效 URL → 抛出异常
- 缺少 token → 抛出异常
- 图片下载失败 → 记录警告，继续
- 结构生成失败 → 抛出异常

## 性能

- 图片并行下载（可配置并发数）
- Figma 响应可缓存
- 大型设计的样式处理占用 CPU
