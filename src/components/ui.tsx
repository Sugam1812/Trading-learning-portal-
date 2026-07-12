import * as Haptics from 'expo-haptics';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleProp,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '@/store/settings';
import { useTheme } from '@/theme';

/** Fires selection haptics if the user has haptics enabled. */
export function useHaptic() {
  const enabled = useSettings((s) => s.haptics);
  return {
    tap: () => {
      if (enabled) Haptics.selectionAsync().catch(() => {});
    },
    success: () => {
      if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    },
    error: () => {
      if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    },
  };
}

export function Screen({
  children,
  scroll = true,
  padded = true,
  style,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const inner: ViewStyle = {
    padding: padded ? t.space(4) : 0,
    paddingBottom: t.space(10),
  };
  if (scroll) {
    return (
      <ScrollView
        style={[{ flex: 1, backgroundColor: t.colors.bg }, style]}
        contentContainerStyle={inner}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    );
  }
  return (
    <View style={[{ flex: 1, backgroundColor: t.colors.bg, paddingBottom: insets.bottom }, padded && { padding: t.space(4) }, style]}>
      {children}
    </View>
  );
}

export function Card({
  children,
  style,
  onPress,
  accent,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  accent?: boolean;
}) {
  const t = useTheme();
  const base: ViewStyle = {
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: accent ? t.colors.accent : t.colors.border,
    padding: t.space(4),
    marginBottom: t.space(3),
  };
  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [base, pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] }, style]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[base, style]}>{children}</View>;
}

export function Title({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  const t = useTheme();
  return (
    <Text accessibilityRole="header" style={[{ color: t.colors.text, fontSize: 24, fontWeight: '800', marginBottom: t.space(1) }, style]}>
      {children}
    </Text>
  );
}

export function Subtitle({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  const t = useTheme();
  return <Text style={[{ color: t.colors.textDim, fontSize: 15, lineHeight: 21 }, style]}>{children}</Text>;
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  const t = useTheme();
  return (
    <Text
      accessibilityRole="header"
      style={{
        color: t.colors.textDim,
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: t.space(4),
        marginBottom: t.space(2),
      }}
    >
      {children}
    </Text>
  );
}

export function Body({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  const t = useTheme();
  return <Text style={[{ color: t.colors.text, fontSize: 16, lineHeight: 24 }, style]}>{children}</Text>;
}

export function Dim({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  const t = useTheme();
  return <Text style={[{ color: t.colors.textDim, fontSize: 14, lineHeight: 20 }, style]}>{children}</Text>;
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'bull' | 'bear';

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  style,
  small,
}: {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  small?: boolean;
}) {
  const t = useTheme();
  const h = useHaptic();
  const bg: Record<ButtonVariant, string> = {
    primary: t.colors.accent,
    secondary: t.colors.surfaceAlt,
    ghost: 'transparent',
    danger: t.colors.danger,
    bull: t.colors.bull,
    bear: t.colors.bear,
  };
  const fg: Record<ButtonVariant, string> = {
    primary: t.dark ? '#06231C' : '#FFFFFF',
    secondary: t.colors.text,
    ghost: t.colors.accent,
    danger: '#FFFFFF',
    bull: t.dark ? '#06231C' : '#FFFFFF',
    bear: '#FFFFFF',
  };
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={() => {
        h.tap();
        onPress();
      }}
      style={({ pressed }) => [
        {
          backgroundColor: bg[variant],
          borderRadius: t.radius.md,
          paddingVertical: small ? t.space(2) : t.space(3.5),
          paddingHorizontal: t.space(4),
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: small ? 36 : 48,
          opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
          borderWidth: variant === 'ghost' ? 1 : 0,
          borderColor: t.colors.border,
        },
        style,
      ]}
    >
      <Text style={{ color: fg[variant], fontWeight: '700', fontSize: small ? 14 : 16 }}>{label}</Text>
    </Pressable>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  color,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  color?: string;
}) {
  const t = useTheme();
  const h = useHaptic();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={() => {
        h.tap();
        onPress?.();
      }}
      style={{
        borderRadius: 999,
        paddingVertical: 8,
        paddingHorizontal: 14,
        marginRight: 8,
        marginBottom: 8,
        minHeight: 36,
        justifyContent: 'center',
        backgroundColor: selected ? color ?? t.colors.accent : t.colors.surfaceAlt,
        borderWidth: 1,
        borderColor: selected ? color ?? t.colors.accent : t.colors.border,
      }}
    >
      <Text
        style={{
          color: selected ? (t.dark ? '#06231C' : '#FFFFFF') : t.colors.text,
          fontWeight: '600',
          fontSize: 14,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function ProgressBar({ value, color, height = 8 }: { value: number; color?: string; height?: number }) {
  const t = useTheme();
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct * 100) }}
      style={{ height, borderRadius: height / 2, backgroundColor: t.colors.surfaceAlt, overflow: 'hidden' }}
    >
      <View style={{ width: `${pct * 100}%`, height, borderRadius: height / 2, backgroundColor: color ?? t.colors.accent }} />
    </View>
  );
}

export function StatTile({ label, value, tone }: { label: string; value: string; tone?: 'good' | 'bad' | 'neutral' }) {
  const t = useTheme();
  const color = tone === 'good' ? t.colors.bull : tone === 'bad' ? t.colors.bear : t.colors.text;
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: t.colors.surfaceAlt,
        borderRadius: t.radius.md,
        padding: t.space(3),
        marginRight: t.space(2),
        marginBottom: t.space(2),
        minWidth: 90,
      }}
    >
      <Text style={{ color, fontSize: 18, fontWeight: '800' }}>{value}</Text>
      <Text style={{ color: t.colors.textDim, fontSize: 12, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

export function Row({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>{children}</View>;
}

export function Spacer({ h = 2 }: { h?: number }) {
  const t = useTheme();
  return <View style={{ height: t.space(h) }} />;
}

export function EmptyState({ icon, title, body }: { icon: string; title: string; body: string }) {
  const t = useTheme();
  return (
    <View style={{ alignItems: 'center', padding: t.space(8) }}>
      <Text style={{ fontSize: 44, marginBottom: t.space(3) }}>{icon}</Text>
      <Text style={{ color: t.colors.text, fontSize: 17, fontWeight: '700', marginBottom: t.space(1) }}>{title}</Text>
      <Text style={{ color: t.colors.textDim, fontSize: 14, textAlign: 'center', lineHeight: 20 }}>{body}</Text>
    </View>
  );
}

export function Loading({ label = 'Loading…' }: { label?: string }) {
  const t = useTheme();
  return (
    <View style={{ alignItems: 'center', padding: t.space(10) }}>
      <ActivityIndicator color={t.colors.accent} size="large" />
      <Text style={{ color: t.colors.textDim, marginTop: t.space(3) }}>{label}</Text>
    </View>
  );
}

/** Feedback banner used by every lesson block. */
export function FeedbackBanner({
  status,
  text,
}: {
  status: 'correct' | 'wrong' | 'info';
  text: string;
}) {
  const t = useTheme();
  const bg = status === 'correct' ? t.colors.bullSoft : status === 'wrong' ? t.colors.bearSoft : t.colors.surfaceAlt;
  const fg = status === 'correct' ? t.colors.bull : status === 'wrong' ? t.colors.bear : t.colors.text;
  const icon = status === 'correct' ? '✓' : status === 'wrong' ? '✕' : 'ℹ';
  return (
    <View
      accessibilityLiveRegion="polite"
      style={{
        backgroundColor: bg,
        borderRadius: t.radius.md,
        padding: t.space(3),
        marginTop: t.space(3),
        flexDirection: 'row',
      }}
    >
      <Text style={{ color: fg, fontWeight: '900', marginRight: 8, fontSize: 16 }}>{icon}</Text>
      <Text style={{ color: t.colors.text, flex: 1, fontSize: 14, lineHeight: 20 }}>{text}</Text>
    </View>
  );
}
