import { router } from 'expo-router';
import React, { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Body, Button, Card, Chip, Dim, ProgressBar, Screen, Spacer, Subtitle, Title } from '@/components/ui';
import { OnboardingProfile, Track, useSettings } from '@/store/settings';
import { useTheme } from '@/theme';

const TRACKS: { id: Track; icon: string; title: string; body: string }[] = [
  { id: 'beginner', icon: '🌱', title: 'Beginner Track', body: 'I have never opened a chart. Start from zero.' },
  { id: 'restart', icon: '🔄', title: 'Restart Properly', body: 'I watched random videos but lack structure.' },
  { id: 'strategy', icon: '🧩', title: 'Strategy Builder', body: 'I know basics but cannot write objective rules.' },
  { id: 'backtesting', icon: '🔬', title: 'Backtesting Track', body: 'I want to validate a strategy with evidence.' },
  { id: 'psychology', icon: '🧠', title: 'Risk & Psychology', body: 'My biggest problem is discipline.' },
];

export default function Onboarding() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const settings = useSettings();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [track, setTrack] = useState<Track>('beginner');
  const [experience, setExperience] = useState<OnboardingProfile['experience']>('none');
  const [minutes, setMinutes] = useState<OnboardingProfile['minutesPerDay']>(10);
  const [goal, setGoal] = useState<OnboardingProfile['goal']>('learn-basics');
  const [ageOk, setAgeOk] = useState(false);
  const [riskOk, setRiskOk] = useState(false);

  const steps = 5;

  const finish = () => {
    settings.setProfile({ name: name.trim() || 'Trader', track, experience, minutesPerDay: minutes, goal });
    settings.acceptDisclaimer();
    settings.completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <Screen style={{ paddingTop: insets.top }}>
      <Spacer h={4} />
      <ProgressBar value={(step + 1) / steps} />
      <Spacer h={6} />

      {step === 0 && (
        <View>
          <Text style={{ fontSize: 56, marginBottom: 8 }}>🕯️</Text>
          <Title>Welcome to PipQuest</Title>
          <Subtitle>
            Learn the craft of trading — charts, risk, strategy, backtesting and psychology — through hands-on
            practice, not promises.
          </Subtitle>
          <Spacer h={4} />
          <Card>
            <Body style={{ fontWeight: '700', marginBottom: 6 }}>Before we start, the honest part:</Body>
            <Dim>
              • Forex trading carries substantial risk. Most beginners lose money.{'\n'}
              • Leverage magnifies losses as much as gains.{'\n'}
              • Simulated and historical results never guarantee live results.{'\n'}
              • PipQuest is education only — not financial advice, not signals.{'\n'}
              • Products and regulations vary by country.
            </Dim>
            <Spacer h={3} />
            <Chip label={ageOk ? '✓ I am 18 or older' : 'I am 18 or older'} selected={ageOk} onPress={() => setAgeOk(!ageOk)} />
            <Chip
              label={riskOk ? '✓ I understand this is education, not advice' : 'I understand this is education, not advice'}
              selected={riskOk}
              onPress={() => setRiskOk(!riskOk)}
            />
          </Card>
          <Button label="I understand — let’s learn" disabled={!ageOk || !riskOk} onPress={() => setStep(1)} />
        </View>
      )}

      {step === 1 && (
        <View>
          <Title>What should we call you?</Title>
          <Subtitle>Just a name for your desk. No account required — everything stays on this device.</Subtitle>
          <Spacer h={4} />
          <TextInput
            accessibilityLabel="Your name"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Alex"
            placeholderTextColor={t.colors.textFaint}
            style={{
              backgroundColor: t.colors.surface,
              color: t.colors.text,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: t.colors.border,
              padding: 14,
              fontSize: 17,
            }}
          />
          <Spacer h={4} />
          <Button label="Continue" onPress={() => setStep(2)} />
        </View>
      )}

      {step === 2 && (
        <View>
          <Title>Pick your track</Title>
          <Subtitle>This shapes recommendations. Foundations stay available to everyone.</Subtitle>
          <Spacer h={4} />
          {TRACKS.map((tr) => (
            <Card key={tr.id} onPress={() => setTrack(tr.id)} accent={track === tr.id}>
              <Body style={{ fontWeight: '700' }}>
                {tr.icon} {tr.title}
              </Body>
              <Dim>{tr.body}</Dim>
            </Card>
          ))}
          <Button label="Continue" onPress={() => setStep(3)} />
        </View>
      )}

      {step === 3 && (
        <View>
          <Title>Your experience & goal</Title>
          <Spacer h={3} />
          <Dim style={{ marginBottom: 8 }}>Have you traded before?</Dim>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            <Chip label="Never" selected={experience === 'none'} onPress={() => setExperience('none')} />
            <Chip label="Charts only" selected={experience === 'some'} onPress={() => setExperience('some')} />
            <Chip label="Demo or live" selected={experience === 'traded'} onPress={() => setExperience('traded')} />
          </View>
          <Spacer h={3} />
          <Dim style={{ marginBottom: 8 }}>Main goal right now?</Dim>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            <Chip label="Learn the basics" selected={goal === 'learn-basics'} onPress={() => setGoal('learn-basics')} />
            <Chip label="Build a strategy" selected={goal === 'build-strategy'} onPress={() => setGoal('build-strategy')} />
            <Chip label="Test a strategy" selected={goal === 'test-strategy'} onPress={() => setGoal('test-strategy')} />
            <Chip label="Fix discipline" selected={goal === 'discipline'} onPress={() => setGoal('discipline')} />
          </View>
          <Spacer h={4} />
          <Button label="Continue" onPress={() => setStep(4)} />
        </View>
      )}

      {step === 4 && (
        <View>
          <Title>Daily pace</Title>
          <Subtitle>Small daily sessions beat weekend marathons. How many minutes per day?</Subtitle>
          <Spacer h={4} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {([5, 10, 20] as const).map((m) => (
              <Chip key={m} label={`${m} min`} selected={minutes === m} onPress={() => setMinutes(m)} />
            ))}
          </View>
          <Spacer h={4} />
          <Card>
            <Body style={{ fontWeight: '700', marginBottom: 4 }}>Your setup</Body>
            <Dim>
              {TRACKS.find((x) => x.id === track)?.icon} {TRACKS.find((x) => x.id === track)?.title} ·{' '}
              {minutes} min/day{'\n'}
              We will start in Currency Foundations and unlock worlds as you master them.
            </Dim>
          </Card>
          <Button label="Start learning" onPress={finish} />
        </View>
      )}
    </Screen>
  );
}
