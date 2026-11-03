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
import { taskApi, teamApi } from '../../services/api';
import { presenceService } from '../../services/presenceService';
import { useTheme } from '../../theme/ThemeContext';

const POSITION_TASK_MAP = {
  'Script Writer': ['Scripting'],
  'Video Editor': ['Editing', 'Filming', 'Sound Design'],
  'Graphic Designer': ['Graphic Design'],
  'Content Creator': ['Scripting', 'Filming', 'Editing', 'Graphic Design', 'Sound Design', 'Other'],
  'Production Manager': ['Scripting', 'Filming', 'Editing', 'Graphic Design', 'Sound Design', 'Other'],
};

const STAGE_ORDER = {
  Scripting: 1,
  Filming: 2,
  Editing: 3,
  'Graphic Design': 4,
  'Sound Design': 5,
  Other: 5,
};

const checkStageUnlocked = (currentTask, allTasks) => {
  const currentStageNum = STAGE_ORDER[currentTask.type] || 5;
  if (currentStageNum <= 1) return true;

  const currentContentId = currentTask.contentId;
  if (!currentContentId) return true;

  const peerTasks = allTasks.filter(
    (t) => t.contentId && t.contentId.toString() === currentContentId.toString() && t.id !== currentTask.id
  );

  const uncompletedPreceding = peerTasks.filter((t) => {
    const stageNum = STAGE_ORDER[t.type] || 5;
    return stageNum < currentStageNum && t.status !== 'DONE';
  });

  return uncompletedPreceding.length === 0;
};

export default function MemberTaskList({ user, onNavigate }) {
  const { colors, isDark } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [taskScope, setTaskScope] = useState('MY_TASKS'); // 'MY_TASKS' | 'TEAM_TASKS' | 'ACTIVITY_FEED'
  const [positionFilter, setPositionFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [submissionInputs, setSubmissionInputs] = useState({});
  const [replyInputs, setReplyInputs] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  const formatRelativeTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSec < 60) return 'เมื่อสักครู่';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} ชั่วโมงที่แล้ว`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) return `${diffDay} วันที่แล้ว`;
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} ${hours}:${minutes} น.`;
  };

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
            contentId: t.contentId?._id || t.contentId || '',
            contentTitle: t.contentId?.title || 'ชิ้นงานคอนเทนต์หลัก',
            platform: t.contentId?.platform || 'YouTube',
            status: t.status || 'TODO',
            dueDate: dl.label,
            isOverdue: dl.isOverdue,
            isUrgent: dl.isUrgent,
            notes: t.notes || t.revisionNotes || '',
            revisionNotes: t.revisionNotes || '',
            replyNotes: t.replyNotes || '',
            type: t.taskType || 'Production',
            submissionUrl: t.submissionUrl || '',
            assignedToId: assignedId,
            assigneeName: t.assignedTo?.firstName
              ? `${t.assignedTo.firstName} ${t.assignedTo.lastName || ''}`.trim()
              : (t.assignedTo?.username || 'ยังไม่ได้มอบหมาย'),
            assigneePosition: t.assignedTo?.position || 'Content Creator',
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

  const fetchActivities = async () => {
    try {
      const myTeam = await teamApi.getMyTeam().catch(() => null);
      if (myTeam?._id) {
        const dashboard = await teamApi.getDashboard(myTeam._id).catch(() => null);
        if (dashboard?.recentActivities) {
          setActivities(dashboard.recentActivities);
        }
      }
    } catch (err) {
      console.warn('fetchActivities error:', err.message);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchActivities();

    const unsubscribe = presenceService.subscribe((event) => {
      if (['TASK_CREATED', 'TASK_UPDATED', 'TASK_DELETED', 'CONTENT_UPDATED'].includes(event.type)) {
        fetchTasks();
      }
      if (['ACTIVITY_CREATED', 'TASK_CREATED', 'TASK_UPDATED', 'CONTENT_UPDATED'].includes(event.type)) {
        fetchActivities();
      }
    });

    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchTasks(), fetchActivities()]);
    setRefreshing(false);
  };

  const handleStartTask = async (taskId) => {
    setTasks(
      tasks.map((t) => (t.id === taskId ? { ...t, status: 'IN_PROGRESS' } : t))
    );
    try {
      await taskApi.updateStatus(taskId, 'IN_PROGRESS');
    } catch (e) {
      console.warn('Updated task locally:', e.message);
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

  // 1. My Tasks (ภาพที่ 43 หน้า 63) - งานใครงานมัน 100%
  const myTasks = tasks.filter((t) => t.isMyTask);
  const myUrgentTasks = myTasks.filter((t) => t.status === 'REVISION' || t.isOverdue || t.isUrgent);
  const myGeneralTasks = myTasks.filter((t) => !(t.status === 'REVISION' || t.isOverdue || t.isUrgent));

  // 2. Team Tasks Grouped by Member & 5 Core Positions (ภาพที่ 44 หน้า 64)
  const filteredTeamTasks = tasks.filter((t) => {
    if (positionFilter === 'ALL') return true;
    return (t.assigneePosition || 'Content Creator') === positionFilter;
  });

  const memberGroupsMap = {};
  filteredTeamTasks.forEach((t) => {
    const key = t.assignedToId ? t.assignedToId.toString() : 'unassigned';
    if (!memberGroupsMap[key]) {
      memberGroupsMap[key] = {
        id: key,
        name: t.assigneeName,
        position: t.assigneePosition || 'Content Creator',
        isMySelf: t.isMyTask,
        tasks: [],
      };
    }
    memberGroupsMap[key].tasks.push(t);
  });
  const memberGroups = Object.values(memberGroupsMap);

  const renderTaskCard = (item, isActionRequiredSection = false) => {
    const st = getStatusColor(item.status, item.isOverdue);
    const userRole = (user?.role || 'MEMBER').toUpperCase();
    const userPosition = user?.position || 'Content Creator';
    const isManager = userRole === 'MANAGER' || userRole === 'ADMIN';
    const allowedTypes = POSITION_TASK_MAP[userPosition] || ['Scripting', 'Filming', 'Editing', 'Graphic Design', 'Sound Design', 'Other'];
    const isPositionAuthorized = isManager || allowedTypes.includes(item.type);
    const isStageUnlocked = checkStageUnlocked(item, tasks);

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

        {/* Revision Feedback Callout */}
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
                {item.replyNotes ? (
                  <Text style={[styles.submittedReplyNotes, { color: colors.textSecondary }]}>
                    ข้อความตอบกลับ: {item.replyNotes}
                  </Text>
                ) : null}
              </View>
            )}

            {(item.status === 'TODO' || item.status === 'IN_PROGRESS' || item.status === 'REVISION') && (
              !isPositionAuthorized ? (
                <View style={[styles.lockedContainer, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}>
                  <Text style={[styles.lockedNoticeText, { color: colors.textSecondary }]}>
                    ล็อคการดำเนินงาน: ตำแหน่งของคุณ ({userPosition}) ไม่สามารถรับผิดชอบงานประเภท {item.type} ได้
                  </Text>
                  <TouchableOpacity
                    style={[styles.disabledBtn, { backgroundColor: colors.border }]}
                    disabled={true}
                  >
                    <Text style={[styles.disabledBtnText, { color: colors.textMuted }]}>
                      ปุ่มถูกปิดตามตำแหน่งงาน
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : !isStageUnlocked ? (
                <View style={[styles.lockedContainer, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}>
                  <Text style={[styles.lockedNoticeText, { color: colors.statusRevisionText }]}>
                    รอดำเนินการ: ต้องรอให้ขั้นตอนก่อนหน้าได้รับการอนุมัติจากหัวหน้าทีมก่อน
                  </Text>
                  <TouchableOpacity
                    style={[styles.disabledBtn, { backgroundColor: colors.border }]}
                    disabled={true}
                  >
                    <Text style={[styles.disabledBtnText, { color: colors.textMuted }]}>
                      รอขั้นตอนก่อนหน้าอนุมัติ
                    </Text>
                  </TouchableOpacity>
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
                </>
              )
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
          <Text style={[styles.userName, { color: colors.textPrimary }]}>
            {user?.name || (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'จอห์น')}
          </Text>
          <Text style={[styles.userSub, { color: colors.textSecondary }]}>
            ทีมงานฝ่ายผลิตสื่อ ({user?.position || 'Video Editor'} • Member)
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.avatarButton, { backgroundColor: colors.primary }]}
          onPress={() => onNavigate && onNavigate('profile')}
        >
          <Text style={styles.avatarButtonText}>
            {user?.name ? user.name.charAt(0).toUpperCase() : (user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'M')}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Creator KPI Metrics Bar (Reflects logged-in Member's own tasks) */}
        <View style={styles.kpiRow}>
          <View style={[styles.kpiBox, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Text style={[styles.kpiNum, { color: colors.primary }]}>
              {myTasks.filter((t) => t.status === 'IN_PROGRESS').length}
            </Text>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>กำลังดำเนินงาน</Text>
          </View>
          <View style={[styles.kpiBox, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Text style={[styles.kpiNum, { color: colors.statusReviewText }]}>
              {myTasks.filter((t) => t.status === 'REVIEW').length}
            </Text>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>รอตรวจทาน</Text>
          </View>
          <View style={[styles.kpiBox, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Text style={[styles.kpiNum, { color: colors.statusRevisionText }]}>
              {myTasks.filter((t) => t.status === 'REVISION').length}
            </Text>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>ต้องแก้ไข</Text>
          </View>
          <View style={[styles.kpiBox, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Text style={[styles.kpiNum, { color: colors.statusApprovedText }]}>
              {myTasks.filter((t) => t.status === 'DONE').length}
            </Text>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>เสร็จสิ้น</Text>
          </View>
        </View>

        {/* 3 Clear Segment Tabs: งานของฉัน | งานเพื่อนในทีม | กิจกรรมทีม */}
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
              งานของฉัน ({myTasks.length})
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
              งานเพื่อนในทีม ({tasks.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.scopeBtn,
              taskScope === 'ACTIVITY_FEED' && [styles.scopeBtnActive, { backgroundColor: colors.cardBg }],
            ]}
            onPress={() => setTaskScope('ACTIVITY_FEED')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.scopeBtnText,
                { color: colors.textSecondary },
                taskScope === 'ACTIVITY_FEED' && { color: colors.textPrimary, fontWeight: '700' },
              ]}
            >
              กิจกรรมทีม ({activities.length})
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
        ) : taskScope === 'MY_TASKS' ? (
          /* TAB 1: งานของฉัน (SRS ภาพที่ 43 หน้า 63) - งานใครงานมัน 100% */
          myTasks.length === 0 ? (
            <View style={[styles.emptyBox, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>คุณไม่มีงานที่ต้องรับผิดชอบขณะนี้</Text>
              <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                เลือกแท็บ "งานเพื่อนในทีม" เพื่อติดตามความคืบหน้าของเพื่อนร่วมทีม
              </Text>
            </View>
          ) : (
            <>
              {myUrgentTasks.length > 0 && (
                <View style={styles.sectionContainer}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={[styles.sectionTitlePriority, { color: colors.statusRevisionText }]}>
                      งานที่ต้องดำเนินการ (Action Required)
                    </Text>
                    <View style={[styles.urgentBadge, { backgroundColor: colors.statusRevisionBg }]}>
                      <Text style={[styles.urgentBadgeText, { color: colors.statusRevisionText }]}>
                        {myUrgentTasks.length} งาน
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                    งานที่ต้องแก้ไข หรือใกล้ครบกำหนดส่งมอบ
                  </Text>
                  {myUrgentTasks.map((t) => renderTaskCard(t, true))}
                </View>
              )}

              <View style={styles.sectionContainer}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  {myUrgentTasks.length > 0 ? 'งานอื่นๆ ที่ได้รับมอบหมาย' : 'งานที่ได้รับมอบหมาย'} ({myGeneralTasks.length})
                </Text>
                <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                  อัปเดตสถานะและส่งมอบไฟล์งานเพื่อการตรวจสอบ
                </Text>
                {myGeneralTasks.length === 0 ? (
                  <Text style={[styles.allClearText, { color: colors.textSecondary }]}>
                    ไม่มีงานอื่นเพิ่มเติม ทุกงานอยู่ในส่วนที่ต้องดำเนินการเรียบร้อยแล้ว
                  </Text>
                ) : (
                  myGeneralTasks.map((t) => renderTaskCard(t, false))
                )}
              </View>
            </>
          )
        ) : taskScope === 'TEAM_TASKS' ? (
          /* TAB 2: งานเพื่อนในทีม (SRS ภาพที่ 44 หน้า 64) - จัดกลุ่มตามสมาชิกและ 5 ตำแหน่งหลัก */
          <View style={styles.teamTasksWrapper}>
            {/* Position Filter Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChipScroll}>
              {[
                { id: 'ALL', label: 'ทั้งหมด' },
                { id: 'Script Writer', label: 'Script Writer' },
                { id: 'Video Editor', label: 'Video Editor' },
                { id: 'Graphic Designer', label: 'Graphic Designer' },
                { id: 'Content Creator', label: 'Content Creator' },
                { id: 'Production Manager', label: 'Production Manager' },
              ].map((chip) => (
                <TouchableOpacity
                  key={chip.id}
                  style={[
                    styles.filterChip,
                    { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
                    positionFilter === chip.id && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                  onPress={() => setPositionFilter(chip.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: colors.textSecondary },
                      positionFilter === chip.id && { color: '#FFFFFF', fontWeight: '700' },
                    ]}
                  >
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={[styles.teamOverviewNotice, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}>
              <Text style={[styles.teamOverviewNoticeText, { color: colors.textSecondary }]}>
                ผังงานทั้งหมดในทีม • จัดกลุ่มงานแยกตามสมาชิกแต่ละคน เพื่อติดตามสถานะโดยไม่รบกวนงานส่วนบุคคล
              </Text>
            </View>

            {memberGroups.length === 0 ? (
              <View style={[styles.emptyBox, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>ไม่พบงานในหมวดตำแหน่งนี้</Text>
                <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                  เลือกตัวกรอง "ทั้งหมด" เพื่อดูงานของเพื่อนร่วมทีมทุกคน
                </Text>
              </View>
            ) : (
              memberGroups.map((group) => (
                <View
                  key={group.id}
                  style={[
                    styles.memberGroupCard,
                    {
                      backgroundColor: colors.cardBg,
                      borderColor: group.isMySelf ? colors.primary : colors.cardBorder,
                    },
                  ]}
                >
                  {/* Member Header */}
                  <View style={styles.memberGroupHeader}>
                    <View style={styles.memberGroupInfo}>
                      <View style={[styles.memberAvatarCircle, { backgroundColor: group.isMySelf ? colors.primary : colors.textSecondary }]}>
                        <Text style={styles.memberAvatarCircleText}>
                          {group.name ? group.name.charAt(0).toUpperCase() : 'U'}
                        </Text>
                      </View>
                      <View>
                        <Text style={[styles.memberGroupName, { color: colors.textPrimary }]}>
                          {group.name} {group.isMySelf ? '(คุณ)' : ''}
                        </Text>
                        <View style={[styles.memberPositionBadge, { backgroundColor: colors.surfaceSubtle }]}>
                          <Text style={[styles.memberPositionBadgeText, { color: colors.primary }]}>
                            {group.position}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={[styles.memberTaskCountBadge, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}>
                      <Text style={[styles.memberTaskCountBadgeText, { color: colors.textSecondary }]}>
                        {group.tasks.length} งาน
                      </Text>
                    </View>
                  </View>

                  {/* Tasks List for This Member */}
                  <View style={styles.memberTaskListContainer}>
                    {group.tasks.map((t) => renderTaskCard(t, false))}
                  </View>
                </View>
              ))
            )}
          </View>
        ) : (
          /* TAB 3: กิจกรรมทีม (Live Activity Feed - Use Case 7 / Table 17 / ภาพที่ 8) */
          <View style={styles.activityFeedWrapper}>
            <View style={[styles.activityNoticeBox, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}>
              <Text style={[styles.activityNoticeTitle, { color: colors.textPrimary }]}>
                กิจกรรมทีมแบบเรียลไทม์ (Live Team Activities)
              </Text>
              <Text style={[styles.activityNoticeSub, { color: colors.textSecondary }]}>
                ผู้ร่วมทีมทุกคนมองเห็นความเคลื่อนไหว การส่งมอบงาน และการอนุมัติได้ทันที
              </Text>
            </View>

            {activities.length === 0 ? (
              <View style={[styles.emptyBox, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>ยังไม่มีบันทึกกิจกรรมล่าสุดในทีม</Text>
                <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                  เมื่อมีสมาชิกส่งงาน หรือหัวหน้าอนุมัติงาน รายการอัปเดตจะปรากฏที่นี่แบบเรียลไทม์
                </Text>
              </View>
            ) : (
              <View style={[styles.activityCardContainer, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                {activities.map((act) => {
                  const actorName = act.actor?.firstName
                    ? `${act.actor.firstName} ${act.actor.lastName || ''}`.trim()
                    : (act.actor?.username || 'สมาชิกในทีม');
                  const actorPosition = act.actor?.position || '';

                  return (
                    <View key={act._id} style={[styles.activityItemRow, { borderBottomColor: colors.border }]}>
                      <View style={[styles.activityDot, { backgroundColor: colors.primary }]} />
                      <View style={styles.activityContentBody}>
                        <View style={styles.activityTopLine}>
                          <Text style={[styles.activityActorText, { color: colors.textPrimary }]}>
                            {actorName} {actorPosition ? `(${actorPosition})` : ''}
                          </Text>
                          <Text style={[styles.activityTimeText, { color: colors.textMuted }]}>
                            {formatRelativeTime(act.createdAt)}
                          </Text>
                        </View>
                        <Text style={[styles.activityTitleText, { color: colors.textPrimary }]}>
                          {act.title}
                        </Text>
                        {!!act.details && (
                          <Text style={[styles.activityDetailsText, { color: colors.textSecondary }]}>
                            {act.details}
                          </Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
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
  scopeBar: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 12,
    marginBottom: 16,
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
    fontSize: 11,
    fontWeight: '600',
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
  assigneeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
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
  submittedReplyNotes: {
    fontSize: 11,
    marginTop: 4,
    fontStyle: 'italic',
  },
  lockedContainer: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 8,
  },
  lockedNoticeText: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    marginBottom: 8,
  },
  disabledBtn: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledBtnText: {
    fontSize: 12,
    fontWeight: '600',
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
  // Team Tasks Styles
  teamTasksWrapper: {
    marginBottom: 20,
  },
  filterChipScroll: {
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  teamOverviewNotice: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 14,
  },
  teamOverviewNoticeText: {
    fontSize: 11,
    lineHeight: 16,
  },
  memberGroupCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  memberGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  memberGroupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  memberAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarCircleText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  memberGroupName: {
    fontSize: 13,
    fontWeight: '700',
  },
  memberPositionBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  memberPositionBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  memberTaskCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  memberTaskCountBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  memberTaskListContainer: {
    marginTop: 4,
  },
  // Activity Feed Styles
  activityFeedWrapper: {
    marginBottom: 20,
  },
  activityNoticeBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  activityNoticeTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  activityNoticeSub: {
    fontSize: 11,
  },
  activityCardContainer: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  activityItemRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
    marginRight: 10,
  },
  activityContentBody: {
    flex: 1,
  },
  activityTopLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 3,
  },
  activityActorText: {
    fontSize: 12,
    fontWeight: '700',
  },
  activityTimeText: {
    fontSize: 10,
  },
  activityTitleText: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  activityDetailsText: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
});
