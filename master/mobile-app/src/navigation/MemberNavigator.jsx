import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MemberTaskList from '../features/tasks/MemberTaskList';
import IdeaListScreen from '../features/ideas/IdeaListScreen';

export default function MemberNavigator({ user, onLogout }) {
  const [currentScreen, setCurrentScreen] = useState('tasks');

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {currentScreen === 'tasks' && (
          <MemberTaskList
            user={user}
            onLogout={onLogout}
            onNavigate={(screen) => setCurrentScreen(screen)}
          />
        )}
        {currentScreen === 'ideas' && (
          <IdeaListScreen onBack={() => setCurrentScreen('tasks')} />
        )}
      </View>

      {/* Persistent Bottom Tab Bar for Member */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.tabItem, currentScreen === 'tasks' && styles.tabActive]}
          onPress={() => setCurrentScreen('tasks')}
        >
          <Text style={[styles.tabIcon, currentScreen === 'tasks' && styles.tabIconActive]}>📋</Text>
          <Text style={[styles.tabLabel, currentScreen === 'tasks' && styles.tabLabelActive]}>My Tasks</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, currentScreen === 'ideas' && styles.tabActive]}
          onPress={() => setCurrentScreen('ideas')}
        >
          <Text style={[styles.tabIcon, currentScreen === 'ideas' && styles.tabIconActive]}>💡</Text>
          <Text style={[styles.tabLabel, currentScreen === 'ideas' && styles.tabLabelActive]}>Idea Board</Text>
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
    paddingHorizontal: 16,
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
    paddingHorizontal: 16,
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
