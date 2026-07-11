import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, { G, Line, Polyline, Rect, Text as SvgText } from 'react-native-svg';
import { smaSeries } from '@/lib/sma';
import { useTheme } from '@/theme';
import { PriceLine } from '@/types/content';
import { Candle } from '@/types/trading';

export interface ChartMarker {
  index: number;
  price: number;
  kind: 'entry' | 'stop' | 'target' | 'win' | 'loss';
  label?: string;
}

interface Props {
  candles: Candle[];
  /** Only the first `visible` candles are drawn — the future stays hidden. */
  visible?: number;
  pipSize?: number;
  height?: number;
  lines?: PriceLine[];
  markers?: ChartMarker[];
  /** Highlight these candle indexes (correct answers, selections). */
  highlight?: number[];
  onPressCandle?: (index: number) => void;
  /** Show OHLC readout for the pressed candle. */
  readout?: boolean;
  /** Max candles fitted into the viewport; older ones scroll off the left edge. */
  maxBars?: number;
  /** Simple-moving-average overlays, e.g. [{ period: 20 }]. Computed on closes, no look-ahead. */
  smaOverlays?: { period: number; color?: 'gold' | 'info' }[];
  accessibilityLabel?: string;
}

/**
 * SVG candlestick renderer with hidden-future support.
 * Pure and deterministic: given the same props it draws the same chart,
 * which keeps exercises testable and replay honest.
 */
export function CandleChart({
  candles,
  visible,
  pipSize = 0.0001,
  height = 240,
  lines = [],
  markers = [],
  highlight = [],
  onPressCandle,
  readout = true,
  maxBars = 70,
  smaOverlays = [],
  accessibilityLabel,
}: Props) {
  const t = useTheme();
  const [width, setWidth] = useState(0);
  const [pressed, setPressed] = useState<number | null>(null);

  const shown = Math.min(visible ?? candles.length, candles.length);
  const start = Math.max(0, shown - maxBars);
  const window = candles.slice(start, shown);

  const geom = useMemo(() => {
    if (!window.length || width <= 0) return null;
    const padRight = 54;
    const plotW = width - padRight;
    const n = window.length;
    const step = plotW / n;
    const bodyW = Math.max(2, Math.min(14, step * 0.65));

    let lo = Math.min(...window.map((c) => c.l));
    let hi = Math.max(...window.map((c) => c.h));
    for (const ln of lines) {
      lo = Math.min(lo, ln.price);
      hi = Math.max(hi, ln.price);
    }
    for (const m of markers) {
      if (m.index >= start && m.index < shown) {
        lo = Math.min(lo, m.price);
        hi = Math.max(hi, m.price);
      }
    }
    const pad = (hi - lo) * 0.08 || pipSize * 10;
    lo -= pad;
    hi += pad;
    const y = (p: number) => height - ((p - lo) / (hi - lo)) * height;
    const x = (i: number) => (i - start) * step + step / 2;
    return { y, x, step, bodyW, lo, hi, plotW };
  }, [window, width, height, lines, markers, start, shown, pipSize]);

  const dp = pipSize === 0.01 ? 2 : 4;
  const lineColor = (c?: PriceLine['color']) =>
    c === 'bull' ? t.colors.bull : c === 'bear' ? t.colors.bear : c === 'accent' ? t.colors.gold : t.colors.textFaint;

  const summary = useMemo(() => {
    if (!window.length) return 'No chart data';
    const first = window[0];
    const last = window[window.length - 1];
    const dir = last.c > first.o ? 'risen' : 'fallen';
    return `Candlestick chart with ${window.length} visible candles. Price has ${dir} from ${first.o.toFixed(dp)} to ${last.c.toFixed(dp)}.`;
  }, [window, dp]);

  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel ?? summary}
      style={{
        backgroundColor: t.dark ? '#0A101D' : '#FDFEFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: t.colors.border,
        overflow: 'hidden',
      }}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      {readout && pressed !== null && candles[pressed] && (
        <View style={{ flexDirection: 'row', padding: 6, backgroundColor: t.colors.surfaceAlt }}>
          <Text style={{ color: t.colors.textDim, fontSize: 11, flex: 1 }} numberOfLines={1}>
            Bar {pressed - start + 1}  O {candles[pressed].o.toFixed(dp)}  H {candles[pressed].h.toFixed(dp)}  L{' '}
            {candles[pressed].l.toFixed(dp)}  C {candles[pressed].c.toFixed(dp)}
          </Text>
        </View>
      )}
      {geom && (
        <Pressable
          onPress={(e) => {
            const lx = e.nativeEvent.locationX;
            const idx = start + Math.floor(lx / geom.step);
            if (idx >= start && idx < shown) {
              setPressed(idx);
              onPressCandle?.(idx);
            }
          }}
        >
          <Svg width={width} height={height}>
            {/* grid */}
            {[0.2, 0.4, 0.6, 0.8].map((f) => (
              <Line key={f} x1={0} x2={geom.plotW} y1={height * f} y2={height * f} stroke={t.colors.chartGrid} strokeWidth={1} />
            ))}
            {[0.15, 0.5, 0.85].map((f) => {
              const price = geom.lo + (geom.hi - geom.lo) * (1 - f);
              return (
                <SvgText key={f} x={geom.plotW + 4} y={height * f + 4} fill={t.colors.textFaint} fontSize={10}>
                  {price.toFixed(dp)}
                </SvgText>
              );
            })}

            {/* candles */}
            {window.map((c, i) => {
              const idx = start + i;
              const bull = c.c >= c.o;
              const color = bull ? t.colors.bull : t.colors.bear;
              const cx = geom.x(idx);
              const isHl = highlight.includes(idx);
              const isPressed = pressed === idx;
              return (
                <G key={idx} opacity={1}>
                  {(isHl || isPressed) && (
                    <Rect
                      x={cx - geom.step / 2}
                      y={0}
                      width={geom.step}
                      height={height}
                      fill={isHl ? t.colors.gold : t.colors.textFaint}
                      opacity={0.14}
                    />
                  )}
                  <Line x1={cx} x2={cx} y1={geom.y(c.h)} y2={geom.y(c.l)} stroke={color} strokeWidth={1.4} />
                  <Rect
                    x={cx - geom.bodyW / 2}
                    y={Math.min(geom.y(c.o), geom.y(c.c))}
                    width={geom.bodyW}
                    height={Math.max(1.5, Math.abs(geom.y(c.o) - geom.y(c.c)))}
                    fill={color}
                    rx={1}
                  />
                </G>
              );
            })}

            {/* SMA overlays */}
            {smaOverlays.map((ov, oi) => {
              const series = smaSeries(candles, ov.period, shown);
              const pts = series
                .map((v, i) => (v !== null && i >= start ? `${geom.x(i)},${geom.y(v)}` : null))
                .filter((p): p is string => p !== null)
                .join(' ');
              if (!pts) return null;
              const color = ov.color === 'info' ? t.colors.info : t.colors.gold;
              return <Polyline key={`sma${oi}`} points={pts} fill="none" stroke={color} strokeWidth={1.6} opacity={0.9} />;
            })}

            {/* price lines */}
            {lines.map((ln, i) => (
              <G key={i}>
                <Line
                  x1={0}
                  x2={geom.plotW}
                  y1={geom.y(ln.price)}
                  y2={geom.y(ln.price)}
                  stroke={lineColor(ln.color)}
                  strokeWidth={1.4}
                  strokeDasharray={ln.dashed ? '5,4' : undefined}
                />
                {ln.label && (
                  <SvgText x={4} y={geom.y(ln.price) - 4} fill={lineColor(ln.color)} fontSize={10} fontWeight="bold">
                    {ln.label}
                  </SvgText>
                )}
              </G>
            ))}

            {/* markers */}
            {markers
              .filter((m) => m.index >= start && m.index < shown)
              .map((m, i) => {
                const cx = geom.x(m.index);
                const cy = geom.y(m.price);
                const color =
                  m.kind === 'entry' ? t.colors.info : m.kind === 'stop' || m.kind === 'loss' ? t.colors.bear : t.colors.bull;
                return (
                  <G key={`m${i}`}>
                    <Rect x={cx - 4} y={cy - 4} width={8} height={8} fill={color} rx={4} />
                    {m.label && (
                      <SvgText x={cx + 6} y={cy + 3} fill={color} fontSize={9} fontWeight="bold">
                        {m.label}
                      </SvgText>
                    )}
                  </G>
                );
              })}
          </Svg>
        </Pressable>
      )}
      {!geom && <View style={{ height }} />}
    </View>
  );
}

/** Small equity-curve sparkline in R units. */
export function EquitySparkline({ curve, height = 90 }: { curve: number[]; height?: number }) {
  const t = useTheme();
  const [width, setWidth] = useState(0);
  if (curve.length < 2) {
    return (
      <View style={{ height, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: t.colors.textFaint, fontSize: 12 }}>Not enough trades yet</Text>
      </View>
    );
  }
  const lo = Math.min(...curve, 0);
  const hi = Math.max(...curve, 0);
  const span = hi - lo || 1;
  const y = (v: number) => height - ((v - lo) / span) * (height - 10) - 5;
  const x = (i: number) => (i / (curve.length - 1)) * (width || 1);
  const up = curve[curve.length - 1] >= 0;
  return (
    <View
      accessible
      accessibilityLabel={`Equity curve ending at ${curve[curve.length - 1].toFixed(1)} R`}
      style={{ height }}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      {width > 0 && (
        <Svg width={width} height={height}>
          <Line x1={0} x2={width} y1={y(0)} y2={y(0)} stroke={t.colors.chartGrid} strokeWidth={1} strokeDasharray="4,4" />
          {curve.slice(1).map((v, i) => (
            <Line
              key={i}
              x1={x(i)}
              y1={y(curve[i])}
              x2={x(i + 1)}
              y2={y(v)}
              stroke={up ? t.colors.bull : t.colors.bear}
              strokeWidth={2}
            />
          ))}
        </Svg>
      )}
    </View>
  );
}
