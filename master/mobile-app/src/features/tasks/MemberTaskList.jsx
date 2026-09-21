import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { taskApi } from '../../services/api';

export default function MemberTaskList({ user, onLogout, onNavigate }) {
  const [tasks, setTasks] = useState([
    {
      id: '1',
      title: 'ตัดต่อคลิปวิดีโอ (Highlight & Sound FX)',
      contentTitle: 'สรุปข่าว AI ภายใน 1 นาที',
      platform: 'TikTok',
      status: 'IN_PROGRESS',
      dueDate: 'วันนี้ 17:00',
      type: 'Video Editing',
      submissionUrl: '',
    },
    {
      id: '2',
      title: 'บันทึกเสียงพากย์บทนำ (Voiceover Intro)',
      contentTitle: 'รีวิวแก็ดเจ็ตสมาร์ตโฮม 2026',
      platform: 'YouTube',
      status: 'TODO',
      dueDate: 'พรุ่งนี้ 12:00',
      type: 'Audio Recording',
      submissionUrl: '',
    },
    {
      id: '3',
      title: 'ออกแบบปก Thumbnail สไตล์มินิมอล',
      contentTitle: 'Vlog เบื้องหลังกองถ่ายทำ',
      platform: 'Instagram',
      status: 'REVIEW',
      dueDate: '25 ก.ย. 18:00',
      type: 'Graphic Design',
      submissionUrl: 'https://drive.google.com/file/d/thumbnail_v1.png',
    },
  ]);

  const [submissionInputs, setSubmissionInputs] = useState({});

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await taskApi.getAll();
        if (Array.isArray(res) && res.length > 0) {
          const mapped = res.map((t) => ({
            id: t._id || String(Date.now()),
            title: t.title,
            contentTitle: t.contentId?.title || 'ชิ้นงานคอนเทนต์หลัก',
            platform: t.contentId?.platform || 'YouTube',
            status: t.status || 'TODO',
            dueDate: t.dueDate ? t.dueDate.split('T')[0] : 'เร็วๆ นี้',
            type: t.taskType || 'Production',
            submissionUrl: t.submissionUrl || '',
          }));
          setTasks(mapped);
        }
      } catch (err) {
        console.warn('Using fallback tasks:', err.message);
      }
    };

    fetchTasks();
  }, []);

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
      'ส่งงานสำเร็จ! 🚀',
      'ผลงานถูกส่งเข้าสู่คิว Review ของ Manager บน Dashboard เรียบร้อยแล้ว'
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'IN_PROGRESS':
        return { bg: '#FEF3C7', text: '#D97706', label: 'กำลังทำ' };
      case 'TODO':
        return { bg: '#F1F5F9', text: '#64748B', label: 'คิวงานใหม่' };
      case 'REVIEW':
        return { bg: '#FEF3C7', text: '#D97706', label: 'รอตรวจ' };
      case 'DONE':
        return { bg: '#DCFCE7', text: '#16A34A', label: 'เสร็จสิ้น' };
      default:
        return { bg: '#F1F5F9', text: '#64748B', label: status };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header Bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.userName}>{user?.name || 'จอห์น'}</Text>
          <Text style={styles.userSub}>ทีมงานฝ่ายผลิตสื่อ (Creator & Member)</Text>
        </View>

        <TouchableOpacity
          style={styles.avatarButton}
          onPress={() => onNavigate && onNavigate('profile')}
        >
          <Text style={styles.avatarButtonText}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'M'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Creator KPI Bar */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiBox}>
            <Text style={[styles.kpiNum, { color: '#B45309' }]}>
              {tasks.filter((t) => t.status === 'IN_PROGRESS').length}
            </Text>
            <Text style={styles.kpiLabel}>กำลังตัดต่อ/ทำ</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={[styles.kpiNum, { color: '#475569' }]}>
              {tasks.filter((t) => t.status === 'TODO').length}
            </Text>
            <Text style={styles.kpiLabel}>คิวงานใหม่</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={[styles.kpiNum, { color: '#1D4ED8' }]}>
              {tasks.filter((t) => t.status === 'REVIEW').length}
            </Text>
            <Text style={styles.kpiLabel}>รอ Manager ตรวจ</Text>
          </View>
        </View>

        {/* Section Header */}
        <Text style={styles.sectionTitle}>📋 งานที่ได้รับมอบหมาย (Assigned Tasks)</Text>
        <Text style={styles.sectionSubtitle}>
          อัปเดตสถานะและแนบลิงก์ส่งงานให้ Manager ตรวจสอบ
        </Text>

        {/* Task Cards */}
        {tasks.map((item) => {
          const st = getStatusColor(item.status);

          return (
            <View key={item.id} style={styles.taskCard}>
              {/* Task Header */}
              <View style={styles.taskCardTop}>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>{item.type}</Text>
                </View>

                <View style={[styles.statusBadge, { backgroundColor: st.bg }]}>
                  <Text style={[styles.statusBadgeText, { color: st.text }]}>{st.label}</Text>
                </View>
              </View>

              {/* Task Title & Parent Content */}
              <Text style={styles.taskTitle}>{item.title}</Text>
              <View style={styles.parentContentBox}>
                <Text style={styles.parentContentLabel}>ชิ้นงานหลัก:</Text>
                <Text style={styles.parentContentTitle}>
                  🎬 {item.contentTitle} ({item.platform})
                </Text>
              </View>

              <View style={styles.dueRow}>
                <Text style={styles.dueText}>⏰ กำหนดส่ง: {item.dueDate}</Text>
              </View>

              {/* Action Area based on status */}
              {item.status === 'TODO' && (
                <TouchableOpacity
                  style={styles.startBtn}
                  onPress={() => handleStartTask(item.id)}
                >
                  <Text style={styles.startBtnText}>▶️ เริ่มทำงานนี้ (Start Task)</Text>
                </TouchableOpacity>
              )}

              {item.status === 'IN_PROGRESS' && (
                <View style={styles.submitSection}>
                  <Text style={styles.inputPrompt}>🔗 แนบลิงก์ผลงาน (Drive / Frame.io):</Text>
                  <TextInput
                    style={styles.urlInput}
                    placeholder="https://drive.google.com/file/d/..."
                    value={submissionInputs[item.id] || ''}
                    onChangeText={(val) =>
                      setSubmissionInputs({ ...submissionInputs, [item.id]: val })
                    }
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.submitBtn}
                    onPress={() => handleSubmitTask(item.id)}
                  >
                    <Text style={styles.submitBtnText}>🚀 ส่งตรวจงานให้ Manager (Submit)</Text>
                  </TouchableOpacity>
                </View>
              )}

              {item.status === 'REVIEW' && (
                <View style={styles.submittedBox}>
                  <Text style={styles.submittedText}>
                    ✅ ส่งงานเรียบร้อย: อยู่ในคิวรอ Manager กดอนุมัติ
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
    backgroundColor: '#4F46E5',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  submitSection: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  inputPrompt: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  urlInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 12,
    marginBottom: 8,
  },
  submitBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  submittedBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  submittedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  submittedUrl: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
});
