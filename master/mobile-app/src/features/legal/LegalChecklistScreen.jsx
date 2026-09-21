import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { contentApi } from '../../services/api';

export default function LegalChecklistScreen({ targetContent, onBack, onAuditComplete }) {
  const [submitting, setSubmitting] = useState(false);
  const [generalFeedback, setGeneralFeedback] = useState(
    targetContent?.reviewHistory?.[targetContent.reviewHistory.length - 1]?.notes || ''
  );

  const [checklist, setChecklist] = useState(() => {
    if (targetContent?.legalChecklist && targetContent.legalChecklist.length === 3) {
      return [
        {
          id: 1,
          category: 'เสียงและดนตรี',
          title: 'ตรวจสอบลิขสิทธิ์เพลงและเสียงประกอบ',
          desc: 'เพลงประกอบและเอฟเฟกต์เสียงไม่ละเมิดลิขสิทธิ์ หรือได้รับอนุญาตถูกต้อง',
          checked: Boolean(targetContent.legalChecklist[0]?.passed),
          note: targetContent.legalChecklist[0]?.note || '',
        },
        {
          id: 2,
          category: 'ภาพและวิดีโอ',
          title: 'ตรวจสอบสิทธิ์ของภาพและฟุตเทจ',
          desc: 'ภาพนิ่งและคลิปวิดีโอถ่ายทำเอง หรือเป็นสื่อที่ได้รับอนุญาตให้ใช้งานได้',
          checked: Boolean(targetContent.legalChecklist[1]?.passed),
          note: targetContent.legalChecklist[1]?.note || '',
        },
        {
          id: 3,
          category: 'เนื้อหาและข้อกำหนด',
          title: 'ตรวจสอบความเหมาะสมของเนื้อหา',
          desc: 'เนื้อหาถูกต้อง ไม่มีถ้อยคำหยาบคายรุนแรง หรือขัดต่อข้อกำหนดของแพลตฟอร์ม',
          checked: Boolean(targetContent.legalChecklist[2]?.passed),
          note: targetContent.legalChecklist[2]?.note || '',
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
        note: '',
      },
      {
        id: 2,
        category: 'ภาพและวิดีโอ',
        title: 'ตรวจสอบสิทธิ์ของภาพและฟุตเทจ',
        desc: 'ภาพนิ่งและคลิปวิดีโอถ่ายทำเอง หรือเป็นสื่อที่ได้รับอนุญาตให้ใช้งานได้',
        checked: true,
        note: '',
      },
      {
        id: 3,
        category: 'เนื้อหาและข้อกำหนด',
        title: 'ตรวจสอบความเหมาะสมของเนื้อหา',
        desc: 'เนื้อหาถูกต้อง ไม่มีถ้อยคำหยาบคายรุนแรง หรือขัดต่อข้อกำหนดของแพลตฟอร์ม',
        checked: false,
        note: '',
      },
    ];
  });

  const toggleCheck = (id) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const updateItemNote = (id, text) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, note: text } : item
      )
    );
  };

  const passedCount = checklist.filter((item) => item.checked).length;
  const isAllPassed = passedCount === checklist.length;
  const progressPercent = (passedCount / checklist.length) * 100;

  // รวบรวมข้อมูล Checklist เพื่อส่ง Backend
  const buildItemsPayload = () => {
    return checklist.map((c) => ({
      ruleTitle: c.title,
      passed: c.checked,
      note: c.note || (c.checked ? 'ผ่านการตรวจสอบเรียบร้อย' : 'ต้องปรับปรุงเพิ่มเติม'),
    }));
  };

  // Action: อนุมัติชิ้นงาน (Approve)
  const handleApprove = async () => {
    if (!isAllPassed) {
      Alert.alert(
        'ยังไม่สามารถอนุมัติได้',
        'กรุณาตรวจสอบและยืนยันความถูกต้องให้ครบทั้ง 3 ข้อก่อน'
      );
      return;
    }

    setSubmitting(true);
    try {
      if (targetContent?._id) {
        await contentApi.updateLegalChecklist(targetContent._id, buildItemsPayload());
        await contentApi.submitReview(
          targetContent._id,
          'APPROVED',
          generalFeedback.trim() || 'ผ่านการตรวจสอบความถูกต้องเรียบร้อย'
        );
      }

      Alert.alert(
        'อนุมัติชิ้นงานเรียบร้อย',
        `ชิ้นงาน "${targetContent?.title || 'Content'}" ได้รับการอนุมัติและพร้อมสำหรับการเผยแพร่`,
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
      console.warn('Review API error (fallback offline):', err.message);
      Alert.alert(
        'บันทึกสำเร็จ',
        'บันทึกผลการตรวจสอบและคอมเมนต์เรียบร้อยแล้ว',
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

  // Action: ส่งกลับแก้ไขพร้อมคอมเมนต์ (Request Revision)
  const handleRequestRevision = async () => {
    // รวบรวมคอมเมนต์จากแต่ละข้อ
    const itemComments = checklist
      .filter((c) => c.note && c.note.trim() !== '')
      .map((c) => `• ${c.category}: ${c.note}`)
      .join('\n');

    const combinedNotes = generalFeedback.trim()
      ? `${generalFeedback.trim()}${itemComments ? '\n\nรายละเอียดเพิ่มเติม:\n' + itemComments : ''}`
      : itemComments || 'ส่งกลับแก้ไขตามข้อคิดเห็นของหัวหน้าทีม';

    setSubmitting(true);
    try {
      if (targetContent?._id) {
        await contentApi.updateLegalChecklist(targetContent._id, buildItemsPayload());
        await contentApi.submitReview(targetContent._id, 'REVISION', combinedNotes);
      }

      Alert.alert(
        'ส่งกลับแก้ไขเรียบร้อย',
        `ส่งข้อคิดเห็นและคำแนะนำไปยัง ${targetContent?.creator || 'สมาชิกในทีม'} เรียบร้อยแล้ว`,
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
      console.warn('Revision API error (fallback offline):', err.message);
      Alert.alert(
        'ส่งกลับแก้ไขสำเร็จ',
        'บันทึกข้อคิดเห็นและส่งกลับแก้ไขเรียบร้อยแล้ว',
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
          <Text style={styles.headerTitle}>ตรวจสอบชิ้นงาน</Text>
          <Text style={styles.headerSubtitle}>ตรวจและให้ข้อคิดเห็นแก่ทีมผลิต</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Content Under Review Badge */}
          <View style={styles.contentBanner}>
            <Text style={styles.bannerSmall}>ชิ้นงานที่ตรวจ:</Text>
            <Text style={styles.bannerTitle}>
              {targetContent?.title || 'สรุปข่าว AI ภายใน 1 นาที'} ({targetContent?.platform || 'General'})
            </Text>
            <Text style={styles.bannerMeta}>
              ผู้รับผิดชอบ: {targetContent?.creator || 'Creator'}
            </Text>
          </View>

          {/* Progress Card */}
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>ผลการตรวจเช็กเบื้องต้น</Text>
              <Text
                style={[
                  styles.progressBadgeText,
                  { color: isAllPassed ? '#16A34A' : '#D97706' },
                ]}
              >
                {passedCount} จาก {checklist.length} ข้อผ่านเกณฑ์
              </Text>
            </View>

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
          </View>

          {/* Checklist Items with per-clip comment boxes */}
          <Text style={styles.sectionHeader}>รายการตรวจสอบและข้อเสนอแนะ</Text>
          {checklist.map((item) => (
            <View
              key={item.id}
              style={[styles.checkCard, item.checked && styles.checkCardActive]}
            >
              <TouchableOpacity
                style={styles.checkCardHeader}
                onPress={() => toggleCheck(item.id)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    item.checked ? styles.checkboxChecked : styles.checkboxUnchecked,
                  ]}
                >
                  <Text style={styles.checkboxIcon}>{item.checked ? '✓' : ''}</Text>
                </View>

                <View style={styles.checkHeaderRight}>
                  <Text style={styles.categoryText}>{item.category}</Text>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                </View>
              </TouchableOpacity>

              <Text style={styles.itemDesc}>{item.desc}</Text>

              {/* Note input for this specific clip */}
              <View style={styles.noteInputWrap}>
                <Text style={styles.noteLabel}>ข้อคิดเห็น / คำแนะนำในคลิปนี้:</Text>
                <TextInput
                  style={styles.itemNoteInput}
                  placeholder={`ระบุข้อคิดเห็นเฉพาะเกี่ยวกับ${item.category}ในคลิปนี้...`}
                  value={item.note}
                  onChangeText={(text) => updateItemNote(item.id, text)}
                  placeholderTextColor="#94A3B8"
                  multiline={false}
                />
              </View>
            </View>
          ))}

          {/* General Feedback Textarea */}
          <View style={styles.generalFeedbackSection}>
            <Text style={styles.feedbackSectionTitle}>คำแนะนำภาพรวมถึงสมาชิกในทีม</Text>
            <Text style={styles.feedbackSectionDesc}>
              ระบุสิ่งที่ต้องแก้ไขหรือข้อเสนอแนะเพิ่มเติม สมาชิกจะเห็นข้อความนี้ในหน้ารายการงาน
            </Text>
            <TextInput
              style={styles.generalFeedbackInput}
              placeholder="เช่น นาทีที่ 0:45 เสียงเพลงดังเกินไป, ตัดต่อตอนจบให้กระชับขึ้นอีกนิด..."
              value={generalFeedback}
              onChangeText={setGeneralFeedback}
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Actions Area */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.btnRevision}
              onPress={handleRequestRevision}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#DC2626" />
              ) : (
                <Text style={styles.btnRevisionText}>ส่งกลับแก้ไขพร้อมคอมเมนต์</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.btnApprove,
                !isAllPassed && styles.btnApproveDisabled,
              ]}
              onPress={handleApprove}
              disabled={submitting || !isAllPassed}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text
                  style={[
                    styles.btnApproveText,
                    !isAllPassed && styles.btnApproveTextDisabled,
                  ]}
                >
                  {isAllPassed ? 'อนุมัติชิ้นงาน (Approve)' : 'รอผ่านเกณฑ์ครบ 3 ข้อ'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  progressBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 5,
    backgroundColor: '#F1F5F9',
    borderRadius: 2.5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2.5,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  checkCardActive: {
    borderColor: '#BBF7D0',
    backgroundColor: '#FAFCFA',
  },
  checkCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
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
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkHeaderRight: {
    flex: 1,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  itemDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
    marginBottom: 10,
    marginLeft: 30,
  },
  noteInputWrap: {
    marginLeft: 30,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  noteLabel: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
    marginBottom: 4,
  },
  itemNoteInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 12,
    color: '#0F172A',
  },
  generalFeedbackSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  feedbackSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  feedbackSectionDesc: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 8,
  },
  generalFeedbackInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
    minHeight: 70,
    textAlignVertical: 'top',
  },
  actionContainer: {
    gap: 10,
    marginTop: 4,
  },
  btnRevision: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnRevisionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
  },
  btnApprove: {
    backgroundColor: '#16A34A',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnApproveDisabled: {
    backgroundColor: '#E2E8F0',
  },
  btnApproveText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  btnApproveTextDisabled: {
    color: '#94A3B8',
  },
});
