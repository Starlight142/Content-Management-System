import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ManagerDashboard from '../features/dashboard/ManagerDashboard';
import TeamOverviewScreen from '../features/team/TeamOverviewScreen';
import IdeaListScreen from '../features/ideas/IdeaListScreen';
import ProfileScreen from '../features/profile/ProfileScreen';
import TabIcon from '../components/TabIcon';
import { useTheme } from '../theme/ThemeContext';

export default function ManagerNavigator({ user, onLogout }) {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [visitedScreens, setVisitedScreens] = useState({ dashboard: true });
  const [dashboardRefreshKey] = useState(0);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;

  // Dynamic bottom padding to elevate tab bar comfortably above Android gesture navigation bar / iOS home indicator
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'android' ? 18 : 10) + 6;

  useEffect(() => {
    fadeAnim.setValue(0.88);
    translateYAnim.setValue(6);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 160,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 160,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentScreen, fadeAnim, translateYAnim]);

  const handleNavigate = (screen) => {
    setVisitedScreens((prev) => (prev[screen] ? prev : { ...prev, [screen]: true }));
    setCurrentScreen(screen);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View
        renderToHardwareTextureAndroid
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: translateYAnim }],
          },
        ]}
      >
        {visitedScreens.dashboard && (
          <View style={[styles.screenSlot, currentScreen !== 'dashboard' && styles.hiddenSlot]}>
            <ManagerDashboard
              user={user}
              onNavigate={handleNavigate}
              refreshKey={dashboardRefreshKey}
            />
          </View>
        )}
        {visitedScreens.team && (
          <View style={[styles.screenSlot, currentScreen !== 'team' && styles.hiddenSlot]}>
            <TeamOverviewScreen
              user={user}
              onNavigate={handleNavigate}
            />
          </View>
        )}
        {visitedScreens.ideas && (
          <View style={[styles.screenSlot, currentScreen !== 'ideas' && styles.hiddenSlot]}>
            <IdeaListScreen user={user} onBack={() => handleNavigate('dashboard')} />
          </View>
        )}
        {visitedScreens.profile && (
          <View style={[styles.screenSlot, currentScreen !== 'profile' && styles.hiddenSlot]}>
            <ProfileScreen
              user={user}
              onLogout={onLogout}
            />
          </View>
        )}
      </Animated.View>

      {/* Persistent Bottom Tab Navigation Bar for Manager */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: colors.tabBg,
            borderTopColor: colors.tabBorder,
            paddingBottom: bottomPadding,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.tabItem, currentScreen === 'dashboard' && { backgroundColor: colors.tabActive }]}
          onPress={() => handleNavigate('dashboard')}
          activeOpacity={0.75}
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
          onPress={() => handleNavigate('team')}
          activeOpacity={0.75}
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
          onPress={() => handleNavigate('ideas')}
          activeOpacity={0.75}
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
          onPress={() => handleNavigate('profile')}
          activeOpacity={0.75}
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
  screenSlot: {
    flex: 1,
  },
  hiddenSlot: {
    display: 'none',
  },
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
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
