import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { EquitySparkline } from '@/components/chart/CandleChart';
import { Body, Button, Card, Dim, EmptyState, Row, Screen, SectionTitle, Spacer, StatTile, Subtitle, Title } from '@/components/ui';
import { equityCurve } from '@/lib/calc';
import { useJournal } from '@/store/journal';
import { useTheme } from '@/theme';
import { MistakeTag } from '@/types/trading';

const MISTAKE_LABELS: Record<MistakeTag, string> = {
  'no-plan': 'No plan',
  'moved-stop': 'Moved stop',
  oversized: 'Oversized',
  'chased-entry': 'Chased entry',
  'early-exit': 'Early exit',
  'held-loser': 'Held loser',
  'news-ignored': 'Ignored news',
  overtraded: 'Overtraded',
  'against-trend': 'Against trend',
  'revenge-trade': 'Revenge trade',
};

export default function JournalScreen() {
  const t = useTheme();
  const trades = useJournal((s) => s.trades);

  const stats = useMemo(() => {
    const closed = trades.filter((x) => x.resultR !== null);
    const results = closed.map((x) => x.resultR as number);
    const wins = results.filter((r) => r > 0).length;
    const netR = results.reduce((a, b) => a + b, 0);
    const ruleFollowed = trades.filter((x) => x.followedRules).length;
    const planned = trades.filter((x) => x.planned).length;
    const mistakeCounts = new Map<MistakeTag, number>();
    for (const tr of trades) for (const m of tr.mistakes) mistakeCounts.set(m, (mistakeCounts.get(m) ?? 0) + 1);
    const topMistake = [...mistakeCounts.entries()].sort((a, b) => b[1] - a[1])[0];
    const recentLosses = closed.slice(0, 3).filter((x) => (x.resultR ?? 0) < 0).length;
    return {
      closed: closed.length,
      wins,
      winRate: closed.length ? wins / closed.length : 0,
      netR,
      compliance: trades.length ? ruleFollowed / trades.length : 1,
      plannedRatio: trades.length ? planned / trades.length : 1,
      topMistake,
      curve: equityCurve([...results].reverse()),
      tiltWarning: recentLosses >= 3,
    };
  }, [trades]);

  return (
    <Screen>
      <Title>Trading journal</Title>
      <Subtitle>The mirror of your process. Losing trades recorded honestly are worth more than screenshots of winners.</Subtitle>
      <Spacer h={3} />
      <Button label="＋ Log a trade" onPress={() => router.push('/journal-entry')} />
      <Spacer h={3} />

      {trades.length === 0 ? (
        <EmptyState
          icon="📓"
          title="No trades yet"
          body="Log demo, replay or backtest trades here. Every entry asks about your plan, emotions and rule adherence — the analytics find your patterns."
        />
      ) : (
        <>
          {stats.tiltWarning && (
            <Card style={{ borderColor: t.colors.warning }}>
              <Body style={{ fontWeight: '800', color: t.colors.warning }}>⚠ Cool-down suggestion</Body>
              <Dim style={{ fontSize: 13 }}>
                Your last three closed trades were losses. That is normal variance — but it is also when revenge
                trading strikes. Consider a break before the next decision.
              </Dim>
            </Card>
          )}
          <SectionTitle>Analytics</SectionTitle>
          <Card>
            <Body style={{ fontWeight: '700', marginBottom: 6 }}>Equity curve (R, oldest → newest)</Body>
            <EquitySparkline curve={stats.curve} height={90} />
          </Card>
          <Row style={{ flexWrap: 'wrap' }}>
            <StatTile label="Closed trades" value={String(stats.closed)} />
            <StatTile label="Win rate" value={`${Math.round(stats.winRate * 100)}%`} />
            <StatTile label="Net R" value={`${stats.netR >= 0 ? '+' : ''}${stats.netR.toFixed(1)}`} tone={stats.netR >= 0 ? 'good' : 'bad'} />
          </Row>
          <Row style={{ flexWrap: 'wrap' }}>
            <StatTile
              label="Rule compliance"
              value={`${Math.round(stats.compliance * 100)}%`}
              tone={stats.compliance >= 0.8 ? 'good' : 'bad'}
            />
            <StatTile
              label="Planned trades"
              value={`${Math.round(stats.plannedRatio * 100)}%`}
              tone={stats.plannedRatio >= 0.8 ? 'good' : 'bad'}
            />
          </Row>
          {stats.topMistake && (
            <Dim style={{ fontSize: 13 }}>
              Most common mistake: <Text style={{ fontWeight: '700', color: t.colors.warning }}>{MISTAKE_LABELS[stats.topMistake[0]]}</Text>{' '}
              ({stats.topMistake[1]}×). Pick ONE mistake per week and hunt it specifically.
            </Dim>
          )}

          <SectionTitle>Trades</SectionTitle>
          {trades.map((tr) => (
            <Card key={tr.id} onPress={() => router.push(`/journal-entry?id=${tr.id}`)} style={{ padding: 12 }}>
              <Row>
                <Text style={{ fontSize: 20, marginRight: 10 }}>
                  {tr.resultR === null ? '⏳' : tr.resultR > 0 ? '🟢' : tr.resultR < 0 ? '🔴' : '⚪'}
                </Text>
                <View style={{ flex: 1 }}>
                  <Body style={{ fontWeight: '700', fontSize: 15 }}>
                    {tr.pair} {tr.direction.toUpperCase()} · {tr.setup || 'no setup named'}
                  </Body>
                  <Dim style={{ fontSize: 12 }}>
                    {new Date(tr.createdAt).toLocaleDateString()} · {tr.session} · risk {tr.riskPercent}% · plan 1:
                    {tr.plannedRR.toFixed(1)}
                    {tr.followedRules ? ' · rules ✓' : ' · rules ✕'}
                  </Dim>
                </View>
                <Text
                  style={{
                    fontWeight: '800',
                    color: tr.resultR === null ? t.colors.textDim : tr.resultR >= 0 ? t.colors.bull : t.colors.bear,
                  }}
                >
                  {tr.resultR === null ? 'open' : `${tr.resultR > 0 ? '+' : ''}${tr.resultR}R`}
                </Text>
              </Row>
            </Card>
          ))}
        </>
      )}
    </Screen>
  );
}
