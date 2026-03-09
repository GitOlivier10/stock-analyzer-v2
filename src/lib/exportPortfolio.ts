import { Portfolio } from '../hooks/usePortfolio';

export interface ExportOptions {
  includeHeaders?: boolean;
  format?: 'csv' | 'json' | 'excel';
}

export const exportPortfolio = (portfolio: Portfolio[], options: ExportOptions = {}) => {
  const { format = 'csv', includeHeaders = true } = options;

  if (format === 'csv') {
    return exportToCSV(portfolio, includeHeaders);
  } else if (format === 'json') {
    return exportToJSON(portfolio);
  }
};

const exportToCSV = (portfolio: Portfolio[], includeHeaders: boolean): string => {
  const headers = ['Ticker', 'Name', 'Shares', 'Average Price', 'Current Price', 'Value', 'Gain/Loss', 'Gain %'];
  
  const rows = portfolio.map(item => {
    const currentValue = item.shares * (item.last_price || 0);
    const cost = item.shares * item.avg_price;
    const gain = currentValue - cost;
    const gainPercent = cost > 0 ? (gain / cost) * 100 : 0;

    return [
      item.ticker,
      item.name || '',
      item.shares,
      item.avg_price.toFixed(2),
      (item.last_price || 0).toFixed(2),
      currentValue.toFixed(2),
      gain.toFixed(2),
      gainPercent.toFixed(2),
    ].map(v => `"${v}"`).join(',');
  });

  const csv = [
    ...(includeHeaders ? [headers.join(',')] : []),
    ...rows,
  ].join('\n');

  return csv;
};

const exportToJSON = (portfolio: Portfolio[]): string => {
  const enriched = portfolio.map(item => {
    const currentValue = item.shares * (item.last_price || 0);
    const cost = item.shares * item.avg_price;
    const gain = currentValue - cost;
    const gainPercent = cost > 0 ? (gain / cost) * 100 : 0;

    return {
      ...item,
      currentValue,
      cost,
      gain,
      gainPercent,
    };
  });

  return JSON.stringify(enriched, null, 2);
};

export const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportPortfolioAsCSV = (portfolio: Portfolio[]) => {
  const csv = exportPortfolio(portfolio, { format: 'csv' });
  const filename = `portfolio_${new Date().toISOString().split('T')[0]}.csv`;
  downloadFile(csv, filename, 'text/csv');
};

export const exportPortfolioAsJSON = (portfolio: Portfolio[]) => {
  const json = exportPortfolio(portfolio, { format: 'json' });
  const filename = `portfolio_${new Date().toISOString().split('T')[0]}.json`;
  downloadFile(json, filename, 'application/json');
};
