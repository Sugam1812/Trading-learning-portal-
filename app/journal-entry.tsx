import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { TextInput, View } from 'react-native';
import { Stepper } from '@/components/chart/diagrams';
import { Body, Button, Card, Chip, Dim, Screen, Spacer, Subtitle, Title, useHaptic } from '@/components/ui';
import { XP_JOURNAL_ENTRY } from '@/lib/xp';
import { useJournal } from '@/store/journal';
import { useProgress } from '@/store/progress';
import { useTheme } from '@/theme';
import { EmotionTag, JournalTrade, MistakeTag } from '@/types/trading';

const EMOTIONS: { id: EmotionTag; label: string }[] = [
  { id: 'calm', label: '😌 Calm' },
  { id: 'confident', label: '💪 Confident' },
  { id: 'anxious', label: '😰 Anxious' },
  { id: 'fomo', label: '🏃 FOMO' },
  { id: 'revenge', label: '😤 Revenge' },
  { id: 'bored', label: '🥱 Bored' },
  { id: 'frustrated', label: '😠 Frustrated' },
  { id: 'excited', label: '🤩 Excited' },
];

const MISTAKES: { id: MistakeTag; label: string }[] = [
  { id: 'no-plan', label: 'No plan' },
  { id: 'moved-stop', label: 'Moved stop' },
  { id: 'oversized', label: 'Oversized' },
  { id: 'chased-entry', label: 'Chased entry' },
  { id: 'early-exit', label: 'Early exit' },
  { id: 'held-loser', label: 'Held loser' },
  { id: 'news-ignored', label: 'Ignored news' },
  { id: 'overtraded', label: 'Overtraded' },
  { id: 'against-trend', label: 'Against trend' },
  { id: 'revenge-trade', label: 'Revenge trade' },
];

export default function JournalEntryScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const t = useTheme();
  const h = useHaptic();
  const journal = useJournal();
  const progress = useProgress();
  const existing = id ? journal.trades.find((x) => x.id === id) : undefined;

  const [pair, setPair] = useState(existing?.pair ?? 'EUR/USD');
  const [direction, setDirection] = useState<'long' | 'short'>(existing?.direction ?? 'long');
  const [session, setSession] = useState<JournalTrade['session']>(existing?.session ?? 'london');
  const [setup, setSetup] = useState(existing?.setup ?? '');
  const [riskPercent, setRiskPercent] = useState(existing?.riskPercent ?? 1);
  const [plannedRR, setPlannedRR] = useState(existing?.plannedRR ?? 2);
  const [resultR, setResultR] = useState<number | null>(existing?.resultR ?? null);
  const [entryReason, setEntryReason] = useState(existing?.entryReason ?? '');
  const [exitReason, setExitReason] = useState(existing?.exitReason ?? '');
  const [emotionBefore, setEmotionBefore] = useState<EmotionTag>(existing?.emotionBefore ?? 'calm');
  const [emotionAfter, setEmotionAfter] = useState<EmotionTag>(existing?.emotionAfter ?? 'calm');
  const [followedRules, setFollowedRules] = useState(existing?.followedRules ?? true);
  const [planned, setPlanned] = useState(existing?.planned ?? true);
  const [mistakes, setMistakes] = useState<MistakeTag[]>(existing?.mistakes ?? []);
  const [lesson, setLesson] = useState(existing?.lesson ?? '');

  const toggleMistake = (m: MistakeTag) =>
    setMistakes((s) => (s.includes(m) ? s.filter((x) => x !== m) : [...s, m]));

  const input = (label: string, value: string, onChange: (v: string) => void, placeholder: string, multiline = false) => (
    <View style={{ marginBottom: 12 }}>
      <Dim style={{ marginBottom: 6, fontWeight: '600' }}>{label}</Dim>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={t.colors.textFaint}
        multiline={multiline}
        style={{
          backgroundColor: t.colors.surface,
          color: t.colors.text,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: t.colors.border,
          padding: 12,
          fontSize: 15,
          minHeight: multiline ? 64 : undefined,
          textAlignVertical: multiline ? 'top' : 'center',
        }}
      />
    </View>
  );

  const save = () => {
    const data = {
      pair: pair.trim() || 'EUR/USD',
      direction,
      session,
      setup: setup.trim(),
      entry: existing?.entry ?? 0,
      stop: existing?.stop ?? 0,
      target: existing?.target ?? 0,
      riskPercent,
      plannedRR,
      resultR,
      entryReason: entryReason.trim(),
      exitReason: exitReason.trim(),
      emotionBefore,
      emotionAfter,
      followedRules,
      mistakes,
      lesson: lesson.trim(),
      planned,
    };
    if (existing) {
      journal.updateTrade(existing.id, data);
    } else {
      journal.addTrade(data);
      progress.addXp(XP_JOURNAL_ENTRY);
    }
    h.success();
    router.back();
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: existing ? 'Edit trade' : 'Log a trade' }} />
      <Title>{existing ? 'Edit trade' : 'Log a trade'}</Title>
      <Subtitle>Honest entries only — the analytics are for you, and they are only as good as your honesty.</Subtitle>
      <Spacer h={3} />

      {input('Pair', pair, setPair, 'e.g. EUR/USD')}
      <Dim style={{ marginBottom: 6, fontWeight: '600' }}>Direction</Dim>
      <View style={{ flexDirection: 'row' }}>
        <Chip label="▲ Long" selected={direction === 'long'} onPress={() => setDirection('long')} />
        <Chip label="▼ Short" selected={direction === 'short'} onPress={() => setDirection('short')} />
      </View>
      <Dim style={{ marginBottom: 6, marginTop: 6, fontWeight: '600' }}>Session</Dim>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {(['sydney', 'tokyo', 'london', 'newyork'] as const).map((s) => (
          <Chip key={s} label={s} selected={session === s} onPress={() => setSession(s)} />
        ))}
      </View>
      <Spacer h={2} />
      {input('Setup name', setup, setSetup, 'e.g. Break & retest')}
      <Stepper label="Risk (%)" value={riskPercent} onChange={setRiskPercent} step={0.25} min={0.25} max={5} format={(v) => `${v}%`} />
      <Stepper label="Planned reward-to-risk" value={plannedRR} onChange={setPlannedRR} step={0.5} min={0.5} max={6} format={(v) => `1:${v}`} />

      <Dim style={{ marginBottom: 6, fontWeight: '600' }}>Result</Dim>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        <Chip label="Still open" selected={resultR === null} onPress={() => setResultR(null)} />
        {[-1, -0.5, 0, 1, 1.5, 2, 3].map((r) => (
          <Chip
            key={r}
            label={`${r > 0 ? '+' : ''}${r}R`}
            selected={resultR === r}
            onPress={() => setResultR(r)}
            color={r > 0 ? t.colors.bull : r < 0 ? t.colors.bear : undefined}
          />
        ))}
      </View>
      <Spacer h={2} />

      {input('Why did you enter?', entryReason, setEntryReason, 'The reason, in plain words', true)}
      {input('Why did you exit?', exitReason, setExitReason, 'Target hit? Stop hit? Something else?', true)}

      <Dim style={{ marginBottom: 6, fontWeight: '600' }}>Emotion before entry</Dim>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {EMOTIONS.map((e) => (
          <Chip key={e.id} label={e.label} selected={emotionBefore === e.id} onPress={() => setEmotionBefore(e.id)} />
        ))}
      </View>
      <Dim style={{ marginBottom: 6, marginTop: 6, fontWeight: '600' }}>Emotion after exit</Dim>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {EMOTIONS.map((e) => (
          <Chip key={e.id} label={e.label} selected={emotionAfter === e.id} onPress={() => setEmotionAfter(e.id)} />
        ))}
      </View>
      <Spacer h={2} />

      <Card>
        <Body style={{ fontWeight: '700', marginBottom: 8 }}>Process check</Body>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <Chip label={followedRules ? '✓ Followed my rules' : 'Followed my rules?'} selected={followedRules} onPress={() => setFollowedRules(!followedRules)} />
          <Chip label={planned ? '✓ Planned in advance' : 'Planned in advance?'} selected={planned} onPress={() => setPlanned(!planned)} />
        </View>
        <Dim style={{ marginTop: 8, marginBottom: 6, fontWeight: '600' }}>Mistake tags (be brutal)</Dim>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {MISTAKES.map((m) => (
            <Chip key={m.id} label={m.label} selected={mistakes.includes(m.id)} onPress={() => toggleMistake(m.id)} color={t.colors.warning} />
          ))}
        </View>
      </Card>

      {input('Lesson learned', lesson, setLesson, 'One sentence you want your future self to read', true)}

      <Button label={existing ? 'Save changes' : 'Save trade (+15 XP)'} onPress={save} />
      {existing && (
        <>
          <Spacer h={2} />
          <Button
            label="Delete trade"
            variant="danger"
            onPress={() => {
              journal.deleteTrade(existing.id);
              router.back();
            }}
          />
        </>
      )}
    </Screen>
  );
}
