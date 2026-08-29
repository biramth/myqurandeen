import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import type { ReminderTargetType } from "@qurandeen/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { duasApi } from "@/features/duas/api";
import { quranApi } from "@/features/quran/api";
import { remindersApi } from "./api";
import { weekdayLabels } from "./weekdayLabels";

const TARGET_TYPES: ReminderTargetType[] = ["dua_category", "dua", "surah"];

export function AddReminderDialog() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [targetType, setTargetType] = React.useState<ReminderTargetType>("dua_category");
  const [categorySlug, setCategorySlug] = React.useState("");
  const [duaId, setDuaId] = React.useState("");
  const [surahNumber, setSurahNumber] = React.useState("");
  const [timeOfDay, setTimeOfDay] = React.useState("06:00");
  const [days, setDays] = React.useState<number[]>([0, 1, 2, 3, 4, 5, 6]);

  const reset = () => {
    setTargetType("dua_category");
    setCategorySlug("");
    setDuaId("");
    setSurahNumber("");
    setTimeOfDay("06:00");
    setDays([0, 1, 2, 3, 4, 5, 6]);
  };

  const { data: categories } = useQuery({
    queryKey: ["duas", "categories"],
    queryFn: duasApi.listCategories,
    enabled: open && targetType !== "surah",
  });
  const { data: categoryDetail } = useQuery({
    queryKey: ["duas", "category", categorySlug],
    queryFn: () => duasApi.getCategory(categorySlug),
    enabled: open && targetType === "dua" && Boolean(categorySlug),
  });
  const { data: surahs } = useQuery({
    queryKey: ["quran", "surahs"],
    queryFn: quranApi.listSurahs,
    enabled: open && targetType === "surah",
  });

  const selectedCategory = categories?.find((c) => c.slug === categorySlug);

  const mutation = useMutation({
    mutationFn: () =>
      remindersApi.create({
        targetType,
        targetId: targetType === "surah" ? undefined : targetType === "dua" ? duaId : selectedCategory?.id,
        surahNumber: targetType === "surah" ? Number(surahNumber) : undefined,
        timeOfDay,
        daysOfWeek: days,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
    onSuccess: () => {
      toast.success(t("reminders.created"));
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      setOpen(false);
      reset();
    },
    onError: () => toast.error(t("reminders.error")),
  });

  const toggleDay = (day: number) => {
    setDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()));
  };

  const canSubmit =
    Boolean(timeOfDay) &&
    days.length > 0 &&
    (targetType === "surah" ? Boolean(surahNumber) : targetType === "dua" ? Boolean(duaId) : Boolean(categorySlug));

  const labels = weekdayLabels(i18n.language);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" size="sm">
          <Plus className="h-4 w-4" aria-hidden="true" />
          {t("reminders.addReminder")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("reminders.addReminder")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t("reminders.targetTypeLabel")}</Label>
            <div className="flex flex-wrap gap-2">
              {TARGET_TYPES.map((type) => (
                <Button
                  key={type}
                  type="button"
                  size="sm"
                  variant={targetType === type ? "secondary" : "outline"}
                  onClick={() => {
                    setTargetType(type);
                    setCategorySlug("");
                    setDuaId("");
                    setSurahNumber("");
                  }}
                >
                  {t(`reminders.targetType.${type}`)}
                </Button>
              ))}
            </div>
          </div>

          {targetType !== "surah" && (
            <div className="space-y-1.5">
              <Label htmlFor="reminder-category">{t("reminders.categoryLabel")}</Label>
              <Select
                value={categorySlug || undefined}
                onValueChange={(value) => {
                  setCategorySlug(value);
                  setDuaId("");
                }}
              >
                <SelectTrigger id="reminder-category">
                  <SelectValue placeholder={t("reminders.categoryLabel")} />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {targetType === "dua" && categorySlug && (
            <div className="space-y-1.5">
              <Label htmlFor="reminder-dua">{t("reminders.duaLabel")}</Label>
              <Select value={duaId || undefined} onValueChange={setDuaId}>
                <SelectTrigger id="reminder-dua">
                  <SelectValue placeholder={t("reminders.duaLabel")} />
                </SelectTrigger>
                <SelectContent>
                  {categoryDetail?.duas.map((dua) => (
                    <SelectItem key={dua.id} value={dua.id}>
                      {dua.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {targetType === "surah" && (
            <div className="space-y-1.5">
              <Label htmlFor="reminder-surah">{t("reminders.surahLabel")}</Label>
              <Select value={surahNumber || undefined} onValueChange={setSurahNumber}>
                <SelectTrigger id="reminder-surah">
                  <SelectValue placeholder={t("reminders.surahLabel")} />
                </SelectTrigger>
                <SelectContent>
                  {surahs?.map((surah) => (
                    <SelectItem key={surah.id} value={String(surah.number)}>
                      {surah.number}. {surah.nameTransliterated}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="reminder-time">{t("reminders.timeLabel")}</Label>
            <Input
              id="reminder-time"
              type="time"
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value)}
              className="w-32"
            />
          </div>

          <div className="space-y-1.5">
            <Label>{t("reminders.daysLabel")}</Label>
            <div className="flex gap-1.5">
              {labels.map((label, day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  aria-pressed={days.includes(day)}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border text-sm transition-colors",
                    days.includes(day)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input text-muted-foreground hover:bg-accent",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="ghost">
              {t("common.cancel")}
            </Button>
          </DialogClose>
          <Button type="button" disabled={!canSubmit || mutation.isPending} onClick={() => mutation.mutate()}>
            {mutation.isPending ? t("reminders.saving") : t("reminders.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
