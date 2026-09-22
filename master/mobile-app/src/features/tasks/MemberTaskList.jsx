import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { taskApi } from '../../services/api';
import { useTheme } from '../../theme/ThemeContext';

export default function MemberTaskList({ user, onLogout, onNavigate }) {
  const { isDark, colors } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submissionInputs, setSubmissionInputs] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await taskApi.getAll();
      const list = Array.isArray(res) ? res : (res?.tasks || []);
      if (Array.isArray(list)) {
        const currentUserId = user?.id || user?.userId;
        const mapped = list.map((t) => ({
          id: t._id || String(Date.now()),
          title: t.title,
          contentTitle: t.contentId?.title || 'ชิ้นงานคอนเทนต์หลัก',
          platform: t.contentId?.platform || 'YouTube',
          status: t.status || 'TODO',
          dueDate: t.dueDate ? t.dueDate.split('T')[0] : 'เร็วๆ นี้',
          type: t.taskType || 'Production',
          submissionUrl: t.submissionUrl || '',
          assignedToId: t.assignedTo?._id || t.assignedTo,
        }));
        
        // Filter to show tasks assigned to this member
        const myTasks = currentUserId
          ? mapped.filter((t) => t.assignedToId && t.assignedToId.toString() === currentUserId.toString())
          : mapped;

        setTasks(myTasks);
      }
    } catch (err) {
      console.warn('fetchTasks error:', err.message);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  };

  const handleStartTask = async (taskId) => {
    setTasks(
      tasks.map((t) => (t.id === taskId ? { ...t, status: 'IN_PROGRESS' } : t))
    );
    try {
      await taskApi.updateStatus(taskId, 'IN_PROGRESS');
    } catch (e) {
      console.warn('Updated task locally');
    }
  };

  const handleSubmitTask = async (taskId) => {
    const url = submissionInputs[taskId];
    if (!url || !url.trim()) {
      Alert.alert(
        'กรุณาแนบลิงก์ผลงาน',
        'โปรดระบุลิงก์ Google Drive, Frame.io หรือ Cloud Storage เพื่อให้ Manager ตรวจสอบ'
      );
      return;
    }

    setTasks(
      tasks.map((t) =>
        t.id === taskId ? { ...t, status: 'REVIEW', submissionUrl: url } : t
      )
    );

    try {
      await taskApi.submitDeliverable(taskId, url);
    } catch (e) {
      console.warn('Updated task locally');
    }

    Alert.alert(
      'ส่งงานสำเร็จ',
      'ผลงานถูกส่งเข้าสู่คิว Review ของ Manager บน Dashboard เรียบร้อยแล้ว'
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'IN_PROGRESS':
        return { bg: colors.statusReviewBg, text: colors.statusReviewText, label: 'กำลังทำ' };
      case 'TODO':
        return { bg: colors.statusProdBg, text: colors.statusProdText, label: 'คิวงานใหม่' };
      case 'REVIEW':
        return { bg: colors.statusReviewBg, text: colors.statusReviewText, label: 'รอตรวจ' };
      case 'DONE':
        return { bg: colors.statusApprovedBg, text: colors.statusApprovedText, label: 'เสร็จสิ้น' };
      default:
        return { bg: colors.surfaceSubtle, text: colors.textSecondary, label: status };
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header Bar */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.userName, { color: colors.textPrimary }]}>{user?.name || 'จอห์น'}</Text>
          <Text style={[styles.userSub, { color: colors.textSecondary }]}>ทีมงานฝ่ายผลิตสื่อ (Creator & Member)</Text>
        </View>

        <TouchableOpacity
          style={[styles.avatarButton, { backgroundColor: isDark ? colors.surfaceSubtle : '#0F172A' }]}
          onPress={() => onNavigate && onNavigate('profile')}
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
        {/* Creator KPI Bar */}
        <View style={styles.kpiRow}>
          <View style={[styles.kpiBox, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Text style={[styles.kpiNum, { color: '#B45309' }]}>
              {tasks.filter((t) => t.status === 'IN_PROGRESS').length}
            </Text>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>กำลังตัดต่อ/ทำ</Text>
          </View>
          <View style={[styles.kpiBox, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Text style={[styles.kpiNum, { color: isDark ? '#94A3B8' : '#475569' }]}>
              {tasks.filter((t) => t.status === 'TODO').length}
            </Text>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>คิวงานใหม่</Text>
          </View>
          <View style={[styles.kpiBox, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Text style={[styles.kpiNum, { color: isDark ? '#60A5FA' : '#1D4ED8' }]}>
              {tasks.filter((t) => t.status === 'REVIEW').length}
            </Text>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>รอ Manager ตรวจ</Text>
          </View>
        </View>

        {/* Section Header */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>งานที่ได้รับมอบหมาย</Text>
        <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
          อัปเดตสถานะและแนบลิงก์ส่งงานให้หัวหน้าทีมตรวจสอบ
        </Text>

        {/* Task Cards */}
        {loading ? (
          <View style={{ padding: 32, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={{ marginTop: 8, fontSize: 13, color: colors.textSecondary }}>
              กำลังโหลดงานของคุณจาก MongoDB...
            </Text>
          </View>
        ) : tasks.length === 0 ? (
          <View style={{ padding: 32, alignItems: 'center', backgroundColor: colors.cardBg, borderRadius: 12, marginTop: 12, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' }}>
              ไม่มีงานส่วนตัวที่ค้างอยู่
            </Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4, textAlign: 'center' }}>
              คุณสามารถดูงานทั้งหมดและกิจกรรมของเพื่อนร่วมทีมได้ที่แท็บ "ทีมของฉัน"
            </Text>
          </View>
        ) : (
          tasks.map((item) => {
            const st = getStatusColor(item.status);

            return (
              <View key={item.id} style={[styles.taskCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                {/* Task Header */}
                <View style={styles.taskCardTop}>
                  <View style={[styles.typeBadge, { backgroundColor: colors.surfaceSubtle }]}>
                    <Text style={[styles.typeBadgeText, { color: colors.textSecondary }]}>{item.type}</Text>
                  </View>

                  <View style={[styles.statusBadge, { backgroundColor: st.bg }]}>
                    <Text style={[styles.statusBadgeText, { color: st.text }]}>{st.label}</Text>
                  </View>
                </View>

                {/* Task Title & Parent Content */}
                <Text style={[styles.taskTitle, { color: colors.textPrimary }]}>{item.title}</Text>
                <View style={[styles.parentContentBox, { backgroundColor: colors.surfaceSubtle }]}>
                  <Text style={[styles.parentContentLabel, { color: colors.textSecondary }]}>ชิ้นงาน:</Text>
                  <Text style={[styles.parentContentTitle, { color: colors.textPrimary }]}>
                    {item.contentTitle} ({item.platform})
                  </Text>
                </View>

                <View style={styles.dueRow}>
                  <Text style={[styles.dueText, { color: colors.textSecondary }]}>กำหนดส่ง: {item.dueDate}</Text>
                </View>

                {/* Action Area based on status */}
                {item.status === 'TODO' && (
                  <TouchableOpacity
                    style={[styles.startBtn, { backgroundColor: isDark ? colors.primary : '#0F172A' }]}
                    onPress={() => handleStartTask(item.id)}
                  >
                    <Text style={styles.startBtnText}>เริ่มทำงาน</Text>
                  </TouchableOpacity>
                )}

                {item.status === 'IN_PROGRESS' && (
                  <View style={styles.submitSection}>
                    <View style={styles.linkPromptRow}>
                      <Text style={styles.linkIconText}>🔗</Text>
                      <Text style={[styles.inputPrompt, { color: colors.textSecondary }]}>แนบลิงก์ไฟล์งาน (Drive / Cloud URL):</Text>
                    </View>
                    <TextInput
                      style={[
                        styles.urlInput,
                        {
                          backgroundColor: colors.inputBg,
                          borderColor: colors.inputBorder,
                          color: colors.textPrimary,
                        },
                      ]}
                      placeholder="วางลิงก์ไฟล์ผลงานที่นี่..."
                      value={submissionInputs[item.id] || ''}
                      onChangeText={(val) =>
                        setSubmissionInputs({ ...submissionInputs, [item.id]: val })
                      }
                      autoCapitalize="none"
                      placeholderTextColor={colors.textMuted}
                    />
                    <TouchableOpacity
                      style={styles.submitBtn}
                      onPress={() => handleSubmitTask(item.id)}
                    >
                      <Text style={styles.submitBtnText}>ส่งมอบงานให้ตรวจสอบ</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {item.status === 'REVIEW' && (
                  <View style={styles.submittedBox}>
                    <Text style={styles.submittedText}>
                      ส่งงานเรียบร้อย • อยู่ในคิวรอการตรวจสอบ
                    </Text>
                    {item.submissionUrl ? (
                      <Text style={styles.submittedUrl} numberOfLines={1}>
                        🔗 {item.submissionUrl}
                      </Text>
                    ) : null}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  userSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
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
  kpiRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  kpiBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  kpiNum: {
    fontSize: 18,
    fontWeight: '800',
  },
  kpiLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 14,
  },
  taskCard: {
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
  taskCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
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
  taskTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  parentContentBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  parentContentLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  parentContentTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 1,
  },
  dueRow: {
    marginBottom: 10,
  },
  dueText: {
    fontSize: 11,
    color: '#E11D48',
    fontWeight: '600',
  },
  startBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  submitSection: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  linkPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  linkIconText: {
    fontSize: 13,
  },
  inputPrompt: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  urlInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0F172A',
    marginBottom: 8,
  },
  submitBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  submittedBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  submittedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16A34A',
  },
  submittedUrl: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
  },
});
