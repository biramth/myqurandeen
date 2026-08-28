import * as React from "react";
import { FolderPlus, Check } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/features/auth/auth-context";
import { userDataApi } from "@/features/user-data/api";
import type { TargetType } from "@/features/user-data/types";
import { cn } from "@/lib/utils";

interface AddToCollectionButtonProps {
  targetType: TargetType;
  targetId: string;
}

/** Menu (Popover accessible : focus trap, Echap, clic exterieur geres par Radix) permettant d'ajouter le contenu courant a une collection existante ou nouvelle. */
export function AddToCollectionButton({ targetType, targetId }: AddToCollectionButtonProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [addedTo, setAddedTo] = React.useState<Set<string>>(new Set());

  const { data: collections } = useQuery({
    queryKey: ["user-data", "collections"],
    queryFn: userDataApi.listCollections,
    enabled: Boolean(user) && open,
  });

  const addMutation = useMutation({
    mutationFn: (collectionId: string) => userDataApi.addCollectionItem(collectionId, targetType, targetId),
    onSuccess: (_data, collectionId) => {
      setAddedTo((prev) => new Set(prev).add(collectionId));
      queryClient.invalidateQueries({ queryKey: ["user-data", "collections"] });
      toast.success(t("collections.itemAdded"));
    },
    onError: () => toast.error(t("common.error")),
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => userDataApi.createCollection(name),
    onSuccess: async (collection) => {
      setNewName("");
      await queryClient.invalidateQueries({ queryKey: ["user-data", "collections"] });
      toast.success(t("collections.created"));
      addMutation.mutate(collection.id);
    },
    onError: () => toast.error(t("common.error")),
  });

  if (!user) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline">
          <FolderPlus className="h-4 w-4" aria-hidden="true" />
          {t("collections.addToCollection")}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start">
        <div className="max-h-48 space-y-0.5 overflow-y-auto">
          {collections?.length === 0 ? (
            <p className="px-2 py-1.5 text-xs text-muted-foreground">{t("collections.empty")}</p>
          ) : (
            collections?.map((collection) => {
              const isAdded = addedTo.has(collection.id);
              return (
                <button
                  key={collection.id}
                  type="button"
                  onClick={() => (isAdded ? toast.info(t("collections.itemAlready")) : addMutation.mutate(collection.id))}
                  className={cn(
                    "flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm outline-none hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground",
                    isAdded && "text-muted-foreground",
                  )}
                >
                  {collection.name}
                  {isAdded ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : null}
                </button>
              );
            })
          )}
        </div>
        <div className="mt-2 flex gap-1 border-t pt-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={t("collections.namePlaceholder")}
            className="h-8 text-xs"
            onKeyDown={(e) => {
              if (e.key === "Enter" && newName.trim() && !createMutation.isPending) {
                createMutation.mutate(newName.trim());
              }
            }}
          />
          <Button
            type="button"
            size="sm"
            className="h-8"
            disabled={!newName.trim() || createMutation.isPending}
            onClick={() => createMutation.mutate(newName.trim())}
          >
            {t("collections.create")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
