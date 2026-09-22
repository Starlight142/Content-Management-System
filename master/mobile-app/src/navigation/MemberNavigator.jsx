import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import TeamOverviewScreen from '../features/team/TeamOverviewScreen';
import MemberTaskList from '../features/tasks/MemberTaskList';
import IdeaListScreen from '../features/ideas/IdeaListScreen';
import ProfileScreen from '../features/profile/ProfileScreen';
import TabIcon from '../components/TabIcon';

export default function MemberNavigator({ user, onLogout }) {
  const [currentScreen, setCurrentScreen] = useState('team');

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {currentScreen === 'team' && (
          <TeamOverviewScreen
            user={user}
            onNavigate={(screen) => setCurrentScreen(screen)}
          />
        )}
        {currentScreen === 'tasks' && (
          <MemberTaskList
            user={user}
            onNavigate={(screen) => setCurrentScreen(screen)}
          />
        )}
        {currentScreen === 'ideas' && (
          <IdeaListScreen onBack={() => setCurrentScreen('team')} />
        )}
        {currentScreen === 'profile' && (
          <ProfileScreen
            user={user}
            onLogout={onLogout}
          />
        )}
      </View>

      {/* Persistent Bottom Tab Bar for Member */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.tabItem, currentScreen === 'team' && styles.tabActive]}
          onPress={() => setCurrentScreen('team')}
        >
          <TabIcon name="team" active={currentScreen === 'team'} />
          <Text style={[styles.tabLabel, currentScreen === 'team' && styles.tabLabelActive]}>ทีมของฉัน</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, currentScreen === 'tasks' && styles.tabActive]}
          onPress={() => setCurrentScreen('tasks')}
        >
          <TabIcon name="tasks" active={currentScreen === 'tasks'} />
          <Text style={[styles.tabLabel, currentScreen === 'tasks' && styles.tabLabelActive]}>งานของฉัน</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, currentScreen === 'ideas' && styles.tabActive]}
          onPress={() => setCurrentScreen('ideas')}
        >
          <TabIcon name="ideas" active={currentScreen === 'ideas'} />
          <Text style={[styles.tabLabel, currentScreen === 'ideas' && styles.tabLabelActive]}>ไอเดีย</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, currentScreen === 'profile' && styles.tabActive]}
          onPress={() => setCurrentScreen('profile')}
        >
          <TabIcon name="profile" active={currentScreen === 'profile'} />
          <Text style={[styles.tabLabel, currentScreen === 'profile' && styles.tabLabelActive]}>โปรไฟล์</Text>
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
