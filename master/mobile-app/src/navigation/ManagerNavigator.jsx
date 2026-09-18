import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ManagerDashboard from '../features/dashboard/ManagerDashboard';
import IdeaListScreen from '../features/ideas/IdeaListScreen';
import LegalChecklistScreen from '../features/legal/LegalChecklistScreen';

export default function ManagerNavigator({ user, onLogout }) {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [targetContent, setTargetContent] = useState(null);

  const handleNavigate = (screen, content = null) => {
    if (content) setTargetContent(content);
    setCurrentScreen(screen);
  };

  const handleAuditComplete = () => {
    setCurrentScreen('dashboard');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {currentScreen === 'dashboard' && (
          <ManagerDashboard
            user={user}
            onNavigate={handleNavigate}
            onLogout={onLogout}
          />
        )}
        {currentScreen === 'ideas' && (
          <IdeaListScreen onBack={() => setCurrentScreen('dashboard')} />
        )}
        {currentScreen === 'legal' && (
          <LegalChecklistScreen
            targetContent={targetContent}
            onBack={() => setCurrentScreen('dashboard')}
            onAuditComplete={handleAuditComplete}
          />
        )}
      </View>

      {/* Persistent Bottom Tab Navigation Bar (Academic & Figma Standard) */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.tabItem, currentScreen === 'dashboard' && styles.tabActive]}
          onPress={() => setCurrentScreen('dashboard')}
        >
          <Text style={[styles.tabIcon, currentScreen === 'dashboard' && styles.tabIconActive]}>📊</Text>
          <Text style={[styles.tabLabel, currentScreen === 'dashboard' && styles.tabLabelActive]}>Pipeline</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, currentScreen === 'ideas' && styles.tabActive]}
          onPress={() => setCurrentScreen('ideas')}
        >
          <Text style={[styles.tabIcon, currentScreen === 'ideas' && styles.tabIconActive]}>💡</Text>
          <Text style={[styles.tabLabel, currentScreen === 'ideas' && styles.tabLabelActive]}>Idea Board</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, currentScreen === 'legal' && styles.tabActive]}
          onPress={() => {
            setTargetContent(null);
            setCurrentScreen('legal');
          }}
        >
          <Text style={[styles.tabIcon, currentScreen === 'legal' && styles.tabIconActive]}>⚖️</Text>
          <Text style={[styles.tabLabel, currentScreen === 'legal' && styles.tabLabelActive]}>Legal Audit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={onLogout}
        >
          <Text style={styles.tabIcon}>🚪</Text>
          <Text style={styles.tabLabel}>ออกระบบ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
  },
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  tabItem: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#EEF2FF',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 2,
    opacity: 0.6,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  tabLabelActive: {
    color: '#4F46E5',
    fontWeight: '700',
  },
});
