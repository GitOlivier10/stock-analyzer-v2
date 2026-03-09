import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Activity, 
  BarChart3, 
  ShieldCheck, 
  Zap, 
  Target, 
  Info,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Layers,
  PieChart as PieChartIcon
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { generateAssetAnalysis, AnalysisResult } from "../services/geminiService";

interface AssetAnalysisViewProps {
  stockData: any;
  onClose: () => void;
  isDark: boolean;
  enableGemini?: boolean;
}

export const AssetAnalysisView = ({ stockData, onClose, isDark, enableGemini = true }: AssetAnalysisViewProps) => {
  const [mode, setMode] = useState<"beginner" | "advanced">("beginner");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      try {
        if (enableGemini) {
          const result = await generateAssetAnalysis(stockData);
          setAnalysis(result);
        } else {
          // Provide basic analysis without AI
          setAnalysis({
            summary: {
              text: `Analyse basique de ${stockData.ticker}. Prix actuel: $${stockData.price?.toFixed(2) || 'N/A'}. Score: ${stockData.score || 'N/A'}/100.`,
              verdict: "Analyse basique - Activez Gemini pour une analyse avancée",
              trend: "neutre" as const,
              riskLevel: "moyen" as const,
              horizon: "court terme" as const
            },
            context: {
              sentiment: "Non disponible sans IA",
              sectorTrend: "Non disponible sans IA",
              globalContext: "Activez Gemini pour une analyse complète"
            },
            scenarios: {
              bullish: { probability: 0.33, arguments: ["Analyse basique"], confidence: 0.5, invalidation: "N/A" },
              neutral: { probability: 0.34, arguments: ["Analyse basique"], confidence: 0.5, invalidation: "N/A" },
              bearish: { probability: 0.33, arguments: ["Analyse basique"], confidence: 0.5, invalidation: "N/A" }
            }
          });
        }
      } catch (err) {
        console.error("Failed to generate analysis", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [stockData, enableGemini]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-20 space-y-6">
        <div className="relative">
          <Sparkles size={64} className="text-emerald-500 animate-pulse" />
          <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full" />
        </div>
        <div className="text-center space-y-2">
          <h3 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-zinc-900")}>Analyse IA en cours...</h3>
          <p className="text-zinc-500 max-w-md mx-auto italic">
            Notre moteur de scénarios probabilistes analyse les fondamentaux, la technique et le contexte de {stockData.ticker}...
          </p>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const scoreData = [
    { name: 'Technique', value: stockData.score * 0.4, color: '#10b981' },
    { name: 'Fondamental', value: stockData.score * 0.3, color: '#3b82f6' },
    { name: 'Sentiment', value: stockData.score * 0.15, color: '#f59e0b' },
    { name: 'Risque', value: stockData.score * 0.15, color: '#ef4444' },
  ];

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
            <div className="flex items-center gap-3 mb-1">
              <h2 className={cn("text-4xl font-black tracking-tighter", isDark ? "text-white" : "text-zinc-900")}>
                {stockData.ticker}
              </h2>
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest",
                stockData.sentiment === "bull" ? "bg-emerald-500/10 text-emerald-500" : 
                stockData.sentiment === "bear" ? "bg-rose-500/10 text-rose-500" : 
                "bg-zinc-500/10 text-zinc-400"
              )}>
                {analysis.summary.trend}
              </span>
            </div>
            <p className="text-zinc-500 font-medium">{stockData.name} • {stockData.profile?.sector}</p>
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Summary & Score */}
        <div className="lg:col-span-2 space-y-8">
          
            {/* Summary Card */}
            <div className={cn(
              "p-8 rounded-[32px] border relative overflow-hidden",
              isDark ? "bg-zinc-900/30 border-white/5" : "bg-white border-zinc-200 shadow-sm"
            )}>
              <div className="flex items-start justify-between mb-6">
                <div className="space-y-1">
                  <h3 className={cn("text-xl font-bold", isDark ? "text-white" : "text-zinc-900")}>Résumé de l'Analyse</h3>
                  <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest">Verdict IA</p>
                </div>
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center",
                  isDark ? "bg-emerald-500/10 text-emerald-500" : "bg-emerald-50 text-emerald-600"
                )}>
                  <ShieldCheck size={24} />
                </div>
              </div>
              <p className={cn(
                "text-lg leading-relaxed mb-8",
                isDark ? "text-zinc-300" : "text-zinc-700"
              )}>
                {analysis.summary.text}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Verdict</p>
                  <p className="font-bold text-emerald-400">{analysis.summary.verdict}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Risque</p>
                  <p className={cn(
                    "font-bold",
                    analysis.summary.riskLevel === "élevé" ? "text-rose-400" : 
                    analysis.summary.riskLevel === "moyen" ? "text-amber-400" : "text-emerald-400"
                  )}>{analysis.summary.riskLevel}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Horizon</p>
                  <p className="font-bold text-white">{analysis.summary.horizon}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Score Global</p>
                  <p className="text-2xl font-black text-emerald-500">{stockData.score}/100</p>
                </div>
              </div>
            </div>

            {/* Price Chart */}
            <div className={cn(
              "p-8 rounded-[32px] border",
              isDark ? "bg-zinc-900/30 border-white/5" : "bg-white border-zinc-200 shadow-sm"
            )}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <TrendingUp size={20} className="text-emerald-500" />
                  <h3 className={cn("text-lg font-bold", isDark ? "text-white" : "text-zinc-900")}>Performance Historique</h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Prix</span>
                  </div>
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stockData.history}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                    <XAxis 
                      dataKey="date" 
                      hide 
                    />
                    <YAxis 
                      domain={['auto', 'auto']} 
                      orientation="right"
                      tick={{ fontSize: 10, fill: '#71717a' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val) => `$${val.toFixed(0)}`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? '#18181b' : '#fff', 
                        border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}
                      itemStyle={{ color: '#10b981' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="close" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorPrice)" 
                      animationDuration={1500}
                    />
                    {mode === "advanced" && stockData.technical.bollinger && (
                      <>
                        <Area 
                          type="monotone" 
                          dataKey={() => stockData.technical.bollinger.upper} 
                          stroke="rgba(59, 130, 246, 0.2)" 
                          fill="transparent" 
                          strokeDasharray="5 5"
                        />
                        <Area 
                          type="monotone" 
                          dataKey={() => stockData.technical.bollinger.lower} 
                          stroke="rgba(59, 130, 246, 0.2)" 
                          fill="transparent" 
                          strokeDasharray="5 5"
                        />
                      </>
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              {mode === "advanced" && (
                <div className="h-[80px] w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stockData.history}>
                      <Bar dataKey="volume" fill={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} />
                      <XAxis dataKey="date" hide />
                      <Tooltip 
                        contentStyle={{ display: 'none' }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

          {/* Market & Technical Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className={cn(
              "p-8 rounded-[32px] border",
              isDark ? "bg-zinc-900/30 border-white/5" : "bg-white border-zinc-200 shadow-sm"
            )}>
              <div className="flex items-center gap-3 mb-6">
                <Activity size={20} className="text-emerald-500" />
                <h3 className={cn("text-lg font-bold", isDark ? "text-white" : "text-zinc-900")}>Analyse Technique</h3>
              </div>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-500">RSI (14)</span>
                  <span className={cn(
                    "font-bold",
                    stockData.technical.rsi > 70 ? "text-rose-400" : 
                    stockData.technical.rsi < 30 ? "text-emerald-400" : (isDark ? "text-white" : "text-zinc-900")
                  )}>{stockData.technical.rsi?.toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-500">SMA 20 / 50 / 200</span>
                  <span className="font-bold text-zinc-400 text-xs">
                    {stockData.technical.sma20?.toFixed(0)} / {stockData.technical.sma50?.toFixed(0)} / {stockData.technical.sma200?.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-500">MACD Line</span>
                  <span className={cn(
                    "font-bold",
                    stockData.technical.macd?.line > 0 ? "text-emerald-400" : "text-rose-400"
                  )}>{stockData.technical.macd?.line?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-500">ATR (14)</span>
                  <span className="font-bold text-zinc-400">{stockData.technical.atr?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-500">Volatilité</span>
                  <span className="font-bold text-zinc-400">{(stockData.technical.volatility * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-500">Drawdown Max</span>
                  <span className="font-bold text-rose-400">{stockData.technical.drawdown?.toFixed(1)}%</span>
                </div>
                {mode === "advanced" && (
                  <div className="pt-4 border-t border-white/5 space-y-4">
                    <p className="text-xs text-zinc-500 italic">
                      Le RSI à {stockData.technical.rsi?.toFixed(1)} indique un état de {stockData.technical.rsi > 70 ? "sur-achat" : stockData.technical.rsi < 30 ? "sur-vente" : "neutralité"}.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className={cn(
              "p-8 rounded-[32px] border",
              isDark ? "bg-zinc-900/30 border-white/5" : "bg-white border-zinc-200 shadow-sm"
            )}>
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 size={20} className="text-blue-500" />
                <h3 className={cn("text-lg font-bold", isDark ? "text-white" : "text-zinc-900")}>Fondamentaux</h3>
              </div>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-500">Croissance CA</span>
                  <span className="font-bold text-emerald-400">{(stockData.fundamentals.revenueGrowth * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-500">Marge Nette</span>
                  <span className="font-bold text-white">{(stockData.fundamentals.profitMargins * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-500">Ratio P/E</span>
                  <span className="font-bold text-white">{stockData.fundamentals.peRatio?.toFixed(1)}x</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-500">Dette / Equity</span>
                  <span className="font-bold text-white">{stockData.fundamentals.debtToEquity?.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Multi-Timeframe Analysis */}
          <div className={cn(
            "p-8 rounded-[32px] border",
            isDark ? "bg-zinc-900/30 border-white/5" : "bg-white border-zinc-200 shadow-sm"
          )}>
            <div className="flex items-center gap-3 mb-6">
              <Layers size={20} className="text-amber-500" />
              <h3 className={cn("text-lg font-bold", isDark ? "text-white" : "text-zinc-900")}>Analyse Multi-Timeframe</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Journalier", value: stockData.technical.timeframes?.daily },
                { label: "Hebdomadaire", value: stockData.technical.timeframes?.weekly },
                { label: "Mensuel", value: stockData.technical.timeframes?.monthly },
              ].map((tf) => (
                <div key={tf.label} className={cn(
                  "p-4 rounded-2xl border text-center space-y-1",
                  isDark ? "bg-white/5 border-white/5" : "bg-zinc-50 border-zinc-100"
                )}>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{tf.label}</p>
                  <p className={cn(
                    "text-sm font-bold",
                    tf.value === "Bullish" ? "text-emerald-400" : tf.value === "Bearish" ? "text-rose-400" : "text-zinc-400"
                  )}>{tf.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Scenarios Section */}
          <div className="space-y-6">
            <h3 className={cn("text-2xl font-black tracking-tight", isDark ? "text-white" : "text-zinc-900")}>Moteur de Scénarios</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { type: "Bullish", data: analysis.scenarios.bullish, color: "emerald", icon: TrendingUp },
                { type: "Neutral", data: analysis.scenarios.neutral, color: "zinc", icon: Activity },
                { type: "Bearish", data: analysis.scenarios.bearish, color: "rose", icon: TrendingDown },
              ].map((scenario) => (
                <div key={scenario.type} className={cn(
                  "p-6 rounded-3xl border transition-all hover:scale-[1.02]",
                  isDark ? "bg-zinc-900/30 border-white/5" : "bg-white border-zinc-200 shadow-sm"
                )}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      scenario.color === "emerald" ? "bg-emerald-500/10 text-emerald-500" : 
                      scenario.color === "rose" ? "bg-rose-500/10 text-rose-500" : "bg-zinc-500/10 text-zinc-400"
                    )}>
                      <scenario.icon size={20} />
                    </div>
                    <span className={cn(
                      "text-sm font-black",
                      scenario.color === "emerald" ? "text-emerald-400" : 
                      scenario.color === "rose" ? "text-rose-400" : "text-zinc-400"
                    )}>{(scenario.data.probability * 100).toFixed(0)}%</span>
                  </div>
                  <h4 className={cn("font-bold mb-3", isDark ? "text-white" : "text-zinc-900")}>{scenario.type}</h4>
                  <ul className="space-y-2 mb-4">
                    {scenario.data.arguments.slice(0, 2).map((arg, i) => (
                      <li key={i} className="text-xs text-zinc-500 flex items-start gap-2">
                        <ChevronRight size={12} className="mt-0.5 shrink-0" />
                        {arg}
                      </li>
                    ))}
                  </ul>
                  <div className="pt-4 border-t border-white/5">
                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mb-1">Invalidation</p>
                    <p className="text-xs text-zinc-400">{scenario.data.invalidation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Context & Risk */}
        <div className="space-y-8">
          
          {/* Context Card */}
          <div className={cn(
            "p-8 rounded-[32px] border",
            isDark ? "bg-zinc-900/30 border-white/5" : "bg-white border-zinc-200 shadow-sm"
          )}>
            <div className="flex items-center gap-3 mb-6">
              <Sparkles size={20} className="text-amber-500" />
              <h3 className={cn("text-lg font-bold", isDark ? "text-white" : "text-zinc-900")}>Analyse Contextuelle</h3>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Sentiment</p>
                <p className={cn("text-sm leading-relaxed", isDark ? "text-zinc-300" : "text-zinc-700")}>{analysis.context.sentiment}</p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Secteur</p>
                <p className={cn("text-sm leading-relaxed", isDark ? "text-zinc-300" : "text-zinc-700")}>{analysis.context.sectorTrend}</p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Global</p>
                <p className={cn("text-sm leading-relaxed", isDark ? "text-zinc-300" : "text-zinc-700")}>{analysis.context.globalContext}</p>
              </div>
            </div>
          </div>

          {/* Score Breakdown (Advanced) */}
          {mode === "advanced" && (
            <div className={cn(
              "p-8 rounded-[32px] border",
              isDark ? "bg-zinc-900/30 border-white/5" : "bg-white border-zinc-200 shadow-sm"
            )}>
              <div className="flex items-center gap-3 mb-6">
                <Layers size={20} className="text-emerald-500" />
                <h3 className={cn("text-lg font-bold", isDark ? "text-white" : "text-zinc-900")}>Décomposition du Signal</h3>
              </div>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreData} layout="vertical">
                    <XAxis type="number" hide domain={[0, 40]} />
                    <YAxis dataKey="name" type="category" hide />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '8px' }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                      {scoreData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3 mt-4">
                {scoreData.map((s) => (
                  <div key={s.name} className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500">{s.name}</span>
                    <span className="font-bold text-white">{s.value.toFixed(0)} pts</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risk Profile */}
          <div className={cn(
            "p-8 rounded-[32px] border",
            isDark ? "bg-zinc-900/30 border-white/5" : "bg-white border-zinc-200 shadow-sm"
          )}>
            <div className="flex items-center gap-3 mb-6">
              <Target size={20} className="text-rose-500" />
              <h3 className={cn("text-lg font-bold", isDark ? "text-white" : "text-zinc-900")}>Profil de Risque</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-xs text-zinc-500">Corrélation Marché</span>
                <span className="text-sm font-bold text-white">{stockData.fundamentals.beta?.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-xs text-zinc-500">Stabilité</span>
                <span className="text-sm font-bold text-emerald-400">Élevée</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-xs text-zinc-500">Risque Spécifique</span>
                <span className="text-sm font-bold text-amber-400">Modéré</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
