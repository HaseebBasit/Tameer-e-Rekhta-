"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { fetchWithAuth } from "@/lib/api";
import { canPublishMediaGallery, normalizeDesignation, getDesignationDisplayName } from "@/lib/authorization";
import {
  Image as ImageIcon,
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
  Video,
  FileText,
  Upload,
  Search,
  X,
  Check,
  Award,
  Film,
  Camera,
  Layers,
  ShieldCheck,
  Lock,
  Download,
} from "lucide-react";

interface MediaMetrics {
  memberCount: number;
  activeTasks: number;
  awaitingReview: number;
  revisionRequested: number;
  completedTasks: number;
  totalTasks: number;
  totalAssets?: number;
  publishedAssets?: number;
}

interface MediaMember {
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

interface MediaAsset {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  caption?: string;
  fileType: "image" | "video" | "document" | "audio";
  url: string;
  thumbnailUrl?: string;
  tags?: string[];
  publicationStatus: "draft" | "pending_review" | "approved" | "published" | "archived";
  uploadedByName?: string;
  publishedByName?: string;
  createdAt?: string;
}

function MediaDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, activeDepartment } = useAuth();

  const tabParam = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState(tabParam);

  useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [tabParam, activeTab]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [metrics, setMetrics] = useState<MediaMetrics | null>(null);
  const [members, setMembers] = useState<MediaMember[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [galleryAssets, setGalleryAssets] = useState<MediaAsset[]>([]);
  const [deptLeaves, setDeptLeaves] = useState<any[]>([]);

  // Gallery Filters
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Upload Asset Modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDesc, setUploadDesc] = useState("");
  const [uploadCaption, setUploadCaption] = useState("");
  const [uploadFileType, setUploadFileType] = useState<"image" | "video" | "document">("image");
  const [uploadUrl, setUploadUrl] = useState("");
  const [uploadTags, setUploadTags] = useState("");
  const [uploading, setUploading] = useState(false);

  // Asset Preview Modal
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);

  // Task Creation Modal
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("medium");
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [submittingTask, setSubmittingTask] = useState(false);

  // Review Task Modal
  const [selectedTaskForReview, setSelectedTaskForReview] = useState<TaskItem | null>(null);
  const [reviewAction, setReviewAction] = useState<"approve" | "request_revision">("approve");
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Department Leaves state
  const [selectedDeptLeave, setSelectedDeptLeave] = useState<any | null>(null);
  const [deptLeaveAction, setDeptLeaveAction] = useState<"approve" | "reject">("approve");
  const [deptLeaveNotes, setDeptLeaveNotes] = useState("");
  const [submittingLeave, setSubmittingLeave] = useState(false);

  // Blind Assessment Form State
  const [assessmentCandidateId, setAssessmentCandidateId] = useState("");
  const [assessmentPeriod, setAssessmentPeriod] = useState("2026-Q4");
  const [scoreExecution, setScoreExecution] = useState(8);
  const [scoreQuality, setScoreQuality] = useState(8);
  const [scorePunctuality, setScorePunctuality] = useState(8);
  const [scoreCollab, setScoreCollab] = useState(8);
  const [assessmentFeedback, setAssessmentFeedback] = useState("");
  const [submittingAssessment, setSubmittingAssessment] = useState(false);

  // Role Checks
  const isSuperAdmin = user?.role === "super_admin";
  const isMediaLead = user?.role === "dept_media";
  const isMediaMember =
    user?.department === "Media" ||
    (Array.isArray(user?.memberships) && user.memberships.some((m) => m.department === "Media"));
  const isAuthorized = isSuperAdmin || isMediaLead || isMediaMember;
  const isHeadPublisher = canPublishMediaGallery(user) || isSuperAdmin;

  // 1. Fetch Department Data
  const fetchMediaData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch overview, members, tasks from department endpoint
      const deptRes = await fetchWithAuth("/department/Media/overview", {
        headers: { "X-Department-Context": "Media" },
      });

      if (deptRes.ok) {
        const dData = await deptRes.json();
        if (dData.success) {
          setMetrics(dData.metrics);
          setMembers(dData.members || []);
          setTasks(dData.tasks || []);
        }
      } else if (deptRes.status === 403) {
        setError("Access Restricted: You are only authorized to view your own assigned department workspace.");
      }

      // Fetch media assets from media bank endpoint
      const mediaRes = await fetchWithAuth("/media");
      if (mediaRes.ok) {
        const mData = await mediaRes.json();
        if (mData.success && Array.isArray(mData.media)) {
          setGalleryAssets(mData.media);
        }
      }

      // Fetch leaves
      const leavesRes = await fetchWithAuth("/hr/leaves/department");
      if (leavesRes.ok) {
        const lData = await leavesRes.json();
        if (lData.success && Array.isArray(lData.leaves)) {
          setDeptLeaves(lData.leaves);
        }
      }
    } catch {
      setError("Unable to connect to the Media Department workspace service.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      fetchMediaData();
    }
  }, [fetchMediaData, isAuthorized]);

  // Handle Create Task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      setSubmittingTask(true);
      const res = await fetchWithAuth("/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Department-Context": "Media",
        },
        body: JSON.stringify({
          title: newTaskTitle.trim(),
          description: newTaskDesc.trim(),
          department: "Media",
          priority: newTaskPriority,
          assignedTo: newTaskAssignedTo || undefined,
          dueDate: newTaskDueDate || undefined,
        }),
      });

      if (res.ok) {
        setActionSuccess("Media task created and dispatched successfully.");
        setShowCreateTaskModal(false);
        setNewTaskTitle("");
        setNewTaskDesc("");
        setNewTaskAssignedTo("");
        setNewTaskDueDate("");
        await fetchMediaData();
      } else {
        const errData = await res.json();
        setError(errData?.error || "Failed to create task.");
      }
    } catch {
      setError("Failed to create task. Check network connection.");
    } finally {
      setSubmittingTask(false);
    }
  };

  // Handle Review Task
  const handleReviewTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskForReview) return;
    const taskId = selectedTaskForReview._id || selectedTaskForReview.id;

    try {
      setSubmittingReview(true);
      const res = await fetchWithAuth(`/tasks/${taskId}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-Department-Context": "Media" },
        body: JSON.stringify({
          action: reviewAction,
          feedback: reviewFeedback.trim(),
        }),
      });

      if (res.ok) {
        setActionSuccess(
          `Task deliverable has been ${reviewAction === "approve" ? "approved" : "returned for revision"}.`
        );
        setSelectedTaskForReview(null);
        setReviewFeedback("");
        await fetchMediaData();
      } else {
        const errData = await res.json();
        setError(errData?.error || "Failed to submit review.");
      }
    } catch {
      setError("Failed to review task deliverable.");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Handle Upload Media Asset
  const handleUploadMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim() || !uploadUrl.trim()) return;

    try {
      setUploading(true);
      const res = await fetchWithAuth("/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: uploadTitle.trim(),
          description: uploadDesc.trim(),
          caption: uploadCaption.trim(),
          fileType: uploadFileType,
          url: uploadUrl.trim(),
          tags: uploadTags.split(",").map((t) => t.trim()).filter(Boolean),
          publicationStatus: isHeadPublisher ? "published" : "pending_review",
        }),
      });

      if (res.ok) {
        setActionSuccess(
          isHeadPublisher
            ? "Media asset recorded and published to internal gallery."
            : "Media asset submitted for Head of Media review."
        );
        setShowUploadModal(false);
        setUploadTitle("");
        setUploadDesc("");
        setUploadCaption("");
        setUploadUrl("");
        setUploadTags("");
        await fetchMediaData();
      } else {
        const errData = await res.json();
        setError(errData?.error || "Failed to upload asset.");
      }
    } catch {
      setError("Failed to upload media asset.");
    } finally {
      setUploading(false);
    }
  };

  // Handle Review Department Leave
  const handleReviewDeptLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeptLeave) return;
    const leaveId = selectedDeptLeave._id || selectedDeptLeave.id;

    try {
      setSubmittingLeave(true);
      const res = await fetchWithAuth(`/hr/leaves/${leaveId}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: deptLeaveAction, notes: deptLeaveNotes }),
      });

      if (res.ok) {
        setActionSuccess(`Leave request has been ${deptLeaveAction === "approve" ? "approved" : "rejected"}.`);
        setSelectedDeptLeave(null);
        setDeptLeaveNotes("");
        await fetchMediaData();
      } else {
        const errData = await res.json();
        setError(errData?.error || "Failed to process leave decision.");
      }
    } catch {
      setError("Failed to submit leave decision.");
    } finally {
      setSubmittingLeave(false);
    }
  };

  // Handle Blind Assessment
  const handleSubmitAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assessmentCandidateId) {
      setError("Please select a candidate to evaluate.");
      return;
    }

    try {
      setSubmittingAssessment(true);
      const res = await fetchWithAuth("/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Department-Context": "Media" },
        body: JSON.stringify({
          candidateId: assessmentCandidateId,
          department: "Media",
          period: assessmentPeriod,
          metrics: {
            execution: scoreExecution,
            quality: scoreQuality,
            punctuality: scorePunctuality,
            collaboration: scoreCollab,
          },
          feedback: assessmentFeedback.trim(),
        }),
      });

      if (res.ok) {
        setActionSuccess("Confidential performance assessment recorded successfully.");
        setAssessmentCandidateId("");
        setAssessmentFeedback("");
      } else {
        const errData = await res.json();
        setError(errData?.error || "Failed to submit assessment.");
      }
    } catch {
      setError("Failed to submit assessment.");
    } finally {
      setSubmittingAssessment(false);
    }
  };

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return galleryAssets.filter((a) => {
      if (filterType !== "all" && a.fileType !== filterType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = a.title?.toLowerCase().includes(q);
        const tagMatch = a.tags?.some((t) => t.toLowerCase().includes(q));
        if (!titleMatch && !tagMatch) return false;
      }
      return true;
    });
  }, [galleryAssets, filterType, searchQuery]);

  // If unauthorized
  if (!isAuthorized && !loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="bg-rose-50 border border-rose-200 p-8 rounded-2xl shadow-sm inline-block max-w-lg">
          <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-xs sm:text-sm text-gray-600 mb-4">
            You are logged in as <strong>{user?.name}</strong> ({user?.role}). This workspace is reserved for authorized members and leadership of the <strong>Media Department</strong>.
          </p>
          <Link
            href="/portal/department"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#800F35] text-white text-xs font-semibold rounded-xl hover:bg-[#680C2B] transition"
          >
            Go to Your Assigned Workspace
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Brand Header */}
      <div className="bg-gradient-to-r from-[#17243A] via-[#1E2E48] to-[#17243A] text-white p-6 sm:p-8 rounded-2xl shadow-md border border-[#233550] relative overflow-hidden">
        <div className="absolute right-4 top-4 opacity-10 pointer-events-none select-none font-urdu text-8xl text-[#D7A84B]">
          میڈیا
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-2xs font-extrabold uppercase tracking-wider bg-[#800F35] text-white border border-[#9F1239]">
                MED • Department 04
              </span>
              <span className="text-xs text-slate-300 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Official Division
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
              Media & Creative Production
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Governing photography, videography, Nastaliq calligraphy visuals, creative deliverables, and internal media repositories.
            </p>
            <p className="font-urdu text-base sm:text-lg text-[#D7A84B] mt-1">
              تعمیرِ ریختہ — شعبہ میڈیا و مواصلات
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            <button
              onClick={() => {
                fetchMediaData();
                setActionSuccess("Refreshed Media workspace data.");
              }}
              disabled={loading}
              className="px-3 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-xl border border-white/20 transition flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>

            {isMediaLead && (
              <button
                onClick={() => setShowCreateTaskModal(true)}
                className="px-4 py-2 bg-[#800F35] hover:bg-[#680C2B] text-white text-xs font-semibold rounded-xl shadow-md transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Assign Media Task
              </button>
            )}

            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-[#D7A84B] hover:bg-[#C2953E] text-[#17243A] text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4" />
              Upload Asset
            </button>
          </div>
        </div>

        {/* Head Identity Badge */}
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Department Lead:</span>
            <span className="font-semibold text-white">Aisha Tariq</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-2xs text-[#D7A84B]">Head of Media</span>
          </div>
          <div className="flex items-center gap-3 text-2xs text-slate-400">
            <span>Graphics Director: <strong>Sarmad Waseem</strong></span>
            <span>•</span>
            <span>Assistant Director: <strong>Hafiza Ayesha</strong></span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-xs sm:text-sm animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-800 text-xs sm:text-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">{actionSuccess}</p>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-400 hover:text-emerald-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto scrollbar-none">
        <nav className="flex space-x-2 sm:space-x-4 min-w-max pb-1">
          {[
            { id: "overview", label: "Media Overview", icon: Layers, count: metrics?.totalTasks },
            { id: "gallery", label: "Media Bank / Assets", icon: ImageIcon, count: galleryAssets.length },
            { id: "tasks", label: "Creative Tasks", icon: CheckSquare, count: metrics?.activeTasks },
            { id: "submissions", label: "Review Deliverables", icon: ClipboardList, count: metrics?.awaitingReview },
            { id: "members", label: "Media Team Roster", icon: Users, count: members.length || 5 },
            { id: "leaves", label: "Department Leaves", icon: Calendar, count: deptLeaves.length },
            { id: "assessment", label: "Blind Assessment", icon: Award, confidential: true },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  const newUrl = tab.id === "overview" ? "/portal/media" : `/portal/media?tab=${tab.id}`;
                  window.history.replaceState(null, "", newUrl);
                }}
                className={`flex items-center gap-2 py-3 px-3.5 border-b-2 text-xs sm:text-sm font-semibold transition-all rounded-t-lg ${
                  isActive
                    ? "border-[#800F35] text-[#800F35] bg-brand-mint/20"
                    : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#800F35]" : "text-gray-400"}`} />
                <span>{tab.label}</span>
                {typeof tab.count === "number" && tab.count > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-2xs font-bold ${
                      isActive ? "bg-[#800F35] text-white" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
                {tab.confidential && (
                  <span className="text-2xs font-extrabold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                    LOCKED
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: OVERVIEW */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between text-gray-500 text-xs font-semibold mb-2">
                <span>Active Deliverables</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#17243A]">
                {metrics?.activeTasks ?? tasks.filter((t) => t.status !== "completed").length}
              </div>
              <p className="text-2xs text-gray-500 mt-1">Video, photography & visual tasks</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between text-gray-500 text-xs font-semibold mb-2">
                <span>Awaiting Review</span>
                <ClipboardList className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-700">
                {metrics?.awaitingReview ?? tasks.filter((t) => t.status === "review").length}
              </div>
              <p className="text-2xs text-gray-500 mt-1">Pending Head approval</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between text-gray-500 text-xs font-semibold mb-2">
                <span>Media Bank Assets</span>
                <ImageIcon className="w-4 h-4 text-[#D7A84B]" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#17243A]">
                {galleryAssets.length}
              </div>
              <p className="text-2xs text-gray-500 mt-1">High-res photos, videos & vectors</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between text-gray-500 text-xs font-semibold mb-2">
                <span>Department Staff</span>
                <Users className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
                {members.length || 5}
              </div>
              <p className="text-2xs text-gray-500 mt-1">1 Lead • 2 Directors • 2 Members</p>
            </div>
          </div>

          {/* Quick Shortcuts & Gallery Teaser */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-[#17243A] flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#800F35]" />
                  Recent Media Bank Highlights
                </h3>
                <button
                  onClick={() => {
                    setActiveTab("gallery");
                    window.history.replaceState(null, "", "/portal/media?tab=gallery");
                  }}
                  className="text-xs font-semibold text-[#800F35] hover:underline flex items-center gap-1"
                >
                  View All {galleryAssets.length} Assets <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {galleryAssets.length === 0 ? (
                <div className="py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-600">No media assets in repository yet.</p>
                  <p className="text-xs text-gray-400 mt-1">Upload event photos, banners, and calligraphy vectors.</p>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="mt-4 px-3.5 py-1.5 bg-[#800F35] text-white text-xs font-semibold rounded-lg hover:bg-[#680C2B] transition"
                  >
                    Upload First Asset
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {galleryAssets.slice(0, 4).map((asset) => (
                    <div
                      key={asset._id || asset.id}
                      onClick={() => setPreviewAsset(asset)}
                      className="group relative aspect-video bg-gray-100 rounded-xl overflow-hidden cursor-pointer border border-gray-200 hover:border-[#800F35] transition"
                    >
                      <img
                        src={asset.url}
                        alt={asset.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition p-2 flex flex-col justify-end">
                        <span className="text-2xs font-semibold text-white truncate">{asset.title}</span>
                        <span className="text-3xs text-[#D7A84B] uppercase">{asset.fileType}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-[#17243A]">Media Leadership Governance</h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="font-semibold text-gray-900">Aisha Tariq</div>
                  <div className="text-2xs text-[#800F35] font-bold">Head of Media (National)</div>
                  <div className="text-2xs text-gray-500 mt-0.5">Exclusive gallery publishing authority & final approvals</div>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="font-semibold text-gray-900">Sarmad Waseem</div>
                  <div className="text-2xs text-blue-700 font-bold">Director of Graphics</div>
                  <div className="text-2xs text-gray-500 mt-0.5">Brand vector design & event artwork review</div>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="font-semibold text-gray-900">Hafiza Ayesha</div>
                  <div className="text-2xs text-emerald-700 font-bold">Assistant Director</div>
                  <div className="text-2xs text-gray-500 mt-0.5">Team coordination & photography delivery</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: GALLERY / MEDIA BANK */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "gallery" && (
        <div className="space-y-5">
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {["all", "image", "video", "document"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                    filterType === type
                      ? "bg-[#17243A] text-white shadow-xs"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {type === "all" ? "All Media" : `${type}s`}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search assets by title or tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#800F35]"
                />
              </div>

              <button
                onClick={() => setShowUploadModal(true)}
                className="px-3.5 py-1.5 bg-[#800F35] hover:bg-[#680C2B] text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5 whitespace-nowrap"
              >
                <Upload className="w-3.5 h-3.5" /> Upload +
              </button>
            </div>
          </div>

          {/* Media Grid */}
          {filteredAssets.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-gray-200">
              <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700">No media assets found matching criteria.</p>
              <p className="text-xs text-gray-400 mt-1">Try another filter or upload a new creative deliverable.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredAssets.map((asset) => (
                <div
                  key={asset._id || asset.id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:border-[#800F35]/50 transition group flex flex-col"
                >
                  <div
                    onClick={() => setPreviewAsset(asset)}
                    className="relative aspect-video bg-gray-100 cursor-pointer overflow-hidden flex items-center justify-center"
                  >
                    {asset.fileType === "video" ? (
                      <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-[#800F35]">
                        <Video className="w-8 h-8 mb-1" />
                        <span className="text-2xs uppercase font-bold tracking-wider">Video Asset</span>
                      </div>
                    ) : asset.fileType === "document" ? (
                      <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-[#800F35]">
                        <FileText className="w-8 h-8 mb-1" />
                        <span className="text-2xs uppercase font-bold tracking-wider">Vector / Doc</span>
                      </div>
                    ) : (
                      <img
                        src={asset.url}
                        alt={asset.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    )}

                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      <span
                        className={`text-3xs font-extrabold uppercase px-2 py-0.5 rounded-full shadow-xs ${
                          asset.publicationStatus === "published"
                            ? "bg-emerald-600 text-white"
                            : "bg-amber-500 text-white"
                        }`}
                      >
                        {asset.publicationStatus}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-[#17243A] line-clamp-1">{asset.title}</h4>
                      {asset.caption && (
                        <p className="text-2xs text-gray-500 line-clamp-1 mt-0.5">{asset.caption}</p>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-2xs text-gray-400">
                      <span>By {asset.uploadedByName || "Media Team"}</span>
                      <button
                        onClick={() => setPreviewAsset(asset)}
                        className="text-[#800F35] font-semibold hover:underline flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> Preview
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: CREATIVE TASKS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "tasks" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-200">
            <div>
              <h3 className="font-bold text-sm text-[#17243A]">Media Tasks & Visual Deliverables</h3>
              <p className="text-xs text-gray-500">Track photography, videography, Nastaliq vectors, and banners</p>
            </div>
            {isMediaLead && (
              <button
                onClick={() => setShowCreateTaskModal(true)}
                className="px-3.5 py-1.5 bg-[#800F35] text-white text-xs font-semibold rounded-xl hover:bg-[#680C2B] transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> New Task
              </button>
            )}
          </div>

          {tasks.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-gray-200">
              <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700">No tasks currently assigned to Media.</p>
              <p className="text-xs text-gray-400 mt-1">Assign photo shoots, graphic packages, or video reels.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs divide-y divide-gray-100">
              {tasks.map((task) => (
                <div key={task._id || task.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/50 transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#17243A]">{task.title}</span>
                      <span
                        className={`text-2xs font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          task.priority === "urgent"
                            ? "bg-red-100 text-red-700"
                            : task.priority === "high"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {task.priority}
                      </span>
                      <span
                        className={`text-2xs font-bold uppercase px-2 py-0.5 rounded-full ${
                          task.status === "completed"
                            ? "bg-emerald-100 text-emerald-700"
                            : task.status === "review"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>
                    {task.description && <p className="text-xs text-gray-600 max-w-2xl">{task.description}</p>}
                    <div className="flex items-center gap-3 text-2xs text-gray-400">
                      <span>Assignee: {task.assignedMemberName || "Unassigned"}</span>
                      {task.dueDate && <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
                    </div>
                  </div>

                  {task.status === "review" && isMediaLead && (
                    <button
                      onClick={() => {
                        setSelectedTaskForReview(task);
                        setReviewFeedback(task.reviewDetails?.feedback || "");
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1 self-start sm:self-center"
                    >
                      <Eye className="w-3.5 h-3.5" /> Review Submission
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: REVIEW SUBMISSIONS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "submissions" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-200">
            <h3 className="font-bold text-sm text-[#17243A]">Deliverables Awaiting Review</h3>
            <p className="text-xs text-gray-500">Media submissions pending Head or Director quality validation</p>
          </div>

          {tasks.filter((t) => t.status === "review").length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-gray-200">
              <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700">No deliverables currently pending review.</p>
              <p className="text-xs text-gray-400 mt-1">Submissions by team members will appear here for verification.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs divide-y divide-gray-100">
              {tasks
                .filter((t) => t.status === "review")
                .map((task) => (
                  <div key={task._id || task.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-sm text-[#17243A]">{task.title}</h4>
                      <p className="text-xs text-gray-600 mt-0.5">Submitted by: {task.assignedMemberName || "Staff Member"}</p>
                      {task.submissionDetails?.notes && (
                        <p className="text-xs bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-gray-700 mt-2">
                          <strong>Notes:</strong> {task.submissionDetails.notes}
                        </p>
                      )}
                    </div>
                    {isMediaLead && (
                      <button
                        onClick={() => {
                          setSelectedTaskForReview(task);
                          setReviewFeedback("");
                        }}
                        className="px-4 py-2 bg-[#800F35] text-white text-xs font-semibold rounded-xl hover:bg-[#680C2B] transition flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" /> Adjudicate Deliverable
                      </button>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 5: MEMBERS ROSTER */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "members" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-200">
            <h3 className="font-bold text-sm text-[#17243A]">Media Department Team Roster</h3>
            <p className="text-xs text-gray-500">Official active members provisioned under the Media division</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs divide-y divide-gray-100">
            {(members.length > 0
              ? members
              : [
                  { id: "1", name: "Aisha Tariq", email: "aishatariq@rekhta.org", role: "dept_media", designation: "head", status: "active" },
                  { id: "2", name: "Sarmad Waseem", email: "sarmadwaseem@rekhta.org", role: "dept_media", designation: "director_graphics", status: "active" },
                  { id: "3", name: "Hafiza Ayesha", email: "hafizaayesha@rekhta.org", role: "dept_media", designation: "assistant_director", status: "active" },
                  { id: "4", name: "Inshal Sheikh", email: "inshalsheikh@rekhta.org", role: "member", designation: "member", status: "active" },
                  { id: "5", name: "Wani Aamir", email: "waniaamir@rekhta.org", role: "member", designation: "member", status: "active" },
                ]
            ).map((member) => (
              <div key={member.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#17243A]">{member.name}</span>
                    <span className="text-2xs font-extrabold uppercase px-2 py-0.5 rounded-full bg-brand-mint/50 text-[#17243A]">
                      {getDesignationDisplayName(member.designation, member.role)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{member.email}</p>
                </div>
                <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                  {member.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 6: DEPARTMENT LEAVES */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "leaves" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-200">
            <h3 className="font-bold text-sm text-[#17243A]">Department Leave Management</h3>
            <p className="text-xs text-gray-500">Endorse or review leave applications for media staff</p>
          </div>

          {deptLeaves.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-gray-200">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700">No leave requests pending for Media.</p>
              <p className="text-xs text-gray-400 mt-1">Staff leave requests will appear here for endorsement.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs divide-y divide-gray-100">
              {deptLeaves.map((l) => (
                <div key={l._id || l.id} className="p-4 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-[#17243A]">{l.applicantName}</span>
                    <p className="text-2xs text-gray-500">
                      {new Date(l.startDate).toLocaleDateString()} to {new Date(l.endDate).toLocaleDateString()} • {l.leaveType}
                    </p>
                    <p className="text-xs text-gray-700 mt-1">{l.reason}</p>
                  </div>
                  <span className="text-2xs font-bold uppercase px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                    {l.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 7: BLIND ASSESSMENT */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "assessment" && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs max-w-2xl">
          <div className="flex items-center gap-2 mb-4 text-[#800F35]">
            <Award className="w-5 h-5" />
            <h3 className="font-bold text-base text-[#17243A]">Confidential Blind Assessment</h3>
          </div>
          <p className="text-xs text-gray-600 mb-6">
            Quarterly grading for media members. Evaluations are blinded and encrypted before being aggregated into organizational merit ledgers.
          </p>

          <form onSubmit={handleSubmitAssessment} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Evaluate Candidate</label>
              <select
                value={assessmentCandidateId}
                onChange={(e) => setAssessmentCandidateId(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#800F35]"
              >
                <option value="">-- Select Member --</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({getDesignationDisplayName(m.designation, m.role)})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Execution Speed ({scoreExecution}/10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={scoreExecution}
                  onChange={(e) => setScoreExecution(Number(e.target.value))}
                  className="w-full accent-[#800F35]"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Creative Quality ({scoreQuality}/10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={scoreQuality}
                  onChange={(e) => setScoreQuality(Number(e.target.value))}
                  className="w-full accent-[#800F35]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Confidential Feedback</label>
              <textarea
                rows={3}
                value={assessmentFeedback}
                onChange={(e) => setAssessmentFeedback(e.target.value)}
                placeholder="Qualitative observations regarding visual craftsmanship, punctuality, and teamwork..."
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#800F35]"
              />
            </div>

            <button
              type="submit"
              disabled={submittingAssessment}
              className="px-4 py-2 bg-[#800F35] text-white font-semibold rounded-xl hover:bg-[#680C2B] transition disabled:opacity-50"
            >
              {submittingAssessment ? "Submitting Grading..." : "Submit Confidential Evaluation"}
            </button>
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: UPLOAD MEDIA ASSET */}
      {/* ------------------------------------------------------------- */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-sm text-[#17243A] flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-[#800F35]" /> Upload Creative Deliverable
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadMedia} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Asset Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Mushaira 2026 Stage Banner"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#800F35]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Asset Type</label>
                  <select
                    value={uploadFileType}
                    onChange={(e) => setUploadFileType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#800F35]"
                  >
                    <option value="image">Image / Graphic</option>
                    <option value="video">Video Reel</option>
                    <option value="document">Vector / PDF</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Tags</label>
                  <input
                    type="text"
                    placeholder="calligraphy, banner"
                    value={uploadTags}
                    onChange={(e) => setUploadTags(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#800F35]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Media URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://... or /images/banner.jpg"
                  value={uploadUrl}
                  onChange={(e) => setUploadUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#800F35]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Caption / Summary</label>
                <input
                  type="text"
                  placeholder="Brief descriptive note for repository indexing..."
                  value={uploadCaption}
                  onChange={(e) => setUploadCaption(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#800F35]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3 py-1.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-1.5 bg-[#800F35] text-white font-semibold rounded-xl hover:bg-[#680C2B] transition disabled:opacity-50"
                >
                  {uploading ? "Saving..." : isHeadPublisher ? "Publish Asset" : "Submit for Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ASSIGN MEDIA TASK */}
      {/* ------------------------------------------------------------- */}
      {showCreateTaskModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-sm text-[#17243A]">Assign Media Deliverable</h3>
              <button onClick={() => setShowCreateTaskModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Karachi Youth Summit Event Photography"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#800F35]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Assignee</label>
                <select
                  value={newTaskAssignedTo}
                  onChange={(e) => setNewTaskAssignedTo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#800F35]"
                >
                  <option value="">-- Select Team Member --</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({getDesignationDisplayName(m.designation, m.role)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#800F35]"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#800F35]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description & Requirements</label>
                <textarea
                  rows={3}
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Technical specifications, color palette, aspect ratios, deliverable formats..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#800F35]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateTaskModal(false)}
                  className="px-3 py-1.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTask}
                  className="px-4 py-1.5 bg-[#800F35] text-white font-semibold rounded-xl hover:bg-[#680C2B] transition disabled:opacity-50"
                >
                  {submittingTask ? "Assigning..." : "Assign Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: PREVIEW ASSET */}
      {/* ------------------------------------------------------------- */}
      {previewAsset && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 shadow-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-sm text-[#17243A] truncate">{previewAsset.title}</h3>
              <button onClick={() => setPreviewAsset(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-3 max-h-[60vh] overflow-hidden rounded-xl flex items-center justify-center bg-black/5">
              {previewAsset.fileType === "image" ? (
                <img src={previewAsset.url} alt={previewAsset.title} className="max-h-[55vh] object-contain" />
              ) : (
                <div className="py-16 text-center text-gray-500">
                  <Film className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="font-bold text-xs uppercase">{previewAsset.fileType} Deliverable</p>
                  <a
                    href={previewAsset.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs text-[#800F35] font-semibold hover:underline"
                  >
                    Open Resource File <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-2xs text-gray-500">
              <div>
                <span>Status: <strong className="uppercase">{previewAsset.publicationStatus}</strong></span>
                {previewAsset.tags && previewAsset.tags.length > 0 && (
                  <span className="ml-3">Tags: {previewAsset.tags.join(", ")}</span>
                )}
              </div>
              <a
                href={previewAsset.url}
                target="_blank"
                rel="noreferrer"
                download
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg flex items-center gap-1"
              >
                <Download className="w-3 h-3" /> Download
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: REVIEW DELIVERABLE */}
      {/* ------------------------------------------------------------- */}
      {selectedTaskForReview && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-sm text-[#17243A]">Review Deliverable: {selectedTaskForReview.title}</h3>
              <button onClick={() => setSelectedTaskForReview(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReviewTask} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Decision</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewAction("approve")}
                    className={`py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                      reviewAction === "approve"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <Check className="w-4 h-4" /> Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewAction("request_revision")}
                    className={`py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                      reviewAction === "request_revision"
                        ? "bg-amber-600 text-white shadow-xs"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <RotateCcw className="w-4 h-4" /> Request Revision
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Feedback / Quality Notes</label>
                <textarea
                  rows={3}
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  placeholder="Specific visual adjustments, typography sizing, or color balance feedback..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#800F35]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedTaskForReview(null)}
                  className="px-3 py-1.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-4 py-1.5 bg-[#800F35] text-white font-semibold rounded-xl hover:bg-[#680C2B] transition disabled:opacity-50"
                >
                  {submittingReview ? "Submitting..." : "Save Review Decision"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MediaDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-gray-500">
          Loading Media Department Portal...
        </div>
      }
    >
      <MediaDashboardContent />
    </Suspense>
  );
}
