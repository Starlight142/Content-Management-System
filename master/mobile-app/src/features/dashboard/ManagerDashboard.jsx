import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { contentApi } from '../../services/api';
import { presenceService } from '../../services/presenceService';
import { useTheme } from '../../theme/ThemeContext';

export default function ManagerDashboard({ user, onNavigate, refreshKey }) {
  const { colors } = useTheme();
  const [pipeline, setPipeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [revisionModalVisible, setRevisionModalVisible] = useState(false);
  const [revisionTargetItem, setRevisionTargetItem] = useState(null);
  const [revisionFeedback, setRevisionFeedback] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchLivePipeline = async () => {
    try {
      const res = await contentApi.getAll();
      const list = Array.isArray(res) ? res : (res?.contents || []);
      if (Array.isArray(list)) {
        const mapped = list.map((c) => ({
          _id: c._id,
          title: c.title,
          description: c.description || 'ไม่มีรายละเอียดเนื้อหา',
          platform: c.platform || 'General',
          status: c.status || 'PLANNING',
          category: c.category || 'General',
          creator: c.createdBy?.firstName ? `${c.createdBy.firstName} ${c.createdBy.lastName || ''}`.trim() : (c.createdBy?.username || 'ผู้ผลิต'),
          dueDate: c.dueDate ? c.dueDate.split('T')[0] : '2026-09-30',
          legalChecklist: c.legalChecklist || [],
          reviewHistory: c.reviewHistory || [],
        }));
        setPipeline(mapped);
        setIsLiveConnected(true);
      }
    } catch (e) {
      console.warn('Live API error in ManagerDashboard:', e.message);
      setPipeline([]);
      setIsLiveConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLivePipeline();

    const unsubscribe = presenceService.subscribe((event) => {
      if (['CONTENT_CREATED', 'CONTENT_UPDATED', 'CONTENT_DELETED', 'TASK_CREATED', 'TASK_UPDATED', 'TASK_DELETED'].includes(event.type)) {
        fetchLivePipeline();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [refreshKey]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLivePipeline();
    setRefreshing(false);
  };

  const handleStartProduction = async (item) => {
    setPipeline((prev) =>
      prev.map((c) => (c._id === item._id ? { ...c, status: 'PRODUCTION' } : c))
    );
    try {
      await contentApi.updateStatus(item._id, 'PRODUCTION');
    } catch (e) {
      console.warn('Updated locally:', e.message);
    }
    Alert.alert('เริ่มงานผลิต', `ส่ง "${item.title}" เข้าสู่ขั้นตอนกำลังผลิตเรียบร้อย`);
  };

  const handleSendToReview = async (item) => {
    setPipeline((prev) =>
      prev.map((c) => (c._id === item._id ? { ...c, status: 'REVIEW' } : c))
    );
    try {
      await contentApi.updateStatus(item._id, 'REVIEW');
    } catch (e) {
      console.warn('Updated locally:', e.message);
    }
    Alert.alert('ส่งตรวจสอบ', `ส่ง "${item.title}" เข้าสู่คิวการตรวจสอบเรียบร้อย`);
  };

  const handlePublishNow = async (item) => {
    Alert.alert(
      'เผยแพร่ชิ้นงาน',
      `คุณต้องการเผยแพร่ "${item.title}" สู่ ${item.platform} หรือไม่?`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'เผยแพร่ทันที',
          onPress: async () => {
            setPipeline((prev) =>
              prev.map((c) => (c._id === item._id ? { ...c, status: 'PUBLISHED' } : c))
            );
            try {
              await contentApi.updateStatus(item._id, 'PUBLISHED');
            } catch (e) {
              console.warn('Updated locally:', e.message);
            }
            Alert.alert('สำเร็จ', 'ชิ้นงานถูกเผยแพร่สู่สาธารณะเรียบร้อยแล้ว');
          },
        },
      ]
    );
  };

  const openRevisionModal = (item) => {
    setRevisionTargetItem(item);
    setRevisionFeedback('');
    setRevisionModalVisible(true);
  };

  const confirmSubmitRevision = async () => {
    if (!revisionTargetItem) return;
    const text = revisionFeedback.trim() || 'ส่งกลับแก้ไขตามข้อคิดเห็นของผู้จัดการ';
    setSubmittingReview(true);
    setPipeline((prev) =>
      prev.map((c) => (c._id === revisionTargetItem._id ? { ...c, status: 'REVISION' } : c))
    );
    try {
      await contentApi.submitReview(revisionTargetItem._id, 'REVISION', text);
    } catch (e) {
      console.warn('Updated locally:', e.message);
    } finally {
      setSubmittingReview(false);
      setRevisionModalVisible(false);
    }
    Alert.alert('ส่งกลับแก้ไขสำเร็จ', `ส่งข้อคิดเห็นไปยัง ${revisionTargetItem.creator || 'ทีมงาน'} เรียบร้อยแล้ว`);
  };

  const handleApproveContent = (item) => {
    Alert.alert(
      'อนุมัติชิ้นงาน',
      `คุณต้องการอนุมัติ "${item.title}" เพื่อเตรียมพร้อมสำหรับการเผยแพร่ใช่หรือไม่?`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ยืนยันอนุมัติ',
          onPress: async () => {
            setPipeline((prev) =>
              prev.map((c) => (c._id === item._id ? { ...c, status: 'APPROVED' } : c))
            );
            try {
              await contentApi.submitReview(item._id, 'APPROVED', 'ผ่านการตรวจสอบคุณภาพเรียบร้อย');
            } catch (e) {
              console.warn('Updated locally:', e.message);
            }
            Alert.alert('อนุมัติสำเร็จ', `ชิ้นงาน "${item.title}" ได้รับการอนุมัติเรียบร้อยแล้ว`);
          },
        },
      ]
    );
  };

  const filteredPipeline = pipeline.filter((item) => {
    if (filter === 'ALL') return true;
    return item.status === filter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return {
          bg: colors.statusApprovedBg,
          text: colors.statusApprovedText,
          border: colors.statusApprovedBorder,
          label: 'ผ่านการอนุมัติ',
        };
      case 'PUBLISHED':
        return {
          bg: colors.statusApprovedBg,
          text: colors.statusApprovedText,
          border: colors.statusApprovedBorder,
          label: 'เผยแพร่แล้ว',
        };
      case 'REVISION':
        return {
          bg: colors.statusRevisionBg,
          text: colors.statusRevisionText,
          border: colors.statusRevisionBorder,
          label: 'ต้องแก้ไข',
        };
      case 'REVIEW':
        return {
          bg: colors.statusReviewBg,
          text: colors.statusReviewText,
          border: colors.statusReviewBorder,
          label: 'รอตรวจสอบ',
        };
      case 'PRODUCTION':
        return {
          bg: colors.statusInProgressBg,
          text: colors.statusInProgressText,
          border: colors.statusInProgressBorder,
          label: 'กำลังผลิต',
        };
      case 'PLANNING':
      default:
        return {
          bg: colors.statusTodoBg,
          text: colors.statusTodoText,
          border: colors.statusTodoBorder,
          label: 'วางแผน',
        };
    }
  };

  const reviewCount = pipeline.filter((c) => c.status === 'REVIEW').length;
  const prodCount = pipeline.filter((c) => c.status === 'PRODUCTION').length;
  const revisionCount = pipeline.filter((c) => c.status === 'REVISION').length;
  const approvedCount = pipeline.filter((c) => c.status === 'APPROVED' || c.status === 'PUBLISHED').length;

  // Visual Hierarchy: Manager Priority Queue
  const pendingReviewItems = pipeline.filter((c) => c.status === 'REVIEW' || c.status === 'REVISION');

  const renderContentCard = (item, isHighlightQueue = false) => {
    const st = getStatusBadge(item.status);

    return (
      <View
        key={item._id}
        style={[
          styles.card,
          {
            backgroundColor: colors.cardBg,
            borderColor: isHighlightQueue && item.status === 'REVIEW'
              ? colors.statusReviewBorder
              : isHighlightQueue && item.status === 'REVISION'
              ? colors.statusRevisionBorder
              : colors.cardBorder,
          },
        ]}
      >
        {/* Card Header Row: Platform & Status Pill */}
        <View style={styles.cardTopRow}>
          <View style={[styles.platBadge, { backgroundColor: colors.surfaceSubtle }]}>
            <Text style={[styles.platText, { color: colors.textSecondary }]}>{item.platform}</Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: st.bg, borderColor: st.border }]}>
            <Text style={[styles.statusBadgeText, { color: st.text }]}>{st.label}</Text>
          </View>
        </View>

        {/* Title & Description */}
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{item.title}</Text>
        <Text style={[styles.cardDesc, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.description}
        </Text>

        {/* Meta details without emojis */}
        <View style={[styles.metaRow, { borderTopColor: colors.border }]}>
          <View style={styles.metaItem}>
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              ผู้ผลิต: <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{item.creator}</Text>
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              กำหนดส่ง: <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{item.dueDate}</Text>
            </Text>
          </View>
        </View>

        {/* Contextual Action Buttons based on Status */}
        {item.status === 'PLANNING' && (
          <TouchableOpacity
            style={[styles.btnAction, { backgroundColor: colors.primary }]}
            onPress={() => handleStartProduction(item)}
          >
            <Text style={styles.btnActionText}>เริ่มขั้นตอนการผลิต</Text>
          </TouchableOpacity>
        )}

        {item.status === 'PRODUCTION' && (
          <TouchableOpacity
            style={[styles.btnAction, { backgroundColor: colors.primary }]}
            onPress={() => handleSendToReview(item)}
          >
            <Text style={styles.btnActionText}>ส่งเข้าสู่การตรวจสอบ</Text>
          </TouchableOpacity>
        )}

        {item.status === 'REVIEW' && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[
                styles.btnSecondary,
                { backgroundColor: colors.surface, borderColor: colors.statusRevisionBorder },
              ]}
              onPress={() => openRevisionModal(item)}
              activeOpacity={0.7}
            >
              <Text style={[styles.btnSecondaryText, { color: colors.statusRevisionText }]}>ส่งกลับแก้ไข</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnPrimary, { backgroundColor: colors.statusApprovedText }]}
              onPress={() => handleApproveContent(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.btnPrimaryText}>อนุมัติชิ้นงาน</Text>
            </TouchableOpacity>
          </View>
        )}

        {item.status === 'APPROVED' && (
          <TouchableOpacity
            style={[styles.btnPublish, { backgroundColor: colors.statusApprovedText }]}
            onPress={() => handlePublishNow(item)}
          >
            <Text style={styles.btnPublishText}>เผยแพร่ชิ้นงาน</Text>
          </TouchableOpacity>
        )}

        {item.status === 'PUBLISHED' && (
          <View style={[styles.publishedNotice, { backgroundColor: colors.statusApprovedBg, borderColor: colors.statusApprovedBorder }]}>
            <Text style={[styles.publishedNoticeText, { color: colors.statusApprovedText }]}>
              เผยแพร่สู่สาธารณะเรียบร้อยแล้ว
            </Text>
          </View>
        )}

        {item.status === 'REVISION' && (
          <View style={{ gap: 8 }}>
            <View style={[styles.revisionNotice, { backgroundColor: colors.statusRevisionBg, borderColor: colors.statusRevisionBorder }]}>
              <Text style={[styles.revisionNoticeText, { color: colors.statusRevisionText }]}>
                อยู่ในระหว่างผู้ผลิตนำกลับไปปรับปรุงแก้ไข
              </Text>
            </View>
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[
                  styles.btnSecondary,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
                onPress={() => handleStartProduction(item)}
              >
                <Text style={[styles.btnSecondaryText, { color: colors.textSecondary }]}>เริ่มผลิตซ้ำ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnPrimary, { backgroundColor: colors.primary }]}
                onPress={() => handleSendToReview(item)}
              >
                <Text style={styles.btnPrimaryText}>ส่งตรวจอีกครั้ง</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top Header Bar */}
      <View style={[styles.topHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{user?.name || 'สมศรี'}</Text>
          <View style={styles.roleRow}>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>ผู้จัดการฝ่ายผลิต (Manager)</Text>
            <View style={[styles.dbBadge, isLiveConnected ? styles.dbLive : styles.dbMock]}>
              <View style={[styles.dbDot, isLiveConnected ? styles.dotLive : styles.dotMock]} />
              <Text style={styles.dbText}>{isLiveConnected ? 'API Live' : 'Offline'}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.avatarButton, { backgroundColor: colors.primary }]}
          onPress={() => onNavigate('profile')}
        >
          <Text style={styles.avatarButtonText}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'M'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* KPI Summary Cards */}
        <View style={styles.kpiContainer}>
          <View style={[styles.kpiBox, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Text style={[styles.kpiNumber, { color: colors.statusReviewText }]}>{reviewCount}</Text>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>รอตรวจทาน</Text>
          </View>

          <View style={[styles.kpiBox, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Text style={[styles.kpiNumber, { color: colors.primary }]}>{prodCount}</Text>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>กำลังผลิต</Text>
          </View>

          <View style={[styles.kpiBox, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Text style={[styles.kpiNumber, { color: colors.statusRevisionText }]}>{revisionCount}</Text>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>สั่งแก้ไข</Text>
          </View>

          <View style={[styles.kpiBox, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Text style={[styles.kpiNumber, { color: colors.statusApprovedText }]}>{approvedCount}</Text>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>อนุมัติแล้ว</Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {[
            { id: 'ALL', label: 'ทั้งหมด' },
            { id: 'REVIEW', label: 'รอตรวจ' },
            { id: 'PRODUCTION', label: 'กำลังผลิต' },
            { id: 'REVISION', label: 'ส่งกลับแก้' },
            { id: 'APPROVED', label: 'อนุมัติแล้ว' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.filterPill,
                { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
                filter === tab.id && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => setFilter(tab.id)}
            >
              <Text
                style={[
                  styles.filterPillText,
                  { color: colors.textSecondary },
                  filter === tab.id && { color: '#FFFFFF', fontWeight: '700' },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Content Production Cards */}
        {loading ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.centerLoadingText, { color: colors.textSecondary }]}>
              กำลังโหลดสถานะกระบวนการผลิตจากระบบ...
            </Text>
          </View>
        ) : filteredPipeline.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>ไม่มีชิ้นงานในสถานะนี้</Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              เลือกตัวกรอง "ทั้งหมด" หรือตรวจสอบสถานะงานในแท็บ "ภาพรวมทีม"
            </Text>
          </View>
        ) : (
          <>
            {/* Visual Hierarchy: Priority 1 - Action Required Queue for Manager */}
            {filter === 'ALL' && pendingReviewItems.length > 0 && (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={[styles.sectionTitlePriority, { color: colors.statusReviewText }]}>
                    คิวที่ต้องตรวจสอบและติดตาม (Action Required)
                  </Text>
                  <View style={[styles.badgeCount, { backgroundColor: colors.statusReviewBg }]}>
                    <Text style={[styles.badgeCountText, { color: colors.statusReviewText }]}>
                      {pendingReviewItems.length} ชิ้นงาน
                    </Text>
                  </View>
                </View>
                <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                  ชิ้นงานที่รอการตรวจทานความถูกต้อง หรืออยู่ในระหว่างการปรับปรุงแก้ไข
                </Text>
                {pendingReviewItems.map((item) => renderContentCard(item, true))}
              </View>
            )}

            {/* General Pipeline List */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  {filter === 'ALL' && pendingReviewItems.length > 0 ? 'ชิ้นงานทั้งหมดในสายการผลิต' : 'รายการชิ้นงาน'}
                </Text>
                <Text style={[styles.sectionCount, { color: colors.textSecondary }]}>
                  {filteredPipeline.length} ชิ้นงาน
                </Text>
              </View>
              {filteredPipeline.map((item) => renderContentCard(item, false))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Revision Modal Dialog */}
      <Modal
        visible={revisionModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setRevisionModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>ส่งกลับแก้ไขชิ้นงาน</Text>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              {revisionTargetItem?.title} • ผู้รับผิดชอบ: {revisionTargetItem?.creator || 'ทีมงาน'}
            </Text>

            <Text style={[styles.modalLabel, { color: colors.textPrimary }]}>
              ระบุข้อคิดเห็น / คำแนะนำสิ่งที่ต้องแก้ไข:
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                  color: colors.textPrimary,
                },
              ]}
              placeholder="เช่น นาทีที่ 0:35 เสียงเพลงกลบเสียงพูด และมีคำผิดใน Subtitle ท้ายคลิป..."
              placeholderTextColor={colors.textMuted}
              value={revisionFeedback}
              onChangeText={setRevisionFeedback}
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}
                onPress={() => setRevisionModalVisible(false)}
                disabled={submittingReview}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalCancelBtnText, { color: colors.textSecondary }]}>ยกเลิก</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalConfirmBtn, { backgroundColor: colors.statusRevisionText }]}
                onPress={confirmSubmitRevision}
                disabled={submittingReview}
                activeOpacity={0.7}
              >
                {submittingReview ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.modalConfirmBtnText}>ยืนยันส่งกลับแก้ไข</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  headerSubtitle: {
    fontSize: 12,
  },
  dbBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dbLive: {
    backgroundColor: '#F0FDF4',
  },
  dbMock: {
    backgroundColor: '#F1F5F9',
  },
  dbDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 4,
  },
  dotLive: {
    backgroundColor: '#16A34A',
  },
  dotMock: {
    backgroundColor: '#94A3B8',
  },
  dbText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },
  avatarButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  kpiContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  kpiBox: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
  },
  kpiNumber: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 2,
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitlePriority: {
    fontSize: 15,
    fontWeight: '800',
  },
  badgeCount: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeCountText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 11,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  sectionCount: {
    fontSize: 12,
  },
  filterScroll: {
    marginBottom: 16,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '500',
  },
  card: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  platBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  platText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    marginTop: 4,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 2,
  },
  btnSecondary: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  btnSecondaryText: {
    fontSize: 13,
    fontWeight: '700',
  },
  btnPrimary: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  btnPrimaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  btnAction: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    marginTop: 2,
  },
  btnActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  btnPublish: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    marginTop: 2,
  },
  btnPublishText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  revisionNotice: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  revisionNoticeText: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  publishedNotice: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 2,
  },
  publishedNoticeText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  centerLoading: {
    padding: 32,
    alignItems: 'center',
  },
  centerLoadingText: {
    marginTop: 8,
    fontSize: 13,
  },
  emptyBox: {
    padding: 32,
    alignItems: 'center',
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 14,
    borderWidth: 1,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 12,
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    minHeight: 88,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalConfirmBtn: {
    flex: 1.5,
    minHeight: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
