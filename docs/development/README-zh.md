# 节点开发指南

## 概述

CodeRio 通过四节点管道将 Figma 设计转换为 React 代码。每个节点处理特定的转换阶段。

## 管道

```
Figma 设计 → [Initial] → [Process] → [Code] → [Validation] → 生产代码
```

## 节点

### [Initial 节点](./01-initial-node-zh.md)
搭建 React + Vite + TypeScript 项目结构。

**输入/输出**: `workspace` → 空项目及配置文件

### [Process 节点](./02-process-node-zh.md)
通过 API 从 Figma 生成协议，下载资源，转换样式。

**输入/输出**: `figmaUrl` → `protocol.json`、图片、元数据

### [Code 节点](./03-code-node-zh.md)
使用 LLM agent 从协议生成 React 组件。

**输入/输出**: `protocol` → TypeScript 组件 + Tailwind CSS

### [Validation 节点](./04-validation-node-zh.md)
通过视觉比较和位置指标验证 UI 准确性。

**输入/输出**: `protocol`、`figmaThumb` → 验证报告及 MAE 指标

---

## GraphState 接口

```typescript
interface GraphState {
    urlInfo: { fileId: string; nodeId: string; name: string; };
    workspace: { root: string; process: string; app: string; };
    protocol?: Protocol;
    figmaInfo?: { thumbnail: string; };
    config?: { validationMode?: 'codeOnly' | 'reportOnly' | 'full'; };
}
```

## 节点模板

```typescript
import { GraphState } from '../../state';
import { logger } from '../../utils/logger';

export const myNode = async (state: GraphState) => {
    logger.printInfoLog('开始节点...');
    
    // 验证输入
    if (!state.requiredField) {
        throw new Error('缺少必需字段');
    }
    
    // 处理
    const result = await process(state);
    
    // 返回状态更新
    return { myResult: result };
};
```

## 开发

```bash
# 安装
pnpm install

# 构建
pnpm build

# 测试节点
tsx src/nodes/<node>/index.ts

# 运行测试
pnpm test
```

## 添加新节点

1. 创建 `src/nodes/my-node/index.ts`
2. 实现节点函数
3. 添加到 `src/graph.ts`
4. 在 `tests/nodes/` 编写测试
5. 在 `docs/development/` 编写文档

## 资源

- [测试指南](../../tests/README.md)
- [架构文档](../architecture.md)
- [贡献指南](../../CONTRIBUTING.md)
