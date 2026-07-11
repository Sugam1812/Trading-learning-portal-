import { router } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';
import { Body, Button, Card, Dim, ProgressBar, Row, Screen, SectionTitle, Spacer, Title } from '@/components/ui';
import { dailyChallenge } from '@/content/challenges';
import { getModule, isModuleUnlocked, moduleProgress, nextLesson, worlds } from '@/content/curriculum';
import { levelFromXp } from '@/lib/xp';
import { SKILL_LABELS } from '@/types/content';
import { weakestSkills, masteryLabel } from '@/lib/mastery';
import { dueMistakes, useProgress } from '@/store/progress';
import { useSettings } from '@/store/settings';
import { useTheme } from '@/theme';

/** Learn tab: personalized dashboard + the course world map. */
export default function LearnScreen() {
  const t = useTheme();
  const profile = useSettings((s) => s.profile);
  const xp = useProgress((s) => s.xp);
  const streak = useProgress((s) => s.streakCount);
  const lessons = useProgress((s) => s.lessons);
  const mastery = useProgress((s) => s.mastery);
  const mistakes = useProgress((s) => s.mistakes);

  const level = levelFromXp(xp);
  const next = nextLesson(lessons);
  const daily = dailyChallenge();
  const due = dueMistakes(mistakes).length;
  const weak = weakestSkills(mastery)[0];

  return (
    <Screen>
      <Title>
        {greeting()}, {profile?.name ?? 'Trader'} 👋
      </Title>
      <Row>
        <Dim>
          🔥 {streak}-day streak · ⭐ Level {level.level} — {level.title}
        </Dim>
      </Row>
      <Spacer h={2} />
      <ProgressBar value={level.intoLevel / level.needed} />
      <Dim style={{ marginTop: 4, fontSize: 12 }}>
        {level.intoLevel}/{level.needed} XP to level {level.level + 1}
      </Dim>

      {next ? (
        <Card accent onPress={() => router.push(`/lesson/${next.id}`)}>
          <Dim style={{ fontWeight: '700', color: t.colors.accent }}>CONTINUE LEARNING</Dim>
          <Body style={{ fontWeight: '800', fontSize: 18, marginTop: 4 }}>{next.title}</Body>
          <Dim style={{ marginTop: 2 }}>{next.objective}</Dim>
          <Spacer h={2} />
          <Dim style={{ fontSize: 12 }}>
            {getModule(next.moduleId)?.icon} {getModule(next.moduleId)?.title} · +{next.xp} XP
          </Dim>
        </Card>
      ) : (
        <Card accent>
          <Body style={{ fontWeight: '800', fontSize: 18 }}>🎓 Curriculum complete!</Body>
          <Dim>Head to the Lab to backtest, or review your weak skills in Practice.</Dim>
        </Card>
      )}

      <Row>
        <Card style={{ flex: 1, marginRight: 8 }} onPress={() => router.push(`/challenge/${daily.id}`)}>
          <Text style={{ fontSize: 22 }}>📈</Text>
          <Body style={{ fontWeight: '700', fontSize: 14 }}>Daily chart challenge</Body>
          <Dim style={{ fontSize: 12 }}>{daily.title}</Dim>
        </Card>
        <Card
          style={{ flex: 1 }}
          onPress={() => router.push('/review')}
        >
          <Text style={{ fontSize: 22 }}>📒</Text>
          <Body style={{ fontWeight: '700', fontSize: 14 }}>Mistake notebook</Body>
          <Dim style={{ fontSize: 12 }}>{due > 0 ? `${due} item${due > 1 ? 's' : ''} due for review` : 'Nothing due — nice.'}</Dim>
        </Card>
      </Row>

      {weak && mastery[weak] && (
        <Card onPress={() => router.push('/review')}>
          <Body style={{ fontWeight: '700', fontSize: 14 }}>
            🎯 Weakest skill: {SKILL_LABELS[weak]} — {masteryLabel(mastery[weak]!.value)}
          </Body>
          <Dim style={{ fontSize: 12 }}>Targeted review sharpens weak skills fastest.</Dim>
        </Card>
      )}

      <SectionTitle>Your journey</SectionTitle>
      {worlds().map((w) => (
        <View key={w.name}>
          <Row style={{ marginTop: 8, marginBottom: 6 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: t.colors.border }} />
            <Dim style={{ marginHorizontal: 10, fontWeight: '700' }}>{w.name}</Dim>
            <View style={{ flex: 1, height: 1, backgroundColor: t.colors.border }} />
          </Row>
          {w.modules.map((m) => {
            const unlocked = isModuleUnlocked(m.id, lessons);
            const prog = moduleProgress(m.id, lessons);
            return (
              <Card
                key={m.id}
                onPress={unlocked ? () => router.push(`/module/${m.id}`) : undefined}
                style={{ opacity: unlocked ? 1 : 0.55 }}
              >
                <Row>
                  <Text style={{ fontSize: 30, marginRight: 12 }}>{unlocked ? m.icon : '🔒'}</Text>
                  <View style={{ flex: 1 }}>
                    <Body style={{ fontWeight: '800' }}>{m.title}</Body>
                    <Dim style={{ fontSize: 13 }}>{m.tagline}</Dim>
                    <Spacer h={2} />
                    {unlocked ? (
                      <ProgressBar value={prog} height={6} />
                    ) : (
                      <Dim style={{ fontSize: 12 }}>
                        Unlocks after {getModule(m.prereq ?? '')?.title ?? 'previous module'}
                      </Dim>
                    )}
                  </View>
                </Row>
              </Card>
            );
          })}
        </View>
      ))}

      <Spacer h={2} />
      <Button label="📖 Open glossary" variant="ghost" onPress={() => router.push('/glossary')} />
    </Screen>
  );
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return 'Burning the midnight oil';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}
