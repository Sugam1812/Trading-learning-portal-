import Anthropic from '@anthropic-ai/sdk';

let client = null;
function getClient() {
  if (!client && process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_anthropic_api_key_here') {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

const SYSTEM_PROMPT = `You are an elite forex trading mentor specializing in EUR/USD and prop firm trading with 15+ years of experience. You train traders to pass FTMO, MyForexFunds, and similar challenges.

Your expertise: price action, market structure, risk management (never risk >1-2%), trading psychology, EUR/USD-specific patterns, London and NY session strategies, prop firm rules.

Teaching style: Practical, direct, use real EUR/USD examples with specific price levels. Always emphasize discipline and risk management. Identify and correct bad habits immediately. Keep responses under 300 words unless analyzing a trade. Always sign off as "— Mentor"`;

export async function askMentor(userMessage, conversationHistory = []) {
  const ai = getClient();
  if (!ai) return getFallbackResponse(userMessage);
  const messages = [...conversationHistory.slice(-10), { role: 'user', content: userMessage }];
  const response = await ai.messages.create({ model: 'claude-sonnet-4-6', max_tokens: 1024, system: SYSTEM_PROMPT, messages });
  return { content: response.content[0].text, source: 'ai' };
}

export async function analyzeTradeJournal(tradeData, journalEntry) {
  const ai = getClient();
  const prompt = `Analyze this EUR/USD trade:
TRADE: ${tradeData.direction?.toUpperCase()} Entry:${tradeData.entry_price} SL:${tradeData.stop_loss} TP:${tradeData.take_profit} Result:${tradeData.pnl ? `$${tradeData.pnl.toFixed(2)}` : 'Open'} Risk:${tradeData.risk_percent}%
JOURNAL: Emotions before: ${journalEntry.emotions_before || 'not logged'} | After: ${journalEntry.emotions_after || 'not logged'} | Lessons: ${journalEntry.lessons_learned || 'none'}
Provide: 1) Trade quality 1-10, 2) Risk management eval, 3) Psychology patterns, 4) What went well, 5) Improvements, 6) Action steps`;
  if (!ai) return { feedback: `Trade logged. Risk: ${tradeData.risk_percent}% — ${tradeData.risk_percent <= 1 ? '✅ Good' : '⚠️ High'}. Add Anthropic API key for full AI analysis. — Mentor`, source: 'fallback' };
  const response = await ai.messages.create({ model: 'claude-sonnet-4-6', max_tokens: 800, system: SYSTEM_PROMPT, messages: [{ role: 'user', content: prompt }] });
  return { feedback: response.content[0].text, source: 'ai' };
}

export async function getMistakePatterns(trades) {
  const ai = getClient();
  const summary = trades.slice(-20).map((t) => ({ direction: t.direction, result: t.pnl > 0 ? 'win' : 'loss', pips: t.pips?.toFixed(1), session: t.session, mistakes: t.mistakes }));
  if (!ai) return { analysis: 'Add your Anthropic API key for AI-powered pattern analysis.', source: 'placeholder' };
  const response = await ai.messages.create({ model: 'claude-sonnet-4-6', max_tokens: 800, system: SYSTEM_PROMPT, messages: [{ role: 'user', content: `Analyze these ${summary.length} EUR/USD trades for mistake patterns:\n${JSON.stringify(summary, null, 2)}` }] });
  return { analysis: response.content[0].text, source: 'ai' };
}

function getFallbackResponse(message) {
  const lower = message.toLowerCase();
  if (lower.includes('risk') || lower.includes('position')) {
    return { content: `**Risk Management Framework**\n\n1. **Max 1% risk per trade** — on $10k = $100 max loss\n2. **Minimum 1:2 R:R** — 20 pip stop = 40 pip target minimum\n3. **Stop behind structure** — not at round numbers\n4. **Daily loss limit** — lose 2%? Stop trading for the day\n\nThe math works: 50% win rate + 1:2 R:R = profitable. Focus on discipline.\n\n— Mentor`, source: 'fallback' };
  }
  if (lower.includes('entry') || lower.includes('setup') || lower.includes('signal')) {
    return { content: `**EUR/USD Entry Framework**\n\nWait for all 3 to align:\n1. **Higher TF bias** — Daily/H4 trend direction\n2. **Key level** — S/R, supply/demand zone, round number\n3. **Entry trigger** — Pin bar, engulfing, or break of structure\n\n**Best time:** London/NY overlap (13:00-17:00 UTC)\n\nNever chase. The next setup is always coming.\n\n— Mentor`, source: 'fallback' };
  }
  if (lower.includes('psychology') || lower.includes('emotion') || lower.includes('loss')) {
    return { content: `**Trading Psychology**\n\nAfter a loss:\n1. Step away for 15 minutes\n2. Review: was the trade planned? Was risk correct?\n3. If yes — it was a good trade with a bad result. Move on.\n4. After 2 losses in a day — **stop trading**. Come back tomorrow.\n\nRevenge trading turns $100 losses into $500 losses. Discipline is your edge.\n\n— Mentor`, source: 'fallback' };
  }
  return { content: `I'm your EUR/USD trading mentor. I can help with:\n\n- **Trade setups** and analysis\n- **Risk management** and position sizing\n- **Psychology** — FOMO, revenge trading, discipline\n- **Prop firm strategy** — passing FTMO challenges\n- **EUR/USD specifics** — sessions, patterns, levels\n\nAdd your ANTHROPIC_API_KEY for full Claude AI responses. What do you want to work on?\n\n— Mentor`, source: 'fallback' };
}
