import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Modal,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ideaApi } from '../../services/api';

export default function IdeaListScreen({ onBack }) {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [platform, setPlatform] = useState('YouTube');
  const [category] = useState('Tech Review');

  const fetchIdeas = async () => {
    try {
      const res = await ideaApi.getAll();
      const list = Array.isArray(res) ? res : (res?.ideas || []);
      if (Array.isArray(list)) {
        const mapped = list.map((i) => ({
          id: i._id || String(Date.now()),
          title: i.title,
          desc: i.description || 'ไม่มีคำอธิบาย',
          platform: i.platform || 'YouTube',
          category: i.category || 'General',
          proposer: i.proposedBy ? `${i.proposedBy.firstName || ''} ${i.proposedBy.lastName || ''}`.trim() || i.proposedBy.username : 'สมาชิกทีม',
          status: i.status || 'DRAFT',
          upvotes: i.upvotes || 0,
        }));
        setIdeas(mapped);
      }
    } catch (e) {
      console.warn('fetchIdeas error:', e.message);
      setIdeas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIdeas();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchIdeas();
    setRefreshing(false);
  };

  const handleCreateIdea = async () => {
    if (!title.trim()) {
      Alert.alert('แจ้งเตือน', 'กรุณาระบุชื่อไอเดีย');
      return;
    }

    const newIdea = {
      id: String(Date.now()),
      title: title.trim(),
      desc: desc.trim() || 'ไม่มีคำอธิบายเพิ่มเติม',
      platform,
      category,
      proposer: 'ผู้ใช้งานปัจจุบัน (You)',
      status: 'DRAFT',
      upvotes: 1,
    };

    setIdeas([newIdea, ...ideas]);
    setIsModalOpen(false);
    setTitle('');
    setDesc('');

    try {
      await ideaApi.create({
        title: newIdea.title,
        description: newIdea.desc,
        category: newIdea.category,
      });
    } catch (e) {
      console.warn('Saved idea locally');
    }

    Alert.alert('สำเร็จ', 'ไอเดียของคุณถูกบันทึกเข้าสู่กระดาน Brainstorming แล้ว');
  };

  const handleUpvote = (id) => {
    setIdeas(
      ideas.map((item) =>
        item.id === id ? { ...item, upvotes: item.upvotes + 1 } : item
      )
    );
  };

  const filteredIdeas = ideas.filter((item) => {
    if (filter === 'ALL') return true;
    return item.status === filter;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* App Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← กลับ</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>คลังไอเดีย (Idea Brainstorming)</Text>
          <Text style={styles.headerSubtitle}>ระดมไอเดียและคัดกรองเข้าสายพานผลิต</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setIsModalOpen(true)}
        >
          <Text style={styles.addBtnText}>+ เสนอ</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Filter Tabs */}
        <View style={styles.filterRow}>
          {[
            { id: 'ALL', label: 'ทั้งหมด' },
            { id: 'DRAFT', label: 'รอพิจารณา (Draft)' },
            { id: 'APPROVED', label: 'ผ่านเกณฑ์ (Approved)' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.filterPill, filter === tab.id && styles.filterPillActive]}
              onPress={() => setFilter(tab.id)}
            >
              <Text
                style={[
                  styles.filterPillText,
                  filter === tab.id && styles.filterPillTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Ideas Cards */}
        {loading ? (
          <View style={{ padding: 32, alignItems: 'center' }}>
            <ActivityIndicator size="small" color="#0F172A" />
            <Text style={{ marginTop: 8, fontSize: 13, color: '#64748B' }}>
              กำลังโหลดไอเดียคอนเทนต์จาก MongoDB...
            </Text>
          </View>
        ) : filteredIdeas.length === 0 ? (
          <View style={{ padding: 32, alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, marginTop: 12, borderWidth: 1, borderColor: '#E2E8F0' }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#0F172A', textAlign: 'center' }}>
              ยังไม่มีไอเดียในหมวดหมู่นี้
            </Text>
            <Text style={{ fontSize: 12, color: '#64748B', marginTop: 4, textAlign: 'center' }}>
              กดปุ่ม "+ เสนอไอเดียใหม่" ด้านบนเพื่อเริ่มเสนอไอเดียเข้าสู่คลังของทีม
            </Text>
          </View>
        ) : (
          filteredIdeas.map((item) => (
            <View key={item.id} style={styles.ideaCard}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.badgeRow}>
                  <View style={styles.platformPill}>
                    <Text style={styles.platformPillText}>{item.platform}</Text>
                  </View>
                  <View style={styles.categoryPill}>
                    <Text style={styles.categoryPillText}>{item.category}</Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    item.status === 'APPROVED' ? styles.statusApproved : styles.statusDraft,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      item.status === 'APPROVED' ? styles.statusTextApproved : styles.statusTextDraft,
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>

              <Text style={styles.ideaTitle}>{item.title}</Text>
              <Text style={styles.ideaDesc}>{item.desc}</Text>

              <View style={styles.cardFooter}>
                <Text style={styles.proposerText}>โดย: {item.proposer}</Text>

                <TouchableOpacity
                  style={styles.upvoteBtn}
                  onPress={() => handleUpvote(item.id)}
                >
                  <Text style={styles.upvoteText}>🔥 {item.upvotes} Upvotes</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Propose Idea Modal */}
      <Modal visible={isModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>✨ นำเสนอไอเดียใหม่</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>ชื่อไอเดีย (Title)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="เช่น รีวิวไมโครโฟนไร้สายสำหรับ Creator..."
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.inputLabel}>แพลตฟอร์มเป้าหมาย</Text>
            <View style={styles.platformSelectRow}>
              {['YouTube', 'TikTok', 'Instagram'].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.platOption,
                    platform === p && styles.platOptionActive,
                  ]}
                  onPress={() => setPlatform(p)}
                >
                  <Text
                    style={[
                      styles.platOptionText,
                      platform === p && styles.platOptionTextActive,
                    ]}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>คำอธิบายและแนวคิด (Concept & Hook)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="อธิบายจุดขาย และสิ่งที่ผู้ชมจะได้รับ..."
              value={desc}
              onChangeText={setDesc}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity style={styles.submitIdeaBtn} onPress={handleCreateIdea}>
              <Text style={styles.submitIdeaBtnText}>ส่งข้อเสนอไอเดีย (Submit)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  backText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
  },
  addBtn: {
    backgroundColor: '#4F46E5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterPillActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  ideaCard: {
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
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  platformPill: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  platformPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4338CA',
  },
  categoryPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryPillText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusApproved: {
    backgroundColor: '#DCFCE7',
  },
  statusDraft: {
    backgroundColor: '#FEF3C7',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusTextApproved: {
    color: '#15803D',
  },
  statusTextDraft: {
    color: '#B45309',
  },
  ideaTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  ideaDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  proposerText: {
    fontSize: 11,
    color: '#64748B',
  },
  upvoteBtn: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  upvoteText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C2410C',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalCloseText: {
    fontSize: 20,
    color: '#94A3B8',
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    marginBottom: 12,
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  platformSelectRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  platOption: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  platOptionActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  platOptionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  platOptionTextActive: {
    color: '#FFFFFF',
  },
  submitIdeaBtn: {
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  submitIdeaBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
