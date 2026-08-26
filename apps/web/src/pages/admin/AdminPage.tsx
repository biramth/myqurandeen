import * as React from "react";
import { Navigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ShieldCheck, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/features/auth/auth-context";
import { adminApi } from "@/features/admin/api";
import { REPORT_STATUSES, type ReportStatus } from "@/features/admin/types";
import { cn } from "@/lib/utils";

const STATUS_VARIANT: Record<ReportStatus, string> = {
  SIGNALE: "bg-destructive/10 text-destructive",
  EN_REVUE: "bg-accent text-accent-foreground",
  CORRECTION: "bg-accent text-accent-foreground",
  VALIDATION: "bg-primary/10 text-primary",
  PUBLIE: "bg-primary/10 text-primary",
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
    onSuccess: invalidate,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ReportStatus }) => adminApi.updateReportStatus(id, status),
    onSuccess: invalidate,
  });

  if (isError) return <p className="text-sm text-destructive">{t("admin.error")}</p>;
  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (reports && reports.length === 0) return <p className="text-sm text-muted-foreground">{t("admin.noReports")}</p>;

  return (
    <div className="space-y-3">
      {reports?.map((report) => (
        <div key={report.id} className="rounded-md border p-4">
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
              <Button size="sm" variant="outline" onClick={() => assignMutation.mutate(report.id)}>
                {t("admin.assignToMe")}
              </Button>
            )}
            <Select
              value={report.status}
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
    onSuccess: invalidate,
  });
  const activeMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => adminApi.updateUserActive(id, isActive),
    onSuccess: invalidate,
  });

  if (isError) return <p className="text-sm text-destructive">{t("admin.error")}</p>;
  if (isLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="space-y-2">
      {users?.map((u) => (
        <div key={u.id} className="flex flex-wrap items-center gap-3 rounded-md border p-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{u.displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{u.email}</p>
          </div>
          <Select
            value={u.roleId}
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
            onClick={() => activeMutation.mutate({ id: u.id, isActive: !u.isActive })}
            className={cn(
              "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium",
              u.isActive ? "text-primary" : "text-destructive",
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

export function AdminPage() {
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();
  const [tab, setTab] = React.useState<"reports" | "users">("reports");

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

      <div className="mb-6 flex gap-1 border-b">
        <button
          type="button"
          onClick={() => setTab("reports")}
          className={cn(
            "border-b-2 px-3 py-2 text-sm font-medium",
            tab === "reports" ? "border-primary text-foreground" : "border-transparent text-muted-foreground",
          )}
        >
          {t("admin.reports")}
        </button>
        <button
          type="button"
          onClick={() => setTab("users")}
          className={cn(
            "border-b-2 px-3 py-2 text-sm font-medium",
            tab === "users" ? "border-primary text-foreground" : "border-transparent text-muted-foreground",
          )}
        >
          {t("admin.users")}
        </button>
      </div>

      {tab === "reports" ? <ReportsTab /> : <UsersTab />}
    </div>
  );
}
