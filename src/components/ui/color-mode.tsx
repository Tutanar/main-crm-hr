'use client';

import * as React from 'react';
import { ThemeProvider, useTheme } from 'next-themes';

export function ColorModeProvider({ children }: { children: React.ReactNode }) {
  // Provider is already applied in app/providers.tsx, so just render children.
  return <>{children}</>;
}

type ColorMode = 'light' | 'dark';

export function useColorMode() {
  const { resolvedTheme, setTheme } = useTheme();
  const colorMode: ColorMode = (resolvedTheme as ColorMode) ?? 'light';

  const toggleColorMode = React.useCallback(() => {
    setTheme(colorMode === 'light' ? 'dark' : 'light');
  }, [colorMode, setTheme]);

  const setColorMode = React.useCallback((mode: ColorMode) => {
    setTheme(mode);
  }, [setTheme]);

  return { colorMode, toggleColorMode, setColorMode };
}

export function useColorModeValue<TValue>(lightValue: TValue, darkValue: TValue): TValue {
  const { resolvedTheme } = useTheme();
  const mode: ColorMode = (resolvedTheme as ColorMode) ?? 'light';
  return mode === 'light' ? lightValue : darkValue;
}

