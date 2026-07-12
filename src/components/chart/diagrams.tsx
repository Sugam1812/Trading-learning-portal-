import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';
import { useTheme } from '@/theme';

/**
 * Reward-to-risk diagram: entry, stop, target with shaded risk/reward areas.
 * Prices are mapped into a fixed vertical band so any values render nicely.
 */
export function RRDiagram({
  entry,
  stop,
  target,
  direction,
  pipSize,
  height = 200,
}: {
  entry: number;
  stop: number;
  target: number;
  direction: 'long' | 'short';
  pipSize: number;
  height?: number;
}) {
  const t = useTheme();
  const [width, setWidth] = useState(0);
  const lo = Math.min(entry, stop, target);
  const hi = Math.max(entry, stop, target);
  const pad = (hi - lo) * 0.18 || pipSize * 5;
  const y = (p: number) => height - ((p - (lo - pad)) / (hi + pad - (lo - pad))) * height;
  const dp = pipSize === 0.01 ? 2 : 4;
  const riskPips = Math.abs(entry - stop) / pipSize;
  const rewardPips = Math.abs(target - entry) / pipSize;
  const labelX = 8;
  const plotW = width;

  return (
    <View
      accessible
      accessibilityLabel={`Trade diagram, ${direction}. Entry ${entry.toFixed(dp)}, stop ${stop.toFixed(dp)} (${riskPips.toFixed(0)} pips), target ${target.toFixed(dp)} (${rewardPips.toFixed(0)} pips).`}
      style={{ height, borderRadius: 12, overflow: 'hidden', backgroundColor: t.dark ? '#0A101D' : '#FDFEFF', borderWidth: 1, borderColor: t.colors.border }}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      {width > 0 && (
        <Svg width={plotW} height={height}>
          {/* reward area */}
          <Rect
            x={0}
            y={Math.min(y(entry), y(target))}
            width={plotW}
            height={Math.abs(y(entry) - y(target))}
            fill={t.colors.bull}
            opacity={0.14}
          />
          {/* risk area */}
          <Rect
            x={0}
            y={Math.min(y(entry), y(stop))}
            width={plotW}
            height={Math.abs(y(entry) - y(stop))}
            fill={t.colors.bear}
            opacity={0.16}
          />
          <Line x1={0} x2={plotW} y1={y(target)} y2={y(target)} stroke={t.colors.bull} strokeWidth={2} />
          <Line x1={0} x2={plotW} y1={y(entry)} y2={y(entry)} stroke={t.colors.info} strokeWidth={2} strokeDasharray="6,4" />
          <Line x1={0} x2={plotW} y1={y(stop)} y2={y(stop)} stroke={t.colors.bear} strokeWidth={2} />
          <SvgText x={labelX} y={y(target) - 6} fill={t.colors.bull} fontSize={11} fontWeight="bold">
            Target {target.toFixed(dp)} · {rewardPips.toFixed(0)} pips
          </SvgText>
          <SvgText x={labelX} y={y(entry) - 6} fill={t.colors.info} fontSize={11} fontWeight="bold">
            Entry {entry.toFixed(dp)}
          </SvgText>
          <SvgText x={labelX} y={y(stop) + 14} fill={t.colors.bear} fontSize={11} fontWeight="bold">
            Stop {stop.toFixed(dp)} · {riskPips.toFixed(0)} pips
          </SvgText>
        </Svg>
      )}
    </View>
  );
}

/** Large tappable candlestick used by anatomy exercises. */
export function CandleAnatomy({
  bullish,
  onPressPart,
  selected,
  height = 240,
}: {
  bullish: boolean;
  onPressPart?: (part: 'body' | 'upperWick' | 'lowerWick') => void;
  selected?: 'body' | 'upperWick' | 'lowerWick' | null;
  height?: number;
}) {
  const t = useTheme();
  const color = bullish ? t.colors.bull : t.colors.bear;
  const cx = 90;
  const bodyTop = height * 0.3;
  const bodyBottom = height * 0.7;
  const zone = (part: 'body' | 'upperWick' | 'lowerWick', top: number, bottom: number) => (
    <Pressable
      key={part}
      accessibilityRole="button"
      accessibilityLabel={
        part === 'body' ? 'Candle body' : part === 'upperWick' ? 'Upper wick area' : 'Lower wick area'
      }
      onPress={() => onPressPart?.(part)}
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top,
        height: bottom - top,
        borderWidth: selected === part ? 2 : 0,
        borderColor: t.colors.gold,
        borderRadius: 8,
      }}
    />
  );
  return (
    <View style={{ height, alignItems: 'center' }}>
      <View style={{ width: 180, height }}>
        <Svg width={180} height={height}>
          <Line x1={cx} x2={cx} y1={height * 0.06} y2={bodyTop} stroke={color} strokeWidth={3} />
          <Rect x={cx - 26} y={bodyTop} width={52} height={bodyBottom - bodyTop} fill={color} rx={4} />
          <Line x1={cx} x2={cx} y1={bodyBottom} y2={height * 0.94} stroke={color} strokeWidth={3} />
          <SvgText x={cx + 36} y={height * 0.18} fill={t.colors.textDim} fontSize={11}>
            {bullish ? 'High' : 'High'}
          </SvgText>
          <SvgText x={cx + 36} y={(bodyTop + bodyBottom) / 2} fill={t.colors.textDim} fontSize={11}>
            {bullish ? 'Open → Close' : 'Close ← Open'}
          </SvgText>
          <SvgText x={cx + 36} y={height * 0.9} fill={t.colors.textDim} fontSize={11}>
            Low
          </SvgText>
        </Svg>
        {zone('upperWick', 0, bodyTop)}
        {zone('body', bodyTop, bodyBottom)}
        {zone('lowerWick', bodyBottom, height)}
      </View>
    </View>
  );
}

/** Stepper control with big touch targets, used by calculators and the RR builder. */
export function Stepper({
  label,
  value,
  onChange,
  step = 1,
  min = 0,
  max = 1000000,
  format,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  format?: (v: number) => string;
}) {
  const t = useTheme();
  const btn = (txt: string, delta: number) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${delta > 0 ? 'Increase' : 'Decrease'} ${label}`}
      onPress={() => onChange(Math.max(min, Math.min(max, Number((value + delta).toPrecision(12)))))}
      style={({ pressed }) => ({
        width: 44,
        height: 44,
        borderRadius: 10,
        backgroundColor: t.colors.surfaceAlt,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.7 : 1,
        borderWidth: 1,
        borderColor: t.colors.border,
      })}
    >
      <Text style={{ color: t.colors.text, fontSize: 20, fontWeight: '800' }}>{txt}</Text>
    </Pressable>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
      <Text style={{ color: t.colors.textDim, flex: 1, fontSize: 14 }}>{label}</Text>
      {btn('−', -step)}
      <Text
        style={{
          color: t.colors.text,
          fontWeight: '800',
          fontSize: 16,
          minWidth: 86,
          textAlign: 'center',
        }}
      >
        {format ? format(value) : String(value)}
      </Text>
      {btn('+', step)}
    </View>
  );
}
