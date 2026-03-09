import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart3, 
  ShieldCheck, 
  Zap, 
  Target, 
  Sparkles,
  Layers,
  PieChart as PieChartIcon,
  Globe,
  Wallet,
  AlertTriangle,
  RefreshCw,
  ArrowRight
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";
import { motion } from "motion/react";
import { cn } from "../lib/utils";
import { generatePortfolioAnalysis } from "../services/geminiService";

interface PortfolioHealthViewProps {
  portfolioData: any[];
  onClose: () => void;
  isDark: boolean;
  enableGemini?: boolean;
}

export const PortfolioHealthView = ({ portfolioData, onClose, isDark, enableGemini = true }: PortfolioHealthViewProps) => {
  const [mode, setMode] = useState<"beginner" | "advanced">("beginner");
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      try {
        // Fetch real portfolio analysis from backend
        const res = await fetch("/api/portfolio/analysis");
        const backendAnalysis = await res.json();
        
        // Combine with Gemini analysis if enabled
        if (enableGemini) {
          const geminiResult = await generatePortfolioAnalysis(portfolioData);
          setAnalysis({ ...geminiResult, ...backendAnalysis });
        } else {
          setAnalysis({ 
            ...backendAnalysis, 
            summary: "Analyse basique du portefeuille - Activez Gemini pour une analyse avancée avec IA",
            beginnerMode: "Activez Gemini pour des recommandations personnalisées",
            advancedMode: "Métriques de base disponibles"
          });
        }
      } catch (err) {
        console.error("Failed to generate portfolio analysis", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [portfolioData, enableGemini]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-20 space-y-6">
        <RefreshCw size={64} className="text-emerald-500 animate-spin" />
        <div className="text-center space-y-2">
          <h3 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-zinc-900")}>Calcul de la santé globale...</h3>
          <p className="text-zinc-500 max-w-md mx-auto italic">
            Analyse des corrélations, de l'exposition sectorielle et simulation de scénarios de stress...
          </p>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  // Mock data for charts if analysis doesn't provide it
  const allocationData = portfolioData.map(p => ({
    name: p.ticker,
    value: p.shares * p.last_price
  }));

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-20"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className={cn(
              "p-2 rounded-xl transition-colors",
              isDark ? "hover:bg-white/5 text-zinc-400" : "hover:bg-zinc-100 text-zinc-500"
            )}
          >
            <ArrowRight className="rotate-180" size={20} />
          </button>
          <div>
            <h2 className={cn("text-4xl font-black tracking-tighter mb-1", isDark ? "text-white" : "text-zinc-900")}>
              Santé du <span className="text-emerald-500">Portefeuille</span>
            </h2>
            <p className="text-zinc-500 font-medium">Analyse multi-actifs • {portfolioData.length} Lignes</p>
          </div>
        </div>

        <div className={cn(
          "p-1 rounded-2xl flex items-center gap-1",
          isDark ? "bg-zinc-900/50" : "bg-zinc-100"
        )}>
          <button 
            onClick={() => setMode("beginner")}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
              mode === "beginner" 
                ? (isDark ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "bg-white text-emerald-600 shadow-sm")
                : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            Mode Débutant
          </button>
          <button 
            onClick={() => setMode("advanced")}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
              mode === "advanced" 
                ? (isDark ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "bg-white text-emerald-600 shadow-sm")
                : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            Mode Avancé
          </button>
        </div>
      </div>

      {/* Summary Score Card */}
      <div className={cn(
        "p-10 rounded-[40px] border relative overflow-hidden",
        isDark ? "bg-zinc-900/30 border-white/5" : "bg-white border-zinc-200 shadow-sm"
      )}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-zinc-900")}>Score de Santé</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                {analysis.summary || "Votre portefeuille présente une structure équilibrée avec une forte exposition technologique."}
              </p>
            </div>
            <div className="flex items-center gap-8">
              <div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Diversification</p>
                <p className="text-xl font-bold text-emerald-400">Excellente</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Risque Global</p>
                <p className="text-xl font-bold text-amber-400">Modéré</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle cx="96" cy="96" r="88" fill="none" stroke={isDark ? "#ffffff05" : "#00000005"} strokeWidth="16" />
                <circle cx="96" cy="96" r="88" fill="none" stroke="#10b981" strokeWidth="16" strokeDasharray="553" strokeDashoffset={553 - (553 * 82) / 100} strokeLinecap="round" className="transition-all duration-1000" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className={cn("text-5xl font-black", isDark ? "text-white" : "text-zinc-900")}>82</span>
                <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">/ 100</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className={cn("font-bold text-sm uppercase tracking-widest text-zinc-500", isDark ? "text-zinc-500" : "text-zinc-400")}>Points d'attention</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10">
                <AlertTriangle size={18} className="text-rose-500 shrink-0 mt-0.5" />
                <p className="text-xs text-rose-200/80 leading-relaxed">Concentration élevée sur le secteur Tech (45%).</p>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                <Zap size={18} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-200/80 leading-relaxed">Sensibilité accrue aux taux d'intérêt US.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Allocation Card */}
        <div className={cn(
          "p-8 rounded-[32px] border",
          isDark ? "bg-zinc-900/30 border-white/5" : "bg-white border-zinc-200 shadow-sm"
        )}>
          <div className="flex items-center gap-3 mb-8">
            <PieChartIcon size={20} className="text-emerald-500" />
            <h3 className={cn("text-lg font-bold", isDark ? "text-white" : "text-zinc-900")}>Allocation d'Actifs</h3>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-6">
            {allocationData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-zinc-500">{item.name}</span>
                </div>
                <span className={cn("font-bold", isDark ? "text-white" : "text-zinc-900")}>
                  {((item.value / allocationData.reduce((a, b) => a + b.value, 0)) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk & Sensitivity */}
        <div className={cn(
          "p-8 rounded-[32px] border",
          isDark ? "bg-zinc-900/30 border-white/5" : "bg-white border-zinc-200 shadow-sm"
        )}>
          <div className="flex items-center gap-3 mb-8">
            <ShieldCheck size={20} className="text-blue-500" />
            <h3 className={cn("text-lg font-bold", isDark ? "text-white" : "text-zinc-900")}>Risque & Sensibilité</h3>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-500">Volatilité Portefeuille</span>
                <span className="text-white font-bold">14.2%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: '45%' }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-500">Drawdown Max (YTD)</span>
                <span className="text-rose-400 font-bold">-8.4%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500" style={{ width: '30%' }} />
              </div>
            </div>
            <div className="pt-6 border-t border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe size={14} className="text-zinc-500" />
                  <span className="text-xs text-zinc-500">Exposition USD</span>
                </div>
                <span className="text-xs font-bold text-white">85%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target size={14} className="text-zinc-500" />
                  <span className="text-xs text-zinc-500">Bêta Marché</span>
                </div>
                <span className="text-xs font-bold text-white">1.12</span>
              </div>
            </div>
          </div>
        </div>

        {/* Suggestions Card */}
        <div className={cn(
          "p-8 rounded-[32px] border",
          isDark ? "bg-zinc-900/30 border-white/5" : "bg-white border-zinc-200 shadow-sm"
        )}>
          <div className="flex items-center gap-3 mb-8">
            <RefreshCw size={20} className="text-amber-500" />
            <h3 className={cn("text-lg font-bold", isDark ? "text-white" : "text-zinc-900")}>Rééquilibrage</h3>
          </div>
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
              <p className="text-xs text-emerald-400 font-bold mb-2">Opportunité</p>
              <p className="text-xs text-zinc-400 leading-relaxed">Envisager d'augmenter l'exposition aux valeurs défensives pour réduire le bêta global.</p>
            </div>
            <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
              <p className="text-xs text-blue-400 font-bold mb-2">Action suggérée</p>
              <p className="text-xs text-zinc-400 leading-relaxed">Prendre des bénéfices partiels sur NVDA pour ramener la ligne à 15% du portefeuille.</p>
            </div>
            <button className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all">
              Générer un plan détaillé
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
