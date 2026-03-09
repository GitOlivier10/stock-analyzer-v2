import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface AnalysisResult {
  summary: {
    text: string;
    verdict: string;
    trend: "haussière" | "neutre" | "baissière";
    riskLevel: "faible" | "moyen" | "élevé";
    horizon: "court terme" | "moyen terme" | "long terme";
  };
  context: {
    sentiment: string;
    sectorTrend: string;
    globalContext: string;
  };
  scenarios: {
    bullish: { probability: number; arguments: string[]; confidence: number; invalidation: string };
    neutral: { probability: number; arguments: string[]; confidence: number; invalidation: string };
    bearish: { probability: number; arguments: string[]; confidence: number; invalidation: string };
  };
}

export async function generateAssetAnalysis(stockData: any): Promise<AnalysisResult> {
  const prompt = `
    Analyse financière détaillée pour l'actif suivant : ${stockData.ticker} (${stockData.name}).
    Données actuelles :
    - Prix : ${stockData.price}
    - Score Multi-facteurs : ${stockData.score}/100
    - Sentiment : ${stockData.sentiment}
    - Technique : RSI=${stockData.technical.rsi}, SMA50=${stockData.technical.sma50}, SMA200=${stockData.technical.sma200}, Volatilité=${stockData.technical.volatility}, Drawdown=${stockData.technical.drawdown}%
    - Fondamentaux : Croissance CA=${stockData.fundamentals.revenueGrowth}, Marge=${stockData.fundamentals.profitMargins}, Debt/Equity=${stockData.fundamentals.debtToEquity}, P/E=${stockData.fundamentals.peRatio}
    - Secteur : ${stockData.profile?.sector}
    - Industrie : ${stockData.profile?.industry}

    Produis une analyse structurée en JSON respectant exactement ce schéma :
    {
      "summary": {
        "text": "Résumé clair en français",
        "verdict": "Verdict synthétique",
        "trend": "haussière" | "neutre" | "baissière",
        "riskLevel": "faible" | "moyen" | "élevé",
        "horizon": "court terme" | "moyen terme" | "long terme"
      },
      "context": {
        "sentiment": "Sentiment de marché actuel",
        "sectorTrend": "Tendance du secteur",
        "globalContext": "Qualité ou fragilité du contexte global"
      },
      "scenarios": {
        "bullish": { "probability": 0.XX, "arguments": ["arg1", "arg2"], "confidence": 0.XX, "invalidation": "seuil" },
        "neutral": { "probability": 0.XX, "arguments": ["arg1", "arg2"], "confidence": 0.XX, "invalidation": "seuil" },
        "bearish": { "probability": 0.XX, "arguments": ["arg1", "arg2"], "confidence": 0.XX, "invalidation": "seuil" }
      }
    }
    L'analyse doit être pédagogique pour les débutants mais précise pour les experts.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text || "{}");
}

export async function generatePortfolioAnalysis(portfolioData: any[]): Promise<any> {
  const prompt = `
    Analyse de santé globale d'un portefeuille d'investissement.
    Positions : ${JSON.stringify(portfolioData)}

    Produis une analyse structurée en JSON couvrant :
    - Performance totale et par ligne
    - Allocation et concentration
    - Diversification (sectorielle, géographique)
    - Volatilité et Drawdown estimés
    - Sensibilité aux taux et au marché
    - Forces et faiblesses
    - Suggestions de rééquilibrage
    - Mode débutant (explications simples)
    - Mode avancé (détails chiffrés)
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text || "{}");
}
