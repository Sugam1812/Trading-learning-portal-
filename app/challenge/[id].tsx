import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { CandleChart } from '@/components/chart/CandleChart';
import { Body, Button, Card, Chip, Dim, EmptyState, FeedbackBanner, Screen, Spacer, Title, useHaptic } from '@/components/ui';
import { getChallenge } from '@/content/challenges';
import { XP_CHALLENGE_BEST, XP_CHALLENGE_OK } from '@/lib/xp';
import { getPack } from '@/data/packs';
import { useProgress } from '@/store/progress';
import { useTheme } from '@/theme';

/**
 * Chart challenge flow:
 * analyze → choose → state confidence → commit → reveal future → process-scored feedback.
 */
export default function ChallengeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useTheme();
  const h = useHaptic();
  const challenge = getChallenge(id ?? '');
  const progress = useProgress();

  const [choice, setChoice] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [committed, setCommitted] = useState(false);

  if (!challenge) {
    return (
      <Screen>
        <EmptyState icon="🧭" title="Challenge not found" body="Pick a challenge from the Practice tab." />
      </Screen>
    );
  }

  const pack = getPack(challenge.packId);
  const chosen = choice !== null ? challenge.options[choice] : null;

  const commit = () => {
    if (choice === null || confidence === null) return;
    setCommitted(true);
    const q = challenge.options[choice].quality;
    progress.recordAnswer(challenge.skill, q === 'best');
    progress.recordChallenge({ challengeId: challenge.id, quality: q, confidence, at: Date.now() });
    const xp = q === 'best' ? XP_CHALLENGE_BEST : q === 'ok' ? XP_CHALLENGE_OK : 0;
    if (xp > 0) progress.addXp(xp);
    if (q === 'best') h.success();
    else h.error();
    if (q === 'poor') {
      progress.addMistake({
        lessonId: `challenge:${challenge.id}`,
        blockId: `challenge:${challenge.id}`,
        skill: challenge.skill,
        prompt: challenge.question,
      });
    }
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: challenge.title }} />
      <Title style={{ fontSize: 20 }}>{challenge.title}</Title>
      <Dim>
        {pack.pair} · {pack.timeframe} · difficulty {'★'.repeat(challenge.difficulty)}
        {committed ? ' · future revealed' : ' · future hidden'}
      </Dim>
      <Spacer h={3} />
      <CandleChart
        candles={pack.candles}
        visible={committed ? Math.min(challenge.visible + 25, pack.candles.length) : challenge.visible}
        pipSize={pack.pipSize}
        lines={challenge.lines}
        height={260}
      />
      <Spacer h={3} />
      <Card>
        <Body style={{ fontWeight: '700' }}>{challenge.question}</Body>
      </Card>

      {challenge.options.map((o, i) => (
        <Button
          key={i}
          label={o.text}
          variant="secondary"
          disabled={committed}
          onPress={() => setChoice(i)}
          style={{
            marginBottom: 8,
            borderWidth: 1.5,
            borderColor: committed
              ? o.quality === 'best'
                ? t.colors.bull
                : choice === i
                  ? t.colors.bear
                  : t.colors.border
              : choice === i
                ? t.colors.accent
                : t.colors.border,
          }}
        />
      ))}

      {!committed && choice !== null && (
        <>
          <Dim style={{ marginTop: 8, marginBottom: 6 }}>How confident are you?</Dim>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {[
              { v: 1, l: 'Guessing' },
              { v: 2, l: 'Fairly sure' },
              { v: 3, l: 'Very sure' },
            ].map((c) => (
              <Chip key={c.v} label={c.l} selected={confidence === c.v} onPress={() => setConfidence(c.v)} />
            ))}
          </View>
          <Spacer h={2} />
          <Button label="Commit & reveal the future" disabled={confidence === null} onPress={commit} />
        </>
      )}

      {committed && chosen && (
        <>
          <FeedbackBanner
            status={chosen.quality === 'best' ? 'correct' : chosen.quality === 'ok' ? 'info' : 'wrong'}
            text={chosen.explain}
          />
          <FeedbackBanner status="info" text={challenge.reveal} />
          <Card style={{ marginTop: 12 }}>
            <Body style={{ fontWeight: '700', marginBottom: 4 }}>Process vs. outcome</Body>
            <Dim>
              Your score here reflects decision quality, not what price did next. Good decisions sometimes lose;
              bad ones sometimes win. Over many trades, only the process compounds.
            </Dim>
          </Card>
          <Button label="Done" onPress={() => router.back()} />
        </>
      )}
    </Screen>
  );
}
