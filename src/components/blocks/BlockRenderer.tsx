import React, { useMemo, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { CandleChart } from '@/components/chart/CandleChart';
import { CandleAnatomy, RRDiagram, Stepper } from '@/components/chart/diagrams';
import { Body, Button, Chip, Dim, FeedbackBanner, Row, Spacer, useHaptic } from '@/components/ui';
import { rewardToRisk } from '@/lib/calc';
import { hashString, seededShuffle } from '@/lib/rng';
import { getPack } from '@/data/packs';
import { useTheme } from '@/theme';
import {
  ChartChoiceBlock,
  ChartFigure,
  ConceptBlock,
  LessonBlock,
  MatchBlock,
  McqBlock,
  MultiSelectBlock,
  NextCandleBlock,
  NumberInputBlock,
  OrderBlock,
  RRBuilderBlock,
  ScenarioBlock,
  TapCandleBlock,
  TapPartBlock,
  TrueFalseBlock,
} from '@/types/content';

export interface BlockResult {
  /** Whether the learner ultimately got it right (concepts/reflections count as right). */
  correct: boolean;
  /** Correct on the very first attempt — drives XP and mastery. */
  firstTry: boolean;
  /** For scenario blocks: chosen process quality. */
  quality?: 'best' | 'ok' | 'poor';
  /** Reflection text, if any. */
  text?: string;
}

interface BlockProps<B extends LessonBlock = LessonBlock> {
  block: B;
  onDone: (r: BlockResult) => void;
  done: boolean;
}

function Figure({ figure }: { figure: ChartFigure }) {
  const pack = getPack(figure.packId);
  return (
    <View style={{ marginTop: 10 }}>
      <CandleChart candles={pack.candles} visible={figure.visible} pipSize={pack.pipSize} lines={figure.lines} height={210} />
      {figure.caption ? <Dim style={{ marginTop: 6, fontStyle: 'italic' }}>{figure.caption}</Dim> : null}
    </View>
  );
}

function Prompt({ children }: { children: React.ReactNode }) {
  const t = useTheme();
  return (
    <Text style={{ color: t.colors.text, fontSize: 17, fontWeight: '700', lineHeight: 24, marginBottom: 12 }}>
      {children}
    </Text>
  );
}

function HintButton({ hint }: { hint?: string }) {
  const [show, setShow] = useState(false);
  if (!hint) return null;
  return (
    <View style={{ marginTop: 8 }}>
      {show ? (
        <FeedbackBanner status="info" text={hint} />
      ) : (
        <Button label="Show hint" variant="ghost" small onPress={() => setShow(true)} />
      )}
    </View>
  );
}

/** Shared two-attempt answer flow used by most question blocks. */
function useAttempts(onDone: (r: BlockResult) => void) {
  const [attempts, setAttempts] = useState(0);
  const [state, setState] = useState<'idle' | 'wrong-retry' | 'final'>('idle');
  const h = useHaptic();
  const submit = (correct: boolean) => {
    const first = attempts === 0;
    setAttempts(attempts + 1);
    if (correct) {
      h.success();
      setState('final');
      onDone({ correct: true, firstTry: first });
    } else if (first) {
      h.error();
      setState('wrong-retry');
    } else {
      h.error();
      setState('final');
      onDone({ correct: false, firstTry: false });
    }
  };
  return { state, submit, attempts };
}

// ---------- Concept ----------

function ConceptView({ block, onDone, done }: BlockProps<ConceptBlock>) {
  const t = useTheme();
  React.useEffect(() => {
    if (!done) onDone({ correct: true, firstTry: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <View>
      <Prompt>{block.title}</Prompt>
      <Body>{block.body}</Body>
      {block.bullets?.map((b, i) => (
        <Row key={i} style={{ alignItems: 'flex-start', marginTop: 8 }}>
          <Text style={{ color: t.colors.accent, marginRight: 8, fontSize: 16 }}>•</Text>
          <Body style={{ flex: 1, fontSize: 15 }}>{b}</Body>
        </Row>
      ))}
      {block.figure && <Figure figure={block.figure} />}
      {block.example && (
        <View style={{ backgroundColor: t.colors.surfaceAlt, borderRadius: 12, padding: 12, marginTop: 12 }}>
          <Dim style={{ fontWeight: '700', marginBottom: 4 }}>Example</Dim>
          <Body style={{ fontSize: 15 }}>{block.example}</Body>
        </View>
      )}
      {block.mistake && (
        <View
          style={{
            backgroundColor: t.colors.bearSoft,
            borderRadius: 12,
            padding: 12,
            marginTop: 12,
          }}
        >
          <Text style={{ color: t.colors.bear, fontWeight: '700', marginBottom: 4, fontSize: 13 }}>Common mistake</Text>
          <Body style={{ fontSize: 15 }}>{block.mistake}</Body>
        </View>
      )}
    </View>
  );
}

// ---------- MCQ-style options ----------

function OptionButton({
  text,
  state,
  onPress,
  disabled,
}: {
  text: string;
  state: 'idle' | 'selected' | 'correct' | 'wrong';
  onPress: () => void;
  disabled?: boolean;
}) {
  const t = useTheme();
  const border =
    state === 'correct' ? t.colors.bull : state === 'wrong' ? t.colors.bear : state === 'selected' ? t.colors.accent : t.colors.border;
  const bg = state === 'correct' ? t.colors.bullSoft : state === 'wrong' ? t.colors.bearSoft : t.colors.surface;
  return (
    <Button
      label={text}
      variant="secondary"
      onPress={onPress}
      disabled={disabled}
      style={{
        marginBottom: 8,
        backgroundColor: bg,
        borderWidth: 1.5,
        borderColor: border,
        alignItems: 'flex-start',
      }}
    />
  );
}

function McqView({ block, onDone, done }: BlockProps<McqBlock>) {
  const { state, submit } = useAttempts(onDone);
  const [chosen, setChosen] = useState<number | null>(null);
  const finished = state === 'final' || done;
  return (
    <View>
      <Prompt>{block.prompt}</Prompt>
      {block.figure && (
        <View style={{ marginBottom: 12 }}>
          <Figure figure={block.figure} />
        </View>
      )}
      {block.options.map((o, i) => (
        <OptionButton
          key={i}
          text={o.text}
          disabled={finished}
          state={
            finished && i === block.correctIndex
              ? 'correct'
              : chosen === i && finished
                ? 'wrong'
                : chosen === i
                  ? 'selected'
                  : 'idle'
          }
          onPress={() => {
            setChosen(i);
            submit(i === block.correctIndex);
          }}
        />
      ))}
      {state === 'wrong-retry' && (
        <FeedbackBanner status="wrong" text={block.hint ? `Not quite. Hint: ${block.hint}` : 'Not quite — try once more.'} />
      )}
      {finished && (
        <FeedbackBanner
          status={chosen === block.correctIndex ? 'correct' : 'wrong'}
          text={
            (chosen !== null && block.options[chosen]?.explain ? `${block.options[chosen].explain} ` : '') + block.explain
          }
        />
      )}
      {!finished && state === 'idle' && <HintButton hint={block.hint} />}
    </View>
  );
}

function MultiView({ block, onDone, done }: BlockProps<MultiSelectBlock>) {
  const { state, submit } = useAttempts(onDone);
  const [sel, setSel] = useState<number[]>([]);
  const finished = state === 'final' || done;
  const toggle = (i: number) => setSel((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]));
  const check = () => {
    const ok =
      sel.length === block.correctIndexes.length && block.correctIndexes.every((i) => sel.includes(i));
    submit(ok);
  };
  return (
    <View>
      <Prompt>{block.prompt}</Prompt>
      <Dim style={{ marginBottom: 8 }}>Select all that apply, then check.</Dim>
      {block.options.map((o, i) => (
        <OptionButton
          key={i}
          text={`${sel.includes(i) ? '☑' : '☐'}  ${o.text}`}
          disabled={finished}
          state={finished ? (block.correctIndexes.includes(i) ? 'correct' : sel.includes(i) ? 'wrong' : 'idle') : sel.includes(i) ? 'selected' : 'idle'}
          onPress={() => toggle(i)}
        />
      ))}
      {!finished && <Button label="Check answer" onPress={check} disabled={sel.length === 0} />}
      {state === 'wrong-retry' && (
        <FeedbackBanner status="wrong" text={block.hint ? `Not quite. Hint: ${block.hint}` : 'Not quite — adjust your selection and check again.'} />
      )}
      {finished && <FeedbackBanner status="correct" text={block.explain} />}
    </View>
  );
}

function TrueFalseView({ block, onDone, done }: BlockProps<TrueFalseBlock>) {
  const { state, submit } = useAttempts(onDone);
  const [chosen, setChosen] = useState<boolean | null>(null);
  const finished = state === 'final' || done;
  return (
    <View>
      <Prompt>{block.statement}</Prompt>
      <Row>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Button
            label="True"
            variant={finished && block.answer ? 'bull' : 'secondary'}
            disabled={finished}
            onPress={() => {
              setChosen(true);
              submit(block.answer === true);
            }}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Button
            label="False"
            variant={finished && !block.answer ? 'bull' : 'secondary'}
            disabled={finished}
            onPress={() => {
              setChosen(false);
              submit(block.answer === false);
            }}
          />
        </View>
      </Row>
      {state === 'wrong-retry' && <FeedbackBanner status="wrong" text="Not quite — think again and retry." />}
      {finished && (
        <FeedbackBanner status={chosen === block.answer ? 'correct' : 'wrong'} text={block.explain} />
      )}
    </View>
  );
}

function NumberView({ block, onDone, done }: BlockProps<NumberInputBlock>) {
  const t = useTheme();
  const { state, submit } = useAttempts(onDone);
  const [text, setText] = useState('');
  const finished = state === 'final' || done;
  const check = () => {
    const v = parseFloat(text.replace(',', '.'));
    if (Number.isNaN(v)) return;
    submit(Math.abs(v - block.answer) <= (block.tolerance ?? 0) + 1e-9);
  };
  return (
    <View>
      <Prompt>{block.prompt}</Prompt>
      <Row>
        <TextInput
          accessibilityLabel="Your answer"
          value={text}
          onChangeText={setText}
          editable={!finished}
          keyboardType="numeric"
          placeholder="Type a number"
          placeholderTextColor={t.colors.textFaint}
          style={{
            flex: 1,
            backgroundColor: t.colors.surfaceAlt,
            color: t.colors.text,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: t.colors.border,
            padding: 12,
            fontSize: 16,
            marginRight: 8,
          }}
        />
        {block.unit ? <Dim>{block.unit}</Dim> : null}
      </Row>
      <Spacer />
      {!finished && <Button label="Check" onPress={check} disabled={!text.trim()} />}
      {state === 'wrong-retry' && (
        <FeedbackBanner status="wrong" text={block.hint ? `Not quite. Hint: ${block.hint}` : 'Not quite — check your calculation and retry.'} />
      )}
      {finished && (
        <FeedbackBanner
          status="info"
          text={`Answer: ${block.answer}${block.unit ? ` ${block.unit}` : ''}. ${block.explain}`}
        />
      )}
      {!finished && state === 'idle' && <HintButton hint={block.hint} />}
    </View>
  );
}

function OrderView({ block, onDone, done }: BlockProps<OrderBlock>) {
  const { state, submit } = useAttempts(onDone);
  const shuffled = useMemo(() => seededShuffle(block.items, hashString(block.id)), [block]);
  const [picked, setPicked] = useState<string[]>([]);
  const finished = state === 'final' || done;
  const remaining = shuffled.filter((i) => !picked.includes(i));
  const check = () => submit(picked.every((p, i) => p === block.items[i]));
  return (
    <View>
      <Prompt>{block.prompt}</Prompt>
      <Dim style={{ marginBottom: 8 }}>Tap items in the correct order.</Dim>
      {picked.map((p, i) => (
        <OptionButton
          key={p}
          text={`${i + 1}. ${p}`}
          state={finished ? (block.items[i] === p ? 'correct' : 'wrong') : 'selected'}
          disabled={finished}
          onPress={() => setPicked((s) => s.filter((x) => x !== p))}
        />
      ))}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
        {remaining.map((r) => (
          <Chip key={r} label={r} onPress={() => !finished && setPicked((s) => [...s, r])} />
        ))}
      </View>
      {!finished && picked.length === block.items.length && <Button label="Check order" onPress={check} />}
      {state === 'wrong-retry' && (
        <FeedbackBanner status="wrong" text="Not quite. Tap a placed item to remove it, then rebuild the order." />
      )}
      {finished && <FeedbackBanner status="correct" text={block.explain} />}
    </View>
  );
}

function MatchView({ block, onDone, done }: BlockProps<MatchBlock>) {
  const t = useTheme();
  const h = useHaptic();
  const lefts = block.pairs.map((p) => p.left);
  const rights = useMemo(
    () => seededShuffle(block.pairs.map((p) => p.right), hashString(block.id)),
    [block],
  );
  const [activeLeft, setActiveLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<Record<string, string>>({});
  const [misses, setMisses] = useState(0);
  const finished = done || Object.keys(matched).length === block.pairs.length;

  const tryMatch = (right: string) => {
    if (!activeLeft) return;
    const pair = block.pairs.find((p) => p.left === activeLeft);
    if (pair?.right === right) {
      h.success();
      const next = { ...matched, [activeLeft]: right };
      setMatched(next);
      setActiveLeft(null);
      if (Object.keys(next).length === block.pairs.length) {
        onDone({ correct: true, firstTry: misses === 0 });
      }
    } else {
      h.error();
      setMisses((m) => m + 1);
      setActiveLeft(null);
    }
  };

  return (
    <View>
      <Prompt>{block.prompt}</Prompt>
      <Dim style={{ marginBottom: 8 }}>Tap a term, then tap its meaning.</Dim>
      <Row style={{ alignItems: 'flex-start' }}>
        <View style={{ flex: 1, marginRight: 8 }}>
          {lefts.map((l) => (
            <Button
              key={l}
              label={l}
              small
              variant={matched[l] ? 'bull' : activeLeft === l ? 'primary' : 'secondary'}
              disabled={!!matched[l] || finished}
              onPress={() => setActiveLeft(l)}
              style={{ marginBottom: 8 }}
            />
          ))}
        </View>
        <View style={{ flex: 1.4 }}>
          {rights.map((r) => {
            const isMatched = Object.values(matched).includes(r);
            return (
              <Button
                key={r}
                label={r}
                small
                variant={isMatched ? 'bull' : 'secondary'}
                disabled={isMatched || finished || !activeLeft}
                onPress={() => tryMatch(r)}
                style={{ marginBottom: 8 }}
              />
            );
          })}
        </View>
      </Row>
      {misses > 0 && !finished && <Dim style={{ color: t.colors.warning }}>Misses: {misses}</Dim>}
      {finished && <FeedbackBanner status="correct" text={block.explain} />}
    </View>
  );
}

function TapPartView({ block, onDone, done }: BlockProps<TapPartBlock>) {
  const { state, submit } = useAttempts(onDone);
  const [sel, setSel] = useState<'body' | 'upperWick' | 'lowerWick' | null>(null);
  const finished = state === 'final' || done;
  return (
    <View>
      <Prompt>{block.prompt}</Prompt>
      <CandleAnatomy
        bullish={block.bullish}
        selected={sel}
        onPressPart={(p) => {
          if (finished) return;
          setSel(p);
          submit(p === block.part);
        }}
      />
      {state === 'wrong-retry' && <FeedbackBanner status="wrong" text="Not that part — try another area of the candle." />}
      {finished && <FeedbackBanner status={sel === block.part ? 'correct' : 'wrong'} text={block.explain} />}
    </View>
  );
}

function TapCandleView({ block, onDone, done }: BlockProps<TapCandleBlock>) {
  const { state, submit } = useAttempts(onDone);
  const pack = getPack(block.packId);
  const [sel, setSel] = useState<number | null>(null);
  const finished = state === 'final' || done;
  return (
    <View>
      <Prompt>{block.prompt}</Prompt>
      <CandleChart
        candles={pack.candles}
        visible={block.visible}
        pipSize={pack.pipSize}
        highlight={finished ? block.targetIndexes : []}
        onPressCandle={(i) => {
          if (finished) return;
          setSel(i);
          submit(block.targetIndexes.includes(i));
        }}
      />
      <Dim style={{ marginTop: 6 }}>Tap a candle on the chart.</Dim>
      {state === 'wrong-retry' && (
        <FeedbackBanner status="wrong" text={block.hint ? `Not that one. Hint: ${block.hint}` : 'Not that one — look again.'} />
      )}
      {finished && (
        <FeedbackBanner
          status={sel !== null && block.targetIndexes.includes(sel) ? 'correct' : 'wrong'}
          text={`${block.explain} The correct candles are highlighted.`}
        />
      )}
    </View>
  );
}

function NextCandleView({ block, onDone, done }: BlockProps<NextCandleBlock>) {
  const pack = getPack(block.packId);
  const [choice, setChoice] = useState<'up' | 'down' | null>(null);
  const h = useHaptic();
  const finished = done || choice !== null;
  const next = pack.candles[block.visible];
  const actual: 'up' | 'down' = next.c >= next.o ? 'up' : 'down';
  const pick = (c: 'up' | 'down') => {
    if (finished) return;
    setChoice(c);
    if (c === actual) h.success();
    else h.error();
    // Process note: a single candle is close to a coin flip; this exercise
    // teaches humility, so either answer completes the block "correctly"
    // for XP while mastery records the actual hit.
    onDone({ correct: c === actual, firstTry: c === actual });
  };
  return (
    <View>
      <Prompt>{block.prompt}</Prompt>
      <CandleChart candles={pack.candles} visible={finished ? block.visible + 1 : block.visible} pipSize={pack.pipSize} highlight={finished ? [block.visible] : []} />
      <Spacer />
      {!finished ? (
        <Row>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Button label="▲ Next closes up" variant="bull" onPress={() => pick('up')} />
          </View>
          <View style={{ flex: 1 }}>
            <Button label="▼ Next closes down" variant="bear" onPress={() => pick('down')} />
          </View>
        </Row>
      ) : (
        <FeedbackBanner
          status={choice === actual ? 'correct' : 'wrong'}
          text={`It closed ${actual === 'up' ? 'up' : 'down'}. ${block.explain}`}
        />
      )}
    </View>
  );
}

function ChartChoiceView({ block, onDone, done }: BlockProps<ChartChoiceBlock>) {
  const { state, submit } = useAttempts(onDone);
  const pack = getPack(block.packId);
  const [chosen, setChosen] = useState<number | null>(null);
  const finished = state === 'final' || done;
  return (
    <View>
      <Prompt>{block.prompt}</Prompt>
      <CandleChart candles={pack.candles} visible={block.visible} pipSize={pack.pipSize} lines={block.lines} />
      <Spacer h={3} />
      {block.options.map((o, i) => (
        <OptionButton
          key={i}
          text={o.text}
          disabled={finished}
          state={
            finished && i === block.correctIndex ? 'correct' : chosen === i && finished ? 'wrong' : chosen === i ? 'selected' : 'idle'
          }
          onPress={() => {
            setChosen(i);
            submit(i === block.correctIndex);
          }}
        />
      ))}
      {state === 'wrong-retry' && (
        <FeedbackBanner status="wrong" text={block.hint ? `Not quite. Hint: ${block.hint}` : 'Not quite — study the chart again.'} />
      )}
      {finished && <FeedbackBanner status={chosen === block.correctIndex ? 'correct' : 'wrong'} text={block.explain} />}
    </View>
  );
}

function ScenarioView({ block, onDone, done }: BlockProps<ScenarioBlock>) {
  const t = useTheme();
  const [chosen, setChosen] = useState<number | null>(null);
  const h = useHaptic();
  const finished = done || chosen !== null;
  return (
    <View>
      <View style={{ backgroundColor: t.colors.surfaceAlt, borderRadius: 12, padding: 14, marginBottom: 12 }}>
        <Dim style={{ fontWeight: '700', marginBottom: 4 }}>Scenario</Dim>
        <Body>{block.situation}</Body>
      </View>
      {block.options.map((o, i) => (
        <OptionButton
          key={i}
          text={o.text}
          disabled={finished}
          state={finished ? (o.quality === 'best' ? 'correct' : chosen === i ? 'wrong' : 'idle') : 'idle'}
          onPress={() => {
            setChosen(i);
            const q = block.options[i].quality;
            if (q === 'best') h.success();
            else h.error();
            onDone({ correct: q === 'best', firstTry: q === 'best', quality: q });
          }}
        />
      ))}
      {finished && chosen !== null && (
        <FeedbackBanner
          status={block.options[chosen].quality === 'best' ? 'correct' : 'wrong'}
          text={block.options[chosen].explain}
        />
      )}
    </View>
  );
}

function RRBuilderView({ block, onDone, done }: BlockProps<RRBuilderBlock>) {
  const t = useTheme();
  const [stopPips, setStopPips] = useState(block.initialStopPips);
  const [targetPips, setTargetPips] = useState(block.initialTargetPips);
  const [locked, setLocked] = useState(false);
  const h = useHaptic();
  const sign = block.direction === 'long' ? 1 : -1;
  const stop = block.entry - sign * stopPips * block.pipSize;
  const target = block.entry + sign * targetPips * block.pipSize;
  const ratio = rewardToRisk(block.entry, stop, target);
  const ok = ratio >= block.requiredRatio - 1e-9;
  const finished = done || locked;
  return (
    <View>
      <Prompt>{block.prompt}</Prompt>
      <RRDiagram entry={block.entry} stop={stop} target={target} direction={block.direction} pipSize={block.pipSize} />
      <Spacer h={3} />
      <Stepper label="Stop distance (pips)" value={stopPips} onChange={setStopPips} step={5} min={5} max={200} />
      <Stepper label="Target distance (pips)" value={targetPips} onChange={setTargetPips} step={5} min={5} max={400} />
      <Text
        accessibilityLiveRegion="polite"
        style={{ color: ok ? t.colors.bull : t.colors.textDim, fontWeight: '800', fontSize: 18, marginVertical: 8 }}
      >
        Reward-to-risk: 1:{ratio.toFixed(2)} {ok ? '✓' : `(need at least 1:${block.requiredRatio})`}
      </Text>
      {!finished && (
        <Button
          label="Lock in my levels"
          disabled={!ok}
          onPress={() => {
            setLocked(true);
            h.success();
            onDone({ correct: true, firstTry: true });
          }}
        />
      )}
      {finished && <FeedbackBanner status="correct" text={block.explain} />}
    </View>
  );
}

function ReflectionView({ block, onDone, done }: BlockProps<import('@/types/content').ReflectionBlock>) {
  const t = useTheme();
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);
  const finished = done || saved;
  return (
    <View>
      <Prompt>{block.prompt}</Prompt>
      <TextInput
        accessibilityLabel="Your reflection"
        value={text}
        onChangeText={setText}
        editable={!finished}
        multiline
        placeholder="Write a few honest sentences…"
        placeholderTextColor={t.colors.textFaint}
        style={{
          backgroundColor: t.colors.surfaceAlt,
          color: t.colors.text,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: t.colors.border,
          padding: 12,
          minHeight: 100,
          fontSize: 15,
          textAlignVertical: 'top',
        }}
      />
      <Spacer />
      {!finished && (
        <Button
          label="Save reflection"
          disabled={text.trim().length < 10}
          onPress={() => {
            setSaved(true);
            onDone({ correct: true, firstTry: true, text: text.trim() });
          }}
        />
      )}
      {finished && <FeedbackBanner status="correct" text="Saved to your notebook. Honest reflection is a trading skill." />}
    </View>
  );
}

export function BlockRenderer({ block, onDone, done }: BlockProps) {
  switch (block.kind) {
    case 'concept':
      return <ConceptView block={block} onDone={onDone} done={done} />;
    case 'mcq':
      return <McqView block={block} onDone={onDone} done={done} />;
    case 'multi':
      return <MultiView block={block} onDone={onDone} done={done} />;
    case 'truefalse':
      return <TrueFalseView block={block} onDone={onDone} done={done} />;
    case 'number':
      return <NumberView block={block} onDone={onDone} done={done} />;
    case 'order':
      return <OrderView block={block} onDone={onDone} done={done} />;
    case 'match':
      return <MatchView block={block} onDone={onDone} done={done} />;
    case 'tappart':
      return <TapPartView block={block} onDone={onDone} done={done} />;
    case 'tapcandle':
      return <TapCandleView block={block} onDone={onDone} done={done} />;
    case 'nextcandle':
      return <NextCandleView block={block} onDone={onDone} done={done} />;
    case 'chartchoice':
      return <ChartChoiceView block={block} onDone={onDone} done={done} />;
    case 'scenario':
      return <ScenarioView block={block} onDone={onDone} done={done} />;
    case 'rrbuilder':
      return <RRBuilderView block={block} onDone={onDone} done={done} />;
    case 'reflection':
      return <ReflectionView block={block} onDone={onDone} done={done} />;
  }
}
