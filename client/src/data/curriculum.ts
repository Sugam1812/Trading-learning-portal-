export interface Lesson {
  id: string
  title: string
  duration: string
  content: string
  keyPoints: string[]
}

export interface Module {
  id: string
  title: string
  description: string
  icon: string
  color: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  lessons: Lesson[]
}

export const curriculum: Module[] = [
  {
    id: 'module-1',
    title: 'Forex Foundations',
    description: 'Master the fundamentals of forex trading, currency pairs, and how the EUR/USD market works.',
    icon: '📊',
    color: '#3b82f6',
    difficulty: 'Beginner',
    lessons: [
      {
        id: 'lesson-1',
        title: 'What is Forex Trading?',
        duration: '8 min',
        keyPoints: ['Currency pairs explained', 'EUR/USD as the most liquid pair', 'Who trades forex and why', '24-hour market structure'],
        content: `# What is Forex Trading?

Forex (Foreign Exchange) is the **global marketplace for trading currencies**. It is the largest financial market in the world, with over **$7.5 trillion traded daily** — dwarfing the stock market.

## Why EUR/USD?

EUR/USD is the **most traded currency pair on earth**. It represents the exchange rate between the Euro (EU) and the US Dollar.

- When you **BUY** EUR/USD, you are buying Euros and selling Dollars (betting EUR strengthens)
- When you **SELL** EUR/USD, you are selling Euros and buying Dollars (betting EUR weakens)

## Who Moves the Market?

1. **Central Banks** (ECB, Federal Reserve) — biggest movers via interest rate decisions
2. **Commercial Banks** — JP Morgan, Goldman Sachs, etc.
3. **Hedge Funds & Institutions** — billions in daily flow
4. **Retail Traders** — that's us. We follow the smart money.

> "The market is not a casino. It is a battlefield where institutions hunt retail stop losses." — Professional Trader Principle

## The 24-Hour Market

| Session | UTC Time | Key Feature |
|---------|----------|-------------|
| Asian | 00:00 - 08:00 | Low volatility, range-bound |
| London | 08:00 - 17:00 | High volatility, trending |
| New York | 13:00 - 22:00 | High volatility, news driven |
| **Overlap** | **13:00-17:00** | **HIGHEST volume — best setups** |

<div class="key-rule">
🎯 Key Rule: Trade EUR/USD primarily during the London/NY overlap (13:00-17:00 UTC) for the best risk:reward setups.
</div>`,
      },
      {
        id: 'lesson-2',
        title: 'Pips, Lots & Leverage',
        duration: '10 min',
        keyPoints: ['What a pip is worth', 'Lot sizes explained', 'Leverage risks and benefits', 'Calculating your risk in dollars'],
        content: `# Pips, Lots & Leverage

Understanding these three concepts is **non-negotiable**. Getting them wrong costs real money.

## What is a Pip?

A **pip** (percentage in point) is the smallest price movement in a currency pair.

For EUR/USD:
- Price moves from **1.08500 to 1.08510** = **1 pip**
- Pips are measured at the **4th decimal place**

## Lot Sizes

| Lot Type | Size | Pip Value (EUR/USD) |
|----------|------|---------------------|
| Standard | 100,000 units | **$10/pip** |
| Mini | 10,000 units | $1/pip |
| Micro | 1,000 units | $0.10/pip |

## The Position Sizing Formula

\`\`\`
Lot Size = Risk Amount ÷ (Stop Loss Pips × Pip Value)
\`\`\`

**Example:**
- Account: $10,000
- Risk: 1% = $100
- Stop Loss: 20 pips
- Lot Size = $100 ÷ (20 × $10) = **0.5 lots**

## Leverage — The Double-Edged Sword

Leverage lets you control large positions with small capital. A broker offering **1:100 leverage** means you can control $100,000 with just $1,000.

<div class="warning">
⚠️ Warning: Leverage amplifies BOTH profits AND losses. Most retail traders blow their accounts because of overleveraging. Prop firms set strict rules to prevent this.
</div>

<div class="key-rule">
🎯 Prop Firm Rule: Never risk more than 1% per trade. With a $10,000 account that is exactly $100 maximum risk per trade.
</div>`,
      },
      {
        id: 'lesson-3',
        title: 'Reading Candlestick Charts',
        duration: '12 min',
        keyPoints: ['OHLC explained', 'Bullish vs bearish candles', 'Wicks and their meaning', 'Timeframe selection'],
        content: `# Reading Candlestick Charts

Every candle tells a story. Learning to read that story is your first real trading skill.

## The Anatomy of a Candle

Each candlestick shows **4 prices** for a time period:
- **O**pen — where price started
- **H**igh — highest price reached
- **L**ow — lowest price reached
- **C**lose — where price ended

\`\`\`
     │  ← Upper wick (rejection of high)
   ┌─┴─┐
   │   │  ← Body (open to close)
   └─┬─┘
     │  ← Lower wick (rejection of low)
\`\`\`

## Bullish vs Bearish

- **Green/Bullish candle**: Close > Open (buyers won)
- **Red/Bearish candle**: Close < Open (sellers won)

## What Wicks Tell You

Long wicks are one of the most important signals in trading:

- **Long upper wick** = Price tried to go higher but was rejected. Sellers are strong.
- **Long lower wick** = Price tried to go lower but was rejected. Buyers are strong.

## Choosing Your Timeframe

| Timeframe | Use Case |
|-----------|----------|
| **Daily (D1)** | Overall trend direction |
| **4 Hour (H4)** | Swing structure, key levels |
| **1 Hour (H1)** | Entry area refinement |
| **15 Min (M15)** | Precise entry trigger |

<div class="tip">
💡 Tip: Always start your analysis top-down. Daily → H4 → H1 → Entry. Never jump straight to the 5-minute chart.
</div>`,
      },
    ],
  },
  {
    id: 'module-2',
    title: 'Market Structure',
    description: 'Learn to read price action like a professional. Identify trends, ranges, and key turning points.',
    icon: '📈',
    color: '#00d4aa',
    difficulty: 'Beginner',
    lessons: [
      {
        id: 'lesson-1',
        title: 'Trends: Highs, Lows & Direction',
        duration: '10 min',
        keyPoints: ['Higher highs & higher lows = uptrend', 'Lower highs & lower lows = downtrend', 'Range-bound markets', 'Trend confirmation'],
        content: `# Trends: Reading Market Direction

The single most important concept in trading: **the trend is your friend**.

## Uptrend Structure

An uptrend is a series of **Higher Highs (HH) and Higher Lows (HL)**:

\`\`\`
        HH2
    HH1/
HL1/    HL2
\`\`\`

Price is making higher peaks and pulling back less each time. **Buy the dips in an uptrend.**

## Downtrend Structure

A downtrend is a series of **Lower Highs (LH) and Lower Lows (LL)**:

\`\`\`
LH1 LH2
   LL1  LL2
\`\`\`

**Sell the rallies in a downtrend.**

## The Break of Structure (BOS)

When price breaks a key high in an uptrend or key low in a downtrend, that's a **Break of Structure** — the most important signal for continuation.

## Change of Character (CHoCH)

When price **fails** to make a new high (in uptrend) or new low (in downtrend) and reverses through the last swing point — this signals a **potential reversal**.

<div class="tip">
💡 Professional Insight: 70% of the time, EUR/USD is in a range. Only 30% is trending. Knowing the difference saves you from most bad trades.
</div>

<div class="key-rule">
🎯 Rule: Never trade against the trend on the Daily timeframe. Use H1/M15 for entries in the direction of the D1 trend.
</div>`,
      },
      {
        id: 'lesson-2',
        title: 'Support & Resistance',
        duration: '12 min',
        keyPoints: ['How S&R levels form', 'Flipping from support to resistance', 'Round numbers as key levels', 'Zone vs exact level'],
        content: `# Support & Resistance

S&R are the backbone of technical analysis. Every professional trader uses them.

## What is Support?

A **support level** is a price area where buying pressure is historically strong enough to stop (or reverse) a decline.

- Price falls → hits support → bounces up
- Support is a **demand zone** — buyers step in here

## What is Resistance?

A **resistance level** is a price area where selling pressure overwhelms buying, halting or reversing a rise.

- Price rises → hits resistance → falls back
- Resistance is a **supply zone** — sellers step in here

## The Flip Principle

One of the most reliable patterns in all of trading:
> **Broken support becomes resistance. Broken resistance becomes support.**

When price breaks through a support level, that level often becomes new resistance — because traders who bought at support are now selling at breakeven.

## Key EUR/USD Levels to Know

Always mark these on your chart:
1. **Round numbers** — 1.0800, 1.0900, 1.1000 (massive psychological levels)
2. **Previous day High/Low** (PDH/PDL)
3. **Previous week High/Low** (PWH/PWL)
4. **Monthly open**

## Zones, Not Lines

S&R are **zones**, not exact prices. Draw a rectangle, not a line:

\`\`\`
─────────────────── ← Top of zone (1.0870)
   Resistance Zone
─────────────────── ← Bottom of zone (1.0855)
\`\`\`

<div class="tip">
💡 The more times a level has been tested, the more significant it is. A level tested 4+ times is a major level.
</div>`,
      },
      {
        id: 'lesson-3',
        title: 'Range Trading EUR/USD',
        duration: '10 min',
        keyPoints: ['Identifying range conditions', 'Buying at range lows', 'Selling at range highs', 'Range breakout signals'],
        content: `# Range Trading EUR/USD

Since EUR/USD is in a range 70% of the time, mastering range trading is highly profitable.

## Identifying a Range

A range exists when:
1. Price oscillates between two clear horizontal levels
2. No clear HH/HL or LH/LL pattern
3. Volume tends to be lower than during trends

## The Range Trading Strategy

**Step 1:** Identify clear support and resistance
**Step 2:** Wait for price to reach the extreme (top or bottom)
**Step 3:** Look for rejection candle (pin bar, engulfing)
**Step 4:** Enter with stop beyond the range extreme
**Step 5:** Target the opposite side of the range

## Key EUR/USD Range Times

- **Asian session** (00:00-08:00 UTC): Classic range environment
- Low volume = respect of levels = high probability range plays

## Breakout Warning Signs

Watch for range exhaustion:
- Multiple rejections of the same level (momentum building)
- Decreasing wick size (less rejection)
- Volume increasing on approach

<div class="warning">
⚠️ Don't trade ranges blindly. Always check the Daily timeframe first — if the Daily is trending strongly, ranges on H1 break more easily.
</div>`,
      },
    ],
  },
  {
    id: 'module-3',
    title: 'Candlestick Patterns',
    description: 'Master the key reversal and continuation patterns that work specifically on EUR/USD.',
    icon: '🕯️',
    color: '#f59e0b',
    difficulty: 'Beginner',
    lessons: [
      {
        id: 'lesson-1',
        title: 'Pin Bars & Wicks',
        duration: '10 min',
        keyPoints: ['Pin bar anatomy', 'Bullish pin bar at support', 'Bearish pin bar at resistance', 'Wick-to-body ratio rules'],
        content: `# Pin Bars & Wicks — The Most Reliable Signal

The **pin bar** (pinocchio bar) is arguably the single most powerful candlestick pattern in trading.

## What is a Pin Bar?

A pin bar has:
- A very **long wick** (at least 2x the body size)
- A very **small body**
- The long wick points in the direction of rejection

\`\`\`
Bearish Pin Bar:    Bullish Pin Bar:
     │                   ┌─┐
   ┌─┐                   │ │
   └─┘                   └─┘
                           │
\`\`\`

## Why Pin Bars Work

The long wick shows that price tried to move in one direction but was **aggressively rejected**. It tells you exactly where the market said "NO."

- **Long upper wick** at resistance = sellers slammed price back down
- **Long lower wick** at support = buyers defended the level strongly

## The EUR/USD Pin Bar Setup

For maximum probability:
1. Wait for price to reach a **key S&R level**
2. Look for a pin bar forming on **H1 or H4**
3. The wick must **pierce through** the level (liquidity grab)
4. Enter on the **break of the pin bar's body** (not the wick)
5. Stop: **beyond the tip of the wick** + 5 pips

<div class="key-rule">
🎯 This is one of the highest-probability setups in forex. A pin bar at a major EUR/USD level during the London session has a win rate above 60% when traded correctly.
</div>`,
      },
      {
        id: 'lesson-2',
        title: 'Engulfing Candles',
        duration: '8 min',
        keyPoints: ['Bullish engulfing pattern', 'Bearish engulfing pattern', 'Context is everything', 'Volume confirmation'],
        content: `# Engulfing Candles

The **engulfing pattern** is a powerful two-candle reversal signal.

## Bullish Engulfing

A large green candle that **completely engulfs** the previous red candle's body:
\`\`\`
Before:   ┌─┐     After forming: ┌───┐
          │ │ ← red              │   │ ← large green
          └─┘                    └───┘
\`\`\`

Signal: Strong buyers stepped in and overwhelmed sellers.

## Bearish Engulfing

A large red candle that completely engulfs the previous green candle:

Signal: Strong sellers absorbed all buying and drove price lower.

## Rules for Trading Engulfing Patterns

1. **Must be at a key level** (S&R, trend line, round number)
2. The engulfing candle must be **significantly larger** than the previous candle
3. Bigger bodies = stronger signal
4. Works best on **H1, H4, Daily** timeframes

## EUR/USD Example Setup

- Price reaches 1.0900 resistance (round number)
- Forms a small bullish candle (buyers attempting push higher)
- Next candle opens and drives down, engulfing previous candle fully
- **SELL** signal confirmed with target to next support

<div class="tip">
💡 Context matters more than the pattern itself. The same pattern at a random location is 50/50. At a key level, it shifts odds dramatically in your favor.
</div>`,
      },
      {
        id: 'lesson-3',
        title: 'Doji & Indecision Candles',
        duration: '8 min',
        keyPoints: ['Types of doji candles', 'What indecision means for your trade', 'Trading the doji in context', 'Avoid doji during news events'],
        content: `# Doji & Indecision Candles

A **Doji** forms when open and close are nearly equal — showing a battle between buyers and sellers with no winner.

## Types of Doji

**Classic Doji:** Equal wicks both sides — pure indecision
**Dragonfly Doji:** Long lower wick, no upper — buyers defended lows aggressively (bullish)
**Gravestone Doji:** Long upper wick, no lower — sellers rejected highs (bearish)
**Long-Legged Doji:** Very long wicks both sides — extreme indecision / volatility

## Trading Doji Patterns

A Doji alone means **nothing**. Context is everything:

- Doji at **support after downtrend** = potential reversal up
- Doji at **resistance after uptrend** = potential reversal down
- Doji in **middle of a range** = continue the range

## The Doji Confirmation Rule

NEVER trade a Doji alone. Always wait for the **next candle to confirm**:
- Doji at resistance → Next candle opens and moves down → SELL
- Doji at support → Next candle opens and moves up → BUY

<div class="warning">
⚠️ During major news events (NFP, FOMC, ECB), Doji candles form frequently due to volatility. These are NOT reliable setups — avoid trading them.
</div>`,
      },
    ],
  },
  {
    id: 'module-4',
    title: 'Risk Management',
    description: 'The difference between professional traders and gamblers. Master risk to survive long-term.',
    icon: '🛡️',
    color: '#ff4757',
    difficulty: 'Intermediate',
    lessons: [
      {
        id: 'lesson-1',
        title: 'The 1% Rule & Position Sizing',
        duration: '15 min',
        keyPoints: ['Why 1% risk saves accounts', 'Position sizing formula', 'Lot size calculator', 'Scaling with account growth'],
        content: `# The 1% Rule — Your Most Important Trading Rule

This single rule separates traders who survive from traders who blow up. It is not optional.

## The Core Rule

> **Never risk more than 1-2% of your account on any single trade.**

On a $10,000 account:
- 1% risk = $100 maximum loss per trade
- 2% risk = $200 maximum loss per trade

## Why This Rule Exists

With 1% risk, you need **100 consecutive losing trades** to blow your account.
With 10% risk, you need only **10 consecutive losing trades**.

Even the best traders in the world have losing streaks of 10+ trades. The 1% rule keeps you in the game.

## Position Sizing Formula

\`\`\`
Lot Size = Risk Amount ÷ (SL Pips × $10)

Example:
- Account: $10,000
- Risk: 1% = $100
- Stop Loss: 20 pips
- Lot Size = $100 ÷ (20 × $10) = 0.5 lots
\`\`\`

## Risk:Reward Minimum

Never enter a trade with less than **1:1.5 R:R**. Professional traders target **1:2 or better**.

| Risk | Reward Target | Win Rate Needed to Break Even |
|------|--------------|-------------------------------|
| 1:1 | 1:1 | 50% |
| 1:2 | 1:2 | 33% |
| 1:3 | 1:3 | 25% |

<div class="key-rule">
🎯 FTMO & most prop firms fail traders who take oversized risks. Keep risk at 0.5-1% per trade when in a challenge.
</div>`,
      },
      {
        id: 'lesson-2',
        title: 'Stop Loss Placement',
        duration: '12 min',
        keyPoints: ['Structure-based stops', 'Volatility-based stops', 'Never move stops against you', 'Stop hunting awareness'],
        content: `# Stop Loss Placement — Science, Not Guessing

A stop loss is not just risk management — it tells you where your trade idea is WRONG.

## The Golden Rule of Stop Loss

> **Place your stop where the market would DISPROVE your trade idea, not where you can afford to lose.**

## Structure-Based Stops (Best Method)

Place stops **beyond key structural levels**:

- **BUY trade**: Stop below the recent significant swing low (+ 5-10 pip buffer)
- **SELL trade**: Stop above the recent significant swing high (+ 5-10 pip buffer)

Why? If price breaks that structure, your trade thesis is invalidated.

## Common Stop Placement Mistakes

1. **Round number stops** — e.g., exactly at 1.0800. Pros know retail places stops here and hunt them.
2. **Too tight** — noise will stop you out before the move happens
3. **Moving stop against you** — never turn a 20-pip loss into a 50-pip loss by moving the stop

## Stop Hunting — Know the Enemy

Large institutions deliberately push price through obvious stop levels to:
1. Fill their large orders at better prices
2. Create liquidity for their positions

This is why EUR/USD often spikes through a level and immediately reverses — that spike was a stop hunt.

<div class="tip">
💡 Pro Tip: Place stops 5-10 pips BEYOND the obvious level, not at it. This protects against stop hunts while keeping risk defined.
</div>

<div class="key-rule">
🎯 Once placed, NEVER move your stop loss further away from entry. Moving a stop wider is a sign of emotional trading.
</div>`,
      },
      {
        id: 'lesson-3',
        title: 'Take Profit Strategies',
        duration: '10 min',
        keyPoints: ['Fixed R:R targets', 'Structure-based targets', 'Partial profit taking', 'Trailing stops'],
        content: `# Take Profit Strategies

Knowing WHERE to exit is just as important as knowing when to enter.

## Method 1: Fixed R:R Targets

Set take profit at a predetermined multiple of your risk:
- Risk: 20 pips → Target: 40 pips (1:2 R:R)
- Risk: 15 pips → Target: 45 pips (1:3 R:R)

**Pros:** Simple, consistent, no emotion involved
**Cons:** Sometimes exits before a bigger move

## Method 2: Structure-Based Targets

Target the next significant S&R level:
- BUY: Next resistance zone above entry
- SELL: Next support zone below entry

**Pros:** More realistic, respects how price actually moves
**Cons:** Requires more skill to identify levels accurately

## Method 3: Partial Profit Taking

Close 50% of position at 1:1 R:R, let the rest run:
1. Enter 1 lot, risk 20 pips
2. Close 0.5 lots at +20 pips (covers original risk)
3. Move stop to breakeven on remaining 0.5 lots
4. Target +60 pips for the rest

This strategy **eliminates the possibility of a full loss** once 1:1 is reached.

## Trailing Stops

A trailing stop moves with price as it goes in your favor:
- Set initial trail at 20 pips
- If price moves 30 pips in your favor, stop moves up 30 pips
- Locks in profit while letting winners run

<div class="tip">
💡 For prop firm challenges: Use fixed R:R of 1:2 minimum. Consistency matters more than maximizing every trade.
</div>`,
      },
    ],
  },
  {
    id: 'module-5',
    title: 'Trading Psychology',
    description: 'Your mindset determines your results. Master the mental game that destroys most traders.',
    icon: '🧠',
    color: '#a855f7',
    difficulty: 'Intermediate',
    lessons: [
      {
        id: 'lesson-1',
        title: 'FOMO & Revenge Trading',
        duration: '12 min',
        keyPoints: ['Recognizing FOMO in real-time', 'The revenge trading spiral', 'How to break the cycle', 'Pre-trade checklist'],
        content: `# FOMO & Revenge Trading — The Account Killers

These two psychological traps destroy more trading accounts than any market condition.

## FOMO — Fear Of Missing Out

FOMO happens when:
- You see EUR/USD moving 50 pips without you
- You chase price after the move has already happened
- You enter at the worst possible price

**The FOMO Trade Looks Like:**
> "EUR/USD just broke 1.0900! It's going to 1.1000! I need to buy NOW!"

The result: You buy at the top. Price reverses 40 pips. You're stopped out.

## The Anti-FOMO Framework

1. **Accept that you will miss moves** — there will ALWAYS be another setup
2. **Only enter at pre-planned levels** — no setup = no trade
3. **Watch price reach your level, then evaluate** — never react, always respond
4. **Keep a "missed opportunities" log** — you'll see most were actually traps

## Revenge Trading

After a loss, the emotional brain says: *"Get it back. Trade bigger. Trade NOW."*

This is **the single most destructive impulse in trading.**

Revenge trading patterns:
- Doubling position size after a loss
- Entering immediately after being stopped out
- Abandoning your strategy and trading randomly

## Breaking the Revenge Cycle

Rule: **After 2 consecutive losses, stop trading for the rest of the day. No exceptions.**

<div class="warning">
⚠️ Prop Firm Reality: Revenge trading is the #1 reason traders fail challenges. Two trades going wrong turns into 10 trades trying to recover, triggering the daily loss limit.
</div>`,
      },
      {
        id: 'lesson-2',
        title: 'Discipline & Process',
        duration: '10 min',
        keyPoints: ['Trading as a process not outcome', 'Building consistent habits', 'Pre/post trade routines', 'Journaling for improvement'],
        content: `# Discipline & Process — Think Like a Professional

Professional traders are not great because they are smarter. They are great because they are **more disciplined**.

## Outcome vs. Process Thinking

Amateur mindset: *"Did I make money today?"*
Professional mindset: *"Did I execute my plan correctly today?"*

A trade can follow all the rules and still lose. A trade can break all the rules and still win. **Short-term results are random. Long-term results reflect your process.**

## The Professional Trading Day

**Pre-Market (30 minutes before trading):**
- Review Daily and H4 chart
- Mark key levels for the day
- Write your trading plan
- Set alerts, not orders

**During Market:**
- Execute only the plan, nothing else
- One setup at a time
- Keep position sizing consistent

**Post-Market:**
- Review every trade taken
- Journal your emotions and decisions
- Identify improvements
- Grade your discipline (not your P&L)

## Building the Discipline Muscle

Discipline is a habit built through repetition:
1. Follow your rules for 1 trade → becomes 10 trades → becomes automatic
2. Every time you deviate, you reinforce bad habits
3. Every time you follow the plan, you reinforce good habits

<div class="key-rule">
🎯 Commit to this: Judge your trading week by your discipline score, not your profit. Profitable traders follow rules. Results follow discipline.
</div>`,
      },
    ],
  },
  {
    id: 'module-6',
    title: 'Prop Firm Trading',
    description: 'Everything you need to pass FTMO, MyForexFunds, and other prop firm challenges.',
    icon: '🏆',
    color: '#f59e0b',
    difficulty: 'Intermediate',
    lessons: [
      {
        id: 'lesson-1',
        title: 'Understanding Prop Firm Rules',
        duration: '15 min',
        keyPoints: ['Daily loss limit explained', 'Maximum drawdown rules', 'Profit targets', 'Trading day requirements'],
        content: `# Prop Firm Rules — The Rulebook That Pays You

Prop firms give you their capital to trade. In return, they set strict rules. Break them and you lose the account. Follow them and you get paid.

## The Standard Challenge Rules (FTMO-Style)

| Rule | Limit |
|------|-------|
| **Profit Target** | 10% of account |
| **Max Daily Loss** | 5% of account |
| **Max Overall Drawdown** | 10% of account |
| **Minimum Trading Days** | 4-10 days |

## Daily Loss Limit — The Most Critical Rule

On a $10,000 account:
- Max Daily Loss = **$500** (5%)
- If your floating + realized losses hit $500 today → STOP IMMEDIATELY

This rule resets every day at server time (typically midnight NY time).

## The Drawdown Trap

Overall drawdown includes **both open floating losses AND closed losses**:

- Starting Balance: $10,000
- Max Drawdown Limit: $9,000 (10% below start)
- If your account equity (balance + floating P&L) drops to $9,000 → account failed

<div class="warning">
⚠️ Critical: If you have 2-3 losing days early in the challenge, you may only have $200-300 of daily loss room left. At this point, trade with 0.25-0.5% risk, not 1%.
</div>

## Strategy for Passing

1. **Days 1-5:** 0.5% risk per trade. Build slowly.
2. **If up 5%:** Continue at 1% risk toward target
3. **If down 3%:** Drop to 0.25% risk. Protect the account.
4. **Never try to "make up" losses in one session**

<div class="key-rule">
🎯 The best prop traders are not the most aggressive traders. They are the most disciplined ones who never break the rules.
</div>`,
      },
      {
        id: 'lesson-2',
        title: 'Prop Firm Strategy Blueprint',
        duration: '15 min',
        keyPoints: ['Low-risk challenge approach', 'Scaling your risk appropriately', 'News trading rules', 'The consistent day model'],
        content: `# Prop Firm Strategy Blueprint

Here is the exact framework used by traders who consistently pass challenges.

## The 10-Day Challenge Model

Target: 10% profit in 30 days (minimum 4 trading days)

**Daily Target:** 1% per day (compound slowly)

| Day | Risk Per Trade | Daily Target |
|-----|----------------|--------------|
| 1-3 | 0.5% | 0.5-1% profit |
| 4-7 | 1% | 1% profit |
| 8-10 | 1% | Reach 10% total |

## The 3-Trade-Per-Day Rule

Limit yourself to **3 high-quality trades per day maximum**. This forces selectivity.

Setup Quality Checklist (all 3 must be YES):
- [ ] In direction of Daily/H4 trend?
- [ ] At a key S&R level?
- [ ] Has clear entry trigger (pattern)?
- [ ] R:R is minimum 1:2?
- [ ] Not within 30 min of major news?

## News Trading Rules

EUR/USD is highly sensitive to news. During these events, DO NOT TRADE:
- **ECB Rate Decision** (every 6 weeks)
- **US Non-Farm Payrolls** (first Friday of month)
- **FOMC Rate Decision** (8x per year)
- **US CPI/PPI data**
- **Any "High Impact" news** (orange/red on forex factory)

Check ForexFactory.com every morning. Mark news times on your chart.

## The Consistency Model

Many prop firms now require you to earn profits on **more than 2 trading days** to qualify for payouts.

**Goal:** Small, consistent gains over many days — NOT one big day.

<div class="key-rule">
🎯 Think of the challenge like a 10-day sprint marathon. Pace yourself. The winner is not the fastest on day 1 — it's who's still running on day 10.
</div>`,
      },
    ],
  },
  {
    id: 'module-7',
    title: 'EUR/USD Strategies',
    description: 'Proven, specific trading strategies for EUR/USD based on sessions, levels, and patterns.',
    icon: '⚡',
    color: '#3b82f6',
    difficulty: 'Advanced',
    lessons: [
      {
        id: 'lesson-1',
        title: 'London Open Strategy',
        duration: '15 min',
        keyPoints: ['Asian range identification', 'London open breakout', 'Entry timing', 'Managing the trade'],
        content: `# London Open Strategy — The Most Consistent EUR/USD Setup

The London open is the most predictable event in EUR/USD trading. Here's how to trade it.

## Setup Logic

During the Asian session (00:00-07:00 UTC), EUR/USD typically:
- Trades in a narrow range (30-50 pips)
- Lacks direction and volume
- Accumulates orders at both extremes

At 07:00-09:00 UTC (London open), large institutional players arrive and:
- Create a directional move
- Often break through the Asian range
- Set the tone for the European session

## Step-by-Step Setup

**Step 1:** Identify the Asian session high and low (use the last 6-8 hours before 07:00 UTC)

**Step 2:** Mark these levels on your H1 chart with horizontal lines

**Step 3:** At 07:00 UTC, watch for price to approach and break one of these levels

**Step 4:** Confirm the breakout with:
- A strong engulfing/pin bar candle
- Volume (if visible)
- Alignment with Daily trend direction

**Step 5:** Enter on the retest of the broken level (wait for it to come back and hold)

**Entry:** On retest of broken Asian range level
**Stop:** Beyond the opposite side of the Asian range
**Target:** 2x the Asian range width (minimum)

<div class="tip">
💡 Best days: Monday (after weekend gap positioning) and Wednesday/Thursday (typically more directional after Tuesday accumulation)
</div>`,
      },
      {
        id: 'lesson-2',
        title: 'Smart Money Concepts',
        duration: '18 min',
        keyPoints: ['Liquidity pools', 'Fair Value Gaps (FVG)', 'Order blocks', 'Institutional entry zones'],
        content: `# Smart Money Concepts for EUR/USD

Smart Money Concepts (SMC) is how institutions actually move markets. Understanding this gives you an edge.

## Liquidity — Where Stops Live

Retail traders place stops in predictable places:
- Above swing highs (buy stop orders)
- Below swing lows (sell stop orders)
- At round numbers (1.0800, 1.0850, 1.0900)

Institutions NEED liquidity to fill large orders. So they push price to these zones, trigger the stops (creating liquidity), then reverse.

**This is why the market often overshoots obvious levels before reversing.**

## Order Blocks

An **order block** is the last significant candle before a large impulsive move. It represents where large institutions placed their orders.

Identifying a bullish order block:
1. Find a strong bullish impulse move up
2. Look at the last bearish (red) candle before the impulse
3. That candle's zone is the order block
4. When price returns to that zone → high-probability buy

## Fair Value Gaps (FVG / Imbalance)

When price moves so fast that it creates a gap between candles:
- Gap between Candle 1's high and Candle 3's low (in a rally)
- Price tends to come back to "fill" this gap
- Use these gaps as entry zones

## The SMC Trade Setup

1. Identify overall trend (Daily BOS)
2. Find a liquidity sweep (stop hunt) against the trend
3. Look for reversal at key level (order block or FVG)
4. Enter in direction of overall trend
5. Target: Next liquidity pool (opposite side)

<div class="key-rule">
🎯 This is advanced material. Practice identifying these structures on your chart for 30 days before trading them live.
</div>`,
      },
    ],
  },
  {
    id: 'module-8',
    title: 'Trade Management',
    description: 'How to manage trades from entry to exit — the skill that separates good traders from great ones.',
    icon: '⚙️',
    color: '#00d4aa',
    difficulty: 'Advanced',
    lessons: [
      {
        id: 'lesson-1',
        title: 'Entry Types & Timing',
        duration: '12 min',
        keyPoints: ['Market orders vs limit orders', 'Waiting for candle close', 'Entry on retest', 'Scaling into positions'],
        content: `# Entry Types & Timing

How you enter a trade is almost as important as which direction you choose.

## Market Order

Executes immediately at the current price. Use when:
- Price is moving fast and you need to be in NOW
- Breakout confirmation is clear

Disadvantage: Poor fill price in fast markets (slippage).

## Limit Order

Executes at a specific price you set in advance. Use when:
- Waiting for a retest of a broken level
- You've identified an exact entry zone
- You don't want to watch the screen constantly

The professional approach: **Set limit orders at your entry zone and walk away.**

## The Retest Entry (Highest Probability)

Instead of entering on the initial break:
1. Wait for price to break above resistance
2. Wait for price to pull back to that resistance (now support)
3. Enter when price bounces from the retest
4. Stop below the retest low

This gives you:
- Better entry price
- Tighter stop loss
- Confirmation the level held
- Higher probability setup

## Timing Rules

- Wait for the **H1 candle to close** before entering (don't react to wicks)
- Best entry time: **First 2 hours of London session** or **London/NY overlap**
- Avoid entering 30 minutes before news

<div class="tip">
💡 The best trades often look boring and slow when you enter. Fast, exciting entries are usually the wrong ones.
</div>`,
      },
    ],
  },
  {
    id: 'module-9',
    title: 'Advanced Analysis',
    description: 'Multi-timeframe analysis, institutional order flow, and advanced EUR/USD concepts.',
    icon: '🔬',
    color: '#a855f7',
    difficulty: 'Advanced',
    lessons: [
      {
        id: 'lesson-1',
        title: 'Multi-Timeframe Analysis',
        duration: '15 min',
        keyPoints: ['Top-down analysis framework', 'Aligning timeframes', 'Conflicting signals', 'Patience between setups'],
        content: `# Multi-Timeframe Analysis — The Professional Framework

Trading one timeframe is like navigating with one eye closed. MTF analysis gives you the full picture.

## The Top-Down Framework

Always analyze in this order:

**1. Monthly Chart (Context)**
- Major trend direction
- Major S&R levels
- Are we in a bullish or bearish market structure?

**2. Weekly Chart (Bias)**
- Weekly trend confirmation
- Weekly S&R levels
- Where is price in the weekly range?

**3. Daily Chart (Direction)**
- Current daily bias (bull or bear)
- Key daily levels to watch
- Recent BOS or CHoCH

**4. H4 Chart (Zone Identification)**
- Entry zone identification
- Smaller structure within daily move
- Refinement of the trade thesis

**5. H1 Chart (Entry Timing)**
- Exact entry trigger
- Pattern confirmation (pin bar, engulfing)
- Final stop placement

## The Alignment Rule

**Only trade when ALL higher timeframes agree with your direction.**

Example of aligned setup:
- Monthly: Uptrend
- Weekly: Pulling back to support
- Daily: BOS to the upside
- H4: Price at demand zone
- H1: Bullish pin bar forming
→ This is a high-probability BUY setup

## When Timeframes Conflict

If D1 is bullish but H4 is bearish → **Step aside. No trade.**

<div class="key-rule">
🎯 Professional Rule: If you need to convince yourself a trade is good, it isn't. The best setups are obvious.
</div>`,
      },
    ],
  },
  {
    id: 'module-10',
    title: 'Becoming Consistent',
    description: 'The final module: building the habits, systems, and mindset for long-term profitable trading.',
    icon: '🌟',
    color: '#f59e0b',
    difficulty: 'Advanced',
    lessons: [
      {
        id: 'lesson-1',
        title: 'The Consistent Trader System',
        duration: '20 min',
        keyPoints: ['Weekly review process', 'Performance metrics that matter', 'Scaling from demo to live', 'Long-term growth framework'],
        content: `# The Consistent Trader System

You've learned the theory. Now it's about execution over time.

## The Weekly Review Process

Every Sunday, spend 30 minutes reviewing the week:

**Trade Analysis:**
- How many trades taken?
- Win rate this week?
- Did every trade follow the rules?
- What was the average R:R?

**Psychology Review:**
- Any FOMO trades?
- Any revenge trades?
- Did you stick to position sizing rules?
- How was your emotional state?

**Market Review:**
- What did EUR/USD do this week?
- What were the key levels that held?
- Any setups you missed? Why?

## Metrics That Actually Matter

STOP focusing on P&L. START focusing on:

| Metric | Target |
|--------|--------|
| Rule Adherence | 95%+ |
| Average R:R | 1:2+ |
| Max Risk Per Trade | ≤1% |
| Win Rate | 45%+ |
| Profit Factor | 1.5+ |

## The Path from Demo to Live

**Phase 1: Demo (2-3 months)**
→ Prove you can follow rules consistently

**Phase 2: Prop Firm Challenge ($5k-$10k)**
→ Prove you can trade with stakes

**Phase 3: Funded Account**
→ Scale slowly, withdraw regularly

**Phase 4: Multiple Accounts**
→ Build passive income stream

## Your Final Commitment

Trading is a marathon. Most people quit in the first 3 months when they hit their first drawdown. The traders who stay, review, improve, and remain disciplined are the ones who succeed.

<div class="key-rule">
🎯 Commit to 6 months of disciplined practice before judging if you can trade. Any less and you're judging the game before you've learned the rules.
</div>`,
      },
    ],
  },
]
