# VisioQuant Analytics (Core Logic Manifesto) 🧠📊

**VisioQuant** 是一款专为 AI 计算机视觉算法工程师设计的工业级量化评估系统。它不仅仅是一个指标计算器，更是一套遵循“核心逻辑宣言 (Core Logic Manifesto)”的效能量化方法论，旨在帮助开发者从“模型产出”与“现实真值”的对撞中提炼最真实的能力画像。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg?logo=tailwind-css&logoColor=white)
![Data Privacy](https://img.shields.io/badge/Data-100%25_Local-green.svg)

## 📐 核心逻辑宣言 (Core Logic Manifesto)

本项目拒绝模棱两可的输入，强制要求建立在以下三个核心观测值之上：

1.  **AI 总数 (Pred Total) [权重最高]**: 衡量模型在画面中产生的所有预测框/结果。它是评估模型“胆量”与“废话率”的基石。
2.  **有效命中 (TP)**: 经过 IOU 或其他准则校验后的正确预测。
3.  **真值总数 (GT)**: 场景中实际存在的目标总数。

### 核心推导公式：
-   **误报数 (FP) = AI 总数 - 有效命中**: 每一笔不在 TP 之内的预测都是模型的“无效噪音”。
-   **漏报数 (FN) = 真值总数 - 有效命中**: 每一笔未被 TP 覆盖的真值都是模型的“职责缺失”。
-   **精确率 (Precision) = TP / AI 总数**: 衡量模型说出的话里，有多少是真理（抗干扰力）。
-   **误报率 (FAR) = FP / AI 总数**: 衡量模型产出的“废话占比”。

---

## ✨ 核心特性

### 1. 🛠️ 革命性的输入体验
-   **AI 总数优先布局**: 界面遵从“产出 -> 现实 -> 命中”的认知逻辑，突出模型画框总数对指标的影响。
-   **双重评估模式**: 
    -   **数量模式 (Count)**: 极简录入，快速得出核心指标。
    -   **空间模式 (Spatial)**: 引入 COCO 标准尺度划分（Small, Medium, Large），自动计算空间尺度分布及 GT 总和。

### 2. 📊 全维度可视化
-   **五维能力画像 (Radar Chart)**: 从精确度、召回力、综合 F1、抗噪性（1-FAR）、效能比（G-Mean）五个维度对模型进行全方位扫描。
-   **性能趋势分析 (Trend)**: 自动绘制版本更迭曲线，直观展现模型调优路径。

### 3. 💾 工业级数据管理
-   **完全本地化 (Local-first)**: 采用 `LocalStorage` 存储，数据永不出库，确保核心算法性能数据的绝对隐私。
-   **Localized CSV Export**: 支持根据当前语言（中/英）导出对应表头的 CSV 文件，数值逻辑深度优化，核心指标（Recall, Precision, FAR）自动转化为**百分比格式**。
-   **快照备份**: 支持 JSON 格式的完整数据库导出与恢复，方便在不同设备间迁移评估记录。

## 🚀 快速开始

### 环境要求
- 现代浏览器 (Chrome, Edge, Firefox, Safari)。

### 安装运行 (无需构建)
1.  **克隆仓库**
2.  **启动静态服务**
    ```bash
    npx serve .
    ```
3.  **浏览器访问**: `http://localhost:3000`

## 📖 使用指南

1.  **模型定义**: 输入模型名称、版本、置信度阈值及测试场景。
2.  **数据对撞**: 依次录入 **AI 总数 (模型画框数)**、**真值总数 (GT)**、**有效命中 (TP)**。
3.  **即时反馈**: 右侧预览区域将实时生成指标与雷达图，通过 FAR 与 Precision 的对冲直观感受模型的“纯净度”。
4.  **历史追溯**: 保存记录后，可在仪表盘下方或“数据资产”页面查看、加载或删除历史记录。
5.  **汇报生成**: 切换到中文模式，导出符合中文汇报逻辑的 CSV 报表。

---

## 📄 许可证
本项目基于 MIT 许可证开源。