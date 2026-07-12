import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { BlockRenderer, BlockResult } from '@/components/blocks/BlockRenderer';
import { Body, Button, Card, Dim, EmptyState, ProgressBar, Row, Screen, Spacer, useHaptic } from '@/components/ui';
import { getLesson, getModule } from '@/content/curriculum';
import { EXAM_PASS_RATIO, EXAM_QUESTIONS, EXAM_XP, examPassed, pickExamBlocks } from '@/lib/exam';
import { dayKey } from '@/lib/rng';
import { useProgress } from '@/store/progress';
import { useTheme } from '@/theme';

/**
 * Checkpoint exam: a deterministic daily sample of a module's questions.
 * First-try answers only count toward the score; passing awards a crown
 * on the course map. Retakes draw a fresh set the next day.
 */
export default function ExamScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useTheme();
  const h = useHaptic();
  const progress = useProgress();
  const mod = getModule(id ?? '');
  const scrollRef = useRef<ScrollView>(null);

  const lessons = useMemo(
    () => (mod ? mod.lessonIds.map((lid) => getLesson(lid)).filter((l): l is NonNullable<typeof l> => !!l) : []),
    [mod],
  );
  const allDone = mod ? mod.lessonIds.every((lid) => progress.lessons[lid]?.completed) : false;
  const blocks = useMemo(
    () => (mod && allDone ? pickExamBlocks(lessons, mod.id, dayKey()) : []),
    [mod, lessons, allDone],
  );

  const [index, setIndex] = useState(0);
  const [blockDone, setBlockDone] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);
  const existing = mod ? progress.exams[mod.id] : undefined;

  if (!mod) {
    return (
      <Screen>
        <EmptyState icon="🧭" title="Module not found" body="Pick a module from the course map." />
      </Screen>
    );
  }

  if (!allDone) {
    return (
      <Screen>
        <Stack.Screen options={{ title: `${mod.title} — Checkpoint` }} />
        <EmptyState
          icon="🔒"
          title="Checkpoint locked"
          body={`Complete all ${mod.lessonIds.length} lessons of ${mod.title} to unlock its checkpoint exam. The exam samples ${EXAM_QUESTIONS} questions across the whole module — no hints, first answer counts.`}
        />
        <Button label="Back to module" onPress={() => router.back()} />
      </Screen>
    );
  }

  if (finished) {
    const passed = examPassed(correct, blocks.length);
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Checkpoint result' }} />
        <View style={{ alignItems: 'center', paddingVertical: 24 }}>
          <Text style={{ fontSize: 64 }}>{passed ? '👑' : '🌪️'}</Text>
          <Body style={{ fontSize: 24, fontWeight: '900', marginTop: 8 }}>
            {passed ? 'Checkpoint passed!' : 'Not this time'}
          </Body>
          <Dim style={{ marginTop: 4 }}>
            {correct}/{blocks.length} first-try correct · pass mark {Math.round(EXAM_PASS_RATIO * 100)}%
          </Dim>
          <Spacer h={4} />
          <Card style={{ alignSelf: 'stretch' }}>
            <Dim>
              {passed
                ? `${mod.title} now wears a crown on your course map. Missed questions were filed into the Mistake Notebook — clear them to make the crown honest.`
                : 'Misses were filed into the Mistake Notebook. Review them, revisit the weak lessons, and retake tomorrow — the exam draws a fresh question set each day.'}
            </Dim>
          </Card>
          <Button label="Back to module" onPress={() => router.back()} style={{ alignSelf: 'stretch' }} />
        </View>
      </Screen>
    );
  }

  const block = blocks[index];
  const isLast = index === blocks.length - 1;

  const onDone = (r: BlockResult) => {
    if (blockDone) return;
    setBlockDone(true);
    const ok = r.correct && r.firstTry;
    if (ok) setCorrect((c) => c + 1);
    progress.recordAnswer(block.skill, ok);
    if (!ok) {
      progress.addMistake({
        lessonId: `exam:${mod.id}`,
        blockId: `exam:${block.id}`,
        skill: block.skill,
        prompt: promptOf(block),
      });
    }
  };

  const advance = () => {
    if (isLast) {
      const finalCorrect = correct;
      const passed = examPassed(finalCorrect, blocks.length);
      progress.recordExam(mod.id, finalCorrect, blocks.length, passed);
      if (passed) {
        progress.addXp(EXAM_XP);
        h.success();
      } else {
        h.error();
      }
      setFinished(true);
    } else {
      setIndex(index + 1);
      setBlockDone(false);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.bg }}>
      <Stack.Screen options={{ title: `${mod.icon} Checkpoint exam` }} />
      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <Row>
          <View style={{ flex: 1, marginRight: 12 }}>
            <ProgressBar value={(index + (blockDone ? 1 : 0)) / blocks.length} color={t.colors.gold} />
          </View>
          <Dim style={{ fontSize: 12 }}>
            {index + 1}/{blocks.length}
          </Dim>
        </Row>
        {existing && !existing.passed && (
          <Dim style={{ fontSize: 11, marginTop: 4 }}>
            Attempt {existing.attempts + 1} · best so far {existing.bestScore}/{existing.total}
          </Dim>
        )}
      </View>
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <Dim style={{ marginBottom: 10, fontSize: 12, color: t.colors.gold, fontWeight: '700' }}>
          EXAM MODE — first answer counts, no hints
        </Dim>
        <BlockRenderer key={block.id} block={block} onDone={onDone} done={false} />
        <Spacer h={4} />
        {blockDone && <Button label={isLast ? 'Finish exam 🏁' : 'Next question →'} onPress={advance} />}
      </ScrollView>
    </View>
  );
}

function promptOf(block: unknown): string {
  const b = block as { prompt?: string; statement?: string; situation?: string; title?: string };
  return b.prompt ?? b.statement ?? b.situation ?? b.title ?? 'Exam question';
}
