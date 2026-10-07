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
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { taskApi } from '../../services/api';
import { presenceService } from '../../services/presenceService';
import { useTheme } from '../../theme/ThemeContext';

export default function MemberTaskList({ user, onNavigate }) {
  const { colors, isDark } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [taskScope, setTaskScope] = useState('MY_TASKS'); // 'MY_TASKS' | 'TEAM_TASKS'
  const [loading, setLoading] = useState(true);
  const [submissionInputs, setSubmissionInputs] = useState({});
  const [replyInputs, setReplyInputs] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  const checkDeadline = (dueDateStr) => {
    if (!dueDateStr) return { isOverdue: false, isUrgent: false, label: 'ไม่ระบุ' };
    const due = new Date(dueDateStr);
    const now = new Date();
    if (isNaN(due.getTime())) return { isOverdue: false, isUrgent: false, label: dueDateStr };

    const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (diffHours < 0) {
      return { isOverdue: true, isUrgent: false, label: `${dueDateStr} (เกินกำหนด)` };
    } else if (diffHours <= 24) {
      return { isOverdue: false, isUrgent: true, label: `${dueDateStr} (ส่งภายใน 24 ชม.)` };
    }
    return { isOverdue: false, isUrgent: false, label: dueDateStr };
  };

  const fetchTasks = async () => {
    try {
      const res = await taskApi.getAll();
      const list = Array.isArray(res) ? res : (res?.tasks || []);
      if (Array.isArray(list)) {
        const currentUserId = user?.id || user?.userId;
        const mapped = list.map((t) => {
          const rawDate = t.dueDate ? t.dueDate.split('T')[0] : null;
          const dl = checkDeadline(rawDate);
          const assignedId = t.assignedTo?._id || t.assignedTo;
          const isMyTask = currentUserId
            ? (assignedId?.toString() === currentUserId.toString())
            : true;

          return {
            id: t._id || String(Date.now()),
            title: t.title,
            contentTitle: t.contentId?.title || 'ชิ้นงานคอนเทนต์หลัก',
            platform: t.contentId?.platform || 'YouTube',
            status: t.status || 'TODO',
            dueDate: dl.label,
            isOverdue: dl.isOverdue,
            isUrgent: dl.isUrgent,
            notes: t.notes || t.revisionNotes || '',
            type: t.taskType || 'Production',
            submissionUrl: t.submissionUrl || '',
            assignedToId: assignedId,
            assigneeName: t.assignedTo?.firstName
              ? `${t.assignedTo.firstName} ${t.assignedTo.lastName || ''}`.trim()
              : (t.assignedTo?.username || 'ยังไม่ได้มอบหมาย'),
            progress: t.progress || (t.status === 'DONE' ? 100 : t.status === 'REVIEW' ? 85 : t.status === 'IN_PROGRESS' ? 50 : 0),
            isMyTask,
          };
        });

        setTasks(mapped);
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

    const unsubscribe = presenceService.subscribe((event) => {
      if (['TASK_CREATED', 'TASK_UPDATED', 'TASK_DELETED', 'CONTENT_UPDATED'].includes(event.type)) {
        fetchTasks();
      }
    });

    return () => {
      unsubscribe();
    };
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

  const handleSubmitTask = async (taskId, isRevision = false) => {
    const url = (submissionInputs[taskId] || '').trim();
    const reply = (replyInputs[taskId] || '').trim();
    const targetTask = tasks.find((t) => t.id === taskId);

    if (isRevision) {
      if (!reply && !url && !targetTask?.submissionUrl) {
        Alert.alert(
          'กรุณาระบุข้อมูลการแก้ไข',
          'โปรดพิมพ์ข้อความตอบกลับสิ่งที่ได้แก้ไข หรือแนบลิงก์ไฟล์ผลงานใหม่'
        );
        return;
      }
    } else {
      if (!url && !targetTask?.submissionUrl) {
        Alert.alert(
          'กรุณาแนบลิงก์ผลงาน',
          'โปรดระบุลิงก์ Google Drive, Frame.io หรือ Cloud Storage เพื่อให้หัวหน้าทีมตรวจสอบ'
        );
        return;
      }
    }

    const finalUrl = url || targetTask?.submissionUrl || '';
    const finalNotes = reply ? `แก้ไขแล้ว: ${reply}` : targetTask?.notes || '';

    setTasks(
      tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: 'REVIEW',
              submissionUrl: finalUrl,
              notes: finalNotes,
              replyNotes: reply,
            }
          : t
      )
    );

    try {
      await taskApi.submitDeliverable(taskId, finalUrl, isRevision ? 90 : 85, reply);
    } catch (e) {
      console.warn('Updated task locally:', e.message);
    }

    Alert.alert(
      'ส่งงานสำเร็จ',
      isRevision
        ? 'ส่งงานที่แก้ไขแล้วพร้อมข้อความตอบกลับไปยังหัวหน้าทีมเรียบร้อยแล้ว'
        : 'ผลงานถูกส่งเข้าสู่คิวการตรวจสอบของหัวหน้าทีมเรียบร้อยแล้ว'
    );
  };

  const getStatusColor = (status, isOverdue) => {
    if (isOverdue && status !== 'DONE' && status !== 'REVIEW') {
      return {
        bg: colors.statusUrgentBg,
        text: colors.statusUrgentText,
        border: colors.statusUrgentBorder,
        label: 'เกินกำหนด',
      };
    }
    switch (status) {
      case 'IN_PROGRESS':
        return {
          bg: colors.statusInProgressBg,
          text: colors.statusInProgressText,
          border: colors.statusInProgressBorder,
          label: 'กำลังดำเนินการ',
        };
      case 'TODO':
        return {
          bg: colors.statusTodoBg,
          text: colors.statusTodoText,
          border: colors.statusTodoBorder,
          label: 'รอดำเนินการ',
        };
      case 'REVIEW':
        return {
          bg: colors.statusReviewBg,
          text: colors.statusReviewText,
          border: colors.statusReviewBorder,
          label: 'รอตรวจสอบ',
        };
      case 'REVISION':
        return {
          bg: colors.statusRevisionBg,
          text: colors.statusRevisionText,
          border: colors.statusRevisionBorder,
          label: 'ต้องแก้ไข',
        };
      case 'DONE':
        return {
          bg: colors.statusApprovedBg,
          text: colors.statusApprovedText,
          border: colors.statusApprovedBorder,
          label: 'เสร็จสมบูรณ์',
        };
      default:
        return {
          bg: colors.surfaceSubtle,
          text: colors.textSecondary,
          border: colors.border,
          label: status,
        };
    }
  };

  // Visual Hierarchy: Filtered by active scope (My Tasks vs Team Tasks)
  const displayedTasks = taskScope === 'MY_TASKS'
    ? tasks.filter((t) => t.isMyTask)
    : tasks;
  const urgentTasks = displayedTasks.filter((t) => t.status === 'REVISION' || t.isOverdue || t.isUrgent);
  const generalTasks = displayedTasks.filter((t) => !(t.status === 'REVISION' || t.isOverdue || t.isUrgent));

  const renderTaskCard = (item, isActionRequiredSection = false) => {
    const st = getStatusColor(item.status, item.isOverdue);

    return (
      <View
        key={item.id}
        style={[
          styles.taskCard,
          {
            backgroundColor: colors.cardBg,
            borderColor: isActionRequiredSection && item.status === 'REVISION'
              ? colors.statusRevisionBorder
              : isActionRequiredSection && item.isOverdue
              ? colors.statusUrgentBorder
              : colors.cardBorder,
          },
        ]}
      >
        {/* Task Header: Type & Status Pill */}
        <View style={styles.taskCardTop}>
          <View style={[styles.typeBadge, { backgroundColor: colors.surfaceSubtle }]}>
            <Text style={[styles.typeBadgeText, { color: colors.textSecondary }]}>{item.type}</Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: st.bg, borderColor: st.border }]}>
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

        {/* Assignee & Ownership Tag */}
        <View style={styles.assigneeRow}>
          <Text style={[styles.assigneeText, { color: colors.textSecondary }]}>
            ผู้รับผิดชอบ: <Text style={{ fontWeight: '700', color: colors.textPrimary }}>{item.assigneeName}</Text>
          </Text>
          {item.isMyTask ? (
            <View style={[styles.myTaskTag, { backgroundColor: colors.statusInProgressBg, borderColor: colors.statusInProgressBorder }]}>
              <Text style={[styles.myTaskTagText, { color: colors.statusInProgressText }]}>งานของคุณ</Text>
            </View>
          ) : (
            <View style={[styles.otherTaskTag, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}>
              <Text style={[styles.otherTaskTagText, { color: colors.textSecondary }]}>งานเพื่อนร่วมทีม</Text>
            </View>
          )}
        </View>

        {/* Progress Bar for Individual Task */}
        <View style={styles.progressRow}>
          <View style={[styles.progressBarBg, { backgroundColor: colors.surfaceSubtle }]}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${item.progress || 0}%`,
                  backgroundColor: st.text,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>{item.progress || 0}%</Text>
        </View>

        {/* Revision Feedback Callout (Priority 2) */}
        {item.status === 'REVISION' && (
          <View
            style={[
              styles.feedbackBox,
              {
                backgroundColor: colors.statusRevisionBg,
                borderColor: colors.statusRevisionBorder,
              },
            ]}
          >
            <Text style={[styles.feedbackTitle, { color: colors.statusRevisionText }]}>
              ข้อคิดเห็นที่ต้องแก้ไขจากหัวหน้าทีม:
            </Text>
            <Text style={[styles.feedbackText, { color: colors.textPrimary }]}>
              {item.notes || 'กรุณาตรวจสอบรายละเอียดและแก้ไขไฟล์งานตามฟีดแบ็กที่ได้รับ'}
            </Text>
          </View>
        )}

        {/* Deadline Notice */}
        <View style={styles.dueRow}>
          <Text
            style={[
              styles.dueText,
              {
                color: item.isOverdue
                  ? colors.statusUrgentText
                  : item.isUrgent
                  ? colors.statusRevisionText
                  : colors.textSecondary,
              },
            ]}
          >
            กำหนดส่ง: {item.dueDate}
          </Text>
        </View>

        {/* Action Area (Only editable if task is assigned to current user) */}
        {!item.isMyTask ? (
          <View style={[styles.otherMemberNoteBox, { backgroundColor: colors.surfaceSubtle }]}>
            <Text style={[styles.otherMemberNoteText, { color: colors.textSecondary }]}>
              มอบหมายให้ {item.assigneeName} • คุณสามารถติดตามความคืบหน้าได้ แต่ไม่สามารถแก้ไขงานของผู้อื่นได้
            </Text>
          </View>
        ) : (
          <>
            {item.status === 'TODO' && (
              <TouchableOpacity
                style={[styles.startBtn, { backgroundColor: colors.primary }]}
                onPress={() => handleStartTask(item.id)}
              >
                <Text style={styles.startBtnText}>เริ่มทำงาน</Text>
              </TouchableOpacity>
            )}

            {item.status === 'REVISION' && (
              <View style={[styles.submitSection, { borderTopColor: colors.border }]}>
                <View style={styles.replyBoxWrapper}>
                  <Text style={[styles.inputPrompt, { color: colors.statusRevisionText, fontWeight: '700' }]}>
                    ข้อความตอบกลับสำหรับการแก้ไขงาน:
                  </Text>
                  <TextInput
                    style={[
                      styles.replyInput,
                      {
                        backgroundColor: colors.inputBg,
                        borderColor: colors.statusRevisionBorder,
                        color: colors.textPrimary,
                      },
                    ]}
                    placeholder="ระบุสิ่งที่ได้ปรับปรุงแก้ไขตามคำแนะนำ เช่น ปรับระดับเสียงแล้ว..."
                    placeholderTextColor={colors.textMuted}
                    value={replyInputs[item.id] || ''}
                    onChangeText={(val) =>
                      setReplyInputs({ ...replyInputs, [item.id]: val })
                    }
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <Text style={[styles.inputPrompt, { color: colors.textSecondary, marginTop: 8 }]}>
                  แนบลิงก์ไฟล์ผลงานใหม่ (ถ้ามี):
                </Text>
                <TextInput
                  style={[
                    styles.urlInput,
                    {
                      backgroundColor: colors.inputBg,
                      borderColor: colors.inputBorder,
                      color: colors.textPrimary,
                    },
                  ]}
                  placeholder="วางลิงก์ไฟล์ผลงานที่แก้ไขแล้ว..."
                  value={submissionInputs[item.id] !== undefined ? submissionInputs[item.id] : (item.submissionUrl || '')}
                  onChangeText={(val) =>
                    setSubmissionInputs({ ...submissionInputs, [item.id]: val })
                  }
                  autoCapitalize="none"
                  placeholderTextColor={colors.textMuted}
                />

                <TouchableOpacity
                  style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                  onPress={() => handleSubmitTask(item.id, true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.submitBtnText}>ส่งงานที่แก้ไขแล้ว</Text>
                </TouchableOpacity>
              </View>
            )}

            {item.status === 'IN_PROGRESS' && (
              <View style={[styles.submitSection, { borderTopColor: colors.border }]}>
                <Text style={[styles.inputPrompt, { color: colors.textSecondary }]}>
                  แนบลิงก์ไฟล์ผลงาน (Drive / Cloud Storage):
                </Text>
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
                  style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                  onPress={() => handleSubmitTask(item.id, false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.submitBtnText}>ส่งมอบงานให้ตรวจสอบ</Text>
                </TouchableOpacity>
              </View>
            )}

            {item.status === 'REVIEW' && (
              <View style={[styles.submittedBox, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}>
                <Text style={[styles.submittedText, { color: colors.statusReviewText }]}>
                  ส่งงานเรียบร้อย • อยู่ในคิวรอการตรวจสอบ
                </Text>
                {item.submissionUrl ? (
                  <TouchableOpacity
                    onPress={() => Linking.openURL(item.submissionUrl).catch(() => Alert.alert('ลิงก์ผลงาน', item.submissionUrl))}
                    style={{ marginTop: 6 }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.submittedUrl, { color: colors.primary, textDecorationLine: 'underline' }]} numberOfLines={1}>
                      เปิดดูผลงาน: {item.submissionUrl}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            )}
          </>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top Header Bar */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.userName, { color: colors.textPrimary }]}>{user?.name || 'จอห์น'}</Text>
          <Text style={[styles.userSub, { color: colors.textSecondary }]}>ทีมงานฝ่ายผลิตสื่อ (Creator & Member)</Text>
        </View>

        <TouchableOpacity
          style={[styles.avatarButton, { backgroundColor: colors.primary }]}
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
        {/* Creator KPI Metrics Bar */}
        <View style={styles.kpiRow}>
          <View style={[styles.kpiBox, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Text style={[styles.kpiNum, { color: colors.primary }]}>
              {tasks.filter((t) => t.status === 'IN_PROGRESS').length}
            </Text>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>กำลังดำเนินงาน</Text>
          </View>
          <View style={[styles.kpiBox, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Text style={[styles.kpiNum, { color: colors.statusReviewText }]}>
              {tasks.filter((t) => t.status === 'REVIEW').length}
            </Text>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>รอตรวจทาน</Text>
          </View>
          <View style={[styles.kpiBox, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Text style={[styles.kpiNum, { color: colors.statusRevisionText }]}>
              {tasks.filter((t) => t.status === 'REVISION').length}
            </Text>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>ต้องแก้ไข</Text>
          </View>
          <View style={[styles.kpiBox, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Text style={[styles.kpiNum, { color: colors.statusApprovedText }]}>
              {tasks.filter((t) => t.status === 'DONE').length}
            </Text>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>เสร็จสิ้น</Text>
          </View>
        </View>

        {/* Scope Switcher: My Tasks vs Team Tasks */}
        <View style={[styles.scopeBar, { backgroundColor: isDark ? colors.surface : '#E2E8F0' }]}>
          <TouchableOpacity
            style={[
              styles.scopeBtn,
              taskScope === 'MY_TASKS' && [styles.scopeBtnActive, { backgroundColor: colors.cardBg }],
            ]}
            onPress={() => setTaskScope('MY_TASKS')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.scopeBtnText,
                { color: colors.textSecondary },
                taskScope === 'MY_TASKS' && { color: colors.textPrimary, fontWeight: '700' },
              ]}
            >
              งานของฉัน ({tasks.filter((t) => t.isMyTask).length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.scopeBtn,
              taskScope === 'TEAM_TASKS' && [styles.scopeBtnActive, { backgroundColor: colors.cardBg }],
            ]}
            onPress={() => setTaskScope('TEAM_TASKS')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.scopeBtnText,
                { color: colors.textSecondary },
                taskScope === 'TEAM_TASKS' && { color: colors.textPrimary, fontWeight: '700' },
              ]}
            >
              งานในทีมทั้งหมด ({tasks.length})
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.centerLoadingText, { color: colors.textSecondary }]}>
              กำลังโหลดงานจากระบบ...
            </Text>
          </View>
        ) : displayedTasks.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              {taskScope === 'MY_TASKS' ? 'คุณไม่มีงานที่ต้องรับผิดชอบขณะนี้' : 'ยังไม่มีงานในทีมขณะนี้'}
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              {taskScope === 'MY_TASKS'
                ? 'เลือกแท็บ "งานในทีมทั้งหมด" เพื่อติดตามความคืบหน้าของเพื่อนร่วมทีม'
                : 'งานใหม่จะปรากฏที่นี่เมื่อหัวหน้าทีมมอบหมายงาน'}
            </Text>
          </View>
        ) : (
          <>
            {/* Visual Hierarchy: Priority 1 - Action Required Section */}
            {urgentTasks.length > 0 && (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={[styles.sectionTitlePriority, { color: colors.statusRevisionText }]}>
                    งานที่ต้องดำเนินการ (Action Required)
                  </Text>
                  <View style={[styles.urgentBadge, { backgroundColor: colors.statusRevisionBg }]}>
                    <Text style={[styles.urgentBadgeText, { color: colors.statusRevisionText }]}>
                      {urgentTasks.length} งาน
                    </Text>
                  </View>
                </View>
                <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                  งานที่ต้องแก้ไข หรือใกล้ครบกำหนดส่งมอบ
                </Text>
                {urgentTasks.map((t) => renderTaskCard(t, true))}
              </View>
            )}

            {/* General Tasks Section */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                {urgentTasks.length > 0 ? 'งานอื่นๆ ที่ได้รับมอบหมาย' : 'งานที่ได้รับมอบหมาย'} ({generalTasks.length})
              </Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                อัปเดตสถานะและส่งมอบไฟล์งานเพื่อการตรวจสอบ
              </Text>
              {generalTasks.length === 0 ? (
                <Text style={[styles.allClearText, { color: colors.textSecondary }]}>
                  ไม่มีงานอื่นเพิ่มเติม ทุกงานอยู่ในส่วนที่ต้องดำเนินการเรียบร้อยแล้ว
                </Text>
              ) : (
                generalTasks.map((t) => renderTaskCard(t, false))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
  },
  userSub: {
    fontSize: 12,
    marginTop: 2,
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
  kpiRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  scopeBar: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 12,
    marginBottom: 18,
  },
  scopeBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  scopeBtnActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  scopeBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  assigneeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  assigneeText: {
    fontSize: 12,
  },
  myTaskTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  myTaskTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  otherTaskTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  otherTaskTagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '700',
    minWidth: 30,
    textAlign: 'right',
  },
  otherMemberNoteBox: {
    padding: 10,
    borderRadius: 8,
    marginTop: 6,
  },
  otherMemberNoteText: {
    fontSize: 11,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  kpiBox: {
    flex: 1,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  kpiNum: {
    fontSize: 18,
    fontWeight: '800',
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitlePriority: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  urgentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  urgentBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 11,
    marginBottom: 12,
  },
  taskCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
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
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  parentContentBox: {
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  parentContentLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  parentContentTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 1,
  },
  feedbackBox: {
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
  },
  feedbackTitle: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  feedbackText: {
    fontSize: 12,
    lineHeight: 16,
  },
  dueRow: {
    marginTop: 2,
    marginBottom: 14,
  },
  dueText: {
    fontSize: 11,
    fontWeight: '600',
  },
  startBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  submitSection: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 4,
  },
  inputPrompt: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  replyBoxWrapper: {
    marginBottom: 8,
  },
  replyInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    minHeight: 64,
    textAlignVertical: 'top',
  },
  urlInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    marginBottom: 8,
  },
  submitBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  submittedBox: {
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
  },
  submittedText: {
    fontSize: 12,
    fontWeight: '600',
  },
  submittedUrl: {
    fontSize: 11,
    marginTop: 3,
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
  allClearText: {
    fontSize: 12,
    fontStyle: 'italic',
    paddingVertical: 8,
  },
});
