import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { BlockRenderer, BlockResult } from '@/components/blocks/BlockRenderer';
import { Body, Button, Dim, EmptyState, ProgressBar, Row, Screen, Spacer, useHaptic } from '@/components/ui';
import { getLesson, getModule } from '@/content/curriculum';
import {
  XP_LESSON_COMPLETE_BONUS,
  XP_PER_CORRECT_FIRST_TRY,
  XP_PER_CORRECT_RETRY,
} from '@/lib/xp';
import { useProgress } from '@/store/progress';
import { useTheme } from '@/theme';

/**
 * Lesson player: one block at a time, Explain → Try → Correct → Continue.
 * XP and mastery are awarded per block; the Mistake Notebook collects misses.
 */
export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useTheme();
  const h = useHaptic();
  const lesson = getLesson(id ?? '');
  const progress = useProgress();
  const scrollRef = useRef<ScrollView>(null);

  const [index, setIndex] = useState(0);
  const [blockDone, setBlockDone] = useState(false);
  const [results, setResults] = useState<BlockResult[]>([]);
  const [finished, setFinished] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);

  if (!lesson) {
    return (
      <Screen>
        <EmptyState icon="🧭" title="Lesson not found" body="This lesson does not exist yet." />
      </Screen>
    );
  }

  const block = lesson.blocks[index];
  const isLast = index === lesson.blocks.length - 1;

  const onBlockDone = (r: BlockResult) => {
    if (blockDone) return;
    setBlockDone(true);
    setResults((prev) => [...prev, r]);

    if (block.kind !== 'concept' && block.kind !== 'reflection') {
      progress.recordAnswer(block.skill, r.correct);
      const xp = r.correct ? (r.firstTry ? XP_PER_CORRECT_FIRST_TRY : XP_PER_CORRECT_RETRY) : 0;
      if (xp > 0) {
        progress.addXp(xp);
        setEarnedXp((e) => e + xp);
      }
      if (!r.correct) {
        progress.addMistake({
          lessonId: lesson.id,
          blockId: block.id,
          skill: block.skill,
          prompt: promptOf(block),
        });
      }
    }
    if (block.kind === 'reflection' && r.text) {
      progress.addReflection(promptOf(block), r.text);
    }
  };

  const advance = () => {
    if (isLast) {
      const interactive = results.filter((r, i) => {
        const k = lesson.blocks[i]?.kind;
        return k !== 'concept' && k !== 'reflection';
      });
      const score = interactive.length
        ? interactive.filter((r) => r.correct && r.firstTry).length / interactive.length
        : 1;
      progress.completeLesson(lesson.id, score);
      progress.addXp(XP_LESSON_COMPLETE_BONUS);
      setEarnedXp((e) => e + XP_LESSON_COMPLETE_BONUS);
      h.success();
      setFinished(true);
    } else {
      setIndex(index + 1);
      setBlockDone(false);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }
  };

  if (finished) {
    const interactiveCount = lesson.blocks.filter((b) => b.kind !== 'concept' && b.kind !== 'reflection').length;
    const firstTry = results.filter(
      (r, i) => r.correct && r.firstTry && lesson.blocks[i]?.kind !== 'concept' && lesson.blocks[i]?.kind !== 'reflection',
    ).length;
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Lesson complete' }} />
        <View style={{ alignItems: 'center', paddingVertical: 24 }}>
          <Text style={{ fontSize: 64 }}>🏆</Text>
          <Body style={{ fontSize: 24, fontWeight: '900', marginTop: 8 }}>Lesson complete!</Body>
          <Dim style={{ marginTop: 4 }}>{lesson.title}</Dim>
          <Spacer h={4} />
          <Row>
            <View style={{ alignItems: 'center', marginHorizontal: 16 }}>
              <Body style={{ fontSize: 22, fontWeight: '900', color: t.colors.gold }}>+{earnedXp}</Body>
              <Dim style={{ fontSize: 12 }}>XP earned</Dim>
            </View>
            <View style={{ alignItems: 'center', marginHorizontal: 16 }}>
              <Body style={{ fontSize: 22, fontWeight: '900', color: t.colors.accent }}>
                {firstTry}/{interactiveCount}
              </Body>
              <Dim style={{ fontSize: 12 }}>first-try correct</Dim>
            </View>
          </Row>
          <Spacer h={6} />
          <Button label="Back to module" onPress={() => router.back()} style={{ alignSelf: 'stretch' }} />
        </View>
      </Screen>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.bg }}>
      <Stack.Screen options={{ title: getModule(lesson.moduleId)?.title ?? 'Lesson' }} />
      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <Row>
          <View style={{ flex: 1, marginRight: 12 }}>
            <ProgressBar value={(index + (blockDone ? 1 : 0)) / lesson.blocks.length} />
          </View>
          <Dim style={{ fontSize: 12 }}>
            {index + 1}/{lesson.blocks.length}
          </Dim>
        </Row>
      </View>
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <BlockRenderer key={block.id} block={block} onDone={onBlockDone} done={false} />
        <Spacer h={4} />
        {blockDone && (
          <Button label={isLast ? 'Finish lesson 🏁' : 'Continue →'} onPress={advance} />
        )}
      </ScrollView>
    </View>
  );
}

function promptOf(block: unknown): string {
  const b = block as { prompt?: string; statement?: string; situation?: string; title?: string };
  return b.prompt ?? b.statement ?? b.situation ?? b.title ?? 'Exercise';
}
