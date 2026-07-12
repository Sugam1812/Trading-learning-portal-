import { router } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';
import { Body, Card, Dim, Row, Screen, SectionTitle, Spacer, Subtitle, Title } from '@/components/ui';
import { CHALLENGES, dailyChallenge } from '@/content/challenges';
import { SKILL_LABELS } from '@/types/content';
import { dueMistakes, useProgress } from '@/store/progress';
import { useTheme } from '@/theme';

const MODE_LABELS: Record<string, string> = {
  trend: 'Trend reading',
  structure: 'Market structure',
  levels: 'Support & resistance',
  breakout: 'Break or fake',
  decision: 'Trade decisions',
  risk: 'Risk judgement',
};

export default function PracticeScreen() {
  const t = useTheme();
  const mistakes = useProgress((s) => s.mistakes);
  const results = useProgress((s) => s.challengeResults);
  const due = dueMistakes(mistakes);
  const daily = dailyChallenge();

  const doneIds = new Set(results.map((r) => r.challengeId));

  return (
    <Screen>
      <Title>Practice</Title>
      <Subtitle>Charts with the future hidden. Commit, reveal, and score your process — not your luck.</Subtitle>

      <SectionTitle>Today</SectionTitle>
      <Card accent onPress={() => router.push(`/challenge/${daily.id}`)}>
        <Row>
          <Text style={{ fontSize: 30, marginRight: 12 }}>📅</Text>
          <View style={{ flex: 1 }}>
            <Body style={{ fontWeight: '800' }}>Daily challenge: {daily.title}</Body>
            <Dim style={{ fontSize: 13 }}>
              {MODE_LABELS[daily.mode]} · difficulty {'★'.repeat(daily.difficulty)}
            </Dim>
          </View>
        </Row>
      </Card>

      <Card onPress={() => router.push('/review')}>
        <Row>
          <Text style={{ fontSize: 30, marginRight: 12 }}>📒</Text>
          <View style={{ flex: 1 }}>
            <Body style={{ fontWeight: '800' }}>Mistake notebook</Body>
            <Dim style={{ fontSize: 13 }}>
              {due.length > 0
                ? `${due.length} item${due.length > 1 ? 's' : ''} due — spaced review locks in weak spots.`
                : mistakes.length > 0
                  ? `${mistakes.length} saved, none due right now.`
                  : 'Wrong answers land here automatically for spaced review.'}
            </Dim>
          </View>
        </Row>
      </Card>

      <SectionTitle>Chart challenges</SectionTitle>
      {CHALLENGES.map((c) => (
        <Card key={c.id} onPress={() => router.push(`/challenge/${c.id}`)}>
          <Row>
            <Text style={{ fontSize: 26, marginRight: 12 }}>{doneIds.has(c.id) ? '✅' : '🕯️'}</Text>
            <View style={{ flex: 1 }}>
              <Body style={{ fontWeight: '700' }}>{c.title}</Body>
              <Dim style={{ fontSize: 13 }}>
                {MODE_LABELS[c.mode]} · {SKILL_LABELS[c.skill]} · {'★'.repeat(c.difficulty)}
              </Dim>
            </View>
          </Row>
        </Card>
      ))}
      <Spacer h={2} />
      <Dim style={{ textAlign: 'center', fontSize: 12, color: t.colors.textFaint }}>
        Challenges can be replayed anytime — the lesson is in the reasoning, not the reveal.
      </Dim>
    </Screen>
  );
}
