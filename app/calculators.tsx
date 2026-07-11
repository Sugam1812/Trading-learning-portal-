import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Stepper } from '@/components/chart/diagrams';
import { Body, Card, Chip, Dim, Row, Screen, Spacer, StatTile, Subtitle, Title } from '@/components/ui';
import {
  breakEvenWinRate,
  expectancyR,
  positionSize,
  rewardToRisk,
  survivalSimulation,
} from '@/lib/calc';
import { mulberry32 } from '@/lib/rng';
import { useTheme } from '@/theme';

type Tab = 'size' | 'rr' | 'expectancy' | 'survival';

export default function CalculatorsScreen() {
  const [tab, setTab] = useState<Tab>('size');
  return (
    <Screen>
      <Title>Risk calculators</Title>
      <Subtitle>Adjust the inputs and watch the consequences instantly. These run fully offline.</Subtitle>
      <Spacer h={3} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        <Chip label="Position size" selected={tab === 'size'} onPress={() => setTab('size')} />
        <Chip label="Reward-to-risk" selected={tab === 'rr'} onPress={() => setTab('rr')} />
        <Chip label="Expectancy" selected={tab === 'expectancy'} onPress={() => setTab('expectancy')} />
        <Chip label="Survival" selected={tab === 'survival'} onPress={() => setTab('survival')} />
      </View>
      <Spacer h={2} />
      {tab === 'size' && <SizeCalc />}
      {tab === 'rr' && <RRCalc />}
      {tab === 'expectancy' && <ExpectancyCalc />}
      {tab === 'survival' && <SurvivalCalc />}
    </Screen>
  );
}

function SizeCalc() {
  const [balance, setBalance] = useState(1000);
  const [risk, setRisk] = useState(1);
  const [stop, setStop] = useState(20);
  const r = positionSize({ balance, riskPercent: risk, stopPips: stop });
  return (
    <Card>
      <Body style={{ fontWeight: '800', marginBottom: 10 }}>Position size</Body>
      <Stepper label="Account balance ($)" value={balance} onChange={setBalance} step={100} min={100} max={1000000} />
      <Stepper label="Risk per trade (%)" value={risk} onChange={setRisk} step={0.25} min={0.25} max={10} format={(v) => `${v}%`} />
      <Stepper label="Stop distance (pips)" value={stop} onChange={setStop} step={5} min={5} max={300} />
      <Spacer h={2} />
      <Row style={{ flexWrap: 'wrap' }}>
        <StatTile label="Max planned loss" value={`$${r.riskAmount.toFixed(2)}`} />
        <StatTile label="Position size" value={`${r.lots.toFixed(2)} lots`} tone="good" />
      </Row>
      <Row style={{ flexWrap: 'wrap' }}>
        <StatTile label="Units" value={String(r.units)} />
        <StatTile label="Value per pip" value={`$${r.pipValue.toFixed(2)}`} />
      </Row>
      <Dim style={{ fontSize: 12 }}>
        Assumes ≈$10 per pip per standard lot (USD-quoted pairs). Size is rounded DOWN so real risk never exceeds the
        plan. Risk above 2% per trade is aggressive for most traders.
      </Dim>
    </Card>
  );
}

function RRCalc() {
  const t = useTheme();
  const [stop, setStop] = useState(20);
  const [target, setTarget] = useState(40);
  const entry = 1.1;
  const ratio = rewardToRisk(entry, entry - stop * 0.0001, entry + target * 0.0001);
  const be = breakEvenWinRate(ratio) * 100;
  return (
    <Card>
      <Body style={{ fontWeight: '800', marginBottom: 10 }}>Reward-to-risk</Body>
      <Stepper label="Stop distance (pips)" value={stop} onChange={setStop} step={5} min={5} max={300} />
      <Stepper label="Target distance (pips)" value={target} onChange={setTarget} step={5} min={5} max={600} />
      <Spacer h={2} />
      <Row style={{ flexWrap: 'wrap' }}>
        <StatTile label="Ratio" value={`1:${ratio.toFixed(2)}`} tone={ratio >= 1.5 ? 'good' : ratio < 1 ? 'bad' : 'neutral'} />
        <StatTile label="Break-even win rate" value={`${be.toFixed(1)}%`} />
      </Row>
      <Dim style={{ fontSize: 12 }}>
        At 1:{ratio.toFixed(2)}, you need to win more than {be.toFixed(1)}% of trades just to break even — before
        spread and slippage. <Dim style={{ color: t.colors.warning, fontSize: 12 }}>A high ratio is worthless if the target is unrealistic.</Dim>
      </Dim>
    </Card>
  );
}

function ExpectancyCalc() {
  const t = useTheme();
  const [winRate, setWinRate] = useState(45);
  const [avgWin, setAvgWin] = useState(2);
  const [avgLoss, setAvgLoss] = useState(1);
  const e = expectancyR(winRate / 100, avgWin, avgLoss);
  return (
    <Card>
      <Body style={{ fontWeight: '800', marginBottom: 10 }}>Expectancy</Body>
      <Stepper label="Win rate (%)" value={winRate} onChange={setWinRate} step={5} min={5} max={95} format={(v) => `${v}%`} />
      <Stepper label="Average win (R)" value={avgWin} onChange={setAvgWin} step={0.25} min={0.25} max={10} format={(v) => `${v}R`} />
      <Stepper label="Average loss (R)" value={avgLoss} onChange={setAvgLoss} step={0.25} min={0.25} max={5} format={(v) => `${v}R`} />
      <Spacer h={2} />
      <Row style={{ flexWrap: 'wrap' }}>
        <StatTile label="Expectancy per trade" value={`${e >= 0 ? '+' : ''}${e.toFixed(2)}R`} tone={e > 0 ? 'good' : 'bad'} />
        <StatTile label="Over 100 trades" value={`${e >= 0 ? '+' : ''}${(e * 100).toFixed(0)}R`} tone={e > 0 ? 'good' : 'bad'} />
      </Row>
      <Dim style={{ fontSize: 12 }}>
        (win% × avg win) − (loss% × avg loss). {e <= 0 ? 'Negative expectancy: this profile loses money over time no matter how it feels short-term. ' : ''}
        <Dim style={{ color: t.colors.warning, fontSize: 12 }}>Estimates only mean something after 50–100+ recorded trades.</Dim>
      </Dim>
    </Card>
  );
}

function SurvivalCalc() {
  const [winRate, setWinRate] = useState(45);
  const [rr, setRr] = useState(2);
  const [risk, setRisk] = useState(1);
  const ruinProb = useMemo(
    () => survivalSimulation(winRate / 100, rr, risk, 200, 30, 500, mulberry32(winRate * 1000 + rr * 100 + risk)),
    [winRate, rr, risk],
  );
  return (
    <Card>
      <Body style={{ fontWeight: '800', marginBottom: 10 }}>Survival simulator</Body>
      <Dim style={{ marginBottom: 10, fontSize: 13 }}>
        500 simulated 200-trade careers with these settings. How many hit a 30% drawdown?
      </Dim>
      <Stepper label="Win rate (%)" value={winRate} onChange={setWinRate} step={5} min={20} max={80} format={(v) => `${v}%`} />
      <Stepper label="Reward-to-risk" value={rr} onChange={setRr} step={0.5} min={0.5} max={5} format={(v) => `1:${v}`} />
      <Stepper label="Risk per trade (%)" value={risk} onChange={setRisk} step={0.5} min={0.5} max={10} format={(v) => `${v}%`} />
      <Spacer h={2} />
      <Row>
        <StatTile
          label="Careers hitting −30%"
          value={`${(ruinProb * 100).toFixed(0)}%`}
          tone={ruinProb < 0.05 ? 'good' : ruinProb > 0.25 ? 'bad' : 'neutral'}
        />
      </Row>
      <Dim style={{ fontSize: 12 }}>
        Watch what happens when you raise risk per trade with everything else fixed. This is why professionals obsess
        over the risk line, not the win line. Simulation is illustrative, not a prediction.
      </Dim>
    </Card>
  );
}
