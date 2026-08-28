import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input, type InputProps } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** Champ mot de passe avec bouton afficher/masquer - aucun champ password du site n'en avait jusqu'ici. */
export const PasswordInput = React.forwardRef<HTMLInputElement, Omit<InputProps, "type">>(
  ({ className, ...props }, ref) => {
    const { t } = useTranslation();
    const [visible, setVisible] = React.useState(false);

    return (
      <div className="relative">
        <Input ref={ref} {...props} type={visible ? "text" : "password"} className={cn("pe-10", className)} />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 end-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
          aria-label={visible ? t("auth.hidePassword") : t("auth.showPassword")}
          tabIndex={-1}
        >
          {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";
