# Orin-WebUI

> **Orin CI/CD Engine Web Console**  
> 专为 Quantum Original 服务端自动化 CI/CD 引擎 Orin 打造的现代 WebUI 控制台。

---

## 规范与设计语言

遵循 [Quantum Original 前端设计规范与设计系统 (Strict Right-Angle, Zero-Glow, Zero-Gradient, Zero-Emoji)](file:///Users/glowingstone/QuantumOriginal/Frondend-Design/DESIGN_SPEC.md)：
- **0px 纯直角几何**：全系统按钮、卡片、输入框、模态弹窗与指示方块统一采用 `border-radius: 0`。
- **纯平表面 (Flat Solid Surfaces)**：零发光、零弥散阴影、零复杂渐变。
- **零 Emoji**：采用纯排版字符与矢量图标。
- **动态亮暗双模主题**：支持自适应系统与全局手动切换，基准色彩严格基于 Quantum Blue (`#2563EB` / `#5B9BF6`)。

---

## 核心特性

- **控制台总览 (Dashboard)**：实时监测 Runner 队列容量、活跃任务数、已注册流水线与近期构建运行。
- **流水线控制 (Pipelines)**：查看所有已配置流水线及关联代码仓库、触发器、执行 Action 步骤，并支持一键手动触发（支持动态参数 Key-Value 与 Token 鉴权）。
- **任务运行与实时日志 (Jobs & Live Terminal)**：
  - 任务状态过滤（`QUEUED`、`RUNNING`、`SUCCESS`、`FAILED`）。
  - 双栏式任务详情与工业风实时日志终端（支持自动滚动、日志筛选、一键复制、行号索引）。
  - 构建产物 (Artifacts) 一键下载。
- **多节点集群拓扑 (Cluster Nodes)**：直观展示本地 Orin 主机与注册的各远程 Worker 节点，支持在线连通性探测 (Ping / Latency)。
- **服务配置 (Settings)**：支持自定义 Orin 服务端 API Base URL 及默认鉴权密钥。

---

## 开发与构建

### 1. 安装依赖
```bash
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```
开发服务器默认运行在 `http://localhost:5173`，并通过 Vite Proxy 自动将 `/api` 与 `/remote` 转发到本地 Orin 服务（`http://localhost:9912`）。

### 3. 构建生产产物
```bash
npm run build
```
编译产物输出至 `dist/` 目录，可作为独立 SPA 托管或嵌入至 Orin 服务的静态资源目录中。

---

## 关联项目

- **Orin 核心引擎**: [QuantumOriginal/orin](https://github.com/glowingstone124/Orin)
- **Quantum Original 设计系统**: [QuantumOriginal/Frondend-Design](file:///Users/glowingstone/QuantumOriginal/Frondend-Design)

Copyright (c) 2026 Quantum Original & Holographic Lab.
