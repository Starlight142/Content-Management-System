import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { presenceService } from '../../services/presenceService';

export default function ProfileScreen({ user, onLogout }) {
  const { isDark, toggleTheme, colors } = useTheme();
  const [isOnline, setIsOnline] = useState(presenceService.isConnected);

  useEffect(() => {
    setIsOnline(presenceService.isConnected);
    const unsubscribe = presenceService.subscribe((event) => {
      if (event.type === 'CONNECTION_CHANGE') {
        setIsOnline(event.isConnected);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleConfirmLogout = () => {
    Alert.alert(
      'ออกจากระบบ',
      'คุณต้องการออกจากระบบของแอปพลิเคชัน Draftly หรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ออกจากระบบ',
          style: 'destructive',
          onPress: onLogout,
        },
      ]
    );
  };

  const isManager = user?.role === 'MANAGER';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top Bar Header */}
      <View style={[styles.topBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.topBarTitle, { color: colors.textPrimary }]}>ข้อมูลส่วนตัวและตั้งค่า</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* User Card */}
        <View style={[styles.userCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <View style={[styles.avatar, { backgroundColor: isDark ? colors.surfaceSubtle : '#0F172A' }]}>
            <Text style={styles.avatarText}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.textPrimary }]}>{user?.name || 'ผู้ใช้งาน Draftly'}</Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email || 'user@studio.com'}</Text>
            <View style={[styles.roleBadge, { backgroundColor: colors.surfaceSubtle }]}>
              <Text style={[styles.roleText, { color: colors.textPrimary }]}>
                {isManager ? 'ผู้จัดการฝ่ายผลิต (Manager)' : 'ทีมงานสร้างสรรค์ (Member)'}
              </Text>
            </View>
          </View>
        </View>

        {/* Section: Appearance / Theme Settings */}
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>การแสดงผลและธีม</Text>
        <View style={[styles.menuGroup, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <View style={styles.menuItem}>
            <View>
              <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>โหมดมืด (Dark Mode)</Text>
              <Text style={[styles.menuSubLabel, { color: colors.textSecondary }]}>
                {isDark ? 'เปิดใช้งานอยู่' : 'ปิดใช้งานอยู่'}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#CBD5E1', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Section: Profile Info */}
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>ข้อมูลบัญชี</Text>
        <View style={[styles.menuGroup, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <View style={styles.menuItem}>
            <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>รหัสผู้ใช้งาน</Text>
            <Text style={[styles.menuValue, { color: colors.textSecondary }]}>#{user?.id || '2026-01'}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <View style={styles.menuItem}>
            <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>สังกัดทีม</Text>
            <Text style={[styles.menuValue, { color: colors.textSecondary }]}>Content Team A</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <View style={styles.menuItem}>
            <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>สถานะการเชื่อมต่อ</Text>
            <View style={styles.statusRow}>
              <View style={[styles.activeDot, { backgroundColor: isOnline ? colors.statusApprovedText : colors.textMuted }]} />
              <Text style={[styles.statusText, { color: isOnline ? colors.statusApprovedText : colors.textSecondary }]}>
                {isOnline ? 'ออนไลน์ (Online • Live)' : 'ออฟไลน์ (Offline)'}
              </Text>
            </View>
          </View>
        </View>

        {/* Section: Application Info */}
        <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>เกี่ยวกับระบบ</Text>
        <View style={[styles.menuGroup, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <View style={styles.menuItem}>
            <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>ชื่อระบบ</Text>
            <Text style={[styles.menuValue, { color: colors.textSecondary }]}>Draftly CMS</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <View style={styles.menuItem}>
            <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>เวอร์ชันแอปพลิเคชัน</Text>
            <Text style={[styles.menuValue, { color: colors.textSecondary }]}>v1.0.0 (Production Core)</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <View style={styles.menuItem}>
            <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>การเชื่อมต่อฐานข้อมูล</Text>
            <Text style={[styles.menuValue, { color: colors.textSecondary }]}>MongoDB / Express API</Text>
          </View>
        </View>

        {/* Section: Logout Action */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity
            style={[
              styles.logoutButton,
              {
                backgroundColor: colors.cardBg,
                borderColor: isDark ? '#7F1D1D' : '#FCA5A5',
              },
            ]}
            onPress={handleConfirmLogout}
            activeOpacity={0.8}
          >
            <Text style={[styles.logoutButtonText, { color: isDark ? '#F87171' : '#DC2626' }]}>ออกจากระบบ</Text>
          </TouchableOpacity>
          <Text style={[styles.logoutHint, { color: colors.textMuted }]}>
            เมื่อออกจากระบบ คุณจะต้องเข้าสู่ระบบใหม่ด้วยอีเมลและรหัสผ่าน
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  userEmail: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 8,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuLabel: {
    fontSize: 14,
    color: '#334155',
  },
  menuSubLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  menuValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#16A34A',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 16,
  },
  logoutContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  logoutButton: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#DC2626',
  },
  logoutHint: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 10,
    textAlign: 'center',
  },
});
