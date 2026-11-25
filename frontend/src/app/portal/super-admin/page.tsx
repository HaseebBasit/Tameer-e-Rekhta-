"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { API_BASE } from "@/lib/api";
import {
  Users,
  Building2,
  CheckSquare,
  ShieldCheck,
  FileText,
  Plus,
  RefreshCw,
  Search,
  Filter,
  UserCheck,
  UserX,
  AlertCircle,
  Eye,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  FolderOpen,
  Copy,
  Link2,
  KeyRound,
  Calendar,
  XCircle,
  Check,
  X,
  FileCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface OverviewStats {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  activeTasksCount: number;
  pendingReviewCount: number;
  revisionCount: number;
  completedTasksCount: number;
  pendingApplicationsCount: number;
  assessmentsCount: number;
}

interface DepartmentDistribution {
  name: string;
  code: string;
  leadName: string;
  iconName: string;
  memberCount: number;
  activeTasks: number;
  completedTasks: number;
}

interface AuditLogItem {
  _id: string;
  actorName: string;
  actorRole: string;
  action: string;
  module: string;
  description: string;
  createdAt: string;
}

interface PortalUserItem {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  departmentCode?: string;
  designation?: string;
  status: string;
  isPrivilegedHR?: boolean;
  activationStatus?: string;
  activationExpires?: string | null;
  activationGeneratedAt?: string | null;
  activationRevokedAt?: string | null;
  memberships?: Array<{
    department: string;
    departmentCode?: string;
    role: string;
    designation?: string;
  }>;
}

interface AssessmentItem {
  _id: string;
  memberName: string;
  memberId: string;
  evaluatorName: string;
  evaluatorRole: string;
  department: string;
  period: string;
  totalScore: number;
  percentage: number;
  criteriaScores: {
    taskExecution: number;
    deliverableQuality: number;
    punctuality: number;
    teamCollaboration: number;
  };
  qualitativeFeedback: string;
  createdAt: string;
}

interface TaskItem {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  department: string;
  priority: string;
  status: string;
  assignedMemberName?: string;
  assignedTo?: string;
  dueDate?: string;
  completedAt?: string;
}

interface LeaveItem {
  _id?: string;
  id?: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  department: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  reviewedByName?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  createdAt: string;
}

function SuperAdminDashboardContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const activeTabParam = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState(activeTabParam);

  useEffect(() => {
    if (activeTabParam && activeTabParam !== activeTab) {
      setActiveTab(activeTabParam);
    }
  }, [activeTabParam, activeTab]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Activation Link Modal State
  const [generatedActivation, setGeneratedActivation] = useState<{
    url: string;
    expiresAt: string;
    userName: string;
    userEmail: string;
    role?: string;
    department?: string;
    designation?: string;
    status?: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Data states
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [departments, setDepartments] = useState<DepartmentDistribution[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [usersList, setUsersList] = useState<PortalUserItem[]>([]);
  const [assessmentsList, setAssessmentsList] = useState<AssessmentItem[]>([]);
  const [tasksList, setTasksList] = useState<TaskItem[]>([]);

  // Leave Management State
  const [leavesList, setLeavesList] = useState<LeaveItem[]>([]);
  const [leaveStats, setLeaveStats] = useState<{ total: number; pending: number; approved: number; rejected: number } | null>(null);
  const [leaveSubTab, setLeaveSubTab] = useState<"all" | "pending" | "approved" | "rejected" | "history">("all");
  const [leaveDeptFilter, setLeaveDeptFilter] = useState("");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("");
  const [leaveSearch, setLeaveSearch] = useState("");
  const [selectedLeaveForReview, setSelectedLeaveForReview] = useState<LeaveItem | null>(null);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject">("approve");
  const [reviewNotes, setReviewNotes] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Filter states
  const [userRoleFilter, setUserRoleFilter] = useState("");
  const [userDeptFilter, setUserDeptFilter] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [taskStatusFilter, setTaskStatusFilter] = useState("");

  // Modals
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // New user form state
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState("member");
  const [newUserDept, setNewUserDept] = useState("");
  const [newUserDesignation, setNewUserDesignation] = useState("");

  // Phase 10B: Activation link management state
  const [userSubView, setUserSubView] = useState<"all" | "activation">("all");
  const [bulkActivations, setBulkActivations] = useState<Array<{
    userId: string;
    name: string;
    email: string;
    department: string;
    role: string;
    designation?: string;
    activationUrl: string;
    expiresAt: string;
  }> | null>(null);
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [copiedBulkId, setCopiedBulkId] = useState<string | null>(null);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskDept, setNewTaskDept] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("medium");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_BASE}/super-admin/overview`, {
        credentials: "include",
        headers: { "X-Requested-With": "XMLHttpRequest" },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
          setDepartments(data.departmentDistribution || []);
          setAuditLogs(data.recentAuditLogs || []);
        }
      } else if (res.status === 403) {
        setError("Access Restricted: Super Admin authorization required.");
      }
    } catch {
      setError("Unable to connect to the backend API.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/super-admin/users`, {
        credentials: "include",
        headers: { "X-Requested-With": "XMLHttpRequest" },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) setUsersList(data.users || []);
      }
    } catch {}
  }, []);

  const fetchAssessments = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/assessments`, {
        credentials: "include",
        headers: { "X-Requested-With": "XMLHttpRequest" },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) setAssessmentsList(data.assessments || []);
      }
    } catch {}
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        credentials: "include",
        headers: { "X-Requested-With": "XMLHttpRequest" },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) setTasksList(data.tasks || []);
      }
    } catch {}
  }, []);

  const fetchLeaves = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/super-admin/leaves`, {
        credentials: "include",
        headers: { "X-Requested-With": "XMLHttpRequest" },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const fetchedLeaves: LeaveItem[] = data.leaves || [];
          setLeavesList(fetchedLeaves);
          if (data.stats) {
            setLeaveStats(data.stats);
          } else {
            const total = fetchedLeaves.length;
            const pending = fetchedLeaves.filter((l) => ["pending", "submitted", "dept_approved"].includes(l.status)).length;
            const approved = fetchedLeaves.filter((l) => ["approved", "hr_approved"].includes(l.status)).length;
            const rejected = fetchedLeaves.filter((l) => ["rejected", "dept_rejected", "hr_rejected"].includes(l.status)).length;
            setLeaveStats({ total, pending, approved, rejected });
          }
        }
      } else {
        const hrRes = await fetch(`${API_BASE}/hr/leaves`, {
          credentials: "include",
          headers: { "X-Requested-With": "XMLHttpRequest" },
        });
        if (hrRes.ok) {
          const hrData = await hrRes.json();
          if (hrData.success) {
            const fetchedLeaves: LeaveItem[] = hrData.leaves || [];
            setLeavesList(fetchedLeaves);
            const total = fetchedLeaves.length;
            const pending = fetchedLeaves.filter((l) => ["pending", "submitted", "dept_approved"].includes(l.status)).length;
            const approved = fetchedLeaves.filter((l) => ["approved", "hr_approved"].includes(l.status)).length;
            const rejected = fetchedLeaves.filter((l) => ["rejected", "dept_rejected", "hr_rejected"].includes(l.status)).length;
            setLeaveStats({ total, pending, approved, rejected });
          }
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchOverview();
    fetchUsers();
    fetchAssessments();
    fetchTasks();
    fetchLeaves();
  }, [fetchOverview, fetchUsers, fetchAssessments, fetchTasks, fetchLeaves]);

  const handleReviewLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeaveForReview) return;
    const leaveId = selectedLeaveForReview._id || selectedLeaveForReview.id;
    try {
      setSubmittingReview(true);
      let success = false;
      const res = await fetch(`${API_BASE}/super-admin/leaves/${leaveId}/review`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({ action: reviewAction, notes: reviewNotes }),
      });
      if (res.ok) {
        success = true;
      } else {
        const hrRes = await fetch(`${API_BASE}/hr/leaves/${leaveId}/review`, {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
          body: JSON.stringify({ action: reviewAction, notes: reviewNotes }),
        });
        if (hrRes.ok) success = true;
      }

      if (success) {
        setActionSuccess(`Leave request successfully ${reviewAction === "approve" ? "Approved" : "Rejected"}.`);
        setSelectedLeaveForReview(null);
        setReviewNotes("");
        fetchLeaves();
        setTimeout(() => setActionSuccess(null), 4000);
      } else {
        alert("Failed to review leave request.");
      }
    } catch {
      alert("Network error while reviewing leave request.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "active" ? "suspended" : "active";
    if (!confirm(`Are you sure you want to change user status to '${nextStatus}'?`)) return;

    try {
      const res = await fetch(`${API_BASE}/super-admin/users/${userId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setActionSuccess(`User status successfully changed to '${nextStatus}'.`);
        fetchUsers();
        fetchOverview();
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch {
      alert("Failed to update user status.");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/super-admin/users`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          role: newUserRole,
          department: newUserDept,
          designation: newUserDesignation,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setShowCreateUserModal(false);
        const actUrl = data.activationUrl || data.activation?.url;
        if (actUrl) {
          setGeneratedActivation({
            url: actUrl,
            expiresAt: data.activation?.expiresAt || data.expiresAt || new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
            userName: data.user?.name || newUserName,
            userEmail: data.user?.email || newUserEmail,
            role: data.user?.role || newUserRole,
            department: data.user?.department || newUserDept,
            designation: data.user?.designation || newUserDesignation,
            status: "Pending Activation",
          });
        }
        setActionSuccess(`User '${newUserName}' created successfully! Activation link generated.`);
        setNewUserName("");
        setNewUserEmail("");
        setNewUserDesignation("");
        fetchUsers();
        fetchOverview();
        setTimeout(() => setActionSuccess(null), 5000);
      } else {
        alert(data.error || "Failed to create user.");
      }
    } catch {
      alert("Network error while creating user.");
    }
  };

  const handleRegenerateActivation = async (userId: string, userName: string, userEmail: string) => {
    try {
      const res = await fetch(`${API_BASE}/super-admin/users/${userId}/regenerate-activation`, {
        method: "POST",
        credentials: "include",
        headers: { "X-Requested-With": "XMLHttpRequest" },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const actUrl = data.activationUrl || data.activation?.url;
        const targetUser = usersList.find((u) => u.id === userId || u._id === userId);
        setGeneratedActivation({
          url: actUrl,
          expiresAt: data.activation?.expiresAt || data.expiresAt || new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
          userName,
          userEmail,
          role: targetUser?.role || "member",
          department: targetUser?.department || "General",
          designation: targetUser?.designation || "Staff",
          status: "Pending Activation",
        });
        setActionSuccess(`New activation link generated for ${userName} (valid for 7 days).`);
        setTimeout(() => setActionSuccess(null), 5000);
      } else {
        alert(data.error || "Failed to regenerate activation link.");
      }
    } catch {
      alert("Network error while regenerating activation link.");
    }
  };

  const copyActivationLink = (url: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handleRevokeActivation = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to revoke the active activation link for ${userName}? The existing link will immediately stop working.`)) return;
    try {
      const res = await fetch(`${API_BASE}/super-admin/users/${userId}/revoke-activation`, {
        method: "POST",
        credentials: "include",
        headers: { "X-Requested-With": "XMLHttpRequest" },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess(`Activation link revoked for ${userName}.`);
        fetchUsers();
        setTimeout(() => setActionSuccess(null), 4000);
      } else {
        alert(data.error || "Failed to revoke activation link.");
      }
    } catch {
      alert("Network error while revoking activation link.");
    }
  };

  const handleBulkGenerateActivations = async () => {
    setBulkGenerating(true);
    try {
      const res = await fetch(`${API_BASE}/super-admin/users/bulk-generate-activations`, {
        method: "POST",
        credentials: "include",
        headers: { "X-Requested-With": "XMLHttpRequest" },
      });
      const data = await res.json();
      setBulkGenerating(false);
      if (res.ok && data.success) {
        setBulkActivations(data.links || []);
        fetchUsers();
        setActionSuccess(`Generated ${data.count} single-use activation links! You can copy them individually below.`);
      } else {
        alert(data.error || "Failed to bulk generate activation links.");
      }
    } catch {
      setBulkGenerating(false);
      alert("Network error during bulk activation link generation.");
    }
  };

  const copyIndividualBulkLink = (userId: string, url: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedBulkId(userId);
      setTimeout(() => setCopiedBulkId(null), 2500);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDesc,
          department: newTaskDept,
          priority: newTaskPriority,
          dueDate: newTaskDueDate || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setShowCreateTaskModal(false);
        setActionSuccess(`Task '${newTaskTitle}' created for ${newTaskDept}!`);
        setNewTaskTitle("");
        setNewTaskDesc("");
        fetchTasks();
        fetchOverview();
        setTimeout(() => setActionSuccess(null), 4000);
      } else {
        alert(data.error || "Failed to create task.");
      }
    } catch {
      alert("Network error while creating task.");
    }
  };

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-4">
        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
        <div>
          <h3 className="font-bold text-sm">Access Notice</h3>
          <p className="text-xs mt-1">{error}</p>
        </div>
      </div>
    );
  }

  // Filtered Users
  const filteredUsers = usersList.filter((u) => {
    if (userRoleFilter && u.role !== userRoleFilter) return false;
    if (userDeptFilter && u.department !== userDeptFilter) return false;
    if (userSearch) {
      const q = userSearch.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    }
    return true;
  });

  // Filtered Tasks
  const filteredTasks = tasksList.filter((t) => {
    if (taskStatusFilter && t.status !== taskStatusFilter) return false;
    return true;
  });

  // Filtered Leaves (Super Admin Leave Management)
  const filteredLeaves = leavesList.filter((l) => {
    if (leaveSubTab === "pending" && !["pending", "submitted", "dept_approved"].includes(l.status)) return false;
    if (leaveSubTab === "approved" && !["approved", "hr_approved"].includes(l.status)) return false;
    if (leaveSubTab === "rejected" && !["rejected", "dept_rejected", "hr_rejected"].includes(l.status)) return false;
    if (leaveSubTab === "history" && !["approved", "hr_approved", "rejected", "dept_rejected", "hr_rejected"].includes(l.status)) return false;

    if (leaveDeptFilter && l.department !== leaveDeptFilter) return false;
    if (leaveTypeFilter && l.leaveType !== leaveTypeFilter) return false;
    if (leaveSearch) {
      const q = leaveSearch.toLowerCase();
      const nameMatch = l.memberName?.toLowerCase().includes(q);
      const emailMatch = l.memberEmail?.toLowerCase().includes(q);
      const reasonMatch = l.reason?.toLowerCase().includes(q);
      const deptMatch = l.department?.toLowerCase().includes(q);
      if (!nameMatch && !emailMatch && !reasonMatch && !deptMatch) return false;
    }
    return true;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Executive Command Header */}
      <div className="bg-[#17243A] text-white rounded-2xl p-5 sm:p-7 shadow-rekhta flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-[#233550]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-urdu text-lg sm:text-xl text-[#D7A84B] font-bold">
              صدارتی دیوان
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#800F35] text-white font-medium border border-[#9F1239]">
              Founder & President
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Executive Command Overview
          </h1>
          <p className="text-xs text-slate-300 max-w-xl">
            Central executive oversight governing all departmental divisions, confidential grading, HR privileges, and organizational tasks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-stretch sm:self-auto shrink-0">
          <button
            onClick={() => {
              fetchOverview();
              fetchUsers();
              fetchAssessments();
              fetchTasks();
              fetchLeaves();
            }}
            disabled={loading}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg border border-white/20 transition active:scale-95 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateUserModal(true)}
            className="px-4 py-2 bg-[#D7A84B] hover:bg-[#C2943A] text-[#17243A] text-xs font-bold rounded-lg shadow-sm transition active:scale-95 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Member
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-semibold">{actionSuccess}</span>
        </div>
      )}

      {/* 1. KPI Statistics Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Members */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Members
            </span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#17243A]">
              {loading ? "..." : (stats?.totalMembers ?? 0)}
            </span>
            <span className="text-xs text-emerald-600 font-semibold flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> {stats?.activeMembers ?? 0} Active
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {stats?.inactiveMembers ?? 0} inactive accounts
          </p>
        </div>

        {/* Active Tasks */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Active Tasks
            </span>
            <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center text-[#800F35]">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#17243A]">
              {loading ? "..." : (stats?.activeTasksCount ?? 0)}
            </span>
            <span className="text-xs text-[#800F35] font-semibold">
              {stats?.pendingReviewCount ?? 0} Under Review
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {stats?.completedTasksCount ?? 0} completed deliverables
          </p>
        </div>

        {/* Confidential Assessments */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Confidential Grading
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#17243A]">
              {loading ? "..." : (stats?.assessmentsCount ?? 0)}
            </span>
            <span className="text-xs text-amber-600 font-semibold">
              Evaluations
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Scores strictly confidential to Super Admin
          </p>
        </div>

        {/* Active Departments */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Active Divisions
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#17243A]">{departments.length > 0 ? `${departments.length} Departments` : "6 Departments"}</span>
            <span className="text-xs text-emerald-600 font-semibold">Configured</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {departments.length > 0 ? departments.map((d) => d.name).join(", ") : "Literature, Content Creation, Outreach & Marketing, Media, HR, Welfare"}
          </p>
        </div>
      </div>

      {/* 2. Sub-Section: Tab Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 overflow-x-auto pb-1 text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab("overview");
              window.history.replaceState(null, "", "/portal/super-admin");
            }}
            className={`pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === "overview"
                ? "border-[#800F35] text-[#800F35]"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Department Workspaces
          </button>

          <button
            onClick={() => {
              setActiveTab("users");
              window.history.replaceState(null, "", "/portal/super-admin?tab=users");
            }}
            className={`pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === "users"
                ? "border-[#800F35] text-[#800F35]"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            User Management ({usersList.length})
          </button>

          <button
            onClick={() => {
              setActiveTab("tasks");
              window.history.replaceState(null, "", "/portal/super-admin?tab=tasks");
            }}
            className={`pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === "tasks"
                ? "border-[#800F35] text-[#800F35]"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Organization Tasks ({tasksList.length})
          </button>

          <button
            onClick={() => {
              setActiveTab("leaves");
              window.history.replaceState(null, "", "/portal/super-admin?tab=leaves");
            }}
            className={`pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === "leaves"
                ? "border-[#800F35] text-[#800F35]"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Leave Management ({leavesList.length})
          </button>

          <button
            onClick={() => {
              setActiveTab("assessments");
              window.history.replaceState(null, "", "/portal/super-admin?tab=assessments");
            }}
            className={`pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === "assessments"
                ? "border-[#800F35] text-[#800F35]"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Confidential Grading Archive ({assessmentsList.length})
          </button>

          <button
            onClick={() => {
              setActiveTab("audit");
              window.history.replaceState(null, "", "/portal/super-admin?tab=audit");
            }}
            className={`pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === "audit"
                ? "border-[#800F35] text-[#800F35]"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Audit Logs
          </button>
        </nav>
      </div>

      {/* TAB CONTENT 1: OVERVIEW / DEPARTMENT WORKSPACES */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-heading text-brand-pitch">Department Breakdown</h2>
            <span className="text-2xs text-gray-500">Live Scoped Workspaces</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {departments.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-gray-50/60 rounded-2xl border border-dashed border-gray-200">
                <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-600">No departments configured yet.</p>
                <p className="text-xs text-gray-400 mt-1">Departments will appear here once officially configured.</p>
              </div>
            ) : (
              departments.map((dept) => (
                <div
                  key={dept.code}
                  className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:border-brand-emerald/40 transition-all"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-brand-mint/50 text-brand-pitch font-bold text-xs">
                        {dept.code}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-brand-pitch">{dept.name}</h3>
                        <p className="text-2xs text-gray-500">Lead: {dept.leadName}</p>
                      </div>
                    </div>
                    <span className="text-2xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                      Active
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-4 text-center">
                    <div className="bg-gray-50 p-2.5 rounded-xl">
                      <span className="text-xs font-bold text-brand-pitch block">{dept.memberCount}</span>
                      <span className="text-2xs text-gray-500 block">Members</span>
                    </div>
                    <div className="bg-gray-50 p-2.5 rounded-xl">
                      <span className="text-xs font-bold text-blue-700 block">{dept.activeTasks}</span>
                      <span className="text-2xs text-gray-500 block">In Progress</span>
                    </div>
                    <div className="bg-gray-50 p-2.5 rounded-xl">
                      <span className="text-xs font-bold text-emerald-700 block">{dept.completedTasks}</span>
                      <span className="text-2xs text-gray-500 block">Done</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setActiveTab("tasks");
                        window.history.replaceState(null, "", "/portal/super-admin?tab=tasks");
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-brand-emerald bg-brand-mint/30 hover:bg-brand-mint/60 transition-colors"
                    >
                      View Department Tasks
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Recent Audit Activity Snapshot */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
            <h3 className="text-sm font-bold font-heading text-brand-pitch mb-4">Recent Organizational Activity</h3>
            {auditLogs.length === 0 ? (
              <p className="text-xs text-gray-500 py-4 text-center">No audit records recorded yet.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {auditLogs.slice(0, 5).map((log) => (
                  <div key={log._id} className="py-3 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold text-brand-pitch">{log.description}</p>
                      <div className="flex items-center gap-2 mt-1 text-2xs text-gray-500">
                        <span className="font-bold text-brand-emerald">{log.actorName}</span>
                        <span>({log.actorRole})</span>
                        <span>•</span>
                        <span>{log.module}</span>
                      </div>
                    </div>
                    <span className="text-2xs text-gray-400 shrink-0 font-mono">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: USER MANAGEMENT */}
      {activeTab === "users" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold font-heading text-brand-pitch">System User Directory</h2>
              <p className="text-xs text-gray-500">Manage user accounts, privileges, designations, and account activation</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setUserSubView("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  userSubView === "all"
                    ? "bg-brand-pitch text-white shadow-xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All Accounts ({usersList.length})
              </button>
              <button
                type="button"
                onClick={() => setUserSubView("activation")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  userSubView === "activation"
                    ? "bg-[#800F35] text-white shadow-xs"
                    : "bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100"
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                Activation Dashboard ({usersList.filter((u) => u.status === "inactive" || u.activationStatus === "pending").length})
              </button>
            </div>
          </div>

          {userSubView === "all" ? (
            <>
              <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-emerald w-56 bg-white"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="px-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none text-gray-600 bg-white"
                  >
                    <option value="">All Roles</option>
                    <option value="super_admin">Super Admin</option>
                    <option value="dept_literature">Dept Literature</option>
                    <option value="dept_media">Dept Media</option>
                    <option value="dept_marketing">Dept Marketing</option>
                    <option value="dept_outreach">Dept Outreach</option>
                    <option value="dept_oam">Dept Outreach & Marketing</option>
                    <option value="dept_content">Dept Content</option>
                    <option value="dept_welfare">Dept Welfare</option>
                    <option value="hr">HR</option>
                    <option value="finance">Finance</option>
                    <option value="member">Member</option>
                  </select>

                  <select
                    value={userDeptFilter}
                    onChange={(e) => setUserDeptFilter(e.target.value)}
                    className="px-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none text-gray-600 bg-white"
                  >
                    <option value="">All Departments</option>
                    {departments.map((d) => (
                      <option key={d.code} value={d.name}>{d.name}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => setShowCreateUserModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-brand-emerald text-white text-xs font-semibold hover:bg-brand-pitch transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Member
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50/75 border-b border-gray-100 text-gray-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Department & Designation</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-400">
                          No users match the search filters.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.id || u._id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-gray-900">{u.name}</div>
                            <div className="text-2xs text-gray-400 font-mono">{u.email}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-2xs font-semibold bg-gray-100 text-gray-800">
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            <div>{u.department || "General"}</div>
                            {u.designation && (
                              <div className="text-2xs text-brand-emerald font-medium capitalize">
                                {u.designation.replace(/_/g, " ")}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-2xs font-semibold uppercase ${
                                u.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : u.status === "pending" || u.status === "inactive"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {u.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-2">
                            {/* Super Admin accounts are immutable to activation regeneration or suspension */}
                            {u.role !== "super_admin" && (
                              <>
                                {/* Regenerate Activation Link */}
                                <button
                                  type="button"
                                  onClick={() => handleRegenerateActivation(u.id || u._id || "", u.name, u.email)}
                                  title="Generate new activation link"
                                  className="px-2 py-1 text-2xs font-medium rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 inline-flex items-center gap-1 transition"
                                >
                                  <KeyRound className="w-3 h-3 text-[#800F35]" />
                                  Link
                                </button>

                                <button
                                  onClick={() => handleToggleUserStatus(u.id || u._id || "", u.status)}
                                  className={`px-2.5 py-1 text-2xs font-semibold rounded-lg transition-colors ${
                                    u.status === "active"
                                      ? "bg-red-50 text-red-600 hover:bg-red-100"
                                      : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                  }`}
                                >
                                  {u.status === "active" ? "Suspend" : "Activate"}
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="p-5 space-y-5">
              {/* Stats Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="text-2xs text-gray-500 font-medium">Inactive Accounts</div>
                  <div className="text-lg font-bold text-gray-900 mt-0.5">
                    {usersList.filter((u) => u.status === "inactive").length}
                  </div>
                </div>
                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
                  <div className="text-2xs text-amber-800 font-medium">Pending Activation</div>
                  <div className="text-lg font-bold text-amber-900 mt-0.5">
                    {usersList.filter((u) => u.activationStatus === "pending").length}
                  </div>
                </div>
                <div className="p-3 bg-red-50/60 rounded-xl border border-red-100">
                  <div className="text-2xs text-red-800 font-medium">Expired Links</div>
                  <div className="text-lg font-bold text-red-900 mt-0.5">
                    {usersList.filter((u) => u.activationStatus === "expired").length}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-2xs text-slate-600 font-medium">Revoked Links</div>
                  <div className="text-lg font-bold text-slate-800 mt-0.5">
                    {usersList.filter((u) => u.activationStatus === "revoked").length}
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50/40 rounded-xl border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#800F35]" />
                    Manual Link Distribution Policy
                  </h3>
                  <p className="text-2xs text-amber-800 mt-0.5">
                    Automatic email and SMS delivery is strictly disabled. The Super Admin manually copies and distributes each link.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleBulkGenerateActivations}
                  disabled={bulkGenerating}
                  className="px-3.5 py-2 bg-[#800F35] hover:bg-[#6A0C2B] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${bulkGenerating ? "animate-spin" : ""}`} />
                  {bulkGenerating ? "Generating Links..." : "Bulk Generate Activation Links"}
                </button>
              </div>

              {/* Activation Table */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-2.5 px-3.5">Account</th>
                      <th className="py-2.5 px-3.5">Department & Designations</th>
                      <th className="py-2.5 px-3.5">Link Status</th>
                      <th className="py-2.5 px-3.5">Generated</th>
                      <th className="py-2.5 px-3.5">Expires</th>
                      <th className="py-2.5 px-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {usersList.filter((u) => u.role !== "super_admin" && (u.status === "inactive" || u.activationStatus === "pending")).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-400">
                          All organizational accounts are active. No pending activations.
                        </td>
                      </tr>
                    ) : (
                      usersList
                        .filter((u) => u.role !== "super_admin" && (u.status === "inactive" || u.activationStatus === "pending"))
                        .map((u) => (
                          <tr key={u.id || u._id} className="hover:bg-gray-50/60 transition-colors">
                            <td className="py-3 px-3.5">
                              <div className="font-semibold text-gray-900">{u.name}</div>
                              <div className="text-2xs text-gray-500 font-mono">{u.email}</div>
                            </td>
                            <td className="py-3 px-3.5 text-gray-600">
                              <div className="font-medium text-gray-800">{u.department || "General"}</div>
                              {u.designation && (
                                <div className="text-2xs text-brand-emerald capitalize">
                                  {u.designation.replace(/_/g, " ")}
                                </div>
                              )}
                              {u.memberships && u.memberships.length > 0 && (
                                <div className="text-2xs text-gray-400 mt-0.5">
                                  +{u.memberships.length} additional membership(s)
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-3.5">
                              <span
                                className={`px-2 py-0.5 rounded-full text-2xs font-semibold uppercase ${
                                  u.activationStatus === "pending"
                                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                                    : u.activationStatus === "expired"
                                    ? "bg-red-100 text-red-800 border border-red-200"
                                    : u.activationStatus === "revoked"
                                    ? "bg-slate-100 text-slate-700 border border-slate-200"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {u.activationStatus || "None"}
                              </span>
                            </td>
                            <td className="py-3 px-3.5 text-2xs text-gray-500">
                              {u.activationGeneratedAt
                                ? new Date(u.activationGeneratedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                                : "—"}
                            </td>
                            <td className="py-3 px-3.5 text-2xs text-gray-500">
                              {u.activationExpires
                                ? new Date(u.activationExpires).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                                : "—"}
                            </td>
                            <td className="py-3 px-3.5 text-right space-x-1.5">
                              <button
                                type="button"
                                onClick={() => handleRegenerateActivation(u.id || u._id || "", u.name, u.email)}
                                className="px-2.5 py-1 text-2xs font-semibold rounded-lg bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition inline-flex items-center gap-1"
                              >
                                <RefreshCw className="w-3 h-3 text-[#800F35]" />
                                Regenerate
                              </button>
                              {u.activationStatus === "pending" && (
                                <button
                                  type="button"
                                  onClick={() => handleRevokeActivation(u.id || u._id || "", u.name)}
                                  className="px-2.5 py-1 text-2xs font-semibold rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition inline-flex items-center gap-1"
                                >
                                  <XCircle className="w-3 h-3" />
                                  Revoke
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 3: TASKS */}
      {activeTab === "tasks" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold font-heading text-brand-pitch">Organization Milestone Tasks</h2>
              <p className="text-xs text-gray-500">Cross-departmental task assignments and deliverables</p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={taskStatusFilter}
                onChange={(e) => setTaskStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none text-gray-600"
              >
                <option value="">All Statuses</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="revision_requested">Revision Requested</option>
                <option value="completed">Completed</option>
              </select>

              <button
                onClick={() => setShowCreateTaskModal(true)}
                className="px-3 py-1.5 rounded-xl bg-brand-emerald text-white text-xs font-semibold hover:bg-brand-pitch transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                New Task
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/75 border-b border-gray-100 text-gray-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Assigned To</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      No tasks found.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((t) => (
                    <tr key={t.id || t._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-gray-900">{t.title}</td>
                      <td className="py-3 px-4 text-gray-700">{t.department}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-2xs font-semibold uppercase ${
                            t.priority === "urgent"
                              ? "bg-red-100 text-red-800"
                              : t.priority === "high"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {t.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{t.assignedMemberName || "Unassigned"}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700">
                          {t.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                        {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "No deadline"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: LEAVE MANAGEMENT (Phase D.2.2.6 Full Parity) */}
      {activeTab === "leaves" && (
        <div className="space-y-6">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-heading text-[#17243A]">
                  Organization-Wide Leave & Absence Governance
                </h2>
                <span className="text-xs font-serif text-[#D7A84B] font-bold">تعمیرِ ریختہ</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Executive oversight of all departmental leave applications, endorsements, and absence records with presidential approval authority
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1 rounded-full font-medium bg-amber-100 text-amber-800 border border-amber-200">
                {leavesList.filter((l) => ["pending", "submitted", "dept_approved"].includes(l.status)).length} Awaiting Executive Review
              </span>
            </div>
          </div>

          {/* 4 Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Total Requests
                </span>
                <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#17243A]">
                  {leaveStats?.total ?? leavesList.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Across all 6 creative divisions</p>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Pending Review
                </span>
                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#17243A]">
                  {leaveStats?.pending ?? leavesList.filter((l) => ["pending", "submitted", "dept_approved"].includes(l.status)).length}
                </span>
                <span className="text-xs text-amber-600 font-semibold">Active Queue</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Awaiting executive or lead action</p>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Approved Leaves
                </span>
                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-emerald-700">
                  {leaveStats?.approved ?? leavesList.filter((l) => ["approved", "hr_approved"].includes(l.status)).length}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Authorized absence records</p>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Rejected Leaves
                </span>
                <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                  <XCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-rose-700">
                  {leaveStats?.rejected ?? leavesList.filter((l) => ["rejected", "dept_rejected", "hr_rejected"].includes(l.status)).length}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Declined absence submissions</p>
            </div>
          </div>

          {/* Sub-Tabs Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setLeaveSubTab("all")}
                className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition ${
                  leaveSubTab === "all"
                    ? "border-[#800F35] text-[#800F35]"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                All Requests ({leavesList.length})
              </button>
              <button
                type="button"
                onClick={() => setLeaveSubTab("pending")}
                className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition ${
                  leaveSubTab === "pending"
                    ? "border-[#800F35] text-[#800F35]"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                Pending ({leavesList.filter((l) => ["pending", "submitted", "dept_approved"].includes(l.status)).length})
              </button>
              <button
                type="button"
                onClick={() => setLeaveSubTab("approved")}
                className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition ${
                  leaveSubTab === "approved"
                    ? "border-[#800F35] text-[#800F35]"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                Approved ({leavesList.filter((l) => ["approved", "hr_approved"].includes(l.status)).length})
              </button>
              <button
                type="button"
                onClick={() => setLeaveSubTab("rejected")}
                className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition ${
                  leaveSubTab === "rejected"
                    ? "border-[#800F35] text-[#800F35]"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                Rejected ({leavesList.filter((l) => ["rejected", "dept_rejected", "hr_rejected"].includes(l.status)).length})
              </button>
              <button
                type="button"
                onClick={() => setLeaveSubTab("history")}
                className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition ${
                  leaveSubTab === "history"
                    ? "border-[#800F35] text-[#800F35]"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                History Archive ({leavesList.filter((l) => ["approved", "hr_approved", "rejected", "dept_rejected", "hr_rejected"].includes(l.status)).length})
              </button>
            </nav>
          </div>

          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by employee name, email, or reason..."
                value={leaveSearch}
                onChange={(e) => setLeaveSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-[#800F35]"
              />
            </div>

            <div className="w-full sm:w-48">
              <select
                value={leaveDeptFilter}
                onChange={(e) => setLeaveDeptFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-[#800F35]"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.code} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="w-full sm:w-40">
              <select
                value={leaveTypeFilter}
                onChange={(e) => setLeaveTypeFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-[#800F35]"
              >
                <option value="">All Leave Types</option>
                <option value="Sick">Sick Leave</option>
                <option value="Exam">Academic / Exam</option>
                <option value="Personal">Personal Leave</option>
                <option value="Emergency">Emergency Leave</option>
              </select>
            </div>
          </div>

          {/* Leave Requests Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50/75 border-b border-gray-100 text-gray-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Applicant</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Dates & Duration</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Executive Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLeaves.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-400">
                        No leave applications match the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredLeaves.map((leave) => {
                      const isPending = ["pending", "submitted", "dept_approved"].includes(leave.status);
                      const start = new Date(leave.startDate);
                      const end = new Date(leave.endDate);
                      const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

                      return (
                        <tr key={leave._id || leave.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-slate-100 text-[#17243A] font-bold text-xs flex items-center justify-center border border-slate-200 shrink-0">
                                {leave.memberName ? leave.memberName.charAt(0).toUpperCase() : "M"}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{leave.memberName}</p>
                                <p className="text-[11px] text-gray-400">{leave.memberEmail}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-gray-700 font-medium">
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                              {leave.department}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              leave.leaveType === "Sick"
                                ? "bg-blue-100 text-blue-800"
                                : leave.leaveType === "Exam"
                                ? "bg-purple-100 text-purple-800"
                                : leave.leaveType === "Emergency"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-amber-100 text-amber-800"
                            }`}>
                              {leave.leaveType}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-gray-600">
                            <div>
                              <span>{start.toLocaleDateString()} – {end.toLocaleDateString()}</span>
                              <span className="block text-[11px] text-gray-400">{days} {days === 1 ? 'day' : 'days'} total</span>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-gray-700 max-w-xs truncate" title={leave.reason}>
                            {leave.reason}
                          </td>

                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              ["approved", "hr_approved"].includes(leave.status)
                                ? "bg-emerald-100 text-emerald-800"
                                : ["rejected", "dept_rejected", "hr_rejected"].includes(leave.status)
                                ? "bg-rose-100 text-rose-800"
                                : "bg-amber-100 text-amber-800"
                            }`}>
                              {leave.status.replace(/_/g, " ")}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right">
                            {isPending ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedLeaveForReview(leave);
                                    setReviewAction("approve");
                                    setReviewNotes("Approved by Executive Command");
                                  }}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg shadow-2xs transition active:scale-95 flex items-center gap-1"
                                >
                                  <Check className="w-3 h-3" /> Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedLeaveForReview(leave);
                                    setReviewAction("reject");
                                    setReviewNotes("");
                                  }}
                                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg shadow-2xs transition active:scale-95 flex items-center gap-1"
                                >
                                  <X className="w-3 h-3" /> Reject
                                </button>
                              </div>
                            ) : (
                              <div className="text-right text-[11px] text-gray-500">
                                {leave.reviewedByName && (
                                  <span className="block font-medium">By: {leave.reviewedByName}</span>
                                )}
                                {leave.reviewedAt && (
                                  <span className="block text-gray-400">{new Date(leave.reviewedAt).toLocaleDateString()}</span>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: CONFIDENTIAL ASSESSMENTS */}
      {activeTab === "assessments" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-base font-bold font-heading text-brand-pitch">Confidential Performance Grading</h2>
            <p className="text-xs text-gray-500">
              Department lead evaluations submitted blindly. Scores and criteria are strictly restricted to Super Admin.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/75 border-b border-gray-100 text-gray-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Evaluator</th>
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Qualitative Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {assessmentsList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      No confidential evaluations archived yet.
                    </td>
                  </tr>
                ) : (
                  assessmentsList.map((a) => (
                    <tr key={a._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-gray-900">{a.memberName}</td>
                      <td className="py-3 px-4 text-gray-600">{a.department}</td>
                      <td className="py-3 px-4 text-gray-500">
                        {a.evaluatorName} ({a.evaluatorRole})
                      </td>
                      <td className="py-3 px-4 text-gray-500">{a.period}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-brand-emerald">{a.totalScore}/40</span>
                        <span className="text-2xs text-gray-400 ml-1">({a.percentage}%)</span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 max-w-xs truncate" title={a.qualitativeFeedback}>
                        {a.qualitativeFeedback || "No feedback"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 6: AUDIT LOGS */}
      {activeTab === "audit" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-base font-bold font-heading text-brand-pitch">Security Audit Trail</h2>
            <p className="text-xs text-gray-500">Immutable ledger of administrative, authentication, and task events</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/75 border-b border-gray-100 text-gray-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Module</th>
                  <th className="py-3 px-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono text-2xs">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      No audit records logged yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50/60">
                      <td className="py-2.5 px-4 text-gray-400">
                        {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString()}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-gray-900 font-sans">{log.actorName}</td>
                      <td className="py-2.5 px-4 text-gray-600">{log.actorRole}</td>
                      <td className="py-2.5 px-4">
                        <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-800 font-semibold">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-gray-500">{log.module}</td>
                      <td className="py-2.5 px-4 text-gray-700 font-sans text-xs">{log.description}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: SUPER ADMIN LEAVE REVIEW */}
      {selectedLeaveForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold font-heading text-[#17243A]">
              {reviewAction === "approve" ? "Approve Leave Request" : "Reject Leave Request"}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {reviewAction === "approve" ? "Authorize absence for" : "Decline leave application for"}{" "}
              <strong>{selectedLeaveForReview.memberName}</strong> ({selectedLeaveForReview.department})
            </p>

            <form onSubmit={handleReviewLeave} className="space-y-4 mt-5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <p><strong>Leave Type:</strong> {selectedLeaveForReview.leaveType}</p>
                <p><strong>Dates:</strong> {new Date(selectedLeaveForReview.startDate).toLocaleDateString()} to {new Date(selectedLeaveForReview.endDate).toLocaleDateString()}</p>
                <p><strong>Applicant Reason:</strong> {selectedLeaveForReview.reason}</p>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Executive Notes / Justification
                </label>
                <textarea
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder={reviewAction === "approve" ? "Approved under executive authority." : "Provide reason for rejection..."}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800F35]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedLeaveForReview(null)}
                  disabled={submittingReview}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className={`px-5 py-2 rounded-xl font-bold text-white shadow-xs transition active:scale-95 ${
                    reviewAction === "approve"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  {submittingReview ? "Processing..." : reviewAction === "approve" ? "Confirm Approval" : "Confirm Rejection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD USER */}
      {showCreateUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <h3 className="text-lg font-bold font-heading text-brand-pitch">Add New Team Member</h3>
            <p className="text-xs text-gray-500 mt-0.5">Register staff or department members with authorized roles</p>

            <form onSubmit={handleCreateUser} className="space-y-4 mt-5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Asad Umar"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-emerald"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="name@rekhta.org"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-emerald"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none"
                  >
                    <option value="member">Member</option>
                    <option value="dept_literature">Dept Literature</option>
                    <option value="dept_media">Dept Media</option>
                    <option value="dept_marketing">Dept Marketing</option>
                    <option value="dept_outreach">Dept Outreach</option>
                    <option value="dept_oam">Dept Outreach & Marketing</option>
                    <option value="dept_content">Dept Content</option>
                    <option value="dept_welfare">Dept Welfare</option>
                    <option value="hr">HR</option>
                    <option value="finance">Finance</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Department</label>
                  <select
                    value={newUserDept}
                    onChange={(e) => setNewUserDept(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none"
                  >
                    {departments.length === 0 ? (
                      <option value="">No departments configured</option>
                    ) : (
                      departments.map((d) => (
                        <option key={d.code} value={d.name}>
                          {d.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Designation</label>
                <input
                  type="text"
                  value={newUserDesignation}
                  onChange={(e) => setNewUserDesignation(e.target.value)}
                  placeholder="e.g. Video Editor / Content Lead"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-emerald text-white hover:bg-brand-pitch font-semibold shadow-xs"
                >
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD TASK */}
      {showCreateTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <h3 className="text-lg font-bold font-heading text-brand-pitch">Create Organization Task</h3>
            <p className="text-xs text-gray-500 mt-0.5">Assign deliverables to any department</p>

            <form onSubmit={handleCreateTask} className="space-y-4 mt-5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Finalize Video Edit for Gen-Z Ep 2"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-emerald"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Description / Brief</label>
                <textarea
                  rows={3}
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Provide instructions, assets, or expectations..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-emerald"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Target Department</label>
                  <select
                    value={newTaskDept}
                    onChange={(e) => setNewTaskDept(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none"
                  >
                    {departments.length === 0 ? (
                      <option value="">No departments configured</option>
                    ) : (
                      departments.map((d) => (
                        <option key={d.code} value={d.name}>
                          {d.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateTaskModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-emerald text-white hover:bg-brand-pitch font-semibold shadow-xs"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ACTIVATION LINK (Phase D.2.2.6 Full Parity) */}
      {generatedActivation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-[#17243A] mb-2 pb-3 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-heading text-gray-900">Account Activation Link</h3>
                <p className="text-xs text-gray-500">Official onboarding link for new account credentials</p>
              </div>
            </div>

            {/* Account Details Summary */}
            <div className="grid grid-cols-2 gap-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 mb-4 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Account Holder</span>
                <span className="font-semibold text-slate-900 truncate block">{generatedActivation.userName}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Email Address</span>
                <span className="font-semibold text-slate-900 truncate block">{generatedActivation.userEmail}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Technical Role</span>
                <span className="font-semibold text-[#800F35] block">{generatedActivation.role || "Member"}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Department / Designation</span>
                <span className="font-semibold text-slate-800 block">
                  {generatedActivation.department || "General"} {generatedActivation.designation ? `• ${generatedActivation.designation}` : ""}
                </span>
              </div>
              <div className="col-span-2 flex items-center justify-between pt-2 border-t border-slate-200">
                <span className="text-[11px] text-slate-500 font-medium">Account Status:</span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Pending Activation
                </span>
              </div>
            </div>

            {/* Activation URL & Copy Button */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-gray-700">Generated Activation URL</label>
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Valid for 7 Days
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={generatedActivation.url}
                  className="flex-1 bg-white px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono select-all focus:outline-none text-slate-700"
                />
                <button
                  type="button"
                  onClick={() => copyActivationLink(generatedActivation.url)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-xs active:scale-95 ${
                    copiedLink
                      ? "bg-emerald-600 text-white"
                      : "bg-[#800F35] hover:bg-[#6A0C2B] text-white"
                  }`}
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedLink ? "Copied!" : "Copy Activation Link"}
                </button>
              </div>
            </div>

            {/* Security Warning Notice */}
            <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-800 text-xs mb-5 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <div>
                <p className="font-bold text-amber-900">Single-Use Security Notice</p>
                <p className="mt-0.5 text-[11px] text-amber-700 leading-relaxed">
                  This activation link is cryptographically single-use. Once the recipient sets their account password, this link will immediately become invalid. Link expires on: <strong>{new Date(generatedActivation.expiresAt).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</strong>.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setGeneratedActivation(null)}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK ACTIVATION LINKS MODAL */}
      {bulkActivations && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-gray-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 rounded-xl text-[#800F35]">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Bulk Generated Activation Links ({bulkActivations.length})
                  </h3>
                  <p className="text-2xs text-gray-500">
                    Single-use links generated. Copy each link individually to share manually.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBulkActivations(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Warning Box */}
            <div className="p-3 my-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-2xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="font-bold">Zero Automatic Communication Guarantee</p>
                <p className="mt-0.5 text-amber-800">
                  No automated emails, SMS, or OTPs have been sent. These raw links are displayed exclusively in this session.
                  Once you close this window, raw tokens are never displayed again in plaintext.
                </p>
              </div>
            </div>

            {/* Links Table */}
            <div className="flex-1 overflow-y-auto border border-gray-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Recipient</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3">Expires</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bulkActivations.map((item) => (
                    <tr key={item.userId} className="hover:bg-gray-50/70">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-gray-900">{item.name}</div>
                        <div className="text-2xs text-gray-400 font-mono">{item.email}</div>
                      </td>
                      <td className="py-2.5 px-3 text-gray-600">
                        <div>{item.department || "General"}</div>
                        {item.designation && (
                          <div className="text-2xs text-brand-emerald capitalize">{item.designation.replace(/_/g, " ")}</div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-2xs text-gray-500">
                        {new Date(item.expiresAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => copyIndividualBulkLink(item.userId, item.activationUrl)}
                          className={`px-3 py-1 rounded-lg text-2xs font-bold transition flex items-center gap-1 ml-auto shadow-2xs ${
                            copiedBulkId === item.userId
                              ? "bg-emerald-600 text-white"
                              : "bg-[#800F35] hover:bg-[#6A0C2B] text-white"
                          }`}
                        >
                          <Copy className="w-3 h-3" />
                          {copiedBulkId === item.userId ? "Copied!" : "Copy Link"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setBulkActivations(null)}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs rounded-xl transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SuperAdminDashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-gray-500">Loading Super Admin Dashboard...</div>}>
      <SuperAdminDashboardContent />
    </Suspense>
  );
}
