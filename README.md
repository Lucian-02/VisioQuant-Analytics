
# VisioQuant Analytics 🧠📊

**VisioQuant** 是一款专为 AI 计算机视觉算法工程师设计的工业级量化评估系统。它提供实时指标计算、多维能力画像以及符合 COCO 标准的空间尺度分析，无需后端服务器即可实现全本地化的闭环评估。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg?logo=tailwind-css&logoColor=white)
![Data Privacy](https://img.shields.io/badge/Data-100%25_Local-green.svg)

## 📸 界面预览

![VisioQuant Dashboard](./screenshot.svg)

## ✨ 核心特性

### 1. 🛠️ 双重评估模式
- **数量模式 (Count Mode)**: 传统的 TP/FP/GT 计数，适用于通用的分类或简单检测任务。
- **空间模式 (Spatial Mode)**: 引入 **COCO 标准** 的对象尺度划分（Small, Medium, Large）。系统自动汇总 GT 并实时展示测试集的目标大小分布，直观评估模型在不同尺度下的鲁棒性。

### 2. 🚀 实时算法引擎
输入数据即刻推导：
- **精确率 (Precision)**: 衡量抗干扰能力。
- **召回率 (Recall)**: 衡量目标覆盖能力。
- **F1-Score**: 综合性能平衡指标。
- **误报率 (FAR)**: 工业级虚警占比分析。
- **漏报推导 (FN)**: 自动推算未检出目标。

### 3. 📈 高级数据可视化
- **五维能力画像 (Radar Chart)**: 从精确度、召回力、综合F1、抗噪性、效能比五个维度对模型进行全方位“扫描”。
- **性能趋势图 (Trend Analysis)**: 追踪模型在不同版本迭代中的表现变化。

### 4. 💾 工业级数据管理
- **完全隐私化**: 采用 `LocalStorage` 技术，所有数据均存储在您的浏览器本地，不经过任何云端，确保模型性能数据的绝对安全。
- **数据导出**: 支持一键导出 **CSV** 报表，方便在 Excel 或 Google Sheets 中进一步处理。
- **备份与恢复**: 提供 **JSON** 格式的数据库快照功能，支持在不同设备或浏览器间迁移评估数据。

## 🚀 快速开始

本项目基于现代 ES Modules 架构，无需复杂的打包构建流程。

### 环境要求
- 现代浏览器 (Chrome, Edge, Firefox, Safari)。
- 一个简单的静态服务器。

### 安装运行

1. **克隆仓库**
   ```bash
   git clone https://github.com/yourusername/visioquant.git
   cd visioquant
   ```

2. **本地启动**
   
   **使用 Python (推荐):**
   ```bash
   python3 -m http.server 8000
   # 在浏览器中访问 http://localhost:8000
   ```

   **使用 Node.js:**
   ```bash
   npx serve .
   ```

## 📖 使用指南

1. **选择模式**: 点击输入框右上角的齿轮图标，在“数量模式”和“空间模式”之间切换。
2. **输入数据**: 填写模型名称、置信度、测试场景以及对应的 GT、TP、FP。
3. **查看预览**: 右侧仪表盘将实时显示指标变化及雷达图画像。
4. **保存记录**: 点击“保存记录”将评估结果永久持久化到本地。
5. **资产管理**: 在“数据资产”页面，您可以管理所有历史数据，或导出 CSV 进行周报汇报。

## 🤝 贡献建议

如果您有关于 AI 视觉评估的新指标建议（如：多类别 mAP 自动计算等），欢迎提交 Pull Request 或 Issue。

## 📄 许可证

本项目基于 MIT 许可证开源。
