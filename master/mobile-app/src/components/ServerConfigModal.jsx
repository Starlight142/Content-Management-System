import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
  Keyboard,
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
    desc: '127.0.0.1:5000 (ต่อสาย USB / Emulator)',
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
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const activeRequestRef = useRef(0);
  const scrollViewRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      const kbHeight = e?.endCoordinates?.height || 280;
      setKeyboardHeight(kbHeight);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 80);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

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
        if (res?.resolvedBaseUrl && res.resolvedBaseUrl !== url) {
          setCurrentUrl(res.resolvedBaseUrl);
          if (onServerChanged) {
            onServerChanged(res.resolvedBaseUrl);
          }
        }
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
      setKeyboardHeight(0);
      const active = getBaseUrl();
      setCurrentUrl(active);
      setInputUrl(active);

      const cleanActive = active.trim().replace(/\/+$/, '');
      const matched = PRESETS.find((p) => p.url.replace(/\/+$/, '') === cleanActive) ||
        (cleanActive === 'http://10.0.2.2:5000/api' ? PRESETS[1] : null);
      setSelectedPresetKey(matched ? matched.key : 'custom');

      executePing(active);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handleSelectPreset = (preset) => {
    inputRef.current?.blur();
    Keyboard.dismiss();
    setSelectedPresetKey(preset.key);
    setInputUrl(preset.url);

    const appliedUrl = setCustomBaseUrl(preset.url);
    presenceService.setCustomWsUrl(appliedUrl);
    setCurrentUrl(appliedUrl);

    if (onServerChanged) {
      onServerChanged(appliedUrl);
    }

    executePing(appliedUrl);
  };

  const handleSelectCustomMode = () => {
    setSelectedPresetKey('custom');
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
      inputRef.current?.focus();
    }, 100);
  };

  const handleSaveCustom = () => {
    inputRef.current?.blur();
    Keyboard.dismiss();
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

  const handleClose = () => {
    inputRef.current?.blur();
    Keyboard.dismiss();
    onClose();
  };

  const isKeyboardOpen = keyboardHeight > 0;
  const isCustomSelected = selectedPresetKey === 'custom';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          style={[
            styles.overlay,
            isKeyboardOpen && {
              paddingBottom: keyboardHeight,
            },
          ]}
        >
          <TouchableWithoutFeedback onPress={() => {}}>
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              {/* Header */}
              <View style={styles.header}>
                <View>
                  <Text style={[styles.title, { color: colors.textPrimary }]}>ตั้งค่า Server URL</Text>
                  <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    เลือกโหมดการเชื่อมต่อเซิร์ฟเวอร์ของระบบ
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleClose}
                  style={[styles.closeIconBtn, { backgroundColor: colors.surfaceSubtle }]}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={[styles.closeIconText, { color: colors.textSecondary }]}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                ref={scrollViewRef}
                style={styles.body}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
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

                {/* Connection Modes List (3 Standard Presets + 4th Custom Option) */}
                <View style={styles.presetsSection}>
                  <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                    เลือกโหมดการเชื่อมต่อ:
                  </Text>

                  {PRESETS.map((preset) => {
                    const isSelected = selectedPresetKey === preset.key;

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
                            borderWidth: isSelected ? 1.5 : 1,
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
                                isSelected && { color: '#2563EB', fontWeight: '700' },
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

                        <View style={styles.radioArea}>
                          {isSelected ? (
                            <View style={styles.activePill}>
                              <Text style={styles.activeCheckText}>ใช้งานอยู่</Text>
                            </View>
                          ) : (
                            <View style={[styles.radioCircle, { borderColor: colors.border }]} />
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}

                  {/* 4th Option: Custom URL */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={[
                      styles.presetCard,
                      {
                        backgroundColor: isCustomSelected
                          ? (isDark ? '#1E293B' : '#EFF6FF')
                          : (isDark ? '#0F172A' : '#FFFFFF'),
                        borderColor: isCustomSelected ? '#2563EB' : colors.cardBorder,
                        borderWidth: isCustomSelected ? 1.5 : 1,
                      },
                    ]}
                    onPress={handleSelectCustomMode}
                  >
                    <View style={styles.presetLeft}>
                      <View style={styles.presetTitleRow}>
                        <Text
                          style={[
                            styles.presetLabel,
                            { color: colors.textPrimary },
                            isCustomSelected && { color: '#2563EB', fontWeight: '700' },
                          ]}
                        >
                          กำหนด URL เอง (Custom Server)
                        </Text>
                        <View style={[styles.tagBadge, { backgroundColor: isCustomSelected ? '#DBEAFE' : '#F1F5F9' }]}>
                          <Text style={[styles.tagBadgeText, { color: isCustomSelected ? '#1D4ED8' : '#475569' }]}>
                            กำหนดเอง
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.presetDesc, { color: colors.textSecondary }]}>
                        ระบุ IP หรือโดเมนเซิร์ฟเวอร์ด้วยตนเอง
                      </Text>
                    </View>

                    <View style={styles.radioArea}>
                      {isCustomSelected ? (
                        <View style={styles.activePill}>
                          <Text style={styles.activeCheckText}>กำหนดเอง</Text>
                        </View>
                      ) : (
                        <View style={[styles.radioCircle, { borderColor: colors.border }]} />
                      )}
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Expandable Custom URL Input Box (only visible when Custom mode is selected) */}
                {isCustomSelected && (
                  <View style={[styles.customInputBox, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: colors.border }]}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                      ระบุ Server URL (IP / Tunnel):
                    </Text>
                    <TextInput
                      ref={inputRef}
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
                      onFocus={() => {
                        setTimeout(() => {
                          scrollViewRef.current?.scrollToEnd({ animated: true });
                        }, 100);
                      }}
                      onChangeText={setInputUrl}
                      autoCapitalize="none"
                      autoCorrect={false}
                      disableFullscreenUI
                    />
                    <TouchableOpacity
                      style={[styles.saveCustomBtn, { backgroundColor: colors.primary }]}
                      onPress={handleSaveCustom}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.saveBtnText}>บันทึกและเชื่อมต่อ URL นี้</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>

              {/* Footer Action */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.testBtn, { borderColor: colors.border, backgroundColor: colors.surfaceSubtle }]}
                  onPress={() => {
                    Keyboard.dismiss();
                    executePing(currentUrl);
                  }}
                  disabled={testing}
                  activeOpacity={0.7}
                >
                  {testing ? (
                    <ActivityIndicator size="small" color="#2563EB" />
                  ) : (
                    <Text style={[styles.testBtnText, { color: colors.textPrimary }]}>ทดสอบการเชื่อมต่อ</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={handleClose}
                  activeOpacity={0.8}
                >
                  <Text style={styles.saveBtnText}>เสร็จสิ้น</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 20,
  },
  modalCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 20,
    maxHeight: '92%',
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
    fontSize: 17,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIconText: {
    fontSize: 13,
    fontWeight: '700',
  },
  body: {
    marginBottom: 10,
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
    marginBottom: 4,
  },
  presetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
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
    marginTop: 2,
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
    fontSize: 10,
    fontWeight: '700',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
  },
  customInputBox: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 2,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 10,
  },
  saveCustomBtn: {
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  testBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
