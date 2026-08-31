import { Navigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ShieldCheck, Check, X, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/features/auth/auth-context";
import { adminApi } from "@/features/admin/api";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { MarketingTab } from "./MarketingTab";
import {
  FIQH_SUGGESTION_STATUSES,
  REPORT_STATUSES,
  type FiqhSuggestionStatus,
  type ReportStatus,
} from "@/features/admin/types";
import { cn } from "@/lib/utils";

const STATUS_VARIANT: Record<ReportStatus, string> = {
  SIGNALE: "bg-destructive/10 text-destructive",
  EN_REVUE: "bg-accent text-accent-foreground",
  CORRECTION: "bg-accent text-accent-foreground",
  VALIDATION: "bg-primary/10 text-primary",
  PUBLIE: "bg-primary/10 text-primary",
};

const FIQH_SUGGESTION_STATUS_VARIANT: Record<FiqhSuggestionStatus, string> = {
  NOUVELLE: "bg-destructive/10 text-destructive",
  EN_COURS: "bg-accent text-accent-foreground",
  TRAITEE: "bg-primary/10 text-primary",
};

function ReportsTab() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: reports, isLoading, isError } = useQuery({
    queryKey: ["admin", "reports"],
    queryFn: adminApi.listReports,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });

  const assignMutation = useMutation({
    mutationFn: (reportId: string) => adminApi.assignReport(reportId, user!.id),
    onSuccess: () => {
      invalidate();
      toast.success(t("admin.assigned"));
    },
    onError: () => toast.error(t("common.error")),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ReportStatus }) => adminApi.updateReportStatus(id, status),
    onSuccess: () => {
      invalidate();
      toast.success(t("admin.statusUpdated"));
    },
    onError: () => toast.error(t("common.error")),
  });

  if (isError) return <p className="py-8 text-center text-sm text-destructive">{t("admin.error")}</p>;
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }
  if (reports && reports.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">{t("admin.noReports")}</p>;
  }

  return (
    <div className="space-y-3">
      {reports?.map((report) => (
        <div key={report.id} className="rounded-md border p-4 transition-colors hover:border-primary/30">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className={cn("rounded px-2 py-0.5 text-xs font-medium", STATUS_VARIANT[report.status])}>
              {report.status}
            </span>
            <Badge variant="secondary" className="text-[10px]">
              {report.targetType}
            </Badge>
            <Badge variant="secondary" className="text-[10px]">
              {report.reasonCategory}
            </Badge>
          </div>
          {report.description && <p className="mb-2 text-sm">{report.description}</p>}
          <p className="mb-3 text-xs text-muted-foreground">
            {t("admin.reportedBy")} {report.reporterName ?? t("admin.anonymous")}
            {report.assigneeName ? ` - ${t("admin.assignedTo")} ${report.assigneeName}` : ""}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {!report.assignedTo && (
              <Button
                size="sm"
                variant="outline"
                disabled={assignMutation.isPending}
                onClick={() => assignMutation.mutate(report.id)}
              >
                {assignMutation.isPending && assignMutation.variables === report.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                ) : null}
                {t("admin.assignToMe")}
              </Button>
            )}
            <Select
              value={report.status}
              disabled={statusMutation.isPending && statusMutation.variables?.id === report.id}
              onValueChange={(value) => statusMutation.mutate({ id: report.id, status: value as ReportStatus })}
            >
              <SelectTrigger className="h-8 w-[180px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REPORT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ))}
    </div>
  );
}

function FiqhSuggestionsTab() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: suggestions, isLoading, isError } = useQuery({
    queryKey: ["admin", "fiqh-suggestions"],
    queryFn: adminApi.listFiqhSuggestions,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: FiqhSuggestionStatus }) =>
      adminApi.updateFiqhSuggestionStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "fiqh-suggestions"] });
      toast.success(t("admin.statusUpdated"));
    },
    onError: () => toast.error(t("common.error")),
  });

  if (isError) return <p className="py-8 text-center text-sm text-destructive">{t("admin.error")}</p>;
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }
  if (suggestions && suggestions.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">{t("admin.noFiqhSuggestions")}</p>;
  }

  return (
    <div className="space-y-3">
      {suggestions?.map((suggestion) => (
        <div key={suggestion.id} className="rounded-md border p-4 transition-colors hover:border-primary/30">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded px-2 py-0.5 text-xs font-medium",
                FIQH_SUGGESTION_STATUS_VARIANT[suggestion.status],
              )}
            >
              {t(`admin.fiqhSuggestionStatus.${suggestion.status}`)}
            </span>
          </div>
          <p className="mb-1 text-sm font-medium">{suggestion.question}</p>
          {suggestion.context && <p className="mb-2 text-sm text-muted-foreground">{suggestion.context}</p>}
          <p className="mb-3 text-xs text-muted-foreground">
            {t("admin.suggestedBy")} {suggestion.submittedByName ?? t("admin.anonymous")}
            {" - "}
            {new Date(suggestion.createdAt).toLocaleDateString()}
          </p>
          <Select
            value={suggestion.status}
            disabled={statusMutation.isPending && statusMutation.variables?.id === suggestion.id}
            onValueChange={(value) =>
              statusMutation.mutate({ id: suggestion.id, status: value as FiqhSuggestionStatus })
            }
          >
            <SelectTrigger className="h-8 w-[180px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FIQH_SUGGESTION_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {t(`admin.fiqhSuggestionStatus.${s}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  );
}

function UsersTab() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: users, isLoading, isError } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: adminApi.listUsers,
  });
  const { data: roles } = useQuery({ queryKey: ["admin", "roles"], queryFn: adminApi.listRoles });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] });

  const roleMutation = useMutation({
    mutationFn: ({ id, roleId }: { id: string; roleId: string }) => adminApi.updateUserRole(id, roleId),
    onSuccess: () => {
      invalidate();
      toast.success(t("admin.roleUpdated"));
    },
    onError: () => toast.error(t("common.error")),
  });
  const activeMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => adminApi.updateUserActive(id, isActive),
    onSuccess: () => {
      invalidate();
      toast.success(t("admin.userUpdated"));
    },
    onError: () => toast.error(t("common.error")),
  });

  if (isError) return <p className="py-8 text-center text-sm text-destructive">{t("admin.error")}</p>;
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {users?.map((u) => (
        <div
          key={u.id}
          className="flex flex-wrap items-center gap-3 rounded-md border p-3 transition-colors hover:border-primary/30"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{u.displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{u.email}</p>
          </div>
          <Select
            value={u.roleId}
            disabled={roleMutation.isPending && roleMutation.variables?.id === u.id}
            onValueChange={(value) => roleMutation.mutate({ id: u.id, roleId: value })}
          >
            <SelectTrigger className="h-8 w-[160px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roles?.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            type="button"
            disabled={activeMutation.isPending && activeMutation.variables?.id === u.id}
            onClick={() => activeMutation.mutate({ id: u.id, isActive: !u.isActive })}
            className={cn(
              "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors disabled:opacity-50",
              u.isActive ? "text-primary hover:bg-primary/10" : "text-destructive hover:bg-destructive/10",
            )}
          >
            {u.isActive ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
            {u.isActive ? t("admin.active") : t("admin.inactive")}
          </button>
        </div>
      ))}
    </div>
  );
}

function AuditLogTab() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useQuery({ queryKey: ["admin", "audit-log"], queryFn: adminApi.listAuditLog });

  if (isError) return <p className="py-8 text-center text-sm text-destructive">{t("admin.error")}</p>;
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }
  if (data && data.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">{t("admin.noAuditEntries")}</p>;
  }

  return (
    <div className="space-y-2">
      {data?.map((entry) => (
        <div key={entry.id} className="rounded-md border p-3 text-sm">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-[10px]">
              {entry.action}
            </Badge>
            <span className="text-xs text-muted-foreground">{entry.entityType}</span>
            <span className="ml-auto text-xs text-muted-foreground">
              {new Date(entry.createdAt).toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {entry.actorName ?? t("admin.anonymous")}
            {entry.entityId ? ` - ${entry.entityId}` : ""}
          </p>
        </div>
      ))}
    </div>
  );
}

export function AdminPage() {
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();
  useDocumentTitle(t("admin.title"));

  if (isLoading) return <Skeleton className="mx-auto mt-10 h-64 w-full max-w-3xl" />;
  // Garde cote client (UX uniquement) : chaque endpoint /admin/* est de toute
  // facon protege cote serveur par @RequirePermission (report:view, user:manage).
  if (!user?.isStaff) return <Navigate to="/" replace />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center gap-3">
        <ShieldCheck className="h-7 w-7 text-primary" aria-hidden="true" />
        <h1 className="text-2xl font-semibold tracking-tight">{t("admin.title")}</h1>
      </div>

      <Tabs defaultValue="reports">
        <TabsList className="mb-6">
          <TabsTrigger value="reports">{t("admin.reports")}</TabsTrigger>
          <TabsTrigger value="fiqh-suggestions">{t("admin.fiqhSuggestions")}</TabsTrigger>
          <TabsTrigger value="users">{t("admin.users")}</TabsTrigger>
          <TabsTrigger value="audit">{t("admin.auditLog")}</TabsTrigger>
          <TabsTrigger value="marketing">{t("admin.marketing")}</TabsTrigger>
        </TabsList>
        <TabsContent value="reports">
          <ReportsTab />
        </TabsContent>
        <TabsContent value="fiqh-suggestions">
          <FiqhSuggestionsTab />
        </TabsContent>
        <TabsContent value="users">
          <UsersTab />
        </TabsContent>
        <TabsContent value="audit">
          <AuditLogTab />
        </TabsContent>
        <TabsContent value="marketing">
          <MarketingTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
