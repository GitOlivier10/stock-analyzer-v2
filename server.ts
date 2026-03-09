import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import fs from "fs";
import dotenv from "dotenv";
import YahooFinance from "yahoo-finance2";

process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("💥 Unhandled Rejection:", reason);
});

const yf = new YahooFinance();

console.log("✅ Yahoo Finance initialisé.");

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CONFIGURATION PORTABLE ---
const isProd = process.env.NODE_ENV === "production";
const ROOT_DIR = process.cwd();
const DATA_DIR = path.join(ROOT_DIR, "data");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, "stock_analyzer.db");
const db = new Database(DB_PATH);

// Initialisation de la base de données
try {
  console.log("🗄️ Initialisation de la base de données...");
  db.exec(`
    CREATE TABLE IF NOT EXISTS stocks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticker TEXT UNIQUE,
      name TEXT,
      sector TEXT,
      asset_type TEXT DEFAULT 'stock',
      last_price REAL,
      score REAL,
      sentiment TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticker TEXT,
      date TEXT,
      open REAL,
      high REAL,
      low REAL,
      close REAL,
      volume INTEGER,
      UNIQUE(ticker, date)
    );

    CREATE TABLE IF NOT EXISTS fundamentals (
      ticker TEXT PRIMARY KEY,
      revenue REAL,
      earnings REAL,
      market_cap REAL,
      pe_ratio REAL,
      debt REAL,
      cashflow REAL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS portfolio (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticker TEXT,
      shares REAL,
      avg_price REAL,
      FOREIGN KEY(ticker) REFERENCES stocks(ticker)
    );

    CREATE TABLE IF NOT EXISTS watchlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticker TEXT UNIQUE,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log("✅ Base de données prête.");
} catch (e) {
  console.error("❌ Erreur lors de l'initialisation de la base de données:", e);
}

// --- FONCTIONS MÉTIER ---

async function getDetailedStockData(ticker: string) {
  try {
    const tickerUpper = ticker.toUpperCase();
    
    // Check cache (updated in the last 1 hour)
    const cachedStock = db.prepare("SELECT * FROM stocks WHERE ticker = ? AND updated_at > datetime('now', '-1 hour')").get(tickerUpper);
    if (cachedStock) {
      // If we have cached stock, we might still want to return the full detailed object
      // For simplicity, we'll re-fetch if we need the full technical/fundamental breakdown for the UI
      // But we can skip the DB update if it's very recent.
    }

    // 1. Fetch Quote, Summary (Fundamentals), and Chart (Historical)
    const [quote, summary, chart]: any[] = await Promise.all([
      (yf.quote(tickerUpper) as any).catch((err: any) => {
        console.error(`Quote error for ${tickerUpper}:`, err.message);
        return null;
      }),
      (yf.quoteSummary(tickerUpper, {
        modules: [
          "financialData", 
          "defaultKeyStatistics", 
          "assetProfile", 
          "incomeStatementHistory", 
          "balanceSheetHistory",
          "cashflowStatementHistory"
        ]
      }) as any).catch((err: any) => {
        console.warn(`Summary error for ${tickerUpper}:`, err.message);
        return null;
      }),
      (yf.chart(tickerUpper, { period1: "2023-01-01" }) as any).catch((err: any) => {
        console.error(`Chart error for ${tickerUpper}:`, err.message);
        return null;
      })
    ]);

    if (!quote || !chart || !chart.quotes) {
      console.warn(`Insufficient data for ${tickerUpper}`);
      return null;
    }

    const assetType = quote.quoteType?.toLowerCase() || 'stock';
    const prices = chart.quotes.map((q: any) => ({
      date: q.date.toISOString().split('T')[0],
      open: q.open,
      high: q.high,
      low: q.low,
      close: q.close,
      volume: q.volume
    })).filter((q: any) => q.close !== null);

    const closePrices = prices.map((p: any) => p.close);
    const lastPrice = quote.regularMarketPrice || closePrices[closePrices.length - 1];
    
    // 2. Technical Calculations
    // SMA
    const sma20 = closePrices.length >= 20 ? closePrices.slice(-20).reduce((a: number, b: number) => a + b, 0) / 20 : null;
    const sma50 = closePrices.length >= 50 ? closePrices.slice(-50).reduce((a: number, b: number) => a + b, 0) / 50 : null;
    const sma200 = closePrices.length >= 200 ? closePrices.slice(-200).reduce((a: number, b: number) => a + b, 0) / 200 : null;
    
    // Bollinger Bands (20, 2)
    let bollinger = null;
    if (closePrices.length >= 20) {
      const last20 = closePrices.slice(-20);
      const avg = last20.reduce((a, b) => a + b, 0) / 20;
      const stdDev = Math.sqrt(last20.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / 20);
      bollinger = {
        middle: avg,
        upper: avg + (stdDev * 2),
        lower: avg - (stdDev * 2)
      };
    }

    // MACD (12, 26, 9)
    const ema = (data: number[], period: number) => {
      const k = 2 / (period + 1);
      let emaVal = data[0];
      for (let i = 1; i < data.length; i++) {
        emaVal = data[i] * k + emaVal * (1 - k);
      }
      return emaVal;
    };

    let macd = null;
    if (closePrices.length >= 26) {
      const ema12 = ema(closePrices.slice(-12), 12);
      const ema26 = ema(closePrices.slice(-26), 26);
      const macdLine = ema12 - ema26;
      // Signal line would need more history, let's simplify or just return macdLine
      macd = { line: macdLine };
    }

    // ATR (14)
    let atr = null;
    if (prices.length >= 15) {
      const trs = [];
      for (let i = 1; i < prices.length; i++) {
        const h = prices[i].high;
        const l = prices[i].low;
        const pc = prices[i-1].close;
        trs.push(Math.max(h - l, Math.abs(h - pc), Math.abs(l - pc)));
      }
      atr = trs.slice(-14).reduce((a, b) => a + b, 0) / 14;
    }

    // RSI (14)
    let rsi = null;
    if (closePrices.length > 14) {
      const changes = [];
      for (let i = 1; i < closePrices.length; i++) changes.push(closePrices[i] - closePrices[i-1]);
      const last14 = changes.slice(-14);
      const gains = last14.filter(c => c > 0).reduce((a, b) => a + b, 0) / 14;
      const losses = Math.abs(last14.filter(c => c < 0).reduce((a, b) => a + b, 0)) / 14;
      rsi = 100 - (100 / (1 + (gains / (losses || 1))));
    }

    // Volatility (Standard Deviation of returns)
    let volatility = null;
    if (closePrices.length > 20) {
      const returns = [];
      for (let i = 1; i < 20; i++) returns.push((closePrices[closePrices.length - i] - closePrices[closePrices.length - i - 1]) / closePrices[closePrices.length - i - 1]);
      const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
      const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
      volatility = Math.sqrt(variance) * Math.sqrt(252); // Annualized
    }

    // Drawdown
    const maxPrice = Math.max(...closePrices);
    const drawdown = ((lastPrice - maxPrice) / maxPrice) * 100;

    // Multi-timeframe Analysis (Simplified)
    const weeklyTrend = closePrices.length >= 5 ? (lastPrice > closePrices[closePrices.length - 5] ? "Bullish" : "Bearish") : "Neutral";
    const monthlyTrend = closePrices.length >= 20 ? (lastPrice > closePrices[closePrices.length - 20] ? "Bullish" : "Bearish") : "Neutral";

    // 3. Fundamental Extraction
    const finData = summary?.financialData;
    const keyStats = summary?.defaultKeyStatistics;
    
    const fundamentals = {
      revenue: summary?.incomeStatementHistory?.incomeStatementHistory?.[0]?.totalRevenue || null,
      earnings: summary?.incomeStatementHistory?.incomeStatementHistory?.[0]?.netIncome || null,
      marketCap: quote.marketCap || keyStats?.marketCap || null,
      peRatio: quote.trailingPE || keyStats?.forwardPE || null,
      debt: finData?.totalDebt || null,
      cashflow: summary?.cashflowStatementHistory?.cashflowStatements?.[0]?.totalCashFromOperatingActivities || null,
      revenueGrowth: finData?.revenueGrowth,
      profitMargins: finData?.profitMargins,
    };

    // 4. Multi-factor Score (0-100)
    let trendScore = 50;
    if (sma50 && sma200) {
      if (lastPrice > sma50 && sma50 > sma200) trendScore = 90;
      else if (lastPrice < sma50 && sma50 < sma200) trendScore = 10;
      else if (lastPrice > sma50) trendScore = 70;
      else trendScore = 30;
    }

    let fundScore = 50;
    if (assetType === 'stock' && fundamentals.profitMargins && fundamentals.revenueGrowth) {
      if (fundamentals.profitMargins > 0.15 && fundamentals.revenueGrowth > 0.1) fundScore = 85;
      else if (fundamentals.profitMargins < 0) fundScore = 20;
    }

    let rsiScore = 50;
    if (rsi) {
      if (rsi < 30) rsiScore = 80; // Oversold (Opportunity)
      else if (rsi > 70) rsiScore = 20; // Overbought (Risk)
      else rsiScore = 50 + (50 - rsi) / 2;
    }

    let riskScore = 50;
    if (volatility) {
      if (volatility < 0.2) riskScore = 80;
      else if (volatility > 0.5) riskScore = 30;
      else riskScore = 100 - (volatility * 100);
    }

    const finalScore = Math.round(
      (trendScore * 0.3) + (fundScore * 0.3) + (rsiScore * 0.2) + (riskScore * 0.2)
    );

    const sentiment = finalScore > 70 ? "bull" : finalScore < 40 ? "bear" : "neutral";

    // 5. Scenarios
    const bullishProb = Math.min(85, Math.max(10, finalScore));
const bearishProb = Math.min(85, Math.max(10, 100 - finalScore));
const neutralProb = Math.max(0, 100 - bullishProb - bearishProb);

const scenarios = {
  bullish: bullishProb,
  bearish: bearishProb,
  neutral: neutralProb,
  confidence: finalScore >= 75 || finalScore <= 25 ? "high" : "medium"
};

    // 6. Update DB
    db.prepare(`
      INSERT INTO stocks (ticker, name, sector, asset_type, last_price, score, sentiment, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(ticker) DO UPDATE SET
        last_price = excluded.last_price,
        score = excluded.score,
        sentiment = excluded.sentiment,
        updated_at = CURRENT_TIMESTAMP
    `).run(tickerUpper, quote.shortName || tickerUpper, summary?.assetProfile?.sector || null, assetType, lastPrice, finalScore, sentiment);

    // Cache prices
    const insertPrice = db.prepare("INSERT OR REPLACE INTO prices (ticker, date, open, high, low, close, volume) VALUES (?, ?, ?, ?, ?, ?, ?)");
    const transaction = db.transaction((data) => {
      for (const p of data) insertPrice.run(tickerUpper, p.date, p.open, p.high, p.low, p.close, p.volume);
    });
    transaction(prices.slice(-100)); // Cache last 100 days

    // Cache fundamentals
    db.prepare(`
      INSERT OR REPLACE INTO fundamentals (ticker, revenue, earnings, market_cap, pe_ratio, debt, cashflow, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(tickerUpper, fundamentals.revenue, fundamentals.earnings, fundamentals.marketCap, fundamentals.peRatio, fundamentals.debt, fundamentals.cashflow);

    return {
      ticker: tickerUpper,
      name: quote.shortName || quote.longName || tickerUpper,
      price: lastPrice,
      change: quote.regularMarketChangePercent,
      score: finalScore,
      sentiment,
      assetType,
      scenarios,
      technical: {
        rsi,
        sma20,
        sma50,
        sma200,
        bollinger,
        macd,
        atr,
        volatility,
        drawdown,
        momentum: rsi ? (rsi > 50 ? "Positive" : "Negative") : "Neutral",
        timeframes: {
          daily: rsi ? (rsi > 50 ? "Bullish" : "Bearish") : "Neutral",
          weekly: weeklyTrend,
          monthly: monthlyTrend
        }
      },
      fundamentals,
      profile: summary?.assetProfile,
      history: prices.slice(-30)
    };
  } catch (error) {
    console.error(`Error fetching detailed data for ${ticker}:`, error);
    return null;
  }
}

async function updateStockData(ticker: string) {
  const data = await getDetailedStockData(ticker);
  return data;
}

async function seedInitialData() {
  const initialTickers = ["AAPL", "NVDA", "MSFT", "TSLA", "GOOGL"];
  try {
    const countResult = db.prepare("SELECT COUNT(*) as count FROM stocks").get() as { count: number };
    if (countResult.count === 0) {
      console.log("🌱 Initialisation des données boursières...");
      // On utilise Promise.allSettled pour ne pas bloquer si un ticker échoue
      await Promise.allSettled(initialTickers.map(ticker => updateStockData(ticker)));
      console.log("✅ Initialisation terminée.");
    }
  } catch (error) {
    console.error("❌ Erreur lors du seeding initial:", error);
    // On ne bloque pas le démarrage du serveur
  }
}

async function startServer() {
  console.log("🚀 Démarrage de l'initialisation du serveur...");

  try {
    const app = express();
    const PORT = 3000;

    app.use(express.json());  

// --- API ROUTES ---
  
  // Route de santé
  app.get("/api/health", (req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
  });

  // Recherche et mise à jour d'une action
  app.get("/api/stocks/search/:ticker", async (req, res) => {
    const ticker = req.params.ticker.toUpperCase();
    const data = await getDetailedStockData(ticker);
    if (!data) return res.status(404).json({ error: "Ticker non trouvé" });
    res.json(data);
  });

  // Quote simplifiée
  app.get("/api/quote/:ticker", async (req, res) => {
    const ticker = req.params.ticker.toUpperCase();
    try {
      const quote = await (yf.quote(ticker) as any);
      if (!quote) return res.status(404).json({ error: "Quote non trouvée" });
      res.json(quote);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Historique
  app.get("/api/history/:ticker", async (req, res) => {
    const ticker = req.params.ticker.toUpperCase();
    let prices = db.prepare("SELECT * FROM prices WHERE ticker = ? ORDER BY date DESC LIMIT 100").all(ticker);
    
    if (prices.length === 0) {
      // Si pas en cache, on tente une analyse qui va remplir le cache
      await getDetailedStockData(ticker);
      prices = db.prepare("SELECT * FROM prices WHERE ticker = ? ORDER BY date DESC LIMIT 100").all(ticker);
    }
    
    res.json(prices);
  });

  // Fondamentaux
  app.get("/api/fundamentals/:ticker", (req, res) => {
    const ticker = req.params.ticker.toUpperCase();
    const fundamentals = db.prepare("SELECT * FROM fundamentals WHERE ticker = ?").get(ticker);
    res.json(fundamentals);
  });

  // Recherche globale
  app.get("/api/search", async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);
    try {
      const results = await (yf.search(q as string) as any);
      res.json(results.quotes || []);
    } catch (err: any) {
      console.error("Search error:", err.message);
      res.json([]);
    }
  });

  // Analyse de portefeuille
  app.get("/api/portfolio/analysis", (req, res) => {
    const portfolio = db.prepare(`
      SELECT p.*, s.name, s.last_price, s.score, s.asset_type, s.sentiment
      FROM portfolio p 
      LEFT JOIN stocks s ON p.ticker = s.ticker
    `).all();

    if (portfolio.length === 0) return res.json({ summary: "Portefeuille vide" });

    const totalValue = portfolio.reduce((acc: number, item: any) => acc + (item.shares * item.last_price), 0);
    const avgScore = portfolio.reduce((acc: number, item: any) => acc + item.score, 0) / portfolio.length;
    
    // Allocation par type
    const allocation: any = {};
    portfolio.forEach((item: any) => {
      const type = item.asset_type || 'unknown';
      allocation[type] = (allocation[type] || 0) + (item.shares * item.last_price);
    });

    // Concentration
    const concentration = portfolio.map((item: any) => ({
      ticker: item.ticker,
      weight: (item.shares * item.last_price) / totalValue
    })).sort((a, b) => b.weight - a.weight);

    res.json({
      totalValue,
      avgScore,
      allocation,
      concentration,
      diversification: portfolio.length > 5 ? "Bonne" : "Faible",
      riskLevel: avgScore > 70 ? "Faible" : avgScore > 50 ? "Modéré" : "Élevé"
    });
  });

  // Liste des actions en base
  app.get("/api/stocks", (req, res) => {
    const stocks = db.prepare("SELECT * FROM stocks ORDER BY score DESC").all();
    res.json(stocks);
  });

  // Détails d'une action
  app.get("/api/stocks/:ticker", (req, res) => {
    const stock = db.prepare("SELECT * FROM stocks WHERE ticker = ?").get(req.params.ticker.toUpperCase());
    if (!stock) return res.status(404).json({ error: "Stock non trouvé" });
    res.json(stock);
  });

  // Analyse complète (alias de search pour compatibilité)
  app.get("/api/analyze/:ticker", async (req, res) => {
    const ticker = req.params.ticker.toUpperCase();
    const data = await getDetailedStockData(ticker);
    if (!data) return res.status(404).json({ error: "Analyse impossible" });
    res.json(data);
  });

  // Market Scanner
  app.get("/api/scanner", async (req, res) => {
    const stocks = db.prepare("SELECT ticker FROM stocks").all();
    const results: any = {
      topMomentum: [],
      breakouts: [],
      oversold: [],
      reversals: []
    };

    for (const s of stocks) {
      const data = await getDetailedStockData(s.ticker);
      if (!data) continue;

      // Logic for scanner
      if (data.technical.rsi > 70 && data.price > data.technical.sma50) {
        results.topMomentum.push(data);
      }
      if (data.technical.bollinger && data.price > data.technical.bollinger.upper) {
        results.breakouts.push(data);
      }
      if (data.technical.rsi < 30) {
        results.oversold.push(data);
      }
      if (data.technical.macd && Math.abs(data.technical.macd.line) < 0.5 && data.sentiment === 'neutral') {
        results.reversals.push(data);
      }
    }

    // Sort and limit
    Object.keys(results).forEach(key => {
      results[key] = results[key].sort((a: any, b: any) => b.score - a.score).slice(0, 10);
    });

    res.json(results);
  });

  // Portfolio
  app.get("/api/portfolio", (req, res) => {
    const portfolio = db.prepare(`
      SELECT p.*, s.name, s.last_price, s.score 
      FROM portfolio p 
      LEFT JOIN stocks s ON p.ticker = s.ticker
    `).all();
    res.json(portfolio);
  });

  // Watchlist
  app.get("/api/watchlist", (req, res) => {
    const watchlist = db.prepare(`
      SELECT w.*, s.name, s.last_price, s.score, s.sentiment
      FROM watchlist w
      LEFT JOIN stocks s ON w.ticker = s.ticker
    `).all();
    res.json(watchlist);
  });

  // Ajout à la watchlist
  app.post("/api/watchlist", async (req, res) => {
    const { ticker } = req.body;
    const tickerUpper = ticker.toUpperCase();
    try {
      // On s'assure d'avoir les données avant d'ajouter
      await updateStockData(tickerUpper);
      db.prepare("INSERT INTO watchlist (ticker) VALUES (?)").run(tickerUpper);
      res.status(201).json({ success: true });
    } catch (e) {
      res.status(400).json({ error: "Déjà dans la watchlist ou erreur" });
    }
  });

  // Suppression de la watchlist
  app.delete("/api/watchlist/:ticker", (req, res) => {
    const { ticker } = req.params;
    const tickerUpper = ticker.toUpperCase();
    try {
      const stmt = db.prepare("DELETE FROM watchlist WHERE ticker = ?");
      const result = stmt.run(tickerUpper);
      if (result.changes === 0) {
        res.status(404).json({ error: "Action non trouvée dans la watchlist" });
      } else {
        res.json({ success: true });
      }
    } catch (e) {
      res.status(400).json({ error: "Erreur lors de la suppression" });
    }
  });

  // Gestion du portefeuille
  app.post("/api/portfolio", async (req, res) => {
    const { ticker, shares, avgPrice } = req.body;
    const tickerUpper = ticker.toUpperCase();
    try {
      await updateStockData(tickerUpper);
      const stmt = db.prepare("INSERT INTO portfolio (ticker, shares, avg_price) VALUES (?, ?, ?)");
      stmt.run(tickerUpper, shares, avgPrice);
      res.status(201).json({ success: true });
    } catch (e) {
      res.status(400).json({ error: "Erreur lors de l'ajout au portefeuille" });
    }
  });

  app.put("/api/portfolio/:ticker", async (req, res) => {
    const { ticker } = req.params;
    const { shares, avgPrice } = req.body;
    const tickerUpper = ticker.toUpperCase();
    try {
      const stmt = db.prepare("UPDATE portfolio SET shares = ?, avg_price = ? WHERE ticker = ?");
      const result = stmt.run(shares, avgPrice, tickerUpper);
      if (result.changes === 0) {
        res.status(404).json({ error: "Action non trouvée dans le portefeuille" });
      } else {
        res.json({ success: true });
      }
    } catch (e) {
      res.status(400).json({ error: "Erreur lors de la mise à jour" });
    }
  });

  app.delete("/api/portfolio/:ticker", (req, res) => {
    const { ticker } = req.params;
    const tickerUpper = ticker.toUpperCase();
    try {
      const stmt = db.prepare("DELETE FROM portfolio WHERE ticker = ?");
      const result = stmt.run(tickerUpper);
      if (result.changes === 0) {
        res.status(404).json({ error: "Action non trouvée dans le portefeuille" });
      } else {
        res.json({ success: true });
      }
    } catch (e) {
      res.status(400).json({ error: "Erreur lors de la suppression" });
    }
  });

  // --- VITE MIDDLEWARE ---
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

    console.log("📡 Tentative de mise en écoute sur le port 3000...");

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`
✅ Serveur Stock Analyzer V2 en ligne !
📍 URL : http://localhost:${PORT}
📂 Données : ${DATA_DIR}
  `);
});

server.on("error", (err) => {
  console.error("❌ Erreur serveur HTTP :", err);
});

seedInitialData().catch((error) => {
  console.error("⚠️ Seed initial échoué, mais le serveur reste disponible :", error);
});

  } catch (error) {
    console.error("❌ ERREUR FATALE lors du démarrage du serveur:", error);
    process.exit(1);
  }
}

startServer();
