import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { CandleChart, EquitySparkline } from '@/components/chart/CandleChart';
import { Stepper } from '@/components/chart/diagrams';
import { Body, Button, Card, Chip, Dim, EmptyState, Row, Screen, Spacer, StatTile, Subtitle, Title, useHaptic } from '@/components/ui';
import { rewardToRisk } from '@/lib/calc';
import { computeBacktestMetrics } from '@/lib/metrics';
import { XP_BACKTEST_TRADE_LOGGED } from '@/lib/xp';
import { CHART_PACKS, getPack } from '@/data/packs';
import { REPLAY_WARMUP_BARS, useLab } from '@/store/lab';
import { useProgress } from '@/store/progress';
import { useTheme } from '@/theme';
import { PriceLine } from '@/types/content';

/**
 * Replay laboratory: candle-by-candle backtesting and auto-playing forward
 * simulation. Future candles are never rendered; trades resolve only against
 * candles as they are revealed (worst-case fill when a bar spans both levels).
 */
export default function BacktestScreen() {
  const params = useLocalSearchParams<{ session?: string; mode?: string }>();
  const lab = useLab();
  const session = lab.sessions.find((s) => s.id === params.session) ?? null;

  if (!session) {
    return <SetupView forward={params.mode === 'forward'} />;
  }
  if (session.finished) {
    return <ResultsView sessionId={session.id} />;
  }
  return <ReplayView sessionId={session.id} />;
}

function SetupView({ forward }: { forward: boolean }) {
  const t = useTheme();
  const lab = useLab();
  const [packId, setPackId] = useState('bt-eu-1');
  const [risk, setRisk] = useState(1);
  const [strategyId, setStrategyId] = useState<string | undefined>(undefined);
  const backtestPacks = CHART_PACKS.filter((p) => p.id.startsWith('bt-'));

  return (
    <Screen>
      <Stack.Screen options={{ title: forward ? 'Forward-Test Simulator' : 'Replay Backtester' }} />
      <Title>{forward ? 'Forward-test simulator' : 'Replay backtester'}</Title>
      <Subtitle>
        {forward
          ? 'Candles play forward on a timer, like a compressed live session. A written plan is required before every entry.'
          : 'Step through history one candle at a time. The future stays hidden — decide, commit, then reveal.'}
      </Subtitle>
      <Spacer h={3} />
      <Dim style={{ marginBottom: 6, fontWeight: '600' }}>Data pack (synthetic training data)</Dim>
      {backtestPacks.map((p) => (
        <Card key={p.id} onPress={() => setPackId(p.id)} accent={packId === p.id}>
          <Body style={{ fontWeight: '700' }}>
            {p.pair} · {p.timeframe} · {p.candles.length} bars
          </Body>
          <Dim style={{ fontSize: 12 }}>Regime mix is hidden until you finish — no peeking at the answer key.</Dim>
        </Card>
      ))}
      {lab.strategies.length > 0 && (
        <>
          <Dim style={{ marginBottom: 6, marginTop: 6, fontWeight: '600' }}>Test a saved strategy (optional)</Dim>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            <Chip label="Free practice" selected={!strategyId} onPress={() => setStrategyId(undefined)} />
            {lab.strategies.map((s) => (
              <Chip key={s.id} label={s.name} selected={strategyId === s.id} onPress={() => setStrategyId(s.id)} />
            ))}
          </View>
        </>
      )}
      <Spacer h={2} />
      <Stepper label="Risk per trade (%)" value={risk} onChange={setRisk} step={0.25} min={0.25} max={3} format={(v) => `${v}%`} />
      <Spacer h={2} />
      <Card style={{ backgroundColor: t.colors.surfaceAlt }}>
        <Body style={{ fontWeight: '700', marginBottom: 4 }}>Honesty rules (enforced)</Body>
        <Dim style={{ fontSize: 13 }}>
          • Future candles are never shown.{'\n'}
          • Every trade needs a written reason before entry.{'\n'}
          • Trades resolve worst-case when a bar hits both stop and target.{'\n'}
          • Skipped setups are recorded too — cherry-picking hides losers.
        </Dim>
      </Card>
      <Button
        label={forward ? 'Start forward test ▶' : 'Start backtest ⏪'}
        onPress={() => {
          const id = lab.startSession(packId, forward ? 'forward' : 'backtest', strategyId, risk);
          router.setParams({ session: id });
        }}
      />
    </Screen>
  );
}

function ReplayView({ sessionId }: { sessionId: string }) {
  const t = useTheme();
  const h = useHaptic();
  const lab = useLab();
  const progress = useProgress();
  const session = lab.sessions.find((s) => s.id === sessionId)!;
  const pack = getPack(session.packId);
  const strategy = lab.strategies.find((s) => s.id === session.strategyId);

  const [entryOpen, setEntryOpen] = useState(false);
  const [direction, setDirection] = useState<'long' | 'short'>('long');
  const [stopPips, setStopPips] = useState(20);
  const [targetPips, setTargetPips] = useState(40);
  const [reason, setReason] = useState('');
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const lastCandle = pack.candles[session.cursor - 1];
  const openTrades = session.trades.filter((x) => !x.skipped && x.resultR === undefined);
  const closed = session.trades.filter((x) => !x.skipped && x.resultR !== undefined);
  const netR = closed.reduce((a, x) => a + (x.resultR ?? 0), 0);

  // Forward mode: auto-advance on a timer while playing.
  useEffect(() => {
    if (session.mode !== 'forward' || !playing || entryOpen) return;
    const ms = 1600 / speed;
    const iv = setInterval(() => lab.advanceCandle(sessionId), ms);
    return () => clearInterval(iv);
  }, [session.mode, playing, speed, entryOpen, sessionId, lab]);

  useEffect(() => {
    if (session.cursor >= pack.candles.length && !session.finished) lab.finishSession(sessionId);
  }, [session.cursor, pack.candles.length, session.finished, lab, sessionId]);

  const entry = lastCandle.c;
  const sign = direction === 'long' ? 1 : -1;
  const stop = entry - sign * stopPips * pack.pipSize;
  const target = entry + sign * targetPips * pack.pipSize;
  const ratio = rewardToRisk(entry, stop, target);

  const lines: PriceLine[] = entryOpen
    ? [
        { price: stop, label: 'Stop', color: 'bear' },
        { price: entry, label: 'Entry', color: 'neutral', dashed: true },
        { price: target, label: 'Target', color: 'bull' },
      ]
    : openTrades.flatMap((tr) => [
        { price: tr.stop, label: 'SL', color: 'bear' as const },
        { price: tr.entry, label: tr.direction === 'long' ? 'Long' : 'Short', color: 'neutral' as const, dashed: true },
        { price: tr.target, label: 'TP', color: 'bull' as const },
      ]);

  const place = () => {
    if (reason.trim().length < 5) return;
    lab.openTrade(sessionId, {
      direction,
      entry,
      stop,
      target,
      reason: reason.trim(),
    });
    progress.addXp(XP_BACKTEST_TRADE_LOGGED);
    h.success();
    setEntryOpen(false);
    setReason('');
  };

  const minBelowStrategy = strategy && ratio < strategy.minRR;

  return (
    <Screen>
      <Stack.Screen
        options={{ title: `${pack.pair} ${pack.timeframe} · bar ${session.cursor}/${pack.candles.length}` }}
      />
      <Row style={{ marginBottom: 8 }}>
        <Dim style={{ flex: 1 }}>
          {session.mode === 'forward' ? '⏩ Forward test' : '⏪ Backtest'} · {closed.length} closed · net{' '}
          <Text style={{ color: netR >= 0 ? t.colors.bull : t.colors.bear, fontWeight: '800' }}>
            {netR >= 0 ? '+' : ''}
            {netR.toFixed(1)}R
          </Text>
          {openTrades.length > 0 ? ` · ${openTrades.length} open` : ''}
        </Dim>
      </Row>
      <CandleChart candles={pack.candles} visible={session.cursor} pipSize={pack.pipSize} height={270} lines={lines} maxBars={60} />
      <Spacer h={2} />

      {session.mode === 'backtest' ? (
        <Row>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Button label="Next candle →" variant="secondary" onPress={() => lab.advanceCandle(sessionId)} />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              label="+10 candles ⏭"
              variant="secondary"
              onPress={() => {
                for (let i = 0; i < 10; i++) lab.advanceCandle(sessionId);
              }}
            />
          </View>
        </Row>
      ) : (
        <Row>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Button label={playing ? '⏸ Pause & analyze' : '▶ Play'} variant="secondary" onPress={() => setPlaying(!playing)} />
          </View>
          <Chip label="1×" selected={speed === 1} onPress={() => setSpeed(1)} />
          <Chip label="2×" selected={speed === 2} onPress={() => setSpeed(2)} />
          <Chip label="4×" selected={speed === 4} onPress={() => setSpeed(4)} />
        </Row>
      )}
      <Spacer h={2} />

      {!entryOpen ? (
        <Row>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Button label="📋 Plan a trade" onPress={() => { setPlaying(false); setEntryOpen(true); }} disabled={openTrades.length >= 2} />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              label="Skip setup"
              variant="ghost"
              onPress={() => {
                lab.skipSetup(sessionId, 'Setup seen but skipped');
                h.tap();
              }}
            />
          </View>
        </Row>
      ) : (
        <Card accent>
          <Body style={{ fontWeight: '800', marginBottom: 8 }}>New trade @ {entry.toFixed(pack.pipSize === 0.01 ? 2 : 4)}</Body>
          <Row style={{ marginBottom: 8 }}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Button label="▲ Long" variant={direction === 'long' ? 'bull' : 'secondary'} small onPress={() => setDirection('long')} />
            </View>
            <View style={{ flex: 1 }}>
              <Button label="▼ Short" variant={direction === 'short' ? 'bear' : 'secondary'} small onPress={() => setDirection('short')} />
            </View>
          </Row>
          <Stepper label="Stop distance (pips)" value={stopPips} onChange={setStopPips} step={5} min={5} max={200} />
          <Stepper label="Target distance (pips)" value={targetPips} onChange={setTargetPips} step={5} min={5} max={400} />
          <Dim style={{ marginBottom: 8 }}>
            Reward-to-risk: <Text style={{ fontWeight: '800', color: ratio >= 1.5 ? t.colors.bull : t.colors.warning }}>1:{ratio.toFixed(2)}</Text>
            {minBelowStrategy ? ` — below your strategy minimum of 1:${strategy?.minRR}` : ''}
          </Dim>
          <TextInput
            accessibilityLabel="Trade reason"
            value={reason}
            onChangeText={setReason}
            placeholder="Why this trade? (required — written before entry, cannot be edited later)"
            placeholderTextColor={t.colors.textFaint}
            multiline
            style={{
              backgroundColor: t.colors.surface,
              color: t.colors.text,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: t.colors.border,
              padding: 10,
              minHeight: 60,
              fontSize: 14,
              textAlignVertical: 'top',
              marginBottom: 10,
            }}
          />
          <Row>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Button label="Place trade" onPress={place} disabled={reason.trim().length < 5 || !!minBelowStrategy} />
            </View>
            <View style={{ flex: 1 }}>
              <Button label="Cancel" variant="ghost" onPress={() => setEntryOpen(false)} />
            </View>
          </Row>
        </Card>
      )}

      {strategy && (
        <Card style={{ marginTop: 10, backgroundColor: t.colors.surfaceAlt }}>
          <Dim style={{ fontWeight: '700', marginBottom: 4 }}>Testing: {strategy.name}</Dim>
          <Dim style={{ fontSize: 12 }}>
            Setup: {strategy.setup} · Entry: {strategy.entryTrigger} · Stop: {strategy.stopRule} · Min 1:{strategy.minRR}
          </Dim>
        </Card>
      )}

      <Spacer h={2} />
      <Button label="Finish session & see results" variant="secondary" onPress={() => lab.finishSession(sessionId)} />
      <Spacer h={2} />
      <Dim style={{ fontSize: 12, color: t.colors.textFaint, textAlign: 'center' }}>
        Warmup context: first {REPLAY_WARMUP_BARS} bars. Trades resolve on revealed candles only; both-sides bars count
        as losses (worst case).
      </Dim>
    </Screen>
  );
}

function ResultsView({ sessionId }: { sessionId: string }) {
  const t = useTheme();
  const lab = useLab();
  const session = lab.sessions.find((s) => s.id === sessionId)!;
  const pack = getPack(session.packId);
  const m = useMemo(() => computeBacktestMetrics(session.trades), [session.trades]);
  const skipped = session.trades.filter((x) => x.skipped).length;
  const open = session.trades.filter((x) => !x.skipped && x.resultR === undefined).length;
  const dp = pack.pipSize === 0.01 ? 2 : 4;

  if (m.totalTrades === 0 && skipped === 0) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Session results' }} />
        <EmptyState
          icon="📭"
          title="No trades recorded"
          body="This session ended without any recorded setups. Start another run and log every valid setup — including the ones you skip."
        />
        <Button label="Delete empty session" variant="secondary" onPress={() => { lab.deleteSession(sessionId); router.back(); }} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Session results' }} />
      <Title style={{ fontSize: 20 }}>
        {pack.pair} {pack.timeframe} · {session.mode === 'forward' ? 'forward test' : 'backtest'}
      </Title>
      <Dim>{pack.description}</Dim>
      <Spacer h={3} />
      <Card>
        <Body style={{ fontWeight: '700', marginBottom: 6 }}>Equity curve (R)</Body>
        <EquitySparkline curve={m.equityCurveR} height={110} />
      </Card>
      <Row style={{ flexWrap: 'wrap' }}>
        <StatTile label="Trades" value={String(m.totalTrades)} />
        <StatTile label="Win rate" value={`${Math.round(m.winRate * 100)}%`} />
        <StatTile label="Net R" value={`${m.netR >= 0 ? '+' : ''}${m.netR.toFixed(1)}`} tone={m.netR >= 0 ? 'good' : 'bad'} />
      </Row>
      <Row style={{ flexWrap: 'wrap' }}>
        <StatTile label="Expectancy" value={`${m.expectancyR >= 0 ? '+' : ''}${m.expectancyR.toFixed(2)}R`} tone={m.expectancyR > 0 ? 'good' : 'bad'} />
        <StatTile label="Profit factor" value={m.profitFactor === Infinity ? '∞' : m.profitFactor.toFixed(2)} />
        <StatTile label="Max drawdown" value={`${m.maxDrawdownR.toFixed(1)}R`} tone="bad" />
      </Row>
      <Row style={{ flexWrap: 'wrap' }}>
        <StatTile label="Avg win / loss" value={`${m.avgWinR.toFixed(1)} / ${m.avgLossR.toFixed(1)}`} />
        <StatTile label="Best streaks" value={`${m.longestWinStreak}W / ${m.longestLossStreak}L`} />
        <StatTile label="Long / short R" value={`${m.longNetR.toFixed(1)} / ${m.shortNetR.toFixed(1)}`} />
      </Row>
      {(skipped > 0 || open > 0) && (
        <Dim style={{ fontSize: 13 }}>
          {skipped > 0 ? `${skipped} setup${skipped > 1 ? 's' : ''} skipped and recorded. ` : ''}
          {open > 0 ? `${open} trade${open > 1 ? 's' : ''} still open at session end (excluded from metrics).` : ''}
        </Dim>
      )}

      <Card style={{ marginTop: 12, backgroundColor: t.colors.surfaceAlt }}>
        <Body style={{ fontWeight: '800', marginBottom: 4 }}>Honest interpretation</Body>
        <Dim style={{ fontSize: 13 }}>
          {m.totalTrades < 30
            ? `⚠ Only ${m.totalTrades} trade${m.totalTrades === 1 ? '' : 's'} — far too few to judge a strategy. Impressive or terrible, this sample is mostly noise. Aim for 50+.`
            : m.totalTrades < 50
              ? `${m.totalTrades} trades is a start, but still a small sample. Trends in the metrics may not survive more data.`
              : `${m.totalTrades} trades is a workable first sample. Now repeat the same rules on a pack you have not seen.`}
          {m.expectancyR > 0 && m.totalTrades >= 30
            ? ' Positive expectancy here does NOT guarantee future results — validate on unseen data before believing it.'
            : ''}
        </Dim>
      </Card>

      <Body style={{ fontWeight: '700', marginTop: 8, marginBottom: 6 }}>Trade log</Body>
      {session.trades.map((tr, i) =>
        tr.skipped ? (
          <Dim key={tr.id} style={{ fontSize: 12, marginBottom: 6 }}>
            {i + 1}. ⏭ skipped @ bar {tr.entryIndex} — {tr.reason}
          </Dim>
        ) : (
          <Card key={tr.id} style={{ padding: 10, marginBottom: 6 }}>
            <Row>
              <Text style={{ marginRight: 8, fontSize: 16 }}>
                {tr.resultR === undefined ? '⏳' : (tr.resultR ?? 0) > 0 ? '🟢' : '🔴'}
              </Text>
              <View style={{ flex: 1 }}>
                <Dim style={{ fontSize: 13, color: t.colors.text }}>
                  {i + 1}. {tr.direction.toUpperCase()} @ {tr.entry.toFixed(dp)} → SL {tr.stop.toFixed(dp)} / TP{' '}
                  {tr.target.toFixed(dp)}
                </Dim>
                <Dim style={{ fontSize: 12 }}>{tr.reason}</Dim>
              </View>
              <Text
                style={{
                  fontWeight: '800',
                  color: tr.resultR === undefined ? t.colors.textDim : (tr.resultR ?? 0) > 0 ? t.colors.bull : t.colors.bear,
                }}
              >
                {tr.resultR === undefined ? 'open' : `${(tr.resultR ?? 0) > 0 ? '+' : ''}${tr.resultR}R`}
              </Text>
            </Row>
          </Card>
        ),
      )}

      <Spacer h={2} />
      <Button label="New session" onPress={() => router.setParams({ session: '', mode: '' })} />
      <Spacer h={2} />
      <Button label="Delete this session" variant="danger" onPress={() => { lab.deleteSession(sessionId); router.back(); }} />
    </Screen>
  );
}
