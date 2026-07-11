import { Strategy } from '@/types/trading';
import { checkStrategy } from '../strategyCheck';

function base(): Strategy {
  return {
    id: 's1',
    createdAt: 0,
    updatedAt: 0,
    name: 'London Pullback',
    market: 'EUR/USD',
    timeframe: 'M15',
    session: 'london',
    direction: 'long',
    trendFilter: 'H4 trend must be bullish (higher highs and higher lows)',
    setup: 'Pullback into a previously marked support zone',
    entryTrigger: '15m candle closes above the previous candle high',
    stopRule: 'Below the pullback swing low',
    targetRule: '2R fixed target',
    minRR: 2,
    riskPercent: 0.5,
    maxTradesPerDay: 2,
    newsRule: 'No entries within 15 minutes of high-impact EUR or USD news',
    invalidation: '15m close below the support zone',
    version: 1,
  };
}

describe('checkStrategy', () => {
  it('passes a well-formed objective strategy', () => {
    expect(checkStrategy(base())).toEqual([]);
  });

  it('errors on a missing stop rule', () => {
    const issues = checkStrategy({ ...base(), stopRule: '' });
    expect(issues.some((i) => i.severity === 'error' && i.field === 'stopRule')).toBe(true);
  });

  it('flags vague wording as a warning', () => {
    const issues = checkStrategy({ ...base(), setup: 'Enter when the chart feels bullish' });
    expect(issues.some((i) => i.severity === 'warning' && i.field === 'setup')).toBe(true);
  });

  it('rejects certainty language outright', () => {
    const issues = checkStrategy({ ...base(), entryTrigger: 'This entry is guaranteed to work' });
    expect(issues.some((i) => i.severity === 'error' && i.field === 'entryTrigger')).toBe(true);
  });

  it('warns on aggressive risk, low RR and overtrading caps', () => {
    const issues = checkStrategy({ ...base(), riskPercent: 5, minRR: 0.5, maxTradesPerDay: 10 });
    expect(issues.filter((i) => i.severity === 'warning').length).toBeGreaterThanOrEqual(3);
  });

  it('errors on zero risk', () => {
    const issues = checkStrategy({ ...base(), riskPercent: 0 });
    expect(issues.some((i) => i.severity === 'error' && i.field === 'riskPercent')).toBe(true);
  });

  it('warns when the news rule is missing', () => {
    const issues = checkStrategy({ ...base(), newsRule: '' });
    expect(issues.some((i) => i.field === 'newsRule')).toBe(true);
  });
});
