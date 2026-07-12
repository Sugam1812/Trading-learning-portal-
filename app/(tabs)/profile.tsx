import { router } from 'expo-router';
import React from 'react';
import { Alert, Share, Text, View } from 'react-native';
import { Body, Button, Card, Chip, Dim, ProgressBar, Row, Screen, SectionTitle, Spacer, Subtitle, Title } from '@/components/ui';
import { LESSONS } from '@/content/curriculum';
import { masteryLabel } from '@/lib/mastery';
import { levelFromXp } from '@/lib/xp';
import { useJournal } from '@/store/journal';
import { useLab } from '@/store/lab';
import { useProgress } from '@/store/progress';
import { ThemeMode, useSettings } from '@/store/settings';
import { useTheme } from '@/theme';
import { SKILL_LABELS, SkillId } from '@/types/content';

interface Achievement {
  icon: string;
  title: string;
  body: string;
  earned: boolean;
}

export default function ProfileScreen() {
  const t = useTheme();
  const settings = useSettings();
  const progress = useProgress();
  const journal = useJournal();
  const lab = useLab();

  const level = levelFromXp(progress.xp);
  const lessonsDone = Object.values(progress.lessons).filter((l) => l.completed).length;
  const backtestTrades = lab.sessions.reduce((a, s) => a + s.trades.filter((x) => !x.skipped).length, 0);
  const noTradeWins = progress.challengeResults.filter((r) => r.quality === 'best').length;

  const achievements: Achievement[] = [
    { icon: '🌱', title: 'First Steps', body: 'Complete your first lesson', earned: lessonsDone >= 1 },
    { icon: '📚', title: 'Dedicated Student', body: 'Complete 10 lessons', earned: lessonsDone >= 10 },
    { icon: '🎓', title: 'Curriculum Conqueror', body: `Complete all ${LESSONS.length} lessons`, earned: lessonsDone >= LESSONS.length },
    { icon: '🔥', title: 'Consistent', body: 'Reach a 7-day streak', earned: progress.streakCount >= 7 },
    { icon: '🕵️', title: 'Chart Detective', body: 'Make 5 best-process challenge calls', earned: noTradeWins >= 5 },
    { icon: '🛡️', title: 'Risk Guardian', body: 'Master risk skills above 80%', earned: (progress.mastery.risk?.value ?? 0) >= 0.8 && (progress.mastery.risk?.samples ?? 0) >= 5 },
    { icon: '🔬', title: 'Backtest Scientist', body: 'Record 20 replay trades', earned: backtestTrades >= 20 },
    { icon: '📓', title: 'Honest Journaler', body: 'Log 5 trades in the journal', earned: journal.trades.length >= 5 },
    { icon: '🧘', title: 'Reviewer', body: 'Clear 10 mistake reviews', earned: progress.reflections.length + noTradeWins >= 10 },
  ];

  const exportData = async () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      app: 'PipQuest',
      profile: settings.profile,
      progress: {
        xp: progress.xp,
        streak: progress.streakCount,
        lessons: progress.lessons,
        mastery: progress.mastery,
      },
      journal: journal.trades,
      strategies: lab.strategies,
      backtests: lab.sessions,
    };
    try {
      await Share.share({ message: JSON.stringify(payload, null, 2) });
    } catch {
      // user cancelled — nothing to do
    }
  };

  const resetEverything = () => {
    Alert.alert('Reset all data?', 'This permanently deletes progress, journal, strategies and backtests on this device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete everything',
        style: 'destructive',
        onPress: () => {
          progress.resetAll();
          journal.resetAll();
          lab.resetAll();
          settings.resetAll();
          router.replace('/onboarding');
        },
      },
    ]);
  };

  const skills = Object.entries(progress.mastery) as [SkillId, { value: number; samples: number }][];

  return (
    <Screen>
      <Title>{settings.profile?.name ?? 'Trader'}</Title>
      <Subtitle>
        Level {level.level} — {level.title} · {progress.xp} XP · 🔥 {progress.streakCount}-day streak
      </Subtitle>
      <Spacer h={2} />
      <ProgressBar value={level.intoLevel / level.needed} />

      <SectionTitle>Skill mastery</SectionTitle>
      {skills.length === 0 ? (
        <Dim>Answer lesson questions to start building your skill profile.</Dim>
      ) : (
        skills
          .sort((a, b) => a[1].value - b[1].value)
          .map(([skill, m]) => (
            <View key={skill} style={{ marginBottom: 10 }}>
              <Row style={{ marginBottom: 4 }}>
                <Body style={{ flex: 1, fontSize: 14, fontWeight: '600' }}>{SKILL_LABELS[skill]}</Body>
                <Dim style={{ fontSize: 12 }}>
                  {masteryLabel(m.value)} · {m.samples} answers
                </Dim>
              </Row>
              <ProgressBar value={m.value} height={6} color={m.value >= 0.65 ? t.colors.bull : m.value >= 0.45 ? t.colors.warning : t.colors.bear} />
            </View>
          ))
      )}

      <SectionTitle>Achievements</SectionTitle>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {achievements.map((a) => (
          <Card key={a.title} style={{ width: '48%', marginRight: '2%', opacity: a.earned ? 1 : 0.45, padding: 12 }}>
            <Text style={{ fontSize: 26 }}>{a.icon}</Text>
            <Body style={{ fontWeight: '700', fontSize: 13 }}>{a.title}</Body>
            <Dim style={{ fontSize: 11 }}>{a.body}</Dim>
          </Card>
        ))}
      </View>

      <SectionTitle>Appearance</SectionTitle>
      <Dim style={{ marginBottom: 6 }}>Theme</Dim>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {(['dark', 'light', 'system'] as ThemeMode[]).map((m) => (
          <Chip key={m} label={m} selected={settings.themeMode === m} onPress={() => settings.setThemeMode(m)} />
        ))}
      </View>
      <Spacer h={2} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        <Chip
          label={settings.colorBlindMode ? '✓ Color-blind friendly charts' : 'Color-blind friendly charts'}
          selected={settings.colorBlindMode}
          onPress={() => settings.setColorBlindMode(!settings.colorBlindMode)}
        />
        <Chip
          label={settings.haptics ? '✓ Haptic feedback' : 'Haptic feedback'}
          selected={settings.haptics}
          onPress={() => settings.setHaptics(!settings.haptics)}
        />
        <Chip
          label={settings.reduceMotion ? '✓ Reduce motion' : 'Reduce motion'}
          selected={settings.reduceMotion}
          onPress={() => settings.setReduceMotion(!settings.reduceMotion)}
        />
      </View>

      <SectionTitle>Data & privacy</SectionTitle>
      <Card>
        <Dim style={{ fontSize: 13 }}>
          Everything lives on this device. No account, no tracking, no sale of your trading behaviour. Export anytime;
          delete anytime.
        </Dim>
      </Card>
      <Button label="Export my data (JSON)" variant="secondary" onPress={exportData} />
      <Spacer h={2} />
      <Button label="About, disclaimers & legal" variant="secondary" onPress={() => router.push('/legal')} />
      <Spacer h={2} />
      <Button label="Reset all data" variant="danger" onPress={resetEverything} />
      <Spacer h={4} />
      <Dim style={{ textAlign: 'center', fontSize: 12, color: t.colors.textFaint }}>
        PipQuest v1.0 · education only, never financial advice
      </Dim>
    </Screen>
  );
}
