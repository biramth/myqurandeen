import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Bell, BellRing } from "lucide-react";
import type { ReminderTargetType } from "@qurandeen/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SignUpPromptPopover } from "@/components/shared/SignUpPromptPopover";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/auth-context";
import { remindersApi } from "./api";
import { weekdayLabels } from "./weekdayLabels";

interface QuickReminderButtonProps {
  targetType: ReminderTargetType;
  targetId?: string;
  surahNumber?: number;
  size?: "default" | "sm";
}

/**
 * Bouton "Me rappeler" pose directement sur une dua / categorie / sourate -
 * la cible est deja connue, donc contrairement a AddReminderDialog (formulaire
 * generique depuis l'onglet Rappels du profil) il ne reste que l'heure et
 * les jours a choisir. Reste visible sans compte (comme BookmarkButton et
 * consorts) : le clic invite alors a se connecter/creer un compte plutot que
 * d'ouvrir le formulaire.
 */
export function QuickReminderButton({ targetType, targetId, surahNumber, size = "sm" }: QuickReminderButtonProps) {
  const { t } = useTranslation();
  const { user } = useAuth();

  const trigger = (
    <Button type="button" variant="ghost" size={size}>
      <Bell className="h-4 w-4" aria-hidden="true" />
      {t("reminders.remindMe")}
    </Button>
  );

  if (!user) {
    return <SignUpPromptPopover description={t("authPrompt.reminderDescription")} trigger={trigger} />;
  }

  return <QuickReminderForm targetType={targetType} targetId={targetId} surahNumber={surahNumber} trigger={trigger} />;
}

function QuickReminderForm({
  targetType,
  targetId,
  surahNumber,
  trigger,
}: {
  targetType: ReminderTargetType;
  targetId?: string;
  surahNumber?: number;
  trigger: React.ReactNode;
}) {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [timeOfDay, setTimeOfDay] = React.useState("06:00");
  const [days, setDays] = React.useState<number[]>([0, 1, 2, 3, 4, 5, 6]);

  const mutation = useMutation({
    mutationFn: () =>
      remindersApi.create({
        targetType,
        targetId,
        surahNumber,
        timeOfDay,
        daysOfWeek: days,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
    onSuccess: () => {
      toast.success(t("reminders.created"));
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      setOpen(false);
    },
    onError: () => toast.error(t("reminders.error")),
  });

  const toggleDay = (day: number) => {
    setDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()));
  };

  const labels = weekdayLabels(i18n.language);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="start" className="w-72">
        <div className="flex items-center gap-2 text-sm font-medium">
          <BellRing className="h-4 w-4 text-primary" aria-hidden="true" />
          {t("reminders.remindMeTitle")}
        </div>

        <Input
          type="time"
          value={timeOfDay}
          onChange={(e) => setTimeOfDay(e.target.value)}
          className="mt-3 h-9 w-28"
        />

        <div className="mt-2 flex gap-1.5">
          {labels.map((label, day) => (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(day)}
              aria-pressed={days.includes(day)}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border text-xs transition-colors",
                days.includes(day)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input text-muted-foreground hover:bg-accent",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <Button
          type="button"
          size="sm"
          className="mt-3 w-full"
          disabled={mutation.isPending || days.length === 0}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? t("reminders.saving") : t("reminders.save")}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
