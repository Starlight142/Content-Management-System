import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authApi, setAuthToken } from '../../services/api';
import { useTheme } from '../../theme/ThemeContext';

export default function LoginScreen({ onLoginSuccess }) {
  const { isDark, colors } = useTheme();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('manager@studio.com');
  const [password, setPassword] = useState('123456');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [selectedRole, setSelectedRole] = useState('MANAGER'); // Role for login test / register
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }

    setLoading(true);
    try {
      // Attempt login via backend API
      const res = await authApi.login(email, password);
      if (res.token) {
        setAuthToken(res.token);
      }
      onLoginSuccess({
        id: res.user?.id || 1,
        name: res.user?.firstName || (selectedRole === 'MANAGER' ? 'สมศรี (Manager)' : 'จอห์น (Member)'),
        role: res.user?.role || selectedRole,
        email: email,
      });
    } catch (err) {
      // Fallback for offline/local simulation so user can immediately test screens
      console.log('Using offline mock login session:', err.message);
      onLoginSuccess({
        id: selectedRole === 'MANAGER' ? 101 : 202,
        name: selectedRole === 'MANAGER' ? 'Somsri (Manager)' : 'John (Creator/Member)',
        role: selectedRole,
        email: email,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!firstName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกชื่อ, อีเมล และรหัสผ่านให้ครบถ้วน');
      return;
    }

    if (password.length < 6) {
      Alert.alert('ข้อผิดพลาด', 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    setLoading(true);
    try {
      const username = email.split('@')[0] || `user_${Date.now()}`;
      await authApi.register({
        username,
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim() || 'Member',
        role: selectedRole,
      });

      Alert.alert('สำเร็จ', 'ลงทะเบียนผู้ใช้งานใหม่เรียบร้อยแล้ว กรุณาเข้าสู่ระบบ');
      setIsRegister(false);
    } catch (err) {
      Alert.alert('ข้อผิดพลาด', err.message || 'ไม่สามารถลงทะเบียนได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.inner}
      >
        <View style={styles.header}>
          <View style={[styles.logoBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.logoText}>D</Text>
          </View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Draftly</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {isRegister ? 'สร้างบัญชีผู้ใช้งานใหม่' : 'ระบบบริหารงานผลิต Content สำหรับทีมงาน'}
          </Text>
        </View>

        {/* Role Fast Selector */}
        <View style={styles.roleContainer}>
          <Text style={[styles.roleLabel, { color: colors.textSecondary }]}>
            {isRegister ? 'เลือกบทบาทที่ต้องการสมัคร:' : 'ทดสอบเข้าใช้งานด้วยสิทธิ์:'}
          </Text>
          <View style={styles.roleButtons}>
            <TouchableOpacity
              style={[
                styles.roleBtn,
                { backgroundColor: colors.surface, borderColor: colors.border },
                selectedRole === 'MANAGER' && {
                  borderColor: colors.primary,
                  backgroundColor: isDark ? colors.surfaceSubtle : '#F1F5F9',
                },
              ]}
              onPress={() => {
                setSelectedRole('MANAGER');
                if (!isRegister) setEmail('manager@studio.com');
              }}
            >
              <Text
                style={[
                  styles.roleBtnText,
                  { color: colors.textSecondary },
                  selectedRole === 'MANAGER' && { color: colors.textPrimary, fontWeight: '700' },
                ]}
              >
                Manager (หัวหน้าทีม)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleBtn,
                { backgroundColor: colors.surface, borderColor: colors.border },
                selectedRole === 'MEMBER' && {
                  borderColor: colors.primary,
                  backgroundColor: isDark ? colors.surfaceSubtle : '#F1F5F9',
                },
              ]}
              onPress={() => {
                setSelectedRole('MEMBER');
                if (!isRegister) setEmail('member@studio.com');
              }}
            >
              <Text
                style={[
                  styles.roleBtnText,
                  { color: colors.textSecondary },
                  selectedRole === 'MEMBER' && { color: colors.textPrimary, fontWeight: '700' },
                ]}
              >
                Member (ทีมงานสร้างสรรค์)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Input Fields */}
        <View style={[styles.form, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          {isRegister && (
            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 6 }]}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>ชื่อจริง *</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.inputBg,
                      borderColor: colors.inputBorder,
                      color: colors.textPrimary,
                    },
                  ]}
                  placeholder="เช่น สมชาย"
                  placeholderTextColor={colors.textMuted}
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 6 }]}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>นามสกุล</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.inputBg,
                      borderColor: colors.inputBorder,
                      color: colors.textPrimary,
                    },
                  ]}
                  placeholder="ใจดี"
                  placeholderTextColor={colors.textMuted}
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>อีเมลผู้ใช้งาน *</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                  color: colors.textPrimary,
                },
              ]}
              placeholder="user@studio.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>รหัสผ่าน *</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                  color: colors.textPrimary,
                },
              ]}
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            style={[styles.submitBtn, { backgroundColor: colors.primary }]} 
            onPress={isRegister ? handleRegister : handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>
                {isRegister ? 'ยืนยันลงทะเบียน (Sign Up)' : 'เข้าสู่ระบบ (Sign In)'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Toggle between Login and Register */}
          <TouchableOpacity
            style={styles.toggleModeBtn}
            onPress={() => {
              setIsRegister(!isRegister);
              if (isRegister) {
                setEmail('manager@studio.com');
                setPassword('123456');
              } else {
                setEmail('');
                setPassword('');
              }
            }}
          >
            <Text style={[styles.toggleModeText, { color: colors.textSecondary }]}>
              {isRegister
                ? 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบที่นี่'
                : 'ยังไม่มีบัญชีผู้ใช้? กดลงทะเบียนที่นี่'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  roleContainer: {
    marginBottom: 20,
  },
  roleLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  roleBtnActive: {
    borderColor: '#0F172A',
    backgroundColor: '#F1F5F9',
  },
  roleBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  roleBtnTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  form: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  submitBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  rowInputs: {
    flexDirection: 'row',
  },
  toggleModeBtn: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 8,
  },
  toggleModeText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
