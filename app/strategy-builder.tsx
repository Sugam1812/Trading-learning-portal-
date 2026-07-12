import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Share, Text, TextInput, View } from 'react-native';
import { Stepper } from '@/components/chart/diagrams';
import { Body, Button, Card, Chip, Dim, FeedbackBanner, Screen, Spacer, Subtitle, Title, useHaptic } from '@/components/ui';
import { checkStrategy } from '@/lib/strategyCheck';
import { useLab } from '@/store/lab';
import { useTheme } from '@/theme';
import { Strategy, Timeframe } from '@/types/trading';

const BLANK: Omit<Strategy, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
  name: '',
  market: 'EUR/USD',
  timeframe: 'H1',
  session: 'london',
  direction: 'both',
  trendFilter: '',
  setup: '',
  entryTrigger: '',
  stopRule: '',
  targetRule: '',
  minRR: 2,
  riskPercent: 1,
  maxTradesPerDay: 2,
  newsRule: 'No entries within 15 minutes of high-impact news',
  invalidation: '',
};

const EXAMPLE: typeof BLANK = {
  name: 'EUR/USD London Pullback',
  market: 'EUR/USD',
  timeframe: 'M15',
  session: 'london',
  direction: 'long',
  trendFilter: 'H4 shows higher highs and higher lows',
  setup: 'Pullback into a previously marked support zone',
  entryTrigger: '15m candle closes above the previous candle high',
  stopRule: '1 pip below the pullback swing low',
  targetRule: 'Fixed 2R',
  minRR: 2,
  riskPercent: 0.5,
  maxTradesPerDay: 2,
  newsRule: 'No entries within 15 minutes of high-impact EUR or USD news',
  invalidation: '15m close below the support zone',
};

export default function StrategyBuilderScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const t = useTheme();
  const h = useHaptic();
  const lab = useLab();
  const existing = id ? lab.strategies.find((s) => s.id === id) : undefined;
  const [draft, setDraft] = useState<typeof BLANK>(existing ? { ...existing } : BLANK);
  const [checked, setChecked] = useState(false);

  const issues = checkStrategy({
    ...draft,
    id: existing?.id ?? 'draft',
    createdAt: 0,
    updatedAt: 0,
    version: existing?.version ?? 1,
  });
  const errors = issues.filter((i) => i.severity === 'error');

  const set = <K extends keyof typeof BLANK>(k: K, v: (typeof BLANK)[K]) => {
    setDraft((d) => ({ ...d, [k]: v }));
    setChecked(false);
  };

  const field = (
    label: string,
    key: keyof typeof BLANK,
    placeholder: string,
    multiline = false,
  ) => (
    <View style={{ marginBottom: 12 }}>
      <Dim style={{ marginBottom: 6, fontWeight: '600' }}>{label}</Dim>
      <TextInput
        accessibilityLabel={label}
        value={String(draft[key] ?? '')}
        onChangeText={(v) => set(key, v as never)}
        placeholder={placeholder}
        placeholderTextColor={t.colors.textFaint}
        multiline={multiline}
        style={{
          backgroundColor: t.colors.surface,
          color: t.colors.text,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: issues.some((i) => i.field === key) && checked ? t.colors.warning : t.colors.border,
          padding: 12,
          fontSize: 15,
          minHeight: multiline ? 70 : undefined,
          textAlignVertical: multiline ? 'top' : 'center',
        }}
      />
    </View>
  );

  const save = () => {
    setChecked(true);
    if (errors.length > 0) {
      h.error();
      return;
    }
    lab.saveStrategy({ ...draft, id: existing?.id });
    h.success();
    router.back();
  };

  const shareCard = async () => {
    const card = [
      `📜 ${draft.name || 'Unnamed strategy'} (PipQuest strategy card)`,
      `Market: ${draft.market} · TF: ${draft.timeframe} · Session: ${draft.session} · Direction: ${draft.direction}`,
      `Trend filter: ${draft.trendFilter}`,
      `Setup: ${draft.setup}`,
      `Entry: ${draft.entryTrigger}`,
      `Stop: ${draft.stopRule}`,
      `Target: ${draft.targetRule} (min 1:${draft.minRR})`,
      `Risk: ${draft.riskPercent}% per trade · max ${draft.maxTradesPerDay} trades/day`,
      `News rule: ${draft.newsRule}`,
      `Invalidation: ${draft.invalidation}`,
      `— Educational template. No performance is promised; test before trusting.`,
    ].join('\n');
    try {
      await Share.share({ message: card });
    } catch {
      // sharing is optional; ignore cancellation
    }
  };

  return (
    <Screen>
      <Title>{existing ? `Edit: ${existing.name}` : 'Strategy builder'}</Title>
      <Subtitle>
        Write rules so objective that a stranger would take the same trades. The checker flags vague wording.
      </Subtitle>
      <Spacer h={2} />
      {!existing && (
        <Button
          label="Load example: London Pullback"
          variant="ghost"
          small
          onPress={() => {
            setDraft(EXAMPLE);
            setChecked(false);
          }}
        />
      )}
      <Spacer h={3} />

      {field('Strategy name', 'name', 'e.g. EUR/USD London Pullback')}
      {field('Market', 'market', 'e.g. EUR/USD')}

      <Dim style={{ marginBottom: 6, fontWeight: '600' }}>Timeframe</Dim>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {(['M15', 'H1', 'H4', 'D1'] as Timeframe[]).map((tf) => (
          <Chip key={tf} label={tf} selected={draft.timeframe === tf} onPress={() => set('timeframe', tf)} />
        ))}
      </View>
      <Dim style={{ marginBottom: 6, marginTop: 6, fontWeight: '600' }}>Session</Dim>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {['sydney', 'tokyo', 'london', 'newyork', 'any'].map((s) => (
          <Chip key={s} label={s} selected={draft.session === s} onPress={() => set('session', s)} />
        ))}
      </View>
      <Dim style={{ marginBottom: 6, marginTop: 6, fontWeight: '600' }}>Direction</Dim>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {(['long', 'short', 'both'] as const).map((d) => (
          <Chip key={d} label={d} selected={draft.direction === d} onPress={() => set('direction', d)} />
        ))}
      </View>
      <Spacer h={3} />

      {field('Trend filter', 'trendFilter', 'e.g. H4 shows higher highs and higher lows', true)}
      {field('Setup condition', 'setup', 'What must the chart show before you even consider a trade?', true)}
      {field('Entry trigger', 'entryTrigger', 'e.g. 15m candle closes above previous candle high', true)}
      {field('Stop-loss rule', 'stopRule', 'e.g. 1 pip below the pullback swing low', true)}
      {field('Target rule', 'targetRule', 'e.g. fixed 2R, or previous swing high', true)}
      {field('Invalidation', 'invalidation', 'What makes the setup dead before entry?', true)}
      {field('News rule', 'newsRule', 'e.g. no entries within 15 min of high-impact news', true)}

      <Stepper label="Minimum reward-to-risk" value={draft.minRR} onChange={(v) => set('minRR', v)} step={0.5} min={0.5} max={5} format={(v) => `1:${v}`} />
      <Stepper label="Risk per trade (%)" value={draft.riskPercent} onChange={(v) => set('riskPercent', v)} step={0.25} min={0.25} max={5} format={(v) => `${v}%`} />
      <Stepper label="Max trades per day" value={draft.maxTradesPerDay} onChange={(v) => set('maxTradesPerDay', v)} step={1} min={1} max={10} />

      <Spacer h={2} />
      {checked && issues.length > 0 && (
        <Card style={{ borderColor: errors.length ? t.colors.danger : t.colors.warning }}>
          <Body style={{ fontWeight: '800', marginBottom: 6 }}>
            Rule check: {errors.length} error{errors.length === 1 ? '' : 's'}, {issues.length - errors.length} warning
            {issues.length - errors.length === 1 ? '' : 's'}
          </Body>
          {issues.map((i, idx) => (
            <Text key={idx} style={{ color: i.severity === 'error' ? t.colors.danger : t.colors.warning, marginBottom: 4, fontSize: 13 }}>
              {i.severity === 'error' ? '✕' : '⚠'} {i.message}
            </Text>
          ))}
        </Card>
      )}
      {checked && issues.length === 0 && (
        <FeedbackBanner status="correct" text="Rules pass the objectivity check. Now earn confidence: backtest at least 50 setups before trusting it." />
      )}
      <Spacer h={2} />
      <Button label={checked && errors.length === 0 ? 'Save strategy' : 'Run rule check'} onPress={checked && errors.length === 0 ? save : () => { setChecked(true); if (errors.length === 0 && issues.length === 0) { /* clean first pass */ } }} />
      <Spacer h={2} />
      {checked && errors.length === 0 && <Button label="Share strategy card" variant="secondary" onPress={shareCard} />}
      {existing && (
        <>
          <Spacer h={2} />
          <Button
            label="Delete strategy"
            variant="danger"
            onPress={() => {
              lab.deleteStrategy(existing.id);
              router.back();
            }}
          />
        </>
      )}
      <Spacer h={4} />
      <Dim style={{ fontSize: 12, color: t.colors.textFaint }}>
        A saved strategy is a hypothesis, not an income plan. It earns trust only through honest testing on data it has
        never seen.
      </Dim>
    </Screen>
  );
}
