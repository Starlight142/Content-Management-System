import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { presenceService } from '../../services/presenceService';
import { userApi } from '../../services/api';
import SmoothModal from '../../components/SmoothModal';

export default function ProfileScreen({ user, onLogout }) {
  const { isDark, toggleTheme, colors } = useTheme();
  const [isOnline, setIsOnline] = useState(presenceService.isConnected);

  // Local user profile state
  const [localUser, setLocalUser] = useState(user || {});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) setLocalUser(user);
  }, [user]);

  useEffect(() => {
    setIsOnline(presenceService.isConnected);
    const unsubscribe = presenceService.subscribe((event) => {
      if (event.type === 'CONNECTION_CHANGE') {
        setIsOnline(event.isConnected);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleOpenEdit = () => {
    const defaultFirst = localUser.firstName || (localUser.name ? localUser.name.split(' ')[0] : '');
    const defaultLast = localUser.lastName || (localUser.name ? localUser.name.split(' ').slice(1).join(' ') : '');
    setEditFirstName(defaultFirst);
    setEditLastName(defaultLast);
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!editFirstName.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกชื่อ');
      return;
    }

    try {
      setSaving(true);
      const updatedData = {
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        name: `${editFirstName.trim()} ${editLastName.trim()}`.trim(),
      };

      const res = await userApi.updateProfile(updatedData);
      const updatedUser = res?.user || { ...localUser, ...updatedData };
      setLocalUser(updatedUser);
      setIsEditModalOpen(false);
      Alert.alert('สำเร็จ', 'อัปเดตข้อมูลบัญชีส่วนตัวเรียบร้อยแล้ว');
    } catch (err) {
      // Fallback local update if offline
      const updatedData = {
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        name: `${editFirstName.trim()} ${editLastName.trim()}`.trim(),
      };
      setLocalUser((prev) => ({ ...prev, ...updatedData }));
      setIsEditModalOpen(false);
      Alert.alert('บันทึกแล้ว', 'อัปเดตข้อมูลส่วนตัวในเครื่องเรียบร้อยแล้ว');
    } finally {
      setSaving(false);
    }
  };

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

  const isManager = localUser?.role === 'MANAGER';
  const displayName = localUser?.firstName
    ? `${localUser.firstName} ${localUser.lastName || ''}`.trim()
    : (localUser?.name || 'ผู้ใช้งาน Draftly');

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
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.textPrimary }]}>{displayName}</Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{localUser?.email || 'user@studio.com'}</Text>
            <View style={[styles.roleBadge, { backgroundColor: colors.surfaceSubtle }]}>
              <Text style={[styles.roleText, { color: colors.textPrimary }]}>
                {isManager ? 'ผู้จัดการฝ่ายผลิต (Manager)' : 'ทีมงานสร้างสรรค์ (Member)'}
              </Text>
            </View>

            {/* Edit Profile Button */}
            <TouchableOpacity
              style={[styles.editProfileBtn, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}
              onPress={handleOpenEdit}
              activeOpacity={0.8}
            >
              <Text style={[styles.editProfileText, { color: colors.primary }]}>แก้ไขโปรไฟล์ส่วนตัว</Text>
            </TouchableOpacity>
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
            <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>ชื่อ-นามสกุล</Text>
            <Text style={[styles.menuValue, { color: colors.textSecondary }]}>{displayName}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <View style={styles.menuItem}>
            <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>รหัสผู้ใช้งาน</Text>
            <Text style={[styles.menuValue, { color: colors.textSecondary }]}>#{localUser?.id || localUser?._id || '2026-01'}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <View style={styles.menuItem}>
            <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>สังกัดทีม</Text>
            <Text style={[styles.menuValue, { color: colors.textSecondary }]}>{localUser?.teamName || localUser?.team || 'Content Team A'}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <View style={styles.menuItem}>
            <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>สถานะการเชื่อมต่อ</Text>
            <View style={styles.statusRow}>
              <View style={[styles.activeDot, { backgroundColor: isOnline ? colors.statusApprovedText : colors.textMuted }]} />
              <Text style={[styles.statusText, { color: isOnline ? colors.statusApprovedText : colors.textSecondary }]}>
                {isOnline ? 'ออนไลน์' : 'ออฟไลน์'}
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

      {/* Edit Profile Modal */}
      <SmoothModal
        visible={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="แก้ไขข้อมูลส่วนตัว"
        subtitle="อัปเดตชื่อและนามสกุลสำหรับแสดงผลในระบบ"
      >
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>ชื่อ (First Name)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surfaceSubtle, color: colors.textPrimary, borderColor: colors.border }]}
            value={editFirstName}
            onChangeText={setEditFirstName}
            placeholder="ชื่อของคุณ"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>นามสกุล (Last Name)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surfaceSubtle, color: colors.textPrimary, borderColor: colors.border }]}
            value={editLastName}
            onChangeText={setEditLastName}
            placeholder="นามสกุลของคุณ"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.modalButtons}>
          <TouchableOpacity
            style={[styles.modalBtnCancel, { backgroundColor: colors.surfaceSubtle }]}
            onPress={() => setIsEditModalOpen(false)}
            activeOpacity={0.8}
          >
            <Text style={[styles.modalBtnCancelText, { color: colors.textSecondary }]}>ยกเลิก</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalBtnSubmit, { backgroundColor: colors.primary }]}
            onPress={handleSaveProfile}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.modalBtnSubmitText}>บันทึกข้อมูล</Text>
            )}
          </TouchableOpacity>
        </View>
      </SmoothModal>
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
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  editProfileBtn: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 8,
  },
  editProfileText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
  modalBtnCancel: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  modalBtnCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  modalBtnSubmit: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnSubmitText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
