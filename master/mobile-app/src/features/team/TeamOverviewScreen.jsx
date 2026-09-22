import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { teamApi } from '../../services/api';

export default function TeamOverviewScreen({ user, onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [teamData, setTeamData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const fetchTeamWorkspace = async () => {
    try {
      setErrorMessage(null);
      // 1. Fetch current user's team
      const myTeam = await teamApi.getMyTeam();
      if (!myTeam || !myTeam._id) {
        throw new Error('ไม่พบข้อมูลทีมที่คุณสังกัดในระบบ');
      }

      // 2. Fetch team dashboard aggregate
      const dashboard = await teamApi.getDashboard(myTeam._id);
      setTeamData(dashboard);
    } catch (err) {
      console.warn('fetchTeamWorkspace error:', err.message);
      setErrorMessage(err.message || 'ไม่สามารถโหลดข้อมูลทีมได้ กรุณาตรวจสอบการเชื่อมต่อ Backend');
      setTeamData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTeamWorkspace();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTeamWorkspace();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DONE':
        return { label: 'เสร็จสมบูรณ์', bg: '#DCFCE7', text: '#16A34A' };
      case 'REVIEW':
        return { label: 'รอตรวจทาน', bg: '#FEF3C7', text: '#D97706' };
      case 'IN_PROGRESS':
        return { label: 'กำลังดำเนินการ', bg: '#E0F2FE', text: '#0284C7' };
      case 'TODO':
      default:
        return { label: 'รอดำเนินการ', bg: '#F1F5F9', text: '#64748B' };
    }
  };

  const getWorkingStatusBadge = (workingStatus) => {
    switch (workingStatus) {
      case 'WORKING':
        return { label: '🟢 กำลังทำงาน', bg: '#DCFCE7', text: '#15803D' };
      case 'REVIEWING':
        return { label: '🟡 รอตรวจงาน', bg: '#FEF3C7', text: '#B45309' };
      case 'IDLE':
      default:
        return { label: '⚪ พร้อมรับงาน', bg: '#F1F5F9', text: '#64748B' };
    }
  };

  const formatActivityTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes} น.`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>WORKSPACE & COLLABORATION</Text>
          <Text style={styles.headerTitle}>
            {teamData?.team?.name || 'ทีมของฉัน (My Team)'}
          </Text>
        </View>
        {teamData?.team && (
          <View style={styles.memberCountBadge}>
            <Text style={styles.memberCountText}>
              👥 {teamData.team.totalMembers} สมาชิก
            </Text>
          </View>
        )}
      </View>

      {/* Main Scroll Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#0F172A" />
            <Text style={styles.centerText}>กำลังดึงข้อมูลทีมสดจาก MongoDB...</Text>
          </View>
        ) : errorMessage ? (
          <View style={styles.centerBox}>
            <Text style={styles.errorTitle}>⚠️ การเชื่อมต่อขัดข้อง</Text>
            <Text style={styles.errorDesc}>{errorMessage}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchTeamWorkspace}>
              <Text style={styles.retryButtonText}>🔄 ลองเชื่อมต่อใหม่</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* 1. Team Dashboard Metrics Card */}
            <View style={styles.dashboardCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>📊 สรุปความคืบหน้าทีม (Team Overview)</Text>
                <Text style={styles.progressPercent}>{teamData?.stats?.teamProgress || 0}%</Text>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${teamData?.stats?.teamProgress || 0}%` },
                  ]}
                />
              </View>

              {/* Quick Metrics Grid */}
              <View style={styles.metricsGrid}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>งานของฉัน</Text>
                  <Text style={styles.metricValueHighlight}>
                    {teamData?.stats?.myTasksCount || 0}
                  </Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>งานของทีม</Text>
                  <Text style={styles.metricValue}>
                    {teamData?.stats?.teamTasksCount || 0}
                  </Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>กำลังผลิต</Text>
                  <Text style={[styles.metricValue, { color: '#0284C7' }]}>
                    {teamData?.stats?.inProgressCount || 0}
                  </Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>รอตรวจ</Text>
                  <Text style={[styles.metricValue, { color: '#D97706' }]}>
                    {teamData?.stats?.reviewCount || 0}
                  </Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>เสร็จแล้ว</Text>
                  <Text style={[styles.metricValue, { color: '#16A34A' }]}>
                    {teamData?.stats?.doneCount || 0}
                  </Text>
                </View>
              </View>
            </View>

            {/* 2. Team Members Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>👥 สมาชิกในทีม ({teamData?.members?.length || 0})</Text>
              <Text style={styles.sectionSubtitle}>สถานะการทำงานแบบเรียลไทม์</Text>
            </View>

            <View style={styles.membersList}>
              {teamData?.members && teamData.members.length > 0 ? (
                teamData.members.map((member) => {
                  const badge = getWorkingStatusBadge(member.workingStatus);
                  const isCurrentUser = member._id === user?.id || member._id === user?.userId;
                  return (
                    <View key={member._id || member.username} style={styles.memberCard}>
                      <View style={styles.memberAvatar}>
                        <Text style={styles.avatarText}>
                          {(member.firstName || member.username || 'M')[0].toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.memberInfo}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={styles.memberName}>
                            {member.firstName ? `${member.firstName} ${member.lastName || ''}` : member.username}
                          </Text>
                          {isCurrentUser && (
                            <View style={styles.meBadge}>
                              <Text style={styles.meBadgeText}>ฉัน</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.memberRole}>
                          {member.roleInTeam} • {member.role}
                        </Text>
                      </View>
                      <View style={[styles.workingBadge, { backgroundColor: badge.bg }]}>
                        <Text style={[styles.workingBadgeText, { color: badge.text }]}>
                          {badge.label}
                        </Text>
                      </View>
                    </View>
                  );
                })
              ) : (
                <Text style={styles.emptyText}>ยังไม่มีสมาชิกในทีมนี้</Text>
              )}
            </View>

            {/* 3. Team Tasks Pipeline Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📋 งานทั้งหมดของทีม ({teamData?.tasks?.length || 0})</Text>
              <Text style={styles.sectionSubtitle}>ติดตามสถานะและความคืบหน้าของทุกคน</Text>
            </View>

            {teamData?.tasks && teamData.tasks.length > 0 ? (
              teamData.tasks.map((task) => {
                const badge = getStatusBadge(task.status);
                const assigneeName = task.assignedTo
                  ? `${task.assignedTo.firstName || ''} ${task.assignedTo.lastName || ''}`.trim() || task.assignedTo.username
                  : 'ยังไม่ได้มอบหมาย';
                const isMyTask =
                  task.assignedTo &&
                  (task.assignedTo._id === user?.id || task.assignedTo._id === user?.userId);

                return (
                  <View key={task._id} style={styles.taskCard}>
                    {/* Top Row: Parent Content & Task Status */}
                    <View style={styles.taskHeaderRow}>
                      <View style={styles.contentPill}>
                        <Text style={styles.contentPillText}>
                          🎬 {task.contentId?.title || 'ชิ้นงานคอนเทนต์'}
                        </Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                        <Text style={[styles.statusBadgeText, { color: badge.text }]}>
                          {badge.label}
                        </Text>
                      </View>
                    </View>

                    {/* Task Title */}
                    <Text style={styles.taskTitle}>{task.title}</Text>

                    {/* Assignee & Deadline */}
                    <View style={styles.taskMetaRow}>
                      <Text style={styles.taskAssignee}>
                        👤 ผู้รับผิดชอบ: <Text style={{ fontWeight: '700', color: '#0F172A' }}>{assigneeName}</Text>
                        {isMyTask && ' (งานของคุณ)'}
                      </Text>
                      {task.dueDate && (
                        <Text style={styles.taskDueDate}>
                          📅 {task.dueDate.split('T')[0]}
                        </Text>
                      )}
                    </View>

                    {/* Progress Bar for Individual Task */}
                    <View style={styles.taskProgressRow}>
                      <View style={styles.taskProgressBarBg}>
                        <View
                          style={[
                            styles.taskProgressBarFill,
                            {
                              width: `${task.progress || 0}%`,
                              backgroundColor: badge.text,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.taskProgressText}>{task.progress || 0}%</Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>ไม่มีงานที่ค้างอยู่ในทีมขณะนี้</Text>
              </View>
            )}

            {/* 4. Team Activity Feed Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>⚡ กิจกรรมล่าสุดของทีม (Team Activity)</Text>
              <Text style={styles.sectionSubtitle}>สิ่งที่ทีมกำลังดำเนินงานอยู่</Text>
            </View>

            <View style={styles.activityFeed}>
              {teamData?.recentActivities && teamData.recentActivities.length > 0 ? (
                teamData.recentActivities.map((act) => (
                  <View key={act._id} style={styles.activityItem}>
                    <View style={styles.activityDot} />
                    <View style={styles.activityBody}>
                      <View style={styles.activityTopRow}>
                        <Text style={styles.activityTitle}>{act.title}</Text>
                        <Text style={styles.activityTime}>{formatActivityTime(act.createdAt)}</Text>
                      </View>
                      {act.details ? (
                        <Text style={styles.activityDetails}>{act.details}</Text>
                      ) : null}
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>ยังไม่มีบันทึกกิจกรรมในทีม</Text>
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
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  memberCountBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  memberCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  centerBox: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    marginTop: 12,
    fontSize: 13,
    color: '#64748B',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 6,
  },
  errorDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  dashboardCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0F172A',
    borderRadius: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  metricValueHighlight: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2563EB',
  },
  sectionHeader: {
    marginBottom: 10,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  membersList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 6,
    marginBottom: 20,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  memberAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  meBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  meBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#2563EB',
  },
  memberRole: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  workingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  workingBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  taskHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  contentPill: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  contentPillText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  taskMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  taskAssignee: {
    fontSize: 12,
    color: '#64748B',
  },
  taskDueDate: {
    fontSize: 11,
    color: '#94A3B8',
  },
  taskProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  taskProgressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  taskProgressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  taskProgressText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    width: 32,
    textAlign: 'right',
  },
  emptyBox: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    padding: 16,
  },
  activityFeed: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 20,
  },
  activityItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0F172A',
    marginTop: 6,
    marginRight: 12,
  },
  activityBody: {
    flex: 1,
  },
  activityTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  activityTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
    paddingRight: 8,
  },
  activityTime: {
    fontSize: 11,
    color: '#94A3B8',
  },
  activityDetails: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
});

