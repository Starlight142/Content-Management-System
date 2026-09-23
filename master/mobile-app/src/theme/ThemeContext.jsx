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
  tabIconActive: '#2563EB',
  tabIconInactive: '#64748B',
  primary: '#2563EB',
  primaryText: '#FFFFFF',

  // Status badges & indicators (Modern & Professional)
  statusInProgressBg: '#EFF6FF',
  statusInProgressText: '#2563EB',
  statusInProgressBorder: '#BFDBFE',

  statusReviewBg: '#FEF9C3',
  statusReviewText: '#CA8A04',
  statusReviewBorder: '#FDE047',

  statusRevisionBg: '#FFEDD5',
  statusRevisionText: '#EA580C',
  statusRevisionBorder: '#FDBA74',

  statusApprovedBg: '#DCFCE7',
  statusApprovedText: '#16A34A',
  statusApprovedBorder: '#86EFAC',

  statusUrgentBg: '#FEE2E2',
  statusUrgentText: '#DC2626',
  statusUrgentBorder: '#FCA5A5',

  statusTodoBg: '#F1F5F9',
  statusTodoText: '#64748B',
  statusTodoBorder: '#CBD5E1',

  // Backward compatibility aliases
  statusProdBg: '#EFF6FF',
  statusProdText: '#2563EB',
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
  tabIconActive: '#60A5FA',
  tabIconInactive: '#64748B',
  primary: '#3B82F6',
  primaryText: '#FFFFFF',

  // Status badges & indicators (Modern & Professional)
  statusInProgressBg: '#1E3A8A',
  statusInProgressText: '#60A5FA',
  statusInProgressBorder: '#2563EB',

  statusReviewBg: '#713F12',
  statusReviewText: '#FDE047',
  statusReviewBorder: '#A16207',

  statusRevisionBg: '#7C2D12',
  statusRevisionText: '#FB923C',
  statusRevisionBorder: '#C2410C',

  statusApprovedBg: '#064E3B',
  statusApprovedText: '#4ADE80',
  statusApprovedBorder: '#16A34A',

  statusUrgentBg: '#7F1D1D',
  statusUrgentText: '#F87171',
  statusUrgentBorder: '#DC2626',

  statusTodoBg: '#334155',
  statusTodoText: '#94A3B8',
  statusTodoBorder: '#475569',

  // Backward compatibility aliases
  statusProdBg: '#1E3A8A',
  statusProdText: '#60A5FA',
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
