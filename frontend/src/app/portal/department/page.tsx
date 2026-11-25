"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { API_BASE } from "@/lib/api";
import {
  CheckSquare,
  Users,
  ClipboardList,
  Sparkles,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Send,
  Eye,
  RotateCcw,
  ExternalLink,
  ShieldAlert,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface DepartmentMetrics {
  memberCount: number;
  activeTasks: number;
  awaitingReview: number;
  revisionRequested: number;
  completedTasks: number;
  totalTasks: number;
}

interface DeptMember {
  id: string;
  name: string;
  email: string;
  role: string;
  designation?: string;
  status: string;
}

interface TaskSubmissionDetails {
  notes?: string;
  links?: string[];
  submittedAt?: string;
}

interface TaskItem {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  department: string;
  priority: string;
  status: string;
  assignedTo?: string;
  assignedMemberName?: string;
  dueDate?: string;
  submissionDetails?: TaskSubmissionDetails;
  reviewDetails?: {
    feedback?: string;
    revisionNotes?: string;
  };
}

function DepartmentDashboardContent() {
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
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [metrics, setMetrics] = useState<DepartmentMetrics | null>(null);
  const [members, setMembers] = useState<DeptMember[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);

  // Task Creation Modal
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("medium");
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");

  // Review Task Modal
  const [selectedTaskForReview, setSelectedTaskForReview] = useState<TaskItem | null>(null);
  const [reviewAction, setReviewAction] = useState<"approve" | "request_revision">("approve");
  const [reviewFeedback, setReviewFeedback] = useState("");

  // Blind Assessment Form State
  const [assessmentCandidateId, setAssessmentCandidateId] = useState("");
  const [assessmentPeriod, setAssessmentPeriod] = useState("2026-Q4");
  const [scoreExecution, setScoreExecution] = useState(8);
  const [scoreQuality, setScoreQuality] = useState(8);
  const [scorePunctuality, setScorePunctuality] = useState(8);
  const [scoreCollab, setScoreCollab] = useState(8);
  const [assessmentFeedback, setAssessmentFeedback] = useState("");
  const [submittingAssessment, setSubmittingAssessment] = useState(false);

  // Department Leaves state
  const [deptLeaves, setDeptLeaves] = useState<any[]>([]);
  const [selectedDeptLeave, setSelectedDeptLeave] = useState<any | null>(null);
  const [deptLeaveAction, setDeptLeaveAction] = useState<"approve" | "reject">("approve");
  const [deptLeaveNotes, setDeptLeaveNotes] = useState("");

  // Identify department code or name
  const departmentName = user?.department || "Literature";

  const fetchDepartmentData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_BASE}/department/${encodeURIComponent(departmentName)}/overview`, {
        credentials: "include",
        headers: { "X-Requested-With": "XMLHttpRequest" },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setMetrics(data.metrics);
          setMembers(data.members || []);
          setTasks(data.tasks || []);
        }
      } else if (res.status === 403) {
        setError("Access Restricted: You are only authorized to view your own assigned department workspace.");
      }
    } catch {
      setError("Unable to connect to the department workspace service.");
    } finally {
      setLoading(false);
    }
  }, [departmentName]);

  const fetchDeptLeaves = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/hr/leaves/department`, {
        credentials: "include",
        headers: { "X-Requested-With": "XMLHttpRequest" },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setDeptLeaves(data.leaves || []);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchDepartmentData();
    fetchDeptLeaves();
  }, [fetchDepartmentData, fetchDeptLeaves]);

  // Handle Review Department Leave
  const handleReviewDeptLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeptLeave) return;
    const leaveId = selectedDeptLeave._id || selectedDeptLeave.id;
    try {
      const res = await fetch(`${API_BASE}/hr/leaves/${leaveId}/review`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({ action: deptLeaveAction, notes: deptLeaveNotes }),
      });
      if (res.ok) {
        setActionSuccess(`Leave request has been ${deptLeaveAction === "approve" ? "approved" : "rejected"}.`);
        setSelectedDeptLeave(null);
        setDeptLeaveNotes("");
        fetchDeptLeaves();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to review leave request.");
      }
    } catch {
      alert("Error reviewing leave request.");
    }
  };

  // Handle Create Task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const assignedMember = members.find((m) => m.id === newTaskAssignedTo);

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
          department: departmentName,
          priority: newTaskPriority,
          assignedTo: newTaskAssignedTo || undefined,
          assignedMemberName: assignedMember?.name,
          assignedMemberEmail: assignedMember?.email,
          dueDate: newTaskDueDate || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setShowCreateTaskModal(false);
        setActionSuccess(`Task '${newTaskTitle}' successfully created and assigned.`);
        setNewTaskTitle("");
        setNewTaskDesc("");
        setNewTaskAssignedTo("");
        fetchDepartmentData();
        setTimeout(() => setActionSuccess(null), 4000);
      } else {
        alert(data.error || "Failed to create task.");
      }
    } catch {
      alert("Network error while creating task.");
    }
  };

  // Handle Review Submission
  const handleReviewSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskForReview) return;
    const taskId = (selectedTaskForReview.id || selectedTaskForReview._id) as string;

    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}/review`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({
          action: reviewAction,
          feedback: reviewAction === "approve" ? reviewFeedback : undefined,
          revisionNotes: reviewAction === "request_revision" ? reviewFeedback : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSelectedTaskForReview(null);
        setReviewFeedback("");
        setActionSuccess(`Task review completed: ${reviewAction === "approve" ? "Approved" : "Revision Requested"}.`);
        fetchDepartmentData();
        setTimeout(() => setActionSuccess(null), 4000);
      } else {
        alert(data.error || "Failed to process task review.");
      }
    } catch {
      alert("Network error while submitting task review.");
    }
  };

  // Handle Blind Assessment Submission
  const handleSubmitAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assessmentCandidateId) {
      alert("Please select a department member to evaluate.");
      return;
    }

    const candidate = members.find((m) => m.id === assessmentCandidateId);
    setSubmittingAssessment(true);

    try {
      const res = await fetch(`${API_BASE}/assessments`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({
          memberId: assessmentCandidateId,
          memberName: candidate?.name || "Department Member",
          department: departmentName,
          period: assessmentPeriod,
          criteriaScores: {
            taskExecution: Number(scoreExecution),
            deliverableQuality: Number(scoreQuality),
            punctuality: Number(scorePunctuality),
            teamCollaboration: Number(scoreCollab),
          },
          qualitativeFeedback: assessmentFeedback,
        }),
      });

      const data = await res.json();
      setSubmittingAssessment(false);

      if (res.ok && data.success) {
        setActionSuccess("Blind evaluation submitted and recorded in confidential archive. Scores remain confidential to Super Admin.");
        setAssessmentCandidateId("");
        setAssessmentFeedback("");
        setTimeout(() => setActionSuccess(null), 5000);
      } else {
        alert(data.error || "Failed to submit assessment.");
      }
    } catch {
      setSubmittingAssessment(false);
      alert("Network error while submitting assessment.");
    }
  };

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-4">
        <ShieldAlert className="w-5 h-5 text-red-600 mt-0.5" />
        <div>
          <h3 className="font-bold text-sm">Department Scoping Restriction</h3>
          <p className="text-xs mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const submissionsToReview = tasks.filter((t) => ["submitted", "under_review", "review"].includes(t.status));

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Executive Command Header */}
      <div className="bg-[#17243A] text-white rounded-2xl p-5 sm:p-7 shadow-rekhta flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-[#233550]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-urdu text-lg sm:text-xl text-[#D7A84B] font-bold">
              شعبہ جاتی دیوان
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#800F35] text-white font-medium border border-[#9F1239]">
              {departmentName} Department
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            {departmentName} Workspace & Leadership
          </h1>
          <p className="text-xs text-slate-300 max-w-xl">
            Coordinate team deliverables, review submitted assignments, conduct blind performance assessments, and endorse departmental leave requests.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-stretch sm:self-auto shrink-0">
          <button
            onClick={fetchDepartmentData}
            disabled={loading}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg border border-white/20 transition active:scale-95 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateTaskModal(true)}
            className="px-4 py-2 bg-[#800F35] hover:bg-[#600B27] text-white text-xs font-semibold rounded-lg shadow-sm transition active:scale-95 flex items-center gap-1.5 border border-[#9F1239]"
          >
            <Plus className="w-3.5 h-3.5" />
            Assign Task
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-semibold">{actionSuccess}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Team Members</span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#17243A]">
              {metrics?.memberCount ?? members.length}
            </span>
            <span className="text-xs text-emerald-600 font-semibold">Assigned</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Active team contributors</p>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">In Progress</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#17243A]">
              {metrics?.activeTasks ?? 0}
            </span>
            <span className="text-xs text-blue-600 font-semibold">Active</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Ongoing tasks</p>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Awaiting Review</span>
            <div className="w-9 h-9 rounded-lg bg-rose-50 text-[#800F35] flex items-center justify-center font-bold">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#17243A]">
              {metrics?.awaitingReview ?? submissionsToReview.length}
            </span>
            <span className="text-xs text-[#800F35] font-semibold">Pending</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Submissions to review</p>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Completed</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#17243A]">
              {metrics?.completedTasks ?? 0}
            </span>
            <span className="text-xs text-emerald-600 font-semibold">Delivered</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Approved & delivered tasks</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 overflow-x-auto pb-1 text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab("overview");
              window.history.replaceState(null, "", "/portal/department");
            }}
            className={`pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === "overview"
                ? "border-[#800F35] text-[#800F35]"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Task Management ({tasks.length})
          </button>

          <button
            onClick={() => {
              setActiveTab("submissions");
              window.history.replaceState(null, "", "/portal/department?tab=submissions");
            }}
            className={`pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === "submissions"
                ? "border-[#800F35] text-[#800F35]"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            Review Submissions ({submissionsToReview.length})
          </button>

          <button
            onClick={() => {
              setActiveTab("members");
              window.history.replaceState(null, "", "/portal/department?tab=members");
            }}
            className={`pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === "members"
                ? "border-[#800F35] text-[#800F35]"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Team Members ({members.length})
          </button>

          <button
            onClick={() => {
              setActiveTab("assessment");
              window.history.replaceState(null, "", "/portal/department?tab=assessment");
            }}
            className={`pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === "assessment"
                ? "border-[#800F35] text-[#800F35]"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Blind Member Assessment
          </button>

          <button
            onClick={() => {
              setActiveTab("leaves");
              window.history.replaceState(null, "", "/portal/department?tab=leaves");
            }}
            className={`pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === "leaves"
                ? "border-[#800F35] text-[#800F35]"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Department Leaves ({deptLeaves.length})
          </button>
        </nav>
      </div>

      {/* TAB 1: TASK MANAGEMENT */}
      {activeTab === "overview" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-bold font-heading text-brand-pitch">Department Tasks</h2>
            <button
              onClick={() => setShowCreateTaskModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-emerald text-white hover:bg-brand-pitch"
            >
              <Plus className="w-3.5 h-3.5" />
              Assign Task
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/75 border-b border-gray-100 text-gray-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Task</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Assigned Member</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      No tasks assigned yet. Click &apos;Assign Task&apos; to delegate work to your team.
                    </td>
                  </tr>
                ) : (
                  tasks.map((t) => {
                    const isSubmitted = ["submitted", "under_review", "review"].includes(t.status);
                    return (
                      <tr key={t.id || t._id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-semibold text-gray-900 block">{t.title}</span>
                          {t.description && <span className="text-2xs text-gray-500 block truncate max-w-sm">{t.description}</span>}
                        </td>
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
                        <td className="py-3 px-4 text-gray-700">{t.assignedMemberName || "Unassigned"}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider ${
                              t.status === "completed" || t.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : isSubmitted
                                ? "bg-amber-100 text-amber-800"
                                : t.status === "revision_requested"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {t.status.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500">
                          {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—"}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {isSubmitted ? (
                            <button
                              onClick={() => setSelectedTaskForReview(t)}
                              className="px-2.5 py-1 rounded-lg text-2xs font-semibold bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors"
                            >
                              Review Submission
                            </button>
                          ) : (
                            <span className="text-2xs text-gray-400">—</span>
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
      )}

      {/* TAB 2: REVIEW SUBMISSIONS */}
      {activeTab === "submissions" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-base font-bold font-heading text-brand-pitch">Pending Work Submissions</h2>
            <p className="text-xs text-gray-500">Review deliverables submitted by team members and approve or request revisions</p>
          </div>

          <div className="p-5 space-y-4">
            {submissionsToReview.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs">
                No submissions are currently pending your review.
              </div>
            ) : (
              submissionsToReview.map((t) => (
                <div key={t.id || t._id} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900">{t.title}</span>
                      <span className="px-2 py-0.5 rounded-full text-2xs font-bold uppercase bg-amber-100 text-amber-800">
                        Submitted for Review
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">Assigned: <span className="font-semibold text-gray-800">{t.assignedMemberName || "Team Member"}</span></p>
                    {t.submissionDetails?.notes && (
                      <p className="text-xs text-gray-700 bg-white p-2 rounded-lg border border-gray-200 mt-2">
                        &quot;{t.submissionDetails.notes}&quot;
                      </p>
                    )}
                    {t.submissionDetails?.links && t.submissionDetails.links.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {t.submissionDetails.links.map((link, idx) => (
                          <a
                            key={idx}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-2xs font-semibold text-brand-emerald underline"
                          >
                            Supporting Deliverable Link #{idx + 1}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedTaskForReview(t)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-emerald text-white hover:bg-brand-pitch whitespace-nowrap self-start md:self-auto"
                  >
                    Open Review Modal
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: TEAM MEMBERS */}
      {activeTab === "members" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-base font-bold font-heading text-brand-pitch">{departmentName} Team Members</h2>
            <p className="text-xs text-gray-500">Active contributors assigned to this department</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/75 border-b border-gray-100 text-gray-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Member Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Designation</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400">
                      No members assigned to this department yet.
                    </td>
                  </tr>
                ) : (
                  members.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50/60">
                      <td className="py-3 px-4 font-semibold text-gray-900">{m.name}</td>
                      <td className="py-3 px-4 text-gray-500">{m.email}</td>
                      <td className="py-3 px-4 text-gray-700">{m.designation || "Department Member"}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider bg-green-100 text-green-800">
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: BLIND MEMBER ASSESSMENT */}
      {activeTab === "assessment" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 max-w-2xl">
          <div className="pb-4 border-b border-gray-100 mb-5">
            <div className="flex items-center gap-1.5 text-brand-emerald">
              <Sparkles className="w-4 h-4" />
              <span className="text-2xs font-bold uppercase tracking-wider">Confidential Evaluation</span>
            </div>
            <h2 className="text-lg font-bold font-heading text-brand-pitch mt-1">
              Submit Blind Member Performance Evaluation
            </h2>
            <p className="text-xs text-gray-600 mt-1">
              As mandated by organizational confidentiality, your submitted scores are stored securely in the confidential archive. They are visible solely to the Super Admin and will never be disclosed to members or back to department heads.
            </p>
          </div>

          <form onSubmit={handleSubmitAssessment} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Select Department Member</label>
              <select
                required
                value={assessmentCandidateId}
                onChange={(e) => setAssessmentCandidateId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-emerald"
              >
                <option value="">-- Choose Member --</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Evaluation Period</label>
              <input
                type="text"
                required
                value={assessmentPeriod}
                onChange={(e) => setAssessmentPeriod(e.target.value)}
                placeholder="e.g. 2026-Q4"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none"
              />
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
              <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider">Evaluation Criteria (1 to 10)</h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-2xs text-gray-600 mb-1">Task Execution (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={scoreExecution}
                    onChange={(e) => setScoreExecution(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-2xs text-gray-600 mb-1">Deliverable Quality (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={scoreQuality}
                    onChange={(e) => setScoreQuality(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-2xs text-gray-600 mb-1">Punctuality & Timeliness (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={scorePunctuality}
                    onChange={(e) => setScorePunctuality(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-2xs text-gray-600 mb-1">Team Collaboration (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={scoreCollab}
                    onChange={(e) => setScoreCollab(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Qualitative Feedback</label>
              <textarea
                rows={3}
                value={assessmentFeedback}
                onChange={(e) => setAssessmentFeedback(e.target.value)}
                placeholder="Share qualitative observations on strengths and areas for growth..."
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submittingAssessment}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-brand-emerald hover:bg-brand-pitch shadow-xs disabled:opacity-60"
              >
                {submittingAssessment ? (
                  <span>Submitting Confidential Assessment...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Submit Blind Evaluation
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 5: DEPARTMENT LEAVES */}
      {activeTab === "leaves" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold font-heading text-brand-pitch">Department Leave Requests</h2>
              <p className="text-xs text-gray-500">Review and approve absence requests submitted by {departmentName} members.</p>
            </div>
            <button
              onClick={() => fetchDeptLeaves()}
              className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:text-gray-900 text-xs"
              title="Refresh Leaves"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-500 border-b border-gray-100">
                  <th className="py-3 px-4 font-semibold uppercase text-2xs">Member</th>
                  <th className="py-3 px-4 font-semibold uppercase text-2xs">Type</th>
                  <th className="py-3 px-4 font-semibold uppercase text-2xs">Dates</th>
                  <th className="py-3 px-4 font-semibold uppercase text-2xs">Reason</th>
                  <th className="py-3 px-4 font-semibold uppercase text-2xs">Status</th>
                  <th className="py-3 px-4 font-semibold uppercase text-2xs text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {deptLeaves.map((leave) => (
                  <tr key={leave._id || leave.id} className="hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-bold text-gray-900">{leave.memberName}</td>
                    <td className="py-3 px-4 text-gray-700">{leave.leaveType}</td>
                    <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                      {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-gray-600 max-w-xs truncate" title={leave.reason}>
                      {leave.reason}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-2xs font-semibold capitalize ${
                          leave.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : leave.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {leave.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {leave.status === "pending" && (
                        <button
                          onClick={() => {
                            setSelectedDeptLeave(leave);
                            setDeptLeaveAction("approve");
                          }}
                          className="px-3 py-1 rounded-lg bg-brand-emerald text-white font-semibold text-2xs hover:bg-brand-pitch"
                        >
                          Review
                        </button>
                      )}
                      {leave.status !== "pending" && (
                        <span className="text-2xs text-gray-400">Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))}
                {deptLeaves.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-400 text-xs">
                      No leave requests found for {departmentName} department.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: REVIEW DEPARTMENT LEAVE */}
      {selectedDeptLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <h3 className="text-base font-bold font-heading text-brand-pitch">Review Department Leave</h3>
            <p className="text-xs text-gray-500 mt-0.5">Member: <strong>{selectedDeptLeave.memberName}</strong> ({departmentName})</p>

            <div className="my-3.5 p-3.5 bg-gray-50 rounded-xl text-xs space-y-1">
              <p><strong>Type:</strong> {selectedDeptLeave.leaveType}</p>
              <p><strong>Duration:</strong> {new Date(selectedDeptLeave.startDate).toLocaleDateString()} to {new Date(selectedDeptLeave.endDate).toLocaleDateString()}</p>
              <p><strong>Reason:</strong> {selectedDeptLeave.reason}</p>
            </div>

            <form onSubmit={handleReviewDeptLeave} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Decision</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDeptLeaveAction("approve")}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      deptLeaveAction === "approve"
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeptLeaveAction("reject")}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      deptLeaveAction === "reject"
                        ? "bg-rose-600 text-white border-rose-600"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    Reject
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Feedback / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Notes for member regarding approval or rejection..."
                  value={deptLeaveNotes}
                  onChange={(e) => setDeptLeaveNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedDeptLeave(null)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-brand-emerald rounded-xl hover:bg-brand-pitch"
                >
                  Save Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE TASK */}
      {showCreateTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <h3 className="text-lg font-bold font-heading text-brand-pitch">Assign Department Task</h3>
            <p className="text-xs text-gray-500 mt-0.5">Delegate deliverables to team members in {departmentName}</p>

            <form onSubmit={handleCreateTask} className="space-y-4 mt-5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Produce 3 Instagram reels for Urdu Poetry series"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-emerald"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Instructions / Description</label>
                <textarea
                  rows={3}
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Provide detailed instructions and asset expectations..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Assign to Member</label>
                <select
                  value={newTaskAssignedTo}
                  onChange={(e) => setNewTaskAssignedTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none"
                >
                  <option value="">-- Choose Member --</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.designation || "Member"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
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

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none"
                  >
                  </input>
                </div>
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
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REVIEW SUBMISSION */}
      {selectedTaskForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200">
            <h3 className="text-lg font-bold font-heading text-brand-pitch">Review Submitted Deliverable</h3>
            <p className="text-xs text-gray-500 mt-0.5">Task: {selectedTaskForReview.title}</p>

            <div className="my-4 p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
              <p className="font-semibold text-gray-800">
                Submitted by: <span className="text-gray-900 font-normal">{selectedTaskForReview.assignedMemberName || "Member"}</span>
              </p>
              {selectedTaskForReview.submissionDetails?.notes && (
                <div>
                  <span className="font-semibold text-gray-800 block">Member Notes:</span>
                  <p className="text-gray-700 mt-0.5">{selectedTaskForReview.submissionDetails.notes}</p>
                </div>
              )}
              {selectedTaskForReview.submissionDetails?.links && selectedTaskForReview.submissionDetails.links.length > 0 && (
                <div>
                  <span className="font-semibold text-gray-800 block mb-1">Deliverable Links:</span>
                  <div className="space-y-1">
                    {selectedTaskForReview.submissionDetails.links.map((link, idx) => (
                      <a
                        key={idx}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-brand-emerald underline"
                      >
                        {link}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleReviewSubmission} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1.5">Review Decision</label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                      reviewAction === "approve"
                        ? "border-green-600 bg-green-50 text-green-900 font-bold"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="reviewDecision"
                      value="approve"
                      checked={reviewAction === "approve"}
                      onChange={() => setReviewAction("approve")}
                      className="sr-only"
                    />
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Approve Deliverable
                  </label>

                  <label
                    className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                      reviewAction === "request_revision"
                        ? "border-red-600 bg-red-50 text-red-900 font-bold"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="reviewDecision"
                      value="request_revision"
                      checked={reviewAction === "request_revision"}
                      onChange={() => setReviewAction("request_revision")}
                      className="sr-only"
                    />
                    <RotateCcw className="w-4 h-4 text-red-600" />
                    Request Revision
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  {reviewAction === "approve" ? "Approval Feedback (Optional)" : "Revision Instructions (Required)"}
                </label>
                <textarea
                  rows={3}
                  required={reviewAction === "request_revision"}
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  placeholder={
                    reviewAction === "approve"
                      ? "Great job! Deliverable accepted."
                      : "Please specify what needs adjustments before this task can be approved..."
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedTaskForReview(null)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-xl font-semibold text-white shadow-xs ${
                    reviewAction === "approve"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  Confirm Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DepartmentDashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-gray-500">Loading Department Workspace...</div>}>
      <DepartmentDashboardContent />
    </Suspense>
  );
}
