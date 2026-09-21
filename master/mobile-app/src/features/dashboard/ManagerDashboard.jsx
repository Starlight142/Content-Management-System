import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { contentApi } from '../../services/api';

export default function ManagerDashboard({ user, onNavigate }) {
  const [pipeline, setPipeline] = useState([
    {
      _id: '1',
      title: 'สรุปข่าว AI ภายใน 1 นาที',
      description: 'คลิปสั้นเจาะลึกฟีเจอร์ AI Tool ใหม่ล่าสุดประจำสัปดาห์',
      platform: 'TikTok',
      status: 'REVIEW',
      category: 'News & Tech',
      creator: 'John Creator',
      dueDate: '2026-09-20',
    },
    {
      _id: '2',
      title: 'รีวิวแก็ดเจ็ตสมาร์ตโฮม 2026',
      description: 'ทดสอบอุปกรณ์ Smart Home 5 ชิ้นที่ควรมีติดบ้าน',
      platform: 'YouTube',
      status: 'PUBLISHED',
      category: 'Tech Review',
      creator: 'Jane Editor',
      dueDate: '2026-09-25',
    },
    {
      _id: '3',
      title: 'Vlog เบื้องหลังกองถ่ายทำภาพยนตร์สั้น',
      description: 'พาดูมุมกล้องและเทคนิคการจัดแสงหลังสตู',
      platform: 'Instagram',
      status: 'PRODUCTION',
      category: 'Behind the Scenes',
      creator: 'Somchai Director',
      dueDate: '2026-09-28',
    },
    {
      _id: '4',
      title: 'Unbox ไมโครโฟนไร้สายสตูดิโอ 8K',
      description: 'แกะกล่องและทดสอบเสียงพูดในที่เสียงดัง',
      platform: 'YouTube',
      status: 'PLANNING',
      category: 'Unboxing',
      creator: 'Jane Editor',
      dueDate: '2026-10-02',
    },
  ]);

  const [filter, setFilter] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  const fetchLivePipeline = async () => {
    try {
      const res = await contentApi.getAll();
      if (res && res.contents && res.contents.length > 0) {
        const mapped = res.contents.map((c) => ({
          _id: c._id,
          title: c.title,
          description: c.description || 'ไม่มีรายละเอียดเนื้อหา',
          platform: c.platform || 'General',
          status: c.status || 'PLANNING',
          category: c.category || 'General',
          creator: c.createdBy?.firstName || c.createdBy?.username || 'Creator',
          dueDate: c.dueDate ? c.dueDate.split('T')[0] : '2026-09-30',
          legalChecklist: c.legalChecklist || [],
        }));
        setPipeline(mapped);
        setIsLiveConnected(true);
      }
    } catch (e) {
      setIsLiveConnected(false);
    }
  };

  useEffect(() => {
    fetchLivePipeline();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLivePipeline();
    setRefreshing(false);
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
              console.warn('Updated locally');
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
                  await contentApi.updateStatus(item._id, 'REVISION');
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
        return { bg: '#DCFCE7', text: '#16A34A', label: 'ผ่านการอนุมัติ' };
      case 'PUBLISHED':
        return { bg: '#DCFCE7', text: '#16A34A', label: 'เผยแพร่แล้ว' };
      case 'REVISION':
        return { bg: '#FEE2E2', text: '#DC2626', label: 'ไม่ผ่าน (ต้องแก้ไข)' };
      case 'REVIEW':
        return { bg: '#FEF3C7', text: '#D97706', label: 'รอตรวจสอบ' };
      case 'PRODUCTION':
        return { bg: '#F1F5F9', text: '#475569', label: 'กำลังผลิต' };
      default:
        return { bg: '#F1F5F9', text: '#64748B', label: status || 'วางแผน' };
    }
  };

  const reviewCount = pipeline.filter((c) => c.status === 'REVIEW').length;
  const prodCount = pipeline.filter((c) => c.status === 'PRODUCTION').length;
  const approvedCount = pipeline.filter((c) => c.status === 'APPROVED' || c.status === 'PUBLISHED').length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header Bar */}
      <View style={styles.topHeader}>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{user?.name || 'สมศรี'}</Text>
          <View style={styles.roleRow}>
            <Text style={styles.headerSubtitle}>ผู้จัดการฝ่ายผลิต (Manager)</Text>
            <View style={[styles.dbBadge, isLiveConnected ? styles.dbLive : styles.dbMock]}>
              <View style={[styles.dbDot, isLiveConnected ? styles.dotLive : styles.dotMock]} />
              <Text style={styles.dbText}>{isLiveConnected ? 'API Live' : 'Offline'}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.avatarButton}
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
          <View style={[styles.kpiBox, styles.kpiReview]}>
            <Text style={[styles.kpiNumber, { color: '#D97706' }]}>{reviewCount}</Text>
            <Text style={styles.kpiLabel}>รอตรวจทาน</Text>
          </View>

          <View style={[styles.kpiBox, styles.kpiProd]}>
            <Text style={[styles.kpiNumber, { color: '#475569' }]}>{prodCount}</Text>
            <Text style={styles.kpiLabel}>กำลังผลิต</Text>
          </View>

          <View style={[styles.kpiBox, styles.kpiApproved]}>
            <Text style={[styles.kpiNumber, { color: '#16A34A' }]}>{approvedCount}</Text>
            <Text style={styles.kpiLabel}>ผ่าน/อนุมัติ</Text>
          </View>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>รายการงานผลิต</Text>
          <Text style={styles.sectionCount}>{filteredPipeline.length} ชิ้นงาน</Text>
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
              style={[styles.filterPill, filter === tab.id && styles.filterPillActive]}
              onPress={() => setFilter(tab.id)}
            >
              <Text
                style={[styles.filterPillText, filter === tab.id && styles.filterPillTextActive]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Content Production Cards */}
        {filteredPipeline.map((item) => {
          const st = getStatusBadge(item.status);

          return (
            <View key={item._id} style={styles.card}>
              {/* Card Header Row */}
              <View style={styles.cardTopRow}>
                <View style={styles.platBadge}>
                  <Text style={styles.platText}>{item.platform}</Text>
                </View>

                <View style={[styles.statusBadge, { backgroundColor: st.bg }]}>
                  <Text style={[styles.statusBadgeText, { color: st.text }]}>{st.label}</Text>
                </View>
              </View>

              {/* Title & Description */}
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc} numberOfLines={2}>
                {item.description}
              </Text>

              {/* Metadata Row */}
              <View style={styles.cardMetaRow}>
                <Text style={styles.metaText}>ผู้ผลิต: {item.creator}</Text>
                <Text style={styles.metaDot}>•</Text>
                <Text style={styles.metaText}>กำหนดส่ง: {item.dueDate}</Text>
              </View>

              {/* Manager Actions based on status */}
              {item.status === 'REVIEW' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.btnSecondary}
                    onPress={() => handleRequestRevision(item)}
                  >
                    <Text style={styles.btnSecondaryText}>ส่งกลับแก้ไข</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.btnPrimary}
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

              {item.status === 'REVISION' && (
                <View style={styles.revisionNotice}>
                  <Text style={styles.revisionNoticeText}>
                    อยู่ในระหว่างผู้ผลิตนำกลับไปปรับปรุงแก้ไข
                  </Text>
                </View>
              )}
            </View>
          );
        })}
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
    lineHeight: 18,
    marginBottom: 12,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    marginBottom: 12,
  },
  metaText: {
    fontSize: 12,
    color: '#64748B',
  },
  metaDot: {
    fontSize: 12,
    color: '#CBD5E1',
    marginHorizontal: 6,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  btnSecondary: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  btnSecondaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
  },
  btnPrimary: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    alignItems: 'center',
  },
  btnPrimaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  btnPublish: {
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#16A34A',
    alignItems: 'center',
  },
  btnPublishText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  revisionNotice: {
    backgroundColor: '#FEF2F2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  revisionNoticeText: {
    fontSize: 12,
    color: '#DC2626',
    textAlign: 'center',
  },
});
