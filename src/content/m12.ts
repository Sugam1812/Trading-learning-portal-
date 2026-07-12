import { Lesson, Module } from '@/types/content';

export const M12: Module = {
  id: 'm12',
  order: 12,
  world: 'Professional Desk',
  title: 'Brokers & Staying Safe',
  tagline: 'Regulation, real costs, and the scam patterns that hunt new traders.',
  icon: '🏦',
  skills: ['terminology', 'psychology'],
  lessonIds: ['m12l1', 'm12l2', 'm12l3'],
  prereq: 'm6',
};

export const M12_LESSONS: Lesson[] = [
  {
    id: 'm12l1',
    moduleId: 'm12',
    title: 'What a Broker Actually Does',
    objective: 'Understand the broker’s role, regulation, and the protections that matter.',
    xp: 55,
    blocks: [
      {
        kind: 'concept',
        id: 'm12l1b1',
        skill: 'terminology',
        title: 'Your gateway, not your friend or enemy',
        body:
          'A broker routes your orders into the currency market and lends you leverage. Serious brokers are regulated: a financial authority audits them, forces client-money segregation (your deposit kept separate from company funds), and often requires negative balance protection so you cannot lose more than you deposited. Regulation varies by country — which is why PipQuest never recommends specific brokers. Verify locally, always.',
        bullets: [
          'Regulation = external audits + client money segregation + dispute channels.',
          'Negative balance protection: your account floors at zero.',
          'Costs come as spread, commission, and swap — all measurable, all comparable.',
        ],
        mistake:
          'Choosing a broker because of a deposit bonus or a slick influencer. Bonuses often come with withdrawal traps; regulation and costs are the real criteria.',
      },
      {
        kind: 'multi',
        id: 'm12l1b2',
        skill: 'terminology',
        prompt: 'Which items belong on a broker due-diligence checklist? Select all that apply.',
        options: [
          { text: 'Verifiable license with a real regulator (check the regulator’s own register)' },
          { text: 'Clear, published spreads, commissions and swap rates' },
          { text: 'A 300% deposit bonus for signing up today' },
          { text: 'Documented withdrawal process with reasonable timelines' },
        ],
        correctIndexes: [0, 1, 3],
        hint: 'Which items protect you, and which one pressures you?',
        explain:
          'Huge bonuses are frequently tied to volume requirements that lock your money. Regulation, transparent costs and clean withdrawals are the trio that matters.',
      },
      {
        kind: 'mcq',
        id: 'm12l1b3',
        skill: 'terminology',
        prompt: 'Why does "check the regulator’s own register" beat "the broker’s website says regulated"?',
        options: [
          { text: 'Regulator websites load faster' },
          {
            text: 'Scam sites routinely fake license numbers and logos; the register is the source of truth',
            explain: 'Two minutes on the regulator’s site defeats most clone-firm scams.',
          },
          { text: 'It makes no difference' },
        ],
        correctIndex: 1,
        explain:
          '"Clone firms" copy real brokers’ names and numbers. The regulator’s register (and the exact web domain it lists) exposes them.',
      },
      {
        kind: 'truefalse',
        id: 'm12l1b4',
        skill: 'terminology',
        statement: 'A demo account uses real market prices but virtual money, making it the right place to practice execution.',
        answer: false,
        explain:
          'Careful — the first half is true, but demo is the right place to practice only AFTER backtesting has given you rules worth executing. Demo without rules just rehearses improvisation. (And demo fills are kinder than live ones — expect some slippage difference.)',
      },
    ],
  },
  {
    id: 'm12l2',
    moduleId: 'm12',
    title: 'The Scam Catalogue',
    objective: 'Recognise the standard traps: signal sellers, account managers, fake screenshots.',
    xp: 60,
    blocks: [
      {
        kind: 'concept',
        id: 'm12l2b1',
        skill: 'psychology',
        title: 'Same script, new faces',
        body:
          'Trading scams follow scripts. The signal seller: pay monthly for "90% accurate" trades. The account manager: "send funds, I trade for you" — then the money is gone. The prop mentor: fake lifestyle photos, paid course, recycled content. The romance/"pig butchering" scam: a friendly stranger guides you to a fake platform that shows profits but never pays withdrawals. All share one tell: guaranteed easy money from a stranger who profits from YOUR deposit or fee.',
        mistake:
          'Thinking "I would never fall for it." These operations are professional, patient and A/B-tested. Respecting them is the defence.',
      },
      {
        kind: 'match',
        id: 'm12l2b2',
        skill: 'psychology',
        prompt: 'Match the scam to its tell-tale sign.',
        pairs: [
          { left: 'Signal group', right: 'Claims a win rate no honest trader would promise' },
          { left: 'Managed account', right: 'Asks you to send money to a stranger’s control' },
          { left: 'Fake platform', right: 'Shows profits but invents fees when you withdraw' },
          { left: 'Screenshot trader', right: 'Lifestyle photos, no verifiable long-term track record' },
        ],
        explain:
          'Notice every tell is about verification: real performance is auditable, real custody is regulated, real withdrawals just work.',
      },
      {
        kind: 'scenario',
        id: 'm12l2b3',
        skill: 'psychology',
        situation:
          'An online acquaintance you have chatted with for weeks mentions a "private exchange" where their uncle’s algorithm makes 3% weekly. They offer to help you set up an account — no pressure, just kindness. What is happening?',
        options: [
          {
            text: 'A textbook pig-butchering setup: weeks of trust-building, then a fake platform — disengage and report',
            quality: 'best',
            explain: 'The long friendly runway IS the technique. 3% weekly ≈ 350%+ a year: nobody shares that with strangers.',
          },
          { text: 'A rare opportunity from a genuine friend', quality: 'poor', explain: 'You have never met them, and the pitch ends at a platform nobody regulates. The kindness is the product.' },
          { text: 'Try it with a small amount to test withdrawals first', quality: 'poor', explain: 'These platforms happily pay small withdrawals to bait the big deposit. A working small withdrawal proves nothing.' },
        ],
      },
      {
        kind: 'mcq',
        id: 'm12l2b4',
        skill: 'psychology',
        prompt: 'What single question defeats most trading scams?',
        options: [
          { text: '"What is your win rate?"' },
          {
            text: '"If this reliably makes so much, why do you need my money or my fee?"',
            explain: 'Genuine edges are capital-constrained secrets, not subscription products for strangers.',
          },
          { text: '"Which broker do you use?"' },
        ],
        correctIndex: 1,
        explain:
          'Follow the incentive: scammers earn from deposits and fees, not from markets. The question exposes the business model.',
      },
    ],
  },
  {
    id: 'm12l3',
    moduleId: 'm12',
    title: 'Platform Security & Account Hygiene',
    objective: 'Protect the account itself: authentication, withdrawals, and records.',
    xp: 55,
    blocks: [
      {
        kind: 'concept',
        id: 'm12l3b1',
        skill: 'terminology',
        title: 'The unglamorous layer that saves you',
        body:
          'Before any candle matters, your account must be secure: a unique password, two-factor authentication, and withdrawal confirmations. Test the withdrawal process with a small amount EARLY, keep records of deposits and statements, and never share account credentials or remote access with anyone — no legitimate "support agent" or "mentor" ever needs them.',
        bullets: [
          'Unique password + 2FA on both broker and email.',
          'Test a small withdrawal before you need a big one.',
          'Nobody legitimate asks for your login or screen control.',
        ],
      },
      {
        kind: 'multi',
        id: 'm12l3b2',
        skill: 'terminology',
        prompt: 'Which are genuine red flags at a platform you already use? Select all that apply.',
        options: [
          { text: 'A new "verification fee" required before your withdrawal is released' },
          { text: '"Support" asking for your password or remote screen access' },
          { text: 'An email asking you to log in via an unusual link' },
          { text: 'A routine identity (KYC) check when you first sign up' },
        ],
        correctIndexes: [0, 1, 2],
        explain:
          'Fees invented at withdrawal time, credential requests and phishing links are attack patterns. Standard KYC at signup is normal at regulated firms.',
      },
      {
        kind: 'scenario',
        id: 'm12l3b3',
        skill: 'psychology',
        situation:
          '"Broker support" calls: there is a "problem trade" and they need your password to fix it right now or the account will be frozen. What do you do?',
        options: [
          {
            text: 'Hang up, log in through the official app yourself, and contact support via the published channel',
            quality: 'best',
            explain: 'Urgency + credential request = attack, every time. Verify through the front door you already know.',
          },
          { text: 'Give the password — they said it was urgent', quality: 'poor', explain: 'The urgency is manufactured precisely to stop you thinking. No real support needs your password.' },
          { text: 'Negotiate: give half the password', quality: 'poor', explain: 'There is no safe fraction of a credential.' },
        ],
      },
      {
        kind: 'reflection',
        id: 'm12l3b4',
        skill: 'terminology',
        prompt: 'Write your three account-safety commitments (authentication, withdrawals, credentials) as rules you will not renegotiate.',
      },
    ],
  },
];
