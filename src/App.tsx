import React, { useState, useEffect, Suspense } from "react";
import { 
  Search, 
  LayoutDashboard, 
  Briefcase, 
  Eye, 
  Settings, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  Plus,
  ChevronRight,
  ShieldCheck,
  Menu,
  X,
  History,
  FileText,
  Sparkles,
  Sun,
  Moon,
  Wifi,
  WifiOff,
  RefreshCw,
  Zap,
  Download
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "./lib/utils";
import { useNotification } from "./hooks/useNotification";
import { NotificationContainer } from "./components/NotificationContainer";
import { exportPortfolioAsCSV, exportPortfolioAsJSON } from "./lib/exportPortfolio";
// Lazy load components for code splitting
const AssetAnalysisView = React.lazy(() => import("./components/AssetAnalysisView").then(module => ({ default: module.AssetAnalysisView })));
const PortfolioHealthView = React.lazy(() => import("./components/PortfolioHealthView").then(module => ({ default: module.PortfolioHealthView })));
const MarketScannerView = React.lazy(() => import("./components/MarketScannerView").then(module => ({ default: module.MarketScannerView })));
import { PortfolioSection } from "./components/PortfolioSection";

// --- TYPES ---
interface Stock {
  ticker: string;
  name: string;
  sector: string;
  last_price: number;
  score: number;
  sentiment: "bull" | "bear" | "neutral";
  updated_at: string;
  asset_type?: string;
}

interface PortfolioItem extends Stock {
  shares: number;
  avg_price: number;
}

// --- COMPONENTS ---

interface SidebarItemProps {
  key?: React.Key;
  icon: any;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active, 
  onClick 
}: SidebarItemProps) => {
  const isDark = document.documentElement.classList.contains("dark");
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 group",
        active 
          ? (isDark ? "bg-white/10 text-white shadow-sm" : "bg-emerald-500/10 text-emerald-600 shadow-sm")
          : (isDark ? "text-zinc-400 hover:bg-white/5 hover:text-zinc-200" : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900")
      )}
    >
      <Icon size={20} className={cn(active ? "text-emerald-400" : "group-hover:text-emerald-400/70")} />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
};

const MetricCard = ({ label, value, subValue, trend }: { label: string, value: string, subValue?: string, trend?: "up" | "down" }) => {
  const isDark = document.documentElement.classList.contains("dark");
  
  return (
    <div className={cn(
      "border rounded-2xl p-6 transition-all",
      isDark ? "bg-zinc-900/50 border-white/5 hover:border-white/10" : "bg-white border-zinc-200 hover:border-zinc-300 shadow-sm"
    )}>
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">{label}</p>
      <div className="flex items-end gap-2">
        <h3 className={cn("text-2xl font-semibold", isDark ? "text-white" : "text-zinc-900")}>{value}</h3>
        {trend && (
          <span className={cn(
            "flex items-center text-xs font-medium mb-1",
            trend === "up" ? "text-emerald-400" : "text-rose-400"
          )}>
            {trend === "up" ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
            {subValue}
          </span>
        )}
      </div>
    </div>
  );
};

interface StockRowProps {
  key?: React.Key;
  stock: Stock;
}

const StockRow = ({ stock, onAnalyze }: StockRowProps & { onAnalyze?: (stock: Stock) => void }) => {
  const isDark = document.documentElement.classList.contains("dark");
  
  return (
    <div className={cn(
      "flex items-center justify-between p-4 rounded-xl transition-all group border border-transparent",
      isDark ? "hover:border-white/10" : "hover:border-zinc-200 shadow-sm",
      stock.sentiment === "bull" ? "bg-emerald-500/5 hover:bg-emerald-500/10" : 
      stock.sentiment === "bear" ? "bg-rose-500/5 hover:bg-rose-500/10" : 
      "bg-zinc-500/5 hover:bg-zinc-500/10"
    )}>
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-colors",
          stock.sentiment === "bull" ? "bg-emerald-500/20 text-emerald-400" : 
          stock.sentiment === "bear" ? "bg-rose-500/20 text-rose-400" : 
          "bg-zinc-500/20 text-zinc-400"
        )}>
          {stock.ticker[0]}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className={cn(
              "text-sm font-semibold transition-colors",
              stock.sentiment === "bull" ? "text-emerald-400" : 
              stock.sentiment === "bear" ? "text-rose-400" : 
              (isDark ? "text-white" : "text-zinc-900")
            )}>{stock.ticker}</h4>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 px-1.5 py-0.5 bg-white/5 rounded">
              {stock.asset_type || 'stock'}
            </span>
          </div>
          <p className="text-xs text-zinc-500">{stock.name}</p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className={cn("text-sm font-medium", isDark ? "text-white" : "text-zinc-900")}>${stock.last_price.toFixed(2)}</p>
          <div className="flex items-center justify-end gap-1 mt-1">
            <div className={cn(
              "w-2 h-2 rounded-full",
              stock.sentiment === "bull" ? "bg-emerald-500" : stock.sentiment === "bear" ? "bg-rose-500" : "bg-zinc-500"
            )} />
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-tighter">Score: {stock.score}</span>
          </div>
        </div>
        <button 
          onClick={() => onAnalyze?.(stock)}
          className={cn(
            "p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all",
            isDark ? "hover:bg-white/10 text-zinc-400" : "hover:bg-zinc-100 text-zinc-500"
          )}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

const WatchlistCard = ({ stock, onAnalyze }: { key?: React.Key, stock: Stock, onAnalyze?: (stock: Stock) => void }) => {
  const isDark = document.documentElement.classList.contains("dark");
  
  return (
    <div className={cn(
      "border rounded-3xl p-6 transition-all group relative overflow-hidden",
      isDark ? "bg-zinc-900/30 border-white/5 hover:border-emerald-500/30" : "bg-white border-zinc-200 hover:border-emerald-500/30 shadow-sm",
      stock.sentiment === "bull" ? "hover:bg-emerald-500/[0.02]" : 
      stock.sentiment === "bear" ? "hover:bg-rose-500/[0.02]" : 
      "hover:bg-zinc-500/[0.02]"
    )}>
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h4 className={cn(
            "text-lg font-bold transition-colors",
            stock.sentiment === "bull" ? "text-emerald-400" : 
            stock.sentiment === "bear" ? "text-rose-400" : 
            (isDark ? "text-white" : "text-zinc-900")
          )}>{stock.ticker}</h4>
          <p className="text-xs text-zinc-500 truncate max-w-[120px]">{stock.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn(
            "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider",
            stock.sentiment === "bull" ? "bg-emerald-500/10 text-emerald-400" : 
            stock.sentiment === "bear" ? "bg-rose-500/10 text-rose-400" : 
            "bg-zinc-500/10 text-zinc-400"
          )}>
            {stock.sentiment}
          </div>
          <button 
            onClick={() => onAnalyze?.(stock)}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              isDark ? "hover:bg-white/10 text-zinc-400" : "hover:bg-zinc-100 text-zinc-500"
            )}
          >
            <Sparkles size={14} />
          </button>
        </div>
      </div>
      
      <div className="flex items-end justify-between mt-8 relative z-10">
        <div>
          <p className="text-[10px] uppercase font-bold text-zinc-600 mb-1 tracking-widest">Prix Actuel</p>
          <p className={cn("text-2xl font-bold tracking-tight", isDark ? "text-white" : "text-zinc-900")}>${stock.last_price.toFixed(2)}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase font-bold text-zinc-600 mb-1 tracking-widest">Score IA</p>
          <p className={cn(
            "text-2xl font-bold tracking-tight",
            stock.score > 80 ? "text-emerald-400" : stock.score < 50 ? "text-rose-400" : (isDark ? "text-zinc-300" : "text-zinc-600")
          )}>{stock.score}</p>
        </div>
      </div>

      {/* Subtle background decoration */}
      <div className={cn(
        "absolute -right-4 -bottom-4 w-24 h-24 blur-3xl opacity-10 transition-opacity group-hover:opacity-20",
        stock.sentiment === "bull" ? "bg-emerald-500" : 
        stock.sentiment === "bear" ? "bg-rose-500" : 
        "bg-zinc-500"
      )} />
    </div>
  );
};

const WatchlistSection = ({ 
  stocks, 
  title,
  onAdd,
  onAnalyze
}: { 
  stocks: Stock[], 
  title?: string,
  onAdd?: (ticker: string) => Promise<void>,
  onAnalyze?: (stock: Stock) => void
}) => {
  const isDark = document.documentElement.classList.contains("dark");
  const [isAdding, setIsAdding] = useState(false);
  const [newTicker, setNewTicker] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicker || !onAdd) return;
    
    setIsSubmitting(true);
    try {
      await onAdd(newTicker.toUpperCase());
      setNewTicker("");
      setIsAdding(false);
    } catch (err) {
      console.error("Failed to add ticker", err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        {title && <h2 className={cn("text-3xl font-bold tracking-tight", isDark ? "text-white" : "text-zinc-900")}>{title}</h2>}
        
        {!isAdding ? (
          <button 
            onClick={() => setIsAdding(true)}
            className={cn(
              "px-4 py-2 rounded-xl border text-sm transition-all flex items-center gap-2",
              isDark ? "bg-white/5 hover:bg-white/10 text-white border-white/10" : "bg-white hover:bg-zinc-50 text-zinc-900 border-zinc-200 shadow-sm"
            )}
          >
            <Plus size={18} /> Ajouter une action
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input 
              autoFocus
              type="text"
              placeholder="Ticker (ex: TSLA)"
              className={cn(
                "px-4 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20",
                isDark ? "bg-zinc-900 border-white/10 text-white" : "bg-white border-zinc-200 text-zinc-900"
              )}
              value={newTicker}
              onChange={(e) => setNewTicker(e.target.value)}
              disabled={isSubmitting}
            />
            <button 
              type="submit"
              disabled={isSubmitting || !newTicker}
              className="px-4 py-2 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-colors text-sm disabled:opacity-50"
            >
              {isSubmitting ? "..." : "Ajouter"}
            </button>
            <button 
              type="button"
              onClick={() => setIsAdding(false)}
              className={cn(
                "p-2 rounded-xl transition-colors",
                isDark ? "hover:bg-white/5 text-zinc-400" : "hover:bg-zinc-100 text-zinc-500"
              )}
            >
              <X size={18} />
            </button>
          </form>
        )}
      </div>

      {stocks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stocks.map(stock => (
            <WatchlistCard key={stock.ticker} stock={stock} onAnalyze={onAnalyze} />
          ))}
        </div>
      ) : (
        <div className={cn(
          "border rounded-3xl p-20 text-center",
          isDark ? "bg-zinc-900/30 border-white/5" : "bg-white border-zinc-200 shadow-sm"
        )}>
          <Eye size={48} className="text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 italic">Votre watchlist est vide.</p>
          {!isAdding && (
            <button 
              onClick={() => setIsAdding(true)}
              className="mt-4 text-emerald-500 font-bold hover:underline"
            >
              Ajouter votre première action
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { notifications, addNotification, removeNotification } = useNotification();
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const [watchlistStocks, setWatchlistStocks] = useState<Stock[]>([]);
  const [analyzingStock, setAnalyzingStock] = useState<any | null>(null);
  const [isAnalyzingPortfolio, setIsAnalyzingPortfolio] = useState(false);
  const [portfolioStocks, setPortfolioStocks] = useState<PortfolioItem[]>([]);
  const [isAddingPosition, setIsAddingPosition] = useState(false);
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("settings");
    return saved ? JSON.parse(saved) : { enableGemini: true };
  });

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Persist theme
  useEffect(() => {
    localStorage.setItem("theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Persist settings
  useEffect(() => {
    localStorage.setItem("settings", JSON.stringify(settings));
  }, [settings]);

  const loadWatchlist = async () => {
    try {
      const res = await fetch("/api/watchlist");
      const data = await res.json();
      setWatchlistStocks(data);
    } catch (err) {
      console.error("Failed to load watchlist", err);
    }
  };

  const loadPortfolio = async () => {
    try {
      const res = await fetch("/api/portfolio");
      const data = await res.json();
      setPortfolioStocks(data);
    } catch (err) {
      console.error("Failed to load portfolio", err);
    }
  };

  // Load cached data and fetch new data
  useEffect(() => {
    const loadData = async () => {
      // 1. Try to load from cache first for immediate display
      const cached = localStorage.getItem("stocks_cache");
      if (cached) {
        setStocks(JSON.parse(cached));
        setLoading(false);
      }

      // 2. If online, fetch fresh data
      if (navigator.onLine) {
        try {
          const res = await fetch("/api/stocks");
          const data = await res.json();
          setStocks(data);
          localStorage.setItem("stocks_cache", JSON.stringify(data));
          
          // Also load watchlist
          await loadWatchlist();
          // Also load portfolio
          await loadPortfolio();
        } catch (err) {
          console.error("Fetch failed, using cache", err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAddStockToWatchlist = async (ticker: string) => {
    if (!isOnline) {
      addNotification("La connexion est requise pour ajouter une action.", "warning");
      return;
    }
    
    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker: ticker.toUpperCase() })
      });
      
      const data = await res.json();
      if (data.error) {
        addNotification(data.error, "error");
      } else {
        await loadWatchlist();
        // Also refresh general stocks to get the new data
        const stocksRes = await fetch("/api/stocks");
        const stocksData = await stocksRes.json();
        setStocks(stocksData);
        localStorage.setItem("stocks_cache", JSON.stringify(stocksData));
        addNotification(`${ticker.toUpperCase()} ajouté à la watchlist`, "success");
      }
    } catch (err) {
      console.error("Failed to add stock", err);
      addNotification("Erreur lors de l'ajout de l'action.", "error");
    }
  };

  const handleAddPositionToPortfolio = async (ticker: string, shares: number, avgPrice: number) => {
    if (!isOnline) {
      addNotification("La connexion est requise pour ajouter une position.", "warning");
      return;
    }
    
    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker: ticker.toUpperCase(), shares, avgPrice })
      });
      
      const data = await res.json();
      if (data.error) {
        addNotification(data.error, "error");
      } else {
        await loadPortfolio();
        setIsAddingPosition(false);
        addNotification(`Position ${ticker.toUpperCase()} ajoutée avec succès`, "success");
      }
    } catch (err) {
      console.error("Failed to add position", err);
      addNotification("Erreur lors de l'ajout de la position.", "error");
    }
  };

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchInput = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/search?q=${query}`);
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = async (result: any) => {
    const ticker = result.symbol;
    setSearchQuery("");
    setSearchResults([]);
    
    if (!isOnline) {
      alert("Connexion requise pour l'analyse.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/stocks/search/${ticker}`);
      const data = await res.json();
      if (data.error) {
        alert("Erreur lors de la récupération des données.");
      } else {
        setAnalyzingStock(data);
        // Refresh stocks list
        const stocksRes = await fetch("/api/stocks");
        const stocksData = await stocksRes.json();
        setStocks(stocksData);
        localStorage.setItem("stocks_cache", JSON.stringify(stocksData));
      }
    } catch (err) {
      console.error("Failed to fetch stock", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeStock = async (stock: Stock) => {
    if (!isOnline) {
      alert("Connexion requise pour l'analyse IA.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/stocks/search/${stock.ticker}`);
      const data = await res.json();
      setAnalyzingStock(data);
    } catch (err) {
      console.error("Failed to fetch detailed data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    handleSelectSearchResult({ symbol: searchQuery });
  };

  return (
    <div className={cn(
      "flex h-screen w-full transition-colors duration-300 selection:bg-emerald-500/30 font-sans",
      theme === "dark" ? "bg-black text-zinc-400" : "bg-zinc-50 text-zinc-600"
    )}>
      {/* --- SIDEBAR --- */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className={cn(
          "border-r flex flex-col relative z-20 transition-colors duration-300",
          theme === "dark" ? "border-white/5 bg-zinc-950" : "border-zinc-200 bg-white"
        )}
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <TrendingUp size={20} className="text-black" />
              </div>
              <h1 className={cn(
                "text-lg font-bold tracking-tight",
                theme === "dark" ? "text-white" : "text-zinc-900"
              )}>Analyzer <span className="text-emerald-500">V2</span></h1>
            </div>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              theme === "dark" ? "hover:bg-white/5 text-zinc-400" : "hover:bg-zinc-100 text-zinc-500"
            )}
          >
            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

          <div className="space-y-2">
            <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} />
            <SidebarItem icon={Briefcase} label="Portefeuille" active={activeTab === "portfolio"} onClick={() => setActiveTab("portfolio")} />
            <SidebarItem icon={Zap} label="Scanner" active={activeTab === "scanner"} onClick={() => setActiveTab("scanner")} />
            <SidebarItem icon={Eye} label="Watchlist" active={activeTab === "watchlist"} onClick={() => setActiveTab("watchlist")} />
            <div className={cn("h-px my-4 mx-2", theme === "dark" ? "bg-white/5" : "bg-zinc-100")} />
            <SidebarItem icon={History} label="Historique" active={activeTab === "history"} onClick={() => setActiveTab("history")} />
          </div>

        <div className="p-4 border-t border-white/5 space-y-2">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={cn(
              "flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 group",
              theme === "dark" ? "text-zinc-400 hover:bg-white/5 hover:text-zinc-200" : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
            )}
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            {isSidebarOpen && <span className="text-sm font-medium">{theme === "dark" ? "Mode Clair" : "Mode Sombre"}</span>}
          </button>
          <SidebarItem icon={Settings} label="Paramètres" active={activeTab === "settings"} onClick={() => setActiveTab("settings")} />
        </div>
      </motion.aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* Header / Search */}
        <header className={cn(
          "h-20 border-b flex items-center px-8 justify-between backdrop-blur-xl sticky top-0 z-10 transition-colors duration-300",
          theme === "dark" ? "border-white/5 bg-black/50" : "border-zinc-200 bg-white/80"
        )}>
          <div className="relative w-full max-w-xl">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input 
                type="text" 
                placeholder="Rechercher un ticker (ex: AAPL, NVDA, BTC-USD...)"
                className={cn(
                  "w-full border rounded-2xl py-3 pl-12 pr-12 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50",
                  theme === "dark" ? "bg-zinc-900/50 border-white/5 text-white" : "bg-zinc-100 border-zinc-200 text-zinc-900"
                )}
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
              />
              {isSearching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <RefreshCw size={16} className="text-emerald-500 animate-spin" />
                </div>
              )}
            </form>

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={cn(
                    "absolute top-full left-0 right-0 mt-2 rounded-2xl border shadow-2xl overflow-hidden z-50",
                    theme === "dark" ? "bg-zinc-900 border-white/10" : "bg-white border-zinc-200"
                  )}
                >
                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {searchResults.map((result) => (
                      <button
                        key={result.symbol}
                        onClick={() => handleSelectSearchResult(result)}
                        className={cn(
                          "w-full px-4 py-3 flex items-center justify-between hover:bg-emerald-500/10 transition-colors text-left",
                          theme === "dark" ? "border-b border-white/5" : "border-b border-zinc-100"
                        )}
                      >
                        <div>
                          <p className={cn("font-bold", theme === "dark" ? "text-white" : "text-zinc-900")}>{result.symbol}</p>
                          <p className="text-xs text-zinc-500 truncate max-w-[200px]">{result.shortname || result.longname}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 px-2 py-1 bg-white/5 rounded-md">
                            {result.quoteType}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider">
                  <Wifi size={12} /> En ligne
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-bold uppercase tracking-wider">
                  <WifiOff size={12} /> Hors ligne
                </div>
              )}
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-xs font-medium text-zinc-500">Marché US</p>
              <p className="text-xs text-emerald-400 font-bold">OUVERT</p>
            </div>
            <div className={cn(
              "w-10 h-10 rounded-full border flex items-center justify-center transition-colors",
              theme === "dark" ? "bg-zinc-800 border-white/10 text-zinc-400" : "bg-zinc-100 border-zinc-200 text-zinc-500"
            )}>
              <Plus size={20} />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            {analyzingStock ? (
              <motion.div
                key="analysis"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="max-w-6xl mx-auto"
              >
                <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div></div>}>
                  <AssetAnalysisView 
                    stockData={analyzingStock} 
                    onClose={() => setAnalyzingStock(null)} 
                    isDark={theme === "dark"}
                    enableGemini={settings.enableGemini}
                  />
                </Suspense>
              </motion.div>
            ) : isAnalyzingPortfolio ? (
              <motion.div
                key="portfolio-health"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="max-w-6xl mx-auto"
              >
                <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div></div>}>
                  <PortfolioHealthView 
                    portfolioData={stocks.slice(0, 3)} 
                    onClose={() => setIsAnalyzingPortfolio(false)} 
                    isDark={theme === "dark"}
                    enableGemini={settings.enableGemini}
                  />
                </Suspense>
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-6xl mx-auto space-y-10"
              >
              {activeTab === "dashboard" && (
                <>
                  {/* Welcome Section */}
                  <section>
                    <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Bonjour, <span className="text-emerald-400">Investisseur</span></h2>
                    <p className="text-zinc-500 max-w-2xl">Voici l'état actuel de votre portefeuille et les opportunités détectées par l'algorithme Stock Analyzer.</p>
                  </section>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard label="Valeur Totale" value="$42,850.20" subValue="+12.4%" trend="up" />
                    <MetricCard label="Performance 24h" value="+$842.10" subValue="+2.1%" trend="up" />
                    <MetricCard label="Score Moyen" value="78/100" />
                    <MetricCard label="Signaux Bull" value="14" subValue="Actifs" />
                  </div>

                  {/* Main Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    
                    {/* Left Column: Watchlist / Recent */}
                    <div className="lg:col-span-2 space-y-8">
                      <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-8">
                        <div className="flex items-center justify-between mb-8">
                          <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Sparkles size={20} className="text-emerald-400" />
                            Opportunités Précoces
                          </h3>
                          <button className="text-xs font-bold text-emerald-400 hover:underline uppercase tracking-widest">Tout voir</button>
                        </div>
                        <div className="space-y-2">
                          {stocks.length > 0 ? (
                            stocks.map(stock => (
                              <StockRow key={stock.ticker} stock={stock} />
                            ))
                          ) : (
                            <div className="text-center py-10 text-zinc-600 italic text-sm">
                              Aucune donnée disponible. Recherchez un ticker pour commencer.
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-6">
                          <h4 className="text-sm font-bold text-white mb-4">Secteurs Porteurs</h4>
                          <div className="space-y-4">
                            {["Technologie", "Semi-conducteurs", "Énergie"].map(s => (
                              <div key={s} className="flex items-center justify-between">
                                <span className="text-xs text-zinc-400">{s}</span>
                                <div className="flex-1 mx-4 h-1 bg-white/5 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500" style={{ width: Math.random() * 100 + '%' }} />
                                </div>
                                <span className="text-[10px] font-bold text-emerald-400">+4.2%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-6">
                          <h4 className="text-sm font-bold text-white mb-4">Alertes Récentes</h4>
                          <div className="space-y-3">
                            <div className="flex gap-3 items-start">
                              <AlertCircle size={16} className="text-rose-400 mt-0.5" />
                              <p className="text-xs text-zinc-400"><span className="text-white font-bold">TSLA</span> : Signal de vente précoce détecté (Score 42).</p>
                            </div>
                            <div className="flex gap-3 items-start">
                              <TrendingUp size={16} className="text-emerald-400 mt-0.5" />
                              <p className="text-xs text-zinc-400"><span className="text-white font-bold">NVDA</span> : Cassure de résistance confirmée.</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Dashboard Watchlist Preview */}
                      <div className="pt-4">
                        <WatchlistSection 
                          stocks={stocks.slice(0, 3)} 
                          title={<span>Aperçu <span className="text-emerald-400">Watchlist</span></span> as any} 
                        />
                      </div>
                    </div>

                    {/* Right Column: Portfolio / Notes */}
                    <div className="space-y-8">
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                          <Sparkles size={120} />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-4">Assistant IA</h3>
                        <p className="text-sm text-zinc-300 leading-relaxed mb-6">
                          "NVDA semble sur-acheté à court terme, mais les fondamentaux restent solides. Envisagez de prendre des profits partiels."
                        </p>
                        <button className="w-full py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-colors text-sm">
                          Analyser mon portefeuille
                        </button>
                      </div>

                      <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-6">
                        <h4 className="text-sm font-bold text-white mb-4">Notes de Trading</h4>
                        <textarea 
                          placeholder="Ajouter une note rapide..."
                          className="w-full bg-black/30 border border-white/5 rounded-xl p-4 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500/50 min-h-[120px] resize-none"
                        />
                        <button className="mt-4 text-xs font-bold text-zinc-500 hover:text-white transition-colors">Sauvegarder la note</button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "portfolio" && (
                <PortfolioSection 
                  stocks={stocks} 
                  portfolioStocks={portfolioStocks}
                  onAnalyzeHealth={() => setIsAnalyzingPortfolio(true)}
                  onAddPosition={handleAddPositionToPortfolio}
                />
              )}

              {activeTab === "watchlist" && (
                <WatchlistSection 
                  stocks={watchlistStocks} 
                  title={<span>Ma <span className="text-emerald-400">Watchlist</span></span> as any} 
                  onAdd={handleAddStockToWatchlist}
                />
              )}

              {activeTab === "scanner" && (
                <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div></div>}>
                  <MarketScannerView isDark={theme === "dark"} onSelectAsset={handleAnalyzeStock} />
                </Suspense>
              )}

              {activeTab === "history" && (
                <div className="space-y-8">
                  <h2 className="text-3xl font-bold text-white tracking-tight">Historique des <span className="text-emerald-400">Analyses</span></h2>
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 flex items-center justify-between opacity-60 hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-4">
                          <History size={20} className="text-zinc-500" />
                          <div>
                            <h4 className="text-sm font-bold text-white">Analyse complète : {stocks[i % stocks.length].ticker}</h4>
                            <p className="text-xs text-zinc-500">Il y a {i * 2} heures • Rapport généré</p>
                          </div>
                        </div>
                        <button className="text-xs font-bold text-emerald-400 hover:underline">Revoir</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "notes" && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold text-white tracking-tight">Mes <span className="text-emerald-400">Notes</span></h2>
                    <button className="bg-emerald-500 text-black px-4 py-2 rounded-xl font-bold text-sm hover:bg-emerald-400 transition-all">
                      Nouvelle note
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-6 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-widest">Stratégie</span>
                        <span className="text-[10px] text-zinc-500">08 Mars 2026</span>
                      </div>
                      <h4 className="text-lg font-bold text-white">Plan de sortie NVDA</h4>
                      <p className="text-sm text-zinc-400 leading-relaxed">Vendre 50% de la position si le prix touche les $950. Garder le reste pour le long terme.</p>
                    </div>
                    <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-6 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Recherche</span>
                        <span className="text-[10px] text-zinc-500">07 Mars 2026</span>
                      </div>
                      <h4 className="text-lg font-bold text-white">Secteur Énergie</h4>
                      <p className="text-sm text-zinc-400 leading-relaxed">Surveiller les stocks d'uranium. Cycle de 10 ans en cours de formation.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "settings" && (
                <div className="space-y-8">
                  <h2 className="text-3xl font-bold text-white tracking-tight">Paramètres du <span className="text-emerald-400">Logiciel</span></h2>
                  <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-8 space-y-10">
                    <section className="space-y-4">
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">IA & Analyse</h4>
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <div>
                          <p className="text-sm font-medium text-white">Utiliser Gemini AI</p>
                          <p className="text-xs text-zinc-500">Active l'analyse avancée avec l'IA pour les actions et le portefeuille.</p>
                        </div>
                        <button
                          onClick={() => setSettings(prev => ({ ...prev, enableGemini: !prev.enableGemini }))}
                          className={cn(
                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                            settings.enableGemini ? "bg-emerald-500" : "bg-zinc-600"
                          )}
                        >
                          <span
                            className={cn(
                              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                              settings.enableGemini ? "translate-x-6" : "translate-x-1"
                            )}
                          />
                        </button>
                      </div>
                    </section>
                    <section className="space-y-4">
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">Général</h4>
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <div>
                          <p className="text-sm font-medium text-white">Mode Portable</p>
                          <p className="text-xs text-zinc-500">Les données sont stockées dans le dossier local.</p>
                        </div>
                        <div className="w-10 h-5 bg-emerald-500 rounded-full relative">
                          <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                        </div>
                      </div>
                    </section>
                    <section className="space-y-4">
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">Données & Stockage</h4>
                      <div className="flex items-center justify-between p-4 border border-white/5 rounded-xl">
                        <p className="text-sm text-zinc-300">Emplacement de la base de données</p>
                        <code className="text-[10px] bg-black px-2 py-1 rounded text-emerald-400">./data/stock_analyzer.db</code>
                      </div>
                      <button className="text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors">Réinitialiser toutes les données</button>
                    </section>
                  </div>
                </div>
              )}
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </main>
      
      <NotificationContainer 
        notifications={notifications}
        isDark={theme === "dark"}
        onRemove={removeNotification}
      />
    </div>
  );
}
