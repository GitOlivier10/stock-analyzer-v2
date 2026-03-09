import React, { useState } from "react";
import { Plus, X, Download, FileJson, FileText, Briefcase } from "lucide-react";
import { cn } from "../lib/utils";
import { exportPortfolioAsCSV, exportPortfolioAsJSON } from "../lib/exportPortfolio";

interface PortfolioItem {
  id: number;
  ticker: string;
  name: string;
  shares: number;
  avg_price: number;
  last_price?: number;
}

interface PortfolioSectionProps {
  stocks: any[];
  portfolioStocks: PortfolioItem[];
  onAnalyzeHealth?: () => void;
  onAddPosition?: (ticker: string, shares: number, avgPrice: number) => void;
}

export const PortfolioSection = ({ 
  stocks, 
  portfolioStocks, 
  onAnalyzeHealth, 
  onAddPosition 
}: PortfolioSectionProps) => {
  const isDark = document.documentElement.classList.contains("dark");
  const [isAdding, setIsAdding] = useState(false);
  const [newTicker, setNewTicker] = useState("");
  const [newShares, setNewShares] = useState("");
  const [newAvgPrice, setNewAvgPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicker || !newShares || !newAvgPrice) return;
    
    setIsSubmitting(true);
    try {
      await onAddPosition?.(newTicker.toUpperCase(), parseFloat(newShares), parseFloat(newAvgPrice));
      setNewTicker("");
      setNewShares("");
      setNewAvgPrice("");
      setIsAdding(false);
    } catch (err) {
      console.error("Failed to add position", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    if (portfolioStocks && portfolioStocks.length > 0) {
      exportPortfolioAsCSV(portfolioStocks);
      setShowExportMenu(false);
    }
  };

  const handleExportJSON = () => {
    if (portfolioStocks && portfolioStocks.length > 0) {
      exportPortfolioAsJSON(portfolioStocks);
      setShowExportMenu(false);
    }
  };

  const totalValue = portfolioStocks.reduce((sum, item) => sum + (item.shares * (item.last_price || 0)), 0);
  const totalCost = portfolioStocks.reduce((sum, item) => sum + (item.shares * item.avg_price), 0);
  const totalGain = totalValue - totalCost;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className={cn("text-3xl font-bold tracking-tight", isDark ? "text-white" : "text-zinc-900")}>Mon <span className="text-emerald-400">Portefeuille</span></h2>
        <div className="flex items-center gap-3">
          {portfolioStocks.length > 0 && (
            <>
              <button 
                onClick={onAnalyzeHealth}
                className={cn(
                  "px-4 py-2 rounded-xl border text-sm font-bold transition-all flex items-center gap-2",
                  isDark ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20" : "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100"
                )}
              >
                Analyse Santé
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className={cn(
                    "px-4 py-2 rounded-xl border text-sm transition-all flex items-center gap-2",
                    isDark ? "bg-white/5 hover:bg-white/10 text-white border-white/10" : "bg-white hover:bg-zinc-50 text-zinc-900 border-zinc-200 shadow-sm"
                  )}
                >
                  <Download size={18} /> Exporter
                </button>

                {showExportMenu && (
                  <div
                    className={cn(
                      "absolute right-0 mt-2 w-48 rounded-lg border shadow-lg z-10",
                      isDark ? "bg-zinc-900 border-white/10" : "bg-white border-zinc-200"
                    )}
                  >
                    <button
                      onClick={handleExportCSV}
                      className={cn(
                        "w-full text-left px-4 py-3 flex items-center gap-2 hover:bg-white/5 transition-colors rounded-t-lg",
                        isDark ? "text-white" : "text-zinc-900"
                      )}
                    >
                      <FileText size={16} /> CSV
                    </button>
                    <button
                      onClick={handleExportJSON}
                      className={cn(
                        "w-full text-left px-4 py-3 flex items-center gap-2 hover:bg-white/5 transition-colors rounded-b-lg",
                        isDark ? "text-white" : "text-zinc-900"
                      )}
                    >
                      <FileJson size={16} /> JSON
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
          {!isAdding ? (
            <button 

              onClick={() => setIsAdding(true)}
              className={cn(
                "px-4 py-2 rounded-xl border text-sm transition-all flex items-center gap-2",
                isDark ? "bg-white/5 hover:bg-white/10 text-white border-white/10" : "bg-white hover:bg-zinc-50 text-zinc-900 border-zinc-200 shadow-sm"
              )}
            >
              <Plus size={18} /> Ajouter une position
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <input 
                autoFocus
                type="text"
                placeholder="Ticker"
                value={newTicker}
                onChange={(e) => setNewTicker(e.target.value)}
                className="px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
              />
              <input 
                type="number"
                placeholder="Parts"
                value={newShares}
                onChange={(e) => setNewShares(e.target.value)}
                className="px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
              />
              <input 
                type="number"
                step="0.01"
                placeholder="Prix moyen"
                value={newAvgPrice}
                onChange={(e) => setNewAvgPrice(e.target.value)}
                className="px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
              />
              <button 
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-emerald-500 text-black font-bold rounded-lg hover:bg-emerald-400 transition-colors text-sm disabled:opacity-50"
              >
                {isSubmitting ? "..." : "Ajouter"}
              </button>
              <button 
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-2 text-zinc-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Portfolio Summary */}
      {portfolioStocks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={cn(
            "border rounded-2xl p-6 transition-all",
            isDark ? "bg-zinc-900/50 border-white/5 hover:border-white/10" : "bg-white border-zinc-200 hover:border-zinc-300 shadow-sm"
          )}>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Valeur Totale</p>
            <h3 className={cn("text-2xl font-semibold", isDark ? "text-white" : "text-zinc-900")}>${totalValue.toFixed(2)}</h3>
          </div>
          <div className={cn(
            "border rounded-2xl p-6 transition-all",
            isDark ? "bg-zinc-900/50 border-white/5 hover:border-white/10" : "bg-white border-zinc-200 hover:border-zinc-300 shadow-sm"
          )}>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Coût Total</p>
            <h3 className={cn("text-2xl font-semibold", isDark ? "text-white" : "text-zinc-900")}>${totalCost.toFixed(2)}</h3>
          </div>
          <div className={cn(
            "border rounded-2xl p-6 transition-all",
            isDark ? "bg-zinc-900/50 border-white/5 hover:border-white/10" : "bg-white border-zinc-200 hover:border-zinc-300 shadow-sm"
          )}>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Gain/Perte Total</p>
            <h3 className={cn("text-2xl font-semibold", totalGain >= 0 ? "text-emerald-400" : "text-rose-400")}>${totalGain.toFixed(2)}</h3>
          </div>
        </div>
      )}

      {/* Portfolio Positions */}
      <div className="space-y-4">
        {portfolioStocks.length === 0 ? (
          <div className={cn(
            "border rounded-3xl p-12 text-center",
            isDark ? "bg-zinc-900/30 border-white/5" : "bg-white border-zinc-200 shadow-sm"
          )}>
            <Briefcase size={48} className="mx-auto text-zinc-400 mb-4" />
            <h3 className={cn("text-lg font-bold mb-2", isDark ? "text-white" : "text-zinc-900")}>Portefeuille vide</h3>
            <p className="text-zinc-500 mb-6">Ajoutez vos premières positions pour commencer à suivre vos investissements.</p>
            <button 
              onClick={() => setIsAdding(true)}
              className="px-6 py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-colors"
            >
              Ajouter une position
            </button>
          </div>
        ) : (
          portfolioStocks.map((item) => {
            const currentValue = item.shares * (item.last_price || 0);
            const cost = item.shares * item.avg_price;
            const gain = currentValue - cost;
            const gainPercent = cost > 0 ? (gain / cost) * 100 : 0;
            
            return (
              <div key={item.ticker} className={cn(
                "border rounded-2xl p-6",
                isDark ? "bg-zinc-900/30 border-white/5 hover:border-white/10" : "bg-white border-zinc-200 hover:border-zinc-300 shadow-sm"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center font-bold",
                      gain >= 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                    )}>
                      {item.ticker[0]}
                    </div>
                    <div>
                      <h4 className={cn("text-lg font-bold", isDark ? "text-white" : "text-zinc-900")}>{item.ticker}</h4>
                      <p className="text-sm text-zinc-500">{item.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn("text-2xl font-bold", isDark ? "text-white" : "text-zinc-900")}>${currentValue.toFixed(2)}</p>
                    <p className={cn(
                      "text-sm font-medium",
                      gain >= 0 ? "text-emerald-400" : "text-rose-400"
                    )}>
                      {gain >= 0 ? "+" : ""}${gain.toFixed(2)} ({gainPercent.toFixed(1)}%)
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-zinc-500">Parts</p>
                    <p className={cn("font-semibold", isDark ? "text-white" : "text-zinc-900")}>{item.shares}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Prix moyen</p>
                    <p className={cn("font-semibold", isDark ? "text-white" : "text-zinc-900")}>${item.avg_price.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Prix actuel</p>
                    <p className={cn("font-semibold", isDark ? "text-white" : "text-zinc-900")}>${(item.last_price || 0).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};