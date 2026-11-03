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
  TextInput,
  Platform,
  Linking,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { contentApi, taskApi, userApi, getBaseUrl, getAuthToken } from '../../services/api';
import { presenceService } from '../../services/presenceService';
import { useTheme } from '../../theme/ThemeContext';
import SmoothModal from '../../components/SmoothModal';

// Android layout animation guard
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Dynamic due date helper (native Date calculation)
const getDynamicDueDate = (daysAhead = 7) =>
  new Date(Date.now() + daysAhead * 86400000).toISOString().split('T')[0];

export default function ManagerDashboard({ user, onNavigate, refreshKey }) {
  const { colors, isDark } = useTheme();
  const [pipeline, setPipeline] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [pendingReviewTasks, setPendingReviewTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  // 3 Clear Primary Tabs:
  // 'REVIEW_QUEUE' (ภาพที่ 45 หน้า 65: หน้าอนุมัติงาน)
  // 'MEMBER_TASKS' (งานทั้งหมดแยกตามสมาชิก: งานใครงานมัน)
  // 'PIPELINE'     (ภาพที่ 35 หน้า 55: หน้างานผลิตของผู้จัดการทีม)
  const [activeTab, setActiveTab] = useState('REVIEW_QUEUE');
  const [memberPositionFilter, setMemberPositionFilter] = useState('ALL');
  const [pipelineFilter, setPipelineFilter] = useState('ALL');

  // Modals state
  const [revisionModalVisible, setRevisionModalVisible] = useState(false);
  const [revisionTargetItem, setRevisionTargetItem] = useState(null);
  const [revisionFeedback, setRevisionFeedback] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Create Content Modal
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPlatform, setNewPlatform] = useState('TikTok');
  const [newCategory] = useState('General');
  const [newDueDate, setNewDueDate] = useState(() => getDynamicDueDate(7));
  const [newDesc, setNewDesc] = useState('');
  const [submittingCreate, setSubmittingCreate] = useState(false);

  // Assign Task Modal
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [assignTargetContent, setAssignTargetContent] = useState(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskType, setTaskType] = useState('Editing');
  const [assignedToId, setAssignedToId] = useState('');
  const [taskDueDate, setTaskDueDate] = useState(() => getDynamicDueDate(3));
  const [taskNotes, setTaskNotes] = useState('');
  const [submittingAssign, setSubmittingAssign] = useState(false);

  const fetchLivePipeline = async () => {
    try {
      const [contentsRes, tasksRes] = await Promise.all([
        contentApi.getAll(),
        taskApi.getAll().catch(() => []),
      ]);

      const list = Array.isArray(contentsRes) ? contentsRes : (contentsRes?.contents || []);
      if (Array.isArray(list)) {
        const mapped = list.map((c) => ({
          _id: c._id,
          title: c.title,
          description: c.description || 'ไม่มีรายละเอียดเนื้อหา',
          platform: c.platform || 'General',
          status: c.status || 'PLANNING',
          category: c.category || 'General',
          creator: c.createdBy?.firstName ? `${c.createdBy.firstName} ${c.createdBy.lastName || ''}`.trim() : (c.createdBy?.username || 'ผู้ผลิต'),
          dueDate: c.dueDate ? c.dueDate.split('T')[0] : getDynamicDueDate(7),
          reviewHistory: c.reviewHistory || [],
          latestSubmissionUrl: (c.versions && c.versions.length > 0)
            ? c.versions[c.versions.length - 1].fileUrl
            : (c.submissionUrl || ''),
        }));
        setPipeline(mapped);
        setIsLiveConnected(true);
      }

      // Map All Tasks and Pending Review Tasks
      const rawTasks = Array.isArray(tasksRes) ? tasksRes : (tasksRes?.tasks || []);
      if (Array.isArray(rawTasks)) {
        const mappedAllTasks = rawTasks.map((t) => {
          const submitterName = t.assignedTo?.firstName
            ? `${t.assignedTo.firstName} ${t.assignedTo.lastName || ''}`.trim()
            : (t.assignedTo?.username || 'ทีมงาน');
          const submitterPosition = t.assignedTo?.position || 'Content Creator';
          const submitterDisplay = `${submitterName} (${submitterPosition})`;

          return {
            _id: t._id || t.id,
            title: t.title,
            taskType: t.taskType || 'Editing',
            stage: t.taskType || 'Editing',
            status: t.status || 'TODO',
            assignedToId: t.assignedTo?._id || t.assignedTo,
            submitterName,
            submitterPosition,
            submitterDisplay,
            submissionUrl: t.submissionUrl || '',
            replyNotes: t.replyNotes || '',
            notes: t.notes || '',
            revisionNotes: t.revisionNotes || '',
            contentTitle: t.contentId?.title || 'ชิ้นงานคอนเทนต์หลัก',
            platform: t.contentId?.platform || 'General',
            dueDate: t.dueDate ? t.dueDate.split('T')[0] : getDynamicDueDate(3),
            progress: t.progress || (t.status === 'DONE' ? 100 : t.status === 'REVIEW' ? 85 : t.status === 'IN_PROGRESS' ? 50 : 0),
            isTask: true,
          };
        });

        setAllTasks(mappedAllTasks);
        const reviewTasks = mappedAllTasks.filter((t) => t.status === 'REVIEW' || t.status === 'REVISION');
        setPendingReviewTasks(reviewTasks);
      }

      // Fetch team members for task assignment
      try {
        const uList = await userApi.getAll();
        if (Array.isArray(uList) && uList.length > 0) {
          const membersOnly = uList.filter((u) => u.role === 'MEMBER' || u.role === 'MANAGER');
          setTeamMembers(membersOnly);
          if (membersOnly.length > 0 && !assignedToId) {
            setAssignedToId(membersOnly[0]._id || membersOnly[0].id);
          }
        }
      } catch {
        setTeamMembers([
          { _id: '3', firstName: 'John', lastName: 'Editor', position: 'Video Editor', role: 'MEMBER' },
          { _id: '4', firstName: 'Jane', lastName: 'Script', position: 'Script Writer', role: 'MEMBER' },
          { _id: '5', firstName: 'Mike', lastName: 'Graphic', position: 'Graphic Designer', role: 'MEMBER' },
        ]);
      }
    } catch (e) {
      console.warn('Live API error in ManagerDashboard:', e.message);
      setPipeline([]);
      setIsLiveConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUrl = async (url) => {
    if (!url) return;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('เปิดลิงก์ผลงาน', url);
      }
    } catch {
      Alert.alert('ลิงก์ผลงาน', url);
    }
  };

  const handleCreateContent = async () => {
    if (!newTitle.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณาระบุชื่อ Content');
      return;
    }
    setSubmittingCreate(true);
    try {
      await contentApi.create({
        title: newTitle.trim(),
        platform: newPlatform,
        category: newCategory,
        dueDate: newDueDate,
        description: newDesc.trim() || 'สร้างจาก Mobile App (Manager Dashboard)',
        status: 'PLANNING',
      });
      Alert.alert('สำเร็จ', `สร้าง Content "${newTitle.trim()}" สำเร็จแล้ว`);
      setCreateModalVisible(false);
      setNewTitle('');
      setNewDesc('');
      await fetchLivePipeline();
    } catch (err) {
      Alert.alert('ข้อผิดพลาด', err.message || 'ไม่สามารถสร้าง Content ได้');
    } finally {
      setSubmittingCreate(false);
    }
  };

  const openAssignModal = (contentItem, targetMemberId = null) => {
    setAssignTargetContent(contentItem);
    setTaskTitle(contentItem ? `ตัดต่อและผลิตงาน: ${contentItem.title}` : 'งานผลิตสื่อใหม่');
    setTaskType('Editing');
    setTaskDueDate(contentItem?.dueDate || getDynamicDueDate(3));
    setTaskNotes('');
    if (targetMemberId) {
      setAssignedToId(targetMemberId);
    } else if (teamMembers.length > 0 && !assignedToId) {
      setAssignedToId(teamMembers[0]._id || teamMembers[0].id);
    }
    setAssignModalVisible(true);
  };

  const handleAssignTask = async () => {
    if (!taskTitle.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณาระบุชื่องานย่อย');
      return;
    }

    const selectedAssignee = assignedToId || (teamMembers[0]?._id || teamMembers[0]?.id);
    setSubmittingAssign(true);
    try {
      await taskApi.create({
        title: taskTitle.trim(),
        taskType,
        contentId: assignTargetContent?._id,
        assignedTo: selectedAssignee,
        dueDate: taskDueDate,
        notes: taskNotes.trim() || '',
        progress: 0,
      });

      // If Content was in PLANNING, promote to PRODUCTION
      if (assignTargetContent?.status === 'PLANNING') {
        await contentApi.updateStatus(assignTargetContent._id, 'PRODUCTION').catch(() => {});
      }

      Alert.alert('สำเร็จ', `มอบหมายงาน "${taskTitle.trim()}" ให้ลูกทีมเรียบร้อยแล้ว`);
      setAssignModalVisible(false);
      await fetchLivePipeline();
    } catch (err) {
      Alert.alert('ข้อผิดพลาด', err.message || 'ไม่สามารถมอบหมายงานได้');
    } finally {
      setSubmittingAssign(false);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    try {
      if (revisionTargetItem.isTask) {
        try {
          const baseUrl = getBaseUrl();
          const token = getAuthToken();
          await fetch(`${baseUrl}/tasks/${revisionTargetItem._id}/status`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              status: 'REVISION',
              revisionNotes: text,
              notes: text,
            }),
          });
        } catch {
          await taskApi.updateStatus(revisionTargetItem._id, 'REVISION');
        }
      } else {
        setPipeline((prev) =>
          prev.map((c) => (c._id === revisionTargetItem._id ? { ...c, status: 'REVISION' } : c))
        );
        try {
          await contentApi.submitReview(revisionTargetItem._id, 'REVISION', text);
        } catch (e) {
          console.warn('Updated locally:', e.message);
        }
      }
      Alert.alert('ส่งกลับแก้ไขสำเร็จ', `ส่งข้อคิดเห็นไปยัง ${revisionTargetItem.submitterName || revisionTargetItem.creator || 'ทีมงาน'} เรียบร้อยแล้ว`);
    } catch (err) {
      Alert.alert('ข้อผิดพลาด', err.message || 'ไม่สามารถส่งกลับแก้ไขได้');
    } finally {
      setSubmittingReview(false);
      setRevisionModalVisible(false);
      await fetchLivePipeline();
    }
  };

  const handleApproveTask = (taskItem) => {
    Alert.alert(
      'อนุมัติชิ้นงาน',
      `คุณต้องการอนุมัติ "${taskItem.title}" เพื่อผ่านสู่ขั้นตอนถัดไปใช่หรือไม่?`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ยืนยันอนุมัติ',
          onPress: async () => {
            try {
              await taskApi.updateStatus(taskItem._id, 'DONE', 100);
              Alert.alert('อนุมัติสำเร็จ', `ชิ้นงาน "${taskItem.title}" ได้รับการอนุมัติเรียบร้อยแล้ว`);
              await fetchLivePipeline();
            } catch (e) {
              Alert.alert('ข้อผิดพลาด', e.message || 'ไม่สามารถอนุมัติได้');
            }
          },
        },
      ]
    );
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

  const reviewCount = pipeline.filter((c) => c.status === 'REVIEW').length + pendingReviewTasks.filter((t) => t.status === 'REVIEW').length;
  const prodCount = pipeline.filter((c) => c.status === 'PRODUCTION').length;
  const revisionCount = pipeline.filter((c) => c.status === 'REVISION').length + pendingReviewTasks.filter((t) => t.status === 'REVISION').length;
  const approvedCount = pipeline.filter((c) => c.status === 'APPROVED' || c.status === 'PUBLISHED').length;

  // Visual Hierarchy: Manager Priority Review Queue Items
  const contentReviewItems = pipeline
    .filter((c) => c.status === 'REVIEW' || c.status === 'REVISION')
    .filter((c) => !pendingReviewTasks.some((t) => t.contentTitle === c.title));

  const reviewQueueItems = [
    ...pendingReviewTasks,
    ...contentReviewItems.map((c) => ({
      ...c,
      isTask: false,
      submitterDisplay: `${c.creator} (Content Creator)`,
      stage: c.category || 'General',
      submissionUrl: c.latestSubmissionUrl,
      replyNotes: '',
    })),
  ];

  // Filtered Pipeline for Tab 3
  const filteredPipeline = pipeline.filter((item) => {
    if (pipelineFilter === 'ALL') return true;
    if (pipelineFilter === 'APPROVED_ALL') return item.status === 'APPROVED' || item.status === 'PUBLISHED';
    return item.status === pipelineFilter;
  });

  // Filtered Member Groups for Tab 2
  const filteredMembers = teamMembers.filter((m) => {
    if (memberPositionFilter === 'ALL') return true;
    return (m.position || 'Content Creator') === memberPositionFilter;
  });

  // Render a Single Review Deliverable Card (SRS ภาพที่ 45 หน้า 65)
  const renderReviewDeliverableCard = (item) => {
    const st = getStatusBadge(item.status);

    return (
      <View
        key={item._id}
        style={[
          styles.reviewCard,
          {
            backgroundColor: colors.cardBg,
            borderColor: item.status === 'REVIEW'
              ? colors.statusReviewBorder
              : colors.statusRevisionBorder,
          },
        ]}
      >
        {/* Card Header Row: Platform & Status Pill */}
        <View style={styles.cardTopRow}>
          <View style={[styles.platBadge, { backgroundColor: colors.surfaceSubtle }]}>
            <Text style={[styles.platText, { color: colors.textSecondary }]}>
              {item.platform || 'General'}
            </Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: st.bg, borderColor: st.border }]}>
            <Text style={[styles.statusBadgeText, { color: st.text }]}>{st.label}</Text>
          </View>
        </View>

        {/* Title & Parent Content */}
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{item.title}</Text>
        {item.contentTitle && item.contentTitle !== item.title ? (
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
            ชิ้นงานหลัก: {item.contentTitle} ({item.platform || 'General'})
          </Text>
        ) : null}

        {/* Submitter Name & 5 Core Positions */}
        <View style={[styles.metaRow, { borderTopColor: colors.border }]}>
          <View style={styles.metaItem}>
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              ผู้ส่งงาน: <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{item.submitterDisplay || item.creator || 'ทีมงาน'}</Text>
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              กำหนดส่ง: <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{item.dueDate}</Text>
            </Text>
          </View>
        </View>

        {/* Deliverable URL with 1-Tap Open Link */}
        {!!(item.submissionUrl || item.latestSubmissionUrl) && (
          <TouchableOpacity
            style={[styles.btnPreviewLink, { borderColor: colors.border, backgroundColor: colors.surfaceSubtle }]}
            onPress={() => handleOpenUrl(item.submissionUrl || item.latestSubmissionUrl)}
            activeOpacity={0.7}
          >
            <Text style={[styles.btnPreviewLinkText, { color: colors.primary }]} numberOfLines={1}>
              เปิดดูผลงาน (URL): {item.submissionUrl || item.latestSubmissionUrl}
            </Text>
          </TouchableOpacity>
        )}

        {/* Member's replyNotes Callout */}
        {!!item.replyNotes && (
          <View style={[styles.replyNotesBox, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}>
            <Text style={[styles.replyNotesLabel, { color: colors.textSecondary }]}>
              ข้อความตอบกลับจากผู้ส่งงาน:
            </Text>
            <Text style={[styles.replyNotesText, { color: colors.textPrimary }]}>
              {item.replyNotes}
            </Text>
          </View>
        )}

        {/* Action Buttons: 1-Tap Direct Approval & Revision */}
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
            onPress={() => (item.isTask ? handleApproveTask(item) : handleApproveContent(item))}
            activeOpacity={0.7}
          >
            <Text style={styles.btnPrimaryText}>อนุมัติชิ้นงาน</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render a Single Content Project Card (SRS ภาพที่ 35 หน้า 55)
  const renderContentCard = (item) => {
    const st = getStatusBadge(item.status);

    return (
      <View
        key={item._id}
        style={[
          styles.card,
          {
            backgroundColor: colors.cardBg,
            borderColor: colors.cardBorder,
          },
        ]}
      >
        {/* Header Row */}
        <View style={styles.cardTopRow}>
          <View style={[styles.platBadge, { backgroundColor: colors.surfaceSubtle }]}>
            <Text style={[styles.platText, { color: colors.textSecondary }]}>{item.platform}</Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: st.bg, borderColor: st.border }]}>
            <Text style={[styles.statusBadgeText, { color: st.text }]}>{st.label}</Text>
          </View>
        </View>

        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{item.title}</Text>
        <Text style={[styles.cardDesc, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.description}
        </Text>

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

        {!!item.latestSubmissionUrl && (
          <TouchableOpacity
            style={[styles.btnPreviewLink, { borderColor: colors.border, backgroundColor: colors.surfaceSubtle }]}
            onPress={() => handleOpenUrl(item.latestSubmissionUrl)}
          >
            <Text style={[styles.btnPreviewLinkText, { color: colors.primary }]} numberOfLines={1}>
              เปิดดูผลงาน: {item.latestSubmissionUrl}
            </Text>
          </TouchableOpacity>
        )}

        {/* Contextual Actions */}
        {item.status === 'PLANNING' && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.btnSecondary, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => openAssignModal(item)}
            >
              <Text style={[styles.btnSecondaryText, { color: colors.textPrimary }]}>+ มอบหมายงาน</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnPrimary, { backgroundColor: colors.primary }]}
              onPress={() => handleStartProduction(item)}
            >
              <Text style={styles.btnPrimaryText}>เริ่มขั้นตอนผลิต</Text>
            </TouchableOpacity>
          </View>
        )}

        {item.status === 'PRODUCTION' && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.btnSecondary, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => openAssignModal(item)}
            >
              <Text style={[styles.btnSecondaryText, { color: colors.textPrimary }]}>+ มอบหมายงาน</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnPrimary, { backgroundColor: colors.primary }]}
              onPress={() => handleSendToReview(item)}
            >
              <Text style={styles.btnPrimaryText}>ส่งเข้าสู่การตรวจ</Text>
            </TouchableOpacity>
          </View>
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
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.btnPrimary, { backgroundColor: colors.statusApprovedText }]}
              onPress={() => handlePublishNow(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.btnPrimaryText}>เผยแพร่ชิ้นงาน (Publish)</Text>
            </TouchableOpacity>
          </View>
        )}

        {item.status === 'PUBLISHED' && (
          <View style={[styles.publishedBanner, { backgroundColor: colors.statusApprovedBg }]}>
            <Text style={[styles.publishedBannerText, { color: colors.statusApprovedText }]}>
              เผยแพร่สู่สาธารณะแล้วบน {item.platform}
            </Text>
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
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            {user?.name || (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'สมศรี')}
          </Text>
          <View style={styles.roleRow}>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>ผู้จัดการฝ่ายผลิต (Production Manager)</Text>
            <View style={[styles.dbBadge, isLiveConnected ? styles.dbLive : styles.dbMock]}>
              <View style={[styles.dbDot, isLiveConnected ? styles.dotLive : styles.dotMock]} />
              <Text style={styles.dbText}>{isLiveConnected ? 'API Live' : 'Offline'}</Text>
            </View>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity
            style={[styles.addBtnHeader, { backgroundColor: colors.primary }]}
            onPress={() => setCreateModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.addBtnHeaderText}>+ สร้างงาน</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.avatarButton, { backgroundColor: colors.primary }]}
            onPress={() => onNavigate && onNavigate('profile')}
          >
            <Text style={styles.avatarButtonText}>
              {user?.name ? user.name.charAt(0).toUpperCase() : (user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'M')}
            </Text>
          </TouchableOpacity>
        </View>
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

        {/* Primary Manager Mode Switcher (ตัดความสับสนระหว่างทั้งหมด กับ อนุมัติงาน) */}
        <View style={[styles.scopeBar, { backgroundColor: isDark ? colors.surface : '#E2E8F0' }]}>
          <TouchableOpacity
            style={[
              styles.scopeBtn,
              activeTab === 'REVIEW_QUEUE' && [styles.scopeBtnActive, { backgroundColor: colors.cardBg }],
            ]}
            onPress={() => setActiveTab('REVIEW_QUEUE')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.scopeBtnText,
                { color: colors.textSecondary },
                activeTab === 'REVIEW_QUEUE' && { color: colors.textPrimary, fontWeight: '700' },
              ]}
            >
              หน้าอนุมัติงาน ({reviewQueueItems.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.scopeBtn,
              activeTab === 'MEMBER_TASKS' && [styles.scopeBtnActive, { backgroundColor: colors.cardBg }],
            ]}
            onPress={() => setActiveTab('MEMBER_TASKS')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.scopeBtnText,
                { color: colors.textSecondary },
                activeTab === 'MEMBER_TASKS' && { color: colors.textPrimary, fontWeight: '700' },
              ]}
            >
              งานแยกตามสมาชิก ({allTasks.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.scopeBtn,
              activeTab === 'PIPELINE' && [styles.scopeBtnActive, { backgroundColor: colors.cardBg }],
            ]}
            onPress={() => setActiveTab('PIPELINE')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.scopeBtnText,
                { color: colors.textSecondary },
                activeTab === 'PIPELINE' && { color: colors.textPrimary, fontWeight: '700' },
              ]}
            >
              โครงการคอนเทนต์ ({pipeline.length})
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.centerLoadingText, { color: colors.textSecondary }]}>
              กำลังโหลดสถานะกระบวนการผลิตจากระบบ...
            </Text>
          </View>
        ) : activeTab === 'REVIEW_QUEUE' ? (
          /* TAB 1: หน้าอนุมัติงาน (SRS ภาพที่ 45 หน้า 65) */
          <View style={styles.sectionContainer}>
            <View style={[styles.sectionNoticeBox, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}>
              <Text style={[styles.sectionNoticeTitle, { color: colors.statusReviewText }]}>
                คิวตรวจสอบและอนุมัติงาน (Review & Approval Queue)
              </Text>
              <Text style={[styles.sectionNoticeSub, { color: colors.textSecondary }]}>
                รวบรวมเฉพาะงานที่ลูกทีมส่งมอบเพื่อตรวจรับ สั่งแก้ไข หรืออนุมัติผ่านเข้าสู่ขั้นตอนถัดไป
              </Text>
            </View>

            {reviewQueueItems.length === 0 ? (
              <View style={[styles.emptyBox, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <Text style={[styles.emptyTitle, { color: colors.statusApprovedText }]}>
                  ไม่มีงานค้างตรวจอนุมัติ (All Clear)
                </Text>
                <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                  ทุกชิ้นงานได้รับการตรวจสอบเรียบร้อยแล้ว หรือลูกทีมยังไม่ได้ส่งงานใหม่ในขณะนี้
                </Text>
              </View>
            ) : (
              reviewQueueItems.map((item) => renderReviewDeliverableCard(item))
            )}
          </View>
        ) : activeTab === 'MEMBER_TASKS' ? (
          /* TAB 2: งานทั้งหมดแยกตามสมาชิก (งานใครงานมัน 100%) */
          <View style={styles.sectionContainer}>
            {/* 5 Core Positions Filter */}
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
                    memberPositionFilter === chip.id && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                  onPress={() => setMemberPositionFilter(chip.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: colors.textSecondary },
                      memberPositionFilter === chip.id && { color: '#FFFFFF', fontWeight: '700' },
                    ]}
                  >
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={[styles.sectionNoticeBox, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}>
              <Text style={[styles.sectionNoticeTitle, { color: colors.textPrimary }]}>
                ผังงานแยกตามรายบุคคล (Workload by Team Member)
              </Text>
              <Text style={[styles.sectionNoticeSub, { color: colors.textSecondary }]}>
                แสดงภาระงานและสถานะความคืบหน้าของสมาชิกแต่ละคนใน 5 ตำแหน่งหลัก
              </Text>
            </View>

            {filteredMembers.length === 0 ? (
              <View style={[styles.emptyBox, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>ไม่พบสมาชิกในตำแหน่งนี้</Text>
                <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                  เลือกตัวกรอง "ทั้งหมด" เพื่อดูสมาชิกทุกคนในทีม
                </Text>
              </View>
            ) : (
              filteredMembers.map((member) => {
                const memberId = member._id || member.id;
                const memberName = member.firstName ? `${member.firstName} ${member.lastName || ''}`.trim() : (member.username || 'สมาชิก');
                const memberPosition = member.position || 'Content Creator';
                const memberTasks = allTasks.filter((t) => t.assignedToId && t.assignedToId.toString() === memberId.toString());

                return (
                  <View
                    key={memberId}
                    style={[
                      styles.memberOverviewCard,
                      { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
                    ]}
                  >
                    {/* Member Header */}
                    <View style={styles.memberOverviewHeader}>
                      <View style={styles.memberOverviewLeft}>
                        <View style={[styles.memberAvatar, { backgroundColor: colors.primary }]}>
                          <Text style={styles.memberAvatarText}>
                            {memberName ? memberName.charAt(0).toUpperCase() : 'M'}
                          </Text>
                        </View>
                        <View>
                          <Text style={[styles.memberOverviewName, { color: colors.textPrimary }]}>
                            {memberName}
                          </Text>
                          <View style={styles.memberRoleBadgeRow}>
                            <View style={[styles.positionPill, { backgroundColor: colors.surfaceSubtle }]}>
                              <Text style={[styles.positionPillText, { color: colors.primary }]}>
                                {memberPosition}
                              </Text>
                            </View>
                            <Text style={[styles.memberRoleText, { color: colors.textSecondary }]}>
                              {member.role || 'MEMBER'}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={[styles.btnAssignMini, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}
                        onPress={() => openAssignModal(pipeline[0] || null, memberId)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.btnAssignMiniText, { color: colors.primary }]}>+ มอบหมายงาน</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Member Assigned Tasks */}
                    <View style={styles.memberTasksBody}>
                      {memberTasks.length === 0 ? (
                        <Text style={[styles.noTaskText, { color: colors.textMuted }]}>
                          ยังไม่มีงานที่มอบหมายให้สมาชิกคนนี้
                        </Text>
                      ) : (
                        memberTasks.map((t) => {
                          const st = getStatusBadge(t.status);
                          return (
                            <View
                              key={t._id}
                              style={[
                                styles.memberTaskRow,
                                { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
                              ]}
                            >
                              <View style={styles.memberTaskTop}>
                                <Text style={[styles.memberTaskType, { color: colors.textSecondary }]}>{t.taskType}</Text>
                                <View style={[styles.statusBadgeSmall, { backgroundColor: st.bg, borderColor: st.border }]}>
                                  <Text style={[styles.statusBadgeSmallText, { color: st.text }]}>{st.label}</Text>
                                </View>
                              </View>
                              <Text style={[styles.memberTaskTitle, { color: colors.textPrimary }]}>{t.title}</Text>
                              <Text style={[styles.memberTaskContent, { color: colors.textSecondary }]} numberOfLines={1}>
                                ชิ้นงาน: {t.contentTitle} • กำหนดส่ง: {t.dueDate}
                              </Text>
                            </View>
                          );
                        })
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        ) : (
          /* TAB 3: โครงการคอนเทนต์ (SRS ภาพที่ 35 หน้า 55) */
          <View style={styles.sectionContainer}>
            {/* Status Filter Pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChipScroll}>
              {[
                { id: 'ALL', label: 'ทั้งหมด' },
                { id: 'PLANNING', label: 'วางแผน' },
                { id: 'PRODUCTION', label: 'กำลังผลิต' },
                { id: 'REVIEW', label: 'รอตรวจ' },
                { id: 'APPROVED_ALL', label: 'เสร็จสิ้น/เผยแพร่' },
              ].map((chip) => (
                <TouchableOpacity
                  key={chip.id}
                  style={[
                    styles.filterChip,
                    { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
                    pipelineFilter === chip.id && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                  onPress={() => setPipelineFilter(chip.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: colors.textSecondary },
                      pipelineFilter === chip.id && { color: '#FFFFFF', fontWeight: '700' },
                    ]}
                  >
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {filteredPipeline.length === 0 ? (
              <View style={[styles.emptyBox, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>ไม่มีชิ้นงานในสถานะนี้</Text>
                <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                  กดปุ่ม "+ สร้างงาน" ด้านบนเพื่อเปิดโครงการคอนเทนต์ใหม่
                </Text>
              </View>
            ) : (
              filteredPipeline.map((item) => renderContentCard(item))
            )}
          </View>
        )}
      </ScrollView>

      {/* Revision Modal Dialog */}
      <SmoothModal
        visible={revisionModalVisible}
        onClose={() => setRevisionModalVisible(false)}
        title="ส่งกลับแก้ไขชิ้นงาน"
        subtitle={`${revisionTargetItem?.title || ''} • ผู้รับผิดชอบ: ${revisionTargetItem?.submitterName || revisionTargetItem?.creator || 'ทีมงาน'}`}
      >
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
          placeholder="เช่น ปรับสีวิดีโอให้สว่างขึ้น, ลดเสียงดนตรีประกอบ..."
          placeholderTextColor={colors.textMuted}
          value={revisionFeedback}
          onChangeText={setRevisionFeedback}
          multiline
          numberOfLines={4}
        />
        <View style={styles.modalBtnRow}>
          <TouchableOpacity
            style={[styles.modalBtnCancel, { borderColor: colors.border }]}
            onPress={() => setRevisionModalVisible(false)}
          >
            <Text style={[styles.modalBtnCancelText, { color: colors.textSecondary }]}>ยกเลิก</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalBtnConfirm, { backgroundColor: colors.statusRevisionText }]}
            onPress={confirmSubmitRevision}
            disabled={submittingReview}
          >
            {submittingReview ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.modalBtnConfirmText}>ยืนยันส่งกลับแก้ไข</Text>
            )}
          </TouchableOpacity>
        </View>
      </SmoothModal>

      {/* Create Content Modal */}
      <SmoothModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        title="สร้าง Content ชิ้นใหม่"
        subtitle="เปิดโครงการผลิตสื่อใหม่เพื่อกระจายงานผลิต"
      >
        <Text style={[styles.modalLabel, { color: colors.textPrimary }]}>ชื่อชิ้นงาน (Title) *</Text>
        <TextInput
          style={[styles.modalTextInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }]}
          placeholder="เช่น รีวิวไมโครโฟนไร้สายสำหรับ Creator..."
          placeholderTextColor={colors.textMuted}
          value={newTitle}
          onChangeText={setNewTitle}
        />

        <Text style={[styles.modalLabel, { color: colors.textPrimary, marginTop: 10 }]}>แพลตฟอร์มเผยแพร่</Text>
        <View style={styles.platChoiceRow}>
          {['TikTok', 'YouTube', 'Instagram'].map((p) => (
            <TouchableOpacity
              key={p}
              style={[
                styles.platChoiceBtn,
                { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
                newPlatform === p && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => setNewPlatform(p)}
            >
              <Text
                style={[
                  styles.platChoiceBtnText,
                  { color: colors.textSecondary },
                  newPlatform === p && { color: '#FFFFFF', fontWeight: '700' },
                ]}
              >
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.modalLabel, { color: colors.textPrimary, marginTop: 10 }]}>กำหนดส่งงาน (YYYY-MM-DD)</Text>
        <TextInput
          style={[styles.modalTextInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }]}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textMuted}
          value={newDueDate}
          onChangeText={setNewDueDate}
        />

        <Text style={[styles.modalLabel, { color: colors.textPrimary, marginTop: 10 }]}>คำอธิบาย / รายละเอียดเบื้องต้น</Text>
        <TextInput
          style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }]}
          placeholder="เนื้อหาคร่าวๆ, จุดประสงค์ หรือแนวทาง..."
          placeholderTextColor={colors.textMuted}
          value={newDesc}
          onChangeText={setNewDesc}
          multiline
          numberOfLines={3}
        />

        <View style={styles.modalBtnRow}>
          <TouchableOpacity
            style={[styles.modalBtnCancel, { borderColor: colors.border }]}
            onPress={() => setCreateModalVisible(false)}
          >
            <Text style={[styles.modalBtnCancelText, { color: colors.textSecondary }]}>ยกเลิก</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalBtnConfirm, { backgroundColor: colors.primary }]}
            onPress={handleCreateContent}
            disabled={submittingCreate}
          >
            {submittingCreate ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.modalBtnConfirmText}>ยืนยันสร้างงาน</Text>
            )}
          </TouchableOpacity>
        </View>
      </SmoothModal>

      {/* Assign Task Modal */}
      <SmoothModal
        visible={assignModalVisible}
        onClose={() => setAssignModalVisible(false)}
        title="มอบหมายงานย่อย"
        subtitle={assignTargetContent ? `ชิ้นงาน: ${assignTargetContent.title}` : 'มอบหมายงานใหม่'}
      >
        <Text style={[styles.modalLabel, { color: colors.textPrimary }]}>ชื่องานย่อย (Task Title) *</Text>
        <TextInput
          style={[styles.modalTextInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }]}
          placeholder="เช่น เขียนบทสคริปต์, ตัดต่อวิดีโอหลัก..."
          placeholderTextColor={colors.textMuted}
          value={taskTitle}
          onChangeText={setTaskTitle}
        />

        <Text style={[styles.modalLabel, { color: colors.textPrimary, marginTop: 10 }]}>ประเภทงาน</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 6 }}>
          {['Scripting', 'Filming', 'Editing', 'Graphic Design', 'Sound Design'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.platChoiceBtn,
                { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
                taskType === type && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => setTaskType(type)}
            >
              <Text
                style={[
                  styles.platChoiceBtnText,
                  { color: colors.textSecondary },
                  taskType === type && { color: '#FFFFFF', fontWeight: '700' },
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[styles.modalLabel, { color: colors.textPrimary, marginTop: 10 }]}>ผู้รับผิดชอบงาน</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 6 }}>
          {teamMembers.map((m) => {
            const mId = m._id || m.id;
            const mName = m.firstName ? `${m.firstName} ${m.lastName || ''}`.trim() : (m.username || 'สมาชิก');
            const isSelected = assignedToId === mId;
            return (
              <TouchableOpacity
                key={mId}
                style={[
                  styles.platChoiceBtn,
                  { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
                  isSelected && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
                onPress={() => setAssignedToId(mId)}
              >
                <Text
                  style={[
                    styles.platChoiceBtnText,
                    { color: colors.textSecondary },
                    isSelected && { color: '#FFFFFF', fontWeight: '700' },
                  ]}
                >
                  {mName} ({m.position || 'Member'})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={[styles.modalLabel, { color: colors.textPrimary, marginTop: 10 }]}>กำหนดส่ง (YYYY-MM-DD)</Text>
        <TextInput
          style={[styles.modalTextInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }]}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textMuted}
          value={taskDueDate}
          onChangeText={setTaskDueDate}
        />

        <Text style={[styles.modalLabel, { color: colors.textPrimary, marginTop: 10 }]}>หมายเหตุ / บรีฟงาน</Text>
        <TextInput
          style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }]}
          placeholder="ระบุข้อกำหนดเพิ่มเติม..."
          placeholderTextColor={colors.textMuted}
          value={taskNotes}
          onChangeText={setTaskNotes}
          multiline
          numberOfLines={2}
        />

        <View style={styles.modalBtnRow}>
          <TouchableOpacity
            style={[styles.modalBtnCancel, { borderColor: colors.border }]}
            onPress={() => setAssignModalVisible(false)}
          >
            <Text style={[styles.modalBtnCancelText, { color: colors.textSecondary }]}>ยกเลิก</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalBtnConfirm, { backgroundColor: colors.primary }]}
            onPress={handleAssignTask}
            disabled={submittingAssign}
          >
            {submittingAssign ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.modalBtnConfirmText}>ยืนยันมอบหมาย</Text>
            )}
          </TouchableOpacity>
        </View>
      </SmoothModal>
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  headerSubtitle: {
    fontSize: 11,
  },
  dbBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 4,
  },
  dbLive: {
    backgroundColor: '#ECFDF5',
  },
  dbMock: {
    backgroundColor: '#F1F5F9',
  },
  dbDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotLive: {
    backgroundColor: '#10B981',
  },
  dotMock: {
    backgroundColor: '#94A3B8',
  },
  dbText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#047857',
  },
  addBtnHeader: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addBtnHeaderText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
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
    marginBottom: 14,
  },
  kpiBox: {
    flex: 1,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  kpiNumber: {
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
  sectionNoticeBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 14,
  },
  sectionNoticeTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  sectionNoticeSub: {
    fontSize: 11,
    lineHeight: 16,
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
  reviewCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  platBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  platText: {
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
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 11,
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  metaItem: {
    flex: 1,
  },
  metaText: {
    fontSize: 11,
  },
  btnPreviewLink: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  btnPreviewLinkText: {
    fontSize: 11,
    textDecorationLine: 'underline',
  },
  replyNotesBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  replyNotesLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 2,
  },
  replyNotesText: {
    fontSize: 11,
    lineHeight: 15,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  btnSecondary: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondaryText: {
    fontSize: 12,
    fontWeight: '700',
  },
  btnPrimary: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  publishedBanner: {
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  publishedBannerText: {
    fontSize: 11,
    fontWeight: '700',
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
    borderWidth: 1,
    marginTop: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptyDesc: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  // Member Workload Styles (Tab 2)
  memberOverviewCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  memberOverviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  memberOverviewLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  memberOverviewName: {
    fontSize: 13,
    fontWeight: '700',
  },
  memberRoleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  positionPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  positionPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  memberRoleText: {
    fontSize: 10,
  },
  btnAssignMini: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  btnAssignMiniText: {
    fontSize: 11,
    fontWeight: '700',
  },
  memberTasksBody: {
    marginTop: 10,
  },
  noTaskText: {
    fontSize: 11,
    fontStyle: 'italic',
    paddingVertical: 4,
  },
  memberTaskRow: {
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  memberTaskTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  memberTaskType: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusBadgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusBadgeSmallText: {
    fontSize: 9,
    fontWeight: '700',
  },
  memberTaskTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  memberTaskContent: {
    fontSize: 10,
  },
  // Modal Styles
  modalLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  modalTextInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    textAlignVertical: 'top',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  modalBtnCancel: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnCancelText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalBtnConfirm: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnConfirmText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  platChoiceRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  platChoiceBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    marginRight: 6,
  },
  platChoiceBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
