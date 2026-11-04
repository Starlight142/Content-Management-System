import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ideaApi } from '../../services/api';
import { useTheme } from '../../theme/ThemeContext';
import SmoothModal from '../../components/SmoothModal';

const CATEGORIES = ['Tech Review', 'News & Tech', 'Lifestyle', 'Tutorial'];
const PLATFORMS = ['YouTube', 'TikTok', 'Instagram'];

export default function IdeaListScreen({ user }) {
  const { isDark, colors } = useTheme();
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [platform, setPlatform] = useState('YouTube');
  const [category, setCategory] = useState('Tech Review');

  const currentUserId = String(user?.id || user?._id || '');
  const isManagerOrAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const mapIdeaRecord = useCallback((i) => {
    const rawProposer = i.proposedBy;
    const proposerId = rawProposer && typeof rawProposer === 'object'
      ? String(rawProposer._id || rawProposer.id || '')
      : String(rawProposer || '');
    const proposerName = rawProposer && typeof rawProposer === 'object'
      ? `${rawProposer.firstName || ''} ${rawProposer.lastName || ''}`.trim() || rawProposer.username || 'สมาชิกทีม'
      : 'สมาชิกทีม';

    return {
      id: String(i._id || i.id || Date.now()),
      title: i.title || 'ไม่มีชื่อหัวข้อ',
      desc: i.description || 'ไม่มีคำอธิบายเพิ่มเติม',
      platform: i.platform || 'YouTube',
      category: i.category || 'General',
      proposer: proposerName,
      proposerId,
      status: i.status || 'DRAFT',
      upvotes: Number(i.upvotes || 0),
    };
  }, []);

  const fetchIdeas = useCallback(async () => {
    try {
      const res = await ideaApi.getAll();
      const list = Array.isArray(res) ? res : (res?.ideas || []);
      if (Array.isArray(list)) {
        setIdeas(list.map(mapIdeaRecord));
      }
    } catch (e) {
      console.warn('fetchIdeas error:', e.message);
      setIdeas([]);
    } finally {
      setLoading(false);
    }
  }, [mapIdeaRecord]);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchIdeas();
    setRefreshing(false);
  };

  const canDeleteIdea = (item) => {
    if (isManagerOrAdmin) return true;
    if (currentUserId && item.proposerId && String(item.proposerId) === currentUserId) {
      return true;
    }
    return false;
  };

  const handleCreateIdea = async () => {
    if (!title.trim()) {
      Alert.alert('แจ้งเตือน', 'กรุณาระบุชื่อหัวข้อไอเดีย');
      return;
    }

    setSubmitting(true);
    try {
      const res = await ideaApi.create({
        title: title.trim(),
        description: desc.trim() || 'ไม่มีคำอธิบายเพิ่มเติม',
        platform,
        category,
      });
      const created = res?.idea ? mapIdeaRecord(res.idea) : {
        id: String(Date.now()),
        title: title.trim(),
        desc: desc.trim() || 'ไม่มีคำอธิบายเพิ่มเติม',
        platform,
        category,
        proposer: user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'คุณ',
        proposerId: currentUserId,
        status: 'DRAFT',
        upvotes: 0,
      };
      setIdeas((prev) => [created, ...prev]);
      setIsModalOpen(false);
      setTitle('');
      setDesc('');
    } catch (e) {
      Alert.alert('ข้อผิดพลาด', e.message || 'ไม่สามารถสร้างไอเดียได้');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvote = async (id) => {
    setIdeas((prev) =>
      prev.map((item) => (item.id === id ? { ...item, upvotes: item.upvotes + 1 } : item))
    );
    try {
      await ideaApi.upvote(id);
    } catch (e) {
      console.warn('upvote error:', e.message);
    }
  };

  const handleApproveIdea = async (item) => {
    try {
      await ideaApi.updateStatus(item.id, 'APPROVED');
      setIdeas((prev) =>
        prev.map((idea) => (idea.id === item.id ? { ...idea, status: 'APPROVED' } : idea))
      );
    } catch (e) {
      Alert.alert('ข้อผิดพลาด', e.message || 'ไม่สามารถอนุมัติไอเดียได้');
    }
  };

  const handleDeleteIdea = (item) => {
    if (!canDeleteIdea(item)) {
      Alert.alert('ไม่มีสิทธิ์', 'เฉพาะ Admin, Manager หรือสมาชิกผู้เปิดหัวข้อเท่านั้นที่สามารถลบได้');
      return;
    }

    Alert.alert(
      'ยืนยันการลบไอเดีย',
      `ต้องการลบหัวข้อ "${item.title}" ออกจากคลังไอเดียใช่หรือไม่?`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ลบหัวข้อ',
          style: 'destructive',
          onPress: async () => {
            try {
              await ideaApi.delete(item.id);
              setIdeas((prev) => prev.filter((i) => i.id !== item.id));
            } catch (e) {
              Alert.alert('ไม่สามารถลบได้', e.message || 'เกิดข้อผิดพลาดในการลบไอเดีย');
            }
          },
        },
      ]
    );
  };

  const draftCount = ideas.filter((i) => i.status === 'DRAFT').length;
  const approvedCount = ideas.filter((i) => i.status === 'APPROVED').length;

  const filteredIdeas = ideas.filter((item) => {
    if (filter === 'ALL') return true;
    return item.status === filter;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Clean Balanced Top Bar */}
      <View style={[styles.topBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerTextWrap}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            คลังไอเดีย (Idea Brainstorming)
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            ระดมไอเดียและคัดกรองเข้าสายพานการผลิตของทีม
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => setIsModalOpen(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.addBtnText}>+ เสนอไอเดีย</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Filter Tabs with Counts */}
        <View style={styles.filterRow}>
          {[
            { id: 'ALL', label: `ทั้งหมด (${ideas.length})` },
            { id: 'DRAFT', label: `รอพิจารณา (${draftCount})` },
            { id: 'APPROVED', label: `ผ่านเกณฑ์ (${approvedCount})` },
          ].map((tab) => {
            const isActive = filter === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.filterPill,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  isActive && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
                onPress={() => setFilter(tab.id)}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    { color: colors.textSecondary },
                    isActive && { color: '#FFFFFF', fontWeight: '700' },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Ideas Cards */}
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              กำลังโหลดคลังไอเดียจากระบบ...
            </Text>
          </View>
        ) : filteredIdeas.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              ยังไม่มีไอเดียในหมวดหมู่นี้
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              กดปุ่ม "+ เสนอไอเดีย" ด้านบนเพื่อเปิดหัวข้อคอนเทนต์ใหม่ให้ทีมร่วมโหวต
            </Text>
          </View>
        ) : (
          filteredIdeas.map((item) => {
            const isOwner = Boolean(currentUserId && item.proposerId && String(item.proposerId) === currentUserId);
            const allowDelete = canDeleteIdea(item);
            const isApproved = item.status === 'APPROVED';

            return (
              <View
                key={item.id}
                style={[
                  styles.ideaCard,
                  { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
                ]}
              >
                {/* Top Badges & Status */}
                <View style={styles.cardHeaderRow}>
                  <View style={styles.badgeRow}>
                    <View
                      style={[
                        styles.platformPill,
                        { backgroundColor: isDark ? '#312E81' : '#EEF2FF' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.platformPillText,
                          { color: isDark ? '#C7D2FE' : '#4338CA' },
                        ]}
                      >
                        {item.platform}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.categoryPill,
                        { backgroundColor: colors.surfaceSubtle },
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryPillText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {item.category}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: isApproved
                          ? colors.statusApprovedBg
                          : colors.statusReviewBg,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        {
                          color: isApproved
                            ? colors.statusApprovedText
                            : colors.statusReviewText,
                        },
                      ]}
                    >
                      {isApproved ? 'ผ่านเกณฑ์' : 'รอพิจารณา'}
                    </Text>
                  </View>
                </View>

                {/* Title & Description */}
                <Text style={[styles.ideaTitle, { color: colors.textPrimary }]}>{item.title}</Text>
                <Text style={[styles.ideaDesc, { color: colors.textSecondary }]}>{item.desc}</Text>

                {/* Footer: Proposer & Role-Gated Actions */}
                <View style={[styles.cardFooter, { borderTopColor: colors.divider }]}>
                  <View style={styles.proposerRow}>
                    <Text style={[styles.proposerText, { color: colors.textSecondary }]}>
                      ผู้เปิดหัวข้อ: <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{item.proposer}</Text>
                      {isOwner ? ' (คุณ)' : ''}
                    </Text>
                  </View>

                  <View style={styles.actionGroup}>
                    {/* Manager / Admin Approve Button for DRAFT ideas */}
                    {isManagerOrAdmin && item.status === 'DRAFT' && (
                      <TouchableOpacity
                        style={[
                          styles.approveBtn,
                          {
                            backgroundColor: colors.statusApprovedBg,
                            borderColor: colors.statusApprovedBorder,
                          },
                        ]}
                        onPress={() => handleApproveIdea(item)}
                        activeOpacity={0.75}
                      >
                        <Text style={[styles.approveBtnText, { color: colors.statusApprovedText }]}>
                          อนุมัติ
                        </Text>
                      </TouchableOpacity>
                    )}

                    {/* Upvote Button */}
                    <TouchableOpacity
                      style={[
                        styles.upvoteBtn,
                        {
                          backgroundColor: isDark ? '#331B0B' : '#FFF7ED',
                          borderColor: isDark ? '#7C2D12' : '#FFEDD5',
                        },
                      ]}
                      onPress={() => handleUpvote(item.id)}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[
                          styles.upvoteText,
                          { color: isDark ? '#FB923C' : '#C2410C' },
                        ]}
                      >
                        โหวต ({item.upvotes})
                      </Text>
                    </TouchableOpacity>

                    {/* Delete Button: Only visible for Admin, Manager, or Topic Proposer */}
                    {allowDelete && (
                      <TouchableOpacity
                        style={[
                          styles.deleteBtn,
                          {
                            backgroundColor: isDark ? '#450A0A' : '#FEF2F2',
                            borderColor: isDark ? '#7F1D1D' : '#FECACA',
                          },
                        ]}
                        onPress={() => handleDeleteIdea(item)}
                        activeOpacity={0.75}
                      >
                        <Text
                          style={[
                            styles.deleteBtnText,
                            { color: isDark ? '#FCA5A5' : '#DC2626' },
                          ]}
                        >
                          ลบ
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Propose Idea Modal */}
      <SmoothModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="นำเสนอหัวข้อไอเดียใหม่"
        subtitle="เปิดหัวข้อแนวคิดคอนเทนต์ใหม่เพื่อให้ทีมร่วมโหวตและคัดกรอง"
      >
        <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>ชื่อหัวข้อไอเดีย (Topic Title) *</Text>
        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: colors.inputBg,
              borderColor: colors.inputBorder,
              color: colors.textPrimary,
            },
          ]}
          placeholder="เช่น รีวิวไมโครโฟนไร้สายสำหรับ Creator..."
          placeholderTextColor={colors.textMuted}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>แพลตฟอร์มเป้าหมาย</Text>
        <View style={styles.platformSelectRow}>
          {PLATFORMS.map((p) => (
            <TouchableOpacity
              key={p}
              style={[
                styles.platOption,
                { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
                platform === p && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => setPlatform(p)}
            >
              <Text
                style={[
                  styles.platOptionText,
                  { color: colors.textSecondary },
                  platform === p && { color: '#FFFFFF' },
                ]}
              >
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>หมวดหมู่คอนเทนต์</Text>
        <View style={styles.categorySelectRow}>
          {CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c}
              style={[
                styles.catOption,
                { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
                category === c && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => setCategory(c)}
            >
              <Text
                style={[
                  styles.catOptionText,
                  { color: colors.textSecondary },
                  category === c && { color: '#FFFFFF' },
                ]}
              >
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>คำอธิบายและแนวคิด (Concept & Hook)</Text>
        <TextInput
          style={[
            styles.textInput,
            styles.textArea,
            {
              backgroundColor: colors.inputBg,
              borderColor: colors.inputBorder,
              color: colors.textPrimary,
            },
          ]}
          placeholder="อธิบายจุดขาย และสิ่งที่ผู้ชมจะได้รับ..."
          placeholderTextColor={colors.textMuted}
          value={desc}
          onChangeText={setDesc}
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity
          style={[styles.submitIdeaBtn, { backgroundColor: colors.primary }]}
          onPress={handleCreateIdea}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitIdeaBtnText}>บันทึกและเปิดหัวข้อไอเดีย</Text>
          )}
        </TouchableOpacity>
      </SmoothModal>
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
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTextWrap: {
    flex: 1,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  centerBox: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 13,
  },
  emptyCard: {
    padding: 28,
    alignItems: 'center',
    borderRadius: 14,
    marginTop: 8,
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
  ideaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  platformPill: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  platformPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4338CA',
  },
  categoryPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryPillText: {
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
    fontSize: 10,
    fontWeight: '700',
  },
  ideaTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  ideaDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
    flexWrap: 'wrap',
    gap: 8,
  },
  proposerRow: {
    flex: 1,
    minWidth: 120,
  },
  proposerText: {
    fontSize: 12,
    color: '#64748B',
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  approveBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  approveBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  upvoteBtn: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  upvoteText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C2410C',
  },
  deleteBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  deleteBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
    marginTop: 8,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  textArea: {
    height: 76,
    textAlignVertical: 'top',
  },
  platformSelectRow: {
    flexDirection: 'row',
    gap: 8,
  },
  platOption: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  platOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  categorySelectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  catOption: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  catOptionText: {
    fontSize: 11,
    fontWeight: '600',
  },
  submitIdeaBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 14,
  },
  submitIdeaBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
