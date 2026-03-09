<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Stock Analyzer V2 - Complete Investment Tracking Platform

A professional-grade desktop application for portfolio management, stock tracking, and AI-powered market analysis.

## 📦 Distribution (USB-Ready!)

### Quick Start
- **🎯 [QUICKSTART.md](QUICKSTART.md)** - Get running in 2 minutes
- **📋 [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Full installation & configuration guide

### Download Ready-to-Run Packages
1. **Portable ZIP**: `Stock-Analyzer-V2-Portable.zip` (157 MB)
   - Extract and run on any Windows machine
   - No installation required
   - USB-compatible

2. **Portable Folder**: `Stock-Analyzer-Portable/`
   - Already extracted
   - Copy directly to USB drive

## 🚀 Features

- ✅ **Portfolio Management** - Add, edit, delete stocks with real-time tracking
- ✅ **Stock Data** - Real-time prices from Yahoo Finance API
- ✅ **Market Scanner** - Find trading opportunities
- ✅ **Analytics** - Interactive charts and portfolio metrics
- ✅ **AI Insights** - Optional Gemini AI analysis
- ✅ **Data Export** - CSV and JSON export
- ✅ **Desktop App** - Electron-based with full offline functionality
- ✅ **USB Portable** - Run from USB drive without installation

## 🛠️ Development

### Prerequisites
- Node.js 16+ 
- npm 8+
- git

### Setup (Local Development)

```bash
# Clone the repository
git clone https://github.com/GitOlivier10/stock-analyzer-v2.git
cd stock-analyzer-v2

# Install dependencies
npm install

# Create .env.local with your Gemini API key (optional)
echo "GEMINI_API_KEY=your_key_here" > .env.local

# Run development server (web auto-reload + Electron app)
npm run electron-dev

# OR build for production
npm run build
npm run electron
```

### Available Scripts

- `npm run dev` - Start development server only (web)
- `npm run electron-dev` - Launch dev server + Electron app
- `npm run build` - Build React app for production
- `npm run electron` - Run built app in Electron
- `npm run dist` - Build portable distribution
- `npm run test` - Run test suite
- `npm run lint` - TypeScript type checking

## 📋 System Requirements

### For Running (End-Users)
- **OS**: Windows 10/11 (64-bit)
- **RAM**: 300 MB minimum (500 MB recommended)
- **Disk**: 200 MB for application files
- **Internet**: Required for stock data updates

### For Development
- Node.js 16+
- Modern code editor (VS Code recommended)
- Git

## 🗄️ Technology Stack

- **Frontend**: React 19 + TypeScript 5.8 + Vite 6.2
- **Backend**: Express.js + SQLite (better-sqlite3)
- **Desktop**: Electron 40.8.0 + electron-builder
- **UI**: Tailwind CSS 4.1 + Recharts + Lucide React
- **AI**: Google Gemini API (optional)
- **Data**: Yahoo Finance API for stock prices

## 📊 Database Schema

SQLite database includes tables for:
- `stocks` - Stock definitions and metadata
- `prices` - Historical price data
- `fundamentals` - Company financial metrics
- `portfolio` - User's stock holdings
- `watchlist` - Tracked stocks

## 🔐 Security & Privacy

- **Local-Only Storage**: All data stored locally on your machine
- **No Cloud Sync**: Portfolio data never leaves your computer
- **Optional AI**: Gemini integration requires your API key
- **Self-Contained**: No telemetry or tracking

## 📝 Project Structure

```
.
├── src/                  # React frontend
│   ├── components/      # UI components
│   ├── services/        # API services
│   └── lib/            # Utilities
├── electron.js          # Electron main process
├── preload.js           # IPC security layer
├── server.js            # Express backend
├── dist/                # Built React app
├── dist-electron/       # Packaged application
└── data/                # SQLite database
```

## 🐛 Troubleshooting

### Common Issues

**Application won't start**
- Ensure Windows 10 or later
- Check disk space (500 MB free)
- Try running as Administrator
- Verify all files extracted properly

**Stock data not loading**
- Check internet connection
- Verify Yahoo Finance accessibility
- Check browser console (F12) for errors
- Restart the application

**Data not saving**
- Verify write permissions in app folder
- Check available disk space
- Delete `data/stocks.db` to reset database

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed troubleshooting.

## 📄 License

MIT License - Open source and free to use

## 🔗 Links

- 📄 [Quick Start Guide](QUICKSTART.md) - Get running in 2 minutes
- 📋 [Deployment Guide](DEPLOYMENT_GUIDE.md) - Full installation & configuration
- 🐙 [GitHub Repository](https://github.com/GitOlivier10/stock-analyzer-v2)
- 🔑 [Gemini API Setup](https://aistudio.google.com/app/apikey)

## 📞 Support

For issues, suggestions, or contributions:
1. Check the [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) troubleshooting section
2. Review the [GitHub Issues](https://github.com/GitOlivier10/stock-analyzer-v2/issues)
3. Create a new issue with detailed error information

---

**Made with ❤️ for investors and traders** • [MIT License](LICENSE)

Happy analyzing! 📈
