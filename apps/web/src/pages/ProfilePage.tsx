import * as React from "react";
import { Link, Navigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Bookmark, FolderOpen, NotebookPen, Trash2, ArrowLeft, Plus, BellRing, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/features/auth/auth-context";
import { authApi } from "@/features/auth/api";
import { userDataApi } from "@/features/user-data/api";
import { RemindersTab } from "@/features/reminders/RemindersTab";
import { OfflineTab } from "@/features/offline/OfflineTab";
import { StreakCard } from "@/features/streaks/StreakCard";
import { GamificationCard } from "@/features/gamification/GamificationCard";
import { PageMeta } from "@/components/shared/PageMeta";

function EmptyState({ icon: Icon, label }: { icon: typeof Bookmark; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
      <Icon className="h-8 w-8 opacity-40" aria-hidden="true" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

function BookmarksTab() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["user-data", "bookmarks"], queryFn: userDataApi.listBookmarks });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const bookmark = data?.find((b) => b.id === id);
      if (!bookmark) return;
      await userDataApi.toggleBookmark(bookmark.targetType, bookmark.targetId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-data", "bookmarks"] });
      toast.success(t("bookmark.removed"));
    },
    onError: () => toast.error(t("common.error")),
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    );
  }
  if (!data || data.length === 0) return <EmptyState icon={Bookmark} label={t("bookmarks.empty")} />;

  return (
    <div className="space-y-2">
      {data.map((bookmark) => (
        <div
          key={bookmark.id}
          className="flex items-center justify-between gap-2 rounded-md border p-3 transition-colors hover:border-primary/30"
        >
          <div className="min-w-0">
            {bookmark.href ? (
              <Link to={bookmark.href} className="truncate text-sm font-medium hover:underline">
                {bookmark.title}
              </Link>
            ) : (
              <span className="truncate text-sm font-medium">{bookmark.title}</span>
            )}
            <Badge variant="secondary" className="ml-2 text-[10px]">
              {t(`targetTypes.${bookmark.targetType}`)}
            </Badge>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            disabled={removeMutation.isPending}
            onClick={() => removeMutation.mutate(bookmark.id)}
            aria-label={t("bookmarks.remove")}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      ))}
    </div>
  );
}

function NotesTab() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["user-data", "notes"], queryFn: userDataApi.listNotes });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userDataApi.deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-data", "notes"] });
      toast.success(t("notes.deleted"));
    },
    onError: () => toast.error(t("common.error")),
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }
  if (!data || data.length === 0) return <EmptyState icon={NotebookPen} label={t("notes.empty")} />;

  return (
    <div className="space-y-2">
      {data.map((note) => (
        <div key={note.id} className="rounded-md border p-3 transition-colors hover:border-primary/30">
          <div className="mb-2 flex items-center justify-between gap-2">
            {note.href ? (
              <Link to={note.href} className="truncate text-sm font-medium hover:underline">
                {note.title}
              </Link>
            ) : (
              <span className="truncate text-sm font-medium">{note.title}</span>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(note.id)}
              aria-label={t("notes.delete")}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">{note.content}</p>
        </div>
      ))}
    </div>
  );
}

function CollectionsTab() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [newName, setNewName] = React.useState("");

  const { data: collections, isLoading } = useQuery({
    queryKey: ["user-data", "collections"],
    queryFn: userDataApi.listCollections,
    enabled: !selectedId,
  });

  const { data: detail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ["user-data", "collection", selectedId],
    queryFn: () => userDataApi.getCollection(selectedId!),
    enabled: Boolean(selectedId),
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => userDataApi.createCollection(name),
    onSuccess: () => {
      setNewName("");
      queryClient.invalidateQueries({ queryKey: ["user-data", "collections"] });
      toast.success(t("collections.created"));
    },
    onError: () => toast.error(t("common.error")),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userDataApi.deleteCollection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-data", "collections"] });
      toast.success(t("collections.deleted"));
    },
    onError: () => toast.error(t("common.error")),
  });

  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) => userDataApi.removeCollectionItem(selectedId!, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-data", "collection", selectedId] });
      toast.success(t("collections.itemRemoved"));
    },
    onError: () => toast.error(t("common.error")),
  });

  if (selectedId) {
    return (
      <div>
        <Button type="button" variant="ghost" size="sm" className="mb-3" onClick={() => setSelectedId(null)}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t("collections.back")}
        </Button>

        {isLoadingDetail && (
          <div className="space-y-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        )}

        {detail && (
          <>
            <h3 className="mb-1 text-base font-semibold">{detail.name}</h3>
            {detail.description && <p className="mb-3 text-sm text-muted-foreground">{detail.description}</p>}

            {detail.items.length === 0 ? (
              <EmptyState icon={FolderOpen} label={t("collections.emptyItems")} />
            ) : (
              <div className="space-y-2">
                {detail.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 rounded-md border p-3 transition-colors hover:border-primary/30"
                  >
                    <div className="min-w-0">
                      {item.href ? (
                        <Link to={item.href} className="truncate text-sm font-medium hover:underline">
                          {item.title}
                        </Link>
                      ) : (
                        <span className="truncate text-sm font-medium">{item.title}</span>
                      )}
                      <Badge variant="secondary" className="ml-2 text-[10px]">
                        {t(`targetTypes.${item.targetType}`)}
                      </Badge>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      disabled={removeItemMutation.isPending}
                      onClick={() => removeItemMutation.mutate(item.id)}
                      aria-label={t("collections.removeItem")}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder={t("collections.namePlaceholder")}
          onKeyDown={(e) => {
            if (e.key === "Enter" && newName.trim() && !createMutation.isPending) {
              createMutation.mutate(newName.trim());
            }
          }}
        />
        <Button
          type="button"
          disabled={!newName.trim() || createMutation.isPending}
          onClick={() => createMutation.mutate(newName.trim())}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {t("collections.create")}
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      )}
      {!isLoading && (!collections || collections.length === 0) && (
        <EmptyState icon={FolderOpen} label={t("collections.empty")} />
      )}

      <div className="space-y-2">
        {collections?.map((collection) => (
          <div
            key={collection.id}
            className="flex items-center justify-between gap-2 rounded-md border p-3 transition-colors hover:border-primary/30"
          >
            <button
              type="button"
              onClick={() => setSelectedId(collection.id)}
              className="min-w-0 flex-1 truncate text-left text-sm font-medium hover:underline"
            >
              {collection.name}
              <span className="ml-2 text-xs text-muted-foreground">
                {t("collections.itemCount", { count: collection.itemCount })}
              </span>
            </button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(collection.id)}
              aria-label={t("collections.delete")}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProfilePage() {
  const { user, isLoading, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [resendState, setResendState] = React.useState<"idle" | "sent" | "error">("idle");

  const handleResendVerification = async () => {
    if (!user) return;
    setResendState("idle");
    try {
      await authApi.resendVerification(user.email);
      setResendState("sent");
    } catch {
      setResendState("error");
    }
  };

  if (isLoading) {
    return <div className="mx-auto max-w-2xl px-4 py-16 text-center text-muted-foreground">{t("profile.loading")}</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <PageMeta title={user.displayName ?? t("nav.profile")} noindex />
      {!user.emailVerified && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 dark:border-amber-500/30 dark:bg-amber-950/30">
          <p className="text-sm text-amber-800 dark:text-amber-200">{t("profile.emailNotVerified")}</p>
          <Button type="button" variant="outline" size="sm" onClick={handleResendVerification}>
            {t("profile.resendVerification")}
          </Button>
          {resendState === "sent" && <p className="text-xs text-amber-700 dark:text-amber-300">{t("profile.resendSent")}</p>}
          {resendState === "error" && <p className="text-xs text-destructive">{t("common.error")}</p>}
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle>{user.displayName}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("profile.memberSince", { date: new Date(user.memberSince).toLocaleDateString(i18n.language) })}
          </p>
          <Button variant="outline" onClick={() => logout()}>
            {t("profile.logout")}
          </Button>
        </CardContent>
      </Card>

      <StreakCard />

      <GamificationCard />

      <Tabs defaultValue="bookmarks" className="mt-8">
        <TabsList className="mb-4">
          <TabsTrigger value="bookmarks">
            <Bookmark className="h-4 w-4" aria-hidden="true" />
            {t("profile.tabs.bookmarks")}
          </TabsTrigger>
          <TabsTrigger value="notes">
            <NotebookPen className="h-4 w-4" aria-hidden="true" />
            {t("profile.tabs.notes")}
          </TabsTrigger>
          <TabsTrigger value="collections">
            <FolderOpen className="h-4 w-4" aria-hidden="true" />
            {t("profile.tabs.collections")}
          </TabsTrigger>
          <TabsTrigger value="reminders">
            <BellRing className="h-4 w-4" aria-hidden="true" />
            {t("profile.tabs.reminders")}
          </TabsTrigger>
          <TabsTrigger value="offline">
            <Download className="h-4 w-4" aria-hidden="true" />
            {t("profile.tabs.offline")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="bookmarks">
          <BookmarksTab />
        </TabsContent>
        <TabsContent value="notes">
          <NotesTab />
        </TabsContent>
        <TabsContent value="collections">
          <CollectionsTab />
        </TabsContent>
        <TabsContent value="reminders">
          <RemindersTab />
        </TabsContent>
        <TabsContent value="offline">
          <OfflineTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
