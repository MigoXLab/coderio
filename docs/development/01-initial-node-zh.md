# Initial 节点

## 用途

搭建空的 React + Vite + TypeScript 项目结构。

## 位置

`src/nodes/initial/index.ts`

## 工作流

```
Initial 节点
    ↓
创建 Agent
    ↓
生成脚手架
    ↓
验证结构
    ↓
返回成功
```

## 接口

**输入**:
```typescript
{
    workspace: { app: string },
    urlInfo: { name: string }
}
```

**输出**: `{}`（出错时抛出异常）

## 创建的文件

- `package.json`、`vite.config.ts`、`tsconfig.json`
- `index.html`
- `src/main.tsx`、`src/App.tsx`

## 实现

```typescript
export const initialProject = async (state: GraphState) => {
    const agent = createInitialAgent(modelConfig);
    await agent.run(initialAgentInstruction({ 
        appPath: state.workspace.app,
        appName: state.urlInfo.name 
    }));
    
    // 验证必要文件存在
    validateFiles(state.workspace.app, ESSENTIAL_FILES);
};
```

## 配置

Agent 使用 LLM，配置：
- 上下文: `AGENT_CONTEXT_WINDOW_TOKENS`
- 最大输出: `MAX_OUTPUT_TOKENS`

## 错误处理

抛出异常如果:
- 工作区路径未定义
- 脚手架后缺少必要文件
- Agent 执行失败

## 自定义

修改 agent 指令:
- `src/agents/initial-agent/instruction.ts`
- `src/agents/initial-agent/prompt.ts`
