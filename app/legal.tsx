import React from 'react';
import { Body, Card, Dim, Screen, SectionTitle, Spacer, Subtitle, Title } from '@/components/ui';

export default function LegalScreen() {
  return (
    <Screen>
      <Title>About PipQuest</Title>
      <Subtitle>Learn the craft of trading. Respect the risk.</Subtitle>
      <Spacer h={3} />

      <SectionTitle>Risk disclosure</SectionTitle>
      <Card>
        <Body style={{ fontWeight: '700', marginBottom: 6 }}>Trading foreign exchange carries substantial risk.</Body>
        <Dim>
          • Leverage magnifies losses as much as gains; you can lose more than you expect.{'\n'}
          • Most retail traders lose money. No method removes this risk.{'\n'}
          • Historical and simulated performance never guarantees future or live results.{'\n'}
          • Spreads, slippage, swaps and execution differences make live results worse than clean simulations.
        </Dim>
      </Card>

      <SectionTitle>What this app is — and is not</SectionTitle>
      <Card>
        <Dim>
          PipQuest is an educational product. It teaches concepts, math, process and testing discipline using
          synthetic practice data.{'\n\n'}
          It is NOT: personalized financial advice, an investment recommendation, a signal service, a broker, or a
          promise of income. Nothing here should be read as "buy" or "sell" advice for any real market.{'\n\n'}
          Completing the curriculum certifies educational progress only. It is not a professional license and does not
          guarantee trading competence or profits.
        </Dim>
      </Card>

      <SectionTitle>Jurisdiction</SectionTitle>
      <Card>
        <Dim>
          Regulation of leveraged forex products varies by country, and some products are restricted or unavailable in
          some places. Before trading real money, verify what is legal and regulated where you live, and deal only
          with properly regulated firms. If in doubt, consult a licensed financial professional.
        </Dim>
      </Card>

      <SectionTitle>Data & privacy</SectionTitle>
      <Card>
        <Dim>
          All learning progress, journal entries, strategies and test results are stored locally on your device. The
          app collects no personal data, requires no account, and sends nothing to any server. You can export your
          data as JSON or delete everything from the Profile tab at any time.
        </Dim>
      </Card>

      <SectionTitle>Content & data</SectionTitle>
      <Card>
        <Dim>
          All lessons are original educational writing. All chart data is synthetically generated for training
          purposes — it is not real market data, and no proprietary datasets or copyrighted materials are included.
        </Dim>
      </Card>

      <Spacer h={2} />
      <Dim style={{ textAlign: 'center', fontSize: 12 }}>PipQuest v1.0.0</Dim>
    </Screen>
  );
}
