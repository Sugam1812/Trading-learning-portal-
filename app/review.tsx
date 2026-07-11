import React, { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { Body, Button, Card, Dim, EmptyState, FeedbackBanner, Row, Screen, Spacer, Subtitle, Title, useHaptic } from '@/components/ui';
import { getLesson } from '@/content/curriculum';
import { XP_REVIEW_ITEM } from '@/lib/xp';
import { SKILL_LABELS } from '@/types/content';
import { dueMistakes, MistakeItem, useProgress } from '@/store/progress';
import { useTheme } from '@/theme';

/**
 * Mistake Notebook: spaced repetition over everything answered wrong.
 * Self-graded recall: see the prompt, recall the answer, grade yourself honestly.
 */
export default function ReviewScreen() {
  const t = useTheme();
  const h = useHaptic();
  const progress = useProgress();
  const due = useMemo(() => dueMistakes(progress.mistakes), [progress.mistakes]);
  const [current, setCurrent] = useState<MistakeItem | null>(due[0] ?? null);
  const [revealed, setRevealed] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  const grade = (correct: boolean) => {
    if (!current) return;
    progress.reviewMistake(current.id, correct);
    if (correct) {
      progress.addXp(XP_REVIEW_ITEM);
      h.success();
    } else {
      h.error();
    }
    setReviewedCount((c) => c + 1);
    const remaining = dueMistakes(progress.mistakes).filter((m) => m.id !== current.id);
    setCurrent(remaining[0] ?? null);
    setRevealed(false);
  };

  if (progress.mistakes.length === 0) {
    return (
      <Screen>
        <EmptyState
          icon="📒"
          title="A clean notebook"
          body="When you answer something wrong in a lesson or challenge, it lands here for spaced review. Mistakes are the raw material of mastery."
        />
      </Screen>
    );
  }

  if (!current) {
    return (
      <Screen>
        <EmptyState
          icon="🌤️"
          title={reviewedCount > 0 ? `Review done — ${reviewedCount} item${reviewedCount > 1 ? 's' : ''} cleared` : 'Nothing due right now'}
          body={`${progress.mistakes.length} item${progress.mistakes.length > 1 ? 's are' : ' is'} scheduled for later. Spacing the reviews out is what makes them stick.`}
        />
      </Screen>
    );
  }

  const sourceLesson = current.lessonId.startsWith('challenge:') ? null : getLesson(current.lessonId);

  return (
    <Screen>
      <Title>Mistake notebook</Title>
      <Subtitle>
        {due.length} due · recall the answer before revealing, then grade yourself honestly.
      </Subtitle>
      <Spacer h={4} />
      <Card>
        <Dim style={{ fontWeight: '700', marginBottom: 6 }}>
          {SKILL_LABELS[current.skill]}
          {sourceLesson ? ` · from "${sourceLesson.title}"` : ' · from a chart challenge'}
        </Dim>
        <Body style={{ fontWeight: '700', fontSize: 17 }}>{current.prompt}</Body>
        <Spacer h={3} />
        {!revealed ? (
          <Button label="I have recalled it — show context" variant="secondary" onPress={() => setRevealed(true)} />
        ) : (
          <View>
            <FeedbackBanner
              status="info"
              text={
                sourceLesson
                  ? `Revisit "${sourceLesson.title}" if this still feels shaky — the full explanation lives there.`
                  : 'Replay the challenge from the Practice tab to re-test the full decision.'
              }
            />
            <Spacer h={3} />
            <Row>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Button label="Got it right ✓" variant="bull" onPress={() => grade(true)} />
              </View>
              <View style={{ flex: 1 }}>
                <Button label="Still wrong ✕" variant="bear" onPress={() => grade(false)} />
              </View>
            </Row>
          </View>
        )}
      </Card>
      <Dim style={{ fontSize: 12, textAlign: 'center', color: t.colors.textFaint }}>
        Correct reviews space out further (1 → 3 → 7 → 14 → 30 days); misses reset. Items retire after the last stage.
      </Dim>
      {reviewedCount > 0 && (
        <>
          <Spacer h={2} />
          <Text style={{ textAlign: 'center', color: t.colors.gold, fontWeight: '700' }}>
            {reviewedCount} reviewed this session
          </Text>
        </>
      )}
    </Screen>
  );
}
