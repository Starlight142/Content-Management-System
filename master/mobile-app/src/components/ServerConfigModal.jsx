import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { getBaseUrl, setCustomBaseUrl, pingServer } from '../services/api';
import { presenceService } from '../services/presenceService';

const PRESETS = [
  {
    key: 'wifi',
    label: 'Wi-Fi (LAN)',
    desc: '192.168.0.104:5000 (ไร้สาย แนะนำ)',
    url: 'http://192.168.0.104:5000/api',
    tag: 'ไร้สาย LAN',
    tagColor: '#059669',
    tagBg: '#D1FAE5',
  },
  {
    key: 'usb',
    label: 'USB / ADB Reverse',
    desc: '127.0.0.1:5000 (ต่อสาย USB กับคอม)',
    url: 'http://127.0.0.1:5000/api',
    tag: 'สาย USB',
    tagColor: '#6D28D9',
    tagBg: '#EDE9FE',
  },
  {
    key: 'tunnel',
    label: 'Cloudflare Tunnel',
    desc: 'สำหรับเน็ต 4G/5G หรือภายนอก',
    url: 'https://limits-claims-herself-folks.trycloudflare.com/api',
    tag: 'เน็ตมือถือ',
    tagColor: '#2563EB',
    tagBg: '#DBEAFE',
  },
];

export default function ServerConfigModal({ visible, onClose, onServerChanged }) {
  const { colors, isDark } = useTheme();
  const [currentUrl, setCurrentUrl] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [selectedPresetKey, setSelectedPresetKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [pingResult, setPingResult] = useState(null);
  const activeRequestRef = useRef(0);

  const executePing = async (targetUrl) => {
    const url = (targetUrl || inputUrl || '').trim();
    if (!url) return;

    const reqId = ++activeRequestRef.current;
    setTesting(true);
    setPingResult(null);

    try {
      const res = await pingServer(url, 2500);
      if (activeRequestRef.current === reqId) {
        setPingResult(res);
      }
    } catch (err) {
      if (activeRequestRef.current === reqId) {
        setPingResult({ ok: false, error: err.message || 'ไม่สามารถติดต่อได้' });
      }
    } finally {
      if (activeRequestRef.current === reqId) {
        setTesting(false);
      }
    }
  };

  useEffect(() => {
    if (visible) {
      const active = getBaseUrl();
      setCurrentUrl(active);
      setInputUrl(active);

      // Identify preset key
      const cleanActive = active.trim().replace(/\/+$/, '');
      const matched = PRESETS.find((p) => p.url.replace(/\/+$/, '') === cleanActive);
      setSelectedPresetKey(matched ? matched.key : 'custom');

      executePing(active);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // Direct 1-tap preset selection: immediate visual color update + live switch
  const handleSelectPreset = (preset) => {
    setSelectedPresetKey(preset.key);
    setInputUrl(preset.url);

    // Apply immediately to API client and WebSocket service
    const appliedUrl = setCustomBaseUrl(preset.url);
    presenceService.setCustomWsUrl(appliedUrl);
    setCurrentUrl(appliedUrl);

    if (onServerChanged) {
      onServerChanged(appliedUrl);
    }

    // Immediately test ping for live response
    executePing(appliedUrl);
  };

  // Manual input save button
  const handleSaveCustom = () => {
    if (!inputUrl.trim()) {
      Alert.alert('แจ้งเตือน', 'กรุณากรอก URL ที่ถูกต้อง');
      return;
    }
    const appliedUrl = setCustomBaseUrl(inputUrl);
    presenceService.setCustomWsUrl(appliedUrl);
    setCurrentUrl(appliedUrl);

    const cleanApplied = appliedUrl.trim().replace(/\/+$/, '');
    const matched = PRESETS.find((p) => p.url.replace(/\/+$/, '') === cleanApplied);
    setSelectedPresetKey(matched ? matched.key : 'custom');

    if (onServerChanged) {
      onServerChanged(appliedUrl);
    }

    executePing(appliedUrl);
    Alert.alert('สลับเซิร์ฟเวอร์สำเร็จ', `ใช้งานที่:\n${appliedUrl}`);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.textPrimary }]}>ตั้งค่า Server URL</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                สลับ Wi-Fi, Cloudflare หรือ USB
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeIconBtn, { backgroundColor: colors.surfaceSubtle }]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={[styles.closeIconText, { color: colors.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.body}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
          >
            {/* Status Card */}
            <View style={[styles.statusCard, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: colors.border }]}>
              <View style={styles.statusRow}>
                <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>สถานะเซิร์ฟเวอร์:</Text>
                {testing ? (
                  <View style={styles.badgeTesting}>
                    <ActivityIndicator size="small" color="#2563EB" />
                    <Text style={styles.badgeTestingText}>กำลังตรวจสอบ...</Text>
                  </View>
                ) : pingResult?.ok ? (
                  <View style={styles.badgeSuccess}>
                    <Text style={styles.badgeSuccessText}>Online ({pingResult.latency}ms)</Text>
                  </View>
                ) : (
                  <View style={styles.badgeError}>
                    <Text style={styles.badgeErrorText}>
                      {pingResult ? (pingResult.error || 'Offline') : 'ยังไม่ได้เชื่อมต่อ'}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={[styles.currentUrlText, { color: colors.textPrimary }]} numberOfLines={1}>
                {currentUrl || 'ยังไม่ได้ระบุ Server URL'}
              </Text>
            </View>

            {/* Presets List */}
            <View style={styles.presetsSection}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                เลือกโหมดการเชื่อมต่อ (แตะเพื่อใช้งานทันที):
              </Text>

              {PRESETS.map((preset) => {
                const isSelected = selectedPresetKey === preset.key ||
                  inputUrl.trim().replace(/\/+$/, '') === preset.url.replace(/\/+$/, '');

                return (
                  <TouchableOpacity
                    key={preset.key}
                    activeOpacity={0.7}
                    style={[
                      styles.presetCard,
                      {
                        backgroundColor: isSelected
                          ? (isDark ? '#1E293B' : '#EFF6FF')
                          : (isDark ? '#0F172A' : '#FFFFFF'),
                        borderColor: isSelected ? '#2563EB' : colors.cardBorder,
                        borderWidth: isSelected ? 2 : 1,
                      },
                    ]}
                    onPress={() => handleSelectPreset(preset)}
                  >
                    <View style={styles.presetLeft}>
                      <View style={styles.presetTitleRow}>
                        <Text
                          style={[
                            styles.presetLabel,
                            { color: colors.textPrimary },
                            isSelected && { color: '#2563EB', fontWeight: 'bold' },
                          ]}
                        >
                          {preset.label}
                        </Text>
                        <View style={[styles.tagBadge, { backgroundColor: isSelected ? '#DBEAFE' : preset.tagBg }]}>
                          <Text style={[styles.tagBadgeText, { color: isSelected ? '#1D4ED8' : preset.tagColor }]}>
                            {preset.tag}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.presetDesc, { color: colors.textSecondary }]}>{preset.desc}</Text>
                    </View>

                    {/* Radio / Active Indicator */}
                    <View style={styles.radioArea}>
                      {isSelected ? (
                        <View style={styles.activePill}>
                          <Text style={styles.activeCheckText}>✓ ใช้งาน</Text>
                        </View>
                      ) : (
                        <View style={[styles.radioCircle, { borderColor: colors.border }]} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Custom Input URL */}
            <View style={styles.inputSection}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                หรือกำหนด URL เอง (Custom IP / Tunnel):
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                    color: colors.textPrimary,
                  },
                ]}
                placeholder="เช่น http://192.168.0.104:5000/api"
                placeholderTextColor={colors.textMuted}
                value={inputUrl}
                onChangeText={(text) => {
                  setInputUrl(text);
                  const clean = text.trim().replace(/\/+$/, '');
                  const match = PRESETS.find((p) => p.url.replace(/\/+$/, '') === clean);
                  setSelectedPresetKey(match ? match.key : 'custom');
                }}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.testBtn, { borderColor: colors.border }]}
              onPress={() => executePing(inputUrl)}
              disabled={testing}
              activeOpacity={0.7}
            >
              {testing ? (
                <ActivityIndicator size="small" color="#2563EB" />
              ) : (
                <Text style={styles.testBtnText}>ตรวจสอบการเชื่อมต่อ</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSaveCustom}
              activeOpacity={0.8}
            >
              <Text style={styles.saveBtnText}>บันทึกและเชื่อมต่อ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  modalCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIconText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  body: {
    marginBottom: 12,
  },
  statusCard: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgeTesting: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeTestingText: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '600',
  },
  badgeSuccess: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeSuccessText: {
    fontSize: 11,
    color: '#166534',
    fontWeight: '700',
  },
  badgeError: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeErrorText: {
    fontSize: 11,
    color: '#991B1B',
    fontWeight: '700',
  },
  currentUrlText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  presetsSection: {
    marginBottom: 10,
  },
  presetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 13,
    borderRadius: 14,
    marginBottom: 9,
  },
  presetLeft: {
    flex: 1,
    marginRight: 8,
  },
  presetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  presetLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  tagBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  presetDesc: {
    fontSize: 11,
    marginTop: 3,
  },
  radioArea: {
    marginLeft: 4,
  },
  activePill: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeCheckText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
  },
  inputSection: {
    marginTop: 4,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  testBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  testBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  saveBtn: {
    flex: 1.2,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
