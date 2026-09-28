import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authApi, setAuthToken, getBaseUrl } from '../../services/api';
import { useTheme } from '../../theme/ThemeContext';
import ServerConfigModal from '../../components/ServerConfigModal';

export default function LoginScreen({ onLoginSuccess }) {
  const { isDark, colors } = useTheme();
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'

  // Server Config Modal state
  const [showServerModal, setShowServerModal] = useState(false);
  const [currentServerUrl, setCurrentServerUrl] = useState('');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [teamCode, setTeamCode] = useState('');
  const [selectedRole, setSelectedRole] = useState('MEMBER');
  const [loading, setLoading] = useState(false);

  // Hidden Demo Accounts Drawer
  const [showDemoDrawer, setShowDemoDrawer] = useState(false);

  useEffect(() => {
    setCurrentServerUrl(getBaseUrl());
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.login(email.trim(), password);
      if (res.token) {
        setAuthToken(res.token);
      }
      onLoginSuccess({
        id: res.user?.id || 1,
        name: res.user?.firstName
          ? `${res.user.firstName} ${res.user.lastName || ''}`.trim()
          : (selectedRole === 'MANAGER' ? 'สมศรี (Manager)' : 'จอห์น (Member)'),
        role: res.user?.role || selectedRole,
        email: email.trim(),
        teamId: res.user?.teamId,
        teamName: res.user?.teamName,
      });
    } catch (err) {
      // If error is actual invalid credentials, notify user
      if (err.message && err.message.includes('Invalid credentials')) {
        Alert.alert('เข้าสู่ระบบไม่สำเร็จ', 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      } else {
        // Fallback for offline/local simulation
        Alert.alert(
          'การเชื่อมต่อ Server มีปัญหา',
          `${err.message || 'ไม่สามารถติดต่อ Server ได้'}\n\nต้องการใช้โหมดจำลองออฟไลน์ (Offline Mode) หรือไม่?`,
          [
            { text: 'ยกเลิก', style: 'cancel' },
            {
              text: 'เข้าสู่โหมดจำลอง',
              onPress: () => {
                onLoginSuccess({
                  id: selectedRole === 'MANAGER' ? 101 : 202,
                  name: selectedRole === 'MANAGER' ? 'Somsri (Manager)' : 'John (Creator/Member)',
                  role: selectedRole,
                  email: email.trim(),
                });
              },
            },
          ]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!firstName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกชื่อ, อีเมล และรหัสผ่านให้ครบถ้วน');
      return;
    }

    if (!teamCode.trim()) {
      Alert.alert('จำเป็นต้องมีรหัสทีม', 'กรุณาระบุรหัสสำหรับเข้าทีม (เช่น TEAM-A หรือ TEAM-B)');
      return;
    }

    if (password.length < 6) {
      Alert.alert('ข้อผิดพลาด', 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    setLoading(true);
    try {
      const username = email.split('@')[0] || `user_${Date.now()}`;
      const res = await authApi.register({
        username,
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim() || '',
        role: selectedRole,
        teamCode: teamCode.trim().toUpperCase(),
      });

      Alert.alert(
        'ลงทะเบียนสำเร็จ 🎉',
        `ยินดีต้อนรับเข้าสู่ทีม ${res.user?.teamName || teamCode}!\nกรุณาเข้าสู่ระบบด้วยบัญชีของคุณ`,
        [
          {
            text: 'เข้าสู่ระบบเลย',
            onPress: () => {
              setActiveTab('login');
              setPassword('');
            },
          },
        ]
      );
    } catch (err) {
      Alert.alert('ข้อผิดพลาดในการลงทะเบียน', err.message || 'ไม่สามารถลงทะเบียนได้ กรุณาตรวจสอบข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const applyDemoAccount = (demoEmail, demoRole) => {
    setEmail(demoEmail);
    setPassword('123456');
    setSelectedRole(demoRole);
    setActiveTab('login');
  };

  // Format short display for current server URL pill
  const getShortServerLabel = () => {
    if (!currentServerUrl) return 'Server ⚙️';
    if (currentServerUrl.includes('trycloudflare.com')) return '☁️ Cloudflare ⚙️';
    if (currentServerUrl.includes('192.168.')) {
      const match = currentServerUrl.match(/192\.168\.\d+\.\d+/);
      return `⚡ Wi-Fi (${match ? match[0] : 'LAN'}) ⚙️`;
    }
    if (currentServerUrl.includes('127.0.0.1') || currentServerUrl.includes('localhost')) {
      return '🔌 USB / Local ⚙️';
    }
    return '🌐 Server ⚙️';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Bar with Server Config Placement */}
          <View style={styles.topBar}>
            <View style={styles.brandSmall}>
              <View style={[styles.logoIconSmall, { backgroundColor: colors.primary }]}>
                <Text style={styles.logoIconTextSmall}>D</Text>
              </View>
              <Text style={[styles.brandText, { color: colors.textPrimary }]}>Draftly</Text>
            </View>

            {/* Server URL Pill Button */}
            <TouchableOpacity
              style={[
                styles.serverPillBtn,
                {
                  backgroundColor: isDark ? colors.surface : '#F1F5F9',
                  borderColor: isDark ? colors.border : '#CBD5E1',
                },
              ]}
              onPress={() => setShowServerModal(true)}
              activeOpacity={0.7}
            >
              <View style={styles.onlineDot} />
              <Text style={[styles.serverPillText, { color: colors.textSecondary }]}>
                {getShortServerLabel()}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Hero Header */}
          <View style={styles.heroHeader}>
            <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>
              {activeTab === 'login' ? 'เข้าสู่ระบบ' : 'สร้างบัญชีใหม่'}
            </Text>
            <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
              {activeTab === 'login'
                ? 'ระบบบริหารกระบวนการผลิต Content สตูดิโอ'
                : 'เข้าร่วมทีมสร้างสรรค์ Content ด้วยรหัสเชิญของทีม'}
            </Text>
          </View>

          {/* Segmented Tab Switcher */}
          <View style={[styles.tabBar, { backgroundColor: isDark ? colors.surface : '#E2E8F0' }]}>
            <TouchableOpacity
              style={[
                styles.tabBtn,
                activeTab === 'login' && [styles.tabBtnActive, { backgroundColor: colors.cardBg }],
              ]}
              onPress={() => setActiveTab('login')}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  { color: colors.textSecondary },
                  activeTab === 'login' && { color: colors.textPrimary, fontWeight: '700' },
                ]}
              >
                เข้าสู่ระบบ (Sign In)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabBtn,
                activeTab === 'register' && [styles.tabBtnActive, { backgroundColor: colors.cardBg }],
              ]}
              onPress={() => setActiveTab('register')}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  { color: colors.textSecondary },
                  activeTab === 'register' && { color: colors.textPrimary, fontWeight: '700' },
                ]}
              >
                ลงทะเบียน (Sign Up)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Main Card Form */}
          <View style={[styles.formCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            {/* REGISTER-ONLY: Names & Team Code */}
            {activeTab === 'register' && (
              <>
                <View style={styles.rowInputs}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 6 }]}>
                    <Text style={[styles.label, { color: colors.textPrimary }]}>ชื่อจริง *</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }]}
                      placeholder="เช่น สมศรี"
                      placeholderTextColor={colors.textMuted}
                      value={firstName}
                      onChangeText={setFirstName}
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 6 }]}>
                    <Text style={[styles.label, { color: colors.textPrimary }]}>นามสกุล</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }]}
                      placeholder="จัดการทีม"
                      placeholderTextColor={colors.textMuted}
                      value={lastName}
                      onChangeText={setLastName}
                    />
                  </View>
                </View>

                {/* Team Access Code Field */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Text style={[styles.label, { color: colors.textPrimary }]}>รหัสสำหรับเข้าทีม (Team Code) *</Text>
                    <Text style={styles.badgeRequired}>จำเป็น</Text>
                  </View>
                  <TextInput
                    style={[
                      styles.input,
                      styles.teamCodeInput,
                      {
                        backgroundColor: isDark ? '#1E293B' : '#EFF6FF',
                        borderColor: '#3B82F6',
                        color: colors.textPrimary,
                      },
                    ]}
                    placeholder="เช่น TEAM-A หรือ TEAM-B"
                    placeholderTextColor={colors.textMuted}
                    value={teamCode}
                    onChangeText={setTeamCode}
                    autoCapitalize="characters"
                    autoCorrect={false}
                  />
                  <Text style={[styles.helperText, { color: colors.textSecondary }]}>
                    💡 รหัสทีมหลักของสตูดิโอคือ <Text style={{ fontWeight: 'bold', color: '#2563EB' }}>TEAM-A</Text> (หรือ TEAM-B)
                  </Text>
                </View>
              </>
            )}

            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>อีเมลผู้ใช้งาน *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }]}
                placeholder="user@studio.com"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>รหัสผ่าน *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }]}
                placeholder="อย่างน้อย 6 ตัวอักษร"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {/* Role Selector (in Register mode) */}
            {activeTab === 'register' && (
              <View style={styles.roleGroup}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>บทบาทในทีม:</Text>
                <View style={styles.roleButtons}>
                  <TouchableOpacity
                    style={[
                      styles.roleBtn,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                      selectedRole === 'MEMBER' && { borderColor: colors.primary, backgroundColor: isDark ? colors.surfaceSubtle : '#F1F5F9' },
                    ]}
                    onPress={() => setSelectedRole('MEMBER')}
                  >
                    <Text
                      style={[
                        styles.roleBtnText,
                        { color: colors.textSecondary },
                        selectedRole === 'MEMBER' && { color: colors.textPrimary, fontWeight: '700' },
                      ]}
                    >
                      🎨 Member (ทีมงาน)
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.roleBtn,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                      selectedRole === 'MANAGER' && { borderColor: colors.primary, backgroundColor: isDark ? colors.surfaceSubtle : '#F1F5F9' },
                    ]}
                    onPress={() => setSelectedRole('MANAGER')}
                  >
                    <Text
                      style={[
                        styles.roleBtnText,
                        { color: colors.textSecondary },
                        selectedRole === 'MANAGER' && { color: colors.textPrimary, fontWeight: '700' },
                      ]}
                    >
                      👔 Manager (หัวหน้า)
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: colors.primary }]}
              onPress={activeTab === 'login' ? handleLogin : handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {activeTab === 'login' ? 'เข้าสู่ระบบ (Sign In)' : 'ยืนยันลงทะเบียน (Sign Up)'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* HIDDEN / SUBTLE DEMO ACCOUNTS DRAWER */}
          <View style={styles.demoDrawerSection}>
            <TouchableOpacity
              style={styles.demoToggleBtn}
              onPress={() => setShowDemoDrawer(!showDemoDrawer)}
              activeOpacity={0.7}
            >
              <Text style={[styles.demoToggleText, { color: colors.textSecondary }]}>
                {showDemoDrawer ? '▲ ซ่อนบัญชีทดสอบระบบ' : '▼ บัญชีสำหรับทดสอบด่วน (Demo Accounts)'}
              </Text>
            </TouchableOpacity>

            {showDemoDrawer && (
              <View style={[styles.demoCard, { backgroundColor: isDark ? colors.surface : '#F8FAFC', borderColor: colors.border }]}>
                <Text style={[styles.demoHint, { color: colors.textSecondary }]}>
                  กดเลือกบัญชีเพื่อกรอกข้อมูลเข้าสู่ระบบอัตโนมัติ (รหัสผ่าน: 123456):
                </Text>
                <View style={styles.demoBtnsRow}>
                  <TouchableOpacity
                    style={[styles.demoPill, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}
                    onPress={() => applyDemoAccount('manager@studio.com', 'MANAGER')}
                  >
                    <Text style={styles.demoPillTitle}>👔 Manager</Text>
                    <Text style={styles.demoPillSub}>สมศรี จัดการทีม</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.demoPill, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}
                    onPress={() => applyDemoAccount('member@studio.com', 'MEMBER')}
                  >
                    <Text style={styles.demoPillTitle}>🎬 Editor</Text>
                    <Text style={styles.demoPillSub}>John Editor</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.demoPill, { backgroundColor: '#FAF5FF', borderColor: '#E9D5FF' }]}
                    onPress={() => applyDemoAccount('mike@studio.com', 'MEMBER')}
                  >
                    <Text style={styles.demoPillTitle}>🎨 Graphic</Text>
                    <Text style={styles.demoPillSub}>Mike Graphic</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Server Config Modal */}
      <ServerConfigModal
        visible={showServerModal}
        onClose={() => setShowServerModal(false)}
        onServerChanged={(newUrl) => setCurrentServerUrl(newUrl)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 32,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 4,
  },
  brandSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIconSmall: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIconTextSmall: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  brandText: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  serverPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  serverPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  heroHeader: {
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  heroSubtitle: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  tabBar: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 14,
    marginBottom: 20,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabBtnActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  formCard: {
    padding: 20,
    borderRadius: 22,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  badgeRequired: {
    fontSize: 10,
    color: '#DC2626',
    fontWeight: 'bold',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
  },
  teamCodeInput: {
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  helperText: {
    fontSize: 11,
    marginTop: 5,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  roleGroup: {
    marginBottom: 18,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  roleBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  submitBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  demoDrawerSection: {
    marginTop: 22,
    alignItems: 'center',
  },
  demoToggleBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  demoToggleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  demoCard: {
    marginTop: 10,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    width: '100%',
  },
  demoHint: {
    fontSize: 11,
    marginBottom: 10,
    textAlign: 'center',
  },
  demoBtnsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  demoPill: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  demoPillTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  demoPillSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
});
