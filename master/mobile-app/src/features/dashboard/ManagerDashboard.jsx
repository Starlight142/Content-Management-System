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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { contentApi } from '../../services/api';
import { useTheme } from '../../theme/ThemeContext';

export default function ManagerDashboard({ user, onNavigate, refreshKey }) {
  const { isDark, colors } = useTheme();
  const [pipeline, setPipeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

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
          creator: c.createdBy?.firstName ? `${c.createdBy.firstName} ${c.createdBy.lastName || ''}`.trim() : (c.createdBy?.username || 'Creator'),
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
    Alert.alert('เริ่มงานผลิต', `ส่ง "${item.title}" เข้าสู่ขั้นตอนกำลังผลิตแล้ว`);
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
    Alert.alert('ส่งตรวจสอบ', `ส่ง "${item.title}" เข้าสู่คิวการตรวจสอบของ Manager เรียบร้อย`);
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

  const handleRequestRevision = (item) => {
    Alert.prompt
      ? Alert.prompt(
          'ส่งกลับแก้ไข',
          `ระบุข้อคิดเห็นสำหรับ ${item.creator}:`,
          [
            { text: 'ยกเลิก', style: 'cancel' },
            {
              text: 'ยืนยันส่งกลับ',
              onPress: async (text) => {
                setPipeline((prev) =>
                  prev.map((c) => (c._id === item._id ? { ...c, status: 'REVISION' } : c))
                );
                try {
                  await contentApi.submitReview(item._id, 'REVISION', text || 'ส่งกลับแก้ไขตามข้อคิดเห็น');
                } catch (e) {
                  console.warn('Updated locally');
                }
                Alert.alert('แจ้งเตือนแล้ว', `ส่งงานกลับไปให้ ${item.creator} แก้ไขเรียบร้อย`);
              },
            },
          ],
          'plain-text',
          'ปรับความยาวคลิปและตรวจสอบเสียงพูด'
        )
      : Alert.alert(
          'ส่งกลับแก้ไข',
          `คุณต้องการส่ง "${item.title}" กลับไปให้ ${item.creator} แก้ไขหรือไม่?`,
          [
            { text: 'ยกเลิก', style: 'cancel' },
            {
              text: 'ยืนยันส่งกลับ',
              style: 'destructive',
              onPress: async () => {
                setPipeline((prev) =>
                  prev.map((c) => (c._id === item._id ? { ...c, status: 'REVISION' } : c))
                );
                try {
                  await contentApi.submitReview(item._id, 'REVISION', 'ส่งกลับแก้ไขตามข้อคิดเห็น');
                } catch (e) {
                  console.warn('Updated locally');
                }
                Alert.alert('แจ้งเตือนแล้ว', `ส่งงานกลับไปให้ ${item.creator} แก้ไขเรียบร้อย`);
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
        return { bg: colors.statusApprovedBg, text: colors.statusApprovedText, label: 'ผ่านการอนุมัติ' };
      case 'PUBLISHED':
        return { bg: colors.statusApprovedBg, text: colors.statusApprovedText, label: 'เผยแพร่แล้ว' };
      case 'REVISION':
        return { bg: colors.statusRevisionBg, text: colors.statusRevisionText, label: 'ไม่ผ่าน (ต้องแก้ไข)' };
      case 'REVIEW':
        return { bg: colors.statusReviewBg, text: colors.statusReviewText, label: 'รอตรวจสอบ' };
      case 'PRODUCTION':
        return { bg: colors.statusProdBg, text: colors.statusProdText, label: 'กำลังผลิต' };
      default:
        return { bg: colors.surfaceSubtle, text: colors.textSecondary, label: status || 'วางแผน' };
    }
  };

  const reviewCount = pipeline.filter((c) => c.status === 'REVIEW').length;
  const prodCount = pipeline.filter((c) => c.status === 'PRODUCTION').length;
  const approvedCount = pipeline.filter((c) => c.status === 'APPROVED' || c.status === 'PUBLISHED').length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
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
          style={[styles.avatarButton, { backgroundColor: isDark ? colors.surfaceSubtle : '#0F172A' }]}
          onPress={() => onNavigate('profile')}
          title="โปรไฟล์"
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
          <View style={[styles.kpiBox, { backgroundColor: colors.cardBg, borderColor: isDark ? colors.border : '#FDE68A' }]}>
            <Text style={[styles.kpiNumber, { color: '#D97706' }]}>{reviewCount}</Text>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>รอตรวจทาน</Text>
          </View>

          <View style={[styles.kpiBox, { backgroundColor: colors.cardBg, borderColor: isDark ? colors.border : '#E2E8F0' }]}>
            <Text style={[styles.kpiNumber, { color: isDark ? '#94A3B8' : '#475569' }]}>{prodCount}</Text>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>กำลังผลิต</Text>
          </View>

          <View style={[styles.kpiBox, { backgroundColor: colors.cardBg, borderColor: isDark ? colors.border : '#BBF7D0' }]}>
            <Text style={[styles.kpiNumber, { color: '#16A34A' }]}>{approvedCount}</Text>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>ผ่าน/อนุมัติ</Text>
          </View>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>รายการงานผลิต</Text>
          <Text style={[styles.sectionCount, { color: colors.textSecondary }]}>{filteredPipeline.length} ชิ้นงาน</Text>
        </View>

        {/* Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {[
            { id: 'ALL', label: 'ทั้งหมด' },
            { id: 'REVIEW', label: 'รอตรวจ' },
            { id: 'PRODUCTION', label: 'กำลังผลิต' },
            { id: 'APPROVED', label: 'อนุมัติแล้ว' },
            { id: 'REVISION', label: 'ส่งกลับแก้' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.filterPill,
                { backgroundColor: colors.surfaceSubtle },
                filter === tab.id && { backgroundColor: colors.primary },
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
          <View style={{ padding: 32, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={{ marginTop: 8, fontSize: 13, color: colors.textSecondary }}>
              กำลังโหลดสถานะกระบวนการผลิตจาก MongoDB...
            </Text>
          </View>
        ) : filteredPipeline.length === 0 ? (
          <View style={{ padding: 32, alignItems: 'center', backgroundColor: colors.cardBg, borderRadius: 12, marginTop: 12, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' }}>
              ไม่มีชิ้นงานในสถานะนี้
            </Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4, textAlign: 'center' }}>
              เลือกตัวกรอง "ทั้งหมด" หรือตรวจสอบสถานะงานในแท็บ "ภาพรวมทีม"
            </Text>
          </View>
        ) : (
          filteredPipeline.map((item) => {
            const st = getStatusBadge(item.status);

            return (
              <View key={item._id} style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                {/* Card Header Row */}
                <View style={styles.cardTopRow}>
                  <View style={[styles.platBadge, { backgroundColor: colors.surfaceSubtle }]}>
                    <Text style={[styles.platText, { color: colors.textSecondary }]}>{item.platform}</Text>
                  </View>

                  <View style={[styles.statusBadge, { backgroundColor: st.bg }]}>
                    <Text style={[styles.statusBadgeText, { color: st.text }]}>{st.label}</Text>
                  </View>
                </View>

                {/* Title & Description */}
                <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{item.title}</Text>
                <Text style={[styles.cardDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                  {item.description}
                </Text>

                {/* Meta details */}
                <View style={[styles.metaRow, { borderTopColor: colors.border }]}>
                  <View style={styles.metaItem}>
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>👤 {item.creator}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>📅 กำหนดส่ง: {item.dueDate}</Text>
                  </View>
                </View>

                {/* Contextual Action Buttons based on Status */}
                {item.status === 'PLANNING' && (
                  <TouchableOpacity
                    style={[styles.btnStartProd, { backgroundColor: isDark ? colors.primary : '#0F172A' }]}
                    onPress={() => handleStartProduction(item)}
                  >
                    <Text style={styles.btnStartProdText}>เริ่มขั้นตอนผลิต (Start Production)</Text>
                  </TouchableOpacity>
                )}

                {item.status === 'PRODUCTION' && (
                  <TouchableOpacity
                    style={styles.btnReviewProd}
                    onPress={() => handleSendToReview(item)}
                  >
                    <Text style={styles.btnReviewProdText}>ส่งเข้าสู่การตรวจสอบ (Move to Review)</Text>
                  </TouchableOpacity>
                )}

                {item.status === 'REVIEW' && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[
                        styles.btnSecondary,
                        { backgroundColor: colors.surface, borderColor: isDark ? '#7F1D1D' : '#FCA5A5' },
                      ]}
                      onPress={() => handleRequestRevision(item)}
                    >
                      <Text style={[styles.btnSecondaryText, { color: isDark ? '#F87171' : '#DC2626' }]}>ส่งกลับแก้ไข</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.btnPrimary, { backgroundColor: isDark ? colors.primary : '#0F172A' }]}
                      onPress={() => onNavigate('legal', item)}
                    >
                      <Text style={styles.btnPrimaryText}>ตรวจความถูกต้อง</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {item.status === 'APPROVED' && (
                  <TouchableOpacity
                    style={styles.btnPublish}
                    onPress={() => handlePublishNow(item)}
                  >
                    <Text style={styles.btnPublishText}>เผยแพร่ชิ้นงาน (Publish)</Text>
                  </TouchableOpacity>
                )}

                {item.status === 'PUBLISHED' && (
                  <View style={[styles.publishedNotice, { backgroundColor: isDark ? '#064E3B44' : '#DCFCE7' }]}>
                    <Text style={[styles.publishedNoticeText, { color: isDark ? '#4ADE80' : '#16A34A' }]}>
                      เผยแพร่สู่สาธารณะเรียบร้อยแล้ว
                    </Text>
                  </View>
                )}

                {item.status === 'REVISION' && (
                  <View style={{ gap: 8 }}>
                    <View style={[styles.revisionNotice, { backgroundColor: isDark ? '#7F1D1D44' : '#FEF2F2' }]}>
                      <Text style={[styles.revisionNoticeText, { color: isDark ? '#F87171' : '#DC2626' }]}>
                        อยู่ในระหว่างผู้ผลิตนำกลับไปปรับปรุงแก้ไข
                      </Text>
                    </View>
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={[
                          styles.btnSecondary,
                          { backgroundColor: colors.surface, borderColor: isDark ? '#7F1D1D' : '#FCA5A5' },
                        ]}
                        onPress={() => handleStartProduction(item)}
                      >
                        <Text style={[styles.btnSecondaryText, { color: isDark ? '#F87171' : '#DC2626' }]}>เริ่มผลิตซ้ำ</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.btnPrimary, { backgroundColor: isDark ? colors.primary : '#0F172A' }]}
                        onPress={() => handleSendToReview(item)}
                      >
                        <Text style={styles.btnPrimaryText}>ส่งตรวจอีกครั้ง</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
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
    backgroundColor: '#0F172A',
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
    gap: 10,
    marginBottom: 20,
  },
  kpiBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  kpiReview: {
    borderTopWidth: 3,
    borderTopColor: '#D97706',
  },
  kpiProd: {
    borderTopWidth: 3,
    borderTopColor: '#64748B',
  },
  kpiApproved: {
    borderTopWidth: 3,
    borderTopColor: '#16A34A',
  },
  kpiNumber: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 2,
  },
  kpiLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionCount: {
    fontSize: 12,
    color: '#64748B',
  },
  filterScroll: {
    marginBottom: 16,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  filterPillActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  filterPillText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  platBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  platText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: '#64748B',
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
    borderTopColor: '#E2E8F0',
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
    color: '#64748B',
  },
  metaDot: {
    fontSize: 12,
    color: '#CBD5E1',
    marginHorizontal: 6,
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
    borderColor: '#FCA5A5',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  btnSecondaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626',
  },
  btnPrimary: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  btnPrimaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  btnPublish: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#16A34A',
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
    backgroundColor: '#FEF2F2',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 8,
  },
  revisionNoticeText: {
    fontSize: 12,
    color: '#DC2626',
    textAlign: 'center',
    fontWeight: '500',
  },
  btnStartProd: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    marginTop: 2,
  },
  btnStartProdText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  btnReviewProd: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#D97706',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    marginTop: 2,
  },
  btnReviewProdText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  publishedNotice: {
    backgroundColor: '#DCFCE7',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginTop: 2,
  },
  publishedNoticeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16A34A',
    textAlign: 'center',
  },
});
