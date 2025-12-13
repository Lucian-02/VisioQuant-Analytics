
# VisioQuant Analytics 🧠📊

**VisioQuant** is a professional, offline-first quantitative evaluation system designed for AI computer vision models. It provides real-time metric calculation, historical trend analysis, and capability visualization without requiring a server backend.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg?logo=tailwind-css&logoColor=white)
![Privacy](https://img.shields.io/badge/Data-Local_Only-green.svg)

## 📸 Dashboard Preview

![VisioQuant Dashboard](./screenshot.svg)

## ✨ Key Features

### 1. 🚀 Core Metric Calculation
Instantly calculate standard academic and industrial metrics based on your input (TP, FP, GT):
- **Precision, Recall, F1-Score**
- **False Alarm Rate (FAR)**
- **False Negative (FN) Derivation**

### 2. 📈 Advanced Visualization
- **5-Dimensional Radar Chart**: Analyze model capabilities across Precision, Recall, F1, Anti-Noise, and Efficiency.
- **Trend Analysis**: Visualize performance evolution over time with interactive line charts (Top 5 & Full History).

### 3. 🛡️ Offline-First & Privacy Focused
- **Zero Cloud Dependency**: All data is stored in your browser's `LocalStorage`.
- **No Login Required**: Instant access, no account setup needed.
- **Data Sovereignty**: Your proprietary model performance data never leaves your device.

### 4. 💾 Robust Data Management
- **CSV Export**: Export analysis reports for spreadsheets (Excel/Google Sheets).
- **JSON Backup & Restore**: Full database dump capabilities to migrate data between devices or browsers.
- **Validation Gates**: Built-in logic to prevent invalid data entry (e.g., TP > GT).

### 5. 🌍 Internationalization
- Full support for **English** and **Simplified Chinese (简体中文)**.

## 🛠️ Tech Stack

- **Core**: React 19 (via ESM imports)
- **Styling**: Tailwind CSS (Dark Mode, Glassmorphism UI)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Persistence**: LocalStorage API

## 🚀 Getting Started

Since this project uses modern ES Modules and `importmap`, it requires no complex build step (like Webpack) to run in development mode, but it does require a local static server to handle module loading correctly.

### Prerequisites
- A modern browser (Chrome, Edge, Firefox, Safari).
- A simple static server (e.g., VS Code "Live Server" extension, Python `http.server`, or `serve`).

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/visioquant-analytics.git
   cd visioquant-analytics
   ```

2. **Run locally**
   
   **Option A: Using Python**
   ```bash
   python3 -m http.server 8000
   # Open http://localhost:8000 in your browser
   ```

   **Option B: Using Node.js `serve`**
   ```bash
   npx serve .
   # Open the provided localhost URL
   ```

   **Option C: VS Code**
   - Install the **Live Server** extension.
   - Right-click `index.html` and select "Open with Live Server".

## 📖 Usage Guide

1. **Input Data**: Enter your model name, scenario, Ground Truth (GT), True Positives (TP), and False Positives (FP).
2. **Review Preview**: Check the "Live Metrics Preview" card and Radar chart to ensure data looks correct.
3. **Save**: Click "Save Record" to commit data to local storage.
4. **Analyze**: Switch to the **Dashboard** to see trends or **Data Assets** to manage records.
5. **Export**: Go to "Data Assets" to download a CSV report or backup your database as JSON.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
