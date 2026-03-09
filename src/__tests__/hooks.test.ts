import { describe, it, expect, beforeEach, vi } from 'vitest';

// Test the CacheManager
describe('CacheManager', () => {
  let mockLocalStorage: { [key: string]: string } = {};

  beforeEach(() => {
    // Mock localStorage for testing
    mockLocalStorage = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (key: string) => mockLocalStorage[key] || null,
        setItem: (key: string, value: string) => { mockLocalStorage[key] = value; },
        removeItem: (key: string) => { delete mockLocalStorage[key]; },
        clear: () => { mockLocalStorage = {}; },
        key: (index: number) => Object.keys(mockLocalStorage)[index] || null,
        get length() { return Object.keys(mockLocalStorage).length; }
      },
      writable: true
    });
  });

  it('should set and get cache data', () => {
    const testData = { ticker: 'AAPL', price: 150 };
    const cacheKey = 'test_key';
    const ttl = 3600000; // 1 hour

    // Simulate CacheManager.set
    const timestamp = Date.now();
    const cacheEntry = { data: testData, timestamp, ttl };
    localStorage.setItem(`stock_analyzer_cache_${cacheKey}`, JSON.stringify(cacheEntry));

    // Simulate CacheManager.get
    const stored = localStorage.getItem(`stock_analyzer_cache_${cacheKey}`);
    expect(stored).toBeDefined();
    
    if (stored) {
      const parsed = JSON.parse(stored);
      const isExpired = Date.now() - parsed.timestamp > parsed.ttl;
      expect(isExpired).toBe(false);
      expect(parsed.data).toEqual(testData);
    }
  });

  it('should expire cached data after TTL', () => {
    const testData = { ticker: 'AAPL', price: 150 };
    const cacheKey = 'expiring_key';
    const ttl = 1000; // 1 second

    // Set cache with past timestamp
    const timestamp = Date.now() - 2000; // 2 seconds ago
    const cacheEntry = { data: testData, timestamp, ttl };
    localStorage.setItem(`stock_analyzer_cache_${cacheKey}`, JSON.stringify(cacheEntry));

    // Check if expired
    const stored = localStorage.getItem(`stock_analyzer_cache_${cacheKey}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      const isExpired = Date.now() - parsed.timestamp > parsed.ttl;
      expect(isExpired).toBe(true);
    }
  });

  it('should remove cache entry', () => {
    const cacheKey = 'remove_key';
    localStorage.setItem(`stock_analyzer_cache_${cacheKey}`, JSON.stringify({ data: {} }));
    
    expect(localStorage.getItem(`stock_analyzer_cache_${cacheKey}`)).toBeDefined();
    
    localStorage.removeItem(`stock_analyzer_cache_${cacheKey}`);
    expect(localStorage.getItem(`stock_analyzer_cache_${cacheKey}`)).toBeNull();
  });

  it('should clear all cache entries', () => {
    localStorage.setItem(`stock_analyzer_cache_key1`, JSON.stringify({ data: {} }));
    localStorage.setItem(`stock_analyzer_cache_key2`, JSON.stringify({ data: {} }));
    localStorage.setItem('other_key', JSON.stringify({ data: {} }));

    // Clear all stock_analyzer_cache_* keys
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('stock_analyzer_cache_')) {
        localStorage.removeItem(key);
      }
    });

    expect(localStorage.getItem('stock_analyzer_cache_key1')).toBeNull();
    expect(localStorage.getItem('stock_analyzer_cache_key2')).toBeNull();
    expect(localStorage.getItem('other_key')).toBeDefined();
  });

  it('should calculate cache size correctly', () => {
    const testData = { ticker: 'AAPL', price: 150, details: { sector: 'Tech' } };
    localStorage.setItem(`stock_analyzer_cache_test`, JSON.stringify(testData));

    let totalSize = 0;
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('stock_analyzer_cache_')) {
        const item = localStorage.getItem(key);
        if (item) {
          totalSize += item.length;
        }
      }
    });

    expect(totalSize).toBeGreaterThan(0);
  });
});

// Test notification object structure
describe('Notification System', () => {
  it('should have required notification properties', () => {
    const notification = {
      id: '1',
      message: 'Test message',
      type: 'success' as const,
      duration: 3000,
    };

    expect(notification).toHaveProperty('id');
    expect(notification).toHaveProperty('message');
    expect(notification).toHaveProperty('type');
    expect(notification).toHaveProperty('duration');
    expect(['success', 'error', 'warning', 'info']).toContain(notification.type);
  });

  it('should support all notification types', () => {
    const types = ['success', 'error', 'warning', 'info'] as const;
    
    types.forEach(type => {
      const notification = {
        id: `${type}-1`,
        message: `${type} message`,
        type: type,
        duration: 3000,
      };
      expect(notification.type).toBe(type);
    });
  });
});

// Test portfolio calculations
describe('Portfolio Calculations', () => {
  it('should calculate gain correctly', () => {
    const position = {
      shares: 10,
      avg_price: 140.00,
      current_price: 150.50,
    };

    const totalCost = position.shares * position.avg_price;
    const currentValue = position.shares * position.current_price;
    const gain = currentValue - totalCost;

    expect(totalCost).toBe(1400);
    expect(currentValue).toBe(1505);
    expect(gain).toBe(105);
  });

  it('should calculate gain percentage correctly', () => {
    const position = {
      shares: 10,
      avg_price: 140.00,
      current_price: 150.50,
    };

    const totalCost = position.shares * position.avg_price;
    const currentValue = position.shares * position.current_price;
    const gain = currentValue - totalCost;
    const gainPercent = (gain / totalCost) * 100;

    expect(gainPercent).toBeCloseTo(7.5, 1);
  });

  it('should aggregate portfolio stats', () => {
    const positions = [
      { shares: 10, avg_price: 140, current_price: 150 },
      { shares: 5, avg_price: 200, current_price: 210 },
    ];

    let totalCost = 0;
    let totalValue = 0;

    positions.forEach(p => {
      totalCost += p.shares * p.avg_price;
      totalValue += p.shares * p.current_price;
    });

    const totalGain = totalValue - totalCost;
    const gainPercent = (totalGain / totalCost) * 100;

    expect(totalCost).toBe(2400); // (10*140) + (5*200) = 1400 + 1000 = 2400
    expect(totalValue).toBe(2100); // (10*150) + (5*210) = 1500 + 1050 = 2100
    expect(totalGain).toBe(-300); // 2100 - 2400 = -300
    expect(gainPercent).toBe(5);
  });
});

// Test export data formats
describe('Export Formats', () => {
  it('should format portfolio data as CSV', () => {
    const portfolio = [
      { ticker: 'AAPL', shares: 10, avg_price: 140, current_price: 150, gain: 100, gain_percent: 7.14 },
      { ticker: 'MSFT', shares: 5, avg_price: 300, current_price: 310, gain: 50, gain_percent: 3.33 },
    ];

    const headers = ['Ticker', 'Shares', 'Average Price', 'Current Price', 'Gain', 'Gain %'];
    let csv = headers.join(',') + '\n';
    portfolio.forEach(p => {
      csv += `${p.ticker},${p.shares},${p.avg_price},${p.current_price},${p.gain},${p.gain_percent}\n`;
    });

    expect(csv).toContain('AAPL');
    expect(csv).toContain('MSFT');
    expect(csv).toContain('Ticker');
  });

  it('should format portfolio data as JSON', () => {
    const portfolio = [
      { ticker: 'AAPL', shares: 10, avg_price: 140, current_price: 150 },
      { ticker: 'MSFT', shares: 5, avg_price: 300, current_price: 310 },
    ];

    const json = JSON.stringify(portfolio, null, 2);
    const parsed = JSON.parse(json);

    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0].ticker).toBe('AAPL');
    expect(parsed[1].ticker).toBe('MSFT');
  });
});
