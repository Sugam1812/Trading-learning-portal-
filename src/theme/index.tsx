import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useSettings } from '@/store/settings';

/**
 * PipQuest design tokens.
 * Dark theme: premium trading-desk navy. Light theme: clean learning surface.
 * Bull/bear colors have a color-vision-friendly alternative (blue/orange).
 */

export interface Theme {
  dark: boolean;
  colors: {
    bg: string;
    surface: string;
    surfaceAlt: string;
    border: string;
    text: string;
    textDim: string;
    textFaint: string;
    accent: string;
    accentSoft: string;
    gold: string;
    bull: string;
    bear: string;
    bullSoft: string;
    bearSoft: string;
    success: string;
    danger: string;
    warning: string;
    info: string;
    chartGrid: string;
  };
  radius: { sm: number; md: number; lg: number; xl: number };
  space: (n: number) => number;
}

const darkColors = {
  bg: '#0B1220',
  surface: '#131C2E',
  surfaceAlt: '#1B2740',
  border: '#26334D',
  text: '#EAF0FA',
  textDim: '#9DACC7',
  textFaint: '#64748E',
  accent: '#37D6B0',
  accentSoft: '#123B34',
  gold: '#F0C060',
  success: '#37D6B0',
  danger: '#F4586C',
  warning: '#F0A860',
  info: '#5CA8F5',
  chartGrid: '#1D2A44',
};

const lightColors = {
  bg: '#F4F7FB',
  surface: '#FFFFFF',
  surfaceAlt: '#EAF0F8',
  border: '#D8E1EE',
  text: '#14213A',
  textDim: '#51617E',
  textFaint: '#8A99B5',
  accent: '#0E9F82',
  accentSoft: '#D9F2EB',
  gold: '#B8860B',
  success: '#0E9F82',
  danger: '#D63A55',
  warning: '#C77B22',
  info: '#2467C4',
  chartGrid: '#E3EAF4',
};

function buildTheme(dark: boolean, colorBlind: boolean): Theme {
  const base = dark ? darkColors : lightColors;
  const bull = colorBlind ? (dark ? '#5CA8F5' : '#2467C4') : dark ? '#2FBF8F' : '#0E9F82';
  const bear = colorBlind ? (dark ? '#F0A860' : '#C77B22') : dark ? '#F4586C' : '#D63A55';
  return {
    dark,
    colors: {
      ...base,
      bull,
      bear,
      bullSoft: dark ? '#12362D' : '#DCF2EA',
      bearSoft: dark ? '#3B1A22' : '#F9E0E5',
    },
    radius: { sm: 8, md: 12, lg: 16, xl: 24 },
    space: (n) => n * 4,
  };
}

const ThemeContext = createContext<Theme>(buildTheme(true, false));

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const mode = useSettings((s) => s.themeMode);
  const colorBlind = useSettings((s) => s.colorBlindMode);
  const dark = mode === 'system' ? system !== 'light' : mode === 'dark';
  const theme = useMemo(() => buildTheme(dark, colorBlind), [dark, colorBlind]);
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
