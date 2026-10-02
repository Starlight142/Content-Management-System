import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function SmoothModal({
  visible,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 420,
}) {
  const { colors, isDark } = useTheme();
  const [showModal, setShowModal] = useState(visible);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    if (visible) {
      setShowModal(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 9,
          tension: 65,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 9,
          tension: 65,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.94,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 14,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowModal(false);
      });
    }
  }, [visible, fadeAnim, scaleAnim, slideAnim]);

  if (!showModal) return null;

  return (
    <Modal
      visible={showModal}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Animated backdrop with layered frosted diffusion */}
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: fadeAnim,
              backgroundColor: isDark ? 'rgba(5, 10, 20, 0.65)' : 'rgba(15, 23, 42, 0.42)',
            },
          ]}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={StyleSheet.absoluteFill}>
              {/* Soft frosted diffusion layer - softens underlying screen luminance */}
              <View
                style={[
                  StyleSheet.absoluteFill,
                  {
                    backgroundColor: isDark ? 'rgba(30, 41, 59, 0.25)' : 'rgba(255, 255, 255, 0.20)',
                  },
                ]}
              />
            </View>
          </TouchableWithoutFeedback>
        </Animated.View>

        {/* Keyboard-avoiding container with scrollable content */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardContainer}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.scrollInner}>
                <Animated.View
                  style={[
                    styles.card,
                    {
                      maxWidth,
                      backgroundColor: isDark ? 'rgba(30, 41, 59, 0.98)' : 'rgba(255, 255, 255, 0.98)',
                      borderColor: isDark ? 'rgba(71, 85, 105, 0.6)' : 'rgba(226, 232, 240, 0.9)',
                      borderTopColor: isDark ? 'rgba(255, 255, 255, 0.18)' : '#FFFFFF',
                      opacity: fadeAnim,
                      transform: [
                        { scale: scaleAnim },
                        { translateY: slideAnim },
                      ],
                    },
                  ]}
                >
                  {/* Subtle top drag handle */}
                  <View style={styles.handleContainer}>
                    <View
                      style={[
                        styles.handleBar,
                        {
                          backgroundColor: isDark
                            ? 'rgba(148, 163, 184, 0.3)'
                            : 'rgba(203, 213, 225, 0.8)',
                        },
                      ]}
                    />
                  </View>

                  {/* Header Row */}
                  {(title || onClose) && (
                    <View style={styles.headerRow}>
                      <View style={styles.headerTextCol}>
                        {title && (
                          <Text style={[styles.title, { color: colors.textPrimary }]}>
                            {title}
                          </Text>
                        )}
                        {subtitle && (
                          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            {subtitle}
                          </Text>
                        )}
                      </View>
                      {onClose && (
                        <TouchableOpacity
                          onPress={onClose}
                          style={[styles.closeBtn, { backgroundColor: colors.surfaceSubtle }]}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.closeBtnText, { color: colors.textSecondary }]}>✕</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}

                  {/* Body Content */}
                  {children}
                </Animated.View>
              </View>
            </TouchableWithoutFeedback>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  scrollInner: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    borderRadius: 22,
    borderWidth: 1,
    borderTopWidth: 1.5,
    paddingHorizontal: 20,
    paddingBottom: 22,
    paddingTop: 10,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 4,
    marginBottom: 8,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTextCol: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 15,
  },
});
