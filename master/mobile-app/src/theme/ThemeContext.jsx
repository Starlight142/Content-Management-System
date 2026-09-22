import React, { createContext, useContext, useState, useMemo } from 'react';

export const lightColors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSubtle: '#F1F5F9',
  cardBg: '#FFFFFF',
  cardBorder: '#E2E8F0',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  divider: '#F1F5F9',
  inputBg: '#FFFFFF',
  inputBorder: '#CBD5E1',
  tabBg: '#FFFFFF',
  tabBorder: '#E2E8F0',
  tabActive: '#F1F5F9',
  tabIconActive: '#0F172A',
  tabIconInactive: '#94A3B8',
  primary: '#4F46E5',
  primaryText: '#FFFFFF',

  // Status badges
  statusApprovedBg: '#DCFCE7',
  statusApprovedText: '#16A34A',
  statusReviewBg: '#FEF3C7',
  statusReviewText: '#D97706',
  statusRevisionBg: '#FEE2E2',
  statusRevisionText: '#DC2626',
  statusProdBg: '#F1F5F9',
  statusProdText: '#475569',
};

export const darkColors = {
  background: '#0B0F17',
  surface: '#1E293B',
  surfaceSubtle: '#334155',
  cardBg: '#1E293B',
  cardBorder: '#334155',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  border: '#334155',
  divider: '#334155',
  inputBg: '#0F172A',
  inputBorder: '#475569',
  tabBg: '#111827',
  tabBorder: '#1F2937',
  tabActive: '#1F2937',
  tabIconActive: '#F8FAFC',
  tabIconInactive: '#64748B',
  primary: '#6366F1',
  primaryText: '#FFFFFF',

  // Status badges
  statusApprovedBg: '#064E3B',
  statusApprovedText: '#4ADE80',
  statusReviewBg: '#78350F',
  statusReviewText: '#FBBF24',
  statusRevisionBg: '#7F1D1D',
  statusRevisionText: '#F87171',
  statusProdBg: '#334155',
  statusProdText: '#CBD5E1',
};

const ThemeContext = createContext({
  isDark: false,
  toggleTheme: () => {},
  colors: lightColors,
});

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const colors = useMemo(() => (isDark ? darkColors : lightColors), [isDark]);

  const value = useMemo(
    () => ({
      isDark,
      toggleTheme,
      colors,
    }),
    [isDark, colors]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeContext;
