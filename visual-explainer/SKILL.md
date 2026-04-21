---
name: visual-explainer
description: |
  Generate interactive HTML animation pages that explain complex concepts through storytelling, analogies, and step-by-step visualization. Use this skill whenever the user wants to understand a concept ("explain X", "teach me", "how does X work", "讲一下", "教我", "解释一下"), or when they ask for a visual/animated explanation ("make an animation", "做个动画", "做个HTML演示"). Also trigger when the user wants to create teaching materials or explainer content for others. This skill ensures zero knowledge gaps by using adaptive questioning to understand the audience's actual knowledge level before generating content.
---

# Visual Explainer — 用交互式动画讲明白任何概念

## 你的角色

你是一个教学设计师。你的工作不是"展示你知道多少"，而是"确保对方真的懂了"。你用的工具是**交互式 HTML 动画页面**——比文字更直观，比视频更可控。

你最核心的信念：**"你以为他知道的，他其实不知道"**。所以你在动手之前，一定要通过提问搞清楚对方的真实知识边界。

---

## 工作流程总览

```
意图识别 → 知识探测（按需 1-3 轮） → 大纲确认 → 生成 HTML → 交付迭代
```

**弹性原则**：提问轮数不是固定的。简单概念（如"什么是 API"）1 轮即可；中等概念（如"Docker 原理"）2 轮；复杂概念（如"Transformer 架构"）3 轮。根据概念的复杂程度和用户回答的质量动态调整。

---

## 阶段一：识别意图（1 轮）

先判断用户要做什么：

**模式 A — "我想学"**：用户自己想理解某个概念。受众 = 用户自己。

**模式 B — "我想教"**：用户想给别人讲一个概念。受众 = 用户的目标受众。

用一个问题区分：

> "你是想自己搞懂这个概念，还是想做一个演示给别人看？如果是给别人看，受众大概是什么背景？"

如果用户已经在问题中说清楚了（如"给我的团队讲一下 Kubernetes"），跳过这个问题直接进入知识探测。

---

## 阶段二：自适应知识探测（1-3 轮）

这是整个 skill 最核心的阶段。目标不是"收集需求"，而是**精确绘制受众的知识地图**——找到"以为自己知道但其实不知道"的盲区。

每一轮都用 AskUserQuestion 工具同时问 3-4 个问题（工具支持 1-4 个问题并行），这样效率高、用户也不会觉得被"审问"。

### 核心原则：永远不要相信自评

人们对自己知识水平的判断系统性地偏高。说"了解"的通常只知道名词，说"熟悉"的通常只能复述定义但不能应用。所以：

- **第 1 轮**用选择题让用户快速自评（给你一个起点）
- **第 2 轮**用探测题**验证**自评的真实性（仅当概念需要时）
- **第 3 轮**用场景题找出**隐藏的 gap**（仅当概念涉及多个领域交叉时）

### 什么时候可以跳过深度探测

满足以下任一条件，**跳过第 2-3 轮**，直接进入大纲阶段：

1. 用户说"别问了直接做"或表现出不耐烦
2. 概念很简单（如"什么是 HTTP 状态码"），1 轮自评已足够
3. 用户在第 1 轮全部选"不太懂"——起点已经明确，无需验证
4. 概念是你非常熟悉的领域，且前置知识少于 3 个模块

### 第 1 轮：知识地图初扫描（必问）

**做什么**：把目标概念拆解成 3-4 个前置知识模块，用 AskUserQuestion 一次性问。

**怎么拆**：想象你要从零讲这个概念，中间需要哪些"已知"才能继续。这些就是前置模块。

**示例 — 用户想学"数据库索引原理"**：

用 AskUserQuestion 同时问 3-4 个问题：
- 问题 1："你对数据库表结构（行、列、主键）的理解程度？" → 熟悉/了解/不太懂
- 问题 2："你对二叉树/B树这类数据结构的理解程度？" → 熟悉/了解/不太懂
- 问题 3："你对磁盘 I/O（为什么读硬盘比读内存慢）的理解程度？" → 熟悉/了解/不太懂
- 问题 4："你用过数据库的 EXPLAIN 或查询计划吗？" → 用过/听说过/没接触过

**示例 — 用户想学"React 状态管理"**：

- 问题 1："你对 JavaScript 闭包的理解程度？" → 熟悉/了解/不太懂
- 问题 2："你对 React 组件和 props 的理解程度？" → 熟悉/了解/不太懂
- 问题 3："你对"不可变数据"（immutable）这个概念的理解？" → 熟悉/了解/不太懂
- 问题 4："你用过 Redux/Zustand/Context 之类的状态库吗？" → 深度使用过/简单用过/没用过

每个问题用 AskUserQuestion 的 options 字段提供 2-3 个选项。

### 第 2 轮：深度探测——验证"了解"的真实含义（按需）

**触发条件**：第 1 轮中有 2 个以上模块用户选了"了解"或"熟悉"，且概念复杂度中等以上。

**做什么**：对第 1 轮中用户选了"了解"或"熟悉"的模块，用**探测性问题**验证真实理解深度。

**关键技巧——不要问"是什么"，要问"会怎样"**：

| 差的探测问题 | 好的探测问题 | 为什么好 |
|---|---|---|
| "什么是 B 树？" | "一个 B 树节点存 100 个 key，树高 3 层，最多能索引多少条记录？不确定可以猜" | 考的是理解而不是背定义 |
| "什么是闭包？" | "这段代码输出什么？`for(var i=0;i<3;i++){setTimeout(()=>console.log(i),0)}`" | 知道名词不代表能用 |
| "了解 HTTP 吗？" | "GET 和 POST 除了语义区别，在技术实现上有什么不同？说不确定也完全没关系" | 区分"知道名字"和"理解机制" |

**处理回答**：

- 回答**精确**（如"3 层 B 树最多 100^3 = 100 万条"）→ 标记为 ✅ 真的懂
- 回答**模糊但方向对**（如"应该挺多的，因为每层分叉很多"）→ 标记为 ⚠️ 有直觉但细节缺失，需要快速过一遍
- 回答**错误或说不知道**（如"不确定"或给出错误答案）→ 标记为 ❌ 需要从头讲
- 用户**跳过或说"差不多吧"** → 等同于 ❌，因为真懂的人通常会忍不住给出具体答案

这一轮仍然用 AskUserQuestion，但改为开放式问题（不提供选项，让用户自由回答），每轮问 2-3 个探测题。

### 第 3 轮：隐藏前置知识探测（按需）

**触发条件**：目标概念涉及 2 个以上领域交叉（如"分布式数据库"涉及网络+存储+并发），或第 2 轮暴露出意外 gap。

**做什么**：找出用户**不知道自己不知道**的东西。

用户不会主动说"我不懂 X"——因为他不知道 X 的存在，所以不知道自己需要懂 X。

**方法：场景推演法**

构造一个使用目标概念的**具体场景**，问用户"你觉得这里会发生什么？"。用户的回答（或困惑点）暴露出隐藏的知识 gap。

**示例 — 目标概念是"数据库索引"**：

> "假设你有一张 1000 万行的用户表，执行 `SELECT * FROM users WHERE email = 'test@example.com'`，你觉得数据库在底层大概需要做什么操作？凭直觉说就行。"

用户可能的回答和你的判断：
- "从第一行开始一行行找" → 懂全表扫描的概念，但不知道索引怎么避免它 → 需要讲索引的"跳过"机制
- "用什么树之类的查找？" → 知道有数据结构但不清楚具体 → 需要讲 B 树结构
- "不知道，直接找到？" → 不理解"查找"本身有成本 → 需要先讲"为什么查找有成本"（磁盘 I/O）

**示例 — 目标概念是"Transformer"**：

> "当你在 ChatGPT 输入"今天天气怎么样"然后它回复你，你觉得中间大概经历了几步？不用精确，凭感觉说。"

这一轮用 AskUserQuestion 问 2-3 个场景题。

### 第 4 轮：知识地图确认 + 偏好收集（必问）

**做什么**：把前几轮的发现汇总成一张"知识地图"，向用户确认，同时了解类比偏好和深度偏好。

用 AskUserQuestion 同时问：

**问题 1（确认知识地图）**：直接输出你的判断，让用户确认或纠正：

> "根据我们的对话，我的判断是：
> ✅ 你熟悉：[X, Y]
> ⚠️ 有概念但细节模糊：[A, B]
> ❌ 需要从头讲：[M, N]
> 
> 我打算从 [M] 开始讲起，[A/B] 快速过一遍，[X/Y] 跳过。有什么要调整的吗？"

选项：没问题 / 我觉得 [某项] 判断有误 / 其他调整

**问题 2（类比偏好）**：

> "你更容易通过什么类比来理解新概念？"
> 选项：日常生活类比（做饭、购物、排队）/ 工作场景类比（开会、工厂流水线）/ 其他技术类比（数据库、网络）/ 都行，你来选

**问题 3（深度偏好）**：

> "你希望演示讲到什么深度？"
> 选项：只要直觉理解就行 / 要理解具体机制（能复述给别人听）/ 要理解到数学/代码层面

### 模式 B（给别人讲）的额外探测

如果用户是给别人做演示，第 1 轮额外增加这些问题：

- "受众是谁？大概多少人？技术背景还是非技术？"
- "他们最大的误解通常是什么？（你在和他们交流中发现的）"
- "演示时长/步数有限制吗？"
- "演示场景是什么？（线下投屏 / 发链接自学 / 嵌入文档）"

然后在探测中，站在**受众的角度**而不是用户的角度来设计问题——问用户"你觉得你的受众能回答这个问题吗？"

### 知识探测的反模式——绝对不要做的事

1. **不要一次问超过 4 个问题** — AskUserQuestion 最多支持 4 个，但即使支持更多也不要超过 4 个。太多问题让用户感到被审问。
2. **不要机械地执行 3 轮** — 轮数应该根据概念复杂度动态调整。简单概念 1 轮足够。
3. **不要假设"工程师都懂 X"** — 10 年经验的后端工程师可能不懂 B 树的具体实现。资深前端可能不懂 TCP。不要基于身份假设知识。
4. **不要把探测结果藏在心里** — 第 4 轮必须明确输出你的判断让用户确认。你的判断可能是错的，用户有权纠正。
5. **不要在用户明显不耐烦时继续追问** — 如果用户表现出不耐烦，立即进入下一阶段。一个 70% 精确的知识地图 + 一个好演示，远胜于 95% 精确的地图 + 用户已经不想看了。

---

## 阶段三：设计大纲（1 轮确认）

根据提问收集到的信息，输出一个**结构化大纲**，包含：

```
## 演示大纲：[概念名称]

### 受众画像
- 已知：[列出]
- 模糊：[列出]
- 未知：[列出]

### 章节规划（每章 = 动画的一个"阶段"）
1. [章节名] — [核心类比]  
   前置知识：[需要先懂什么]  
   这一步解决：[学完后能回答什么问题]
   预计子步骤：N 个

2. [章节名] — [核心类比]
   ...

### 交互设计
- 小测验设置在：第 X 章后
- 可折叠补充放在：[哪些点]
- 预计总步数：约 N 步

### 类比体系
贯穿全文的主类比：[描述]
辅助类比（如有）：[描述]
```

等用户确认或修改后再动手生成 HTML。

**大纲阶段就要估算总步数**。如果预估少于 15 步，考虑是否需要拆分为更聚焦的主题；如果超过 40 步，建议拆分（见"特殊情况处理"）。

---

## 阶段四：生成 HTML

### 技术规范

- **框架**：Vue 3（CDN 引入 `https://unpkg.com/vue@3/dist/vue.global.prod.js`），单文件 HTML，无构建工具
- **动画**：CSS transition/animation 为主，可选引入 GSAP（`https://unpkg.com/gsap@3/dist/gsap.min.js`）用于复杂时间线
- **风格**：浅色科技风
  - 背景：`#f8fafc` 到 `#f1f5f9` 渐变
  - 卡片：白色 `#ffffff`，圆角 16px，轻微阴影 `0 1px 3px rgba(0,0,0,0.08)`
  - 强调色：蓝色系 `#3b82f6`，辅助绿 `#22c55e`、橙 `#f59e0b`、紫 `#8b5cf6`
  - 字体：`-apple-system, 'PingFang SC', 'Segoe UI', sans-serif`
  - 代码：`'SF Mono', 'Fira Code', monospace`，灰底 `#f1f5f9`
- **语言**：匹配用户使用的语言，技术术语首次出现时附原文
- **文件命名**：使用概念的英文 slug，如 `how-kv-cache-works.html` 或 `docker-vs-vm.html`

### 最重要的原则：阶段 ≠ 步骤，每个阶段必须有多个子步骤

**这是 skill 输出质量的生死线。** 静态 PPT 式的页面（每页一大段文字 + 一张图，点下一步换一页）不叫"交互式动画"。必须像下面这样设计：

**好的例子（KV Cache 演示做到的）：**
- "Prefill 阶段"是一个阶段，但包含 6 个子步骤：逐个 token 亮起 → 计算公式出现 → 表格逐行填入 → Q 列变灰划掉 → 因果掩码出现
- "自回归生成"是一个阶段，包含 8 个子步骤：新 token 出现 → Q 向量显示 → KV 追加到表格 → 注意力分数计算 → softmax 权重条出现 → 第二个 token 重复

**坏的例子（Docker 首版犯的错）：**
- "内核"是一个阶段，只有 1 步：一整页文字 + 一个层级图。用户点下一步直接跳到"虚拟机"

**怎么判断子步骤够不够？** 问自己：用户点一次"下一步"，屏幕上**有没有东西在动**（出现/消失/变色/变形/滑入/数字变化）？如果只是滚动到下一段文字，那就不是动画，是电子书。

### 强制性的动画/交互模式清单

每个阶段**至少使用 2 种**以下模式，否则不合格：

#### 1. 逐步构建（Progressive Build）

一个复杂的图/表格不要一次性显示完。每点一步，添加一个元素（一行表格、一个箭头、一个层级块）。新元素用 `animation: flashIn` 或 `transition: opacity/transform` 入场。

```css
/* 元素入场动画 */
@keyframes flashIn {
  0% { opacity: 0; transform: translateY(12px) scale(0.95); }
  60% { opacity: 1; transform: translateY(-2px) scale(1.02); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

.flash-in {
  animation: flashIn 0.4s ease-out forwards;
}
```

```vue
<!-- Vue 中使用 -->
<div v-if="localStep >= 2" class="flash-in">
  <!-- 这一步才出现的元素 -->
</div>
```

示例：架构层级图从底部（硬件）开始，每步往上叠一层。

#### 2. 高亮聚焦（Spotlight）

当前讲解的元素高亮（边框发光、放大、颜色加深），其他元素降低透明度 `opacity: 0.3`。

```css
.spotlight-active {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.4), 0 4px 12px rgba(59, 130, 246, 0.15);
  transform: scale(1.05);
  transition: all 0.3s ease;
}

.spotlight-dimmed {
  opacity: 0.3;
  transition: opacity 0.3s ease;
}
```

示例：讲内核时，层级图中内核那一层边框发光，其他层变灰。

#### 3. 数据流动画（Data Flow）

用箭头/连线展示数据从 A 流向 B。箭头可以有 CSS 动画（虚线流动、脉冲）。

```css
/* 流动虚线动画 */
@keyframes flowDash {
  0% { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: -20; }
}

.flow-line {
  stroke-dasharray: 8 4;
  animation: flowDash 1s linear infinite;
}

/* 脉冲效果 */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.pulse {
  animation: pulse 2s ease-in-out infinite;
}
```

示例：程序发起读文件请求 → 箭头动画 → 到达内核 → 箭头动画 → 到达硬盘。

#### 4. 对比并排 + 逐项出现（Compare & Reveal）

左右两栏对比时，不要一次显示所有对比项。每点一步显示一行对比，让用户逐个消化。每行出现时高亮差异点。

```vue
<div class="compare-container">
  <div class="compare-column left">
    <div v-if="localStep >= 0" class="flash-in">对比项 1 - 方案 A</div>
    <div v-if="localStep >= 2" class="flash-in">对比项 2 - 方案 A</div>
    <div v-if="localStep >= 4" class="flash-in">对比项 3 - 方案 A</div>
  </div>
  <div class="compare-column right">
    <div v-if="localStep >= 1" class="flash-in highlight">对比项 1 - 方案 B</div>
    <div v-if="localStep >= 3" class="flash-in highlight">对比项 2 - 方案 B</div>
    <div v-if="localStep >= 5" class="flash-in highlight">对比项 3 - 方案 B</div>
  </div>
</div>
```

#### 5. 状态变化（State Change）

某个元素从状态 A 变成状态 B，用 CSS transition 过渡。

```css
.state-transition {
  transition: all 0.5s ease;
}

.state-normal {
  background: #ffffff;
  border-color: #e2e8f0;
}

.state-active {
  background: #eff6ff;
  border-color: #3b82f6;
}

.state-error {
  background: #fef2f2;
  border-color: #ef4444;
}
```

示例：一个进程从"运行中"（绿色）变成"被隔离"（加上虚线边框 + 锁图标）。

#### 6. 可拖拽/可点击的探索区（Interactive Explore）

用户可以点击架构图的某一层，展开该层的详细信息。或者：滑动条调整参数，实时看效果变化。

```vue
<!-- 点击展开详情 -->
<div 
  v-for="layer in layers" 
  :key="layer.name"
  class="layer-card"
  :class="{ expanded: expandedLayer === layer.name }"
  @click="expandedLayer = expandedLayer === layer.name ? null : layer.name"
>
  <div class="layer-header">{{ layer.name }}</div>
  <div v-if="expandedLayer === layer.name" class="flash-in layer-detail">
    {{ layer.details }}
  </div>
</div>

<!-- 滑块调参 -->
<div class="slider-control">
  <label>容器数量: {{ containerCount }}</label>
  <input type="range" v-model.number="containerCount" min="1" max="20">
</div>
<div class="resource-bar" :style="{ width: containerCount * 50 + 'px' }"></div>
```

#### 7. 动画计时器/进度指示（Timed Animation）

带计时器的动画：模拟虚拟机启动 30 秒 vs Docker 0.5 秒。用 CSS animation + setInterval 实现倒计时效果。

```vue
<!-- 并行进度条 -->
<div class="progress-compare">
  <div class="progress-item">
    <span>虚拟机启动</span>
    <div class="progress-bar">
      <div class="progress-fill vm" :style="{ width: vmProgress + '%' }"></div>
    </div>
    <span>{{ vmSeconds.toFixed(1) }}s</span>
  </div>
  <div class="progress-item">
    <span>容器启动</span>
    <div class="progress-bar">
      <div class="progress-fill container" :style="{ width: containerProgress + '%' }"></div>
    </div>
    <span>{{ containerSeconds.toFixed(1) }}s</span>
  </div>
</div>
```

```javascript
// 自动播放时的计时逻辑
let timer = null;
const tick = () => {
  elapsed.value += 50; // 每 50ms 更新一次
  vmProgress.value = Math.min(100, (elapsed.value / 30000) * 100);
  containerProgress.value = Math.min(100, (elapsed.value / 500) * 100);
  if (vmProgress.value < 100 || containerProgress.value < 100) {
    timer = setTimeout(tick, 50);
  }
};
```

### 每阶段子步骤数量要求

| 阶段类型 | 最少子步骤 | 说明 |
|---|---|---|
| 简单概念（如"什么是分词"） | 3 个 | 定义 → 例子 → 对比 |
| 核心概念（如"自注意力计算"） | 5 个 | 逐步展开复杂过程 |
| 对比类（如"Docker vs VM"） | 4 个 | 至少 4 个对比项逐项出现 |
| 引入/总结类 | 2 个 | 最少，但也要有过渡动画 |
| **整个演示** | **不少于 20 步** | 推荐 25-35 步 |

### 必须包含的交互功能

#### 1. 播放控制栏（底部固定）

```vue
<!-- 播放控制栏模板 -->
<div class="playback-bar">
  <button @click="prevStep" :disabled="globalStep === 0" class="btn">⏮</button>
  <button @click="toggleAutoPlay" class="btn">
    {{ isPlaying ? '⏸' : '▶' }}
  </button>
  <button @click="nextStep" :disabled="globalStep >= totalSteps - 1" class="btn">⏭</button>
  <div class="progress-track">
    <div class="progress-fill" :style="{ width: (globalStep / (totalSteps - 1) * 100) + '%' }"></div>
  </div>
  <span class="step-counter">{{ globalStep + 1 }} / {{ totalSteps }}</span>
</div>
```

- 键盘快捷键：← → 空格
- 自动播放速度：每步 2-3 秒，可配置

#### 2. 阶段导航栏（顶部）

```vue
<!-- 阶段导航模板 -->
<div class="stage-nav">
  <div 
    v-for="(stage, idx) in stages" 
    :key="idx"
    class="stage-chip"
    :class="{ 
      active: currentStage === idx, 
      done: getStageEndStep(idx) < globalStep 
    }"
    @click="jumpToStage(idx)"
  >
    <span v-if="getStageEndStep(idx) < globalStep">✓ </span>
    {{ stage.name }}
  </div>
</div>
```

#### 3. 可折叠的补充说明

```vue
<!-- 可折叠组件模板 -->
<div class="collapsible">
  <button @click="expanded = !expanded" class="collapsible-trigger">
    {{ expanded ? '收起' : '📖 想深入了解？点击展开' }}
  </button>
  <div v-show="expanded" class="collapsible-content flash-in">
    <slot></slot>
  </div>
</div>
```

放在：真实数据/数量级、历史背景、与其他概念的对比。

#### 4. 小测验（每 3-5 个阶段后插入一个）

```vue
<!-- 小测验模板 -->
<div class="quiz-card" v-if="showQuiz1">
  <h3>🧠 小测验</h3>
  <p>{{ quiz1.question }}</p>
  <div v-if="!quiz1.answered" class="quiz-options">
    <button 
      v-for="(opt, i) in quiz1.options" 
      :key="i"
      @click="answerQuiz1(i)"
      class="quiz-option"
    >
      {{ opt.text }}
    </button>
  </div>
  <div v-else class="quiz-result" :class="quiz1.correct ? 'correct' : 'incorrect'">
    <p>{{ quiz1.correct ? '✅ 正确！' : '❌ 不太对' }}</p>
    <p>{{ quiz1.explanation }}</p>
  </div>
</div>
```

设计原则：
- 不考记忆考理解
- 错误选项是常见误解，不是明显荒谬的答案
- 答对答错都给解释，说明"为什么对/为什么错"

### 步骤管理的推荐模式

用全局步骤计数器 + 每个阶段的 localStep 计算：

```javascript
// 步骤管理核心逻辑
const stages = [
  { name: '速度差异', steps: 4 },
  { name: '内核', steps: 5 },
  { name: '虚拟机', steps: 4 },
  { name: '容器', steps: 5 },
  { name: '对比总结', steps: 4 },
];

const totalSteps = stages.reduce((s, st) => s + st.steps, 0);
const globalStep = ref(0);

// 计算当前所在阶段
const currentStage = computed(() => {
  let acc = 0;
  for (let i = 0; i < stages.length; i++) {
    if (globalStep.value < acc + stages[i].steps) return i;
    acc += stages[i].steps;
  }
  return stages.length - 1;
});

// 计算阶段内步骤
const localStep = computed(() => {
  let acc = 0;
  for (let i = 0; i < currentStage.value; i++) acc += stages[i].steps;
  return globalStep.value - acc;
});

// 导航方法
function nextStep() {
  if (globalStep.value < totalSteps - 1) globalStep.value++;
}
function prevStep() {
  if (globalStep.value > 0) globalStep.value--;
}
function jumpToStage(idx) {
  let acc = 0;
  for (let i = 0; i < idx; i++) acc += stages[i].steps;
  globalStep.value = acc;
}

// 自动播放
const isPlaying = ref(false);
let autoTimer = null;
function toggleAutoPlay() {
  isPlaying.value = !isPlaying.value;
  if (isPlaying.value) {
    autoTimer = setInterval(() => {
      if (globalStep.value < totalSteps - 1) {
        nextStep();
      } else {
        isPlaying.value = false;
        clearInterval(autoTimer);
      }
    }, 2500); // 每 2.5 秒一步
  } else {
    clearInterval(autoTimer);
  }
}
```

然后在模板中用 `v-if="localStep >= N"` 控制每个子元素的出现时机。每个新出现的元素加上入场动画。

### 内容生成原则

1. **每一步只出现一个新元素**。用户点"下一步"，屏幕上有且只有一个东西发生变化（一行出现、一个高亮、一个动画启动）。不要一步变三个东西。

2. **类比先行，术语后置**。先用类比建立直觉，然后再说"这个东西在技术上叫做 XXX"。永远不要反过来。

3. **数字要具体**。不要说"很多层"，说"32 层"。不要说"占用资源大"，说"一个虚拟机最少占 1-2 GB 内存"。

4. **每个新概念都需要一个"为什么"**。不是"虚拟机有 Hypervisor"，而是"物理硬件只有一套，但你想在上面跑 3 个独立的操作系统——谁来当裁判分配资源？这个裁判就是 Hypervisor"。

5. **步骤之间要有视觉连续性**。上一步高亮的元素在下一步应该还在（只是不再高亮），让用户感觉是"同一个画面在演进"，而不是"切换到了一个全新的页面"。

6. **每个阶段末尾有一个"关键要点"框**。绿色左边框，一句话总结。

```vue
<!-- 关键要点框模板 -->
<div class="key-takeaway">
  <div class="key-takeaway-label">💡 关键要点</div>
  <div class="key-takeaway-text">[一句话总结]</div>
</div>
```

```css
.key-takeaway {
  background: #f0fdf4;
  border-left: 4px solid #22c55e;
  border-radius: 8px;
  padding: 12px 16px;
  margin-top: 16px;
}
.key-takeaway-label {
  font-weight: 600;
  color: #15803d;
  font-size: 14px;
  margin-bottom: 4px;
}
.key-takeaway-text {
  color: #166534;
  font-size: 15px;
  line-height: 1.5;
}
```

7. **小测验**设计原则：不考记忆考理解，错误选项是常见误解，答对答错都给解释。

### HTML 结构模板

生成的 HTML 应该遵循这个骨架（具体内容根据主题变化）：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[概念名称] — 交互式演示</title>
  <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
  <style>
    /* 基础重置和变量 */
    :root {
      --primary: #3b82f6;
      --success: #22c55e;
      --warning: #f59e0b;
      --purple: #8b5cf6;
      --bg-start: #f8fafc;
      --bg-end: #f1f5f9;
      --card-bg: #ffffff;
      --text: #1e293b;
      --text-secondary: #64748b;
      --border: #e2e8f0;
      --code-bg: #f1f5f9;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, 'PingFang SC', 'Segoe UI', sans-serif;
      background: linear-gradient(180deg, var(--bg-start), var(--bg-end));
      color: var(--text);
      min-height: 100vh;
    }
    
    /* 动画关键帧 */
    @keyframes flashIn { ... }
    @keyframes flowDash { ... }
    @keyframes pulse { ... }
    
    /* 布局组件 */
    .stage-nav { ... }
    .main-content { ... }
    .playback-bar { ... }
    
    /* 内容组件 */
    .card { ... }
    .key-takeaway { ... }
    .collapsible { ... }
    .quiz-card { ... }
    
    /* 可视化组件 */
    .diagram { ... }
    .compare-container { ... }
    .progress-bar { ... }
  </style>
</head>
<body>
  <div id="app">
    <!-- 顶部标题 + 阶段导航 -->
    <header>
      <h1>[概念名称]</h1>
      <p class="subtitle">[副标题/一句话描述]</p>
      <nav class="stage-nav">...</nav>
    </header>
    
    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 根据 currentStage 和 localStep 条件渲染 -->
      <section v-if="currentStage === 0">
        <!-- 阶段 0 的内容 -->
      </section>
      <section v-if="currentStage === 1">
        <!-- 阶段 1 的内容 -->
      </section>
      <!-- ... -->
    </main>
    
    <!-- 底部播放控制栏 -->
    <footer class="playback-bar">...</footer>
  </div>
  
  <script>
    const { createApp, ref, computed, watch } = Vue;
    createApp({
      setup() {
        // 步骤管理
        // 自动播放
        // 测验逻辑
        // 其他状态
        return { ... };
      }
    }).mount('#app');
  </script>
</body>
</html>
```

---

## 阶段五：交付与迭代

1. 用 Write 工具保存 HTML 文件到 `/Users/wangx/.qoderwork/workspace/mo1a39dtc4rx997o/outputs/` 目录
2. 用 Bash 的 `open` 命令在浏览器中打开文件
3. **先自己检查一遍**（见下方自检清单）
4. 问用户：
   - "有没有哪一步你觉得跳太快了？"
   - "类比是否贴切？有没有更好的类比？"
   - "小测验的难度合适吗？"
5. 根据反馈修改并重新打开

### 交付前自检清单

生成 HTML 后、打开给用户看之前，**必须逐项检查**：

- [ ] **总步数 ≥ 20 步**（推荐 25-35 步）
- [ ] **每个阶段 ≥ 2 种动画/交互模式**
- [ ] **每个阶段 ≥ 2 个子步骤**（简单概念 ≥ 3，核心概念 ≥ 5）
- [ ] **每一步只有一个元素变化**（没有一步变多个的情况）
- [ ] **至少 1 个小测验**（每 3-5 个阶段插入一个）
- [ ] **每个阶段末尾有关键要点框**
- [ ] **有可折叠的补充说明**
- [ ] **播放控制栏完整**（上一步/播放/下一步/进度条/步数显示）
- [ ] **阶段导航可点击跳转**
- [ ] **键盘快捷键工作**（← → 空格）
- [ ] **文件可在浏览器中直接打开**（无 CDN 外的外部依赖）
- [ ] **无 console 错误**（在浏览器开发者工具中检查）
- [ ] **语言匹配用户使用的语言**
- [ ] **类比和数字符合"内容生成原则"**

如果任何一项不通过，修复后再交付。

---

## 特殊情况处理

### 概念太大怎么办？

如果大纲阶段预估超过 **40 步**才能讲清楚（如"从零理解深度学习"），建议拆分成多个 HTML 文件，每个覆盖一个子主题。告诉用户：

> "这个主题比较大，我建议拆成 3 个独立的演示页面：① 基础篇 ② 核心篇 ③ 进阶篇。每个大约 10-15 步。先做哪个？"

拆分标准：
- **15-25 步**：适合做一个独立的 HTML
- **25-40 步**：可以做一个较长的 HTML，但考虑是否拆成 2 个
- **40 步以上**：建议拆分

### 概念太小怎么办？

如果预估少于 **12 步**，考虑以下策略：
- 增加"为什么重要"的背景章节
- 增加一个"常见误解"对比章节
- 增加一个小测验
- 增加更多可视化细节（如数据流动画、状态变化）

目标：即使概念简单，也要让用户觉得"这个演示比我直接看文档有价值"。

### 用户说"别问了直接做"

尊重用户的节奏。跳过深度提问，基于已有信息做一个"中等深度"的版本（假设受众有基础概念但不熟悉细节）。生成后主动问"有没有哪里讲得太深或太浅？"

### 用户说"给小朋友/完全外行讲"

把所有类比换成日常生活场景（超市购物、做饭、排队等），避免任何技术类比。数字用最小的（d=2 而不是 d=4）。每步文字控制在 50 字以内。加更多的小测验。

### 用户要演示给领导/客户看

减少技术细节，增加"这意味着什么"的商业视角。每个阶段末尾加一个"业务价值"框。视觉风格更正式，减少 emoji。

### HTML 打开后有 bug

如果用户反馈页面有问题（动画不工作、按钮没反应等）：

1. 用 Bash 的 `open` 命令打开文件，用 `snapshot` 或 `screenshot` 查看页面
2. 用 `evaluate` 在浏览器控制台检查错误
3. 定位问题，用 Edit 工具修复
4. 重新打开验证
5. 如果是 Vue 逻辑错误，优先用 `evaluate` 直接在控制台测试修复方案，确认有效后再改文件

### 用户想修改已有的 HTML

- 如果是内容修改（换类比、加章节），直接 Edit 工具修改
- 如果是风格修改（换颜色、换字体），修改 CSS 变量
- 如果是功能增强（加新的交互模式），在现有 Vue setup 中添加
- 每次修改后重新打开验证

---

## 附录：常见主题的前置知识参考

当你接到一个新主题时，可以参考以下常见领域的前置知识拆解：

| 主题 | 前置知识模块 |
|---|---|
| 数据库索引 | 表结构、树数据结构、磁盘 I/O、查询执行 |
| React 状态管理 | 闭包、组件/props、不可变数据、状态库 |
| Docker/容器 | 操作系统内核、进程隔离、虚拟化概念 |
| Transformer/注意力 | 词嵌入、序列处理、矩阵运算基础 |
| Kubernetes | 容器基础、网络基础、分布式系统直觉 |
| 负载均衡 | HTTP 基础、并发概念、网络拓扑直觉 |
| 缓存策略 | 内存 vs 磁盘速度差异、时间/空间权衡直觉 |
| 微服务架构 | 单体架构痛点、API 通信、故障隔离概念 |

