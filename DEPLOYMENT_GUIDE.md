# Stock Analyzer V2 - Deployment Guide

## Overview

Stock Analyzer V2 is now a fully functional desktop application that can be deployed and run on any Windows system without installation.

## 📦 Distribution Formats

### 1. **Portable ZIP Package** (Recommended)
- **File**: `Stock-Analyzer-V2-Portable.zip` (157 MB)
- **Use Case**: Distribution via download, email, or cloud storage
- **Instructions**:
  1. Download the ZIP file
  2. Extract to any location (e.g., USB drive, local folder)
  3. Navigate to the extracted folder
  4. Double-click `Stock Analyzer V2.exe` to launch

### 2. **Portable Folder** (Direct)
- **Folder**: `Stock-Analyzer-Portable/`
- **Use Case**: Already extracted, ready to copy to USB drive
- **Instructions**:
  1. Copy entire `Stock-Analyzer-Portable` folder to USB drive
  2. On any Windows machine, navigate to the folder
  3. Double-click `Stock Analyzer V2.exe` to run

### 3. **Build from Source**
- **Requirement**: Node.js 16+ installed
- **Steps**:
  ```bash
  npm install
  npm run build
  npm run electron
  ```

## 🚀 Running the Application

### Direct Execution
1. Locate `Stock Analyzer V2.exe` in the portable folder
2. Double-click to launch
3. Application starts with full functionality:
   - Portfolio management
   - Stock watchlists
   - Market analysis
   - AI-powered insights (if Gemini API key configured)

### USB-based Deployment
1. Copy entire `Stock-Analyzer-Portable` folder to USB drive
2. Use on any Windows machine (no installation needed)
3. All data is stored locally in the app's data directory

## ⚙️ Configuration

### First Launch
- **Portfolio Data**: Empty (add stocks and portfolios via UI)
- **Database**: SQLite (`data/stocks.db`) created automatically
- **Settings**: Gemini API key optional (add via UI settings)

### Data Location
All application data is stored in:
- Windows: `%APPDATA%\Stock Analyzer V2` (if system installation)
- OR: In the application's local `data/` folder (portable version)

### Environment Variables (Optional)
Create `.env` file in the application directory:
```env
GEMINI_API_KEY=your_key_here
PORT=3000
NODE_ENV=production
```

## 🔧 Features

### Available in v2.0.0
- ✅ Portfolio management (add/edit/delete stocks)
- ✅ Real-time stock data (Yahoo Finance API)
- ✅ Price tracking and charts
- ✅ Portfolio health metrics
- ✅ Market scanner
- ✅ Data export (CSV, JSON)
- ✅ Gemini AI analysis (optional)
- ✅ Toast notifications
- ✅ Responsive UI

### System Requirements
- **OS**: Windows 10 or later (64-bit recommended)
- **RAM**: 300 MB minimum (500 MB recommended)
- **Disk**: 200 MB for application files
- **Internet**: Required for stock data updates

## 📋 Troubleshooting

### Application won't start
1. Ensure Windows 10 or later is installed
2. Check that you have adequate disk space (500 MB free)
3. Try running as Administrator
4. Confirm all files were extracted properly

### Stock data not loading
1. Check internet connection
2. Verify Yahoo Finance API is accessible
3. Check browser console (F12) for errors
4. Restart the application

### Data not saving
1. Ensure write permissions in the application folder
2. Check that disk space is available
3. Verify SQLite is not corrupted (delete `data/stocks.db` to reset)

## 📝 Version Info
- **Version**: 1.0.0
- **Build Date**: 2025
- **Electron**: 40.8.0
- **React**: 19.0.0
- **Node**: 22.14.0

## 🔐 Security Notes

### Local-Only Data
- All portfolio and watchlist data stored locally
- No data sent to external servers (except Yahoo Finance for stock prices)
- Gemini AI integration requires user-provided API key

### Running on USB
- Application is fully self-contained
- No system files modified
- No installation required
- Can be securely deleted by removing the folder

## 📞 Support

For issues or features:
1. Check data integrity (restart app)
2. Review console logs (F12 in Electron DevTools)
3. Verify file permissions and disk space
4. Contact development team with error messages

## 🔄 Updating

To update the application:
1. Download the latest ZIP file
2. Extract to a new folder
3. Copy your `data/stocks.db` file from the old version
4. Paste it into the new version's `data/` folder
5. Run the new version

---

**Enjoy using Stock Analyzer V2!** 📈

For development and GitHub repository:
https://github.com/GitOlivier10/stock-analyzer-v2
