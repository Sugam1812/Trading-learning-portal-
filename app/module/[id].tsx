import { router, Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';
import { Body, Card, Dim, EmptyState, ProgressBar, Row, Screen, Spacer, Subtitle, Title } from '@/components/ui';
import { getLesson, getModule, moduleProgress } from '@/content/curriculum';
import { EXAM_PASS_RATIO, EXAM_QUESTIONS } from '@/lib/exam';
import { useProgress } from '@/store/progress';
import { useTheme } from '@/theme';

export default function ModuleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useTheme();
  const lessons = useProgress((s) => s.lessons);
  const exams = useProgress((s) => s.exams);
  const mod = getModule(id ?? '');

  if (!mod) {
    return (
      <Screen>
        <EmptyState icon="🧭" title="Module not found" body="This module does not exist. Head back to the course map." />
      </Screen>
    );
  }

  const prog = moduleProgress(mod.id, lessons);

  return (
    <Screen>
      <Stack.Screen options={{ title: mod.title }} />
      <Row>
        <Text style={{ fontSize: 40, marginRight: 12 }}>{mod.icon}</Text>
        <View style={{ flex: 1 }}>
          <Title style={{ marginBottom: 2 }}>{mod.title}</Title>
          <Subtitle>{mod.tagline}</Subtitle>
        </View>
      </Row>
      <Spacer h={3} />
      <ProgressBar value={prog} />
      <Dim style={{ marginTop: 4, fontSize: 12 }}>{Math.round(prog * 100)}% complete</Dim>
      <Spacer h={4} />

      {(() => {
        const allDone = mod.lessonIds.every((lid) => lessons[lid]?.completed);
        const exam = exams[mod.id];
        if (!allDone) return null;
        return (
          <Card accent={!exam?.passed} onPress={() => router.push(`/exam/${mod.id}`)}>
            <Row>
              <Text style={{ fontSize: 28, marginRight: 12 }}>{exam?.passed ? '👑' : '🏆'}</Text>
              <View style={{ flex: 1 }}>
                <Body style={{ fontWeight: '800' }}>
                  {exam?.passed ? 'Checkpoint passed — retake anytime' : 'Checkpoint exam unlocked'}
                </Body>
                <Dim style={{ fontSize: 13 }}>
                  {EXAM_QUESTIONS} questions sampled across the module · first answer counts · pass at{' '}
                  {Math.round(EXAM_PASS_RATIO * 100)}%
                  {exam ? ` · best ${exam.bestScore}/${exam.total}` : ''}
                </Dim>
              </View>
            </Row>
          </Card>
        );
      })()}

      {mod.lessonIds.map((lid, i) => {
        const lesson = getLesson(lid);
        if (!lesson) return null;
        const state = lessons[lid];
        // Lessons unlock in order within a module.
        const unlocked = i === 0 || !!lessons[mod.lessonIds[i - 1]]?.completed;
        return (
          <Card
            key={lid}
            onPress={unlocked ? () => router.push(`/lesson/${lid}`) : undefined}
            style={{ opacity: unlocked ? 1 : 0.55 }}
            accent={unlocked && !state?.completed}
          >
            <Row>
              <Text style={{ fontSize: 24, marginRight: 12 }}>
                {state?.completed ? '✅' : unlocked ? '▶️' : '🔒'}
              </Text>
              <View style={{ flex: 1 }}>
                <Body style={{ fontWeight: '700' }}>
                  {i + 1}. {lesson.title}
                </Body>
                <Dim style={{ fontSize: 13 }}>{lesson.objective}</Dim>
                <Dim style={{ fontSize: 12, marginTop: 4, color: t.colors.gold }}>
                  +{lesson.xp} XP · {lesson.blocks.length} steps
                  {state?.completed ? ` · Best: ${Math.round((state.score ?? 0) * 100)}% first-try` : ''}
                </Dim>
              </View>
            </Row>
          </Card>
        );
      })}
    </Screen>
  );
}
