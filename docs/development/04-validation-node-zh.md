# Validation 节点

## 用途

通过视觉比较和位置指标验证生成的 UI 与 Figma 设计的一致性。

## 位置

`src/nodes/validation/index.ts`

## 工作流

```
验证循环（最多 3 次迭代）
│
├─ 迭代开始
│   ├─ 启动开发服务器
│   │   ├─ 安装依赖（仅首次）
│   │   ├─ 构建项目
│   │   └─ 修复编译/运行时错误
│   │
│   ├─ 验证位置
│   │   ├─ 截取屏幕截图（Figma + 渲染结果）
│   │   ├─ 提取元素位置
│   │   ├─ 比较位置
│   │   └─ 计算 MAE 指标
│   │
│   ├─ 检查结果
│   │   ├─ MAE <= 5px? → 通过 → 退出循环
│   │   └─ MAE > 5px? → 继续优化
│   │
│   ├─ 诊断和修复（针对每个错位组件）
│   │   ├─ Judger Agent：分析错误原因
│   │   ├─ Refiner Agent：生成代码修复
│   │   └─ 应用修复到组件文件
│   │
│   └─ 重新启动
│       ├─ 停止旧服务器
│       ├─ 构建修复后的代码
│       ├─ 修复新错误（如有）
│       └─ 启动新服务器
│
└─ 生成最终报告
    ├─ 标注位置的截图
    ├─ 像素差异热力图
    ├─ 交互式 HTML 报告
    └─ 指标摘要（MAE、SAE、错位数量）
```

## 接口

**输入**:
```typescript
{
    protocol: Protocol,
    figmaInfo: { thumbnail: string },
    workspace: { app: string, process: string },
    config?: { validationMode?: 'full' | 'quick' }
}
```

**输出**: 失败时抛出异常，将报告写入磁盘

## 工作流步骤

验证在**迭代循环**中运行（最多 3 次迭代）：

### 每次迭代：

**1. 启动开发服务器**
```typescript
// 第一次迭代：完整设置
await launch(workspace.app, {
    skipDependencyInstall: false,  // 安装依赖
});
// 构建项目、修复错误、启动服务器
```

**2. 验证位置**
- 截取渲染 UI 和 Figma 设计的屏幕截图
- 从两者提取元素位置
- 计算位置误差（MAE、SAE）

**3. 检查通过/失败**
```typescript
if (currentMae <= config.targetMae) {
    // 通过：退出循环
    logger.printSuccessLog('验证通过！');
    break;
}
```

**4. 诊断错误**（针对每个错位组件）
```typescript
// Judger Agent 分析位置错误的原因
const diagnosis = await judger.run(judgerInstruction, [screenshot]);
// 返回：errorType, refineInstructions

// errorType 示例：
// - "missing flexbox gap"（缺少 flexbox 间距）
// - "incorrect padding"（内边距错误）
// - "wrong position absolute values"（绝对定位值错误）
```

**5. 应用修复**（针对每个错位组件）
```typescript
// Refiner Agent 生成代码修复
const refinerResult = await refiner.run(refinerInstruction);
// 应用编辑到组件文件
```

**6. 重新启动**
```typescript
// 停止旧服务器
await launchTool.stopDevServer(serverKey);

// 使用修复重新启动
await launch(workspace.app, {
    skipDependencyInstall: true,  // 跳过依赖（已安装）
});
// 构建、修复新错误、重启服务器
```

**7. 循环** → 进入下一次迭代的步骤 2

### 循环完成后：

**8. 生成报告**
- 标注错位元素的截图
- 像素差异热力图
- 包含指标的交互式 HTML 报告
- 帮助用户理解验证结果

## 验证模式

- **Full**（默认）：包含优化循环，完整报告
- **Quick**：仅位置检查，最小报告

## 指标

**MAE（平均绝对误差）**：主要指标
```typescript
MAE = Σ|rendered_pos - figma_pos| / n
```

- **通过**: MAE < 5px
- **失败**: MAE ≥ 5px

其他指标：MSE、RMSE、准确率、最大距离

## 实现

```typescript
export const runValidation = async (state: GraphState) => {
    const result = await validationLoop({
        protocol: state.protocol,
        figmaThumbnailUrl: state.figmaInfo.thumbnail,
        outputDir: path.join(state.workspace.process, 'validation'),
        workspace: state.workspace,
        config: { mode: state.config?.validationMode ?? 'full' }
    });
    
    if (!result.validationPassed) {
        throw new Error(`MAE ${result.finalMae}px 超过阈值`);
    }
};
```

## 报告输出

```
validation/
├── index.html       # 交互式报告
├── figma.png        # Figma 设计
├── rendered.png     # 生成的 UI
├── diff.png         # 像素差异
├── heatmap.png      # 错误热图
└── metadata.json    # 指标
```

查看：`open validation/index.html`

## 优化循环

最多 3 次迭代：
1. 识别错位元素
2. LLM 生成修复
3. 应用代码更改
4. 重新验证

通过或达到最大迭代次数时停止。

## Agent

- **Judge**：分析指标，决定通过/失败
- **Refiner**：为错位生成代码修复

## 错误处理

- 缺少协议/缩略图 → 抛出异常
- 开发服务器失败 → 抛出异常
- 截图超时 → 抛出异常
- 验证失败 → 抛出带 MAE 的异常

## 性能

- 截图：可调整质量
- 位置提取：可并行化
- Figma 缩略图：可缓存
