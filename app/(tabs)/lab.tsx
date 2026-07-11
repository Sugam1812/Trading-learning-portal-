import { router } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';
import { EquitySparkline } from '@/components/chart/CandleChart';
import { Body, Card, Dim, Row, Screen, SectionTitle, Spacer, Subtitle, Title } from '@/components/ui';
import { computeBacktestMetrics } from '@/lib/metrics';
import { getPack } from '@/data/packs';
import { useLab } from '@/store/lab';
import { useTheme } from '@/theme';

export default function LabScreen() {
  const t = useTheme();
  const strategies = useLab((s) => s.strategies);
  const sessions = useLab((s) => s.sessions);
  const active = sessions.find((s) => !s.finished);

  return (
    <Screen>
      <Title>Trading Lab</Title>
      <Subtitle>Build rules, test them honestly on hidden-future data, and let the numbers speak.</Subtitle>

      {active && (
        <>
          <SectionTitle>In progress</SectionTitle>
          <Card accent onPress={() => router.push(`/backtest?session=${active.id}`)}>
            <Body style={{ fontWeight: '800' }}>
              ▶️ Resume {active.mode === 'forward' ? 'forward test' : 'backtest'} — {getPack(active.packId).pair}
            </Body>
            <Dim style={{ fontSize: 13 }}>
              {active.trades.filter((x) => !x.skipped).length} trades · bar {active.cursor}/
              {getPack(active.packId).candles.length}
            </Dim>
          </Card>
        </>
      )}

      <SectionTitle>Tools</SectionTitle>
      <Card onPress={() => router.push('/backtest')}>
        <Row>
          <Text style={{ fontSize: 30, marginRight: 12 }}>⏪</Text>
          <View style={{ flex: 1 }}>
            <Body style={{ fontWeight: '800' }}>Replay backtester</Body>
            <Dim style={{ fontSize: 13 }}>Candle-by-candle replay with the future hidden. Record every setup in R.</Dim>
          </View>
        </Row>
      </Card>
      <Card onPress={() => router.push('/backtest?mode=forward')}>
        <Row>
          <Text style={{ fontSize: 30, marginRight: 12 }}>⏩</Text>
          <View style={{ flex: 1 }}>
            <Body style={{ fontWeight: '800' }}>Forward-test simulator</Body>
            <Dim style={{ fontSize: 13 }}>Auto-playing candles at market-like pace. A written plan is required before entry.</Dim>
          </View>
        </Row>
      </Card>
      <Card onPress={() => router.push('/strategy-builder')}>
        <Row>
          <Text style={{ fontSize: 30, marginRight: 12 }}>🧩</Text>
          <View style={{ flex: 1 }}>
            <Body style={{ fontWeight: '800' }}>Strategy builder</Body>
            <Dim style={{ fontSize: 13 }}>Turn ideas into objective rules. The rule checker flags vague wording.</Dim>
          </View>
        </Row>
      </Card>
      <Card onPress={() => router.push('/calculators')}>
        <Row>
          <Text style={{ fontSize: 30, marginRight: 12 }}>🧮</Text>
          <View style={{ flex: 1 }}>
            <Body style={{ fontWeight: '800' }}>Risk calculators</Body>
            <Dim style={{ fontSize: 13 }}>Position size, reward-to-risk, expectancy and survival simulation.</Dim>
          </View>
        </Row>
      </Card>

      {strategies.length > 0 && (
        <>
          <SectionTitle>Your strategies</SectionTitle>
          {strategies.map((s) => (
            <Card key={s.id} onPress={() => router.push(`/strategy-builder?id=${s.id}`)}>
              <Body style={{ fontWeight: '700' }}>
                📜 {s.name} <Dim style={{ fontSize: 12 }}>v{s.version}</Dim>
              </Body>
              <Dim style={{ fontSize: 13 }}>
                {s.market} · {s.timeframe} · {s.direction} · risk {s.riskPercent}% · min 1:{s.minRR}
              </Dim>
            </Card>
          ))}
        </>
      )}

      {sessions.filter((s) => s.finished).length > 0 && (
        <>
          <SectionTitle>Completed tests</SectionTitle>
          {sessions
            .filter((s) => s.finished)
            .slice(0, 8)
            .map((s) => {
              const m = computeBacktestMetrics(s.trades);
              return (
                <Card key={s.id} onPress={() => router.push(`/backtest?session=${s.id}`)}>
                  <Row>
                    <View style={{ flex: 1 }}>
                      <Body style={{ fontWeight: '700' }}>
                        {getPack(s.packId).pair} · {s.mode === 'forward' ? 'forward' : 'backtest'}
                      </Body>
                      <Dim style={{ fontSize: 13 }}>
                        {m.totalTrades} trades · win {Math.round(m.winRate * 100)}% · net{' '}
                        <Text style={{ color: m.netR >= 0 ? t.colors.bull : t.colors.bear, fontWeight: '700' }}>
                          {m.netR >= 0 ? '+' : ''}
                          {m.netR.toFixed(1)}R
                        </Text>
                      </Dim>
                    </View>
                    <View style={{ width: 110 }}>
                      <EquitySparkline curve={m.equityCurveR} height={44} />
                    </View>
                  </Row>
                </Card>
              );
            })}
        </>
      )}
      <Spacer h={2} />
      <Dim style={{ fontSize: 12, textAlign: 'center', color: t.colors.textFaint }}>
        All chart data is synthetic training data. Results here are practice, never a promise.
      </Dim>
    </Screen>
  );
}
