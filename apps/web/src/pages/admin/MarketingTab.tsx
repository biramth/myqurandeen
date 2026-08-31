import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Loader2, Send, Plus, Trash2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/features/auth/auth-context";
import { marketingApi, type MarketingRecipient } from "@/features/marketing/api";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { cn } from "@/lib/utils";

/** Valeur de select reservee pour "toute la base" (le reste des valeurs = un groupId reel). */
const ALL_RECIPIENTS = "__all__";

function RecipientBadges({ recipient }: { recipient: MarketingRecipient }) {
  const { t } = useTranslation();
  return (
    <div className="flex shrink-0 gap-1">
      <Badge
        variant="secondary"
        className={cn("text-[10px]", recipient.emailVerifiedAt ? "bg-primary/10 text-primary" : "bg-accent text-accent-foreground")}
      >
        {recipient.emailVerifiedAt ? t("admin.marketingTab.recipients.verified") : t("admin.marketingTab.recipients.unverified")}
      </Badge>
      {recipient.marketingOptOut && (
        <Badge variant="secondary" className="bg-destructive/10 text-[10px] text-destructive">
          {t("admin.marketingTab.recipients.optedOut")}
        </Badge>
      )}
    </div>
  );
}

/** Liste des destinataires potentiels ("a qui j'envoie des mails"), avec recherche. */
function RecipientsSection() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data: recipients, isLoading, isError } = useQuery({
    queryKey: ["admin", "marketing", "recipients", debouncedSearch],
    queryFn: () => marketingApi.listRecipients(debouncedSearch || undefined),
  });

  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-medium">{t("admin.marketingTab.recipients.title")}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{t("admin.marketingTab.recipients.description")}</p>
      </div>
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t("admin.marketingTab.recipients.searchPlaceholder")}
        className="max-w-xs"
      />
      {isError && <p className="text-sm text-destructive">{t("admin.marketingTab.error")}</p>}
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : recipients && recipients.length > 0 ? (
        <>
          <p className="text-xs text-muted-foreground">
            {t("admin.marketingTab.recipients.count", { count: recipients.length })}
          </p>
          <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {recipients.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center gap-3 rounded-md border p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{r.displayName}</p>
                  <p className="truncate text-xs text-muted-foreground">{r.email}</p>
                </div>
                <RecipientBadges recipient={r} />
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="py-6 text-center text-sm text-muted-foreground">{t("admin.marketingTab.recipients.empty")}</p>
      )}
    </div>
  );
}

/** Dialogue de gestion des membres d'un groupe : coche/decoche parmi tous les destinataires. */
function GroupMembersDialog({ groupId, groupName, onClose }: { groupId: string; groupName: string; onClose: () => void }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data: recipients, isLoading: loadingRecipients } = useQuery({
    queryKey: ["admin", "marketing", "recipients", debouncedSearch],
    queryFn: () => marketingApi.listRecipients(debouncedSearch || undefined),
  });
  const { data: detail, isLoading: loadingDetail } = useQuery({
    queryKey: ["admin", "marketing", "group", groupId],
    queryFn: () => marketingApi.getGroup(groupId),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "marketing", "group", groupId] });
    queryClient.invalidateQueries({ queryKey: ["admin", "marketing", "groups"] });
  };

  const addMutation = useMutation({
    mutationFn: (userId: string) => marketingApi.addGroupMembers(groupId, [userId]),
    onSuccess: invalidate,
    onError: () => toast.error(t("admin.marketingTab.error")),
  });
  const removeMutation = useMutation({
    mutationFn: (userId: string) => marketingApi.removeGroupMember(groupId, userId),
    onSuccess: invalidate,
    onError: () => toast.error(t("admin.marketingTab.error")),
  });

  const memberIds = new Set((detail?.members ?? []).map((m) => m.id));
  const pendingId =
    addMutation.isPending || removeMutation.isPending
      ? (addMutation.variables ?? removeMutation.variables)
      : undefined;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("admin.marketingTab.membersDialog.title", { name: groupName })}</DialogTitle>
          <DialogDescription>{t("admin.marketingTab.membersDialog.description")}</DialogDescription>
        </DialogHeader>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("admin.marketingTab.membersDialog.searchPlaceholder")}
        />
        {loadingRecipients || loadingDetail ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="max-h-80 space-y-1 overflow-y-auto">
            {recipients?.map((r) => {
              const checked = memberIds.has(r.id);
              const isPending = pendingId === r.id;
              return (
                <label
                  key={r.id}
                  className="flex cursor-pointer items-center gap-3 rounded-md p-2 text-sm hover:bg-accent"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={isPending}
                    onChange={() => (checked ? removeMutation.mutate(r.id) : addMutation.mutate(r.id))}
                    className="h-4 w-4 shrink-0 accent-primary"
                  />
                  <span className="min-w-0 flex-1 truncate">
                    {r.displayName} <span className="text-xs text-muted-foreground">{r.email}</span>
                  </span>
                  {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
                </label>
              );
            })}
          </div>
        )}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {t("admin.marketingTab.membersDialog.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Creation + liste des groupes de segmentation. */
function GroupsSection({ onManageMembers }: { onManageMembers: (groupId: string, groupName: string) => void }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { data: groups, isLoading, isError } = useQuery({
    queryKey: ["admin", "marketing", "groups"],
    queryFn: marketingApi.listGroups,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "marketing", "groups"] });

  const createMutation = useMutation({
    mutationFn: () => marketingApi.createGroup({ name: name.trim(), description: description.trim() || undefined }),
    onSuccess: () => {
      invalidate();
      setName("");
      setDescription("");
      toast.success(t("admin.marketingTab.groups.createSuccess"));
    },
    onError: () => toast.error(t("admin.marketingTab.error")),
  });

  const deleteMutation = useMutation({
    mutationFn: (groupId: string) => marketingApi.deleteGroup(groupId),
    onSuccess: () => {
      invalidate();
      toast.success(t("admin.marketingTab.groups.deleteSuccess"));
    },
    onError: () => toast.error(t("admin.marketingTab.error")),
  });

  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-medium">{t("admin.marketingTab.groups.title")}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{t("admin.marketingTab.groups.description")}</p>
      </div>

      <div className="flex flex-wrap items-start gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("admin.marketingTab.groups.namePlaceholder")}
          className="max-w-[220px]"
        />
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("admin.marketingTab.groups.descriptionPlaceholder")}
          className="h-9 max-w-xs flex-1 py-2"
          rows={1}
        />
        <Button
          type="button"
          variant="outline"
          disabled={!name.trim() || createMutation.isPending}
          onClick={() => createMutation.mutate()}
        >
          {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
          {t("admin.marketingTab.groups.create")}
        </Button>
      </div>

      {isError && <p className="text-sm text-destructive">{t("admin.marketingTab.error")}</p>}
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
        </div>
      ) : groups && groups.length > 0 ? (
        <div className="space-y-2">
          {groups.map((g) => (
            <div key={g.id} className="flex flex-wrap items-center gap-3 rounded-md border p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{g.name}</p>
                {g.description && <p className="truncate text-xs text-muted-foreground">{g.description}</p>}
              </div>
              <Badge variant="secondary" className="text-[10px]">
                {t("admin.marketingTab.groups.members", { count: g.memberCount })}
              </Badge>
              <Button type="button" variant="outline" size="sm" onClick={() => onManageMembers(g.id, g.name)}>
                <Users className="mr-1.5 h-3.5 w-3.5" />
                {t("admin.marketingTab.groups.manageMembers")}
              </Button>
              <button
                type="button"
                aria-label={t("admin.marketingTab.groups.deleteConfirm", { name: g.name })}
                disabled={deleteMutation.isPending && deleteMutation.variables === g.id}
                onClick={() => {
                  if (window.confirm(t("admin.marketingTab.groups.deleteConfirm", { name: g.name }))) {
                    deleteMutation.mutate(g.id);
                  }
                }}
                className="inline-flex items-center rounded-md border p-1.5 text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-4 text-center text-sm text-muted-foreground">{t("admin.marketingTab.groups.empty")}</p>
      )}
    </div>
  );
}

/**
 * Envoi de la campagne "nouvelle version" - reservee cote serveur a la
 * permission marketing:send (SUPER_ADMIN), voir MarketingController.
 * L'onglet reste visible pour tout le personnel (meme garde UX-only que le
 * reste de cette page) : un compte sans la permission recoit simplement une
 * erreur 403 en essayant d'envoyer.
 */
function SendSection({ groups }: { groups: { id: string; name: string }[] }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [testEmail, setTestEmail] = useState(user?.email ?? "");
  const [target, setTarget] = useState(ALL_RECIPIENTS);
  const [checked, setChecked] = useState<{ eligible: number } | null>(null);

  const groupId = target === ALL_RECIPIENTS ? undefined : target;

  const checkMutation = useMutation({
    mutationFn: () => marketingApi.sendAnnouncement({ dryRun: true, groupId }),
    onSuccess: (result) => setChecked({ eligible: result.eligible }),
    onError: () => toast.error(t("admin.marketingTab.error")),
  });

  const testMutation = useMutation({
    mutationFn: () => marketingApi.sendAnnouncement({ testEmail, groupId }),
    onSuccess: () => toast.success(t("admin.marketingTab.sendTestSuccess")),
    onError: () => toast.error(t("admin.marketingTab.error")),
  });

  const sendMutation = useMutation({
    mutationFn: () => marketingApi.sendAnnouncement({ dryRun: false, groupId }),
    onSuccess: (result) => {
      toast.success(t("admin.marketingTab.sendAllSuccess", { count: result.sent, sent: result.sent, failed: result.failed }));
      setChecked(null);
    },
    onError: () => toast.error(t("admin.marketingTab.error")),
  });

  const handleTargetChange = (value: string) => {
    setTarget(value);
    setChecked(null);
  };

  const handleSendAll = () => {
    if (!checked) return;
    // window.confirm plutot qu'une AlertDialog dediee : action rare
    // (une poignee de fois dans la vie du projet), un blocage natif du
    // navigateur suffit a eviter un clic accidentel sur toute la base.
    if (window.confirm(t("admin.marketingTab.sendAllConfirm", { count: checked.eligible }))) {
      sendMutation.mutate();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium">{t("admin.marketingTab.title")}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{t("admin.marketingTab.description")}</p>
      </div>

      <div className="space-y-1.5">
        <p className="text-sm font-medium">{t("admin.marketingTab.target.label")}</p>
        <Select value={target} onValueChange={handleTargetChange}>
          <SelectTrigger className="max-w-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_RECIPIENTS}>{t("admin.marketingTab.target.all")}</SelectItem>
            {groups.map((g) => (
              <SelectItem key={g.id} value={g.id}>
                {g.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3">
        <Button type="button" variant="outline" onClick={() => checkMutation.mutate()} disabled={checkMutation.isPending}>
          {checkMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t("admin.marketingTab.checkEligible")}
        </Button>
        {checked && (
          <span className="text-sm text-muted-foreground">
            {t("admin.marketingTab.eligibleCount", { count: checked.eligible })}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder={t("admin.marketingTab.sendTestPlaceholder")}
            className="max-w-xs"
          />
          <Button type="button" variant="outline" onClick={() => testMutation.mutate()} disabled={testMutation.isPending || !testEmail}>
            {testMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("admin.marketingTab.sendTest")}
          </Button>
        </div>
      </div>

      <div className="space-y-2 border-t pt-4">
        <Button
          type="button"
          onClick={handleSendAll}
          disabled={!checked || sendMutation.isPending}
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        >
          {sendMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          {t("admin.marketingTab.sendAll")}
        </Button>
        {!checked && <p className="text-xs text-muted-foreground">{t("admin.marketingTab.sendAllNeedsCheck")}</p>}
      </div>
    </div>
  );
}

export function MarketingTab() {
  const [managingGroup, setManagingGroup] = useState<{ id: string; name: string } | null>(null);
  const { data: groups } = useQuery({ queryKey: ["admin", "marketing", "groups"], queryFn: marketingApi.listGroups });

  return (
    <div className="max-w-2xl space-y-8">
      <SendSection groups={groups ?? []} />
      <div className="border-t pt-6">
        <RecipientsSection />
      </div>
      <div className="border-t pt-6">
        <GroupsSection onManageMembers={(id, name) => setManagingGroup({ id, name })} />
      </div>
      {managingGroup && (
        <GroupMembersDialog
          groupId={managingGroup.id}
          groupName={managingGroup.name}
          onClose={() => setManagingGroup(null)}
        />
      )}
    </div>
  );
}
