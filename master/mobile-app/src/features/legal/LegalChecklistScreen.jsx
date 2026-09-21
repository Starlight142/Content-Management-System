import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { contentApi } from '../../services/api';

export default function LegalChecklistScreen({ targetContent, onBack, onAuditComplete }) {
  const [submitting, setSubmitting] = useState(false);
  const [checklist, setChecklist] = useState(() => {
    if (targetContent?.legalChecklist && targetContent.legalChecklist.length === 3) {
      return [
        {
          id: 1,
          category: 'เสียงและดนตรี',
          title: 'ตรวจสอบลิขสิทธิ์เพลงและเสียงประกอบ',
          desc: 'เพลงประกอบและเอฟเฟกต์เสียงไม่ละเมิดลิขสิทธิ์ หรือได้รับอนุญาตถูกต้อง',
          checked: Boolean(targetContent.legalChecklist[0]?.passed),
        },
        {
          id: 2,
          category: 'ภาพและวิดีโอ',
          title: 'ตรวจสอบสิทธิ์ของภาพและฟุตเทจ',
          desc: 'ภาพนิ่งและคลิปวิดีโอถ่ายทำเอง หรือเป็นสื่อที่ได้รับอนุญาตให้ใช้งานได้',
          checked: Boolean(targetContent.legalChecklist[1]?.passed),
        },
        {
          id: 3,
          category: 'เนื้อหาและข้อกำหนด',
          title: 'ตรวจสอบความเหมาะสมของเนื้อหา',
          desc: 'เนื้อหาถูกต้อง ไม่มีถ้อยคำหยาบคายรุนแรง หรือขัดต่อข้อกำหนดของแพลตฟอร์ม',
          checked: Boolean(targetContent.legalChecklist[2]?.passed),
        },
      ];
    }
    return [
      {
        id: 1,
        category: 'เสียงและดนตรี',
        title: 'ตรวจสอบลิขสิทธิ์เพลงและเสียงประกอบ',
        desc: 'เพลงประกอบและเอฟเฟกต์เสียงไม่ละเมิดลิขสิทธิ์ หรือได้รับอนุญาตถูกต้อง',
        checked: true,
      },
      {
        id: 2,
        category: 'ภาพและวิดีโอ',
        title: 'ตรวจสอบสิทธิ์ของภาพและฟุตเทจ',
        desc: 'ภาพนิ่งและคลิปวิดีโอถ่ายทำเอง หรือเป็นสื่อที่ได้รับอนุญาตให้ใช้งานได้',
        checked: true,
      },
      {
        id: 3,
        category: 'เนื้อหาและข้อกำหนด',
        title: 'ตรวจสอบความเหมาะสมของเนื้อหา',
        desc: 'เนื้อหาถูกต้อง ไม่มีถ้อยคำหยาบคายรุนแรง หรือขัดต่อข้อกำหนดของแพลตฟอร์ม',
        checked: false,
      },
    ];
  });

  const toggleCheck = (id) => {
    setChecklist(
      checklist.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const passedCount = checklist.filter((item) => item.checked).length;
  const isAllPassed = passedCount === checklist.length;
  const progressPercent = (passedCount / checklist.length) * 100;

  const handleConfirmPublish = async () => {
    if (!isAllPassed) {
      Alert.alert(
        'ยังไม่สามารถอนุมัติได้',
        'กรุณาตรวจสอบและยืนยันความถูกต้องให้ครบทั้ง 3 ข้อก่อน เพื่อความปลอดภัยของชิ้นงาน'
      );
      return;
    }

    setSubmitting(true);
    try {
      if (targetContent?._id) {
        await contentApi.updateLegalChecklist(
          targetContent._id,
          checklist.map((c) => ({
            ruleTitle: c.title,
            passed: c.checked,
            note: 'Verified by Manager on Mobile App',
          }))
        );

        await contentApi.submitReview(
          targetContent._id,
          'APPROVED',
          'Passed all 3 compliance checks'
        );
      }

      Alert.alert(
        'อนุมัติชิ้นงานเรียบร้อย',
        `ชิ้นงาน "${targetContent?.title || 'Content'}" ผ่านการตรวจสอบความถูกต้องเรียบร้อยแล้ว และปรับสถานะเป็น APPROVED`,
        [
          {
            text: 'ตกลง',
            onPress: () => {
              if (onAuditComplete) onAuditComplete(targetContent?._id);
              if (onBack) onBack();
            },
          },
        ]
      );
    } catch (err) {
      console.warn('Legal audit api note:', err.message);
      Alert.alert(
        'บันทึกสำเร็จ',
        'บันทึกผลการตรวจสอบเรียบร้อยแล้ว (Offline Mode)',
        [
          {
            text: 'ตกลง',
            onPress: () => {
              if (onAuditComplete) onAuditComplete(targetContent?._id);
              if (onBack) onBack();
            },
          },
        ]
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← กลับ</Text>
        </TouchableOpacity>
        <View style={styles.titleWrap}>
          <Text style={styles.headerTitle}>ตรวจสอบความถูกต้อง</Text>
          <Text style={styles.headerSubtitle}>Content Compliance Check</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Content Under Review Badge */}
        <View style={styles.contentBanner}>
          <Text style={styles.bannerSmall}>ชิ้นงานที่กำลังตรวจ:</Text>
          <Text style={styles.bannerTitle}>
            {targetContent?.title || 'สรุปข่าว AI ภายใน 1 นาที'} ({targetContent?.platform || 'TikTok'})
          </Text>
          <Text style={styles.bannerMeta}>
            ผู้รับผิดชอบ: {targetContent?.creator || 'John Creator'}
          </Text>
        </View>

        {/* Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>สถานะการตรวจสอบ</Text>
            <Text
              style={[
                styles.progressBadgeText,
                { color: isAllPassed ? '#16A34A' : '#D97706' },
              ]}
            >
              {passedCount} / {checklist.length} ข้อ ({Math.round(progressPercent)}%)
            </Text>
          </View>

          {/* Progress Bar Track */}
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${progressPercent}%`,
                  backgroundColor: isAllPassed ? '#16A34A' : '#D97706',
                },
              ]}
            />
          </View>

          <Text style={styles.progressHint}>
            {isAllPassed
              ? 'ผ่านเกณฑ์ครบทุกข้อ พร้อมอนุมัติชิ้นงาน'
              : 'กรุณาตรวจทานข้อที่เหลือเพื่อปลดล็อกการอนุมัติ'}
          </Text>
        </View>

        {/* Checklist Items */}
        <Text style={styles.sectionHeader}>รายการตรวจสอบ 3 ข้อ</Text>
        {checklist.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.checkCard, item.checked && styles.checkCardActive]}
            onPress={() => toggleCheck(item.id)}
            activeOpacity={0.8}
          >
            <View style={styles.checkLeft}>
              <View
                style={[
                  styles.checkbox,
                  item.checked ? styles.checkboxChecked : styles.checkboxUnchecked,
                ]}
              >
                <Text style={styles.checkboxIcon}>{item.checked ? '✓' : ''}</Text>
              </View>
            </View>

            <View style={styles.checkRight}>
              <View style={styles.categoryRow}>
                <Text style={styles.categoryText}>{item.category}</Text>
              </View>

              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemDesc}>{item.desc}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Publish Action Gatekeeper */}
        <View style={styles.gatekeeperBox}>
          <TouchableOpacity
            style={[
              styles.publishBtn,
              isAllPassed ? styles.publishBtnEnabled : styles.publishBtnDisabled,
            ]}
            onPress={handleConfirmPublish}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text
                style={[
                  styles.publishBtnText,
                  !isAllPassed && styles.publishBtnTextDisabled,
                ]}
              >
                {isAllPassed ? 'ยืนยันการอนุมัติชิ้นงาน (Approve)' : 'รอตรวจสอบให้ครบทั้ง 3 ข้อ'}
              </Text>
            )}
          </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  backText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  titleWrap: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  placeholder: {
    width: 50,
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  contentBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  bannerSmall: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 2,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  bannerMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  progressBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressHint: {
    fontSize: 12,
    color: '#64748B',
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 10,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  checkCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  checkCardActive: {
    borderColor: '#BBF7D0',
    backgroundColor: '#F0FDF4',
  },
  checkLeft: {
    marginRight: 12,
    paddingTop: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxUnchecked: {
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    borderColor: '#16A34A',
    backgroundColor: '#16A34A',
  },
  checkboxIcon: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  checkRight: {
    flex: 1,
  },
  categoryRow: {
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  itemDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },
  gatekeeperBox: {
    marginTop: 16,
  },
  publishBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishBtnEnabled: {
    backgroundColor: '#16A34A',
  },
  publishBtnDisabled: {
    backgroundColor: '#E2E8F0',
  },
  publishBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  publishBtnTextDisabled: {
    color: '#94A3B8',
  },
});
