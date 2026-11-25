"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { API_BASE } from "@/lib/api";
import {
  Users,
  Briefcase,
  UserPlus,
  Calendar,
  Search,
  Filter,
  Plus,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Building2,
  FileText,
  UserCheck,
  UserX,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  Download,
  Megaphone,
  Send,
  FileSpreadsheet,
  KeyRound,
  Copy,
  Link2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  canManageRecruitment,
  canExportHRData,
  canSendDepartmentAnnouncements,
  canCreateAccounts,
  isHRMember,
} from "@/lib/authorization";

interface HRMetrics {
  totalEmployees: number;
  activeEmployees: number;
  activeCampaigns: number;
  totalApplications: number;
  pendingApplications: number;
  shortlistedApplications: number;
  interviewingApplications: number;
  selectedApplications: number;
  rejectedApplications: number;
  pendingLeaves: number;
  approvedLeaves: number;
}

interface CampaignItem {
  _id?: string;
  id?: string;
  title: string;
  department: string;
  description: string;
  requirements?: string[];
  openingsCount: number;
  deadline?: string;
  status: string;
  createdByName?: string;
  applicationsCount?: number;
  createdAt?: string;
}

interface ApplicationItem {
  _id?: string;
  id?: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  instagramId?: string;
  city?: string;
  age?: string;
  areaOfInterest?: string;
  department?: string;
  motivation?: string;
  coverLetter?: string;
  resumeUrl?: string;
  portfolioUrl?: string;
  source: string;
  status: string;
  submissionId?: string;
  reviewNotes?: string;
  interviewDetails?: {
    scheduledAt?: string;
    interviewers?: string[];
    mode?: string;
    meetingLink?: string;
    notes?: string;
  };
  onboardingDetails?: {
    onboardedAt?: string;
    assignedRole?: string;
    assignedDepartment?: string;
    userId?: string;
  };
  statusHistory?: Array<{
    status: string;
    changedByName?: string;
    changedAt: string;
    note?: string;
  }>;
  createdAt: string;
}

interface EmployeeItem {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  departmentCode?: string;
  designation?: string;
  phoneNumber?: string;
  status: string;
  createdAt?: string;
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
  supportingDoc?: string;
  status: string;
  reviewedByName?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  createdAt: string;
}

interface AnnouncementItem {
  _id?: string;
  id?: string;
  announcementId: string;
  title: string;
  message: string;
  targetDepartment: string;
  targetDepartmentCode: string;
  senderName: string;
  senderRole: string;
  senderDesignation?: string;
  recipientCount: number;
  createdAt: string;
}

interface AccountItem {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  departmentCode?: string;
  designation?: string;
  phoneNumber?: string;
  status: string;
  activationStatus: "Active" | "Pending Activation" | "Expired" | "Disabled" | string;
  activationExpires?: string;
  createdAt: string;
}

function HRDashboardContent() {
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

  const [metrics, setMetrics] = useState<HRMetrics | null>(null);
  const [deptDistribution, setDeptDistribution] = useState<{ name: string; count: number }[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [leaves, setLeaves] = useState<LeaveItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);

  // Accounts state (Phase D.2.2.6)
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [accountSearch, setAccountSearch] = useState("");
  const [accountStatusFilter, setAccountStatusFilter] = useState("all");
  const [accountRoleFilter, setAccountRoleFilter] = useState("all");
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [newAccName, setNewAccName] = useState("");
  const [newAccEmail, setNewAccEmail] = useState("");
  const [newAccRole, setNewAccRole] = useState("member");
  const [newAccDept, setNewAccDept] = useState("Literature");
  const [newAccDesignation, setNewAccDesignation] = useState("member");
  const [newAccPhone, setNewAccPhone] = useState("");
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [generatedActivation, setGeneratedActivation] = useState<{
    token: string;
    url: string;
    expiresAt: string;
    accountName: string;
    accountEmail: string;
    role?: string;
    department?: string;
    designation?: string;
    status?: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Filtering states
  const [appStatusFilter, setAppStatusFilter] = useState("all");
  const [appDeptFilter, setAppDeptFilter] = useState("all");
  const [appSearch, setAppSearch] = useState("");
  const [empDeptFilter, setEmpDeptFilter] = useState("all");
  const [empSearch, setEmpSearch] = useState("");
  const [leaveStatusFilter, setLeaveStatusFilter] = useState("all");

  // Modals state
  const [showCreateCampaignModal, setShowCreateCampaignModal] = useState(false);
  const [newCampaignTitle, setNewCampaignTitle] = useState("");
  const [newCampaignDept, setNewCampaignDept] = useState("General");
  const [newCampaignDesc, setNewCampaignDesc] = useState("");
  const [newCampaignReqs, setNewCampaignReqs] = useState("");
  const [newCampaignOpenings, setNewCampaignOpenings] = useState(2);
  const [newCampaignDeadline, setNewCampaignDeadline] = useState("");

  // Application detail & actions modal
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewMode, setInterviewMode] = useState("Online");
  const [interviewLink, setInterviewLink] = useState("");
  const [interviewNotes, setInterviewNotes] = useState("");

  // Assign Interviewer Modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignInterviewerId, setAssignInterviewerId] = useState("");
  const [assignInterviewerName, setAssignInterviewerName] = useState("");
  const [assignDate, setAssignDate] = useState("");
  const [assignMode, setAssignMode] = useState("Online");
  const [assignLink, setAssignLink] = useState("");
  const [assignNotes, setAssignNotes] = useState("");

  // Interview Feedback Modal
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState<number>(4);
  const [feedbackRec, setFeedbackRec] = useState<string>("hire");
  const [feedbackNotes, setFeedbackNotes] = useState("");

  // Final Decision Modal
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [decisionValue, setDecisionValue] = useState<string>("selected");
  const [decisionNotes, setDecisionNotes] = useState("");

  // Department Announcement State
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementDept, setAnnouncementDept] = useState("All");
  const [announcementMsg, setAnnouncementMsg] = useState("");
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false);

  // Export State
  const [exportType, setExportType] = useState<"applications" | "leaves">("applications");
  const [exportFormat, setExportFormat] = useState<"xlsx" | "csv">("xlsx");
  const [exportStatus, setExportStatus] = useState("all");
  const [exportDept, setExportDept] = useState("all");
  const [exportSource, setExportSource] = useState("all");
  const [exportStartDate, setExportStartDate] = useState("");
  const [exportEndDate, setExportEndDate] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  // Onboarding modal
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [onboardRole, setOnboardRole] = useState("member");
  const [onboardDept, setOnboardDept] = useState("Literature");
  const [onboardDesignation, setOnboardDesignation] = useState("Volunteer / Contributor");
  const [onboardActivationLink, setOnboardActivationLink] = useState<string | null>(null);

  // Leave review modal
  const [selectedLeave, setSelectedLeave] = useState<LeaveItem | null>(null);
  const [leaveAction, setLeaveAction] = useState<"approve" | "reject">("approve");
  const [leaveReviewNotes, setLeaveReviewNotes] = useState("");

  const fetchHRData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch Overview & Metrics
      const resOverview = await fetch(`${API_BASE}/hr/overview`, {
        credentials: "include",
        headers: { "X-Requested-With": "XMLHttpRequest" },
      });
      if (resOverview.ok) {
        const data = await resOverview.json();
        if (data.success) {
          setMetrics(data.metrics);
          setDeptDistribution(data.departmentDistribution || []);
          if (data.campaigns) setCampaigns(data.campaigns);
        }
      }

      // 2. Fetch Applications
      const resApps = await fetch(`${API_BASE}/hr/applications`, {
        credentials: "include",
        headers: { "X-Requested-With": "XMLHttpRequest" },
      });
      if (resApps.ok) {
        const data = await resApps.json();
        if (data.success) setApplications(data.applications || []);
      }

      // 3. Fetch Employees
      const resEmps = await fetch(`${API_BASE}/hr/employees`, {
        credentials: "include",
        headers: { "X-Requested-With": "XMLHttpRequest" },
      });
      if (resEmps.ok) {
        const data = await resEmps.json();
        if (data.success) setEmployees(data.employees || []);
      }

      // 4. Fetch Leaves
      const resLeaves = await fetch(`${API_BASE}/hr/leaves`, {
        credentials: "include",
        headers: { "X-Requested-With": "XMLHttpRequest" },
      });
      if (resLeaves.ok) {
        const data = await resLeaves.json();
        if (data.success) setLeaves(data.leaves || []);
      }

      // 5. Fetch Announcements
      const resAnn = await fetch(`${API_BASE}/hr/announcements`, {
        credentials: "include",
        headers: { "X-Requested-With": "XMLHttpRequest" },
      });
      if (resAnn.ok) {
        const data = await resAnn.json();
        if (data.success) setAnnouncements(data.announcements || []);
      }

      // 6. Fetch Accounts (Phase D.2.2.6)
      const resAccs = await fetch(`${API_BASE}/hr/accounts`, {
        credentials: "include",
        headers: { "X-Requested-With": "XMLHttpRequest" },
      });
      if (resAccs.ok) {
        const data = await resAccs.json();
        if (data.success) setAccounts(data.accounts || []);
      }
    } catch {
      setError("Unable to connect to the HR Management service.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchHRData();
  }, [fetchHRData]);

  // Handle Create Account (Phase D.2.2.6)
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingAccount(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/hr/accounts`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({
          name: newAccName,
          email: newAccEmail,
          role: newAccRole,
          department: newAccDept,
          designation: newAccDesignation,
          phoneNumber: newAccPhone,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setShowCreateAccountModal(false);
        const actUrl = data.activationUrl || data.activation?.url;
        setGeneratedActivation({
          token: data.activation?.token || data.activationToken || "",
          url: actUrl,
          expiresAt: data.activation?.expiresAt || data.expiresAt || new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
          accountName: newAccName,
          accountEmail: newAccEmail,
          role: newAccRole,
          department: newAccDept,
          designation: newAccDesignation,
          status: "Pending Activation",
        });
        setActionSuccess(`Account provisioned successfully for ${newAccName}! Copy the activation link below.`);
        setNewAccName("");
        setNewAccEmail("");
        setNewAccPhone("");
        fetchHRData();
      } else {
        setError(data.error || "Failed to create account.");
      }
    } catch {
      setError("Network error while creating account.");
    } finally {
      setCreatingAccount(false);
    }
  };

  // Handle Regenerate Activation Link (Phase D.2.2.6)
  const handleRegenerateActivation = async (accountId: string, accountName: string, accountEmail: string) => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/hr/accounts/${accountId}/regenerate-activation`, {
        method: "POST",
        credentials: "include",
        headers: { "X-Requested-With": "XMLHttpRequest" },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const actUrl = data.activationUrl || data.activation?.url;
        const emp = employees.find((e) => e.id === accountId || e._id === accountId);
        setGeneratedActivation({
          token: data.activation?.token || data.activationToken || "",
          url: actUrl,
          expiresAt: data.activation?.expiresAt || data.expiresAt || new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
          accountName,
          accountEmail,
          role: emp?.role || "member",
          department: emp?.department || "General",
          designation: emp?.designation || "Staff",
          status: "Pending Activation",
        });
        setActionSuccess(`New activation link generated for ${accountName} (valid for 7 days).`);
        fetchHRData();
      } else {
        setError(data.error || "Failed to regenerate activation link.");
      }
    } catch {
      setError("Network error while regenerating activation link.");
    }
  };

  const copyActivationLink = (url: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  // Handle Create Campaign
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignTitle || !newCampaignDesc) return;
    try {
      const res = await fetch(`${API_BASE}/hr/campaigns`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({
          title: newCampaignTitle,
          department: newCampaignDept,
          description: newCampaignDesc,
          requirements: newCampaignReqs.split(",").map((r) => r.trim()).filter(Boolean),
          openingsCount: newCampaignOpenings,
          deadline: newCampaignDeadline || undefined,
        }),
      });
      if (res.ok) {
        setActionSuccess("Recruitment campaign created successfully.");
        setShowCreateCampaignModal(false);
        setNewCampaignTitle("");
        setNewCampaignDesc("");
        setNewCampaignReqs("");
        fetchHRData();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create campaign.");
      }
    } catch {
      setError("Error creating campaign.");
    }
  };

  // Handle Application Status Update
  const handleUpdateAppStatus = async (appId: string, status: string, notes?: string) => {
    try {
      const res = await fetch(`${API_BASE}/hr/applications/${appId}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({ status, notes: notes || `Moved to ${status}` }),
      });
      if (res.ok) {
        setActionSuccess(`Application status changed to ${status}.`);
        if (selectedApp && (selectedApp._id === appId || selectedApp.id === appId)) {
          setSelectedApp((prev) => (prev ? { ...prev, status } : null));
        }
        fetchHRData();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update status.");
      }
    } catch {
      setError("Error updating status.");
    }
  };

  // Handle Schedule Interview
  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !interviewDate) return;
    const appId = selectedApp._id || selectedApp.id;
    try {
      const res = await fetch(`${API_BASE}/hr/applications/${appId}/interview`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({
          scheduledAt: interviewDate,
          mode: interviewMode,
          meetingLink: interviewLink,
          notes: interviewNotes,
          interviewers: [user?.name || "HR Panel"],
        }),
      });
      if (res.ok) {
        setActionSuccess("Interview scheduled successfully.");
        setShowInterviewModal(false);
        fetchHRData();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to schedule interview.");
      }
    } catch {
      setError("Error scheduling interview.");
    }
  };

  // Handle Onboard Candidate
  const handleOnboardCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    const appId = selectedApp._id || selectedApp.id;
    try {
      const res = await fetch(`${API_BASE}/hr/applications/${appId}/onboard`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({
          role: onboardRole,
          department: onboardDept,
          designation: onboardDesignation,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess(`Candidate ${selectedApp.fullName} successfully onboarded!`);
        setOnboardActivationLink(data.activationUrl || `/portal/activate?token=${data.activationToken}`);
        fetchHRData();
      } else {
        setError(data.error || "Failed to onboard candidate.");
      }
    } catch {
      setError("Error onboarding candidate.");
    }
  };

  // Handle Review Leave
  const handleReviewLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeave) return;
    const leaveId = selectedLeave._id || selectedLeave.id;
    try {
      const res = await fetch(`${API_BASE}/hr/leaves/${leaveId}/review`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({
          action: leaveAction,
          notes: leaveReviewNotes,
        }),
      });
      if (res.ok) {
        setActionSuccess(`Leave request has been ${leaveAction === "approve" ? "approved" : "rejected"}.`);
        setSelectedLeave(null);
        setLeaveReviewNotes("");
        fetchHRData();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to process leave review.");
      }
    } catch {
      setError("Error processing leave review.");
    }
  };

  // Handle Assign Interviewer
  const handleAssignInterviewer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !assignInterviewerId) return;
    const appId = selectedApp._id || selectedApp.id;
    try {
      const res = await fetch(`${API_BASE}/hr/applications/${appId}/assign-interviewer`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({
          interviewerId: assignInterviewerId,
          interviewerName: assignInterviewerName,
          scheduledAt: assignDate || undefined,
          mode: assignMode,
          meetingLink: assignLink,
          notes: assignNotes,
        }),
      });
      if (res.ok) {
        setActionSuccess(`Interviewer assigned for ${selectedApp.fullName}.`);
        setShowAssignModal(false);
        fetchHRData();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to assign interviewer.");
      }
    } catch {
      setError("Error assigning interviewer.");
    }
  };

  // Handle Interview Feedback
  const handleInterviewFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    const appId = selectedApp._id || selectedApp.id;
    try {
      const res = await fetch(`${API_BASE}/hr/applications/${appId}/interview-feedback`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({
          rating: feedbackRating,
          recommendation: feedbackRec,
          feedbackNotes,
        }),
      });
      if (res.ok) {
        setActionSuccess("Interview feedback and recommendation recorded.");
        setShowFeedbackModal(false);
        fetchHRData();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to submit interview feedback.");
      }
    } catch {
      setError("Error submitting interview feedback.");
    }
  };

  // Handle Record Final Decision
  const handleRecordDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    const appId = selectedApp._id || selectedApp.id;
    try {
      const res = await fetch(`${API_BASE}/hr/applications/${appId}/decision`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({
          decision: decisionValue,
          notes: decisionNotes,
        }),
      });
      if (res.ok) {
        setActionSuccess(`Candidate final decision recorded as '${decisionValue}'.`);
        setShowDecisionModal(false);
        fetchHRData();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to record decision.");
      }
    } catch {
      setError("Error recording decision.");
    }
  };

  // Handle Dispatch Department Announcement
  const handleDispatchAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle || !announcementMsg) return;
    try {
      setSendingAnnouncement(true);
      const res = await fetch(`${API_BASE}/hr/announcements`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({
          title: announcementTitle,
          message: announcementMsg,
          targetDepartment: announcementDept,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess(`Announcement dispatched to ${announcementDept} successfully.`);
        setAnnouncementTitle("");
        setAnnouncementMsg("");
        fetchHRData();
      } else {
        setError(data.error || "Failed to dispatch announcement.");
      }
    } catch {
      setError("Error dispatching announcement.");
    } finally {
      setSendingAnnouncement(false);
    }
  };

  // Handle Data Export
  const handleExport = async (type: "applications" | "leaves") => {
    try {
      setIsExporting(true);
      const params = new URLSearchParams();
      params.append("format", exportFormat);
      if (type === "applications") {
        if (exportStatus !== "all") params.append("status", exportStatus);
        if (exportDept !== "all") params.append("department", exportDept);
        if (exportSource !== "all") params.append("source", exportSource);
        if (exportStartDate) params.append("startDate", exportStartDate);
        if (exportEndDate) params.append("endDate", exportEndDate);
      } else {
        if (exportStatus !== "all") params.append("status", exportStatus);
        if (exportDept !== "all") params.append("department", exportDept);
        if (exportStartDate) params.append("startDate", exportStartDate);
        if (exportEndDate) params.append("endDate", exportEndDate);
      }

      const url = `${API_BASE}/hr/export/${type}?${params.toString()}`;
      const res = await fetch(url, {
        credentials: "include",
        headers: { "X-Requested-With": "XMLHttpRequest" },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Export failed.");
        setIsExporting(false);
        return;
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `hr_${type}_export_${Date.now()}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
      setActionSuccess(`Successfully exported ${type} in ${exportFormat.toUpperCase()} format.`);
    } catch {
      setError("Error downloading export file.");
    } finally {
      setIsExporting(false);
    }
  };

  // Filtered applications
  const filteredApplications = applications.filter((app) => {
    if (appStatusFilter !== "all" && app.status !== appStatusFilter) return false;
    if (appDeptFilter !== "all") {
      const d = appDeptFilter.toLowerCase();
      const matchDept = app.department?.toLowerCase() === d;
      const matchArea = app.areaOfInterest?.toLowerCase().includes(d);
      if (!matchDept && !matchArea) return false;
    }
    if (appSearch) {
      const s = appSearch.toLowerCase();
      const matchName = app.fullName.toLowerCase().includes(s);
      const matchEmail = app.email.toLowerCase().includes(s);
      const matchPhone = app.phoneNumber.includes(s);
      if (!matchName && !matchEmail && !matchPhone) return false;
    }
    return true;
  });

  // Filtered employees
  const filteredEmployees = employees.filter((emp) => {
    if (empDeptFilter !== "all" && emp.department !== empDeptFilter) return false;
    if (empSearch) {
      const s = empSearch.toLowerCase();
      const matchName = emp.name.toLowerCase().includes(s);
      const matchEmail = emp.email.toLowerCase().includes(s);
      if (!matchName && !matchEmail) return false;
    }
    return true;
  });

  // Filtered leaves
  const filteredLeaves = leaves.filter((leave) => {
    if (leaveStatusFilter !== "all" && leave.status !== leaveStatusFilter) return false;
    return true;
  });

  // Filtered accounts (Phase D.2.2.6)
  const filteredAccounts = accounts.filter((acc) => {
    if (accountStatusFilter !== "all" && acc.activationStatus !== accountStatusFilter) return false;
    if (accountRoleFilter !== "all" && acc.role !== accountRoleFilter) return false;
    if (accountSearch) {
      const q = accountSearch.toLowerCase();
      const matchName = acc.name.toLowerCase().includes(q);
      const matchEmail = acc.email.toLowerCase().includes(q);
      if (!matchName && !matchEmail) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Executive Command Header */}
      <div className="bg-[#17243A] text-white rounded-2xl p-5 sm:p-7 shadow-rekhta flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-[#233550]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-urdu text-lg sm:text-xl text-[#D7A84B] font-bold">
              شعبہ افرادی قوت
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#800F35] text-white font-medium border border-[#9F1239]">
              Human Resources Portal
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Human Resources & Recruitment
          </h1>
          <p className="text-xs text-slate-300 max-w-xl">
            Administer personnel rosters, account provisioning, candidate screening pipelines, official announcements, data exports, and final leave approvals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-stretch sm:self-auto shrink-0">
          <button
            onClick={() => fetchHRData()}
            disabled={loading}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg border border-white/20 transition active:scale-95 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          {canCreateAccounts(user) && (
            <button
              onClick={() => setShowCreateAccountModal(true)}
              className="px-4 py-2 bg-[#D7A84B] hover:bg-[#C2943A] text-[#17243A] text-xs font-bold rounded-lg shadow-sm transition active:scale-95 flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Provision Account
            </button>
          )}
          <button
            onClick={() => setShowCreateCampaignModal(true)}
            className="px-4 py-2 bg-[#800F35] hover:bg-[#600B27] text-white text-xs font-semibold rounded-lg shadow-sm transition active:scale-95 flex items-center gap-1.5 border border-[#9F1239]"
          >
            <Plus className="w-3.5 h-3.5" />
            New Campaign
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 overflow-x-auto pb-1 text-xs font-semibold">
          {[
            { id: "overview", label: "Overview", icon: Users },
            { id: "accounts", label: `Account Provisioning (${accounts.length})`, icon: KeyRound },
            { id: "recruitment", label: `Candidate Pipeline (${applications.length})`, icon: UserPlus },
            { id: "campaigns", label: `Campaigns (${campaigns.length})`, icon: Briefcase },
            { id: "employees", label: `Staff Directory (${employees.length})`, icon: Users },
            { id: "leaves", label: `Leave Approvals (${leaves.length})`, icon: Calendar },
            { id: "export", label: "Data Export", icon: Download },
            { id: "announcements", label: "Announcements", icon: Megaphone },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  window.history.replaceState(null, "", tab.id === "overview" ? "/portal/hr" : `/portal/hr?tab=${tab.id}`);
                }}
                className={`pb-3 border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? "border-[#800F35] text-[#800F35]"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Alerts */}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-800 text-sm animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-medium">{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-xs underline text-emerald-700">Dismiss</button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-rose-800 text-sm animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span className="font-medium">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-xs underline text-rose-700">Dismiss</button>
        </div>
      )}

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Staff & Members</span>
                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#17243A]">{metrics?.totalEmployees || 0}</span>
                <span className="text-xs text-emerald-600 font-semibold">{metrics?.activeEmployees || 0} Active</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Across all operational wings</p>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Campaigns</span>
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <Briefcase className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#17243A]">{metrics?.activeCampaigns || 0}</span>
                <span className="text-xs text-blue-600 font-semibold">Drives Active</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">{campaigns.reduce((sum, c) => sum + (c.openingsCount || 0), 0)} open positions</p>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Applicant Pipeline</span>
                <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#17243A]">{metrics?.totalApplications || 0}</span>
                <span className="text-xs text-purple-600 font-semibold">{metrics?.pendingApplications || 0} Pending</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Volunteer & portal applications</p>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Leave Requests</span>
                <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#17243A]">{metrics?.pendingLeaves || 0}</span>
                <span className="text-xs text-amber-600 font-semibold">Pending Review</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Approved: {metrics?.approvedLeaves || 0}</p>
            </div>
          </div>

          {/* Department Headcount Breakdown */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-2xs">
            <h2 className="text-base font-bold font-heading text-brand-pitch mb-4 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand-emerald" />
              Department Workforce Distribution
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
              {deptDistribution.map((dept) => (
                <div key={dept.name} className="p-4 rounded-xl bg-slate-50 border border-gray-100 text-center">
                  <span className="text-2xs font-semibold text-gray-500 uppercase block tracking-wider truncate">{dept.name}</span>
                  <span className="text-2xl font-extrabold text-brand-dark block mt-1">{dept.count}</span>
                  <span className="text-2xs text-gray-400">members</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dual Feed: Recent Applications & Recent Leaves */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Applications */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold font-heading text-brand-pitch flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-purple-600" />
                  Recent Candidate Applications
                </h3>
                <a href="/portal/hr?tab=recruitment" className="text-xs font-semibold text-brand-emerald hover:underline">
                  View All ({applications.length})
                </a>
              </div>
              <div className="divide-y divide-gray-100">
                {applications.slice(0, 5).map((app) => (
                  <div key={app._id || app.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-gray-900">{app.fullName}</p>
                      <p className="text-2xs sm:text-xs text-gray-500">{app.email} • {app.areaOfInterest || app.department || "General"}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-2xs font-semibold capitalize bg-purple-50 text-purple-700 border border-purple-200">
                      {app.status.replace(/_/g, " ")}
                    </span>
                  </div>
                ))}
                {applications.length === 0 && (
                  <p className="text-xs text-gray-400 py-4 text-center">No applications logged yet.</p>
                )}
              </div>
            </div>

            {/* Recent Leaves */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold font-heading text-brand-pitch flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  Recent Leave Requests
                </h3>
                <a href="/portal/hr?tab=leaves" className="text-xs font-semibold text-brand-emerald hover:underline">
                  View All ({leaves.length})
                </a>
              </div>
              <div className="divide-y divide-gray-100">
                {leaves.slice(0, 5).map((leave) => (
                  <div key={leave._id || leave.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-gray-900">{leave.memberName}</p>
                      <p className="text-2xs sm:text-xs text-gray-500">{leave.department} • {leave.leaveType} Leave</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-2xs font-semibold capitalize ${
                        leave.status === "approved"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : leave.status === "rejected"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {leave.status}
                    </span>
                  </div>
                ))}
                {leaves.length === 0 && (
                  <p className="text-xs text-gray-400 py-4 text-center">No leave requests logged yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: ACCOUNT PROVISIONING & ACTIVATION MANAGEMENT (Phase D.2.2.6) */}
      {activeTab === "accounts" && (
        <div className="space-y-6">
          {/* Top Header Card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold font-heading text-brand-pitch">Account Provisioning & Activation Links</h2>
                <p className="text-xs text-gray-500">Create portal member accounts and issue single-use cryptographic 7-day activation links.</p>
              </div>
              {canCreateAccounts(user) ? (
                <button
                  onClick={() => setShowCreateAccountModal(true)}
                  className="px-4 py-2 bg-[#800F35] hover:bg-[#600B27] text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-2 self-start sm:self-auto"
                >
                  <KeyRound className="w-4 h-4" />
                  Provision New Account
                </button>
              ) : (
                <div className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                  Read-only: Account provisioning requires HR Leadership authorization.
                </div>
              )}
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-100">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Total Managed Accounts</span>
                <span className="text-2xl font-bold text-gray-900 mt-1 block">{accounts.length}</span>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">Active & Verified</span>
                <span className="text-2xl font-bold text-emerald-800 mt-1 block">
                  {accounts.filter((a) => a.activationStatus === "Active").length}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100">
                <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">Pending Activation</span>
                <span className="text-2xl font-bold text-amber-800 mt-1 block">
                  {accounts.filter((a) => a.activationStatus === "Pending Activation").length}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-100">
                <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider block">Expired Activation Links</span>
                <span className="text-2xl font-bold text-rose-800 mt-1 block">
                  {accounts.filter((a) => a.activationStatus === "Expired").length}
                </span>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-gray-100">
              <div className="relative flex-1 w-full">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search accounts by name or email..."
                  value={accountSearch}
                  onChange={(e) => setAccountSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-emerald"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={accountStatusFilter}
                  onChange={(e) => setAccountStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Pending Activation">Pending Activation</option>
                  <option value="Expired">Expired</option>
                  <option value="Disabled">Disabled</option>
                </select>
                <select
                  value={accountRoleFilter}
                  onChange={(e) => setAccountRoleFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none"
                >
                  <option value="all">All Technical Roles</option>
                  <option value="member">Member</option>
                  <option value="dept_literature">Dept Literature</option>
                  <option value="dept_media">Dept Media</option>
                  <option value="dept_marketing">Dept Marketing</option>
                  <option value="dept_outreach">Dept Outreach</option>
                  <option value="dept_content">Dept Content</option>
                  <option value="hr">HR</option>
                  <option value="finance">Finance</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
            </div>
          </div>

          {/* Accounts Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-500 font-semibold">
                    <th className="py-3 px-4">Account Member</th>
                    <th className="py-3 px-4">Technical Role</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Designation</th>
                    <th className="py-3 px-4">Activation Status</th>
                    <th className="py-3 px-4">Registered Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAccounts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-400">
                        No accounts match the selected filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredAccounts.map((acc) => {
                      const accId = (acc.id || acc._id) as string;
                      const status = acc.activationStatus;
                      const canRegenerate = ["Pending Activation", "Expired"].includes(status);

                      let badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
                      if (status === "Pending Activation") {
                        badgeClass = "bg-amber-50 text-amber-700 border-amber-200";
                      } else if (status === "Expired") {
                        badgeClass = "bg-rose-50 text-rose-700 border-rose-200";
                      } else if (status === "Disabled") {
                        badgeClass = "bg-slate-50 text-slate-700 border-slate-200";
                      }

                      return (
                        <tr key={accId} className="hover:bg-gray-50/60 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-semibold text-gray-900 block">{acc.name}</span>
                            <span className="text-gray-500 text-2xs block">{acc.email}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-2xs font-semibold bg-gray-100 text-gray-700 capitalize">
                              {acc.role.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-700">{acc.department || "—"}</td>
                          <td className="py-3 px-4 text-gray-600 font-medium">
                            {acc.designation ? acc.designation.replace(/_/g, " ") : "Member"}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-bold border ${badgeClass}`}>
                              {status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-500">
                            {acc.createdAt ? new Date(acc.createdAt).toLocaleDateString() : "—"}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {canRegenerate ? (
                              canCreateAccounts(user) ? (
                                <button
                                  onClick={() => handleRegenerateActivation(accId, acc.name, acc.email)}
                                  className="px-2.5 py-1 rounded-lg text-2xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 flex items-center gap-1 transition-colors ml-auto"
                                  title="Regenerate single-use 7-day activation link"
                                >
                                  <Link2 className="w-3 h-3" />
                                  Regenerate Link
                                </button>
                              ) : (
                                <span className="text-2xs text-gray-400">View Only</span>
                              )
                            ) : (
                              <span className="text-2xs text-emerald-600 font-medium flex items-center gap-1 justify-end">
                                <CheckCircle2 className="w-3 h-3" /> Activated
                              </span>
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

      {/* TAB 2: CAMPAIGNS */}
      {activeTab === "campaigns" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold font-heading text-brand-pitch">Recruitment Campaigns & Openings</h2>
                <p className="text-xs text-gray-500">Manage organizational talent acquisition drives and volunteer calls.</p>
              </div>
              <button
                onClick={() => setShowCreateCampaignModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-emerald text-white font-semibold text-xs hover:bg-brand-dark transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Drive
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {campaigns.map((camp) => (
                <div key={camp._id || camp.id} className="p-5 rounded-2xl border border-gray-100 bg-slate-50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider bg-brand-mint text-brand-dark">
                        {camp.department}
                      </span>
                      <span
                        className={`text-2xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                          camp.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {camp.status}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-brand-pitch mt-3">{camp.title}</h3>
                    <p className="text-xs text-gray-600 mt-2 line-clamp-3">{camp.description}</p>
                    {camp.requirements && camp.requirements.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {camp.requirements.map((req, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-white text-gray-600 rounded-md text-2xs border border-gray-200">
                            {req}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="mt-5 pt-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                    <span>Openings: <strong>{camp.openingsCount}</strong></span>
                    {camp.deadline && <span>Deadline: {new Date(camp.deadline).toLocaleDateString()}</span>}
                  </div>
                </div>
              ))}
              {campaigns.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-400">
                  <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p>No recruitment campaigns created yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RECRUITMENT PIPELINE */}
      {activeTab === "recruitment" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-2xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold font-heading text-brand-pitch">Candidate Applications Pool</h2>
                <p className="text-xs text-gray-500">Applications received through the public volunteer form and portal recruitment campaigns.</p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search candidate..."
                    value={appSearch}
                    onChange={(e) => setAppSearch(e.target.value)}
                    className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-emerald"
                  />
                </div>

                <select
                  value={appStatusFilter}
                  onChange={(e) => setAppStatusFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-white text-gray-700"
                >
                  <option value="all">All Statuses</option>
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="interview_scheduled">Interview Scheduled</option>
                  <option value="selected">Selected / Onboarded</option>
                  <option value="rejected">Rejected</option>
                </select>

                <select
                  value={appDeptFilter}
                  onChange={(e) => setAppDeptFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-white text-gray-700"
                >
                  <option value="all">All Areas</option>
                  <option value="Literature">Literature</option>
                  <option value="Media">Media</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Outreach">Outreach</option>
                  <option value="Content Creation">Content Creation</option>
                </select>
              </div>
            </div>

            {/* Applications Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-slate-50 text-gray-600 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Applicant</th>
                    <th className="py-3 px-4">Area / Dept</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Source</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Submitted</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredApplications.map((app) => (
                    <tr key={app._id || app.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-gray-900">
                        {app.fullName}
                        {app.city && <span className="block text-2xs font-normal text-gray-500">{app.city}</span>}
                      </td>
                      <td className="py-3 px-4 text-gray-700 font-medium">
                        {app.areaOfInterest || app.department || "General"}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        <span className="block">{app.email}</span>
                        <span className="block text-2xs text-gray-400">{app.phoneNumber}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-2xs font-medium bg-gray-100 text-gray-600">
                          {app.source === "website_volunteer_form" ? "Website Form" : "Portal Recruitment"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-2xs font-semibold capitalize ${
                            app.status === "shortlisted"
                              ? "bg-purple-100 text-purple-800"
                              : app.status === "interview_scheduled"
                              ? "bg-blue-100 text-blue-800"
                              : app.status === "selected"
                              ? "bg-emerald-100 text-emerald-800"
                              : app.status === "rejected"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {app.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-gray-200 text-gray-700 hover:bg-white hover:text-brand-dark transition-colors font-medium text-2xs shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredApplications.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-400">
                        No applications matching the filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: EMPLOYEE DIRECTORY */}
      {activeTab === "employees" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold font-heading text-brand-pitch">Staff & Volunteer Directory</h2>
                <p className="text-xs text-gray-500">Official roster of active contributors, heads, and members.</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search staff..."
                    value={empSearch}
                    onChange={(e) => setEmpSearch(e.target.value)}
                    className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-emerald"
                  />
                </div>

                <select
                  value={empDeptFilter}
                  onChange={(e) => setEmpDeptFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-white text-gray-700"
                >
                  <option value="all">All Departments</option>
                  <option value="Literature">Literature</option>
                  <option value="Media">Media</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Outreach">Outreach</option>
                  <option value="Content Creation">Content Creation</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-slate-50 text-gray-600 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Designation</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredEmployees.map((emp) => (
                    <tr key={emp._id || emp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-gray-900">{emp.name}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-2xs font-semibold capitalize bg-slate-100 text-slate-700">
                          {emp.role.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-700">{emp.department || "Organization-wide"}</td>
                      <td className="py-3 px-4 text-gray-600">{emp.designation || "Contributor"}</td>
                      <td className="py-3 px-4 text-gray-500">{emp.email}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-2xs font-semibold capitalize ${
                            emp.status === "active"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {emp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: LEAVE MANAGEMENT */}
      {activeTab === "leaves" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold font-heading text-brand-pitch">Organization Leave Requests</h2>
                <p className="text-xs text-gray-500">Centralized oversight of all staff and volunteer leave applications.</p>
              </div>

              <select
                value={leaveStatusFilter}
                onChange={(e) => setLeaveStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-gray-200 bg-white text-gray-700"
              >
                <option value="all">All Leave Statuses</option>
                <option value="pending">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-slate-50 text-gray-600 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Member</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Dates</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLeaves.map((leave) => (
                    <tr key={leave._id || leave.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-gray-900">{leave.memberName}</td>
                      <td className="py-3 px-4 text-gray-700 font-medium">{leave.department}</td>
                      <td className="py-3 px-4 text-gray-700">{leave.leaveType}</td>
                      <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-gray-600 max-w-xs truncate" title={leave.reason}>
                        {leave.reason}
                        {leave.supportingDoc && (
                          <a
                            href={leave.supportingDoc}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-2xs text-brand-emerald hover:underline ml-1.5"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Doc
                          </a>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-2xs font-semibold capitalize ${
                            leave.status === "approved"
                              ? "bg-emerald-100 text-emerald-800"
                              : leave.status === "rejected"
                              ? "bg-rose-100 text-rose-800"
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
                              setSelectedLeave(leave);
                              setLeaveAction("approve");
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-brand-emerald text-white text-2xs font-semibold hover:bg-brand-dark transition-colors"
                          >
                            Review
                          </button>
                        )}
                        {leave.status !== "pending" && (
                          <span className="text-2xs text-gray-400">
                            Reviewed by {leave.reviewedByName || "Admin"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredLeaves.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-400">
                        No leave records matching the filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: DATA EXPORT */}
      {activeTab === "export" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold font-heading text-brand-pitch flex items-center gap-2">
                  <Download className="w-5 h-5 text-brand-emerald" />
                  HR Data Export Center
                </h2>
                <p className="text-xs text-gray-500">
                  Export structured recruitment and leave datasets in Excel (.xlsx) or RFC 4180 CSV with UTF-8 BOM.
                </p>
              </div>
              <span className="text-2xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                Phase D.2.2.4 Export Engine
              </span>
            </div>

            {!canExportHRData(user) ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                <strong>Access Restricted:</strong> HR Team Members hold view-only permissions. Generating data exports requires authorization from HR Head, HR Director, HR Coordination In-charge, or Super Admin.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Export Config Form */}
                <div className="lg:col-span-2 space-y-4 p-5 bg-slate-50 rounded-2xl border border-gray-200/70">
                  <h3 className="text-sm font-bold text-gray-900">Export Parameters</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Dataset Type</label>
                      <select
                        value={exportType}
                        onChange={(e) => setExportType(e.target.value as "applications" | "leaves")}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white"
                      >
                        <option value="applications">Candidate Applications ({applications.length} records)</option>
                        <option value="leaves">Leave Requests ({leaves.length} records)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">File Format</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setExportFormat("xlsx")}
                          className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                            exportFormat === "xlsx"
                              ? "bg-brand-emerald text-white border-brand-emerald shadow-xs"
                              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          Excel (.xlsx)
                        </button>
                        <button
                          type="button"
                          onClick={() => setExportFormat("csv")}
                          className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                            exportFormat === "csv"
                              ? "bg-brand-emerald text-white border-brand-emerald shadow-xs"
                              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          CSV (.csv)
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Filter by Department</label>
                      <select
                        value={exportDept}
                        onChange={(e) => setExportDept(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white"
                      >
                        <option value="all">All Departments</option>
                        <option value="Literature">Literature</option>
                        <option value="Media">Media</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Outreach">Outreach</option>
                        <option value="Content Creation">Content Creation</option>
                        <option value="HR">HR</option>
                        <option value="Finance">Finance</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Filter by Status</label>
                      <select
                        value={exportStatus}
                        onChange={(e) => setExportStatus(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white"
                      >
                        <option value="all">All Statuses</option>
                        {exportType === "applications" ? (
                          <>
                            <option value="submitted">Submitted</option>
                            <option value="under_review">Under Review</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="interview_scheduled">Interview Scheduled</option>
                            <option value="interview_completed">Interview Completed</option>
                            <option value="selected">Selected</option>
                            <option value="not_selected">Not Selected</option>
                            <option value="rejected">Rejected</option>
                          </>
                        ) : (
                          <>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </>
                        )}
                      </select>
                    </div>

                    {exportType === "applications" && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Filter by Source</label>
                        <select
                          value={exportSource}
                          onChange={(e) => setExportSource(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white"
                        >
                          <option value="all">All Sources</option>
                          <option value="website_volunteer_form">Official Website Volunteer Form</option>
                          <option value="official_website">Official Website</option>
                          <option value="portal">Internal Portal</option>
                          <option value="referral">Referral</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={exportStartDate}
                        onChange={(e) => setExportStartDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">End Date</label>
                      <input
                        type="date"
                        value={exportEndDate}
                        onChange={(e) => setExportEndDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white"
                      />
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end">
                    <button
                      type="button"
                      disabled={isExporting}
                      onClick={() => handleExport(exportType)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-emerald text-white font-semibold text-xs hover:bg-brand-dark transition-colors shadow-xs disabled:opacity-50"
                    >
                      <Download className={`w-4 h-4 ${isExporting ? "animate-bounce" : ""}`} />
                      {isExporting ? "Generating Export..." : `Download ${exportType === "applications" ? "Applications" : "Leaves"} (${exportFormat.toUpperCase()})`}
                    </button>
                  </div>
                </div>

                {/* Audit & Compliance Sidebar */}
                <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-2xs space-y-3.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Export Security & Compliance</h4>
                  <ul className="text-2xs text-gray-600 space-y-2 list-disc pl-4">
                    <li>All exports are logged to the immutable <strong>Audit Trail</strong> with user identification and timestamp.</li>
                    <li>Pure JavaScript binary generator formats <code>.xlsx</code> with zero native build dependencies.</li>
                    <li>CSV files include UTF-8 Byte Order Mark (BOM) to ensure clean rendering in Microsoft Excel without character corruption.</li>
                    <li>Google Sheets integration automatically receives volunteer submissions and operates independently from file export.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 7: DEPARTMENT ANNOUNCEMENTS */}
      {activeTab === "announcements" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold font-heading text-brand-pitch flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-brand-emerald" />
                  Official Department Announcements
                </h2>
                <p className="text-xs text-gray-500">
                  Broadcast authoritative departmental notices and organizational updates to specific departments.
                </p>
              </div>
              <span className="text-2xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-mint text-brand-dark">
                HR Coordination Authority
              </span>
            </div>

            {/* Announcement Dispatch Form: Restricted exclusively to HR Coordination In-charge (and Super Admin) */}
            {canSendDepartmentAnnouncements(user) ? (
              <form onSubmit={handleDispatchAnnouncement} className="mb-8 p-5 bg-slate-50 rounded-2xl border border-gray-200/70 space-y-4">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Send className="w-4 h-4 text-brand-emerald" />
                  Dispatch New Department Announcement
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Announcement Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Schedule Update for Literature Circle Review"
                      value={announcementTitle}
                      onChange={(e) => setAnnouncementTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-emerald bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Target Department *</label>
                    <select
                      value={announcementDept}
                      onChange={(e) => setAnnouncementDept(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white"
                    >
                      <option value="All">All Departments (Broadcast)</option>
                      <option value="Literature">Literature</option>
                      <option value="Media">Media</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Outreach">Outreach</option>
                      <option value="Content Creation">Content Creation</option>
                      <option value="HR">HR</option>
                      <option value="Finance">Finance</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Announcement Message *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Enter official departmental notification text. Notifications will be dispatched to all members of the target department..."
                    value={announcementMsg}
                    onChange={(e) => setAnnouncementMsg(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-emerald bg-white"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={sendingAnnouncement}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-emerald text-white font-semibold text-xs hover:bg-brand-dark transition-colors shadow-xs disabled:opacity-50"
                  >
                    <Send className={`w-3.5 h-3.5 ${sendingAnnouncement ? "animate-spin" : ""}`} />
                    {sendingAnnouncement ? "Broadcasting..." : `Dispatch Announcement to ${announcementDept}`}
                  </button>
                </div>
              </form>
            ) : (
              <div className="mb-8 p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs">
                <strong>Dispatch Authority Notice:</strong> Only the <strong>HR Coordination In-charge</strong> holds authorization to broadcast official department announcements. You are viewing sent announcements in read-only audit mode.
              </div>
            )}

            {/* List of Sent Announcements */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-900">Dispatched Announcements History</h3>
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
                {announcements.map((ann) => (
                  <div key={ann._id || ann.id || ann.announcementId} className="p-4 bg-white hover:bg-slate-50/70 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider bg-brand-mint text-brand-dark">
                          {ann.targetDepartment}
                        </span>
                        <h4 className="font-bold text-gray-900 text-sm">{ann.title}</h4>
                      </div>
                      <span className="text-2xs text-gray-400">
                        {new Date(ann.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-gray-700 whitespace-pre-wrap">{ann.message}</p>
                    <div className="mt-3 flex items-center gap-4 text-2xs text-gray-500">
                      <span>Sender: <strong>{ann.senderName}</strong> ({ann.senderRole.replace(/_/g, " ")})</span>
                      <span>Target: <strong>{ann.targetDepartment}</strong></span>
                      <span>Recipients: <strong>{ann.recipientCount} members</strong></span>
                    </div>
                  </div>
                ))}

                {announcements.length === 0 && (
                  <div className="text-center py-12 text-gray-400 text-xs">
                    No official department announcements dispatched yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE CAMPAIGN */}
      {showCreateCampaignModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95">
            <h3 className="text-lg font-bold font-heading text-brand-pitch">Create Recruitment Campaign</h3>
            <p className="text-xs text-gray-500 mt-1">Publish a new volunteer or talent recruitment drive.</p>

            <form onSubmit={handleCreateCampaign} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Campaign Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Summer 2026 Literature Scholars Drive"
                  value={newCampaignTitle}
                  onChange={(e) => setNewCampaignTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-emerald"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Target Department</label>
                  <select
                    value={newCampaignDept}
                    onChange={(e) => setNewCampaignDept(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white"
                  >
                    <option value="General">General (Cross-Wing)</option>
                    <option value="Literature">Literature</option>
                    <option value="Media">Media</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Outreach">Outreach</option>
                    <option value="Content Creation">Content Creation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Openings Count</label>
                  <input
                    type="number"
                    min="1"
                    value={newCampaignOpenings}
                    onChange={(e) => setNewCampaignOpenings(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Outline the campaign goals, responsibilities, and target audience..."
                  value={newCampaignDesc}
                  onChange={(e) => setNewCampaignDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-emerald"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Requirements (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Urdu writing, Video editing, 6 months commitment"
                  value={newCampaignReqs}
                  onChange={(e) => setNewCampaignReqs(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Application Deadline</label>
                <input
                  type="date"
                  value={newCampaignDeadline}
                  onChange={(e) => setNewCampaignDeadline(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateCampaignModal(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-brand-emerald rounded-xl hover:bg-brand-dark transition-colors shadow-xs"
                >
                  Publish Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: APPLICATION DETAIL & ACTIONS */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-2xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  {selectedApp.status.replace(/_/g, " ")}
                </span>
                <h3 className="text-xl font-bold font-heading text-brand-pitch mt-2">{selectedApp.fullName}</h3>
                <p className="text-xs text-gray-500">{selectedApp.email} • {selectedApp.phoneNumber}</p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-gray-400 hover:text-gray-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl">
                <div>
                  <span className="text-gray-500 block">Area of Interest:</span>
                  <span className="font-semibold text-gray-900">{selectedApp.areaOfInterest || selectedApp.department || "General"}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">City / Location:</span>
                  <span className="font-semibold text-gray-900">{selectedApp.city || "Not specified"}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Instagram / Social:</span>
                  <span className="font-semibold text-gray-900">{selectedApp.instagramId || "None"}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Age:</span>
                  <span className="font-semibold text-gray-900">{selectedApp.age || "N/A"}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-1">Motivation / Personal Statement:</h4>
                <p className="text-gray-700 p-3 bg-slate-50 rounded-xl leading-relaxed whitespace-pre-wrap">
                  {selectedApp.motivation || "No statement provided."}
                </p>
              </div>

              {selectedApp.interviewDetails?.scheduledAt && (
                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl">
                  <h4 className="font-bold text-blue-900 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-blue-700" />
                    Interview Scheduled
                  </h4>
                  <p className="text-blue-800">Date: {new Date(selectedApp.interviewDetails.scheduledAt).toLocaleString()}</p>
                  {selectedApp.interviewDetails.meetingLink && (
                    <a
                      href={selectedApp.interviewDetails.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-700 underline block mt-1"
                    >
                      Join Meeting Link
                    </a>
                  )}
                </div>
              )}

              {selectedApp.onboardingDetails?.onboardedAt && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <h4 className="font-bold text-emerald-900 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    Candidate Onboarded
                  </h4>
                  <p className="text-emerald-800">
                    Role: <strong>{selectedApp.onboardingDetails.assignedRole}</strong> ({selectedApp.onboardingDetails.assignedDepartment})
                  </p>
                </div>
              )}

              {/* Status History */}
              {selectedApp.statusHistory && selectedApp.statusHistory.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Application Timeline:</h4>
                  <div className="space-y-2 border-l-2 border-gray-200 pl-3">
                    {selectedApp.statusHistory.map((hist, idx) => (
                      <div key={idx} className="text-2xs text-gray-600">
                        <span className="font-semibold text-gray-800 uppercase">{hist.status.replace(/_/g, " ")}</span>
                        <span className="text-gray-400 ml-1.5">({new Date(hist.changedAt).toLocaleDateString()})</span>
                        {hist.note && <p className="text-gray-500 mt-0.5">{hist.note}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Application Action Buttons */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              {!canManageRecruitment(user) ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-medium">
                  <strong>View-Only Mode:</strong> HR Team Members hold view-only access and cannot update candidate status, assign interviewers, or onboard candidates.
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdateAppStatus(selectedApp._id || selectedApp.id!, "shortlisted")}
                      className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 font-semibold text-xs hover:bg-purple-100"
                    >
                      Shortlist
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAssignModal(true)}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-semibold text-xs hover:bg-blue-100"
                    >
                      Assign Interviewer
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowFeedbackModal(true)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold text-xs hover:bg-indigo-100"
                    >
                      Submit Feedback
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDecisionModal(true)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-xs hover:bg-emerald-100"
                    >
                      Final Decision
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateAppStatus(selectedApp._id || selectedApp.id!, "rejected")}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-semibold text-xs hover:bg-rose-100"
                    >
                      Reject
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowInterviewModal(true)}
                      className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700"
                    >
                      Schedule Interview
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowOnboardModal(true)}
                      className="px-3.5 py-1.5 rounded-lg bg-brand-emerald text-white font-semibold text-xs hover:bg-brand-dark"
                    >
                      Onboard as Staff
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SCHEDULE INTERVIEW */}
      {showInterviewModal && selectedApp && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95">
            <h3 className="text-base font-bold font-heading text-brand-pitch">Schedule Candidate Interview</h3>
            <p className="text-xs text-gray-500 mt-1">Candidate: <strong>{selectedApp.fullName}</strong></p>

            <form onSubmit={handleScheduleInterview} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Interview Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Interview Mode</label>
                <select
                  value={interviewMode}
                  onChange={(e) => setInterviewMode(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white"
                >
                  <option value="Online">Online Video (Google Meet / Zoom)</option>
                  <option value="In-Person">In-Person</option>
                  <option value="Phone">Phone Call</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Meeting Link / Location</label>
                <input
                  type="text"
                  placeholder="https://meet.google.com/..."
                  value={interviewLink}
                  onChange={(e) => setInterviewLink(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Interview Notes</label>
                <textarea
                  rows={2}
                  placeholder="Specific topics, portfolio review, text analysis..."
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInterviewModal(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700"
                >
                  Confirm Interview
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ONBOARD CANDIDATE */}
      {showOnboardModal && selectedApp && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95">
            <h3 className="text-base font-bold font-heading text-brand-pitch">Onboard Candidate as Official Staff</h3>
            <p className="text-xs text-gray-500 mt-1">Creates user account and issues secure activation credentials for <strong>{selectedApp.fullName}</strong>.</p>

            {onboardActivationLink ? (
              <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-2">
                <p className="font-bold text-emerald-900">Account Created & Ready for Activation!</p>
                <p className="text-emerald-800">Provide this official activation link to the candidate:</p>
                <div className="p-2 bg-white rounded-lg border border-emerald-300 font-mono text-2xs break-all select-all">
                  {typeof window !== "undefined" ? window.location.origin : ""}{onboardActivationLink}
                </div>
                <button
                  onClick={() => {
                    setOnboardActivationLink(null);
                    setShowOnboardModal(false);
                    setSelectedApp(null);
                  }}
                  className="mt-3 w-full py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleOnboardCandidate} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Assigned Role</label>
                  <select
                    value={onboardRole}
                    onChange={(e) => setOnboardRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white"
                  >
                    <option value="member">member (Volunteer / Contributor)</option>
                    <option value="dept_literature">dept_literature (Literature Head)</option>
                    <option value="dept_media">dept_media (Media Head)</option>
                    <option value="dept_marketing">dept_marketing (Marketing Head)</option>
                    <option value="dept_outreach">dept_outreach (Outreach Head)</option>
                    <option value="dept_content">dept_content (Content Head)</option>
                    <option value="hr">hr (Human Resources)</option>
                    <option value="finance">finance (Finance Lead)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Department</label>
                  <select
                    value={onboardDept}
                    onChange={(e) => setOnboardDept(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white"
                  >
                    <option value="Literature">Literature</option>
                    <option value="Media">Media</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Outreach">Outreach</option>
                    <option value="Content Creation">Content Creation</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Designation Title</label>
                  <input
                    type="text"
                    required
                    value={onboardDesignation}
                    onChange={(e) => setOnboardDesignation(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                  />
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowOnboardModal(false)}
                    className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-brand-emerald rounded-xl hover:bg-brand-dark"
                  >
                    Complete Onboarding
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: REVIEW LEAVE */}
      {selectedLeave && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95">
            <h3 className="text-base font-bold font-heading text-brand-pitch">Review Leave Request</h3>
            <p className="text-xs text-gray-500 mt-1">Applicant: <strong>{selectedLeave.memberName}</strong> ({selectedLeave.department})</p>

            <div className="mt-3.5 p-3.5 bg-slate-50 rounded-xl text-xs space-y-1.5">
              <p><strong>Leave Type:</strong> {selectedLeave.leaveType}</p>
              <p><strong>Duration:</strong> {new Date(selectedLeave.startDate).toLocaleDateString()} to {new Date(selectedLeave.endDate).toLocaleDateString()}</p>
              <p><strong>Reason:</strong> {selectedLeave.reason}</p>
            </div>

            <form onSubmit={handleReviewLeave} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Review Decision</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLeaveAction("approve")}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      leaveAction === "approve"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    Approve Leave
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeaveAction("reject")}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      leaveAction === "reject"
                        ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    Reject Leave
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Review Notes & Feedback</label>
                <textarea
                  rows={2}
                  placeholder="Notes explaining approval or reason for rejection..."
                  value={leaveReviewNotes}
                  onChange={(e) => setLeaveReviewNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedLeave(null)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-xs ${
                    leaveAction === "approve" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  Submit Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN INTERVIEWER */}
      {showAssignModal && selectedApp && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95">
            <h3 className="text-base font-bold font-heading text-brand-pitch">Assign Interviewer</h3>
            <p className="text-xs text-gray-500 mt-1">Candidate: <strong>{selectedApp.fullName}</strong></p>

            <form onSubmit={handleAssignInterviewer} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Select Interviewer *</label>
                <select
                  required
                  value={assignInterviewerId}
                  onChange={(e) => {
                    setAssignInterviewerId(e.target.value);
                    const emp = employees.find((em) => (em._id || em.id) === e.target.value);
                    if (emp) setAssignInterviewerName(emp.name);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white"
                >
                  <option value="">-- Choose Team Member / Staff --</option>
                  {employees.map((emp) => (
                    <option key={emp._id || emp.id} value={emp._id || emp.id}>
                      {emp.name} ({emp.department || emp.role} - {emp.designation || "Staff"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Interview Date & Time</label>
                <input
                  type="datetime-local"
                  value={assignDate}
                  onChange={(e) => setAssignDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Mode</label>
                  <select
                    value={assignMode}
                    onChange={(e) => setAssignMode(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white"
                  >
                    <option value="Online">Online Video</option>
                    <option value="In-Person">In-Person</option>
                    <option value="Phone">Phone</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Meeting Link</label>
                  <input
                    type="text"
                    placeholder="https://meet.google.com/..."
                    value={assignLink}
                    onChange={(e) => setAssignLink(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Notes / Instructions</label>
                <textarea
                  rows={2}
                  placeholder="Focus areas or assessment guidance for interviewer..."
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-xs"
                >
                  Assign & Dispatch Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SUBMIT INTERVIEW FEEDBACK */}
      {showFeedbackModal && selectedApp && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95">
            <h3 className="text-base font-bold font-heading text-brand-pitch">Submit Interview Feedback</h3>
            <p className="text-xs text-gray-500 mt-1">Candidate: <strong>{selectedApp.fullName}</strong></p>

            <form onSubmit={handleInterviewFeedback} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Recommendation *</label>
                  <select
                    value={feedbackRec}
                    onChange={(e) => setFeedbackRec(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white"
                  >
                    <option value="strong_hire">Strong Hire</option>
                    <option value="hire">Hire</option>
                    <option value="on_hold">On Hold</option>
                    <option value="reject">Reject</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Rating (1 to 5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={feedbackRating}
                    onChange={(e) => setFeedbackRating(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Feedback Notes *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Summary of performance, strengths, literary aptitude, and fit..."
                  value={feedbackNotes}
                  onChange={(e) => setFeedbackNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-xs"
                >
                  Submit Recommendation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: FINAL RECRUITMENT DECISION */}
      {showDecisionModal && selectedApp && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95">
            <h3 className="text-base font-bold font-heading text-brand-pitch">Record Final Recruitment Decision</h3>
            <p className="text-xs text-gray-500 mt-1">Candidate: <strong>{selectedApp.fullName}</strong></p>

            <form onSubmit={handleRecordDecision} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Final Decision *</label>
                <select
                  value={decisionValue}
                  onChange={(e) => setDecisionValue(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white"
                >
                  <option value="selected">Selected (Approved for Onboarding)</option>
                  <option value="not_selected">Not Selected (Retain in Pool)</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Decision Notes</label>
                <textarea
                  rows={2}
                  placeholder="Rationale or committee feedback notes..."
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDecisionModal(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-brand-emerald rounded-xl hover:bg-brand-dark shadow-xs"
                >
                  Confirm Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PROVISION NEW ACCOUNT (Phase D.2.2.6) */}
      {showCreateAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95">
            <div className="flex items-center gap-2.5 text-[#17243A] mb-1">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <KeyRound className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold font-heading">Provision Staff / Member Account</h3>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Enter user credentials and role. A single-use 7-day cryptographic activation link will be generated.
            </p>

            <form onSubmit={handleCreateAccount} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tariq Mehmood"
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-emerald"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. tariq@tameer-rekhta.org"
                  value={newAccEmail}
                  onChange={(e) => setNewAccEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-emerald"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Technical Role *</label>
                  <select
                    value={newAccRole}
                    onChange={(e) => {
                      const r = e.target.value;
                      setNewAccRole(r);
                      if (r === "dept_literature") setNewAccDept("Literature");
                      else if (r === "dept_media") setNewAccDept("Media");
                      else if (r === "dept_marketing") setNewAccDept("Marketing");
                      else if (r === "dept_outreach") setNewAccDept("Outreach");
                      else if (r === "dept_content") setNewAccDept("Content Creation");
                      else if (r === "hr") setNewAccDept("HR");
                      else if (r === "finance") setNewAccDept("Finance");
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none bg-white"
                  >
                    <option value="member">Member</option>
                    <option value="dept_literature">Dept Literature</option>
                    <option value="dept_media">Dept Media</option>
                    <option value="dept_marketing">Dept Marketing</option>
                    <option value="dept_outreach">Dept Outreach</option>
                    <option value="dept_content">Dept Content</option>
                    <option value="hr">HR</option>
                    <option value="finance">Finance</option>
                    {user?.role === "super_admin" && <option value="super_admin">Super Admin</option>}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Department</label>
                  <select
                    value={newAccDept}
                    onChange={(e) => setNewAccDept(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none bg-white"
                  >
                    <option value="Literature">Literature</option>
                    <option value="Media">Media</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Outreach">Outreach</option>
                    <option value="Content Creation">Content Creation</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                    <option value="Administration">Administration</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Designation</label>
                  <select
                    value={newAccDesignation}
                    onChange={(e) => setNewAccDesignation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none bg-white"
                  >
                    {newAccRole === "hr" ? (
                      <>
                        <option value="hr_member">HR Team Member</option>
                        <option value="hr_coordination_incharge">HR Coordination In-charge</option>
                        <option value="hr_director">HR Director</option>
                        <option value="hr_head">HR Head</option>
                      </>
                    ) : (
                      <>
                        <option value="member">Member</option>
                        <option value="assistant_director">Assistant Director</option>
                        {user?.role === "super_admin" && (
                          <>
                            <option value="director">Director</option>
                            <option value="head">Department Head</option>
                          </>
                        )}
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    placeholder="+92 300 1234567"
                    value={newAccPhone}
                    onChange={(e) => setNewAccPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateAccountModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingAccount}
                  className="px-4 py-2 bg-[#800F35] hover:bg-[#600B27] text-white font-semibold rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  {creatingAccount ? "Provisioning..." : "Provision Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ACTIVATION LINK (Phase D.2.2.6) */}
      {generatedActivation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
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
                <span className="font-semibold text-slate-900 truncate block">{generatedActivation.accountName}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Email Address</span>
                <span className="font-semibold text-slate-900 truncate block">{generatedActivation.accountEmail}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Assigned Role</span>
                <span className="font-semibold text-[#800F35] block">{generatedActivation.role || "member"}</span>
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
                  This cryptographic activation link is valid for exactly 7 days and can only be used once. Once the user activates their account and chooses a password, this link is permanently deactivated. Link expires on: <strong>{new Date(generatedActivation.expiresAt).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</strong>.
                </p>
              </div>
            </div>

            <div className="flex justify-end">
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
    </div>
  );
}

export default function HRDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-brand-emerald/30 border-t-brand-emerald rounded-full animate-spin" />
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Loading HR Portal...</p>
          </div>
        </div>
      }
    >
      <HRDashboardContent />
    </Suspense>
  );
}
