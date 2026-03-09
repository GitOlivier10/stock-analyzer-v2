import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Zap, 
  TrendingUp, 
  ArrowDownCircle, 
  RefreshCw, 
  ChevronRight,
  Search,
  AlertCircle
} from "lucide-react";
import { cn } from "../lib/utils";

interface ScannerResult {
  topMomentum: any[];
  breakouts: any[];
  oversold: any[];
  reversals: any[];
}

export const MarketScannerView = ({ isDark, onSelectAsset }: { isDark: boolean, onSelectAsset: (asset: any) => void }) => {
  const [results, setResults] = useState<ScannerResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<keyof ScannerResult>("topMomentum");

  const fetchScannerData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/scanner");
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Failed to fetch scanner data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScannerData();
  }, []);

  const categories = [
    { id: "topMomentum", label: "Top Momentum", icon: Zap, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { id: "breakouts", label: "Breakouts", icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-500/10" },
    { id: "oversold", label: "Survendu (RSI < 30)", icon: ArrowDownCircle, color: "text-rose-400", bg: "bg-rose-500/10" },
    { id: "reversals", label: "Retournements", icon: RefreshCw, color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className={cn("text-3xl font-bold tracking-tight", isDark ? "text-white" : "text-zinc-900")}>
            Market <span className="text-emerald-500">Scanner</span>
          </h2>
          <p className="text-zinc-500 mt-1">Détection automatique d'opportunités basée sur l'analyse technique temps réel.</p>
        </div>
        <button 
          onClick={fetchScannerData}
          disabled={loading}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
            isDark ? "bg-white/5 text-white hover:bg-white/10" : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
          )}
        >
          <RefreshCw size={16} className={cn(loading && "animate-spin")} />
          Actualiser le Scan
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as keyof ScannerResult)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border",
              activeCategory === cat.id 
                ? (isDark ? "bg-white/10 border-white/20 text-white" : "bg-zinc-900 border-zinc-900 text-white")
                : (isDark ? "bg-white/5 border-transparent text-zinc-500 hover:text-zinc-300" : "bg-zinc-100 border-transparent text-zinc-500 hover:text-zinc-700")
            )}
          >
            <cat.icon size={16} className={activeCategory === cat.id ? cat.color : ""} />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Results List */}
      <div className={cn(
        "border rounded-3xl overflow-hidden",
        isDark ? "bg-zinc-900/30 border-white/5" : "bg-white border-zinc-200 shadow-sm"
      )}>
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <RefreshCw size={40} className="text-emerald-500 animate-spin" />
            <p className="text-zinc-500 font-medium">Analyse des marchés en cours...</p>
          </div>
        ) : results && results[activeCategory].length > 0 ? (
          <div className="divide-y divide-white/5">
            {results[activeCategory].map((asset: any) => (
              <div 
                key={asset.ticker}
                className={cn(
                  "group flex items-center justify-between p-6 transition-all cursor-pointer",
                  isDark ? "hover:bg-white/5" : "hover:bg-zinc-50"
                )}
                onClick={() => onSelectAsset(asset)}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg",
                    isDark ? "bg-white/5 text-white" : "bg-zinc-100 text-zinc-900"
                  )}>
                    {asset.ticker.slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className={cn("font-bold text-lg", isDark ? "text-white" : "text-zinc-900")}>{asset.ticker}</h4>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 px-2 py-0.5 bg-white/5 rounded">
                        {asset.assetType}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-500">{asset.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-12">
                  <div className="text-right hidden md:block">
                    <p className={cn("text-lg font-bold", isDark ? "text-white" : "text-zinc-900")}>${asset.price.toFixed(2)}</p>
                    <p className={cn("text-xs font-bold", asset.change >= 0 ? "text-emerald-400" : "text-rose-400")}>
                      {asset.change >= 0 ? "+" : ""}{asset.change.toFixed(2)}%
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Score</span>
                      <span className={cn(
                        "text-sm font-bold",
                        asset.score > 70 ? "text-emerald-400" : asset.score > 40 ? "text-amber-400" : "text-rose-400"
                      )}>{asset.score}</span>
                    </div>
                    <div className={cn("w-24 h-1.5 rounded-full overflow-hidden", isDark ? "bg-white/5" : "bg-zinc-100")}>
                      <div 
                        className={cn(
                          "h-full transition-all duration-500",
                          asset.score > 70 ? "bg-emerald-500" : asset.score > 40 ? "bg-amber-500" : "bg-rose-500"
                        )} 
                        style={{ width: `${asset.score}%` }} 
                      />
                    </div>
                  </div>

                  <ChevronRight size={20} className="text-zinc-600 group-hover:text-emerald-500 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-20 flex flex-col items-center justify-center gap-4 text-center">
            <AlertCircle size={40} className="text-zinc-600" />
            <div>
              <p className="text-zinc-400 font-bold">Aucune opportunité détectée</p>
              <p className="text-zinc-600 text-sm max-w-xs mx-auto mt-1">
                Le marché ne présente pas de signaux forts pour cette catégorie actuellement.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Scanner Info */}
      <div className={cn(
        "p-6 rounded-3xl border flex items-start gap-4",
        isDark ? "bg-emerald-500/5 border-emerald-500/10" : "bg-emerald-50 border-emerald-100"
      )}>
        <Zap className="text-emerald-500 shrink-0" size={24} />
        <div>
          <h4 className={cn("font-bold text-sm", isDark ? "text-white" : "text-zinc-900")}>Comment fonctionne le scanner ?</h4>
          <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
            Notre algorithme analyse en temps réel les indicateurs techniques (RSI, Bollinger, MACD, Volume) sur l'ensemble de votre base de données. 
            Les opportunités sont classées par pertinence et score de santé financière pour vous aider à prendre des décisions éclairées.
          </p>
        </div>
      </div>
    </div>
  );
};
