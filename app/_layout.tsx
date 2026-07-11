import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '@/theme';

function ThemedStack() {
  const t = useTheme();
  return (
    <>
      <StatusBar style={t.dark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: t.colors.bg },
          headerTintColor: t.colors.text,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: t.colors.bg },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="module/[id]" options={{ title: 'Module' }} />
        <Stack.Screen name="lesson/[id]" options={{ title: 'Lesson', gestureEnabled: false }} />
        <Stack.Screen name="challenge/[id]" options={{ title: 'Chart Challenge' }} />
        <Stack.Screen name="calculators" options={{ title: 'Calculators' }} />
        <Stack.Screen name="strategy-builder" options={{ title: 'Strategy Builder' }} />
        <Stack.Screen name="backtest" options={{ title: 'Replay Lab' }} />
        <Stack.Screen name="journal-entry" options={{ title: 'Log a Trade' }} />
        <Stack.Screen name="glossary" options={{ title: 'Glossary' }} />
        <Stack.Screen name="review" options={{ title: 'Mistake Notebook' }} />
        <Stack.Screen name="legal" options={{ title: 'About & Disclaimers' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ThemedStack />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
