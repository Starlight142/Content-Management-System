import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ManagerDashboard from '../features/dashboard/ManagerDashboard';
import TeamOverviewScreen from '../features/team/TeamOverviewScreen';
import IdeaListScreen from '../features/ideas/IdeaListScreen';
import LegalChecklistScreen from '../features/legal/LegalChecklistScreen';
import ProfileScreen from '../features/profile/ProfileScreen';
import TabIcon from '../components/TabIcon';
import { useTheme } from '../theme/ThemeContext';

export default function ManagerNavigator({ user, onLogout }) {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [targetContent, setTargetContent] = useState(null);
  const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);
  const { colors } = useTheme();

  const handleNavigate = (screen, content = null) => {
    if (content) setTargetContent(content);
    setCurrentScreen(screen);
  };

  const handleAuditComplete = () => {
    setDashboardRefreshKey((prev) => prev + 1);
    setCurrentScreen('dashboard');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {currentScreen === 'dashboard' && (
          <ManagerDashboard
            user={user}
            onNavigate={handleNavigate}
            refreshKey={dashboardRefreshKey}
          />
        )}
        {currentScreen === 'team' && (
          <TeamOverviewScreen
            user={user}
            onNavigate={(screen) => setCurrentScreen(screen)}
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
        {currentScreen === 'profile' && (
          <ProfileScreen
            user={user}
            onLogout={onLogout}
          />
        )}
      </View>

      {/* Persistent Bottom Tab Navigation Bar for Manager */}
      <View style={[styles.bottomBar, { backgroundColor: colors.tabBg, borderTopColor: colors.tabBorder }]}>
        <TouchableOpacity
          style={[styles.tabItem, currentScreen === 'dashboard' && { backgroundColor: colors.tabActive }]}
          onPress={() => setCurrentScreen('dashboard')}
        >
          <TabIcon name="pipeline" active={currentScreen === 'dashboard'} />
          <Text
            style={[
              styles.tabLabel,
              { color: currentScreen === 'dashboard' ? colors.tabIconActive : colors.tabIconInactive },
              currentScreen === 'dashboard' && styles.tabLabelActive,
            ]}
          >
            งานผลิต
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, currentScreen === 'team' && { backgroundColor: colors.tabActive }]}
          onPress={() => setCurrentScreen('team')}
        >
          <TabIcon name="team" active={currentScreen === 'team'} />
          <Text
            style={[
              styles.tabLabel,
              { color: currentScreen === 'team' ? colors.tabIconActive : colors.tabIconInactive },
              currentScreen === 'team' && styles.tabLabelActive,
            ]}
          >
            ภาพรวมทีม
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, currentScreen === 'ideas' && { backgroundColor: colors.tabActive }]}
          onPress={() => setCurrentScreen('ideas')}
        >
          <TabIcon name="ideas" active={currentScreen === 'ideas'} />
          <Text
            style={[
              styles.tabLabel,
              { color: currentScreen === 'ideas' ? colors.tabIconActive : colors.tabIconInactive },
              currentScreen === 'ideas' && styles.tabLabelActive,
            ]}
          >
            ไอเดีย
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, currentScreen === 'profile' && { backgroundColor: colors.tabActive }]}
          onPress={() => setCurrentScreen('profile')}
        >
          <TabIcon name="profile" active={currentScreen === 'profile'} />
          <Text
            style={[
              styles.tabLabel,
              { color: currentScreen === 'profile' ? colors.tabIconActive : colors.tabIconInactive },
              currentScreen === 'profile' && styles.tabLabelActive,
            ]}
          >
            โปรไฟล์
          </Text>
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
    minWidth: 64,
  },
  tabActive: {
    backgroundColor: '#F1F5F9',
  },
  tabLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  tabLabelActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
});
