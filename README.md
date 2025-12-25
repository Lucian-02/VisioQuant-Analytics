<div align="center">
  <img src="./screenshot.svg" alt="VisioQuant Banner" width="800">
  
  # VisioQuant Analytics
  
  **基于物理观测值的工业级 AI 视觉效能量化评估系统**
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![React: 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
  [![Data Privacy](https://img.shields.io/badge/Data-100%25_Local-emerald?logo=lock&logoColor=white)](https://github.com/VisioQuant)
  [![Bilingual](https://img.shields.io/badge/Lang-English%20%2F%20%E4%B8%AD%E6%96%87-indigo)](https://github.com/VisioQuant)

  <p align="center">
    面向计算机视觉算法工程师，拒绝模糊指标，通过 <b>AI 预测总数</b> 与 <b>现实真值</b> 的直接对撞，<br/>
    为生产环境构建最真实的模型能力画像。
  </p>
</div>

---

## 📖 简介 (Overview)

**VisioQuant** 是一套遵循 **Core Logic Manifesto (核心逻辑宣言)** 的评估工具。在实际工业生产中，仅仅关注 Recall 或 Precision 是不够的，VisioQuant 强制引入 **AI 总数 (Pred Total)** 作为评估的第一维度，用以精确衡量模型的“废话占比”与“背景抗干扰能力”。

## 📐 核心量化逻辑 (The Evaluation Logic)

系统严格基于以下三个物理观测值进行全量推导，杜绝算法评估中的黑盒逻辑：

- **Pred Total (AI 总数)**: 画面中模型产生的所有预测框/结果。
- **Ground Truth (GT)**: 场景中实际存在的目标物理总数。
- **True Positive (TP)**: 经过 IOU 校验确认为正确的有效命中。

### 自动化计算链路
- **FP (误报)** = AI 总数 - 有效命中 → *衡量模型的冗余度*
- **FN (漏报)** = 真值总数 - 有效命中 → *衡量模型的职责缺失*
- **Precision (精确率)** = TP / AI 总数 → *衡量模型输出的纯净度*
- **Recall (召回率)** = TP / GT → *衡量模型对目标的覆盖度*

---

## ✨ 关键特性 (Features)

- **⚡ 实时效能反馈**: 毫秒级计算响应，录入即刻生成五维雷达画像。
- **📐 空间尺度分布**: 支持 COCO 标准下的 Small / Medium / Large 真值分级录入。
- **📈 演进趋势追踪**: 自动绘制版本更迭曲线，直观呈现调优路径与性能拐点。
- **📊 工业报表导出**: 支持中英双语切换，CSV 导出逻辑深度优化，核心指标自动转换为**百分比格式**。
- **🛡️ 极致数据隐私**: 采用 Local-first 架构，数据完全存储在用户浏览器本地，无任何云端上传行为。
- **🌓 响应式设计**: 完美适配桌面与移动端，支持现场测试数据快速采集。

---

## 🛠️ 技术栈 (Tech Stack)

| 模块 | 技术选型 |
| :--- | :--- |
| **框架** | React 19 (ES6+ Module) |
| **样式** | Tailwind CSS (Utility-first) |
| **可视化** | Recharts (Radar & Time-series) |
| **图标** | Lucide React |
| **存储** | Browser LocalStorage / IndexedDB |

---

## 🚀 快速开始 (Getting Started)

### 本地部署
1. 克隆仓库:
   ```bash
   git clone https://github.com/your-username/visioquant.git
   ```
2. 使用静态服务器运行:
   ```bash
   npx serve .
   ```

### 核心操作流
1. **Define**: 输入模型版本、置信度阈值及测试环境。
2. **Evaluate**: 录入 `AI 总数`、`GT` 与 `TP`。
3. **Analyze**: 观察雷达图中的“抗噪性”与“效能比”。
4. **Archive**: 保存记录并导出 CSV 报表用于线下汇报。

---

## 📄 许可证 (License)

根据 [MIT License](./LICENSE) 许可授权。

<div align="center">
  <sub>Built with ❤️ for the Computer Vision Community</sub>
</div>