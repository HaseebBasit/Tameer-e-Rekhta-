/**
 * Frontend Authorization & Hierarchy Helpers
 * Ta'meer-e-Rekhta Management Portal
 * 
 * Consumes both Technical Role and Organizational Designation.
 * Provides client-side permission evaluation to conditionally display actions.
 * NOTE: All security boundaries are independently enforced on the backend API.
 */

import { PortalUser } from "@/context/AuthContext";

export type TechnicalRole =
  | "super_admin"
  | "dept_literature"
  | "dept_media"
  | "dept_marketing"
  | "dept_outreach"
  | "dept_content"
  | "hr"
  | "finance"
  | "member";

export type OperationalDesignation = "head" | "director" | "assistant_director" | "member";
export type HRDesignation = "hr_head" | "hr_director" | "hr_coordination_incharge" | "hr_member";
export type Designation = OperationalDesignation | HRDesignation;

export const OPERATIONAL_ROLES: TechnicalRole[] = [
  "dept_literature",
  "dept_media",
  "dept_marketing",
  "dept_outreach",
  "dept_content",
];

export const DESIGNATION_LABELS: Record<string, string> = {
  head: "Department Head",
  director: "Director",
  assistant_director: "Assistant Director",
  member: "Team Member",
  hr_head: "HR Head",
  hr_director: "HR Director",
  hr_coordination_incharge: "HR Coordination In-charge",
  hr_member: "HR Team Member",
};

/**
 * Normalizes user designation string from API or token.
 */
export function normalizeDesignation(designation?: string | null): string | null {
  if (!designation) return null;
  const lower = designation.toLowerCase().trim().replace(/[\s-]+/g, "_");
  if (lower in DESIGNATION_LABELS) return lower;
  if (lower === "none" || lower === "null" || lower === "") return null;
  // Handle common aliases
  if (lower.includes("head") && lower.includes("hr")) return "hr_head";
  if (lower.includes("director") && lower.includes("hr")) return "hr_director";
  if (lower.includes("coordination") || lower.includes("incharge")) return "hr_coordination_incharge";
  if (lower.includes("assistant")) return "assistant_director";
  if (lower.includes("director")) return "director";
  if (lower.includes("head")) return "head";
  if (lower.includes("member")) return lower.includes("hr") ? "hr_member" : "member";
  return lower;
}

/**
 * Format designation for UI display.
 */
export function getDesignationDisplayName(designation?: string | null, fallbackRole?: string): string {
  const normalized = normalizeDesignation(designation);
  if (normalized && DESIGNATION_LABELS[normalized]) {
    return DESIGNATION_LABELS[normalized];
  }
  if (fallbackRole === "super_admin") return "Super Administrator";
  if (fallbackRole === "finance") return "Finance Officer";
  return designation || "Member";
}

// ---------------------------------------------------------------------------
// Role & Designation Checkers
// ---------------------------------------------------------------------------

export function isSuperAdmin(user?: PortalUser | null): boolean {
  return user?.role === "super_admin";
}

export function isDepartmentHead(user?: PortalUser | null): boolean {
  if (!user) return false;
  if (user.role === "super_admin") return true;
  return OPERATIONAL_ROLES.includes(user.role as TechnicalRole) && normalizeDesignation(user.designation) === "head";
}

export function isDepartmentDirector(user?: PortalUser | null): boolean {
  if (!user) return false;
  if (user.role === "super_admin") return true;
  return OPERATIONAL_ROLES.includes(user.role as TechnicalRole) && normalizeDesignation(user.designation) === "director";
}

export function isAssistantDirector(user?: PortalUser | null): boolean {
  if (!user) return false;
  return OPERATIONAL_ROLES.includes(user.role as TechnicalRole) && normalizeDesignation(user.designation) === "assistant_director";
}

export function isDepartmentMember(user?: PortalUser | null): boolean {
  if (!user) return false;
  return user.role === "member" || normalizeDesignation(user.designation) === "member";
}

export function isHRHead(user?: PortalUser | null): boolean {
  if (!user) return false;
  if (user.role === "super_admin") return true;
  return user.role === "hr" && normalizeDesignation(user.designation) === "hr_head";
}

export function isHRDirector(user?: PortalUser | null): boolean {
  if (!user) return false;
  if (user.role === "super_admin") return true;
  return user.role === "hr" && normalizeDesignation(user.designation) === "hr_director";
}

export function isHRCoordinationIncharge(user?: PortalUser | null): boolean {
  if (!user) return false;
  if (user.role === "super_admin") return true;
  return user.role === "hr" && normalizeDesignation(user.designation) === "hr_coordination_incharge";
}

export function isHRMember(user?: PortalUser | null): boolean {
  if (!user) return false;
  return user.role === "hr" && ["hr_member", "hr_assistant", "member"].includes(normalizeDesignation(user.designation) || "");
}

/**
 * Can user manage HR recruitment (create campaigns, schedule interviews, assign interviewers, onboard)?
 * Super Admin, HR Head, HR Director, HR Coordination In-charge.
 * HR Member / Assistant is view-only (false).
 */
export function canManageRecruitment(user?: PortalUser | null): boolean {
  if (!user) return false;
  if (user.role === "super_admin") return true;
  if (user.role !== "hr") return false;
  const desig = normalizeDesignation(user.designation);
  return ["hr_head", "hr_director", "hr_coordination_incharge"].includes(desig || "");
}

/**
 * Can user export HR data (.xlsx and .csv)?
 * Super Admin, HR Head, HR Director, HR Coordination In-charge.
 * HR Member / Assistant is denied (false).
 */
export function canExportHRData(user?: PortalUser | null): boolean {
  if (!user) return false;
  if (user.role === "super_admin") return true;
  if (user.role !== "hr") return false;
  const desig = normalizeDesignation(user.designation);
  return ["hr_head", "hr_director", "hr_coordination_incharge"].includes(desig || "");
}

/**
 * Can user dispatch official department-wise announcements?
 * Super Admin and HR Coordination In-charge ONLY.
 * HR Head, HR Director, HR Member are denied (false).
 */
export function canSendDepartmentAnnouncements(user?: PortalUser | null): boolean {
  if (!user) return false;
  if (user.role === "super_admin") return true;
  if (user.role !== "hr") return false;
  const desig = normalizeDesignation(user.designation);
  return desig === "hr_coordination_incharge";
}

// ---------------------------------------------------------------------------
// Fine-Grained Capability Checkers
// ---------------------------------------------------------------------------

/**
 * Can user view confidential assessment / performance grading?
 * Only Super Admin and Department Heads (for their own department).
 */
export function canViewConfidentialGrading(user?: PortalUser | null, targetDepartment?: string): boolean {
  if (!user) return false;
  if (user.role === "super_admin") return true;
  if (!isDepartmentHead(user)) return false;
  if (targetDepartment && user.department) {
    return targetDepartment.toLowerCase().trim() === user.department.toLowerCase().trim();
  }
  return true;
}

/**
 * Can user approve / finalize tasks?
 * Super Admin, Department Head, and Director (own department).
 */
export function canApproveTasks(user?: PortalUser | null, targetDepartment?: string): boolean {
  if (!user) return false;
  if (user.role === "super_admin") return true;
  const desig = normalizeDesignation(user.designation);
  if (!OPERATIONAL_ROLES.includes(user.role as TechnicalRole)) return false;
  if (!["head", "director"].includes(desig || "")) return false;
  if (targetDepartment && user.department) {
    return targetDepartment.toLowerCase().trim() === user.department.toLowerCase().trim();
  }
  return true;
}

/**
 * Can user submit task recommendations?
 * Super Admin, Head, Director, and Assistant Director (own department).
 */
export function canRecommendTasks(user?: PortalUser | null, targetDepartment?: string): boolean {
  if (!user) return false;
  if (user.role === "super_admin") return true;
  const desig = normalizeDesignation(user.designation);
  if (!OPERATIONAL_ROLES.includes(user.role as TechnicalRole)) return false;
  if (!["head", "director", "assistant_director"].includes(desig || "")) return false;
  if (targetDepartment && user.department) {
    return targetDepartment.toLowerCase().trim() === user.department.toLowerCase().trim();
  }
  return true;
}

/**
 * Can user approve leave requests?
 * Super Admin, Department Head, and Director (own department).
 */
export function canApproveLeaves(user?: PortalUser | null, targetDepartment?: string): boolean {
  if (!user) return false;
  if (user.role === "super_admin") return true;
  const desig = normalizeDesignation(user.designation);
  if (OPERATIONAL_ROLES.includes(user.role as TechnicalRole)) {
    if (!["head", "director"].includes(desig || "")) return false;
    if (targetDepartment && user.department) {
      return targetDepartment.toLowerCase().trim() === user.department.toLowerCase().trim();
    }
    return true;
  }
  if (user.role === "hr") {
    return ["hr_head", "hr_director"].includes(desig || "") && targetDepartment?.toLowerCase() === "hr";
  }
  return false;
}

/**
 * Can user perform administrative password resets?
 * Super Admin, HR Head, and HR Coordination In-charge.
 */
export function canPerformAdminPasswordReset(user?: PortalUser | null): boolean {
  if (!user) return false;
  if (user.role === "super_admin") return true;
  if (user.role === "hr") {
    const desig = normalizeDesignation(user.designation);
    return desig === "hr_head" || desig === "hr_coordination_incharge";
  }
  return false;
}

// ---------------------------------------------------------------------------
// Phase D.2.2.3: Tester, Moderator & Workflow Capability Checkers
// ---------------------------------------------------------------------------

/**
 * Checks if user holds Tester verification capabilities.
 * Testers can review submissions and pass or request corrections, but cannot final-approve.
 */
export function isTester(user?: PortalUser | null): boolean {
  if (!user) return false;
  if (user.role === "super_admin") return true;
  return Boolean(user.isTester || user.capabilities?.includes("TESTER_REVIEW"));
}

/**
 * Checks if user holds Moderator capabilities.
 * Moderators can edit deliverables and forward for approval, but cannot final-approve.
 */
export function isModerator(user?: PortalUser | null): boolean {
  if (!user) return false;
  if (user.role === "super_admin") return true;
  return Boolean(user.isModerator || user.capabilities?.includes("MODERATOR_REVIEW"));
}

/**
 * Exclusive Media Gallery Publishing Checker:
 * ONLY the Media Department Head is authorized to publish, unpublish, or manage gallery assets.
 * Media Director, Assistant Director, and Members do NOT receive publishing permission.
 */
export function canPublishMediaGallery(user?: PortalUser | null): boolean {
  if (!user) return false;
  if (user.role === "super_admin") return true;
  return user.role === "dept_media" && normalizeDesignation(user.designation) === "head";
}

/**
 * Task Final Approval Authority Checker:
 * CRITICAL RULE: ONLY the original owning department Head or Director (or Super Admin)
 * can give final approval to a task.
 * Testers, moderators, assistant directors, members, HR, Finance, and other department
 * heads/directors CANNOT give final approval.
 */
export function canFinalApproveTask(user?: PortalUser | null, originalDepartment?: string): boolean {
  if (!user) return false;
  if (user.role === "super_admin") return true;
  const desig = normalizeDesignation(user.designation);
  if (!OPERATIONAL_ROLES.includes(user.role as TechnicalRole)) return false;
  if (!["head", "director"].includes(desig || "")) return false;
  if (originalDepartment && user.department) {
    return originalDepartment.toLowerCase().trim() === user.department.toLowerCase().trim();
  }
  return true;
}

/**
 * Can user perform Department Task Rechecking & Reassignment:
 * Original department Head or Director only (or Super Admin).
 */
export function canRecheckTask(user?: PortalUser | null, originalDepartment?: string): boolean {
  return canFinalApproveTask(user, originalDepartment);
}

/**
 * Phase D.2.2.6: Can user create portal accounts and manage activation links:
 * Authorized roles: Super Admin, HR Head, HR Director, HR Coordination In-charge.
 * Denied: HR Member / Assistant, Department leads/members, Finance, Testers, Moderators.
 */
export function canCreateAccounts(user?: PortalUser | null): boolean {
  if (!user) return false;
  if (user.role === "super_admin") return true;
  if (user.role === "hr") {
    const desig = normalizeDesignation(user.designation);
    return desig === "hr_head" || desig === "hr_director" || desig === "hr_coordination_incharge";
  }
  return false;
}
