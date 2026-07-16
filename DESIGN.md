---
version: alpha
name: 工具匣
description: 本地开发者工具箱 — 中性近黑单色界面，白/灰层级，Raycast 式克制高级感
colors:
  canvas: "#09090b"
  canvas-elevated: "#0f0f11"
  sidebar: "#0c0c0e"
  panel: "#121214"
  editor: "#0e0e10"
  editor-gutter: "#09090b"
  ink-heading: "#fafafa"
  ink: "#e4e4e7"
  ink-muted: "#a1a1aa"
  hairline: "#27272a"
  hairline-strong: "#3f3f46"
  accent: "#fafafa"
  accent-hover: "#e4e4e7"
  on-accent: "#09090b"
  link: "#d4d4d8"
  accent-soft: "rgba(255, 255, 255, 0.06)"
  accent-muted: "rgba(255, 255, 255, 0.04)"
  success: "#4ade80"
  error: "#f87171"
  warning: "#fbbf24"
  diff-remove: "rgba(255, 107, 107, 0.14)"
  diff-add: "rgba(62, 207, 142, 0.12)"
typography:
  headline:
    fontFamily: IBM Plex Sans
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.025em
  title:
    fontFamily: IBM Plex Sans
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: -0.01em
  body:
    fontFamily: IBM Plex Sans
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  body-sm:
    fontFamily: IBM Plex Sans
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  label:
    fontFamily: IBM Plex Sans
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0
  caption:
    fontFamily: IBM Plex Sans
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0.01em
  mono:
    fontFamily: IBM Plex Mono
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0
rounded:
  sm: 6px
  md: 10px
  pill: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  sidebar-width: 240px
  page-max: 960px
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "#ffffff"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: 8px 12px
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
  button-secondary:
    backgroundColor: "{colors.canvas-elevated}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: 8px 12px
  nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.ink-muted}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: 9px 12px
  nav-item-active:
    backgroundColor: "{colors.accent-soft}"
    textColor: "{colors.ink-heading}"
    rounded: "{rounded.sm}"
  tool-card:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink-heading}"
    typography: "{typography.title}"
    rounded: "{rounded.md}"
    padding: 18px 20px
  editor-panel:
    backgroundColor: "{colors.editor}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: 0px
  privacy-chip:
    backgroundColor: "{colors.accent-muted}"
    textColor: "{colors.ink-muted}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 5px 10px
---

# Design System: 工具匣

## Overview

**Creative North Star: "The Quiet Workbench"**

工具匣的视觉追求**克制的高级感**：中性近黑底、精确的灰阶文字、白色主 CTA——对齐 Raycast 的单色 chrome 逻辑，而非彩色 SaaS 或暖色工坊风。彩色只留给语义状态（成功/错误/警告），日常交互全部在黑白灰体系内完成。

**设计参考：** Raycast（getdesign.md）— 近黑画布、发丝边框、白 CTA、彩色仅作点缀。

**关键特征：**
- 单色暗色：无蓝调、无暖橙 accent
- 主 CTA 为白底黑字（`#fafafa` on `#09090b`）
- 链接/次要强调用 `#d4d4d8`，不用饱和色
- 圆角略收紧（6px / 10px），更利落
- 密度偏高，侧栏 + 双栏编辑器布局不变

**明确拒绝：** SaaS 落地页套路、渐变英雄区、三列等宽功能卡片、紫色 AI 霓虹、假数据指标、装饰性动画。

## Colors

调色板以**中性锌灰近黑**为基底，白/灰为交互色，语义色仅用于状态。

### Primary（交互）
- **Paper White**（`#fafafa`）：主按钮填充、最高对比强调。
- **Paper Hover**（`#e4e4e7`）：主按钮悬停。
- **On Accent**（`#09090b`）：主按钮文字色。
- **Silver Link**（`#d4d4d8`）：文本链接、下划线操作。
- **Ghost Soft**（`rgba(255,255,255,0.06)`）：激活导航、次级强调底。

### Neutral（表面与文字）
- **Void Canvas**（`#09090b`）：根背景。
- **Elevated**（`#0f0f11`）：顶栏。
- **Sidebar**（`#0c0c0e`）：侧栏。
- **Panel**（`#121214`）：卡片、工具栏。
- **Editor**（`#0e0e10`）：编辑区。
- **Snow Heading**（`#fafafa`）/ **Zinc Body**（`#e4e4e7`）/ **Zinc Muted**（`#a1a1aa`）：文字阶梯。
- **Zinc Hairline**（`#27272a` / `#3f3f46`）：边框。

### Semantic
- **Mint Success**（`#3ecf8e`）：JSON 校验通过、隐私盾牌图标。
- **Coral Error**（`#ff6b6b`）：解析错误、diff 删除侧。
- **Amber Caution**（`#fbbf24`）：警告。

### Named Rules
**The Monochrome Rule.** 除语义色外，界面不使用饱和 accent 色。高级感来自灰阶精度，而非彩色。

**The White CTA Rule.** 每屏最重要的操作使用白底黑字主按钮，不用彩色实心按钮。

## Typography

**Display / UI Font:** IBM Plex Sans（`PingFang SC`, `Noto Sans SC`, system-ui 回退）
**Mono Font:** IBM Plex Mono（`SF Mono`, `JetBrains Mono`, ui-monospace 回退）

**Character:** 工程感、可读优先。标题用 600 字重 + 微负字距，正文 15px 基准，代码区全部 mono。

### Hierarchy
- **Headline**（600, 1.75rem / 28px, -0.025em）：页面标题、工具名。
- **Title**（600, 18px）：卡片标题、面板头。
- **Body**（400, 15px, 1.5）：界面默认字号。
- **Body Small**（400, 14px）：描述、Markdown 预览正文。
- **Label**（500, 13px）：按钮、导航、工具栏。
- **Caption**（400, 12px）：状态标签、行号、元数据。
- **Mono**（400, 12–13px）：代码、diff、错误位置、JSON 键值。

### Named Rules
**The Mono-for-Code Rule.** 编辑器、diff、行号、内联 code 一律 IBM Plex Mono；UI 标签不用 mono。

**The 56ch Rule.** 描述性段落最大宽度约 56ch，避免工具页说明文字拉满全宽。

## Layout

**App Shell：** 桌面端 `240px` 固定侧栏 + `1fr` 主栏（`grid-template-columns: 240px minmax(0, 1fr)`）。`< 1080px` 侧栏折叠至顶部横排导航。

**Page Content：** 内边距 `24px`（移动端 `16px`）。首页内容区 `max-width: 960px`。

**Editor Grid：** JSON / Markdown 工具使用双栏 `1fr 1fr` 网格，`< 1080px` 单列堆叠。编辑区最小高度 `360px`（移动端 `280px`）。

**Spacing Scale：** 4 / 8 / 12 / 16 / 24px。组件内部 gap 通常 8–12px，区块间距 16–24px。

**Touch Targets：** 交互元素最小 44px 高度（移动端按钮可适当缩小 padding 但保持可点）。

## Elevation & Depth

本系统**不使用阴影表达层级**。深度完全由：
1. 表面色调递进（见 Surface Ladder Rule）
2. 1px `hairline` 边框
3. 悬停时边框色加深或 accent 色调入

唯一例外：模态对话框使用 `box-shadow: 0 16px 48px rgba(0, 0, 0, 0.45)` + `backdrop-filter: blur(4px)`，表示临时叠加层。

## Shapes

- **Radius SM**（8px）：按钮、导航项、输入框、小图标容器、内联 code。
- **Radius MD**（12px）：工具卡片、编辑面板、工具栏、对话框。
- **Pill**（9999px）：隐私 chip、badge、圆角标签。

圆角偏中等，不走极度方正（IBM Carbon）也不走大圆角卡片风。保持工具感。

## Components

### Sidebar Navigation
- 侧栏宽 240px，品牌区 + 垂直 `nav-item` 列表。
- 默认：透明底、`ink-muted` 文字；悬停：`rgba(255,255,255,0.04)` 底。
- 激活：`accent-soft` 底 + `rgba(232,148,58,0.22)` 边框 + `ink-heading` 文字；图标变 `accent-hover`。
- 禁用工具显示 `badge`「即将上线」，整项 `opacity: 0.55`。

### Tool Cards（首页）
- `panel` 底 + `hairline` 边框 + `radius-md`，最小高度 168px。
- 悬停：边框带 accent 色调、背景微亮（`#161f2a`）。
- 图标容器 40×40，`accent-soft` 底。CTA 文字用 `accent` 色 13px。

### Buttons
- **Primary：** `accent` 实心白字，悬停 `accent-hover`，按下 `translateY(1px)`。
- **Secondary / Default：** `canvas-elevated` 底 + `hairline` 边框。
- **Accent：** `accent-soft` 底，暖金文字（`#f0d4a8`）。
- **Ghost：** 透明底，悬停微白底。
- **Danger：** 珊瑚红半透明底，用于破坏性操作。
- 焦点：`focus-ring` = 2px canvas 间隙 + 2px accent 外环。

### Toolbar
- `panel` 底容器，内部分组用右边框分隔（`toolbar-group`）。
- 按钮紧凑：13px 字号，7–11px 内边距。

### Editor Panels
- 外框 `editor` 底 + `hairline` 边框 + `radius-md`。
- 面板头 `panel` 底，14px 标题 + 12px 元数据/错误信息。
- CodeMirror 区域填满剩余高度，背景与 `editor` 一致。

### Document Tabs
- 横向标签条，`panel` 容器包裹。
- 单标签：`canvas-elevated` 底，激活时 `accent-soft` + accent 边框。
- 状态点：灰（默认）、绿（valid）、红（invalid）。

### Work Mode Switch
- 分段控制器：3px 内边距轨道，激活项 `accent-soft` 底。

### Diff View
- 双列等宽 grid，mono 12px。
- 删除行：左列 `diff-remove` 底 + 浅红字；新增行：右列 `diff-add` 底 + 浅绿字。
- 比较模式左/右标签分别用红/绿色调边框区分。

### Privacy Chip（顶栏）
- Pill 形，绿色盾牌图标 +「本地处理，数据不上传服务器」文案。
- `accent-muted` 底，不抢眼但始终可见。

### Dialogs
- 全屏半透明遮罩 + 居中面板，`max-width: 1100px`，`max-height: 85vh`。
- 头/尾用 `hairline` 分隔，操作按钮右对齐。

### Markdown Preview
- 14px / 1.7 行高，标题逐级加大，链接 `accent-hover` 下划线。
- 代码块 `#0a0f16` 底，表格用 `hairline` 网格。

## Do's and Don'ts

**Do**
- 保持深色表面阶梯一致，新工具页复用 `app-shell` + `editor-grid` 结构
- 新工具入口同时出现在侧栏导航和首页 `tool-grid`
- 错误态 Inline 展示，附可操作恢复（如「跳转到错误位置」）
- 尊重 `prefers-reduced-motion`：过渡缩短，禁用按下位移
- 中文文案简洁直接，描述工具能做什么

**Don't**
- 不要引入浅色模式或破坏现有 CSS 变量命名
- 不要用投影代替边框做日常层级
- 不要添加 hero 营销区块、假统计数据、emoji 装饰
- 不要换成 Inter / 系统默认 sans — 保持 IBM Plex 系列
- 不要用饱和色 accent（蓝、橙、紫）作日常 UI 主色
- 不要用暖色工坊风或 SaaS 渐变
- 不要上传用户数据到服务器 — 隐私定位是核心品牌约束，须在 UI 中可见
