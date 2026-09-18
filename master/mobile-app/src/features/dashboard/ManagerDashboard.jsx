import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { contentApi } from '../../services/api';

export default function ManagerDashboard({ user, onNavigate, onLogout }) {
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
      views: 88000,
      likes: 12400,
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
      views: 24500,
      likes: 3200,
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
      views: 15200,
      likes: 1800,
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
      views: 0,
      likes: 0,
    },
  ]);

  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  // ดึงข้อมูลจริงจาก MongoDB Backend ทันทีที่เข้าหน้าจอ
  const fetchContents = async () => {
    try {
      const res = await contentApi.getAll();
      if (Array.isArray(res) && res.length > 0) {
        const formatted = res.map((item) => ({
          _id: item._id,
          title: item.title,
          description: item.description || 'ไม่มีรายละเอียดเพิ่มเติม',
          platform: item.platform || 'YouTube',
          status: item.status || 'PLANNING',
          category: item.category || 'General',
          creator: item.createdBy?.firstName 
            ? `${item.createdBy.firstName} (${item.createdBy.username})`
            : 'ทีมงานฝ่ายผลิต',
          dueDate: item.dueDate ? item.dueDate.split('T')[0] : '2026-09-30',
          views: item.metrics?.[0]?.views || 0,
          likes: item.metrics?.[0]?.likes || 0,
          legalChecklist: item.legalChecklist || [],
        }));
        setPipeline(formatted);
        setIsLiveConnected(true);
      }
    } catch (err) {
      console.warn('Using cached/offline pipeline data:', err.message);
      setIsLiveConnected(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchContents();
    setRefreshing(false);
  };

  const handleApprove = (item) => {
    const isLegalPassed = item.legalChecklist?.length >= 5 && item.legalChecklist.every((i) => i.passed);
    if (!isLegalPassed) {
      Alert.alert(
        '⚖️ ติดด่าน Legal Gatekeeper',
        `ชิ้นงาน "${item.title}" ยังไม่ผ่านการตรวจสอบกฎหมายครบทั้ง 5 ข้อ\n\nระบบไม่อนุญาตให้อนุมัติข้ามขั้นตอน ต้องการเปิดหน้า Legal & PDPA Audit เพื่อตรวจสอบเดี๋ยวนี้หรือไม่?`,
        [
          { text: 'ไว้ทีหลัง', style: 'cancel' },
          {
            text: '⚖️ ตรวจ Legal เดี๋ยวนี้',
            onPress: () => onNavigate('legal', item),
          },
        ]
      );
      return;
    }

    Alert.alert(
      '✅ อนุมัติ Content',
      `คุณต้องการอนุมัติ "${item.title}" เพื่อส่งต่อไปยังขั้นตอน Schedule & Publish หรือไม่?`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'อนุมัติ (Approve)',
          onPress: async () => {
            setPipeline((prev) =>
              prev.map((c) => (c._id === item._id ? { ...c, status: 'APPROVED' } : c))
            );
            try {
              await contentApi.updateStatus(item._id, 'APPROVED');
            } catch (e) {
              console.warn('Updated locally (offline mode)');
            }
            Alert.alert('สำเร็จ', 'อนุมัติเรียบร้อย! ชิ้นงานพร้อมเผยแพร่สู่สาธารณะ');
          },
        },
      ]
    );
  };

  const handlePublishNow = async (item) => {
    Alert.alert(
      '🚀 เผยแพร่ทันที (Publish Now)',
      `คุณต้องการเผยแพร่ "${item.title}" ไปยังแพลตฟอร์ม ${item.platform} ทันทีหรือไม่?`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: '🚀 ยืนยันเผยแพร่',
          onPress: async () => {
            setPipeline((prev) =>
              prev.map((c) => (c._id === item._id ? { ...c, status: 'PUBLISHED' } : c))
            );
            try {
              await contentApi.updateStatus(item._id, 'PUBLISHED');
            } catch (e) {
              console.warn('Updated locally');
            }
            Alert.alert('เผยแพร่สำเร็จ! 🎉', `Content ถูกส่งขึ้นแพลตฟอร์ม ${item.platform} เรียบร้อยแล้ว`);
          },
        },
      ]
    );
  };

  const handleRequestRevision = (item) => {
    Alert.prompt
      ? Alert.prompt(
          '🔄 ส่งกลับแก้ไข (Revision)',
          `ระบุสิ่งที่ต้องการให้ ${item.creator} ปรับปรุง:`,
          [
            { text: 'ยกเลิก', style: 'cancel' },
            {
              text: 'ส่งกลับแก้ไข',
              onPress: async (notes) => {
                setPipeline((prev) =>
                  prev.map((c) => (c._id === item._id ? { ...c, status: 'REVISION' } : c))
                );
                try {
                  await contentApi.updateStatus(item._id, 'REVISION');
                } catch (e) {
                  console.warn('Updated locally (offline mode)');
                }
                Alert.alert('แจ้งเตือนแล้ว', `ส่งงานกลับไปให้ ${item.creator} แก้ไขเรียบร้อย`);
              },
            },
          ],
          'plain-text',
          'ปรับความยาวของ Hook ในช่วง 3 วินาทีแรก และปรับเสียงเพลง BGM ลง 15%'
        )
      : Alert.alert(
          '🔄 ส่งกลับแก้ไข (Revision)',
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

  // กรองงานตามแท็บ
  const filteredPipeline = pipeline.filter((item) => {
    if (filter === 'ALL') return true;
    return item.status === filter;
  });

  const getPlatformStyle = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'youtube':
        return { bg: '#FEE2E2', text: '#DC2626', icon: '▶️' };
      case 'tiktok':
        return { bg: '#F1F5F9', text: '#0F172A', icon: '🎵' };
      case 'instagram':
        return { bg: '#FDF4FF', text: '#C026D3', icon: '📸' };
      default:
        return { bg: '#EFF6FF', text: '#2563EB', icon: '🌐' };
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return { bg: '#DCFCE7', text: '#15803D', label: 'APPROVED' };
      case 'REVIEW':
        return { bg: '#DBEAFE', text: '#1D4ED8', label: 'REVIEW' };
      case 'PRODUCTION':
        return { bg: '#FEF3C7', text: '#B45309', label: 'PRODUCTION' };
      case 'REVISION':
        return { bg: '#FFE4E6', text: '#E11D48', label: 'REVISION' };
      case 'PUBLISHED':
        return { bg: '#F3E8FF', text: '#7E22CE', label: 'PUBLISHED' };
      default:
        return { bg: '#F1F5F9', text: '#475569', label: status || 'PLANNING' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Top Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={styles.avatarRow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>👔</Text>
              </View>
              <View>
                <View style={styles.rolePillRow}>
                  <View style={styles.managerRoleBadge}>
                    <Text style={styles.managerRoleText}>MANAGER</Text>
                  </View>
                  <View style={[styles.dbBadge, isLiveConnected ? styles.dbLive : styles.dbMock]}>
                    <View style={[styles.dbDot, isLiveConnected ? styles.dotLive : styles.dotMock]} />
                    <Text style={styles.dbText}>
                      {isLiveConnected ? 'MongoDB Live (Port 5000)' : 'Mock Offline'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.headerTitle}>{user?.name || 'สมศรี (Content Lead)'}</Text>
                <Text style={styles.headerSubtitle}>StudioFlow Production Management</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
              <Text style={styles.logoutText}>ออกจากระบบ</Text>
            </TouchableOpacity>
          </View>

          {/* Lifecycle Flow Stepper (Architecture Overview for Diagram/Figma) */}
          <View style={styles.lifecycleBar}>
            <Text style={styles.lifecycleTitle}>🔄 PRODUCTION LIFECYCLE STAGES</Text>
            <View style={styles.stepsRow}>
              <View style={[styles.stepItem, styles.stepActive]}>
                <Text style={styles.stepNum}>1</Text>
                <Text style={styles.stepLabel}>Idea</Text>
              </View>
              <Text style={styles.stepArrow}>→</Text>
              <View style={[styles.stepItem, styles.stepActive]}>
                <Text style={styles.stepNum}>2</Text>
                <Text style={styles.stepLabel}>Produce</Text>
              </View>
              <Text style={styles.stepArrow}>→</Text>
              <View style={[styles.stepItem, styles.stepHighlight]}>
                <Text style={[styles.stepNum, { color: '#2563EB' }]}>3</Text>
                <Text style={[styles.stepLabel, { color: '#1D4ED8', fontWeight: '700' }]}>Review</Text>
              </View>
              <Text style={styles.stepArrow}>→</Text>
              <View style={styles.stepItem}>
                <Text style={styles.stepNum}>4</Text>
                <Text style={styles.stepLabel}>Legal</Text>
              </View>
              <Text style={styles.stepArrow}>→</Text>
              <View style={styles.stepItem}>
                <Text style={styles.stepNum}>5</Text>
                <Text style={styles.stepLabel}>Publish</Text>
              </View>
            </View>
          </View>
        </View>

        {/* KPI Metrics Strip */}
        <View style={styles.kpiContainer}>
          <View style={[styles.kpiBox, { borderColor: '#BFDBFE' }]}>
            <Text style={[styles.kpiNumber, { color: '#1D4ED8' }]}>
              {pipeline.filter((c) => c.status === 'REVIEW').length}
            </Text>
            <Text style={styles.kpiLabel}>คิวรอ Review</Text>
          </View>

          <View style={[styles.kpiBox, { borderColor: '#FDE68A' }]}>
            <Text style={[styles.kpiNumber, { color: '#B45309' }]}>
              {pipeline.filter((c) => c.status === 'PRODUCTION').length}
            </Text>
            <Text style={styles.kpiLabel}>กำลังผลิต</Text>
          </View>

          <View style={[styles.kpiBox, { borderColor: '#BBF7D0' }]}>
            <Text style={[styles.kpiNumber, { color: '#15803D' }]}>
              {pipeline.filter((c) => c.status === 'APPROVED' || c.status === 'PUBLISHED').length}
            </Text>
            <Text style={styles.kpiLabel}>อนุมัติ/เผยแพร่</Text>
          </View>

          <View style={[styles.kpiBox, { borderColor: '#DDD6FE' }]}>
            <Text style={[styles.kpiNumber, { color: '#7E22CE' }]}>
              {Math.round(pipeline.reduce((acc, curr) => acc + (curr.views || 0), 0) / 1000)}K
            </Text>
            <Text style={styles.kpiLabel}>ยอดวิวรวม</Text>
          </View>
        </View>

        {/* Feature Hub Shortcuts */}
        <Text style={styles.sectionHeader}>⚡ ศูนย์การจัดการ (Management Hub)</Text>
        <View style={styles.hubGrid}>
          <TouchableOpacity style={styles.hubCard} onPress={() => onNavigate('ideas')}>
            <View style={[styles.hubIconBg, { backgroundColor: '#FEF3C7' }]}>
              <Text style={styles.hubIcon}>💡</Text>
            </View>
            <View style={styles.hubInfo}>
              <Text style={styles.hubTitle}>Idea Board</Text>
              <Text style={styles.hubDesc}>คลังไอเดีย & เสนอคอนเซปต์ใหม่</Text>
            </View>
            <Text style={styles.hubArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.hubCard} onPress={() => onNavigate('legal')}>
            <View style={[styles.hubIconBg, { backgroundColor: '#E0E7FF' }]}>
              <Text style={styles.hubIcon}>⚖️</Text>
            </View>
            <View style={styles.hubInfo}>
              <Text style={styles.hubTitle}>Legal & PDPA Gatekeeper</Text>
              <Text style={styles.hubDesc}>Checklist ตรวจสิทธิ์ 5 ข้อก่อน Publish</Text>
            </View>
            <Text style={styles.hubArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Section Header & Filter Tabs */}
        <View style={styles.sectionFilterRow}>
          <View>
            <Text style={styles.sectionHeader}>📋 รายการ Content ในกระบวนการ</Text>
            <Text style={styles.sectionSubtitle}>
              พบ {filteredPipeline.length} ชิ้นงาน (คลิกเพื่อตรวจงาน)
            </Text>
          </View>
        </View>

        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {[
            { id: 'ALL', label: 'ทั้งหมด' },
            { id: 'REVIEW', label: '🕒 รอตรวจ (Review)' },
            { id: 'PRODUCTION', label: '🎬 กำลังผลิต' },
            { id: 'APPROVED', label: '✅ อนุมัติแล้ว' },
            { id: 'PUBLISHED', label: '🚀 เผยแพร่แล้ว' },
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
          const plat = getPlatformStyle(item.platform);
          const st = getStatusBadge(item.status);

          return (
            <View key={item._id} style={styles.card}>
              {/* Card Top Row */}
              <View style={styles.cardTopRow}>
                <View style={[styles.platBadge, { backgroundColor: plat.bg }]}>
                  <Text style={styles.platIcon}>{plat.icon}</Text>
                  <Text style={[styles.platText, { color: plat.text }]}>{item.platform}</Text>
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
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>👤 ผู้รับผิดชอบ:</Text>
                  <Text style={styles.metaValue}>{item.creator}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>📅 กำหนดส่ง:</Text>
                  <Text style={styles.metaValue}>{item.dueDate}</Text>
                </View>
              </View>

              {/* Analytics Snapshot Tag (if views exist) */}
              {item.views > 0 && (
                <View style={styles.metricsTag}>
                  <Text style={styles.metricsText}>
                    📊 สถิติ Performance: {item.views.toLocaleString()} Views • {item.likes.toLocaleString()} Likes
                  </Text>
                </View>
              )}

              {/* Manager Actions */}
              {item.status === 'REVIEW' && (
                <View style={styles.actionContainer}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.btnRevision]}
                    onPress={() => handleRequestRevision(item)}
                  >
                    <Text style={styles.btnRevisionText}>🔄 ส่งกลับแก้</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, styles.btnLegalAudit]}
                    onPress={() => onNavigate('legal', item)}
                  >
                    <Text style={styles.btnLegalAuditText}>⚖️ ตรวจ Legal</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, styles.btnApprove]}
                    onPress={() => handleApprove(item)}
                  >
                    <Text style={styles.btnApproveText}>✅ อนุมัติ</Text>
                  </TouchableOpacity>
                </View>
              )}

              {item.status === 'APPROVED' && (
                <TouchableOpacity
                  style={styles.publishActionBtn}
                  onPress={() => handlePublishNow(item)}
                >
                  <Text style={styles.publishActionBtnText}>
                    🚀 เผยแพร่ทันที (Publish to {item.platform}) →
                  </Text>
                </TouchableOpacity>
              )}

              {item.status === 'PUBLISHED' && (
                <View style={styles.publishedSuccessBadge}>
                  <Text style={styles.publishedSuccessText}>
                    🎉 เผยแพร่สู่สาธารณะแล้วบน {item.platform}
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
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  avatarText: {
    fontSize: 22,
  },
  rolePillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  managerRoleBadge: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  managerRoleText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dbBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  dbLive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  dbMock: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  dbDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  dotLive: {
    backgroundColor: '#16A34A',
  },
  dotMock: {
    backgroundColor: '#D97706',
  },
  dbText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#334155',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  logoutButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  logoutText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
  },
  lifecycleBar: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  lifecycleTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepItem: {
    alignItems: 'center',
  },
  stepActive: {
    opacity: 0.8,
  },
  stepHighlight: {
    transform: [{ scale: 1.05 }],
  },
  stepNum: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  stepArrow: {
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '700',
  },
  kpiContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  kpiBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  kpiNumber: {
    fontSize: 18,
    fontWeight: '800',
  },
  kpiLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 12,
  },
  hubGrid: {
    gap: 8,
    marginBottom: 20,
  },
  hubCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  hubIconBg: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  hubIcon: {
    fontSize: 18,
  },
  hubInfo: {
    flex: 1,
  },
  hubTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  hubDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  hubArrow: {
    fontSize: 20,
    color: '#94A3B8',
    fontWeight: '600',
  },
  sectionFilterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterScroll: {
    marginBottom: 14,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  filterPillActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  platBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  platIcon: {
    fontSize: 11,
    marginRight: 4,
  },
  platText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
    marginBottom: 10,
  },
  cardMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 10,
    color: '#64748B',
    marginRight: 4,
  },
  metaValue: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E293B',
  },
  metricsTag: {
    backgroundColor: '#F0FDF4',
    borderRadius: 6,
    padding: 6,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 8,
  },
  metricsText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#166534',
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnRevision: {
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  btnRevisionText: {
    color: '#E11D48',
    fontSize: 11,
    fontWeight: '700',
  },
  btnApprove: {
    backgroundColor: '#4F46E5',
  },
  btnApproveText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  legalCheckBtn: {
    backgroundColor: '#EEF2FF',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    alignItems: 'center',
    marginTop: 4,
  },
  legalCheckBtnText: {
    color: '#4338CA',
    fontSize: 11,
    fontWeight: '700',
  },
  btnLegalAudit: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  btnLegalAuditText: {
    color: '#4338CA',
    fontSize: 11,
    fontWeight: '700',
  },
  publishActionBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  publishActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  publishedSuccessBadge: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  publishedSuccessText: {
    color: '#047857',
    fontSize: 11,
    fontWeight: '700',
  },
});
