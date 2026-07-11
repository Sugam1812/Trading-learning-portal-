/** Data-driven curriculum types. All lesson content is data, never hard-coded in screens. */

export type SkillId =
  | 'terminology'
  | 'candles'
  | 'structure'
  | 'levels'
  | 'risk'
  | 'math'
  | 'execution'
  | 'psychology'
  | 'strategy'
  | 'backtesting';

export const SKILL_LABELS: Record<SkillId, string> = {
  terminology: 'Terminology',
  candles: 'Candlesticks',
  structure: 'Market Structure',
  levels: 'Support & Resistance',
  risk: 'Risk Management',
  math: 'Trading Math',
  execution: 'Orders & Execution',
  psychology: 'Psychology',
  strategy: 'Strategy Rules',
  backtesting: 'Backtesting',
};

export interface PriceLine {
  price: number;
  label?: string;
  color?: 'bull' | 'bear' | 'neutral' | 'accent';
  dashed?: boolean;
}

/** Declarative chart figure that a concept block can show. */
export interface ChartFigure {
  packId: string;
  /** How many candles are visible. Omit = all. */
  visible?: number;
  lines?: PriceLine[];
  /** Simple-moving-average overlays drawn on closes. */
  sma?: { period: number; color?: 'gold' | 'info' }[];
  caption?: string;
}

interface BaseBlock {
  id: string;
  skill: SkillId;
}

/** Short story-style explanation. The only block without a learner action. */
export interface ConceptBlock extends BaseBlock {
  kind: 'concept';
  title: string;
  body: string;
  bullets?: string[];
  example?: string;
  mistake?: string;
  figure?: ChartFigure;
}

export interface McqOption {
  text: string;
  explain?: string;
}

export interface McqBlock extends BaseBlock {
  kind: 'mcq';
  prompt: string;
  options: McqOption[];
  correctIndex: number;
  hint?: string;
  explain: string;
  figure?: ChartFigure;
}

export interface MultiSelectBlock extends BaseBlock {
  kind: 'multi';
  prompt: string;
  options: McqOption[];
  correctIndexes: number[];
  hint?: string;
  explain: string;
}

export interface TrueFalseBlock extends BaseBlock {
  kind: 'truefalse';
  statement: string;
  answer: boolean;
  explain: string;
}

export interface NumberInputBlock extends BaseBlock {
  kind: 'number';
  prompt: string;
  answer: number;
  /** Accepted absolute deviation, defaults to 0. */
  tolerance?: number;
  unit?: string;
  hint?: string;
  explain: string;
}

/** Learner re-orders shuffled items into the correct sequence. */
export interface OrderBlock extends BaseBlock {
  kind: 'order';
  prompt: string;
  items: string[];
  explain: string;
}

/** Learner matches left/right pairs by tapping. */
export interface MatchBlock extends BaseBlock {
  kind: 'match';
  prompt: string;
  pairs: { left: string; right: string }[];
  explain: string;
}

/** Tap the correct part of a candlestick (anatomy exercise). */
export interface TapPartBlock extends BaseBlock {
  kind: 'tappart';
  prompt: string;
  part: 'body' | 'upperWick' | 'lowerWick';
  bullish: boolean;
  explain: string;
}

/** Tap the correct candle(s) on a chart (hotspot exercise). */
export interface TapCandleBlock extends BaseBlock {
  kind: 'tapcandle';
  prompt: string;
  packId: string;
  visible?: number;
  /** Any of these indexes counts as correct. */
  targetIndexes: number[];
  hint?: string;
  explain: string;
}

/** Predict the direction of the next candle, then reveal it. */
export interface NextCandleBlock extends BaseBlock {
  kind: 'nextcandle';
  prompt: string;
  packId: string;
  visible: number;
  explain: string;
}

/** Chart shown, multiple-choice decision. */
export interface ChartChoiceBlock extends BaseBlock {
  kind: 'chartchoice';
  prompt: string;
  packId: string;
  visible?: number;
  lines?: PriceLine[];
  options: McqOption[];
  correctIndex: number;
  hint?: string;
  explain: string;
}

export interface ScenarioOption {
  text: string;
  quality: 'best' | 'ok' | 'poor';
  explain: string;
}

/** Psychology / decision scenario. Scored on process, not outcome. */
export interface ScenarioBlock extends BaseBlock {
  kind: 'scenario';
  situation: string;
  options: ScenarioOption[];
}

/** Interactive reward-to-risk builder: drag stop and target, hit the ratio. */
export interface RRBuilderBlock extends BaseBlock {
  kind: 'rrbuilder';
  prompt: string;
  direction: 'long' | 'short';
  entry: number;
  pipSize: number;
  initialStopPips: number;
  initialTargetPips: number;
  requiredRatio: number;
  explain: string;
}

/** Free-text reflection. Always accepted, saved to the learner's notebook. */
export interface ReflectionBlock extends BaseBlock {
  kind: 'reflection';
  prompt: string;
}

export type LessonBlock =
  | ConceptBlock
  | McqBlock
  | MultiSelectBlock
  | TrueFalseBlock
  | NumberInputBlock
  | OrderBlock
  | MatchBlock
  | TapPartBlock
  | TapCandleBlock
  | NextCandleBlock
  | ChartChoiceBlock
  | ScenarioBlock
  | RRBuilderBlock
  | ReflectionBlock;

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  objective: string;
  xp: number;
  blocks: LessonBlock[];
}

export interface Module {
  id: string;
  order: number;
  world: string;
  title: string;
  tagline: string;
  icon: string;
  skills: SkillId[];
  lessonIds: string[];
  /** Module that must be completed first. */
  prereq?: string;
}

export interface GlossaryEntry {
  id: string;
  term: string;
  plain: string;
  example?: string;
}

export type ChallengeMode =
  | 'trend'
  | 'structure'
  | 'levels'
  | 'breakout'
  | 'decision'
  | 'risk';

export interface ChartChallenge {
  id: string;
  title: string;
  mode: ChallengeMode;
  difficulty: 1 | 2 | 3;
  packId: string;
  visible: number;
  lines?: PriceLine[];
  question: string;
  options: ScenarioOption[];
  skill: SkillId;
  /** Reveal explanation shown with the future candles. */
  reveal: string;
}
