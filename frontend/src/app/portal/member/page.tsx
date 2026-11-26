"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { API_BASE, fetchWithAuth } from "@/lib/api";
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  ExternalLink,
  RotateCcw,
  RefreshCw,
  FolderOpen,
  Calendar,
  Plus,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface TaskSubmissionDetails {
  notes?: string;
  links?: string[];
  submittedAt?: string;
}

interface TaskReviewDetails {
  reviewerName?: string;
  feedback?: string;
  revisionNotes?: string;
  reviewedAt?: string;
}

interface MemberTask {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  department: string;
  priority: string;
  status: string;
  dueDate?: string;
  submissionDetails?: TaskSubmissionDetails;
  reviewDetails?: TaskReviewDetails;
}

interface MemberLeave {
  _id?: string;
  id?: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  supportingDoc?: string;
  status: string;
  reviewedByName?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  createdAt: string;
}

function MemberDashboardContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const activeTabParam = searchParams.get("tab") || "tasks";
  const [activeTab, setActiveTab] = useState(activeTabParam);

  useEffect(() => {
    if (activeTabParam && activeTabParam !== activeTab) {
      setActiveTab(activeTabParam);
    }
  }, [activeTabParam, activeTab]);

  const [tasks, setTasks] = useState<MemberTask[]>([]);
  const [leaves, setLeaves] = useState<MemberLeave[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Submit Work Modal
  const [selectedTaskToSubmit, setSelectedTaskToSubmit] = useState<MemberTask | null>(null);
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [submissionLink, setSubmissionLink] = useState("");
  const [submittingWork, setSubmittingWork] = useState(false);

  // Request Leave Modal
  const [showRequestLeaveModal, setShowRequestLeaveModal] = useState(false);
  const [leaveType, setLeaveType] = useState("Personal");
  const [leaveStartDate, setLeaveStartDate] = useState("");
  const [leaveEndDate, setLeaveEndDate] = useState("");
  const [leaveReason, setLeaveReason] = useState("");
  const [leaveDoc, setLeaveDoc] = useState("");
  const [submittingLeave, setSubmittingLeave] = useState(false);

  const fetchMyTasks = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetchWithAuth("/tasks");

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setTasks(data.tasks || []);
        }
      } else {
        setError("Failed to fetch personal assigned tasks.");
      }
    } catch {
      setError("Unable to connect to the task server.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchMyLeaves = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/hr/leaves/my`, {
        credentials: "include",
        headers: { "X-Requested-With": "XMLHttpRequest" },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setLeaves(data.leaves || []);
        }
      }
    } catch {}
  }, [user]);

  useEffect(() => {
    fetchMyTasks();
    fetchMyLeaves();
  }, [fetchMyTasks, fetchMyLeaves]);

  const handleStartTask = async (taskId: string) => {
    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({ status: "in_progress", notes: "Member started working on task." }),
      });

      if (res.ok) {
        setActionSuccess("Task marked as 'In Progress'.");
        fetchMyTasks();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to start task.");
      }
    } catch {
      alert("Error starting task.");
    }
  };

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskToSubmit) return;

    const taskId = (selectedTaskToSubmit.id || selectedTaskToSubmit._id) as string;
    setSubmittingWork(true);

    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}/submit`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({
          notes: submissionNotes,
          links: submissionLink ? [submissionLink] : [],
        }),
      });

      setSubmittingWork(false);

      if (res.ok) {
        setActionSuccess("Work submitted successfully to Department Head for review!");
        setSelectedTaskToSubmit(null);
        setSubmissionNotes("");
        setSubmissionLink("");
        fetchMyTasks();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to submit work.");
      }
    } catch {
      setSubmittingWork(false);
      alert("Network error while submitting work.");
    }
  };

  const handleRequestLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveStartDate || !leaveEndDate || !leaveReason) return;

    if (new Date(leaveStartDate) > new Date(leaveEndDate)) {
      alert("Start date must be before or equal to end date.");
      return;
    }

    setSubmittingLeave(true);
    try {
      const res = await fetch(`${API_BASE}/hr/leaves`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({
          leaveType,
          startDate: leaveStartDate,
          endDate: leaveEndDate,
          reason: leaveReason,
          supportingDoc: leaveDoc,
        }),
      });

      setSubmittingLeave(false);
      if (res.ok) {
        setActionSuccess("Leave request submitted successfully. Awaiting review.");
        setShowRequestLeaveModal(false);
        setLeaveReason("");
        setLeaveStartDate("");
        setLeaveEndDate("");
        setLeaveDoc("");
        fetchMyLeaves();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to submit leave request.");
      }
    } catch {
      setSubmittingLeave(false);
      alert("Network error while submitting leave request.");
    }
  };

  const inProgressCount = tasks.filter((t) => t.status === "in_progress").length;
  const underReviewCount = tasks.filter((t) => ["submitted", "under_review", "review"].includes(t.status)).length;
  const completedCount = tasks.filter((t) => ["approved", "completed"].includes(t.status)).length;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Executive Command Header */}
      <div className="bg-[#17243A] text-white rounded-2xl p-5 sm:p-7 shadow-rekhta flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-[#233550]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-urdu text-lg sm:text-xl text-[#D7A84B] font-bold">
              رکن کا ورک اسپیس
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#800F35] text-white font-medium border border-[#9F1239]">
              {user?.department || "General"} Department
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Welcome, {user?.name}
          </h1>
          <p className="text-xs text-slate-300 max-w-xl">
            Track assigned deliverables, submit completed work, and manage official leave requests.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-stretch sm:self-auto shrink-0">
          <button
            onClick={() => {
              fetchMyTasks();
              fetchMyLeaves();
            }}
            disabled={loading}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg border border-white/20 transition active:scale-95 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowRequestLeaveModal(true)}
            className="px-4 py-2 bg-[#800F35] hover:bg-[#600B27] text-white text-xs font-semibold rounded-lg shadow-sm transition active:scale-95 flex items-center gap-1.5 border border-[#9F1239]"
          >
            <Plus className="w-3.5 h-3.5" />
            Request Leave
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-2xs underline text-emerald-700">Dismiss</button>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Tasks</span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#17243A]">{tasks.length}</span>
            <span className="text-xs text-slate-500 font-medium">Assigned</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">All assigned assignments</p>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">In Progress</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#17243A]">{inProgressCount}</span>
            <span className="text-xs text-blue-600 font-semibold">Active</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Currently working</p>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Awaiting Review</span>
            <div className="w-9 h-9 rounded-lg bg-rose-50 text-[#800F35] flex items-center justify-center font-bold">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#17243A]">{underReviewCount}</span>
            <span className="text-xs text-[#800F35] font-semibold">Submitted</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Pending Head approval</p>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Approved Leaves</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#17243A]">
              {leaves.filter((l) => l.status === "approved").length}
            </span>
            <span className="text-xs text-emerald-600 font-semibold">Approved</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Authorized absences</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab("tasks");
              window.history.replaceState(null, "", "/portal/member");
            }}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "tasks"
                ? "border-[#800F35] text-[#800F35]"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Assigned Deliverables ({tasks.length})
          </button>

          <button
            onClick={() => {
              setActiveTab("leaves");
              window.history.replaceState(null, "", "/portal/member?tab=leaves");
            }}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "leaves"
                ? "border-[#800F35] text-[#800F35]"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Leave Requests ({leaves.length})
          </button>
        </nav>
      </div>

      {/* TAB 1: ASSIGNED DELIVERABLES */}
      {activeTab === "tasks" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-base font-bold font-heading text-brand-pitch">My Deliverables</h2>
          </div>

          <div className="divide-y divide-gray-100">
            {tasks.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs">
                You do not have any tasks assigned at the moment.
              </div>
            ) : (
              tasks.map((t) => {
                const taskId = (t.id || t._id) as string;
                const isAssigned = t.status === "assigned";
                const isInProgress = t.status === "in_progress";
                const isRevision = t.status === "revision_requested";
                const isSubmitted = ["submitted", "under_review", "review"].includes(t.status);
                const isApproved = ["approved", "completed"].includes(t.status);

                return (
                  <div key={taskId} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">{t.title}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider ${
                            isApproved
                              ? "bg-green-100 text-green-800"
                              : isRevision
                              ? "bg-red-100 text-red-800"
                              : isSubmitted
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {t.status.replace(/_/g, " ")}
                        </span>
                      </div>

                      {t.description && <p className="text-xs text-gray-600">{t.description}</p>}

                      {isRevision && t.reviewDetails?.revisionNotes && (
                        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 mt-2">
                          <span className="font-bold flex items-center gap-1 mb-1">
                            <RotateCcw className="w-3.5 h-3.5" />
                            Department Head Revision Request:
                          </span>
                          <p>{t.reviewDetails.revisionNotes}</p>
                        </div>
                      )}

                      {isApproved && t.reviewDetails?.feedback && (
                        <p className="text-2xs text-green-700 italic mt-1">
                          &quot;{t.reviewDetails.feedback}&quot;
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-2xs text-gray-500 pt-1">
                        <span>Priority: <strong className="capitalize">{t.priority}</strong></span>
                        {t.dueDate && <span>Deadline: <strong>{new Date(t.dueDate).toLocaleDateString()}</strong></span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-auto">
                      {isAssigned && (
                        <button
                          onClick={() => handleStartTask(taskId)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700"
                        >
                          Start Task
                        </button>
                      )}

                      {isRevision && (
                        <button
                          onClick={() => handleStartTask(taskId)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-brand-emerald text-white hover:bg-brand-pitch"
                        >
                          Resume Work (In Progress)
                        </button>
                      )}

                      {isInProgress && (
                        <button
                          onClick={() => setSelectedTaskToSubmit(t)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-brand-emerald text-white hover:bg-brand-pitch flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          Submit Deliverable
                        </button>
                      )}

                      {isSubmitted && (
                        <span className="text-2xs font-semibold text-amber-700 flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                          <Clock className="w-3 h-3" />
                          Pending Review
                        </span>
                      )}

                      {isApproved && (
                        <span className="text-2xs font-semibold text-green-700 flex items-center gap-1 bg-green-50 px-3 py-1.5 rounded-xl border border-green-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Complete
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MY LEAVE REQUESTS */}
      {activeTab === "leaves" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold font-heading text-brand-pitch">My Leave Requests</h2>
              <p className="text-xs text-gray-500">Official record of absence applications submitted for examination, illness, or personal reasons.</p>
            </div>
            <button
              onClick={() => setShowRequestLeaveModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-emerald text-white hover:bg-brand-pitch"
            >
              <Plus className="w-3.5 h-3.5" />
              New Leave Request
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-500 border-b border-gray-100">
                  <th className="py-3 px-4 font-semibold uppercase text-2xs">Type</th>
                  <th className="py-3 px-4 font-semibold uppercase text-2xs">Period</th>
                  <th className="py-3 px-4 font-semibold uppercase text-2xs">Reason</th>
                  <th className="py-3 px-4 font-semibold uppercase text-2xs">Status</th>
                  <th className="py-3 px-4 font-semibold uppercase text-2xs">Reviewer Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leaves.map((leave) => (
                  <tr key={leave._id || leave.id} className="hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-bold text-gray-900">{leave.leaveType}</td>
                    <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                      {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-gray-600 max-w-xs truncate" title={leave.reason}>
                      {leave.reason}
                      {leave.supportingDoc && (
                        <a
                          href={leave.supportingDoc}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-2xs text-brand-emerald underline ml-1.5"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Document
                        </a>
                      )}
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
                    <td className="py-3 px-4 text-gray-500 italic">
                      {leave.reviewNotes || (leave.status === "pending" ? "Awaiting review" : "No notes")}
                    </td>
                  </tr>
                ))}
                {leaves.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-gray-400 text-xs">
                      You have not submitted any leave requests yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBMIT WORK MODAL */}
      {selectedTaskToSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <h3 className="text-lg font-bold font-heading text-brand-pitch">Submit Task Deliverable</h3>
            <p className="text-xs text-gray-500 mt-0.5">Task: {selectedTaskToSubmit.title}</p>

            <form onSubmit={handleSubmitWork} className="space-y-4 mt-5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Submission Notes</label>
                <textarea
                  rows={3}
                  required
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  placeholder="Summarize what was completed and any relevant details..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-emerald"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Deliverable Link (Google Drive, Docs, Figma, etc.)</label>
                <input
                  type="url"
                  value={submissionLink}
                  onChange={(e) => setSubmissionLink(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedTaskToSubmit(null)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingWork}
                  className="px-4 py-2 rounded-xl bg-brand-emerald text-white hover:bg-brand-pitch font-semibold shadow-xs disabled:opacity-60 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submittingWork ? "Submitting..." : "Submit to Department Head"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REQUEST LEAVE MODAL */}
      {showRequestLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <h3 className="text-lg font-bold font-heading text-brand-pitch">Submit Leave Request</h3>
            <p className="text-xs text-gray-500 mt-0.5">Formal request submitted to your Department Head and HR.</p>

            <form onSubmit={handleRequestLeave} className="space-y-4 mt-5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white"
                >
                  <option value="Personal">Personal</option>
                  <option value="Exam">Academic / Examinations</option>
                  <option value="Sick">Medical / Sick Leave</option>
                  <option value="Emergency">Family Emergency</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={leaveStartDate}
                    onChange={(e) => setLeaveStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={leaveEndDate}
                    onChange={(e) => setLeaveEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Reason for Absence *</label>
                <textarea
                  rows={3}
                  required
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="Detail the circumstances and requirements of your leave..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Supporting Document Link (Optional)</label>
                <input
                  type="url"
                  value={leaveDoc}
                  onChange={(e) => setLeaveDoc(e.target.value)}
                  placeholder="e.g. Exam date sheet or medical certificate URL"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowRequestLeaveModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingLeave}
                  className="px-4 py-2 rounded-xl bg-brand-emerald text-white hover:bg-brand-pitch font-semibold shadow-xs disabled:opacity-60 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submittingLeave ? "Submitting..." : "Submit Leave Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MemberDashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-gray-500">Loading Member Workspace...</div>}>
      <MemberDashboardContent />
    </Suspense>
  );
}
