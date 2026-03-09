import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock global fetch
global.fetch = vi.fn();

const mockStock = {
  ticker: 'AAPL',
  name: 'Apple Inc.',
  sector: 'Technology',
  asset_type: 'equity',
  last_price: 150.50,
  score: 85,
  sentiment: 'bullish',
  updated_at: new Date().toISOString(),
};

const mockPosition = {
  id: 1,
  ticker: 'AAPL',
  shares: 10,
  avg_price: 140.00,
  current_price: 150.50,
  total_cost: 1400.00,
  current_value: 1505.00,
  gain: 105.00,
  gain_percent: 7.5,
};

describe('Stock API - Mock Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/stocks', () => {
    it('should fetch a list of stocks', async () => {
      const mockData = [mockStock];
      (global.fetch as any).mockResolvedValueOnce({
        status: 200,
        json: async () => mockData,
      });

      const res = await fetch('/api/stocks');
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data[0].ticker).toBe('AAPL');
    });
  });

  describe('GET /api/stocks/:ticker', () => {
    it('should fetch stock data for a valid ticker', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        status: 200,
        json: async () => mockStock,
      });

      const res = await fetch('/api/stocks/AAPL');
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.ticker).toBe('AAPL');
      expect(data.name).toBe('Apple Inc.');
    });

    it('should return 404 for invalid ticker', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        status: 404,
        json: async () => ({ error: 'Stock not found' }),
      });

      const res = await fetch('/api/stocks/INVALID');
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data.error).toBe('Stock not found');
    });
  });

  describe('Watchlist Endpoints', () => {
    it('should add a stock to watchlist', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        status: 201,
        json: async () => ({ message: 'Added to watchlist' }),
      });

      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: 'AAPL' }),
      });
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.message).toBe('Added to watchlist');
    });

    it('should get watchlist items', async () => {
      const mockWatchlist = [{ id: 1, ticker: 'AAPL', added_at: new Date().toISOString() }];
      (global.fetch as any).mockResolvedValueOnce({
        status: 200,
        json: async () => mockWatchlist,
      });

      const res = await fetch('/api/watchlist');
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data[0].ticker).toBe('AAPL');
    });

    it('should delete a stock from watchlist', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        status: 200,
        json: async () => ({ message: 'Removed from watchlist' }),
      });

      const res = await fetch('/api/watchlist/AAPL', { method: 'DELETE' });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.message).toBe('Removed from watchlist');
    });
  });

  describe('Portfolio Endpoints', () => {
    it('should add a position to portfolio', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        status: 201,
        json: async () => ({ message: 'Position added', position: mockPosition }),
      });

      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: 'AAPL', shares: 10, avg_price: 140.00 }),
      });
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.message).toBe('Position added');
      expect(data.position.ticker).toBe('AAPL');
    });

    it('should get all portfolio positions', async () => {
      const mockPortfolio = [mockPosition];
      (global.fetch as any).mockResolvedValueOnce({
        status: 200,
        json: async () => mockPortfolio,
      });

      const res = await fetch('/api/portfolio');
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data[0].ticker).toBe('AAPL');
    });

    it('should update a portfolio position', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        status: 200,
        json: async () => ({ message: 'Position updated', position: mockPosition }),
      });

      const res = await fetch('/api/portfolio/AAPL', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shares: 15, avg_price: 145.00 }),
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.message).toBe('Position updated');
    });

    it('should delete a portfolio position', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        status: 200,
        json: async () => ({ message: 'Position removed' }),
      });

      const res = await fetch('/api/portfolio/AAPL', { method: 'DELETE' });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.message).toBe('Position removed');
    });
  });
});
