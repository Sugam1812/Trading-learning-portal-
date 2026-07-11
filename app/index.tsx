import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Loading } from '@/components/ui';
import { useSettings } from '@/store/settings';
import { useTheme } from '@/theme';

/** Entry gate: wait for persisted state to hydrate, then route. */
export default function Index() {
  const t = useTheme();
  const onboarded = useSettings((s) => s.onboarded);
  const [hydrated, setHydrated] = useState(useSettings.persist.hasHydrated());

  useEffect(() => {
    if (hydrated) return;
    const unsub = useSettings.persist.onFinishHydration(() => setHydrated(true));
    // In case hydration finished between render and subscription:
    if (useSettings.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, [hydrated]);

  if (!hydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: t.colors.bg, justifyContent: 'center' }}>
        <Loading label="Preparing your desk…" />
      </View>
    );
  }

  return <Redirect href={onboarded ? '/(tabs)' : '/onboarding'} />;
}
