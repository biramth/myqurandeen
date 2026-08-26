import { Fragment } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Fil d'Ariane" className="mb-4 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
      <Link to="/" className="flex items-center hover:text-foreground" aria-label="Accueil">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <Fragment key={i}>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {item.href && !isLast ? (
              <Link to={item.href} className="truncate hover:text-foreground">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "truncate font-medium text-foreground" : "truncate"}>{item.label}</span>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
