import React, { useMemo, useState } from 'react';
import { TextInput, View } from 'react-native';
import { Body, Card, Dim, EmptyState, Screen, Spacer, Subtitle, Title } from '@/components/ui';
import { GLOSSARY } from '@/content/glossary';
import { useTheme } from '@/theme';

export default function GlossaryScreen() {
  const t = useTheme();
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const all = [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term));
    if (!q) return all;
    return all.filter((g) => g.term.toLowerCase().includes(q) || g.plain.toLowerCase().includes(q));
  }, [query]);

  return (
    <Screen>
      <Title>Glossary</Title>
      <Subtitle>{GLOSSARY.length} terms in plain language. Works fully offline.</Subtitle>
      <Spacer h={3} />
      <TextInput
        accessibilityLabel="Search terms"
        value={query}
        onChangeText={setQuery}
        placeholder="Search e.g. pip, drawdown, fakeout…"
        placeholderTextColor={t.colors.textFaint}
        style={{
          backgroundColor: t.colors.surface,
          color: t.colors.text,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: t.colors.border,
          padding: 12,
          fontSize: 16,
          marginBottom: 12,
        }}
      />
      {filtered.length === 0 ? (
        <EmptyState icon="🔍" title="No matches" body={`Nothing found for "${query}". Try a shorter word.`} />
      ) : (
        filtered.map((g) => (
          <Card key={g.id} style={{ padding: 14 }}>
            <Body style={{ fontWeight: '800' }}>{g.term}</Body>
            <Dim style={{ marginTop: 2 }}>{g.plain}</Dim>
            {g.example && (
              <View style={{ backgroundColor: t.colors.surfaceAlt, borderRadius: 8, padding: 8, marginTop: 8 }}>
                <Dim style={{ fontSize: 13, fontStyle: 'italic' }}>{g.example}</Dim>
              </View>
            )}
          </Card>
        ))
      )}
    </Screen>
  );
}
