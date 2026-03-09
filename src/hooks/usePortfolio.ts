import { useState, useCallback } from 'react';

export interface Portfolio {
  ticker: string;
  shares: number;
  avg_price: number;
  name?: string;
  last_price?: number;
  score?: number;
}

export const usePortfolio = () => {
  const [portfolio, setPortfolio] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPortfolio = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/portfolio');
      const data = await res.json();
      setPortfolio(data);
      return data;
    } catch (err) {
      console.error('Failed to load portfolio', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const addPosition = useCallback(async (ticker: string, shares: number, avgPrice: number) => {
    try {
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: ticker.toUpperCase(), shares, avgPrice })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to add position');
      }

      await loadPortfolio();
      return true;
    } catch (err) {
      console.error('Failed to add position', err);
      throw err;
    }
  }, [loadPortfolio]);

  const updatePosition = useCallback(async (ticker: string, shares: number, avgPrice: number) => {
    try {
      const res = await fetch(`/api/portfolio/${ticker.toUpperCase()}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shares, avgPrice })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update position');
      }

      await loadPortfolio();
      return true;
    } catch (err) {
      console.error('Failed to update position', err);
      throw err;
    }
  }, [loadPortfolio]);

  const removePosition = useCallback(async (ticker: string) => {
    try {
      const res = await fetch(`/api/portfolio/${ticker.toUpperCase()}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to remove position');
      }

      await loadPortfolio();
      return true;
    } catch (err) {
      console.error('Failed to remove position', err);
      throw err;
    }
  }, [loadPortfolio]);

  const getPortfolioStats = useCallback(() => {
    const totalValue = portfolio.reduce((sum, item) => sum + (item.shares * (item.last_price || 0)), 0);
    const totalCost = portfolio.reduce((sum, item) => sum + (item.shares * item.avg_price), 0);
    const totalGain = totalValue - totalCost;
    const gainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

    return {
      totalValue,
      totalCost,
      totalGain,
      gainPercent,
      positions: portfolio.length,
    };
  }, [portfolio]);

  return {
    portfolio,
    loading,
    loadPortfolio,
    addPosition,
    updatePosition,
    removePosition,
    getPortfolioStats,
  };
};
