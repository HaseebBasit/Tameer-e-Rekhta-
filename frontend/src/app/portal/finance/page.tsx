"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { API_BASE, fetchWithAuth } from "@/lib/api";
import {
  DollarSign,
  TrendingUp,
  Receipt,
  CreditCard,
  Building2,
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
  FileText,
  Download,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  PiggyBank,
  Check,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface FinancialOverview {
  income: {
    totalVerifiedAmount: number;
    totalPendingAmount: number;
    verifiedCount: number;
    pendingCount: number;
    totalDonations: number;
  };
  expenses: {
    totalApprovedAmount: number;
    totalPendingAmount: number;
    approvedCount: number;
    pendingCount: number;
    totalExpenses: number;
  };
  netBalance: number;
  budgets: {
    totalAllocatedAmount: number;
    totalSpentAmount: number;
    totalRemainingAmount: number;
    utilizationRate: number;
    activeBudgetsCount: number;
  };
  departmentBreakdown: Array<{
    department: string;
    allocated: number;
    spent: number;
    remaining: number;
    utilizationRate: number;
    approvedExpensesCount: number;
  }>;
  categoryBreakdown: Record<string, number>;
  recentIncome: DonationRecord[];
  recentExpenses: ExpenseRecord[];
}

interface DonationRecord {
  _id?: string;
  id?: string;
  receiptNo: string;
  referenceNumber: string;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  amount: number;
  currency?: string;
  paymentMethod: string;
  category?: string;
  cause?: string;
  notes?: string;
  verificationStatus: string;
  verifiedByName?: string;
  verifiedAt?: string;
  verificationNotes?: string;
  createdAt: string;
}

interface ExpenseRecord {
  _id?: string;
  id?: string;
  expenseId: string;
  title: string;
  description?: string;
  amount: number;
  currency?: string;
  category: string;
  department: string;
  eventId?: string;
  eventTitle?: string;
  receiptUrl?: string;
  status: string;
  submittedBy: string;
  submittedByName: string;
  submittedByEmail?: string;
  submittedByRole?: string;
  date?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  disbursedAt?: string;
  disbursedNotes?: string;
  createdAt: string;
}

interface BudgetRecord {
  _id?: string;
  id?: string;
  budgetId: string;
  fiscalYear: string;
  title: string;
  department: string;
  category?: string;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  status: string;
  allocatedByName?: string;
  notes?: string;
  createdAt: string;
}

const EXPENSE_CATEGORIES = [
  "Event Expenses",
  "Printing & Publications",
  "Travel & Logistics",
  "Marketing & Promotion",
  "Equipment & Assets",
  "Office Supplies",
  "Honorarium & Refreshments",
  "Operations & Maintenance",
  "Other",
];

const DEPARTMENTS = [
  "Literature",
  "Media",
  "Marketing",
  "Outreach",
  "Content Creation",
  "HR",
  "Finance",
  "General",
];

function FinancePortalContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const activeTabParam = searchParams.get("tab") || "overview";

  const [activeTab, setActiveTab] = useState<string>(activeTabParam);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Data states
  const [overview, setOverview] = useState<FinancialOverview | null>(null);
  const [incomeList, setIncomeList] = useState<DonationRecord[]>([]);
  const [expensesList, setExpensesList] = useState<ExpenseRecord[]>([]);
  const [budgetsList, setBudgetsList] = useState<BudgetRecord[]>([]);

  // Filter states
  const [incomeFilterStatus, setIncomeFilterStatus] = useState<string>("");
  const [incomeSearch, setIncomeSearch] = useState<string>("");
  const [expenseFilterDept, setExpenseFilterDept] = useState<string>("");
  const [expenseFilterStatus, setExpenseFilterStatus] = useState<string>("");
  const [expenseSearch, setExpenseSearch] = useState<string>("");
  const [budgetFilterDept, setBudgetFilterDept] = useState<string>("");

  // Modal states
  const [showIncomeModal, setShowIncomeModal] = useState<boolean>(false);
  const [showVerifyModal, setShowVerifyModal] = useState<boolean>(false);
  const [selectedDonation, setSelectedDonation] = useState<DonationRecord | null>(null);

  const [showExpenseModal, setShowExpenseModal] = useState<boolean>(false);
  const [showReviewExpenseModal, setShowReviewExpenseModal] = useState<boolean>(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseRecord | null>(null);

  const [showBudgetModal, setShowBudgetModal] = useState<boolean>(false);
  const [showEditBudgetModal, setShowEditBudgetModal] = useState<boolean>(false);
  const [selectedBudget, setSelectedBudget] = useState<BudgetRecord | null>(null);

  // Form states
  const [incomeForm, setIncomeForm] = useState({
    donorName: "",
    donorEmail: "",
    donorPhone: "",
    amount: "",
    paymentMethod: "Bank Transfer",
    referenceNumber: "",
    category: "Donation",
    cause: "General Welfare Fund",
    notes: "",
  });

  const [verifyForm, setVerifyForm] = useState({
    status: "Verified",
    notes: "",
  });

  const [expenseForm, setExpenseForm] = useState({
    title: "",
    description: "",
    amount: "",
    category: "Event Expenses",
    department: "",
    receiptUrl: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const [reviewExpenseForm, setReviewExpenseForm] = useState({
    status: "approved",
    reviewNotes: "",
  });

  const [budgetForm, setBudgetForm] = useState({
    fiscalYear: "2026",
    title: "",
    department: "",
    category: "General Operating",
    allocatedAmount: "",
    notes: "",
  });

  const [editBudgetForm, setEditBudgetForm] = useState({
    allocatedAmount: "",
    status: "active",
    notes: "",
  });

  // Sync tab with URL
  useEffect(() => {
    if (activeTabParam && activeTabParam !== activeTab) {
      setActiveTab(activeTabParam);
    }
  }, [activeTabParam, activeTab]);

  const clearNotifications = () => {
    setError(null);
    setSuccessMsg(null);
  };

  // 1. Fetch Overview Metrics
  const fetchOverview = useCallback(async () => {
    try {
      const res = await fetchWithAuth("/finance/overview");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.overview) {
          setOverview(data.overview);
        }
      }
    } catch (e: any) {
      console.warn("Failed to fetch finance overview:", e.message);
    }
  }, []);

  // 2. Fetch Income Records
  const fetchIncome = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (incomeFilterStatus) params.append("status", incomeFilterStatus);
      if (incomeSearch) params.append("search", incomeSearch);
      params.append("limit", "100");

      const res = await fetchWithAuth(`/finance/income?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.income)) {
          setIncomeList(data.income);
        }
      }
    } catch (e: any) {
      console.warn("Failed to fetch income list:", e.message);
    }
  }, [incomeFilterStatus, incomeSearch]);

  // 3. Fetch Expenses Records
  const fetchExpenses = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (expenseFilterDept) params.append("department", expenseFilterDept);
      if (expenseFilterStatus) params.append("status", expenseFilterStatus);
      if (expenseSearch) params.append("search", expenseSearch);
      params.append("limit", "100");

      const res = await fetchWithAuth(`/finance/expenses?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.expenses)) {
          setExpensesList(data.expenses);
        }
      }
    } catch (e: any) {
      console.warn("Failed to fetch expenses list:", e.message);
    }
  }, [expenseFilterDept, expenseFilterStatus, expenseSearch]);

  // 4. Fetch Budgets Records
  const fetchBudgets = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (budgetFilterDept) params.append("department", budgetFilterDept);

      const res = await fetchWithAuth(`/finance/budgets?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.budgets)) {
          setBudgetsList(data.budgets);
        }
      }
    } catch (e: any) {
      console.warn("Failed to fetch budgets list:", e.message);
    }
  }, [budgetFilterDept]);

  // 5. Fetch Departments List
  const [departmentsList, setDepartmentsList] = useState<{ name: string; code?: string }[]>([]);
  const fetchDepartments = useCallback(async () => {
    try {
      const res = await fetchWithAuth("/departments");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.departments)) {
          setDepartmentsList(data.departments);
        }
      }
    } catch (e: any) {
      console.warn("Failed to fetch departments list:", e.message);
    }
  }, []);

  // Initial load
  const loadAll = useCallback(async () => {
    setLoading(true);
    clearNotifications();
    await Promise.all([fetchOverview(), fetchIncome(), fetchExpenses(), fetchBudgets(), fetchDepartments()]);
    setLoading(false);
  }, [fetchOverview, fetchIncome, fetchExpenses, fetchBudgets, fetchDepartments]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Format PKR Currency
  const formatPKR = (amount?: number) => {
    if (amount === undefined || amount === null) return "₨ 0";
    return `₨ ${Number(amount).toLocaleString("en-PK")}`;
  };

  // Format Date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-PK", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Submit Direct Income Form
  const handleCreateIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    clearNotifications();
    setActionLoading(true);
    try {
      const res = await fetchWithAuth("/finance/income", {
        method: "POST",
        body: JSON.stringify(incomeForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`Direct income record logged successfully (Receipt: ${data.donation?.receiptNo}).`);
        setShowIncomeModal(false);
        setIncomeForm({
          donorName: "",
          donorEmail: "",
          donorPhone: "",
          amount: "",
          paymentMethod: "Bank Transfer",
          referenceNumber: "",
          category: "Donation",
          cause: "General Welfare Fund",
          notes: "",
        });
        await Promise.all([fetchIncome(), fetchOverview()]);
      } else {
        setError(data.error || "Failed to log income record.");
      }
    } catch (err: any) {
      setError(err.message || "Network error while saving income.");
    } finally {
      setActionLoading(false);
    }
  };

  // Verify Donation Form
  const handleVerifyDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDonation) return;
    clearNotifications();
    setActionLoading(true);
    try {
      const id = selectedDonation._id || selectedDonation.id;
      const res = await fetchWithAuth(`/finance/income/${id}/verify`, {
        method: "PATCH",
        body: JSON.stringify(verifyForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`Donation ${selectedDonation.receiptNo} marked as ${verifyForm.status}.`);
        setShowVerifyModal(false);
        setSelectedDonation(null);
        await Promise.all([fetchIncome(), fetchOverview()]);
      } else {
        setError(data.error || "Failed to verify donation.");
      }
    } catch (err: any) {
      setError(err.message || "Network error.");
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Expense Form
  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    clearNotifications();
    setActionLoading(true);
    try {
      const res = await fetchWithAuth("/finance/expenses", {
        method: "POST",
        body: JSON.stringify(expenseForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`Expense submission received (ID: ${data.expense?.expenseId}). Awaiting review.`);
        setShowExpenseModal(false);
        setExpenseForm({
          title: "",
          description: "",
          amount: "",
          category: "Event Expenses",
          department: "Literature",
          receiptUrl: "",
          date: new Date().toISOString().slice(0, 10),
        });
        await Promise.all([fetchExpenses(), fetchOverview()]);
      } else {
        setError(data.error || "Failed to submit expense.");
      }
    } catch (err: any) {
      setError(err.message || "Network error while submitting expense.");
    } finally {
      setActionLoading(false);
    }
  };

  // Review Expense Form (Approve / Reject)
  const handleReviewExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExpense || actionLoading) return;

    if (selectedExpense.status !== "pending") {
      setError(`Cannot review expense: status is '${selectedExpense.status}'. Only pending expenses can be reviewed.`);
      return;
    }

    // Client-side anti-self-approval check
    if (selectedExpense.submittedBy === (user?.id || (user as any)?._id)) {
      setError("Anti-Self-Approval Rule: You submitted this expense and cannot approve or review it.");
      return;
    }

    clearNotifications();
    setActionLoading(true);
    try {
      const id = selectedExpense._id || selectedExpense.id;
      const res = await fetchWithAuth(`/finance/expenses/${id}/review`, {
        method: "PATCH",
        body: JSON.stringify(reviewExpenseForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`Expense ${selectedExpense.expenseId} has been ${reviewExpenseForm.status}.`);
        setShowReviewExpenseModal(false);
        setSelectedExpense(null);
        await Promise.all([fetchExpenses(), fetchBudgets(), fetchOverview()]);
      } else {
        setError(data.error || "Failed to review expense.");
      }
    } catch (err: any) {
      setError(err.message || "Network error.");
    } finally {
      setActionLoading(false);
    }
  };

  // Disburse Expense
  const handleDisburseExpense = async (expense: ExpenseRecord) => {
    if (actionLoading) return;
    if (expense.status !== "approved") {
      setError(`Cannot disburse expense: status is '${expense.status}'. Only approved expenses can be disbursed.`);
      return;
    }
    if (!confirm(`Mark expense ${expense.expenseId} (PKR ${expense.amount}) as disbursed / paid?`)) {
      return;
    }
    clearNotifications();
    setActionLoading(true);
    try {
      const id = expense._id || expense.id;
      const res = await fetchWithAuth(`/finance/expenses/${id}/disburse`, {
        method: "PATCH",
        body: JSON.stringify({ disbursedNotes: "Payment disbursed via finance office" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`Expense ${expense.expenseId} successfully marked as paid.`);
        await Promise.all([fetchExpenses(), fetchOverview()]);
      } else {
        setError(data.error || "Failed to disburse expense.");
      }
    } catch (err: any) {
      setError(err.message || "Network error.");
    } finally {
      setActionLoading(false);
    }
  };

  // Allocate Budget Form
  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    clearNotifications();
    setActionLoading(true);
    try {
      const res = await fetchWithAuth("/finance/budgets", {
        method: "POST",
        body: JSON.stringify(budgetForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`Budget allocated successfully (ID: ${data.budget?.budgetId}).`);
        setShowBudgetModal(false);
        setBudgetForm({
          fiscalYear: "2026",
          title: "",
          department: "Literature",
          category: "General Operating",
          allocatedAmount: "",
          notes: "",
        });
        await Promise.all([fetchBudgets(), fetchOverview()]);
      } else {
        setError(data.error || "Failed to allocate budget.");
      }
    } catch (err: any) {
      setError(err.message || "Network error.");
    } finally {
      setActionLoading(false);
    }
  };

  // Update Budget Form
  const handleEditBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBudget) return;
    clearNotifications();
    setActionLoading(true);
    try {
      const id = selectedBudget._id || selectedBudget.id;
      const res = await fetchWithAuth(`/finance/budgets/${id}`, {
        method: "PATCH",
        body: JSON.stringify(editBudgetForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`Budget ${selectedBudget.budgetId} updated successfully.`);
        setShowEditBudgetModal(false);
        setSelectedBudget(null);
        await Promise.all([fetchBudgets(), fetchOverview()]);
      } else {
        setError(data.error || "Failed to update budget.");
      }
    } catch (err: any) {
      setError(err.message || "Network error.");
    } finally {
      setActionLoading(false);
    }
  };

  // Multi-format Export Trigger (CSV and Excel .xlsx)
  const handleExport = async (type: "income" | "expenses" | "summary", format: "csv" | "xlsx" = "csv") => {
    clearNotifications();
    try {
      const res = await fetchWithAuth(`/finance/export/${type}?format=${format}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const ext = format === "xlsx" ? "xlsx" : "csv";
        a.download = `rekhta_${type}_${new Date().toISOString().slice(0, 10)}.${ext}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setSuccessMsg(`Exported ${type} records in ${format.toUpperCase()} format.`);
      } else {
        setError(`Failed to download ${format.toUpperCase()} export.`);
      }
    } catch (err: any) {
      setError(err.message || "Export download failed.");
    }
  };

  const handleExportCSV = (type: "income" | "expenses" | "summary") => handleExport(type, "csv");
  const handleExportXLSX = (type: "income" | "expenses" | "summary") => handleExport(type, "xlsx");

  // Verification that user has access
  const isFinanceAuthorized = user?.role === "finance" || user?.role === "super_admin";
  if (!isFinanceAuthorized) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <ShieldCheck className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Restricted Financial Workspace</h2>
          <p className="text-sm text-gray-600 max-w-md mx-auto mb-6">
            Access to organization financial ledgers, audit statements, and budgets is strictly restricted to
            authorized Finance and Super Admin roles.
          </p>
          <a
            href="/portal"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-emerald text-white rounded-xl text-sm font-semibold hover:bg-brand-emerald/90 transition shadow-sm"
          >
            Return to Authorized Workspace
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Treasury Header */}
      <div className="bg-[#17243A] text-white rounded-2xl p-5 sm:p-7 shadow-rekhta flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-[#233550]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-urdu text-lg sm:text-xl text-[#D7A84B] font-bold">
              دفترِ خزانہ
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#800F35] text-white font-medium border border-[#9F1239]">
              Finance & Accounts
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Treasury & Financial Control
          </h1>
          <p className="text-xs text-slate-300 max-w-xl">
            Complete treasury oversight: donation verification, departmental expenditure claims, budget allocation, and audit reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-stretch sm:self-auto shrink-0">
          <button
            onClick={loadAll}
            disabled={loading}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg border border-white/20 transition active:scale-95 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowIncomeModal(true)}
            className="px-4 py-2 bg-[#D7A84B] hover:bg-[#C2943A] text-[#17243A] text-xs font-bold rounded-lg shadow-sm transition active:scale-95 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Record Income
          </button>
          <button
            onClick={() => setShowExpenseModal(true)}
            className="px-4 py-2 bg-[#800F35] hover:bg-[#600B27] text-white text-xs font-semibold rounded-lg shadow-sm transition active:scale-95 flex items-center gap-1.5 border border-[#9F1239]"
          >
            <Plus className="w-3.5 h-3.5" />
            Submit Expense
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
          <button onClick={clearNotifications} className="text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={clearNotifications} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto pb-1 text-xs font-semibold">
          {[
            { id: "overview", label: "Financial Overview", icon: TrendingUp },
            { id: "income", label: "Income & Donations", icon: Receipt },
            { id: "expenses", label: "Expense Claims", icon: CreditCard },
            { id: "budgets", label: "Department Budgets", icon: PiggyBank },
            { id: "reports", label: "Reports & Exports", icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-3 border-b-2 text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                  isActive
                    ? "border-[#800F35] text-[#800F35] font-bold"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#800F35]" : "text-slate-400"}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Verified Income */}
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Verified Income</span>
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#17243A] mt-3">
                {formatPKR(overview?.income?.totalVerifiedAmount)}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                <span className="font-semibold text-emerald-600">{overview?.income?.verifiedCount || 0} verified</span>
                <span>•</span>
                <span className="text-amber-600 font-medium">
                  {overview?.income?.pendingCount || 0} pending ({formatPKR(overview?.income?.totalPendingAmount)})
                </span>
              </div>
            </div>

            {/* 2. Approved Expenses */}
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Approved Expenses</span>
                <div className="w-9 h-9 rounded-lg bg-rose-50 text-[#800F35] flex items-center justify-center font-bold">
                  <ArrowDownRight className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#17243A] mt-3">
                {formatPKR(overview?.expenses?.totalApprovedAmount)}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                <span className="font-semibold text-rose-600">{overview?.expenses?.approvedCount || 0} approved</span>
                <span>•</span>
                <span className="text-amber-600 font-medium">
                  {overview?.expenses?.pendingCount || 0} pending ({formatPKR(overview?.expenses?.totalPendingAmount)})
                </span>
              </div>
            </div>

            {/* 3. Net Balance */}
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Net Operating Balance</span>
                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <p
                className={`text-2xl font-bold mt-3 ${
                  (overview?.netBalance || 0) >= 0 ? "text-emerald-700" : "text-rose-600"
                }`}
              >
                {formatPKR(overview?.netBalance)}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                <span className="font-semibold text-emerald-600">Treasury Solvent</span>
                <span>•</span>
                <span>Audited via bank reconciliation</span>
              </div>
            </div>

            {/* 4. Budget Utilization */}
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Budget Utilization</span>
                <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <PiggyBank className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#17243A] mt-3">
                {overview?.budgets?.utilizationRate ?? 0}%
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                <span>{formatPKR(overview?.budgets?.totalSpentAmount)} spent of</span>
                <span className="font-semibold text-slate-700">{formatPKR(overview?.budgets?.totalAllocatedAmount)}</span>
              </div>
            </div>
          </div>

          {/* Department Budget Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Departmental Budget Allocations & Spending</h3>
                <p className="text-xs text-gray-500">Current fiscal year tracking across core operational wings</p>
              </div>
              <button
                onClick={() => setActiveTab("budgets")}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                Manage Budgets <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {overview?.departmentBreakdown?.map((dept) => {
                const util = dept.utilizationRate || 0;
                const progressColor =
                  util > 90 ? "bg-rose-500" : util > 70 ? "bg-amber-500" : "bg-emerald-500";
                return (
                  <div key={dept.department} className="p-4 rounded-xl border border-gray-100 bg-gray-50/60">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-sm text-gray-800">{dept.department}</span>
                      <span className="text-xs font-semibold text-gray-500">{util}% used</span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${progressColor}`}
                        style={{ width: `${Math.min(100, util)}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase">Allocated</span>
                        <span className="font-semibold text-gray-700">{formatPKR(dept.allocated)}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase">Spent</span>
                        <span className="font-semibold text-rose-600">{formatPKR(dept.spent)}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase">Remaining</span>
                        <span className="font-semibold text-emerald-600">{formatPKR(dept.remaining)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Split Recent Transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Income */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-600" /> Recent Donations
                </h3>
                <button
                  onClick={() => setActiveTab("income")}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  View All
                </button>
              </div>

              <div className="divide-y divide-gray-100">
                {(overview?.recentIncome || incomeList.slice(0, 5)).map((don) => (
                  <div key={don.receiptNo || don.id || don._id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-900">{don.donorName}</p>
                      <p className="text-[11px] text-gray-500">
                        {don.receiptNo} • {don.paymentMethod}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-emerald-700">+{formatPKR(don.amount)}</p>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          (don.verificationStatus || "").toLowerCase() === "verified"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {don.verificationStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Expenses */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-rose-600" /> Recent Expense Claims
                </h3>
                <button
                  onClick={() => setActiveTab("expenses")}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  View All
                </button>
              </div>

              <div className="divide-y divide-gray-100">
                {(overview?.recentExpenses || expensesList.slice(0, 5)).map((exp) => (
                  <div key={exp.expenseId || exp.id || exp._id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-900">{exp.title}</p>
                      <p className="text-[11px] text-gray-500">
                        {exp.department} • {exp.submittedByName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-rose-600">-{formatPKR(exp.amount)}</p>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          exp.status === "approved" || exp.status === "paid"
                            ? "bg-emerald-100 text-emerald-800"
                            : exp.status === "rejected"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {exp.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INCOME & DONATIONS */}
      {activeTab === "income" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search donor name, email, receipt..."
                  value={incomeSearch}
                  onChange={(e) => setIncomeSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>

              <select
                value={incomeFilterStatus}
                onChange={(e) => setIncomeFilterStatus(e.target.value)}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-xl bg-white text-gray-700 outline-none"
              >
                <option value="">All Verification Statuses</option>
                <option value="Verified">Verified</option>
                <option value="Pending">Pending Verification</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExportCSV("income")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-semibold transition"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
              <button
                onClick={() => setShowIncomeModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Record Direct Income
              </button>
            </div>
          </div>

          {/* Income Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Receipt No</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Donor Details</th>
                    <th className="py-3 px-4">Amount (PKR)</th>
                    <th className="py-3 px-4">Payment Method & Ref</th>
                    <th className="py-3 px-4">Cause / Category</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                  {incomeList.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-400">
                        No income records match current filters.
                      </td>
                    </tr>
                  ) : (
                    incomeList.map((don) => {
                      const isPending = (don.verificationStatus || "").toLowerCase() === "pending";
                      return (
                        <tr key={don.receiptNo || don.id || don._id} className="hover:bg-gray-50/50">
                          <td className="py-3 px-4 font-mono font-semibold text-gray-900">{don.receiptNo}</td>
                          <td className="py-3 px-4 text-gray-500">{formatDate(don.createdAt)}</td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-gray-900 block">{don.donorName}</span>
                            <span className="text-[11px] text-gray-500 block">{don.donorEmail}</span>
                          </td>
                          <td className="py-3 px-4 font-bold text-emerald-700">{formatPKR(don.amount)}</td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-gray-800 block">{don.paymentMethod}</span>
                            <span className="text-[11px] text-gray-500 font-mono block">
                              {don.referenceNumber || "—"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{don.cause || don.category || "General"}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                (don.verificationStatus || "").toLowerCase() === "verified"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : (don.verificationStatus || "").toLowerCase() === "rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {don.verificationStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedDonation(don);
                                setVerifyForm({
                                  status: don.verificationStatus === "Verified" ? "Verified" : "Verified",
                                  notes: don.verificationNotes || "",
                                });
                                setShowVerifyModal(true);
                              }}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                                isPending
                                  ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              {isPending ? "Verify" : "Review"}
                            </button>
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

      {/* TAB 3: EXPENSES */}
      {activeTab === "expenses" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search expense title, ID, submitter..."
                  value={expenseSearch}
                  onChange={(e) => setExpenseSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>

              <select
                value={expenseFilterDept}
                onChange={(e) => setExpenseFilterDept(e.target.value)}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-xl bg-white text-gray-700 outline-none"
              >
                <option value="">All Departments</option>
                {departmentsList.map((d) => (
                  <option key={d.code || d.name} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>

              <select
                value={expenseFilterStatus}
                onChange={(e) => setExpenseFilterStatus(e.target.value)}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-xl bg-white text-gray-700 outline-none"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid / Disbursed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExportCSV("expenses")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-semibold transition"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
              <button
                onClick={() => setShowExpenseModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gray-900 text-white rounded-xl text-xs font-semibold hover:bg-gray-800 transition shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Submit Expense
              </button>
            </div>
          </div>

          {/* Expenses Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Expense ID</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Title & Description</th>
                    <th className="py-3 px-4">Department & Category</th>
                    <th className="py-3 px-4">Amount (PKR)</th>
                    <th className="py-3 px-4">Submitted By</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                  {expensesList.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-400">
                        No expenses match current filters.
                      </td>
                    </tr>
                  ) : (
                    expensesList.map((exp) => {
                      const isOwner = exp.submittedBy === (user?.id || (user as any)?._id);
                      const isPending = exp.status === "pending";
                      const isApproved = exp.status === "approved";

                      return (
                        <tr key={exp.expenseId || exp.id || exp._id} className="hover:bg-gray-50/50">
                          <td className="py-3 px-4 font-mono font-semibold text-gray-900">{exp.expenseId}</td>
                          <td className="py-3 px-4 text-gray-500">{formatDate(exp.date || exp.createdAt)}</td>
                          <td className="py-3 px-4 max-w-xs">
                            <span className="font-semibold text-gray-900 block truncate">{exp.title}</span>
                            {exp.description && (
                              <span className="text-[11px] text-gray-500 block truncate">{exp.description}</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-gray-800 block">{exp.department}</span>
                            <span className="text-[11px] text-gray-500 block">{exp.category}</span>
                          </td>
                          <td className="py-3 px-4 font-bold text-gray-900">{formatPKR(exp.amount)}</td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-gray-800 block">{exp.submittedByName}</span>
                            {isOwner && (
                              <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
                                You
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                exp.status === "paid"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : exp.status === "approved"
                                  ? "bg-blue-100 text-blue-800"
                                  : exp.status === "rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {exp.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-1">
                            {isPending && (
                              <button
                                onClick={() => {
                                  setSelectedExpense(exp);
                                  setReviewExpenseForm({
                                    status: "approved",
                                    reviewNotes: "",
                                  });
                                  setShowReviewExpenseModal(true);
                                }}
                                disabled={isOwner}
                                title={isOwner ? "Anti-Self-Approval: Cannot review own submission" : "Review Claim"}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                                  isOwner
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                }`}
                              >
                                {isOwner ? "Self-Submission" : "Review"}
                              </button>
                            )}

                            {isApproved && (
                              <button
                                onClick={() => handleDisburseExpense(exp)}
                                disabled={actionLoading}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                                  actionLoading ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-gray-900 text-white hover:bg-gray-800"
                                }`}
                              >
                                {actionLoading ? "Processing..." : "Disburse"}
                              </button>
                            )}

                            {exp.receiptUrl && (
                              <a
                                href={exp.receiptUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center p-1 text-gray-400 hover:text-gray-700"
                                title="View Receipt"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
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

      {/* TAB 4: BUDGETS */}
      {activeTab === "budgets" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-2">
              <select
                value={budgetFilterDept}
                onChange={(e) => setBudgetFilterDept(e.target.value)}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-xl bg-white text-gray-700 outline-none"
              >
                <option value="">All Department Budgets</option>
                {departmentsList.map((d) => (
                  <option key={d.code || d.name} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExportCSV("summary")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-semibold transition"
              >
                <Download className="w-3.5 h-3.5" /> Export Summary CSV
              </button>
              <button
                onClick={() => setShowBudgetModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Allocate Budget
              </button>
            </div>
          </div>

          {/* Budgets Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Budget ID</th>
                    <th className="py-3 px-4">Year</th>
                    <th className="py-3 px-4">Department & Title</th>
                    <th className="py-3 px-4">Allocated (PKR)</th>
                    <th className="py-3 px-4">Spent (PKR)</th>
                    <th className="py-3 px-4">Remaining (PKR)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                  {budgetsList.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-400">
                        No budget allocations found.
                      </td>
                    </tr>
                  ) : (
                    budgetsList.map((bdg) => {
                      const allocated = Number(bdg.allocatedAmount) || 0;
                      const spent = Number(bdg.spentAmount) || 0;
                      const remaining = allocated - spent;
                      const utilRate = allocated > 0 ? ((spent / allocated) * 100).toFixed(1) : "0.0";

                      return (
                        <tr key={bdg.budgetId || bdg.id || bdg._id} className="hover:bg-gray-50/50">
                          <td className="py-3 px-4 font-mono font-semibold text-gray-900">{bdg.budgetId}</td>
                          <td className="py-3 px-4 font-semibold text-gray-600">{bdg.fiscalYear}</td>
                          <td className="py-3 px-4 max-w-sm">
                            <span className="font-bold text-gray-900 block">{bdg.department}</span>
                            <span className="text-[11px] text-gray-500 block">{bdg.title}</span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-gray-900">{formatPKR(allocated)}</td>
                          <td className="py-3 px-4 font-semibold text-rose-600">
                            {formatPKR(spent)}
                            <span className="text-[10px] text-gray-400 block font-normal">({utilRate}%)</span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-emerald-700">{formatPKR(remaining)}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                bdg.status === "active"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : bdg.status === "frozen"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {bdg.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedBudget(bdg);
                                setEditBudgetForm({
                                  allocatedAmount: String(bdg.allocatedAmount),
                                  status: bdg.status || "active",
                                  notes: bdg.notes || "",
                                });
                                setShowEditBudgetModal(true);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition"
                            >
                              Adjust
                            </button>
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

      {/* TAB 5: REPORTS & EXPORTS */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-1">Treasury Data Export Center</h3>
            <p className="text-xs text-gray-500 mb-6">
              Download clean, audit-compliant financial reports in Excel (.xlsx) or CSV formats, protected against spreadsheet formula injection.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 border border-gray-200 rounded-xl bg-gray-50/50 flex flex-col justify-between">
                <div>
                  <Receipt className="w-8 h-8 text-emerald-600 mb-3" />
                  <h4 className="font-bold text-sm text-gray-900">Income & Donations Ledger</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Export full transaction ledger including donor identities, reference IDs, verification statuses, and dates.
                  </p>
                </div>
                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => handleExportXLSX("income")}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" /> Excel (.xlsx)
                  </button>
                  <button
                    onClick={() => handleExportCSV("income")}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-xl text-xs font-semibold transition shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" /> CSV
                  </button>
                </div>
              </div>

              <div className="p-5 border border-gray-200 rounded-xl bg-gray-50/50 flex flex-col justify-between">
                <div>
                  <CreditCard className="w-8 h-8 text-rose-600 mb-3" />
                  <h4 className="font-bold text-sm text-gray-900">Expenses & Claims Register</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Export all departmental expense claims, reviewer approvals, disbursement timestamps, and descriptions.
                  </p>
                </div>
                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => handleExportXLSX("expenses")}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" /> Excel (.xlsx)
                  </button>
                  <button
                    onClick={() => handleExportCSV("expenses")}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-xl text-xs font-semibold transition shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" /> CSV
                  </button>
                </div>
              </div>

              <div className="p-5 border border-gray-200 rounded-xl bg-gray-50/50 flex flex-col justify-between">
                <div>
                  <PiggyBank className="w-8 h-8 text-indigo-600 mb-3" />
                  <h4 className="font-bold text-sm text-gray-900">Annual Budget & Utilization</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Export departmental budget allocations, actual expenditures, remaining funds, and utilization rates.
                  </p>
                </div>
                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => handleExportXLSX("summary")}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" /> Excel (.xlsx)
                  </button>
                  <button
                    onClick={() => handleExportCSV("summary")}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-xl text-xs font-semibold transition shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" /> CSV
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: RECORD DIRECT INCOME */}
      {/* ------------------------------------------------------------- */}
      {showIncomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" /> Record Direct Income
              </h3>
              <button onClick={() => setShowIncomeModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIncome} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Donor Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Syed Tariq Mahmood"
                  value={incomeForm.donorName}
                  onChange={(e) => setIncomeForm({ ...incomeForm, donorName: e.target.value })}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Donor Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="donor@example.com"
                    value={incomeForm.donorEmail}
                    onChange={(e) => setIncomeForm({ ...incomeForm, donorEmail: e.target.value })}
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+92 300 1234567"
                    value={incomeForm.donorPhone}
                    onChange={(e) => setIncomeForm({ ...incomeForm, donorPhone: e.target.value })}
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Amount (PKR) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="25000"
                    value={incomeForm.amount}
                    onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Method *</label>
                  <select
                    value={incomeForm.paymentMethod}
                    onChange={(e) => setIncomeForm({ ...incomeForm, paymentMethod: e.target.value })}
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl bg-white outline-none"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="EasyPaisa">EasyPaisa</option>
                    <option value="JazzCash">JazzCash</option>
                    <option value="Cash">Cash / Cheque</option>
                    <option value="Online">Online Gateway</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Reference / Transaction ID</label>
                  <input
                    type="text"
                    placeholder="TRX-192830"
                    value={incomeForm.referenceNumber}
                    onChange={(e) => setIncomeForm({ ...incomeForm, referenceNumber: e.target.value })}
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Cause / Purpose</label>
                  <input
                    type="text"
                    placeholder="General Welfare Fund"
                    value={incomeForm.cause}
                    onChange={(e) => setIncomeForm({ ...incomeForm, cause: e.target.value })}
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Notes / Ledger Remarks</label>
                <textarea
                  rows={2}
                  placeholder="Additional verification details or receipt annotations..."
                  value={incomeForm.notes}
                  onChange={(e) => setIncomeForm({ ...incomeForm, notes: e.target.value })}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowIncomeModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  {actionLoading ? "Logging..." : "Confirm & Save Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: VERIFY DONATION */}
      {/* ------------------------------------------------------------- */}
      {showVerifyModal && selectedDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" /> Verify Donation Record
              </h3>
              <button onClick={() => setShowVerifyModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 p-3 bg-gray-50 rounded-xl text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-500">Receipt No:</span>
                <span className="font-mono font-bold text-gray-900">{selectedDonation.receiptNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Donor:</span>
                <span className="font-semibold text-gray-800">{selectedDonation.donorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount:</span>
                <span className="font-bold text-emerald-700">{formatPKR(selectedDonation.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Reference:</span>
                <span className="font-mono text-gray-800">{selectedDonation.referenceNumber || "—"}</span>
              </div>
            </div>

            <form onSubmit={handleVerifyDonation} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Verification Status</label>
                <select
                  value={verifyForm.status}
                  onChange={(e) => setVerifyForm({ ...verifyForm, status: e.target.value })}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl bg-white outline-none"
                >
                  <option value="Verified">Verified (Confirmed in statement)</option>
                  <option value="Rejected">Rejected (Invalid reference or bounce)</option>
                  <option value="Pending">Keep Pending</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Verification Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Bank slip reference confirmed on portal..."
                  value={verifyForm.notes}
                  onChange={(e) => setVerifyForm({ ...verifyForm, notes: e.target.value })}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowVerifyModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  {actionLoading ? "Updating..." : "Save Verification"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 3: SUBMIT EXPENSE */}
      {/* ------------------------------------------------------------- */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-gray-900" /> Submit Expense Claim
              </h3>
              <button onClick={() => setShowExpenseModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Expense Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Masterclass printing materials"
                  value={expenseForm.title}
                  onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Amount (PKR) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="12000"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category *</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl bg-white outline-none"
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Department *</label>
                  <select
                    value={expenseForm.department}
                    onChange={(e) => setExpenseForm({ ...expenseForm, department: e.target.value })}
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl bg-white outline-none"
                  >
                    {departmentsList.length === 0 ? (
                      <option value="">No departments configured</option>
                    ) : (
                      departmentsList.map((dept) => (
                        <option key={dept.code || dept.name} value={dept.name}>
                          {dept.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Expense Date</label>
                  <input
                    type="date"
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Receipt URL / Document Link</label>
                <input
                  type="url"
                  placeholder="https://storage.rekhta.org/receipts/doc_102.pdf"
                  value={expenseForm.receiptUrl}
                  onChange={(e) => setExpenseForm({ ...expenseForm, receiptUrl: e.target.value })}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description / Justification</label>
                <textarea
                  rows={2}
                  placeholder="Itemized breakdown and purpose of expenditure..."
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  {actionLoading ? "Submitting..." : "Submit for Approval"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 4: REVIEW EXPENSE (ANTI-SELF-APPROVAL ENFORCED) */}
      {/* ------------------------------------------------------------- */}
      {showReviewExpenseModal && selectedExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Review Expense Claim
              </h3>
              <button onClick={() => setShowReviewExpenseModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Anti-Self-Approval Warning */}
            {selectedExpense.submittedBy === (user?.id || (user as any)?._id) ? (
              <div className="my-4 p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 space-y-2">
                <div className="flex items-center gap-2 font-bold text-red-800">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  Anti-Self-Approval Restriction
                </div>
                <p>
                  You submitted this expense claim. In accordance with organizational financial controls, you are
                  strictly prohibited from approving or reviewing your own expense submissions.
                </p>
                <p className="text-[11px] text-gray-500">
                  Another authorized Finance Officer or the Super Admin must independently review this claim.
                </p>
              </div>
            ) : (
              <div className="my-4 p-3 bg-gray-50 rounded-xl text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Expense ID:</span>
                  <span className="font-mono font-bold text-gray-900">{selectedExpense.expenseId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Title:</span>
                  <span className="font-semibold text-gray-800">{selectedExpense.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Department:</span>
                  <span className="font-semibold text-gray-800">{selectedExpense.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount:</span>
                  <span className="font-bold text-rose-600">{formatPKR(selectedExpense.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Submitted By:</span>
                  <span className="text-gray-700">{selectedExpense.submittedByName}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleReviewExpense} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Decision</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewExpenseForm({ ...reviewExpenseForm, status: "approved" })}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                      reviewExpenseForm.status === "approved"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-bold"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" /> Approve Claim
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewExpenseForm({ ...reviewExpenseForm, status: "rejected" })}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                      reviewExpenseForm.status === "rejected"
                        ? "bg-rose-50 border-rose-500 text-rose-700 font-bold"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <X className="w-3.5 h-3.5" /> Reject Claim
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Review Notes / Remarks</label>
                <textarea
                  rows={2}
                  placeholder="Verification notes or reason for approval / rejection..."
                  value={reviewExpenseForm.reviewNotes}
                  onChange={(e) => setReviewExpenseForm({ ...reviewExpenseForm, reviewNotes: e.target.value })}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowReviewExpenseModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || selectedExpense.submittedBy === (user?.id || (user as any)?._id) || selectedExpense.status !== "pending"}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-sm text-white ${
                    selectedExpense.submittedBy === (user?.id || (user as any)?._id) || selectedExpense.status !== "pending"
                      ? "bg-gray-300 cursor-not-allowed"
                      : reviewExpenseForm.status === "approved"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  {actionLoading ? "Processing..." : `Confirm ${reviewExpenseForm.status === "approved" ? "Approval" : "Rejection"}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 5: ALLOCATE BUDGET */}
      {/* ------------------------------------------------------------- */}
      {showBudgetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-emerald-600" /> Allocate Departmental Budget
              </h3>
              <button onClick={() => setShowBudgetModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBudget} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Fiscal Year *</label>
                  <input
                    type="text"
                    required
                    value={budgetForm.fiscalYear}
                    onChange={(e) => setBudgetForm({ ...budgetForm, fiscalYear: e.target.value })}
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Department *</label>
                  <select
                    value={budgetForm.department}
                    onChange={(e) => setBudgetForm({ ...budgetForm, department: e.target.value })}
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl bg-white outline-none"
                  >
                    {departmentsList.length === 0 ? (
                      <option value="">No departments configured</option>
                    ) : (
                      departmentsList.map((dept) => (
                        <option key={dept.code || dept.name} value={dept.name}>
                          {dept.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Budget Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Literature Annual Operating Budget"
                  value={budgetForm.title}
                  onChange={(e) => setBudgetForm({ ...budgetForm, title: e.target.value })}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Allocated Amount (PKR) *</label>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="150000"
                  value={budgetForm.allocatedAmount}
                  onChange={(e) => setBudgetForm({ ...budgetForm, allocatedAmount: e.target.value })}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Notes / Description</label>
                <textarea
                  rows={2}
                  placeholder="Allocation breakdown and approved objectives..."
                  value={budgetForm.notes}
                  onChange={(e) => setBudgetForm({ ...budgetForm, notes: e.target.value })}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowBudgetModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  {actionLoading ? "Allocating..." : "Create Allocation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 6: EDIT BUDGET */}
      {/* ------------------------------------------------------------- */}
      {showEditBudgetModal && selectedBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-indigo-600" /> Adjust Budget Allocation
              </h3>
              <button onClick={() => setShowEditBudgetModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 p-3 bg-gray-50 rounded-xl text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Budget ID:</span>
                <span className="font-mono font-bold text-gray-900">{selectedBudget.budgetId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Department:</span>
                <span className="font-semibold text-gray-800">{selectedBudget.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Current Spent:</span>
                <span className="font-semibold text-rose-600">{formatPKR(selectedBudget.spentAmount)}</span>
              </div>
            </div>

            <form onSubmit={handleEditBudget} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Allocated Amount (PKR)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={editBudgetForm.allocatedAmount}
                  onChange={(e) => setEditBudgetForm({ ...editBudgetForm, allocatedAmount: e.target.value })}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                <select
                  value={editBudgetForm.status}
                  onChange={(e) => setEditBudgetForm({ ...editBudgetForm, status: e.target.value })}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl bg-white outline-none"
                >
                  <option value="active">Active</option>
                  <option value="frozen">Frozen (Temporarily Locked)</option>
                  <option value="closed">Closed (Fiscal Year Ended)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Adjustment Notes</label>
                <textarea
                  rows={2}
                  placeholder="Reason for allocation amendment..."
                  value={editBudgetForm.notes}
                  onChange={(e) => setEditBudgetForm({ ...editBudgetForm, notes: e.target.value })}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditBudgetModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  {actionLoading ? "Saving..." : "Save Adjustments"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FinancePortalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-brand-emerald/30 border-t-brand-emerald rounded-full animate-spin" />
            <p className="text-xs font-semibold text-gray-500 tracking-wider uppercase">Loading Finance Portal...</p>
          </div>
        </div>
      }
    >
      <FinancePortalContent />
    </Suspense>
  );
}
